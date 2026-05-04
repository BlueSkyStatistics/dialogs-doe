/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */




class linearRegressionCurvTestDoE extends baseModal {
    static dialogId = 'linearRegressionCurvTestDoE'
    static t = baseModal.makeT(linearRegressionCurvTestDoE.dialogId)

    constructor() {
        var config = {
            id: linearRegressionCurvTestDoE.dialogId,
            label: linearRegressionCurvTestDoE.t('title'),
            modalType: "two",
            RCode: `

require(equatiomatic)
require(textutils)
require(effects)
require(DoE.base)
 require(DoE.wrapper)
require(FrF2)
require(car)
require(dplyr)
require(ggplot2)
require(ggthemes)
require(qqplotr)
require(nortest)
require(rsm)
#require(BsMD)

					# 1. Identify CENTER points
					bsky_identify_center_points <- function(design, tol = 1e-8) {
					  di <- design.info(design)
					  
					  is_numeric_factor <- sapply(names(di$factor.names), function(fname) {
						factor_levels <- di$factor.names[[fname]]
						suppressWarnings({
						  num_vals <- as.numeric(as.character(factor_levels))
						})
						return(!any(is.na(num_vals)))
					  })
					  
					  numeric_factors <- names(di$factor.names)[is_numeric_factor]
					  
					  if (length(numeric_factors) == 0) {
						return(integer(0))
					  }
					  
					  design_numeric <- design
					  for (fname in numeric_factors) {
						if (is.factor(design[[fname]])) {
						  design_numeric[[fname]] <- as.numeric(as.character(design[[fname]]))
						} else {
						  design_numeric[[fname]] <- as.numeric(design[[fname]])
						}
					  }
					  
					  midpoints <- sapply(numeric_factors, function(fname) {
						vals <- design_numeric[[fname]]
						mean(range(vals, na.rm = TRUE))
					  })
					  
					  is_center <- apply(design_numeric[, numeric_factors, drop = FALSE], 1, function(row) {
						all(abs(row - midpoints) < tol)
					  })
					  
					  which(is_center)
					}

					# 2. Identify AXIAL/STAR points
					bsky_identify_axial_points <- function(design, tol = 1e-8, repair = TRUE) {
							  # repair = TRUE: update/create nstar, ncenter, ncube in design.info if missing or wrong
							  
							  di <- design.info(design)
							  
							  # Identify numeric factors from factor.names levels
							  # Do NOT rely on di$nstar - it may be missing if design was modified
							  # by an external function or add.star = FALSE was used
							  is_numeric_factor <- sapply(names(di$factor.names), function(fname) {
								factor_levels <- di$factor.names[[fname]]
								suppressWarnings({
								  num_vals <- as.numeric(as.character(factor_levels))
								})
								return(!any(is.na(num_vals)))
							  })
							  
							  numeric_factors <- names(di$factor.names)[is_numeric_factor]
							  
							  if (length(numeric_factors) == 0) {
								message("No numeric factors found - cannot identify axial points")
								return(integer(0))
							  }
							  
							  # Convert factor columns to numeric for numeric factors
							  # DoE.wrapper stores numeric factors as R factors
							  design_numeric <- design
							  for (fname in numeric_factors) {
								if (is.factor(design[[fname]])) {
								  design_numeric[[fname]] <- as.numeric(as.character(design[[fname]]))
								} else {
								  design_numeric[[fname]] <- as.numeric(design[[fname]])
								}
							  }
							  
							  # Calculate midpoint for each numeric factor from the data
							  midpoints <- sapply(numeric_factors, function(fname) {
								vals <- design_numeric[[fname]]
								mean(range(vals, na.rm = TRUE))
							  })
							  
							  # Calculate the factorial half-range for each numeric factor
							  # Axial points are BEYOND this range
							  factor_ranges <- sapply(numeric_factors, function(fname) {
								vals <- design_numeric[[fname]]
								half_range <- (max(vals, na.rm = TRUE) - min(vals, na.rm = TRUE)) / 2
								return(half_range)
							  })
							  
							  # -------------------------------------------------------
							  # DETECT AXIAL POINTS (purely data-based)
							  # A point is axial if:
							  # 1. Exactly (n_numeric - 1) factors are at midpoint
							  # 2. Exactly 1 factor is away from midpoint by more than tolerance
							  # 3. That 1 factor's value is BEYOND the factorial range
							  #    (distinguishes axial from factorial corner points)
							  # -------------------------------------------------------
							  is_axial <- apply(design_numeric[, numeric_factors, drop = FALSE], 1, function(row) {
								at_center <- abs(row - midpoints) < tol
								n_at_center <- sum(at_center)
								n_factors <- length(numeric_factors)
								
								if (n_at_center == (n_factors - 1)) {
								  non_center_idx <- which(!at_center)
								  non_center_val <- abs(row[non_center_idx] - midpoints[non_center_idx])
								  
								  if (non_center_val > tol) {
									# Must be beyond the factorial range to qualify as axial
									if (non_center_val > factor_ranges[non_center_idx] * (1-tol)) {
									  return(TRUE)
									}
								  }
								}
								return(FALSE)
							  })
							  
							  axial_rows <- which(is_axial)
							  
							  # -------------------------------------------------------
							  # DETECT CENTER POINTS (purely data-based)
							  # A point is a center if ALL numeric factors are at midpoint
							  # -------------------------------------------------------
							  is_center <- apply(design_numeric[, numeric_factors, drop = FALSE], 1, function(row) {
								all(abs(row - midpoints) < tol)
							  })
							  
							  center_rows <- which(is_center)
							  
							  # -------------------------------------------------------
							  # DETECT FACTORIAL (CUBE) POINTS
							  # Everything that is neither axial nor center
							  # -------------------------------------------------------
							  factorial_rows <- setdiff(1:nrow(design), c(axial_rows, center_rows))
							  
							  # -------------------------------------------------------
							  # REPAIR design.info attributes if repair = TRUE
							  # Updates or creates: nstar, ncenter, ncube, nruns
							  # -------------------------------------------------------
							  if (repair) {
								needs_repair <- FALSE
								repair_log <- character(0)
								
								# Check and fix nstar
								actual_nstar <- length(axial_rows)
								if (is.null(di$nstar) || di$nstar != actual_nstar) {
								  repair_log <- c(repair_log, paste("nstar:", 
												  if(is.null(di$nstar)) "NULL" else di$nstar, 
												  "->", actual_nstar))
								  di$nstar <- actual_nstar
								  needs_repair <- TRUE
								}
								
								# Check and fix ncenter
								actual_ncenter <- length(center_rows)
								if (is.null(di$ncenter) || di$ncenter != actual_ncenter) {
								  repair_log <- c(repair_log, paste("ncenter:", 
												  if(is.null(di$ncenter)) "NULL" else di$ncenter, 
												  "->", actual_ncenter))
								  di$ncenter <- actual_ncenter
								  needs_repair <- TRUE
								}
								
								# Check and fix ncube
								actual_ncube <- length(factorial_rows)
								if (is.null(di$ncube) || di$ncube != actual_ncube) {
								  repair_log <- c(repair_log, paste("ncube:", 
												  if(is.null(di$ncube)) "NULL" else di$ncube, 
												  "->", actual_ncube))
								  di$ncube <- actual_ncube
								  needs_repair <- TRUE
								}
								
								# Check and fix nruns
								actual_nruns <- nrow(design)
								if (is.null(di$nruns) || di$nruns != actual_nruns) {
								  repair_log <- c(repair_log, paste("nruns:", 
												  if(is.null(di$nruns)) "NULL" else di$nruns, 
												  "->", actual_nruns))
								  di$nruns <- actual_nruns
								  needs_repair <- TRUE
								}
								
								# Apply repairs and report
								if (needs_repair) {
								  design.info(design) <- di
								  #message("Design attributes repaired:")
								  for (log_entry in repair_log) {
									#message("  ", log_entry)
								  }
								}
							  }
							  
							  if (length(axial_rows) == 0) {
								#message("No axial points found in design")
							  }
							  
							  # Return axial rows AND the repaired design invisibly
							  attr(axial_rows, "design")   <- design
							  attr(axial_rows, "center_rows")    <- center_rows
							  attr(axial_rows, "factorial_rows") <- factorial_rows
							  
							  return(axial_rows)
					}


					# 3. Identify FACTORIAL/CUBE points
					bsky_identify_factorial_points <- function(design, tol = 1e-8) {
					  # Factorial points are those that are NOT center and NOT axial
					  all_rows <- 1:nrow(design)
					  center_rows <- bsky_identify_center_points(design, tol = tol)
					  axial_rows <- bsky_identify_axial_points(design, tol = tol)
					  
					  factorial_rows <- setdiff(all_rows, c(center_rows, axial_rows))
					  return(factorial_rows)
					}

					# 4. Summary function for axial and center points detection
					bsky_summarize_design_point_rows <- function(design, tol = 1e-8) {
					  factorial <- bsky_identify_factorial_points(design, tol = tol)
					  centers <- bsky_identify_center_points(design, tol = tol)
					  axial <- bsky_identify_axial_points(design, tol = tol)
					  
					  cat("Design Point Summary:\n")
					  #cat("---------------------")
					  
					  cat("Factorial (Cube) points:", length(factorial), "rows (a maximum of 20 row numbers are shown) -", 
						  if(length(factorial) > 0) paste(head(factorial, 20), collapse=", ") else "none", "\n")
							  
					  cat("Center points:", length(centers), "rows -", 
						  if(length(centers) > 0) paste(centers, collapse=", ") else "none", "\n")
						 
					  cat("Axial points:", length(axial), "rows -", 
						  if(length(axial) > 0) paste(axial, collapse=", ") else "none", "\n")
						 
					  cat("Total:", nrow(design), "rows\n")
					  
					  design = attr(axial, "design")
						
					  design
					  #invisible(list(factorial = factorial, centers = centers, axial = axial))
					}
					
					# 5. Curvature tests with center points (minimum two center points needed and no axial points
					# only first order linear equation with main effects or main effects eith optionaly interaction terms 
					# formula must not have any weights, quadratic terms, etc
					
					bsky_lm_with_curvature_mixed_facor <- function(formula, design, tol = 1e-8) {
						  # -------------------------------
						  # 1. Identify predictors
						  # -------------------------------
						  response_name <- all.vars(formula)[1]
						  term_obj      <- terms(formula)
						  base_vars     <- all.vars(delete.response(term_obj))

						  if (length(base_vars) == 0){
							#stop("Model must include at least one predictor.")
							cat("Model must include at least one predictor. Skipping curvature test ...\n")
							invisible(return(NULL))
						  }

						  # -------------------------------
						  # 2. Detect axial points
						  # -------------------------------
						  axial_idx <- bsky_identify_axial_points(design, tol = tol)

						  # -------------------------------
						  # 3. Detect center points
						  # -------------------------------
						  center_idx <- bsky_identify_center_points(design, tol = tol)

						  if (length(center_idx) == 0){
							cat("No center points detected. Skipping curvature test ...\n")
							invisible(return(NULL))
						  }
						
						 if(length(axial_idx) > 0){
							 cat("Curvature Test Note:\n", "Axial/star points detected. These have been automatically excluded from the curvature test.\n")
						 }

						  data_center <- design[center_idx,  , drop = FALSE]
						  data_corner <- design[-c(center_idx, axial_idx), , drop = FALSE]

						  n_center    <- nrow(data_center)
						  n_factorial <- nrow(data_corner)

						  if (n_center < 2){
							#stop("Need at least 2 center points for curvature test.")
							cat("Need at least 2 center points for curvature test. Skipping curvature test ...\n")
							invisible(return(NULL))
						  }

						  y_vec <- design[[response_name]]

						  # -------------------------------
						  # 4. Fit full model on All data
						  # -------------------------------
						  fit_full <- lm(formula, data = design)
						  aov_full <- anova(fit_full)

						  # -------------------------------
						  # 5. Compute Curvature SS (POOLED)
						  # -------------------------------
						  y_center_mean    <- mean(y_vec[center_idx])
						  y_factorial_mean <- mean(y_vec[-c(center_idx, axial_idx)])

						  SS_curv <- (n_factorial * n_center) /
									  (n_factorial + n_center) *
									  (y_center_mean - y_factorial_mean)^2

						  df_curv <- 1
						  MS_curv <- SS_curv

						  # -------------------------------
						  # 6. Pure error from center replicates (for display/LOF only)
						  # -------------------------------
						  SS_pe <- sum((y_vec[center_idx] - y_center_mean)^2)
						  df_pe <- n_center - 1
						  MS_pe <- SS_pe / df_pe

						  # -------------------------------
						  # 7. Adjusted Error SS and df
						  #    Remove curvature contribution from lm() residual
						  #    SS_error = SS_resid_full - SS_curv  (e.g. 6.198 - 2.373 = 3.825)
						  #    df_error = df_resid_full - df_curv  (e.g. 18 - 1 = 17)
						  #
						  #    MS_error = SS_error / df_error      (e.g. 3.825/17 = 0.225)
						  #    This is the TRUE F-test denominator matching Minitab
						  # -------------------------------
						  SS_resid_full <- aov_full["Residuals", "Sum Sq"]
						  df_resid_full <- aov_full["Residuals", "Df"]

						  SS_error_display <- SS_resid_full - SS_curv   # 3.825
						  df_error_display <- df_resid_full - df_curv   # 17
						  MS_error_display <- SS_error_display / df_error_display  # 0.225 ← TRUE denominator

						  # -------------------------------
						  # 8. Lack-of-Fit (for display)
						  #    SS_lof = SS_error_display - SS_pe
						  #    df_lof = df_error_display - df_pe
						  # -------------------------------
						  SS_lof <- SS_error_display - SS_pe
						  df_lof <- df_error_display - df_pe
						  MS_lof <- SS_lof / df_lof

						  # -------------------------------
						  # 9. Recompute F-tests for main effects
						  #    denominator = MS_error_display (matches Minitab exactly)
						  # -------------------------------
						  aov_no_resid <- aov_full[rownames(aov_full) != "Residuals", ]

						  aov_no_resid$"F value" <-
							aov_no_resid$"Mean Sq" / MS_error_display      # ← 0.225

						  aov_no_resid$"Pr(>F)" <-
							pf(aov_no_resid$"F value",
							   aov_no_resid$Df,
							   df_error_display,                            # ← 17
							   lower.tail = FALSE)

						  # -------------------------------
						  # 10. Curvature row
						  # -------------------------------
						  curvature_row <- data.frame(
							Df        = df_curv,
							"Sum Sq"  = SS_curv,
							"Mean Sq" = MS_curv,
							"F value" = MS_curv / MS_error_display,         # ← 0.225
							"Pr(>F)"  = pf(MS_curv / MS_error_display,
											1,
											df_error_display,               # ← 17
											lower.tail = FALSE),
							check.names = FALSE
						  )
						  rownames(curvature_row) <- "Curvature"

						  # -------------------------------
						  # 11. Error row (matches Minitab display exactly)
						  # -------------------------------
						  error_row <- data.frame(
							Df        = df_error_display,      # 17
							"Sum Sq"  = SS_error_display,      # 3.825
							"Mean Sq" = MS_error_display,      # 0.225
							"F value" = NA,
							"Pr(>F)"  = NA,
							check.names = FALSE
						  )
						  rownames(error_row) <- "Error"

						  # -------------------------------
						  # 12. Total SS
						  # -------------------------------
						  SS_total <- sum((y_vec - mean(y_vec))^2)

						  total_row <- data.frame(
							Df        = nrow(design) - 1,
							"Sum Sq"  = SS_total,
							"Mean Sq" = NA,
							"F value" = NA,
							"Pr(>F)"  = NA,
							check.names = FALSE
						  )
						  rownames(total_row) <- "Total"

						  # -------------------------------
						  # 13. Combine final table
						  # -------------------------------
						  final_table <- rbind(
							aov_no_resid,
							curvature_row,
							error_row,
							total_row
						  )

						  return(final_table)
					}


				#Model Residual Plots 

				bsky_plot_residuals <- function(model, residual_type = NULL, grouping_var_label = c(""),  flipaxisPPplot = TRUE, deGroupPlots = FALSE) {	
							if (grouping_var_label != "") grouping_var_label = paste0("(", grouping_var_label, ")")
							 # --- Model class flags ---
							  is_loess <- inherits(model, "loess")
							  is_rlm   <- inherits(model, "rlm")   # MASS::rlm — before lm check, as rlm also inherits lm
							  is_gam   <- inherits(model, "gam")   # mgcv::gam — before glm check, as gam also inherits glm
							  is_glm   <- inherits(model, "glm") && !is_gam
							  # lm, quadratic (lm+poly/I^2), cubic (lm+poly/I^3) all fall into the else branch naturally

							  # --- Residual type defaults ---
							  if (is.null(residual_type)) {
								if (is_loess || is_rlm) {
								  residual_type <- "none"           # these don't accept a type argument
								} else if (is_glm) {
								  residual_type <- "pearson"
								} else if (is_gam) {
								  family_name <- family(model)$family
								  residual_type <- if (family_name == "gaussian") "response" else "pearson"
								} else {
								  residual_type <- "response"       # lm, quadratic, cubic
								}
							  }

							  # --- Extract components ---
							  fitted_vals = NULL
							  fitted_vals <- fitted(model)

							 resids = NULL
							  resids <- if (is_loess || is_rlm) {
								residuals(model)                    # no type argument — avoids errors
							  } else {
								residuals(model, type = residual_type)
							  }

							  obs_order= NULL
							  obs_order <- seq_along(resids)
							  
							  df_resid = NULL
							  df_resid  <- data.frame(fitted = fitted_vals, resid = resids, order = obs_order)

							  # --- Safe title extraction ---
							  response_label <- tryCatch({
								f <- if (is_loess) model$call$formula else formula(model)
								deparse(as.formula(f)[[2]])
							  }, error = function(e) "Response")

							  resid_label <- switch(residual_type,
								response = "Residual",
								pearson  = "Pearson Residual",
								deviance = "Deviance Residual",
								working  = "Working Residual",
								none     = "Residual",             # loess / rlm
								"Residual"
							  )

							# --- Build the 4 plots ---
			 
							########################################
							## [P-P Plot]
							########################################
							p_qq = NULL 	
							bsky_AndersonStatList = list()
							
							p_qq = ggplot(df_resid, aes(sample = resid))+
								qqplotr::stat_pp_point(distribution = "norm", detrend = FALSE) +
								qqplotr::stat_pp_line(detrend = FALSE) +      
								#qqplotr::stat_pp_band(distribution="norm", detrend = FALSE) +     
								qqplotr::stat_pp_band(
								  distribution = "norm",
								  detrend      = FALSE,
								  bandType     = "ell"    # analytic ellipse — no bootstrap, no progress bar
								)+
								labs(sample="Values" , title= paste("P-P Plot for", "Residual for", response_label, grouping_var_label)) + 
								xlab("Probability Points") +
								ylab("Cumulative Probability") + 
								 {{selected.BSkyThemes | safe}} 	+
								theme(plot.title = element_text(size = 12, face = "bold"))
							
							if(flipaxisPPplot){
								p_qq =p_qq + coord_flip()
							}
									

						  # Residuals vs Fits
						  p_fits <- ggplot(df_resid, aes(x = fitted, y = resid)) +
							geom_point(colour = "steelblue", size = 1.8) +
							geom_hline(yintercept = 0, colour = "grey50", linetype = "dashed") +
							labs(title = paste("Versus Fits for", response_label, grouping_var_label),
								 x = "Fitted Value", y = "Residual") +
							# theme_bw(base_size = 10) +
							 {{selected.BSkyThemes | safe}}  +
							theme(plot.title = element_text(size = 12, face = "bold"))

						  # Histogram of residuals
						  p_hist <- ggplot(df_resid, aes(x = resid)) +
							geom_histogram(fill = "steelblue", colour = "white",
										   bins = max(10, round(sqrt(nrow(df_resid))))) +
							labs(title = paste("Histogram for", response_label, grouping_var_label),
								 x = "Residual", y = "Frequency") +
							# theme_bw(base_size = 10) +
							 {{selected.BSkyThemes | safe}}  +
							 theme(plot.title = element_text(size = 12, face = "bold"))

						  # Residuals vs Order
						  p_order <- ggplot(df_resid, aes(x = order, y = resid)) +
							geom_line(colour = "steelblue") +
							geom_point(colour = "steelblue", size = 1.5) +
							geom_hline(yintercept = 0, colour = "grey50", linetype = "dashed") +
							labs(title = paste("Versus Order for",response_label, grouping_var_label),
								 x = "Observation Order", y = "Residual") +
							# theme_bw(base_size = 10) +
							 {{selected.BSkyThemes | safe}}  + 
							theme(plot.title = element_text(size = 12, face = "bold"))

						  # --- Combined or separated ---
						  if (!deGroupPlots) {
								gridExtra::grid.arrange(
									  gridExtra::arrangeGrob(p_qq, p_fits, ncol = 2),
									  gridExtra::arrangeGrob(p_hist, p_order, ncol = 2),
									  ncol = 1,
									  top  = grid::textGrob(
										paste("Residual Plots for", response_label, grouping_var_label),
										gp = grid::gpar(fontsize = 13, fontface = "bold")
									  )
								)

								# Overlay quadrant dividing lines
								#grid::grid.lines(x = c(0.5, 0.5), y = c(0, 1),
								#				 gp = grid::gpar(col = "grey70", lwd = 1.2))
								#grid::grid.lines(x = c(0, 1),     y = c(0.5, 0.5),
								#				 gp = grid::gpar(col = "grey70", lwd = 1.2))
						  } else {
								print(p_qq)
								print(p_fits)
								print(p_hist)
								print(p_order)
						  }
						  
						   invisible(return(resids))
				}
				
				bsky_normality_test <- function(dataVar,  dataVarName = c(""),  footerText = c(""), Shapiro = FALSE, Anderson = FALSE) {
					
					#Show Shapiro Normality Test
					if(Shapiro){
						if(footerText == ""){
							BSkyFormat(stats::shapiro.test(dataVar),outputTableIndex = c(tableone=1),outputColumnIndex = c(tableone=c(1,2)),outputColumnRenames = c(tableone=c(paste("Normality test for", dataVarName), paste("Normality test for", dataVarName))))
						} else {
							BSkyFormat(stats::shapiro.test(dataVar),outputTableIndex = c(tableone=1),outputColumnIndex = c(tableone=c(1,2)),outputColumnRenames = c(tableone=c(paste("Normality test for", dataVarName), paste("Normality test for", dataVarName))), perTableFooter = footerText)
						}
					}
					
					#Show Anderson-Darling Normality Test
					if(Anderson){
						if(length(dataVar) > 7)
						{
							bsky_AndersonStatList = data.frame(
								n = sum(!is.na(dataVar)),
								mean = mean(dataVar, na.rm = TRUE), 
								sd = sd(dataVar, na.rm = TRUE),
								# Run the selected normality test
								ad_stat = tryCatch(nortest::ad.test(dataVar)$statistic,
								error = function(e) { message("AD test error: ", e$message); NA }),
								p.value = tryCatch(nortest::ad.test(dataVar)$p.value,
								error = function(e) { message("AD p-value error: ", e$message); NA }),
								row.names = NULL
							)  
							if(footerText == ""){
								BSkyFormat(bsky_AndersonStatList, outputTableRenames = paste("Anderson-Darling normality test for", dataVarName))
							} else {
								BSkyFormat(bsky_AndersonStatList, outputTableRenames = paste("Anderson-Darling normality test for", dataVarName), perTableFooter = footerText)
							}
						}else{
							BSkyFormat(paste(dataVarName,": sample size must be greater than 7 - skipping Anderson-Darling normality test"))
						}
					}
				}
	
			   ###############################################
               # Main flow starts here
               ###############################################	
			   
			   bsky_design_type_label = "Factorial (so specific design type detected)"
			   
			   if(c("design") %in% class({{dataset.name}})) {
					# -------------------------------------------------------
					# Reusable design type label - parse compound type string
					# Call once at top of main flow, reuse in all notes.
					# -------------------------------------------------------
					bsky_design_type_label <- if (c("design") %in% class({{dataset.name}})) {

						di_label <- design.info({{dataset.name}})
						dtype    <- tolower(di_label$type)

						# --- Base design type ---
						bsky_base <- if      (grepl("full factorial", dtype, fixed = TRUE)) "full factorial"
									 else if (grepl("frf2",           dtype, fixed = TRUE)) "fractional factorial (FrF2)"
									 else if (grepl("pb",             dtype, fixed = TRUE)) "Plackett-Burman"
									 else if (grepl("oa",             dtype, fixed = TRUE)) "orthogonal array"
									 else if (grepl("lhs",            dtype, fixed = TRUE)) "Latin hypercube"
									 else if (grepl("ccd",            dtype, fixed = TRUE)) "CCD"
									 else if (grepl("bbd",            dtype, fixed = TRUE)) "Box-Behnken"
									 else                                                    "factorial"

						# --- Augmentations (blocked, center points, ccd, categorical) ---
						bsky_mods <- character(0)
						if (grepl("blocked",       dtype, fixed = TRUE)) 
							bsky_mods <- c(bsky_mods, paste0("blocked (", di_label$nblocks, " blocks)"))
						if (grepl("center",        dtype, fixed = TRUE) || 
							(!is.null(di_label$ncenter) && di_label$ncenter > 0))
							bsky_mods <- c(bsky_mods, paste0(di_label$ncenter, " center points"))
						if (grepl("ccd",           dtype, fixed = TRUE) || 
							(!is.null(di_label$nstar)   && di_label$nstar   > 0))
							bsky_mods <- c(bsky_mods, paste0(di_label$nstar, " axial points"))
						if (grepl("categorical",   dtype, fixed = TRUE) || 
							(!is.null(di_label$n_categorical_factors) && di_label$n_categorical_factors > 0))
							bsky_mods <- c(bsky_mods, 
										   paste0(di_label$n_categorical_factors, " categorical factor(s)"))

						# --- Compose final label ---
						if (length(bsky_mods) > 0) {
							paste0(bsky_base, " [", paste(bsky_mods, collapse = ", "), "]")
						} else {
							bsky_base
						}

					} else {
						"factorial"
					}
			   }
			   
			   cat("Design type detected, if any: ", bsky_design_type_label, "\n")

				{{if(options.selected.blockID == "")}}
					bsky_design_{{dataset.name}}_factorial_rows = {{dataset.name}}
					#Creating the model
					{{if (options.selected.curv_test_degree =="1")}} 
							{{selected.modelname | safe}}_{{dataset.name}} = lm({{selected.dependent | safe}}~{{selected.independent | safe}}, na.action=na.exclude, data={{dataset.name}})
					{{#else}}
							{{selected.modelname | safe}}_{{dataset.name}} = lm({{selected.dependent | safe}}~({{selected.independent | safe}})^{{selected.curv_test_degree | safe}},  na.action=na.exclude, data={{dataset.name}})
					{{/if}}
				{{#else}}
					bsky_temp_df = {{dataset.name}}
					
					if(!is.factor(bsky_temp_df\${{selected.blockID | safe}})) bsky_temp_df\${{selected.blockID | safe}} = as.factor(bsky_temp_df\${{selected.blockID | safe}})
					bsky_design_{{dataset.name}}_factorial_rows = bsky_temp_df
				
					{{if (options.selected.curv_test_degree =="1")}} 
							{{selected.modelname | safe}}_{{dataset.name}} = lm({{selected.dependent | safe}}~{{selected.independent | safe}} + {{selected.blockID | safe}} , na.action=na.exclude, data=bsky_temp_df)
					{{#else}}
							{{selected.modelname | safe}}_{{dataset.name}} = lm({{selected.dependent | safe}}~({{selected.independent | safe}} + {{selected.blockID | safe}})^{{selected.curv_test_degree | safe}},  na.action=na.exclude, data=bsky_temp_df)
					{{/if}}
				{{/if}}
						
				bsky_DesignHasCenterpoints = FALSE
				if(c("design") %in% class({{dataset.name}}))
				{
					{{if(options.selected.axialCenterPointRowsChk == "TRUE")}}
							   #bsky_summarize_design_point_rows will return the design after any star/center/cube row count repairs in the design info section
								{{dataset.name}}  = bsky_summarize_design_point_rows({{dataset.name}}, tol = 1e-8)	
					{{/if}}
					
					# -------------------------------
					# Detect center points
					# -------------------------------
					bsky_center_points_rowID = bsky_identify_center_points({{dataset.name}}, tol = 1e-8)
					
					if(length(bsky_center_points_rowID) <2) {
						cat("Number of center points found: ", length(bsky_center_points_rowID), " - Minimum 2 cente points needed to perform curvature test\n")
					} else {
						#Perform Curvature test with center points
						bsky_anova_table_with_curvature_test = bsky_lm_with_curvature_mixed_facor (formula = formula({{selected.modelname | safe}}_{{dataset.name}}), design = {{if(options.selected.blockID == "")}} {{dataset.name}} {{#else}} bsky_temp_df {{/if}}, tol = 1e-8)
						if(!is.null(bsky_anova_table_with_curvature_test)){
							BSkyFormat(bsky_anova_table_with_curvature_test, singleTableOutputHeader = "Curvature Test - Anova Table")
						}
					}
					#bsky_design_{{dataset.name}}_factorial_rows = {{dataset.name}}[bsky_identify_factorial_points({{dataset.name}}, tol = 1e-8), , drop = FALSE]
					bsky_design_{{dataset.name}}_factorial_rows =bsky_design_{{dataset.name}}_factorial_rows[bsky_identify_factorial_points({{dataset.name}}, tol = 1e-8), , drop = FALSE]
					cat("Creating the linear model {{selected.modelname | safe}}_{{dataset.name}}", "only with the cube/factorial rows after removing the center points and axial points, if any\n")
					
					if(nrow({{dataset.name}}) > nrow(bsky_design_{{dataset.name}}_factorial_rows)) bsky_DesignHasCenterpoints = TRUE
				} else{
					cat("{{dataset.name}} not a design data type. No center point can be detected and no curvature test can be performed\n") 
					cat("Creating the linear model {{selected.modelname | safe}}_{{dataset.name}}", "with the entire dataset {{dataset.name}}\n")
				}
				
				#Creating the model for linear analysis design data without only cube points (removing all center points and axial points, if any)
				{{if (options.selected.model_degree =="1")}} 
				     {{if(options.selected.blockID == "")}}
						{{selected.modelname | safe}}_{{dataset.name}} = lm({{selected.dependent | safe}}~{{selected.independent | safe}}, na.action=na.exclude, model = TRUE, data=bsky_design_{{dataset.name}}_factorial_rows)
					 {{#else}}
						{{selected.modelname | safe}}_{{dataset.name}} = lm({{selected.dependent | safe}}~{{selected.independent | safe}} + {{selected.blockID | safe}}, na.action=na.exclude, model = TRUE, data=bsky_design_{{dataset.name}}_factorial_rows)
					 {{/if}}
					 bsky_temp_model_without_block = lm({{selected.dependent | safe}}~{{selected.independent | safe}}, na.action=na.exclude, data=bsky_design_{{dataset.name}}_factorial_rows)
				{{#else}}
					 {{if(options.selected.blockID == "")}}
						{{selected.modelname | safe}}_{{dataset.name}} = lm({{selected.dependent | safe}}~({{selected.independent | safe}})^{{selected.model_degree | safe}},  na.action=na.exclude, model = TRUE, data=bsky_design_{{dataset.name}}_factorial_rows)
					 {{#else}}
						{{selected.modelname | safe}}_{{dataset.name}} = lm({{selected.dependent | safe}}~({{selected.independent | safe}} + {{selected.blockID | safe}})^{{selected.model_degree | safe}},  na.action=na.exclude, model = TRUE, data=bsky_design_{{dataset.name}}_factorial_rows)
					 {{/if}}
					 bsky_temp_model_without_block = lm({{selected.dependent | safe}}~({{selected.independent | safe}})^{{selected.model_degree | safe}},  na.action=na.exclude, data=bsky_design_{{dataset.name}}_factorial_rows)
				{{/if}}
					
				{{if(options.selected.showModelEquationChk == 'TRUE')}}
					#Display theoretical model equation and coefficients

					#Display theoretical model
					reg_formula = equatiomatic::extract_eq({{selected.modelname | safe}}_{{dataset.name}}, raw_tex = FALSE,\n\t wrap = TRUE, intercept = "alpha", ital_vars = FALSE) 
					BSkyFormat(reg_formula)

					#Display coefficients
					reg_equation = equatiomatic::extract_eq({{selected.modelname | safe}}_{{dataset.name}}, use_coefs = TRUE,\n\t wrap = TRUE,  ital_vars = FALSE, coef_digits = BSkyGetDecimalDigitSetting() )
					BSkyFormat(reg_equation)
				{{/if}}

				#Summarizing the model
				#BSky_LM_Summary_{{selected.modelname | safe}}_{{dataset.name}} = summary({{selected.modelname | safe}}_{{dataset.name}})
				#BSkyFormat(BSky_LM_Summary_{{selected.modelname | safe}}_{{dataset.name}}, singleTableOutputHeader = "Model Summary")
				BSkyFormat({{selected.modelname | safe}}_{{dataset.name}}, singleTableOutputHeader = "Model Summary")

				#Displaying the Anova table
				bsky_AnovaRes = stats::anova({{selected.modelname | safe}}_{{dataset.name}} )
				BSkyFormat(as.data.frame(bsky_AnovaRes), singleTableOutputHeader = "Anova table")

				#Displaying sum of squares table
				bsky_anova_df = as.data.frame(bsky_AnovaRes)
				totalrows = nrow(bsky_anova_df)
				regSumOfSquares = sum(bsky_anova_df[1:totalrows - 1, 3])
				residualSumOfSquares = bsky_anova_df[totalrows, 3]
				totalSumOfSquares = regSumOfSquares + residualSumOfSquares
				bsky_matSumOfSquares = matrix(c(regSumOfSquares, residualSumOfSquares, 
						totalSumOfSquares), nrow = 3, ncol = 1, dimnames = list(c("Sum of squares of regression", 
						"Sum of squares of residuals", "Total sum of squares"), 
						c("Values")))
				BSkyFormat(bsky_matSumOfSquares, singleTableOutputHeader = "Sum of squares table")

				
				# Compute and display R-sq(pred) based on PRESS statistic
					bsky_hvals <- hatvalues({{selected.modelname | safe}}_{{dataset.name}})
					if(any(bsky_hvals >= 1 - 1e-10)) {
						cat("Note: PRESS statistic cannot be computed - model is fully saturated",
							"(hat values = 1 for some observations). R-sq(pred) is undefined.\n")
					} else {
						bsky_press  <- sum((residuals({{selected.modelname | safe}}_{{dataset.name}}) /
										   (1 - bsky_hvals))^2)
						bsky_sstot  <- sum(({{selected.modelname | safe}}_{{dataset.name}}$model[[1]] -
											mean({{selected.modelname | safe}}_{{dataset.name}}$model[[1]]))^2)
						bsky_r2pred <- 1 - bsky_press / bsky_sstot
						BSkyFormat(
							data.frame(PRESS = round(bsky_press, BSkyGetDecimalDigitSetting()),
									   "R-sq(pred)" = round(bsky_r2pred * 100, 2),
									   check.names = FALSE),
							singleTableOutputHeader = "PRESS and R-sq(pred)"
						)
					}
				
				#Adding attributes to support 
				#{{selected.modelname | safe}}_{{dataset.name}}$call$data <- as.name("{{dataset.name}}")
				
				
				if(bsky_DesignHasCenterpoints == FALSE){
					{{selected.modelname | safe}}_{{dataset.name}}$call$data = as.name('{{dataset.name}}')
				}
				
				#We don't add dependent and independent variables as this is handled by our functions
				attr(.GlobalEnv\${{selected.modelname | safe}}_{{dataset.name}},"classDepVar")= class({{dataset.name}}[, c("{{selected.dependent | safe}}")])
				attr(.GlobalEnv\${{selected.modelname | safe}}_{{dataset.name}},"depVarSample")= sample(bsky_design_{{dataset.name}}_factorial_rows[, c("{{selected.dependent | safe}}")], size = 2, replace = TRUE)

				{{if(options.selected.showParetoPlotsChk === "TRUE" )}}
						# Pareto chart of effects (using the no-block model)
						
						# Pareto chart of standardized effects (all terms, no-block model)
						bsky_alpha_threshold <- qt(0.975, df.residual(bsky_temp_model_without_block))
	
						bsky_effects_df <- data.frame(
							Term   = names(coef(bsky_temp_model_without_block))[-1],  # exclude intercept
							Effect = abs(summary(bsky_temp_model_without_block)$coefficients[-1, "t value"])
						)
						bsky_effects_df <- bsky_effects_df[order(bsky_effects_df$Effect, decreasing = TRUE), ]

						
						bsky_pareto_plot <- ggplot(bsky_effects_df,
                               aes(x = reorder(Term, Effect), y = Effect)) +
								geom_bar(stat = "identity", fill = "steelblue") +
								geom_hline(yintercept = bsky_alpha_threshold,
										   linetype = "dashed", colour = "red", linewidth = 0.8) +
								annotate("text",
									 x     = nrow(bsky_effects_df) + 0.5,  # top of chart (highest bar position)
									 y     = bsky_alpha_threshold - 0.05,   # just left of the line
									 label = paste0("alpha=0.05\n(t=", round(bsky_alpha_threshold, 2), ")"),
									 colour = "red",
									 hjust  = 1,       # left-align text from the line
									 vjust  = 1,
									 size   = 3) + 
								coord_flip() +
								{{selected.BSkyThemes | safe}} +
								labs(title    = "Pareto Chart of Standardized Effects",
									 subtitle = paste("Response:", "{{selected.dependent | safe}}"),
									 x        = "Term",
									 y        = "Standardized Effect (|t|)") 
								
						print(bsky_pareto_plot)
						rm(bsky_pareto_plot, bsky_effects_df, bsky_alpha_threshold)
					{{/if}}
			
					{{if(options.selected.observationDiagnosticsTableChk === "TRUE" )}} 
							# Observation diagnostics
							bsky_p <- length(coef({{selected.modelname | safe}}_{{dataset.name}}))
							bsky_n <- nrow({{selected.modelname | safe}}_{{dataset.name}}$model)
							bsky_dffits_threshold <- 2 * sqrt(bsky_p / bsky_n)

							bsky_diag_df <- data.frame(
								Obs       = seq_len(bsky_n),
								Fitted    = round(fitted({{selected.modelname | safe}}_{{dataset.name}}),
												  BSkyGetDecimalDigitSetting()),
								Residual  = round(residuals({{selected.modelname | safe}}_{{dataset.name}}),
												  BSkyGetDecimalDigitSetting()),
								Std.Resid = round(rstandard({{selected.modelname | safe}}_{{dataset.name}}),
												  BSkyGetDecimalDigitSetting()),
								HI        = round(hatvalues({{selected.modelname | safe}}_{{dataset.name}}),
												  BSkyGetDecimalDigitSetting()),
								Cooks.D   = round(cooks.distance({{selected.modelname | safe}}_{{dataset.name}}),
												  BSkyGetDecimalDigitSetting()),
								DFFITS    = round(dffits({{selected.modelname | safe}}_{{dataset.name}}),
												  BSkyGetDecimalDigitSetting())
							)

							bsky_diag_df$Unusual <- ifelse(
								abs(bsky_diag_df$Std.Resid) > 2 & bsky_diag_df$Cooks.D > 1, "RC",
								ifelse(abs(bsky_diag_df$Std.Resid) > 2,                      "R",
								ifelse(bsky_diag_df$HI > 2 * mean(bsky_diag_df$HI),          "X",
								ifelse(bsky_diag_df$Cooks.D > 1,                             "C",
								ifelse(abs(bsky_diag_df$DFFITS) > bsky_dffits_threshold,     "D", "")))))

							BSkyFormat(bsky_diag_df, singleTableOutputHeader = "Observation Diagnostics")

							# Footer explaining flags
							cat("Unusual observation flags:\n",
								"  R  = |Std. Residual| > 2 (large residual)\n",
								"  X  = Leverage > 2 * mean leverage (high influence point)\n",
								"  C  = Cook's D > 1 (highly influential observation)\n",
								"  D  = |DFFITS| > 2*sqrt(p/n) =", round(bsky_dffits_threshold, 3), "\n",
								"  RC = both large residual AND highly influential\n")

							# Leverage note - only when all values are equal (saturated/balanced design)
							if (length(unique(round(bsky_diag_df$HI, 8))) == 1) {
								cat("Note: All leverage values are equal (",
									round(bsky_diag_df$HI[1], 4),
									") - equal leverage is expected for a balanced",
									bsky_design_type_label, "with a saturated model.\n")
							}

							# Clean up
							rm(bsky_p, bsky_n, bsky_dffits_threshold)
				  {{/if}}
				  
				  BSkyFormat(" ")
				  
				  {{if(options.selected.VIFChk === "TRUE" )}} 
							# Compute VIF on main effects only model regardless of the
							# degree specified for the actual analysis model.
							# This matches Minitab/JMP convention and avoids the GVIF
							# complications caused by interaction terms.
							
							{{if(options.selected.blockID == "")}}
								bsky_vif_model = lm({{selected.dependent | safe}}~{{selected.independent | safe}}, na.action=na.exclude, model = TRUE, data=bsky_design_{{dataset.name}}_factorial_rows)
							{{#else}}
								bsky_vif_model = lm({{selected.dependent | safe}}~{{selected.independent | safe}} + {{selected.blockID | safe}}, na.action=na.exclude, model = TRUE, data=bsky_design_{{dataset.name}}_factorial_rows)
							{{/if}}

							tryCatch({
								bsky_vif_result <- car::vif(bsky_vif_model)

								# For main effects only: car::vif returns a simple named numeric vector
								# No GVIF complications, no character columns, no is.data.frame issues
								bsky_vif_df <- data.frame(
									Term     = names(bsky_vif_result),
									VIF      = round(as.numeric(bsky_vif_result),
													 BSkyGetDecimalDigitSetting()),
									Flag     = ifelse(as.numeric(bsky_vif_result) > 4, "HIGH",
											   ifelse(as.numeric(bsky_vif_result) > 2, "MODERATE", ""))
								)

								BSkyFormat(bsky_vif_df,
										   singleTableOutputHeader = "Variance Inflation Factors (Main Effects)")

								 cat("Note: VIF computed on main effects model.\n",
										"      VIF = 1.0 : no collinearity - predictor is orthogonal to all others.\n",
										"      VIF > 2   : MODERATE - worth investigating.\n",
										"      VIF > 4   : HIGH - collinearity is problematic.\n",
										"      VIF > 10  : SEVERE - coefficient estimates are unreliable.\n",
										"      For a", bsky_design_type_label,
										"- VIF = 1.0 confirms predictor orthogonality.\n")

							}, error = function(e) {
								cat("VIF could not be computed:", conditionMessage(e), "\n")
							})

							# Clean up
							if (exists("bsky_vif_model")) rm(bsky_vif_model)
				  {{/if}}


				{{if(options.selected.showResidualPlotsChk === "TRUE" )}} 
						bsky_resids = NULL
						bsky_resids = bsky_plot_residuals(model = {{selected.modelname | safe}}_{{dataset.name}},  residual_type = NULL, grouping_var_label = c(""), flipaxisPPplot = {{selected.flipaxisPPplotChk | safe}}, deGroupPlots = {{selected.deGroupPlotsChk | safe}})
						bsky_normality_test(dataVar = bsky_resids, dataVarName = "Residuals", Shapiro = {{selected.checkShapiroNormalityTestChk | safe}}, Anderson = {{selected.checkADNormalityTestChk | safe}})
				{{/if}}
	
				{{if (options.selected.effectsplot == "TRUE" && options.selected.model_degree =="1")}}
				BSkyFormat("Ploting All Effects for the Model {{selected.modelname | safe}}_{{dataset.name}}")
				#plot(effects::allEffects({{selected.modelname | safe}}_{{dataset.name}})) 
				
				plot(effects::allEffects(bsky_temp_model_without_block))
				{{/if}}

				# Not used - because residual plot below is sufficient for model plot
				{{if (options.selected.generateplotchk == "TRUE" && options.selected.model_degree =="1")}}
						#displaying plots
						#Plots residuals vs. fitted, normal Q-Q, scale-location, residuals vs. leverage
						plot({{selected.modelname | safe}}_{{dataset.name}})
				{{/if}}


					# The following plots and analysis is only valid for 2-level Factor Design - e.g. pb, FrF2, Full Factorial, etc design type
					
					{{if (options.selected.AliasChk == "TRUE" && options.selected.twoLevelDesignTypeChk =="TRUE")}}
						BSkyFormat("Check for Aliases") 
						#FrF2::aliases({{selected.modelname | safe}}_{{dataset.name}}, code={{selected.AliasCodedChk | safe}})
						
						FrF2::aliases(bsky_temp_model_without_block, code={{selected.AliasCodedChk | safe}})
					{{/if}}
					
					{{if (options.selected.DanielplotChk == "TRUE" && options.selected.twoLevelDesignTypeChk =="TRUE")}}
							BSkyFormat("Daniel Plot (plot of effects)")
							#FrF2::DanielPlot({{selected.modelname | safe}}_{{dataset.name}}, code={{selected.DanielplotCodeChk | safe}}, alpha={{selected.DanielplotAlpha}}, half={{selected.DanielplotHalfChk | safe}})
							
							FrF2::DanielPlot(bsky_temp_model_without_block, code={{selected.DanielplotCodeChk | safe}}, alpha={{selected.DanielplotAlpha}}, half={{selected.DanielplotHalfChk | safe}})
					{{/if}}

					{{if (options.selected.MEPlotChk == "TRUE" && options.selected.twoLevelDesignTypeChk =="TRUE")}}
						BSkyFormat("Main effects plot")

						# ── Parse optional horizontal reference lines ────────────────────────
						bsky_me_yIntercept  <- NULL
						bsky_me_hRefLabels  <- NULL

						{{if(options.selected.MEPlotyIntercept != "")}}
						bsky_me_yIntercept <- as.numeric(c({{selected.MEPlotyIntercept | safe}}))
						{{/if}}

						bsky_me_hRefLabels <- c({{selected.MEPlothorizontalLinelabel | safe}})
						if (length(bsky_me_hRefLabels) == 1 && trimws(bsky_me_hRefLabels) == "") bsky_me_hRefLabels <- NULL

						# ── Build reference line data frame (mirrors MultiVari pattern) ──────
						bsky_me_ref_df <- NULL
						if (!is.null(bsky_me_yIntercept)) {
						  if (!is.null(bsky_me_hRefLabels)) {
						    bsky_me_hRefLabels <- bsky_me_hRefLabels[seq_along(bsky_me_yIntercept)]
						    if (length(bsky_me_hRefLabels) < length(bsky_me_yIntercept))
						      bsky_me_hRefLabels <- c(bsky_me_hRefLabels,
						        as.character(bsky_me_yIntercept[(length(bsky_me_hRefLabels)+1):length(bsky_me_yIntercept)]))
						    bsky_me_ref_df <- data.frame(
						      y_val = bsky_me_yIntercept,
						      label = paste0(bsky_me_hRefLabels, "\n", bsky_me_yIntercept),
						      stringsAsFactors = FALSE)
						  } else {
						    bsky_me_ref_df <- data.frame(
						      y_val = bsky_me_yIntercept,
						      label = as.character(paste0(bsky_me_yIntercept, "\n")),
						      stringsAsFactors = FALSE)
						  }
						}

						# ── Build ggplot main effects plot ───────────────────────────────────
						# Compute marginal means for each factor at each level
						bsky_me_data   <- bsky_design_{{dataset.name}}_factorial_rows
						bsky_me_resp   <- "{{selected.dependent | safe}}"
						
						#bsky_me_factors <- {{selected.independent | safe}}
						
						bsky_me_factors <- trimws(strsplit("{{selected.independent | safe}}", "+", fixed = TRUE)[[1]])

						# Exclude block column from factor list for the main effects plot
						{{if(options.selected.blockID != "")}}
						bsky_me_factors <- bsky_me_factors[bsky_me_factors != "{{selected.blockID | safe}}"]
						{{/if}}

						bsky_grand_mean <- mean(bsky_me_data[[bsky_me_resp]], na.rm = TRUE)

						# Compute marginal mean at each factor level
						bsky_me_rows <- do.call(rbind, lapply(bsky_me_factors, function(fac) {
						  vals <- sort(unique(bsky_me_data[[fac]]))
						  means <- sapply(vals, function(v)
						    mean(bsky_me_data[[bsky_me_resp]][bsky_me_data[[fac]] == v], na.rm = TRUE))
						  data.frame(
						    Factor    = fac,
						    Level     = as.character(vals),
						    Level_num = as.numeric(as.character(vals)),
						    MeanY     = means,
						    stringsAsFactors = FALSE)
						}))
						# Preserve factor order matching independent variable list
						bsky_me_rows$Factor <- factor(bsky_me_rows$Factor, levels = bsky_me_factors)

						bsky_me_plot <- ggplot(bsky_me_rows, aes(x = Level_num, y = MeanY)) +
						  geom_line(color = "steelblue", linewidth = 0.8) +
						  geom_point(shape = 15, size = 3, color = "steelblue") +
						  geom_hline(yintercept = bsky_grand_mean,
						            color = "black", linewidth = 0.6) +
						  facet_wrap(~ Factor, scales = "free_x", nrow = 1) +
						  labs(
						    title = paste("Main effects plot for", bsky_me_resp),
						    x = NULL, y = bsky_me_resp) +
						  {{selected.BSkyThemes | safe}} +
						  theme(
						    strip.text       = element_text(face = "bold"),
						    plot.title       = element_text(face = "bold", hjust = 0.5),
						    panel.spacing    = unit(0.3, "lines")
						  )

						# ── Add optional reference lines ─────────────────────────────────────
						if (!is.null(bsky_me_ref_df)) {
						  for (bsky_me_i in seq_len(nrow(bsky_me_ref_df))) {
						    bsky_me_plot <- bsky_me_plot +
						      geom_hline(
						        yintercept = bsky_me_ref_df$y_val[bsky_me_i],
						        color = "red", linetype = "dashed",
						        linewidth = 0.5, alpha = 0.8) +
						      annotate(
						        geom = "text",
						        x = Inf, y = bsky_me_ref_df$y_val[bsky_me_i],
						        label = bsky_me_ref_df$label[bsky_me_i],
						        color = "red", size = 2.8,
						        hjust = 1.05, vjust = 0.5)
						  }
						}

						print(bsky_me_plot)

						# Also show the marginal means matrix
						# mainEffectsMatrixfromMEPlot = FrF2::MEPlot(bsky_temp_model_without_block)
						# BSkyFormat(mainEffectsMatrixfromMEPlot, outputTableRenames = "Main Effects Matrix Generated from MEPlot()")
						
						# Compute marginal means matrix directly - same data already used for the ggplot
						# Rows = factor levels (low/high), Columns = factors
						mainEffectsMatrixfromMEPlot <- do.call(cbind, lapply(bsky_me_factors, function(fac) {
						  vals <- sort(unique(bsky_me_data[[fac]]))
						  means <- sapply(vals, function(v)
							mean(bsky_me_data[[bsky_me_resp]][bsky_me_data[[fac]] == v], na.rm = TRUE))
						  means
						}))
						colnames(mainEffectsMatrixfromMEPlot) <- bsky_me_factors
						rownames(mainEffectsMatrixfromMEPlot) <- c("low", "high")
						BSkyFormat(mainEffectsMatrixfromMEPlot, outputTableRenames = "Main Effects Matrix")

						# Clean up
						rm(bsky_me_data, bsky_me_resp, bsky_me_factors, bsky_grand_mean,
						   bsky_me_rows, bsky_me_plot, bsky_me_ref_df,
						   bsky_me_yIntercept, bsky_me_hRefLabels, mainEffectsMatrixfromMEPlot)
						if (exists("bsky_me_i")) rm(bsky_me_i)
					{{/if}}

					{{if (options.selected.IAPlotChk == "TRUE" && options.selected.twoLevelDesignTypeChk =="TRUE")}}
						if(c({{selected.model_degree}}) > 1){
							BSkyFormat("IAPlot(interaction plots)")
							#interactionMatrixfromIAPlot = FrF2::IAPlot({{selected.modelname | safe}}_{{dataset.name}}, show.alias = {{selected.IAPlotShowAliasChk | safe}})
							
							interactionMatrixfromIAPlot = FrF2::IAPlot(bsky_temp_model_without_block, show.alias = {{selected.IAPlotShowAliasChk | safe}})
							BSkyFormat(interactionMatrixfromIAPlot, outputTableRenames = "Interaction Matrix Generated from IAPlot()")
						}
					{{/if}}
						
					#{{selected.dependent | safe}} = {{dataset.name}}[,which(names({{dataset.name}}) == '{{selected.dependent | safe}}')]
					#if({{selected.cubePlotChk | safe}}) {BSkyFormat("Cube plot of three factor interactions"); FrF2::cubePlot({{selected.dependent | safe}}, {{selected.cubePlotIndependent | safe}}, round = BSkyGetDecimalDigitSetting())}
					
					{{if (options.selected.cubePlotChk == "TRUE" && options.selected.twoLevelDesignTypeChk =="TRUE")}}
						{{if (options.selected.cubePlotModelMeanChk == "TRUE")}}
							BSkyFormat("Cube plot of three factor interactions with and without modeled means") 
							#FrF2::cubePlot({{selected.modelname | safe}}_{{dataset.name}}, {{selected.cubePlotIndependent | safe}}, round = BSkyGetDecimalDigitSetting())
							#FrF2::cubePlot({{selected.modelname | safe}}_{{dataset.name}}, {{selected.cubePlotIndependent | safe}}, modeled = FALSE, round = BSkyGetDecimalDigitSetting() )
							
							FrF2::cubePlot(bsky_temp_model_without_block, {{selected.cubePlotIndependent | safe}}, round = BSkyGetDecimalDigitSetting())
							FrF2::cubePlot(bsky_temp_model_without_block, {{selected.cubePlotIndependent | safe}}, modeled = FALSE, round = BSkyGetDecimalDigitSetting() )
						{{#else}}
							BSkyFormat("Cube plot of three factor interactions with modeled means") 
							#FrF2::cubePlot({{selected.modelname | safe}}_{{dataset.name}}, {{selected.cubePlotIndependent | safe}}, round = BSkyGetDecimalDigitSetting())
							
							FrF2::cubePlot(bsky_temp_model_without_block, {{selected.cubePlotIndependent | safe}}, round = BSkyGetDecimalDigitSetting())
						{{/if}}
					{{/if}}
				



{{if(options.selected.showDesignWithoutCenterpointsChk === "TRUE" )}} 
   if(bsky_DesignHasCenterpoints == TRUE){
	   cat("{{dataset.name}} - Design has centerpoints. bsky_design_{{dataset.name}}_factorial_rows is the dataset without the centerpoints is created in the data grid\n")
	   BSkyLoadRefresh('bsky_design_{{dataset.name}}_factorial_rows')
   } else {
	   cat("{{dataset.name}} - Design does not have any centerpoints. Hence the design without centerpoint is not created in the data grid\n")
   }
{{/if}}

cat("\nLinear model {{selected.modelname | safe}}_{{dataset.name}} has been saved and can be used for further model analysis like predict, etc., for standard lm-based diagnostics and predictions using analysis menus under MODEL EVALUATION on the top menu bar.\n")

#clean up 
if(exists('bsky_hvals'))       rm(bsky_hvals)
if(exists('bsky_temp_model_without_block')) rm(bsky_temp_model_without_block)
if(exists('bsky_AnovaRes'))       rm(bsky_AnovaRes)
if(exists('bsky_anova_df'))       rm(bsky_anova_df)
if(exists('bsky_matSumOfSquares')) rm(bsky_matSumOfSquares)
if(exists('bsky_press'))          rm(bsky_press)
if(exists('bsky_sstot'))          rm(bsky_sstot)
if(exists('bsky_r2pred'))         rm(bsky_r2pred)
if(exists('bsky_effects_df'))     rm(bsky_effects_df)
if(exists('bsky_diag_df'))        rm(bsky_diag_df)
if(exists('bsky_vif_df'))         rm(bsky_vif_df)
if(exists('bsky_vif_result'))     rm(bsky_vif_result)
if(exists('bsky_design_type_label')) rm(bsky_design_type_label)
if(exists('bsky_center_points_rowID')) rm(bsky_center_points_rowID)
if(exists('bsky_anova_table_with_curvature_test')) rm(bsky_anova_table_with_curvature_test)

`
        }
        var objects = {
            content_var: { el: new srcVariableList(config, {action: "copy", scroll:true}) },
            modelname: {
                el: new input(config, {
                    no: 'modelname',
                    label: linearRegressionCurvTestDoE.t('modelname'),
                    placeholder: "",
                    required: true,
                    type: "character",
                    extraction: "TextAsIs",
                    value: "DoE_LinearModel1",
                    overwrite: "dataset"
                })
            },
            dependent: {
                el: new dstVariable(config, {
                    label: linearRegressionCurvTestDoE.t('dependent'),
                    no: "dependent",
                    filter: "Numeric|Scale",
                    extraction: "NoPrefix|UseComma",
                    required: true,
                }), r: ['{{ var | safe}}']
            },
            independent: {
                el: new dstVariableList(config, {
                    label: linearRegressionCurvTestDoE.t('independent'),
                    no: "independent",
                    required: true,
                    filter: "String|Numeric|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UsePlus",
                }), r: ['{{ var | safe}}']
            },
			blockID: {
                el: new dstVariable(config, {
                    label: linearRegressionCurvTestDoE.t('blockID'),
                    no: "blockID",
                    //filter: "Numeric|Scale",
					filter: "String|Numeric|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UseComma",
                    //required: true,
                }), r: ['{{ var | safe}}']
            },
			/*
			curv_test_degree: {
                el: new input(config, {
                    no: 'curv_test_degree',
                    label: linearRegressionCurvTestDoE.t('curv_test_degree'),
                    placeholder: "",
                    allow_spaces:true,
                    type: "numeric",
                    extraction: "TextAsIs",
                    value: "",
					//style: "mb-1",
					width: "w-25",
                })
            },   
			*/
			curv_test_degree: {
                el: new inputSpinner(config, {
                    no: 'curv_test_degree',
                    label: linearRegressionCurvTestDoE.t('curv_test_degree'),
                    required: true,
                    min: 1,
                    max: 99,
                    step: 1,
                    value: 1,
					width: "w-25",
					//style: "mb-2",
                })
            }, 
			model_degree: {
                el: new inputSpinner(config, {
                    no: 'model_degree',
                    label: linearRegressionCurvTestDoE.t('model_degree'),
                    required: true,
                    min: 1,
                    max: 99,
                    step: 1,
                    value: 1,
					width: "w-25",
					style: "mb-3",
                })
            }, 
			/*
            nointercept: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('nointercept'),
                    no: "nointercept",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
			*/
			axialCenterPointRowsChk: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('axialCenterPointRowsChk'),
                    no: "axialCenterPointRowsChk",
                    //style: "ml-5",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					state:"checked", 
					style: "mb-2",
					newline: true,
                })
            },
			showDesignWithoutCenterpointsChk: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('showDesignWithoutCenterpointsChk'),
                    no: "showDesignWithoutCenterpointsChk",
                   // style: "mb-3",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },  
			effectsplot: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('effectsplot'),
                    no: "effectsplot",
                    style: "mt-3 mb-1",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },     		
			generateplotchk: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('generateplotchk'),
                    no: "generateplotchk",
                    style: "mt-2 mb-3",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
			/*
			weights: {
                el: new dstVariable(config, {
                    label: linearRegressionCurvTestDoE.t('weights'),
                    no: "weights",
                    filter: "String|Numeric|Date|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UseComma",
                }), r: ['{{ var | safe}}']
            },
			*/
			twoLevelDesignTypeChk: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('twoLevelDesignTypeChk'),
                    no: "twoLevelDesignTypeChk",
                    style: "mt-2",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
					state: "checked",
                })
            },  
			AliasChk: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('AliasChk'),
                    no: "AliasChk",
                    style: "ml-4 mt-2",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },  
			AliasCodedChk: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('AliasCodedChk'),
                    no: "AliasCodedChk",
                    style: "ml-5 mb-2",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },       
			DanielplotChk: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('DanielplotChk'),
                    no: "DanielplotChk",
                    style: "ml-4 mt-2",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },  
			DanielplotCodeChk: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('DanielplotCodeChk'),
                    no: "DanielplotCodeChk",
                    style: "ml-5",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },    
			DanielplotHalfChk: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('DanielplotHalfChk'),
                    no: "DanielplotHalfChk",
                    style: "ml-5",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },  
			DanielplotAlpha: {
                el: new input(config, {
                    no: 'DanielplotAlpha',
                    label: linearRegressionCurvTestDoE.t('DanielplotAlpha'),
                    placeholder: "",
                    allow_spaces:true,
                    type: "numeric",
                    extraction: "TextAsIs",
                    value: "0.5",
					style: "ml-5 mb-2",
					width: "w-25",
					newline: true,
                })
            },     
			MEPlotChk: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('MEPlotChk'),
                    no: "MEPlotChk",
                    style: "ml-4 mb-2",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
            MEPlotRefLineSectionLbl: {
                el: new labelVar(config, {
                    label: linearRegressionCurvTestDoE.t('MEPlotRefLineSectionLbl'),
                    style: "ml-5",
                    h: 6,
                })
            },
            MEPlotyIntercept: {
                el: new input(config, {
                    no: 'MEPlotyIntercept',
                    label: linearRegressionCurvTestDoE.t('MEPlotyIntercept'),
                    placeholder: "",
                    enforceRobjectRules: false,
                    width: "w-50",
                    extraction: "TextAsIs",
                    style: "ml-5",
                    value: ""
                })
            },
            MEPlothorizontalLinelabel: {
                el: new input(config, {
                    no: 'MEPlothorizontalLinelabel',
                    label: linearRegressionCurvTestDoE.t('MEPlothorizontalLinelabel'),
                    placeholder: "",
                    required: false,
                    type: "character",
                    style: "ml-5 mb-2",
                    extraction: "CreateArray",
                    allow_spaces: true,
					width: "w-50",
                })
            },  
			IAPlotChk: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('IAPlotChk'),
                    no: "IAPlotChk",
                    style: "ml-4 mt-2",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },  
			IAPlotShowAliasChk: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('IAPlotShowAliasChk'),
                    no: "IAPlotShowAliasChk",
                    style: "ml-5 mb-2",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },  
			cubePlotChk: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('cubePlotChk'),
                    no: "cubePlotChk",
                    style: "ml-4 mt-2 mb-1",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            }, 
			cubePlotModelMeanChk: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('cubePlotModelMeanChk'),
                    no: "cubePlotModelMeanChk",
                    style: "ml-5 mb-1",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					//state: "checked",
					newline: true,
                })
            }, 
			cubePlotIndependent: {
                el: new dstVariableList(config, {
                    label: linearRegressionCurvTestDoE.t('cubePlotIndependent'),
                    no: "cubePlotIndependent",
                    required: false,
                    filter: "String|Numeric|Logical|Ordinal|Nominal|Scale",
                    extraction: "Enclosed|UseComma",
					items_count : 3,
					style: "mb-3",
                }), r: ['{{ var | safe}}']
            },
			showModelEquationChk: { 
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('showModelEquationChk'), 
					no: "showModelEquationChk",
                    bs_type: "valuebox",
                    //style: "mt-3",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					//state: "checked",
					newline: true,
                })
            },
			showParetoPlotsChk: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('showParetoPlotsChk'), 
					no: "showParetoPlotsChk",
                    bs_type: "valuebox",
                    style: "mt-2 mb-2",
					//style: "ml-5",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
			observationDiagnosticsTableChk: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('observationDiagnosticsTableChk'), 
					no: "observationDiagnosticsTableChk",
                    bs_type: "valuebox",
                    //style: "mt-2 mb-2",
					style: "mb-2",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
			VIFChk: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('VIFChk'), 
					no: "VIFChk",
                    bs_type: "valuebox",
                    //style: "mt-2 mb-2",
					style: "mb-2",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
			checkShapiroNormalityTestChk: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('checkShapiroNormalityTestChk'), 
					no: "checkShapiroNormalityTestChk",
                    bs_type: "valuebox",
                    //style: "mt-2 mb-3",
					style: "ml-5",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
			checkADNormalityTestChk: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('checkADNormalityTestChk'), 
					no: "checkADNormalityTestChk",
                    bs_type: "valuebox",
                    //style: "mt-2 mb-3",
					style: "ml-5",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
			showResidualPlotsChk: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('showResidualPlotsChk'),
					no: "showResidualPlotsChk",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					style: "mt-3",
					state:"checked",
					newline: true,
                })
            },
			flipaxisPPplotChk: { 
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('flipaxisPPplotChk'), 
					no: "flipaxisPPplotChk",
                    bs_type: "valuebox",
                    //style: "ml-3 mb-3",
					style: "ml-5",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					state:"checked",
					newline: true,
                })
            },
			deGroupPlotsChk: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('deGroupPlotsChk'),
					no: "deGroupPlotsChk",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					style: "ml-5",
					newline: true,
                })
            },
        };
        const content = {
            left: [objects.content_var.el.content],
            right: [
				objects.modelname.el.content, 
				objects.dependent.el.content, 
				objects.independent.el.content, 
				objects.blockID.el.content,
		
				objects.curv_test_degree.el.content,
				 objects.model_degree.el.content,
				 
               // objects.nointercept.el.content, 
				
				objects.axialCenterPointRowsChk.el.content,  
				objects.showDesignWithoutCenterpointsChk.el.content,
				
				objects.effectsplot.el.content, 
				
				//objects.generateplotchk.el.content,
				
				//objects.weights.el.content, 
				
				objects.showModelEquationChk.el.content,
				
				objects.showParetoPlotsChk.el.content, 
				
				objects.observationDiagnosticsTableChk.el.content,
				objects.VIFChk.el.content,
				
				objects.showResidualPlotsChk.el.content, 
				objects.checkADNormalityTestChk.el.content,
				objects.checkShapiroNormalityTestChk.el.content, 
				objects.flipaxisPPplotChk.el.content, 
				objects.deGroupPlotsChk.el.content, 
				
				objects.twoLevelDesignTypeChk.el.content,
				
				objects.AliasChk.el.content,
				objects.AliasCodedChk.el.content,
				
				objects.DanielplotChk.el.content,
				objects.DanielplotCodeChk.el.content,
				objects.DanielplotHalfChk.el.content,
				objects.DanielplotAlpha.el.content,
				
				objects.MEPlotChk.el.content,
				objects.MEPlotRefLineSectionLbl.el.content,
				objects.MEPlotyIntercept.el.content,
				objects.MEPlothorizontalLinelabel.el.content,
				
				objects.IAPlotChk.el.content,
				objects.IAPlotShowAliasChk.el.content,
				
				objects.cubePlotChk.el.content,
				objects.cubePlotModelMeanChk.el.content,
				objects.cubePlotIndependent.el.content, 
				
				],
		
            nav: {
                name: linearRegressionCurvTestDoE.t('navigation'),
                icon: "icon-doe",
                modal: config.id
            }
        };
        super(config, objects, content);
        
        this.help = {
            title: linearRegressionCurvTestDoE.t('help.title'),
            r_help: linearRegressionCurvTestDoE.t('help.r_help'), //Fix by Anil //r_help: "help(data,package='utils')",
            body: linearRegressionCurvTestDoE.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new linearRegressionCurvTestDoE().render()
}
