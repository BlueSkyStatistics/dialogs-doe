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
require(FrF2)

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
					
				###############################################
               # Main flow starts here
               ###############################################	
						
				bsky_design_only_factorial_rows = {{dataset.name}}
				
				if(c("design") %in% class({{dataset.name}}))
				{
					{{if(options.selected.axialCenterPointRowsChk == "TRUE")}}
							   #bsky_summarize_design_point_rows will return the design after any star/center/cube row count repairs in the design info section
								{{dataset.name}}  = bsky_summarize_design_point_rows({{dataset.name}})	
					{{/if}}
					
					# ------------------------------- 
					# Detect factorial/cube points and discard center and axial points
					# -------------------------------
					{{if(options.selected.excludeCenterAxialPointsChk == "TRUE")}}
							bsky_design_only_factorial_rows = {{dataset.name}}[bsky_identify_factorial_points({{dataset.name}}), , drop = FALSE]
							cat("Creating the linear model {{selected.modelname | safe}}", "only with the cube/factorial rows after removing the center points and axial points, if any\n")
					{{#else}}
							cat("Creating the linear model {{selected.modelname | safe}}", "with the entire dataset {{dataset.name}}\n")
					{{/if}}
				} else{
					{{if(options.selected.excludeCenterAxialPointsChk == "TRUE")}}
						cat("{{dataset.name}} not a design data type. No center and axial point can be detected\n") 
					{{/if}}
					cat("Creating the linear model {{selected.modelname | safe}}", "with the entire dataset {{dataset.name}}\n")
				}

					#Creating the model
					{{selected.modelname | safe}} = lm({{selected.dependent | safe}}~{{selected.formula | safe}}, {{selected.weights | safe}} na.action=na.exclude, data=bsky_design_only_factorial_rows)
					
					local ({
					#Display theoretical model equation and coefficients
					#Display theoretical model
					reg_formula = equatiomatic::extract_eq({{selected.modelname | safe}}, raw_tex = FALSE,\n\t wrap = TRUE,  intercept = "alpha", ital_vars = FALSE) 
					BSkyFormat(reg_formula)
					#Display coefficients
					reg_equation = equatiomatic::extract_eq({{selected.modelname | safe}}, use_coefs = TRUE,\n\t wrap = TRUE,ital_vars = FALSE, coef_digits = BSkyGetDecimalDigitSetting() )
					BSkyFormat(reg_equation)
					#Summarizing the model
					BSky_LM_Summary_{{selected.modelname | safe}} = summary({{selected.modelname | safe}})
					# Computing 95% confidence interval of the coefficients
					# BSky_LM_Summary_{{selected.modelname | safe}}$coefficients<- cbind ( BSky_LM_Summary_{{selected.modelname | safe}}$coefficients, stats::confint({{selected.modelname | safe}},level=0.95,type="LR")[rowSums(is.na(stats::confint({{selected.modelname | safe}},level=0.95,type="LR"))) != ncol(stats::confint({{selected.modelname | safe}},level=0.95,type="LR")), ])
					BSkyFormat(BSky_LM_Summary_{{selected.modelname | safe}}, singleTableOutputHeader = "Model Summary")
					#Displaying the Anova table
					AnovaRes = anova({{selected.modelname | safe}} )
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

					{{if (options.selected.unusualObservations == "TRUE")}}#Fit and diagnostics for unusual observations\nBSkyUnusualObs({{selected.modelname | safe}},{{dataset.name}}\${{selected.dependent | safe}},"{{selected.dependent | safe}}" ){{/if}}



					#remove(BSky_LM_Summary_{{selected.modelname | safe}})
					#remove({{selected.modelname | safe}})
					{{if (options.selected.generateplotchk == "TRUE")}}#displaying plots\n#Plots residuals vs. fitted, normal Q-Q, scale-location, residuals vs. leverage\nplot({{selected.modelname | safe}}){{/if}}

#Adding attributes to support scoring
#We don't add dependent and independent variables as this is handled by our functions
attr(.GlobalEnv\${{selected.modelname | safe}},"classDepVar")= class({{dataset.name}}[, c("{{selected.dependent | safe}}")])
attr(.GlobalEnv\${{selected.modelname | safe}},"depVarSample")= sample({{dataset.name}}[, c("{{selected.dependent | safe}}")], size = 2, replace = TRUE)
})
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
                    value: "LinearRegModel1",
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
					style: "mb-3",
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
					style: "mb-3",
					newline: true,
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
            unusualObservations: {
                el: new checkbox(config, {
                    label: linearRegressionDoE.t('unusualObservations'),
                    no: "unusualObservations",
                    style: "mt-2 mb-3",
                    bs_type: "valuebox",
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
                }), r: ['{{ var | safe}}']
            },
        };
        const content = {
            left: [objects.content_var.el.content],
            right: [
				objects.modelname.el.content, 
				objects.dependent.el.content, 
				objects.formulaBuilder.el.content, 
				
				objects.axialCenterPointRowsChk.el.content,
				objects.excludeCenterAxialPointsChk.el.content,
				
				objects.generateplotchk.el.content, 
				objects.unusualObservations.el.content,
				objects.weights.el.content
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
