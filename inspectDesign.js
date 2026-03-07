/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */




class inspectDesign extends baseModal {
    static dialogId = 'inspectDesign'
    static t = baseModal.makeT(inspectDesign.dialogId)

    constructor() {
        var config = {
            id: inspectDesign.dialogId,
            label: inspectDesign.t('title'),
            modalType: "one",
            RCode: `
				
				require(DoE.base)
				 require(DoE.wrapper)
				
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
					
				###############################################
               # Main flow starts here
               ###############################################	
				
				if(c("design") %in% class({{dataset.name}}))
				{
					
					{{if(options.selected.responseVariablesChk == "TRUE")}}
						BSkyFormat(paste("Design Type:", attributes({{dataset.name}})$design.info$type,"and Number of Runs:", attributes({{dataset.name}})$design.info$nruns))
						BSkyFormat(paste("Response variable(s):", paste(response.names({{dataset.name}}), collapse=", ")))
					{{/if}}
					
					{{if(options.selected.axialCenterPointRowsChk == "TRUE")}}
					   #bsky_summarize_design_point_rows will return the design after any star/center/cube row count repairs in the design info section
						{{dataset.name}}  = bsky_summarize_design_point_rows({{dataset.name}}, tol = 1e-8)
					{{/if}}
					
					
					{{if(options.selected.printDesignChk == "TRUE")}}
						no_list_elements <- sapply(attributes({{dataset.name}})$design.info$factor.names, length)
						seq.max <- seq_len(max(no_list_elements))
						factor_matrix <- sapply(attributes({{dataset.name}})$design.info$factor.names, "[", i = seq.max)
						factor_matrix[is.na(factor_matrix)] = c(" ")

						#BSkyFormat(as.data.frame(attributes({{dataset.name}})$design.info$factor.names), outputTableRenames = "Factors Used to Create the Design")
						BSkyFormat(factor_matrix, outputTableRenames = "Factors Used to Create the Design")
						
						{{if(options.selected.printDesignWithRunOrderChk == "TRUE")}}
							combinedDesignFrame = cbind(run.order({{dataset.name}})[,c(2,1,3)], as.data.frame( {{dataset.name}} ))
							row.names(combinedDesignFrame) = c()
						{{#else}}
							combinedDesignFrame = as.data.frame( {{dataset.name}} )
						{{/if}}
								
						BSkyFormat(combinedDesignFrame, outputTableRenames = paste("Design Type:", attributes({{dataset.name}})$design.info$type,"and Number of Runs:", attributes({{dataset.name}})$design.info$nruns))
					{{/if}}
					
					
					{{if(options.selected.summarizeBriefChk == "TRUE")}}
						BSkyFormat("Design Summary (brief) for {{dataset.name}}")
						summary( {{dataset.name}} , brief = TRUE)
					{{/if}}

					
					{{if(options.selected.summarizeDetailsChk == "TRUE")}}
						BSkyFormat("Design Summary (detail) for {{dataset.name}}")
						summary( {{dataset.name}} , brief = FALSE)
					{{/if}}


					{{if(options.selected.designinfoChk == "TRUE")}}
						BSkyFormat("Design object deatils (using design.info()) for {{dataset.name}}")
						DoE.base::design.info( {{dataset.name}} )  
					{{/if}}
					
				} else
				{
					BSkyFormat("{{dataset.name}} is not a DoE design type - The requested operation cannot be performed")
				}

                `
        }
        var objects = {
			responseVariablesChk: {
                el: new checkbox(config, {
                    label: inspectDesign.t('responseVariablesChk'),
                    no: "responseVariablesChk",
                    //style: "ml-5",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					state:"checked", 
					newline: true,
                })
            },
			axialCenterPointRowsChk: {
                el: new checkbox(config, {
                    label: inspectDesign.t('axialCenterPointRowsChk'),
                    no: "axialCenterPointRowsChk",
                    //style: "ml-5",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					//state:"checked", 
					newline: true,
                })
            },
           // summarizeBrief: { el: new checkbox(config, { label: inspectDesign.t('summarizeBrief'), no: "summarizeBrief", extraction: "Boolean", newline: true }) },
            //summarizeDetails: { el: new checkbox(config, { label: inspectDesign.t('summarizeDetails'), no: "summarizeDetails", extraction: "Boolean", newline: true }) },
            //printDesign: { el: new checkbox(config, { label: inspectDesign.t('printDesign'), no: "printDesign", extraction: "Boolean", newline: true }) },
	
			summarizeBriefChk: {
                el: new checkbox(config, {
                    label: inspectDesign.t('summarizeBriefChk'),
                    no: "summarizeBriefChk",
                    //style: "ml-5",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
			summarizeDetailsChk: {
                el: new checkbox(config, {
                    label: inspectDesign.t('summarizeDetailsChk'),
                    no: "summarizeDetailsChk",
                   // style: "ml-5",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
			printDesignChk: {
                el: new checkbox(config, {
                    label: inspectDesign.t('printDesignChk'),
                    no: "printDesignChk",
                   // style: "ml-5",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
			printDesignWithRunOrderChk: {
                el: new checkbox(config, {
                    label: inspectDesign.t('printDesignWithRunOrderChk'),
                    no: "printDesignWithRunOrderChk",
                    style: "ml-5",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
			
			//designinfo: { el: new checkbox(config, { label: inspectDesign.t('designinfo'), no: "designinfo", extraction: "Boolean", newline: true }) },
			designinfoChk: {
                el: new checkbox(config, {
                    label: inspectDesign.t('designinfoChk'),
                    no: "designinfoChk",
                    //style: "ml-5",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
        }
        const content = {
            items: [ 
					 objects.responseVariablesChk.el.content, 
					 objects.axialCenterPointRowsChk.el.content,
					 objects.printDesignChk.el.content,
					 objects.printDesignWithRunOrderChk.el.content,
					 objects.summarizeBriefChk.el.content,
                     objects.summarizeDetailsChk.el.content,
                     objects.designinfoChk.el.content
					 ],
            nav: {
                name: inspectDesign.t('navigation'),
                icon: "icon-doe",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
    }
}

module.exports = {
    render: () => new inspectDesign().render()
}
