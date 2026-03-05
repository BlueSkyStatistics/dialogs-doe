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
require(FrF2)
#require(BsMD)

					# 1. Identify CENTER points
					bsky_identify_center_points <- function(design) {
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
						all(abs(row - midpoints) < 0.01)
					  })
					  
					  which(is_center)
					}

					# 2. Identify AXIAL/STAR points
					bsky_identify_axial_points <- function(design, repair = TRUE) {
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
								at_center <- abs(row - midpoints) < 0.01
								n_at_center <- sum(at_center)
								n_factors <- length(numeric_factors)
								
								if (n_at_center == (n_factors - 1)) {
								  non_center_idx <- which(!at_center)
								  non_center_val <- abs(row[non_center_idx] - midpoints[non_center_idx])
								  
								  if (non_center_val > 0.01) {
									# Must be beyond the factorial range to qualify as axial
									if (non_center_val > factor_ranges[non_center_idx] * 0.99) {
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
								all(abs(row - midpoints) < 0.01)
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
					bsky_identify_factorial_points <- function(design) {
					  # Factorial points are those that are NOT center and NOT axial
					  all_rows <- 1:nrow(design)
					  center_rows <- bsky_identify_center_points(design)
					  axial_rows <- bsky_identify_axial_points(design)
					  
					  factorial_rows <- setdiff(all_rows, c(center_rows, axial_rows))
					  return(factorial_rows)
					}

					# 4. Summary function for axial and center points detection
					bsky_summarize_design_point_rows <- function(design) {
					  factorial <- bsky_identify_factorial_points(design)
					  centers <- bsky_identify_center_points(design)
					  axial <- bsky_identify_axial_points(design)
					  
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

							  term_obj  <- terms(formula)
							  base_vars <- all.vars(delete.response(term_obj))

							  if (length(base_vars) == 0)
								stop("Model must include at least one predictor.")

							  # -------------------------------
							  # 2. Detect axial points, if any - axial points should not be present
							  # -------------------------------
							 axial_idx <- bsky_identify_axial_points(design)
							 
							  # -------------------------------
							  # 3. Detect center points
							  # -------------------------------
							  center_idx <- bsky_identify_center_points(design)

							  if (length(center_idx) == 0)
								stop("No center points detected.")

							  data_center <- design[center_idx, , drop = FALSE]
							  data_corner <- design[-c(center_idx, axial_idx), , drop = FALSE]

							  n_center    <- nrow(data_center)
							  n_factorial <- nrow(data_corner)

							  if (n_center < 2)
								stop("Need at least 2 center points for curvature test.")

							  y_vec <- design[[response_name]]

							  # -------------------------------
							  # 4. Fit full model on ALL data
							  # -------------------------------
							  fit_full <- lm(formula, data = design)
							  aov_full <- anova(fit_full)

							  # -------------------------------
							  # 5. Compute Curvature SS (POOLED)
							  #    Works for both numeric-only
							  #    and mixed-factor designs
							  # -------------------------------

							  y_center_mean    <- mean(y_vec[center_idx])
							  y_factorial_mean <- mean(y_vec[-c(center_idx, axial_idx)])

							  SS_curv <- (n_factorial * n_center) /
										 (n_factorial + n_center) *
										 (y_center_mean - y_factorial_mean)^2

							  df_curv <- 1
							  MS_curv <- SS_curv

							  # -------------------------------
							  # 6. Pure error from center replicates
							  # -------------------------------
							  SS_pe <- sum(
								(y_vec[center_idx] - y_center_mean)^2
							  )

							  df_pe <- n_center - 1
							  MS_pe <- SS_pe / df_pe

							  # -------------------------------
							  # 7. Recompute F-tests using pure error
							  # -------------------------------
							  aov_no_resid <- aov_full[rownames(aov_full) != "Residuals", ]

							  aov_no_resid$"F value" <-
								aov_no_resid$"Mean Sq" / MS_pe

							  aov_no_resid$"Pr(>F)" <-
								pf(aov_no_resid$"F value",
								   aov_no_resid$Df,
								   df_pe,
								   lower.tail = FALSE)

							  # -------------------------------
							  # 8. Curvature row
							  # -------------------------------
							  curvature_row <- data.frame(
								Df = df_curv,
								"Sum Sq" = SS_curv,
								"Mean Sq" = MS_curv,
								"F value" = MS_curv / MS_pe,
								"Pr(>F)" =
								  pf(MS_curv / MS_pe,
									 1,
									 df_pe,
									 lower.tail = FALSE),
								check.names = FALSE
							  )
							  rownames(curvature_row) <- "Curvature"

							  # -------------------------------
							  # 9. Pure Error row
							  # -------------------------------
							  pure_error_row <- data.frame(
								Df = df_pe,
								"Sum Sq" = SS_pe,
								"Mean Sq" = MS_pe,
								"F value" = NA,
								"Pr(>F)" = NA,
								check.names = FALSE
							  )
							  rownames(pure_error_row) <- "Error"

							  # -------------------------------
							  # 10. Total SS
							  # -------------------------------
							  SS_total <- sum(
								(y_vec - mean(y_vec))^2
							  )

							  total_row <- data.frame(
								Df = nrow(design) - 1,
								"Sum Sq" = SS_total,
								"Mean Sq" = NA,
								"F value" = NA,
								"Pr(>F)" = NA,
								check.names = FALSE
							  )
							  rownames(total_row) <- "Total"

							  # -------------------------------
							  # 11. Combine table
							  # -------------------------------
							  final_table <- rbind(
								aov_no_resid,
								curvature_row,
								pure_error_row,
								total_row
							  )
							  
							  return(final_table)
					}


				###############################################
               # Main flow starts here
               ###############################################	

				#Creating the model
				{{if (options.selected.curv_test_degree =="1")}} 
						{{selected.modelname | safe}} = lm({{selected.dependent | safe}}~{{selected.independent | safe}}, na.action=na.exclude, data={{dataset.name}})
				{{#else}}
						{{selected.modelname | safe}} = lm({{selected.dependent | safe}}~({{selected.independent | safe}})^{{selected.curv_test_degree | safe}},  na.action=na.exclude, data={{dataset.name}})
				{{/if}}
						
				bsky_design_only_factorial_rows = {{dataset.name}}
				
				if(c("design") %in% class({{dataset.name}}))
				{
					{{if(options.selected.axialCenterPointRowsChk == "TRUE")}}
							   #bsky_summarize_design_point_rows will return the design after any star/center/cube row count repairs in the design info section
								{{dataset.name}}  = bsky_summarize_design_point_rows({{dataset.name}})	
					{{/if}}
					
					# -------------------------------
					# Detect center points
					# -------------------------------
					bsky_center_points_rowID = bsky_identify_center_points({{dataset.name}})
					
					if(length(bsky_center_points_rowID) <2) {
						cat("Number of center points found: ", length(bsky_center_points_rowID), " - Minimum 2 cente points needed to perform curvature test\n")
					} else {
						bsky_anova_table_with_curvature_test = bsky_lm_with_curvature_mixed_facor (formula = formula({{selected.modelname | safe}}), design = {{dataset.name}})
						BSkyFormat(bsky_anova_table_with_curvature_test, singleTableOutputHeader = "Curvature Test - Anova Table")
					}
					bsky_design_only_factorial_rows = {{dataset.name}}[bsky_identify_factorial_points({{dataset.name}}), , drop = FALSE]
					cat("Creating the linear model {{selected.modelname | safe}}", "only with the cube/factorial rows after removing the center points and axial points, if any\n")
				} else{
					cat("{{dataset.name}} not a design data type. No center point can be detected and no curvature test can be performed\n") 
					cat("Creating the linear model {{selected.modelname | safe}}", "with the entire dataset {{dataset.name}}\n")
				}
				
				#Creating the model
				{{if (options.selected.model_degree =="1")}} 
					{{selected.modelname | safe}} = lm({{selected.dependent | safe}}~{{selected.independent | safe}}, na.action=na.exclude, data=bsky_design_only_factorial_rows)
				{{#else}}
					{{selected.modelname | safe}} = lm({{selected.dependent | safe}}~({{selected.independent | safe}})^{{selected.model_degree | safe}},  na.action=na.exclude, data=bsky_design_only_factorial_rows)
				{{/if}}
					
				{{if(options.selected.showModelEquationChk == 'TRUE')}}
					#Display theoretical model equation and coefficients

					#Display theoretical model
					reg_formula = equatiomatic::extract_eq({{selected.modelname | safe}}, raw_tex = FALSE,\n\t wrap = TRUE, intercept = "alpha", ital_vars = FALSE) 
					BSkyFormat(reg_formula)

					#Display coefficients
					reg_equation = equatiomatic::extract_eq({{selected.modelname | safe}}, use_coefs = TRUE,\n\t wrap = TRUE,  ital_vars = FALSE, coef_digits = BSkyGetDecimalDigitSetting() )
					BSkyFormat(reg_equation)
				{{/if}}

				#Summarizing the model
				BSky_LM_Summary_{{selected.modelname | safe}} = summary({{selected.modelname | safe}})
				BSkyFormat(BSky_LM_Summary_{{selected.modelname | safe}}, singleTableOutputHeader = "Model Summary")

				#Displaying the Anova table
				AnovaRes = stats::anova({{selected.modelname | safe}} )
				BSkyFormat(as.data.frame(AnovaRes), singleTableOutputHeader = "Anova table")

				#Displaying sum of squares table
				df = as.data.frame(AnovaRes)
				totalrows = nrow(df)
				regSumOfSquares = sum(df[1:totalrows - 1, 3])
				residualSumOfSquares = df[totalrows, 3]
				totalSumOfSquares = regSumOfSquares + residualSumOfSquares
				matSumOfSquares = matrix(c(regSumOfSquares, residualSumOfSquares, 
						totalSumOfSquares), nrow = 3, ncol = 1, dimnames = list(c("Sum of squares of regression", 
						"Sum of squares of residuals", "Total sum of squares"), 
						c("Values")))
				BSkyFormat(matSumOfSquares, singleTableOutputHeader = "Sum of squares table")

				#remove(BSky_LM_Summary_{{selected.modelname | safe}})
				#remove({{selected.modelname | safe}})

				{{if (options.selected.effectsplot == "TRUE" && options.selected.model_degree =="1")}}
				BSkyFormat("Ploting All Effects for the Model")
				plot(effects::allEffects({{selected.modelname | safe}}))
				{{/if}}

				{{if (options.selected.generateplotchk == "TRUE" && options.selected.model_degree =="1")}}#displaying plots\n#Plots residuals vs. fitted, normal Q-Q, scale-location, residuals vs. leverage\nplot({{selected.modelname | safe}}){{/if}}


				#if({{selected.twoLevelDesignTypeChk | safe}})
				#{
					# The following plots and analysis is only valid for 2-level Factor Design - e.g. pb, FrF2, etc design type
					
					if({{selected.AliasChk | safe}} && {{selected.twoLevelDesignTypeChk | safe}}){BSkyFormat("Check for Aliases"); FrF2::aliases({{selected.modelname | safe}}, code={{selected.AliasCodedChk | safe}})}
					
					if({{selected.DanielplotChk | safe}} && {{selected.twoLevelDesignTypeChk | safe}}) {BSkyFormat("Daniel Plot (plot of effects)"); FrF2::DanielPlot({{selected.modelname | safe}}, code={{selected.DanielplotCodeChk | safe}}, alpha={{selected.DanielplotAlpha}}, half={{selected.DanielplotHalfChk | safe}})}

					if({{selected.MEPlotChk | safe}} && {{selected.twoLevelDesignTypeChk | safe}}) 
					{
						BSkyFormat("MEPlot(main effects plots)"); 
						mainEffectsMatrixfromMEPlot = FrF2::MEPlot({{selected.modelname | safe}})
						BSkyFormat(mainEffectsMatrixfromMEPlot, outputTableRenames = "Main Effects Matrix Generated from MEPlot()")
					}

					if({{selected.IAPlotChk | safe}} && c({{selected.model_degree}}) > 1 && {{selected.twoLevelDesignTypeChk | safe}}) 
					{ 	BSkyFormat("IAPlot(interaction plots)")
						interactionMatrixfromIAPlot = FrF2::IAPlot({{selected.modelname | safe}}, show.alias = {{selected.IAPlotShowAliasChk | safe}})
						BSkyFormat(interactionMatrixfromIAPlot, outputTableRenames = "Interaction Matrix Generated from IAPlot()")
					}
						
					#{{selected.dependent | safe}} = {{dataset.name}}[,which(names({{dataset.name}}) == '{{selected.dependent | safe}}')]
					#if({{selected.cubePlotChk | safe}}) {BSkyFormat("Cube plot of three factor interactions"); FrF2::cubePlot({{selected.dependent | safe}}, {{selected.cubePlotIndependent | safe}}, round = BSkyGetDecimalDigitSetting())}
					if({{selected.cubePlotChk | safe}} && {{selected.twoLevelDesignTypeChk | safe}}) 
					{
						if({{selected.cubePlotModelMeanChk | safe}})
						{
							BSkyFormat("Cube plot of three factor interactions with and without modeled means") 
							FrF2::cubePlot({{selected.modelname | safe}}, {{selected.cubePlotIndependent | safe}}, round = BSkyGetDecimalDigitSetting())
							FrF2::cubePlot({{selected.modelname | safe}}, {{selected.cubePlotIndependent | safe}}, modeled = FALSE, round = BSkyGetDecimalDigitSetting() )
						}
						else
						{
							BSkyFormat("Cube plot of three factor interactions with modeled means") 
							FrF2::cubePlot({{selected.modelname | safe}}, {{selected.cubePlotIndependent | safe}}, round = BSkyGetDecimalDigitSetting())
						}
					}
				#}

#Adding attributes to support scoring
#We don't add dependent and independent variables as this is handled by our functions
attr(.GlobalEnv\${{selected.modelname | safe}},"classDepVar")= class({{dataset.name}}[, c("{{selected.dependent | safe}}")])
attr(.GlobalEnv\${{selected.modelname | safe}},"depVarSample")= sample({{dataset.name}}[, c("{{selected.dependent | safe}}")], size = 2, replace = TRUE)


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
                    value: "LinearRegModel1",
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
					style: "mb-3",
					newline: true,
                })
            },
			effectsplot: {
                el: new checkbox(config, {
                    label: linearRegressionCurvTestDoE.t('effectsplot'),
                    no: "effectsplot",
                    style: "mt-2 mb-1",
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
        };
        const content = {
            left: [objects.content_var.el.content],
            right: [objects.modelname.el.content, objects.dependent.el.content, objects.independent.el.content, 
		
				objects.curv_test_degree.el.content,
				 objects.model_degree.el.content,
				 
               // objects.nointercept.el.content, 
				
				objects.axialCenterPointRowsChk.el.content, 
				
				objects.effectsplot.el.content, 
				
				objects.generateplotchk.el.content,
				
				//objects.weights.el.content, 
				
				objects.showModelEquationChk.el.content,
				
				objects.twoLevelDesignTypeChk.el.content,
				
				objects.AliasChk.el.content,
				objects.AliasCodedChk.el.content,
				
				objects.DanielplotChk.el.content,
				objects.DanielplotCodeChk.el.content,
				objects.DanielplotHalfChk.el.content,
				objects.DanielplotAlpha.el.content,
				
				objects.MEPlotChk.el.content,
				
				objects.IAPlotChk.el.content,
				objects.IAPlotShowAliasChk.el.content,
				
				objects.cubePlotChk.el.content,
				objects.cubePlotModelMeanChk.el.content,
				objects.cubePlotIndependent.el.content], 
		
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
