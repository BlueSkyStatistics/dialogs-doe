/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */





class linearRegressionDoE extends baseModal {
    static dialogId = 'linearRegressionDoE'
    static t = baseModal.makeT(linearRegressionDoE.dialogId)

    constructor() {
        var config = {
            id: linearRegressionDoE.dialogId,
            label: linearRegressionDoE.t('title'),
            modalType: "two",
            RCode: `
require(equatiomatic)
require(textutils)
require(DoE.base)
require(DoE.wrapper)
require(FrF2)
require(dplyr)
require(ggplot2)
require(ggthemes)
require(qqplotr)
require(nortest)
require(rsm)

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
						
				bsky_design_{{dataset.name}}_factorial_rows = {{dataset.name}}
				
				bsky_DesignHasCenterpoints = FALSE
				
				if(c("design") %in% class({{dataset.name}}))
				{
					{{if(options.selected.axialCenterPointRowsChk == "TRUE")}}
							   #bsky_summarize_design_point_rows will return the design after any star/center/cube row count repairs in the design info section
								{{dataset.name}}  = bsky_summarize_design_point_rows({{dataset.name}}, tol = 1e-8)	
					{{/if}}
					
					BSkyFormat(" ")
					
					# ------------------------------- 
					# Detect factorial/cube points and discard center and axial points
					# -------------------------------
					{{if(options.selected.excludeCenterAxialPointsChk == "TRUE")}}
							bsky_design_{{dataset.name}}_factorial_rows = {{dataset.name}}[bsky_identify_factorial_points({{dataset.name}}, tol = 1e-8), , drop = FALSE]
							if(nrow({{dataset.name}}) > nrow(bsky_design_{{dataset.name}}_factorial_rows)){
								cat("Creating the linear model {{selected.modelname | safe}}_{{dataset.name}}", "only with the cube/factorial rows after removing the center points and axial points\n")
								bsky_DesignHasCenterpoints = TRUE
							} else {
								cat("No center points or axial points detected. Creating the linear model {{selected.modelname | safe}}_{{dataset.name}}", "with the entire dataset {{dataset.name}}\n")
							}
					{{#else}}
							cat("Creating the linear model {{selected.modelname | safe}}_{{dataset.name}}", "with the entire dataset {{dataset.name}}\n")
					{{/if}}
				} else{
					{{if(options.selected.axialCenterPointRowsChk == "TRUE" || options.selected.excludeCenterAxialPointsChk == "TRUE")}}
						cat("{{dataset.name}} not a design data type. No center and axial point can be detected\n") 
					{{/if}}
					cat("Creating the linear model {{selected.modelname | safe}}_{{dataset.name}}", "with the entire dataset {{dataset.name}}\n")
				}

					#Creating the model
					{{selected.modelname | safe}}_{{dataset.name}} = lm({{selected.dependent | safe}}~{{selected.formula | safe}}, {{selected.weights | safe}} na.action=na.exclude, model = TRUE, data=bsky_design_{{dataset.name}}_factorial_rows)
					
	#local ({
					#Display theoretical model equation and coefficients
					#Display theoretical model
					reg_formula = equatiomatic::extract_eq({{selected.modelname | safe}}_{{dataset.name}}, raw_tex = FALSE,\n\t wrap = TRUE,  intercept = "alpha", ital_vars = FALSE) 
					BSkyFormat(reg_formula)
					#Display coefficients
					reg_equation = equatiomatic::extract_eq({{selected.modelname | safe}}_{{dataset.name}}, use_coefs = TRUE,\n\t wrap = TRUE,ital_vars = FALSE, coef_digits = BSkyGetDecimalDigitSetting() )
					BSkyFormat(reg_equation)
					#Summarizing the model
					BSky_LM_Summary_{{selected.modelname | safe}} = summary({{selected.modelname | safe}}_{{dataset.name}})
					# Computing 95% confidence interval of the coefficients
					# BSky_LM_Summary_{{selected.modelname | safe}}$coefficients<- cbind ( BSky_LM_Summary_{{selected.modelname | safe}}$coefficients, stats::confint({{selected.modelname | safe}}_{{dataset.name}},level=0.95,type="LR")[rowSums(is.na(stats::confint({{selected.modelname | safe}}_{{dataset.name}},level=0.95,type="LR"))) != ncol(stats::confint({{selected.modelname | safe}}_{{dataset.name}},level=0.95,type="LR")), ])
					BSkyFormat(BSky_LM_Summary_{{selected.modelname | safe}}, singleTableOutputHeader = "Model Summary")
					#Displaying the Anova table
					AnovaRes = anova({{selected.modelname | safe}}_{{dataset.name}} )
					BSkyFormat(as.data.frame(AnovaRes), singleTableOutputHeader = "Anova Table")
					#Displaying sum of squares table
					df = as.data.frame(AnovaRes)
					totalrows = nrow(df)
					regSumOfSquares = sum(df[1:totalrows - 1, 2])
					residualSumOfSquares = df[totalrows, 2]
					totalSumOfSquares = regSumOfSquares + residualSumOfSquares
					matSumOfSquares = matrix(c(regSumOfSquares, residualSumOfSquares, 
							totalSumOfSquares), nrow = 3, ncol = 1, dimnames = list(c("Sum of squares of Regression", 
							"Sum of squares of residuals", "Total sum of squares"), 
							c("Values")))
					BSkyFormat(matSumOfSquares, singleTableOutputHeader = "Sum of squares Table")

					
					{{if(options.selected.observationDiagnosticsTableChk === "TRUE" )}}
							#Fit and diagnostics for unusual observations
							
							bsky_design_type_label = "Factorial"
							
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
							
							#BSkyUnusualObs({{selected.modelname | safe}},{{dataset.name}}\${{selected.dependent | safe}},"{{selected.dependent | safe}}" )
						   #BSkyUnusualObs({{selected.modelname | safe}}_{{dataset.name}}, bsky_design_{{dataset.name}}_factorial_rows\${{selected.dependent | safe}},"{{selected.dependent | safe}}" )
					{{/if}}
					
					{{if (options.selected.generateplotchk == "TRUE")}}#displaying plots\n#Plots residuals vs. fitted, normal Q-Q, scale-location, residuals vs. leverage\nplot({{selected.modelname | safe}}){{/if}}

					{{if(options.selected.showResidualPlotsChk === "TRUE" )}} 
						bsky_resids = NULL
						bsky_resids = bsky_plot_residuals(model = {{selected.modelname | safe}}_{{dataset.name}},  residual_type = NULL, grouping_var_label = c(""), flipaxisPPplot = {{selected.flipaxisPPplotChk | safe}}, deGroupPlots = {{selected.deGroupPlotsChk | safe}})
						bsky_normality_test(dataVar = bsky_resids, dataVarName = "Residuals", Shapiro = {{selected.checkShapiroNormalityTestChk | safe}}, Anderson = {{selected.checkADNormalityTestChk | safe}})
				   {{/if}}
				
				if(bsky_DesignHasCenterpoints == FALSE){
					{{selected.modelname | safe}}_{{dataset.name}}$call$data = as.name('{{dataset.name}}')
				}
				
				#Adding attributes to support scoring
				#We don't add dependent and independent variables as this is handled by our functions
				attr(.GlobalEnv\${{selected.modelname | safe}}_{{dataset.name}},"classDepVar")= class({{dataset.name}}[, c("{{selected.dependent | safe}}")])
				attr(.GlobalEnv\${{selected.modelname | safe}}_{{dataset.name}},"depVarSample")= sample(bsky_design_{{dataset.name}}_factorial_rows[, c("{{selected.dependent | safe}}")], size = 2, replace = TRUE)

				{{if(options.selected.showDesignWithoutCenterpointsChk === "TRUE" )}} 
				   if(bsky_DesignHasCenterpoints == TRUE){
					   cat("{{dataset.name}} - Design has centerpoints. bsky_design_{{dataset.name}}_factorial_rows is the dataset without the centerpoints is created in the data grid\n")
					   BSkyLoadRefresh('bsky_design_{{dataset.name}}_factorial_rows')
				   } else {
					   cat("{{dataset.name}} - Design (i.e., dataset) does not have any center or axial points. Hence the design without center and axial point is not created in the data grid\n")
					  #clean up
					  if(exists('bsky_design_{{dataset.name}}_factorial_rows')) rm(bsky_design_{{dataset.name}}_factorial_rows)
				   }
			   {{#else}}
				   #clean up
				  if(exists('bsky_design_{{dataset.name}}_factorial_rows')) rm(bsky_design_{{dataset.name}}_factorial_rows)
				{{/if}}

				cat("\nLinear model {{selected.modelname | safe}}_{{dataset.name}} has been saved and can be used for further model analysis like predict, etc., for standard lm-based diagnostics and predictions using analysis menus under MODEL EVALUATION on the top menu bar.\n")

				# Clean up
				if(exists('BSky_LM_Summary_{{selected.modelname | safe}}')) rm(BSky_LM_Summary_{{selected.modelname | safe}})
				
		#})
`
        };
        var objects = {
            content_var: { el: new srcVariableList(config, {action: "move",scroll: true }) },
            modelname: {
                el: new input(config, {
                    no: 'modelname',
                    label: linearRegressionDoE.t('modelname'),
                    placeholder: "",
                    required: true,
                    type: "character",
                    extraction: "TextAsIs",
                    value: "DoE_AdvLm1",
                    overwrite: "dataset"
                })
            },
            dependent: {
                el: new dstVariable(config, {
                    label: linearRegressionDoE.t('dependent'),
                    no: "dependent",
                    filter: "Numeric|Scale",
                    extraction: "NoPrefix|UseComma",
                    required: true,
                }), r: ['{{ var | safe}}']
            },
            formulaBuilder: {
                el: new formulaBuilder(config, {
                    no: "formula",
                    required:true,
                })
            },
			axialCenterPointRowsChk: {
                el: new checkbox(config, {
                    label: linearRegressionDoE.t('axialCenterPointRowsChk'),
                    no: "axialCenterPointRowsChk",
                    //style: "ml-5",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					state:"checked", 
					//style: "mb-3",
					newline: true,
                })
            },
			excludeCenterAxialPointsChk: {
                el: new checkbox(config, {
                    label: linearRegressionDoE.t('excludeCenterAxialPointsChk'),
                    no: "excludeCenterAxialPointsChk",
                    //style: "ml-5",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					state:"checked", 
					//style: "mb-3",
					newline: true,
                })
            },
			showDesignWithoutCenterpointsChk: {
                el: new checkbox(config, {
                    label: linearRegressionDoE.t('showDesignWithoutCenterpointsChk'),
                    no: "showDesignWithoutCenterpointsChk",
                   // style: "mb-3",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
					style: "mb-3",
                })
            },  
            generateplotchk: {
                el: new checkbox(config, {
                    label: linearRegressionDoE.t('generateplotchk'), no: "generateplotchk",
                    bs_type: "valuebox",
                    style: "mt-2 mb-3",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
                })
            },
            weights: {
                el: new dstVariable(config, {
                    label: linearRegressionDoE.t('weights'),
                    no: "weights",
                    filter: "String|Numeric|Date|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UseComma",
                    wrapped: 'weights=c(%val%),',
					 style: "mb-2",
                }), r: ['{{ var | safe}}']
            },
			 observationDiagnosticsTableChk: {
                el: new checkbox(config, {
                    label: linearRegressionDoE.t('observationDiagnosticsTableChk'),
                    no: "observationDiagnosticsTableChk",
                    //style: "mb-2",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
                })
            },
			checkShapiroNormalityTestChk: {
                el: new checkbox(config, {
                    label: linearRegressionDoE.t('checkShapiroNormalityTestChk'), 
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
                    label: linearRegressionDoE.t('checkADNormalityTestChk'), 
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
                    label: linearRegressionDoE.t('showResidualPlotsChk'),
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
                    label: linearRegressionDoE.t('flipaxisPPplotChk'), 
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
                    label: linearRegressionDoE.t('deGroupPlotsChk'),
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
				objects.formulaBuilder.el.content, 
				objects.weights.el.content,
				
				objects.axialCenterPointRowsChk.el.content,
				objects.excludeCenterAxialPointsChk.el.content, 
				objects.showDesignWithoutCenterpointsChk.el.content,
				
				objects.observationDiagnosticsTableChk.el.content,
				
				//objects.generateplotchk.el.content, 
			
				objects.showResidualPlotsChk.el.content, 
				objects.checkADNormalityTestChk.el.content,
				objects.checkShapiroNormalityTestChk.el.content, 
				objects.flipaxisPPplotChk.el.content, 
				objects.deGroupPlotsChk.el.content, 
				
				],
            nav: {
                name: linearRegressionDoE.t('navigation'),
                icon: "icon-linear_regression_formula",
                modal: config.id
            }
        };
        super(config, objects, content);
        
        this.help = {
            title: linearRegressionDoE.t('help.title'),
            r_help: linearRegressionDoE.t('help.r_help'), //Fix by Anil //r_help: "help(data,package='utils')",
            body: linearRegressionDoE.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new linearRegressionDoE().render()
}
