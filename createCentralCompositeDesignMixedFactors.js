/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */

var localization = {
    en: {
        title: "Create CCD (Quantitative and Discrete factors) or just add center points to a design",
        navigation: "Create CCD or Add center points (Mixed Factors)",
        
		datasetname: "Design name",
		
        datasetFrF2 : "Select an exisiting Full Factorial or Fractional Factorial (FrF2) design with Mixed Factors - Quantitative and Discrete",
        
		addStarPointChk: "(Uncheck) to only add center points and not add any axial/star points",
		alpha: "Number of star points(alpha)",
        alphalbl: "type in orthogonal, rotatable, or an integer number that indicates the position of the star points",
        
        numOfCenterPts: "Number of center points (to be added to the cube and to the star/axial block), or optionally two numbers seperated by comma (to specify center points for the cube and the star block)",
		
		blockName: "Name of the block", 

        lbl1 : "You may not need to change the randomization settings",
        randomseeds : "Seed for randomization",
        randomizationChk:"Randomize the design generation",
		
		help: {
            title: "Create Central Composite (Quantitative) Design from an exsiting FF or FrF2 Design or just add center points",
            //r_help: "help(ccd.augment, package = DoE.wrapper)",
			body: `
				<b>Description</b></br>
				Augment an existing full factorial or fractional factorial with star portions, or just add center points or additional center points if some center points already in the design without adding any axial/star points 
				<br/>
				<br/>
				To try this, you may use the sample dataset file called factors for FrF2 design for CCD.xlsx. Open the file in the data grid with file open menu
				<br/>
				Create the FrF2 design first (with the 4 factors) - choose option number of runs as 0 and resolution as 5.
				Then ceate the central composite design from the above FrF2 design keeping all the deafult options on this central composite design dialog/UI  
				<br/>
				<br/>
				Center point specification:
			<br/>
			<br/>
			Quick Guide:
			<br/>
			<br/>
			ncenter = 5
			<br/>
			Add 5 center points per categorical combination to both the cube block and the star block.
			<br/>
			ncenter = c(5, 3)
			<br/>
			Set cube block to have 5 center points per categorical combination (adding more if needed), and add 3 center points per categorical combination to the star block.
			<br/>
			<br/>
			Note: If you have no categorical factors, "per combination" simply means the total number of centers.
			<br/>
			<br/>
			Examples:
			<br/>
			4 categorical combos: ncenter = 5 adds 20 to cube (5×4) and 20 to star (5×4)
			<br/>
			No categorical factors: ncenter = 5 adds 5 to cube and 5 to star
			<br/>
			4 combos: ncenter = c(6, 3) ensures cube has 24 total (6×4), star gets 12 (3×4)
			<br/>
			<br/>
			CASE 1: Design has NO existing center points
			<br/>
			Input: factorial design, 0 centers
			<br/>
			ccd.augment.enhanced(factorial_no_centers, ncenter = 4, add.star = TRUE)
			<br/>
			Interpretation: "Add 4 centers per combo to cube, add 4 per combo to star"
			<br/>
			<br/>
			What happens:
			<br/>
			Adds 4 center points per categorical combination to cube
			<br/>
			Creates CCD with 4 center points per categorical combination in star block
			<br/>
			<br/>
			Result for NUMERIC ONLY (3 factors):
			<br/>
			8 factorial runs
			<br/>
			4 centers in cube
			<br/>
			6 axial points (2 per factor × 3 factors)
			<br/>
			4 centers in star block
			<br/>
			Total: 8 + 4 + 6 + 4 = 22 runs
			<br/>
			<br/>
			Result for MIXED (3 numeric + 1 categorical with 2 levels):
			<br/>
			16 factorial runs (8 × 2 combinations)
			<br/>
			8 centers in cube (4 per combo × 2 combinations)
			<br/>
			12 axial points (6 × 2 combinations)
			<br/>
			8 centers in star (4 per combo × 2 combinations)
			<br/>
			Total: 16 + 8 + 12 + 8 = 44 runs
			<br/>
			<br/>
			CASE 2: Design HAS existing center points (e.g., 5 per combo = 10 total for 2 combos)
			<br/>
			<br/>
			Input: design with 10 existing centers (5 per combo × 2 combinations)
			<br/>
			ccd.augment.enhanced(design_with_10_centers, ncenter = 4, add.star = TRUE)
			<br/>
			Interpretation: "Add 4 MORE centers per combo to cube, add 4 per combo to star"
			<br/>
			<br/>
			What happens:
			<br/>
			Message: "Design already has 10 center point(s). Adding 4 (4 × 2 combos = 8 total) more."
			<br/>
			Adds 4 MORE center points per categorical combination to cube (total = 9 per combo)
			<br/>
			Creates CCD with 4 centers per combo in star block
			<br/>
			<br/>
			Result for NUMERIC ONLY (3 factors):
			<br/>
			8 factorial runs
			<br/>
			9 centers in cube (5 existing + 4 added)
			<br/>
			6 axial points
			<br/>
			4 centers in star
			<br/>
			Total: 8 + 9 + 6 + 4 = 27 runs
			<br/>
			<br/>
			Result for MIXED (3 numeric + 1 categorical with 2 levels):
			<br/>
			16 factorial runs
			<br/>
			18 centers in cube (10 existing + 8 added = 9 per combo × 2 combinations)
			<br/>
			12 axial points
			<br/>
			8 centers in star (4 per combo × 2 combinations)
			<br/>
			Total: 16 + 18 + 12 + 8 = 54 runs
			<br/>
			<br/>
			Key Point:
			<br/>
			With a single value (ncenter = 4):
			<br/>
			Always means "ADD 4 per combo" when design has existing centers
			<br/>
			Cube gets 4 per combo added (or 4 per combo total if no existing)
			<br/>
			Star gets 4 per combo added
			<br/>
			<br/>
			Explanation for ncenter = c(x, y):
			<br/>
			<br/>
			CASE 1: Design has NO existing center points
			<br/>
			<br/>
			Input: factorial design, 0 centers
			<br/>
			ccd.augment.enhanced(factorial_no_centers, ncenter = c(4, 6), add.star = TRUE)
			<br/>
			Interpretation: "I want 4 centers per combo in cube, add 6 per combo to star"
			<br/>
			<br/>
			What happens:
			<br/>
			x = 4: Add 4 center points per combo to cube (since 0 exist, add 4 per combo)
			<br/>
			y = 6: Add 6 center points per combo to star block
			<br/>
			<br/>
			Result for NUMERIC ONLY (3 factors):
			<br/>
			8 factorial runs
			<br/>
			4 centers in cube
			<br/>
			6 axial points (2 per factor × 3 factors)
			<br/>
			6 centers in star block
			<br/>
			Total: 8 + 4 + 6 + 6 = 24 runs
			<br/>
			<br/>
			Result for MIXED (3 numeric + 1 categorical with 2 levels):
			<br/>
			16 factorial runs (8 × 2 combinations)
			<br/>
			8 centers in cube (4 per combo × 2 combinations)
			<br/>
			12 axial points (6 × 2 combinations)
			<br/>
			12 centers in star (6 per combo × 2 combinations)
			<br/>
			Total: 16 + 8 + 12 + 12 = 48 runs
			<br/>
			<br/>
			CASE 2: Design HAS 5 per combo existing center points (10 total for 2 combos)
			<br/>
			<br/>
			Input: design with 10 existing centers (5 per combo × 2 combinations)
			<br/>
			ccd.augment.enhanced(design_with_10_centers, ncenter = c(4, 6), add.star = TRUE)
			<br/>
			Interpretation: "I want 4 per combo in cube total, add 6 per combo to star"
			<br/>
			<br/>
			What happens:
			<br/>
			x = 4: Design has 5 per combo, but I want 4 per combo total
			<br/>
			ERROR! Cannot reduce centers: "cube has 5 per combo but ncenter[1] = 4 per combo"
			<br/>
			<br/>
			CASE 3: Design HAS 5 per combo existing, want to ADD more
			<br/>
			<br/>
			Input: design with 10 existing centers (5 per combo × 2 combinations)
			<br/>
			ccd.augment.enhanced(design_with_10_centers, ncenter = c(7, 6), add.star = TRUE)
			<br/>
			Interpretation: "I want 7 per combo in cube total, add 6 per combo to star"
			<br/>
			<br/>
			What happens:
			<br/>
			x = 7: Design has 5 per combo, want 7 per combo total → Add 2 per combo
			<br/>
			Message: "Cube has 10 centers (5 per combo). Adding 4 (2 per combo × 2 combos) more to reach 14 total (7 per combo)."
			<br/>
			y = 6: Add 6 center points per combo to star block
			<br/>
			<br/>
			Result for NUMERIC ONLY (3 factors):
			<br/>
			8 factorial runs
			<br/>
			7 centers in cube (5 existing + 2 added)
			<br/>
			6 axial points
			<br/>
			6 centers in star
			<br/>
			Total: 8 + 7 + 6 + 6 = 27 runs
			<br/>
			<br/>
			Result for MIXED (3 numeric + 1 categorical with 2 levels):
			<br/>
			16 factorial runs
			<br/>
			14 centers in cube (10 existing + 4 added = 7 per combo × 2 combinations)
			<br/>
			12 axial points
			<br/>
			12 centers in star (6 per combo × 2 combinations)
			<br/>
			Total: 16 + 14 + 12 + 12 = 54 runs
			<br/>
			<br/>
			CASE 4: Design HAS 5 per combo existing, just add axial (no new cube centers)
			<br/>
			<br/>
			Input: design with 10 existing centers (5 per combo × 2 combinations)
			<br/>
			ccd.augment.enhanced(design_with_10_centers, ncenter = c(5, 0), add.star = TRUE)
			<br/>
			Interpretation: "Keep 5 per combo in cube, add 0 per combo to star"
			<br/>
			<br/>
			What happens:
			<br/>
			x = 5: Design has 5 per combo, want 5 per combo → No change
			<br/>
			No message (matches existing)
			<br/>
			y = 0: Add 0 center points to star block (just axial)
			<br/>
			<br/>
			Result for NUMERIC ONLY (3 factors):
			<br/>
			8 factorial runs
			<br/>
			5 centers in cube (unchanged)
			<br/>
			6 axial points
			<br/>
			0 centers in star
			<br/>
			Total: 8 + 5 + 6 + 0 = 19 runs
			<br/>
			<br/>
			Result for MIXED (3 numeric + 1 categorical with 2 levels):
			<br/>
			16 factorial runs
			<br/>
			10 centers in cube (5 per combo × 2 combinations, unchanged)
			<br/>
			12 axial points
			<br/>
			0 centers in star
			<br/>
			Total: 16 + 10 + 12 + 0 = 38 runs
			<br/>
			<br/>
			Key principle for ncenter = c(x, y):
			<br/>
			x = desired centers PER COMBO in cube (will add if needed, error if x < existing per combo)
			<br/>
			y = centers PER COMBO to add in star (always added)
			<br/>
			Both values are interpreted as per-combo for consistency
			<br/>
			<br/>
			<br/>
			<br/>
			`
		},
    }
}

class createCentralCompositeDesignMixedFactors extends baseModal {
    constructor() {
        var config = {
            id: "createCentralCompositeDesignMixedFactors",
            label: localization.en.title,
            modalType: "two",
            RCode: `
            require(DoE.wrapper)
		
			bsky_extract_base_type <- function(type_string) {
						  # Helper function to extract base design type
						  base <- gsub(" with center points.*$", "", type_string)
						  base <- gsub(" ccd.*$", "", base)
						  base <- gsub(" with categorical factors.*$", "", base)
						  base <- trimws(base)
						  return(base)
			}

			bsky_ccd_augment_enhanced <- function(cube, ncenter = 4, columns = "all", 
																				  block.name = "Block.ccd",
																				  alpha = "orthogonal", randomize = TRUE, 
																				  seed = NULL, 
																				  inscribed = FALSE,
																				  add.star = TRUE,  # NEW: control whether to add axial points
																				  ...) {
						  creator <- sys.call()

						  di <- design.info(cube)
						  
						  # Validation checks
						  if (length(grep("splitplot", di$type)) > 0)
							stop("ccd.augment does not work for split-plot designs")
						  
						  # Check if design is already a CCD (has axial points)
						  is_already_ccd <- grepl("ccd", di$type, ignore.case = TRUE)
						  has_axial <- !is.null(di$nstar) && di$nstar > 0
						  
						  # IMPROVED: Accept factorial designs with or without center points
						  # Also accept CCD designs (for adding centers only when add.star = FALSE)
						  is_valid_factorial <- (substr(di$type, 1, 4) == "FrF2" | 
												 length(grep("factorial", di$type)) > 0)
						  
						  # CCD designs are valid inputs ONLY for add.star = FALSE (adding centers only)
						  # Must still satisfy: FrF2/factorial origin, all factors 2-level
						  # Do NOT rely on di$n_numeric_factors as CCD may have been created by
						  # DoE.wrapper or another external function that doesn't set this attribute
						  is_valid_ccd <- is_already_ccd && 
										  all(di$nlevels == 2) &&            # All factors are 2-level
										  (
											# Type string indicates factorial origin
											length(grep("factorial", di$type)) > 0 |
											substr(di$type, 1, 4) == "FrF2"  |
											# OR has standard CCD structure (ncube and nstar both present)
											(!is.null(di$nstar) && !is.null(di$ncube))
										  )
						  
						  if (!is_valid_factorial && !is_valid_ccd) {
							stop("this is not a regular (fractional) factorial 2-level design")
						  }
						  
						  # All factors must have exactly 2 levels
						  if (!all(di$nlevels == 2)) {
							stop("this is not a regular (fractional) factorial 2-level design")
						  }
						  
						  if (!columns == "all")
							stop("columns has not yet been implemented")
						  
						  # Block adding axial points to existing CCD
						  if ((is_already_ccd || has_axial) && add.star) {
							stop(paste("Design is already a CCD with axial points (nstar =", di$nstar, ").\n",
									   "Cannot augment with more axial points. Options:\n",
									   "  1. To add only center points: Uncehck the only add center points option\n",
									   "  2. To create a new CCD: start from the original factorial design\n",
									   "  Current design type:", di$type))
						  }
						  
						  if (!is.numeric(ncenter))
							stop("ncenter must be numeric")
						  if (!all(ncenter == floor(ncenter)))
							stop("ncenter must be integer")
							
						  
						  if (length(grep("blocked", di$type)) > 0) {
							
							# Only check if both exist
							if (!is.null(di$bbreps) && !is.null(di$wbreps)) {
							  if (di$bbreps * di$wbreps > 1)
								stop("replicated blocked designs can not yet be treated with function ccd.augment")
							}
						  }
						  
						  
						  # KEY ENHANCEMENT: Identify numeric vs categorical factors
						  factor.names <- di$factor.names
						  nfactors <- di$nfactors
						  
						  
						  # Determine which factors are numeric (2-level -1/+1 coded) vs categorical
						  
						  is_numeric_factor <- sapply(names(factor.names), function(fname) {
							factor_levels <- factor.names[[fname]]
							
							# Check if the factor levels are numeric or can be treated as numeric
							if (length(factor_levels) == 2) {
							  # Try to coerce to numeric
							  suppressWarnings({
								num_vals <- as.numeric(as.character(factor_levels))
							  })
							  # If both values successfully convert to numeric, treat as numeric factor
							  return(!any(is.na(num_vals)))
							}
							return(FALSE)
						  })
						  
						  
						  numeric_factors <- names(factor.names)[is_numeric_factor]
						  categorical_factors <- names(factor.names)[!is_numeric_factor]
						  
						  
						  n_numeric <- length(numeric_factors)
						  n_categorical <- length(categorical_factors)
						  
						  
						  if (n_numeric == 0) {
							stop("Design must have at least one numeric factor for CCD augmentation")
						  }
						  
						  
						  # Detect if design already has center points
						  # Check actual count, not just type string (type might be "ccd" without "center" in it)
						  existing_center_count <- if (!is.null(di$ncenter)) di$ncenter else 0
						  has_existing_centers <- existing_center_count > 0
						  
						  
						  # Handle center points for original cube
						  # CASE 1: Design has NO center points yet
						  
						  
						  if (!has_existing_centers) {
							
							if (n_categorical > 0) {
							  # Manual center point addition for mixed designs
							  # Get all unique categorical combinations
							  cat_combos <- unique(cube[, categorical_factors, drop = FALSE])
							  n_cat_combos <- nrow(cat_combos)
							  
							  # FIX: Convert numeric factors to numeric type FIRST to avoid factor level warnings
							  for (nf in numeric_factors) {
								cube[[nf]] <- as.numeric(as.character(cube[[nf]]))
							  }
							  
							  # Create center points: midpoint for numeric factors, 
							  # replicated across all categorical combinations
							  center_points <- NULL
							  for (i in 1:n_cat_combos) {
								for (j in 1:ncenter[1]) {
								  center_row <- cube[1, , drop = FALSE]  # Template row
								  
								  # Set numeric factors to their midpoint
								  for (nf in numeric_factors) {
									# Calculate midpoint in natural units
									factor_levels <- factor.names[[nf]]
									midpoint_val <- mean(as.numeric(as.character(factor_levels)))
									center_row[[nf]] <- midpoint_val  # Now assigning to numeric column
								  }
								  
								  # Set categorical factors to this combination's values
								  for (cf in categorical_factors) {
									center_row[[cf]] <- cat_combos[i, cf]
								  }
								  
								  # Set response columns to NA
								  factor_cols <- names(di$factor.names)
								  all_cols <- colnames(cube)
								  # Exclude factors and block column if it exists
								  block_col <- if (!is.null(di$block.name) && di$block.name %in% all_cols) di$block.name else NULL
								  response_cols <- setdiff(all_cols, c(factor_cols, block_col))
								  for (rc in response_cols) {
									center_row[[rc]] <- NA
								  }
								  
								  center_points <- rbind(center_points, center_row)
								}
							  }
							  
							  # Ensure center_points numeric columns are numeric (already should be)
							  for (nf in numeric_factors) {
								center_points[[nf]] <- as.numeric(center_points[[nf]])
							  }
							  
							  # Combine cube and center points
							  cube <- rbind(cube, center_points)
							  
							  # Update design.info manually
							  base_type <- bsky_extract_base_type(di$type)
							  di$type <- paste(base_type, "with center points")
							  di$ncenter <- ncenter[1] * n_cat_combos  # FIX: Total centers for categorical
							  di$ncube <- nrow(cube) - nrow(center_points)
							  di$nruns <- nrow(cube)
							  design.info(cube) <- di
							  
							} else {
							  # No categorical factors - manual center point addition
							  
							  # Convert numeric factors to numeric type
							  for (nf in numeric_factors) {
								cube[[nf]] <- as.numeric(as.character(cube[[nf]]))
							  }
							  
							  # Create center points
							  center_points <- NULL
							  for (j in 1:ncenter[1]) {
								center_row <- cube[1, , drop = FALSE]  # Template row
								
								# Set numeric factors to their midpoint
								for (nf in numeric_factors) {
								  factor_levels <- factor.names[[nf]]
								  midpoint_val <- mean(as.numeric(as.character(factor_levels)))
								  center_row[[nf]] <- midpoint_val
								}
								
								# Set response columns to NA
								factor_cols <- names(di$factor.names)
								all_cols <- colnames(cube)
								# Exclude factors and block column if it exists
								  block_col <- if (!is.null(di$block.name) && di$block.name %in% all_cols) di$block.name else NULL
								  response_cols <- setdiff(all_cols, c(factor_cols, block_col))
								for (rc in response_cols) {
								  center_row[[rc]] <- NA
								}
								
								center_points <- rbind(center_points, center_row)
							  }
							  
							  # Ensure center_points numeric columns are numeric
							  for (nf in numeric_factors) {
								center_points[[nf]] <- as.numeric(center_points[[nf]])
							  }
							  
							  # Combine cube and center points
							  cube <- rbind(cube, center_points)
							  
							  # Restore design class (rbind strips it)
							  class(cube) <- c("design", "data.frame")
							  
							  
							  # Update design.info manually
							  base_type <- bsky_extract_base_type(di$type)
							  di$type <- paste(base_type, "with center points")
							  di$ncenter <- ncenter[1]
							  di$ncube <- nrow(cube) - nrow(center_points)
							  di$nruns <- nrow(cube)
							  
							  
							  # Remove coding formulas - they may have wrong environment references
							  di$coding <- NULL
							  
							  design.info(cube) <- di
							  
							}
							
						  # CASE 2: Design ALREADY has center points - add MORE if requested  
						  } else if (length(ncenter) == 1 && ncenter > 0) {
							# User wants to add MORE center points to existing design
							
							
							if (n_categorical > 0) {
							  cat_combos <- unique(cube[, categorical_factors, drop = FALSE])
							  n_cat_combos <- nrow(cat_combos)
							  actual_to_add <- ncenter * n_cat_combos
							  
							  message(paste("Design already has", existing_center_count, "center point(s).",
											"Adding", ncenter, 
											paste0("(", ncenter, " x ", n_cat_combos, " combos = ", actual_to_add, " total)"),
											"more."))
							} else {
							  message(paste("Design already has", existing_center_count, 
											"center point(s). Adding", ncenter, "more."))
							}
							
							
							if (n_categorical > 0) {
							  # Manual addition for categorical designs
							  cat_combos <- unique(cube[, categorical_factors, drop = FALSE])
							  n_cat_combos <- nrow(cat_combos)
							  
							  # FIX: Convert numeric factors to numeric type FIRST
							  for (nf in numeric_factors) {
								cube[[nf]] <- as.numeric(as.character(cube[[nf]]))
							  }
							  
							  additional_centers <- NULL
							  for (i in 1:n_cat_combos) {
								for (j in 1:ncenter) {
								  center_row <- cube[1, , drop = FALSE]
								  
								  for (nf in numeric_factors) {
									factor_levels <- factor.names[[nf]]
									midpoint_val <- mean(as.numeric(as.character(factor_levels)))
									center_row[[nf]] <- midpoint_val
								  }
								  
								  for (cf in categorical_factors) {
									center_row[[cf]] <- cat_combos[i, cf]
								  }
								  
								  # Set response columns to NA
								  factor_cols <- names(di$factor.names)
								  all_cols <- colnames(cube)
								  # Exclude factors and block column if it exists
								  block_col <- if (!is.null(di$block.name) && di$block.name %in% all_cols) di$block.name else NULL
								  response_cols <- setdiff(all_cols, c(factor_cols, block_col))
								  for (rc in response_cols) {
									center_row[[rc]] <- NA
								  }
								  
								  additional_centers <- rbind(additional_centers, center_row)
								}
							  }
							  
							  # Ensure additional_centers numeric columns are numeric
							  for (nf in numeric_factors) {
								additional_centers[[nf]] <- as.numeric(additional_centers[[nf]])
							  }
							  
							  cube <- rbind(cube, additional_centers)
							  
							} else {
							  # No categorical - manual addition (can't use add.center on design with centers)
							  
							  
							  # FIX: Convert numeric factors to numeric type FIRST
							  for (nf in numeric_factors) {
								cube[[nf]] <- as.numeric(as.character(cube[[nf]]))
							  }
							  
							  additional_centers <- NULL
							  for (j in 1:ncenter) {
								center_row <- cube[1, , drop = FALSE]
								
								# Set numeric factors to their midpoint
								for (nf in numeric_factors) {
								  factor_levels <- factor.names[[nf]]
								  midpoint_val <- mean(as.numeric(as.character(factor_levels)))
								  center_row[[nf]] <- midpoint_val
								}
								
								# Set response columns to NA
								factor_cols <- names(di$factor.names)
								all_cols <- colnames(cube)
								# Exclude factors and block column if it exists
								  block_col <- if (!is.null(di$block.name) && di$block.name %in% all_cols) di$block.name else NULL
								  response_cols <- setdiff(all_cols, c(factor_cols, block_col))
								for (rc in response_cols) {
								  center_row[[rc]] <- NA
								}
								
								additional_centers <- rbind(additional_centers, center_row)
							  }
							  
							  # Ensure additional_centers numeric columns are numeric
							  for (nf in numeric_factors) {
								additional_centers[[nf]] <- as.numeric(additional_centers[[nf]])
							  }
							  
							  
							  cube <- rbind(cube, additional_centers)
							  
							}
							
							# Update design.info manually - rbind doesn't update it automatically
							# FIX: Account for categorical expansion
							# IMPORTANT: Preserve ncube and nstar!
							
							# Calculate new ncenter value
							if (n_categorical > 0) {
							  cat_combos_check <- unique(cube[, categorical_factors, drop = FALSE])
							  n_cat_combos_check <- nrow(cat_combos_check)
							  actual_added <- ncenter * n_cat_combos_check
							  di$ncenter <- existing_center_count + actual_added
							} else {
							  di$ncenter <- existing_center_count + ncenter
							}
							di$nruns <- nrow(cube)
							
							# CRITICAL: Preserve ncube and nstar - they should NOT change when adding centers!
							# ncube was already set correctly earlier
							# nstar should be preserved from original design (if it exists)
							# Don't recalculate them here
							
							
							# Restore design class (rbind strips it)
							class(cube) <- c("design", "data.frame")
							
							# Remove coding formulas - they may have wrong environment references
							di$coding <- NULL
							
							design.info(cube) <- di
						  }
						  
						  # If not adding star points, return now with just the centers
						  if (!add.star) {
							# Reload di to ensure it's current
							di <- design.info(cube)
							
							# Update design type if needed
							# IMPORTANT: Preserve "ccd" in type if it already exists
							is_already_ccd <- grepl("ccd", di$type, ignore.case = TRUE)
							
							if (is_already_ccd) {
							  # Already a CCD - preserve that in the type
							  # Type should remain "... ccd" or "... ccd with center points"
							  # Don't change it unless it's missing "with center points"
							  if (length(grep("with center points", di$type)) == 0 && di$ncenter > 0) {
								# Has centers but type doesn't say so - add it
								# But preserve "ccd"
								di$type <- paste(di$type, "with center points")
							  }
							  # else: already correct, leave as is
							} else {
							  # Not a CCD yet - just adding centers to factorial
							  base_type <- bsky_extract_base_type(di$type)
							  if (length(grep("with center points", di$type)) == 0) {
								di$type <- paste(base_type, "with center points")
							  }
							}
							
							# Handle Block column if it exists
							if (block.name %in% colnames(cube)) {
							  # Block column exists - need to set block for new center points
							  n_original <- if (!is.null(di$ncube)) di$ncube else 0
							  n_total_before_new_centers <- n_original + existing_center_count
							  n_new_centers <- nrow(cube) - n_total_before_new_centers
							  
							  if (n_new_centers > 0) {
								# Determine which block to assign new centers to
								# If there are existing star points (nstar > 0), new centers go to block 2
								# Otherwise they go to block 1
								new_center_block <- if (!is.null(di$nstar) && di$nstar > 0) 2 else 1
								
								# Set block for new center rows
								new_center_rows <- (n_total_before_new_centers + 1):nrow(cube)
								cube[[block.name]][new_center_rows] <- new_center_block
							  }
							}
							
							# FIX: Set design attributes correctly for center-only designs
							# IMPORTANT: Don't reset nstar to 0 if it already exists!
							# Preserve existing nstar for CCDs
							if (is.null(di$nstar)) {
							  di$nstar <- 0  # Only set to 0 if it doesn't exist yet
							}
							# else: preserve existing nstar value (design is already a CCD)
							
							di$add_star <- FALSE
							
							# FIX: ncube should be the factorial portion (never changes)
							# If design already had centers, ncube was already set correctly
							# Only calculate if this is a fresh design (no existing centers)
							if (!has_existing_centers && existing_center_count == 0) {
							  di$ncube <- nrow(cube) - di$ncenter
							}
							# else: preserve existing di$ncube value
							
							di$nruns <- nrow(cube)
							
							# Preserve other attributes
							di$n_numeric_factors <- n_numeric
							di$n_categorical_factors <- n_categorical
							di$numeric_factors <- numeric_factors
							di$categorical_factors <- categorical_factors
							
							# FIX: Update run.order to match new dimensions
							current_run_order <- run.order(cube)
							n_original <- nrow(current_run_order)
							n_total <- nrow(cube)
							
							if (n_total > n_original) {
							  # Centers were added - extend run.order
							  new_rows <- n_total - n_original
							  
							  # Create additional run order rows matching the structure of existing
							  # Check if columns are factors or integers
							  additional_run_order <- data.frame(
								run.no.in.std.order = (n_original + 1):n_total,
								run.no = (n_original + 1):n_total,
								run.no.std.rp = (n_original + 1):n_total,
								stringsAsFactors = FALSE
							  )
							  
							  # Convert to match the type of existing run.order columns
							  if (is.factor(current_run_order$run.no.in.std.order)) {
								additional_run_order$run.no.in.std.order <- as.character(additional_run_order$run.no.in.std.order)
							  }
							  if (is.factor(current_run_order$run.no.std.rp)) {
								additional_run_order$run.no.std.rp <- as.character(additional_run_order$run.no.std.rp)
							  }
							  
							  # Combine - this will coerce factors to character if needed
							  combined_run_order <- rbind(
								data.frame(
								  run.no.in.std.order = as.character(current_run_order$run.no.in.std.order),
								  run.no = current_run_order$run.no,
								  run.no.std.rp = as.character(current_run_order$run.no.std.rp),
								  stringsAsFactors = FALSE
								),
								additional_run_order
							  )
							  
							  run.order(cube) <- combined_run_order
							}
							
							# FIX: Update desnum to match new dimensions
							# For center points, coded values are all 0
							tryCatch({
							  current_desnum <- desnum(cube)
							  
							  if (!is.null(current_desnum) && nrow(current_desnum) < nrow(cube)) {
								# Need to add rows for center points
								new_rows <- nrow(cube) - nrow(current_desnum)
								# Center points have all coded values = 0
								center_coded <- matrix(0, nrow = new_rows, ncol = ncol(current_desnum))
								colnames(center_coded) <- colnames(current_desnum)
								rownames(center_coded) <- (nrow(current_desnum) + 1):nrow(cube)
								
								combined_desnum <- rbind(current_desnum, center_coded)
								desnum(cube) <- combined_desnum
							  }
							}, error = function(e) {
							  # Skip desnum regeneration - it's causing issues
							  # The desnum can be regenerated later if needed
							})
							
							
							
							design.info(cube) <- di
							
							di_check <- design.info(cube)
							
							# Print summary for add.star = FALSE case
							cat("\n=== CCD Augmentation Summary ===\n")
							cat("Design type:", di$type, "\n")
							cat("Total runs:", di$nruns, "\n\n")
							
							if (n_categorical > 0) {
							  cat_combos <- unique(cube[, categorical_factors, drop = FALSE])
							  n_cat_combos <- nrow(cat_combos)
							  cat("Categorical factors:", n_categorical, 
								  paste0("(", paste(categorical_factors, collapse=", "), ")"), "\n")
							  cat("Categorical combinations:", n_cat_combos, "\n\n")
							}
							
							# Original design info
							if (has_existing_centers || existing_center_count > 0) {
							  if (n_categorical > 0) {
								cat_combos <- unique(cube[, categorical_factors, drop = FALSE])
								n_cat_combos <- nrow(cat_combos)
								centers_per_combo_orig <- existing_center_count / n_cat_combos
								cat("Original design:\n")
								cat("  - Factorial runs:", di$ncube, "\n")
								cat("  - Center points:", existing_center_count, 
									paste0("(", centers_per_combo_orig, " per combo x ", n_cat_combos, " combos)"), "\n\n")
							  } else {
								cat("Original design:\n")
								cat("  - Factorial runs:", di$ncube, "\n")
								cat("  - Center points:", existing_center_count, "\n\n")
							  }
							} else {
							  cat("Original design:\n")
							  cat("  - Factorial runs:", di$ncube, "\n")
							  cat("  - Center points: 0\n\n")
							}
							
							# New additions (centers only, no star)
							cat("Additions:\n")
							cube_centers_added <- di$ncenter - existing_center_count
							if (cube_centers_added > 0) {
							  if (n_categorical > 0) {
								cat_combos <- unique(cube[, categorical_factors, drop = FALSE])
								n_cat_combos <- nrow(cat_combos)
								centers_per_combo <- cube_centers_added / n_cat_combos
								cat("  - Cube center points added:", cube_centers_added,
									paste0("(", centers_per_combo, " per combo x ", n_cat_combos, " combos)"), "\n")
							  } else {
								cat("  - Cube center points added:", cube_centers_added, "\n")
							  }
							} else {
							  cat("  - No new points added\n")
							}
							
							# Final totals
							cat("\nFinal design:\n")
							cat("  - Factorial runs:", di$ncube, "\n")
							cat("  - Total center points:", di$ncenter, "\n")
							
							# If design has star points, show them
							if (!is.null(di$nstar) && di$nstar > 0) {
							  cat("  - Total star points:", di$nstar, "(axial only, no new star centers added)\n")
							}
							
							cat("  - Total runs:", di$nruns, "\n")
							#cat("================================")
							
							return(cube)
						  }
						  
						  # Identify additional variables (response columns, etc.)
						  more <- setdiff(colnames(cube), c(names(di$factor.names), di$block.name))
						  moredn <- more
						  planvars <- colnames(cube)
						  
						  if (length(more) > 0) {
							addedvars <- cube[, more, drop = FALSE]
							planvars <- setdiff(planvars, more)
						  }
						  
						  
						  # Handle ncenter - adjust for CCD generation
						  # By this point, cube should have the right number of centers
						  # ncenter needs to be in c(cube_centers, star_centers) format for CCD generation
						  
						  di_temp <- design.info(cube)
						  
						  current_center_count <- if (!is.null(di_temp$ncenter)) di_temp$ncenter else 0
						  
						  len_nc <- length(ncenter)
						  
						  if (len_nc == 1) {
							# Single value: use it for both cube (current total) and star (new to add)
							ncenter <- c(current_center_count, ncenter)
						  } else if (len_nc == 2) {
							# Two values: c(per_combo_in_cube, per_combo_in_star)
							# CHANGED: For consistency, interpret both as per-combo values
							per_combo_cube_desired <- ncenter[1]
							per_combo_star <- ncenter[2]
							
							# Calculate existing per-combo count
							if (n_categorical > 0) {
							  cat_combos <- unique(cube[, categorical_factors, drop = FALSE])
							  n_cat_combos <- nrow(cat_combos)
							  existing_per_combo <- current_center_count / n_cat_combos
							  
							  # Check if user wants more per combo than currently exists
							  if (per_combo_cube_desired > existing_per_combo) {
								# Need to add more
								per_combo_to_add <- per_combo_cube_desired - existing_per_combo
								total_to_add <- per_combo_to_add * n_cat_combos
								desired_cube_total <- current_center_count + total_to_add
								
								message(paste("Cube has", current_center_count, "centers",
											  paste0("(", existing_per_combo, " per combo)."),
											  "Adding", total_to_add,
											  paste0("(", per_combo_to_add, " per combo x ", n_cat_combos, " combos)"),
											  "more to reach", desired_cube_total, "total",
											  paste0("(", per_combo_cube_desired, " per combo).")))
								
								centers_to_add_cube <- total_to_add
							  } else if (per_combo_cube_desired < existing_per_combo) {
								stop(paste("Cannot reduce centers: cube has", existing_per_combo,
										   "per combo but ncenter[1] =", per_combo_cube_desired, "per combo"))
							  } else {
								# Equal - no change needed
								centers_to_add_cube <- 0
								desired_cube_total <- current_center_count
							  }
							  
							  star_to_add <- per_combo_star  # Will be expanded by combos later
							  
							} else {
							  # No categorical factors - per-combo is same as total
							  desired_cube_total <- per_combo_cube_desired
							  star_to_add <- per_combo_star
							  
							  if (desired_cube_total > current_center_count) {
								centers_to_add_cube <- desired_cube_total - current_center_count
								message(paste("Cube has", current_center_count, "centers.",
											  "Adding", centers_to_add_cube, "more to reach", 
											  desired_cube_total, "total."))
							  } else if (desired_cube_total < current_center_count) {
								stop(paste("Cannot reduce centers: cube has", current_center_count,
										   "but ncenter[1] =", desired_cube_total))
							  } else {
								centers_to_add_cube <- 0
							  }
							}
							
							if (centers_to_add_cube > 0) {
							  
							  # Add the additional centers (reuse CASE 2 logic)
							  if (n_categorical > 0) {
								cat_combos <- unique(cube[, categorical_factors, drop = FALSE])
								n_cat_combos <- nrow(cat_combos)
								
								# Calculate how many to add per combo
								centers_per_combo_to_add <- centers_to_add_cube / n_cat_combos
								
								# FIX: Convert to numeric first
								for (nf in numeric_factors) {
								  cube[[nf]] <- as.numeric(as.character(cube[[nf]]))
								}
								
								additional_centers <- NULL
								for (i in 1:n_cat_combos) {
								  for (j in 1:centers_per_combo_to_add) {
									center_row <- cube[1, , drop = FALSE]
									for (nf in numeric_factors) {
									  factor_levels <- factor.names[[nf]]
									  midpoint_val <- mean(as.numeric(as.character(factor_levels)))
									  center_row[[nf]] <- midpoint_val
									}
									for (cf in categorical_factors) {
									  center_row[[cf]] <- cat_combos[i, cf]
									}
									additional_centers <- rbind(additional_centers, center_row)
								  }
								}
								for (nf in numeric_factors) {
								  additional_centers[[nf]] <- as.numeric(additional_centers[[nf]])
								}
								cube <- rbind(cube, additional_centers)
							  } else {
								# FIX: Convert to numeric first
								for (nf in numeric_factors) {
								  cube[[nf]] <- as.numeric(as.character(cube[[nf]]))
								}
								
								additional_centers <- NULL
								for (j in 1:centers_to_add_cube) {
								  center_row <- cube[1, , drop = FALSE]
								  for (nf in numeric_factors) {
									factor_levels <- factor.names[[nf]]
									midpoint_val <- mean(as.numeric(as.character(factor_levels)))
									center_row[[nf]] <- midpoint_val
								  }
								  additional_centers <- rbind(additional_centers, center_row)
								}
								for (nf in numeric_factors) {
								  additional_centers[[nf]] <- as.numeric(additional_centers[[nf]])
								}
								cube <- rbind(cube, additional_centers)
							  }
							  
							  # Update design.info
							  # centers_to_add_cube is already the total (not per-combo) for categorical
							  di$ncenter <- current_center_count + centers_to_add_cube
							  di$nruns <- nrow(cube)
							  design.info(cube) <- di
							  current_center_count <- di$ncenter  # Update to actual count
							  
							} else if (desired_cube_total < current_center_count) {
							  stop(paste("Cannot reduce centers: cube has", current_center_count,
										 "but ncenter[1] =", desired_cube_total))
							}
							# else: desired_cube_total == current_center_count, no change needed
							
							ncenter <- c(current_center_count, star_to_add)
						  } else {
							stop("ncenter must have one or two elements")
						  }
						  
						  
						  # Extract star centers for later use in block assignment
						  centers_to_add_star <- ncenter[2]
						  
						  
						  bbreps <- di$bbreps
						  
						  if (is.null(bbreps)) {
							if (!di$repeat.only) {
							  bbreps <- di$replications
							} else {
							  stop("designs with repeat.only replications cannot be augmented to become ccd designs")
							}
						  }
						  
						  
						  wbreps <- di$wbreps
						  
						  if (is.null(wbreps)) {
							wbreps <- 1
						  }
						  
						  
						  # CRITICAL FIX: n.c and k should be based on NUMERIC factors only
						  n.c <- 2^n_numeric  # Number of factorial runs for numeric factors only
						  k <- n_numeric      # Number of numeric factors
						  
						  # Handle generators for fractional factorial designs
						  
						  if (substr(di$type, 1, 4) == "FrF2") {
							# Original design was FrF2 - need to extract generators for numeric factors
							
							if (n_categorical > 0) {
							  # For mixed designs, extract the unique numeric factor combinations
							  
							  numeric_design <- unique(cube[, numeric_factors, drop = FALSE])
							  
							  n_unique_numeric <- nrow(numeric_design)
							  
							  if (n_unique_numeric < 2^n_numeric) {
								# Numeric portion is fractional - need generators
								tryCatch({
								  generators <- DoE.wrapper:::generators.from.design(cube)
								}, error = function(e) {
								  warning("Could not extract generators from FrF2 design. Using full factorial assumption.")
								  generators <- "full factorial"
								})
							  } else {
								generators <- "full factorial"
							  }
							} else {
							  # Pure numeric FrF2 design
							  if (nfactors > k) {
								tryCatch({
								  generators <- DoE.wrapper:::generators.from.design(cube)
								}, error = function(e) {
								  warning("Could not extract generators from FrF2 design. Using full factorial assumption.")
								  generators <- "full factorial"
								})
							  } else {
								generators <- "full factorial"
							  }
							}
						  } else {
							generators <- "full factorial"
						  }
						  
						  
						  if (randomize & !is.null(seed))
							set.seed(seed)
						  
						  
						  if (length(grep("estimable", di$type)) > 0) {
							map <- di$map
						  } else {
							map <- list(1:nfactors)
						  }
						  
						  
						  # KEY ENHANCEMENT: Create CCD using ONLY numeric factors
						  
						  numeric_factor_indices <- which(is_numeric_factor)
						  
						  # Create factor.names list for numeric factors only
						  
						  numeric_factor_names <- factor.names[numeric_factors]
						  
						  # Generate the CCD design for numeric factors
						  
						  if (is.null(di$block.gen)) {
							
							if (!k >= n_numeric) {
							  # For fractional factorial case
							  numeric_generators <- generators
							  
							  aus <- bsky_ccd_1_41_enhanced(k, generators = numeric_generators, 
														blocks = block.name,
														n0 = ncenter, alpha = alpha, wbreps = wbreps,
														bbreps = bbreps, randomize = randomize, 
														coding = make.formulas(paste("x", 1:n_numeric, sep = ""), 
																			   numeric_factor_names))
							} else {
							  
							  if (k >= n_numeric) {
								wbreps <- 2^(k - n_numeric) * wbreps
							  }
							  
							  
							  coding_formulas <- make.formulas(paste("x", 1:n_numeric, sep = ""), 
															   numeric_factor_names)
							  
							  aus <- bsky_ccd_1_41_enhanced(n_numeric, blocks = block.name, n0 = ncenter,
														alpha = alpha, wbreps = wbreps, bbreps = bbreps,
														randomize = randomize, 
														coding = coding_formulas)
							}
						  } else {
							# Handle blocked designs
							block.form <- di$block.gen
							if (is.vector(block.form))
							  block.form <- Yates[block.form]
							block.form <- paste("c(", paste(sapply(block.form, function(obj) 
							  paste(paste("x", obj, sep = ""), collapse = "*")), collapse = ","), ")")
							
							if (!k >= n_numeric) {
							  numeric_generators <- generators
							  aus <- bsky_ccd_1_41_enhanced(k, generators = numeric_generators, 
														blocks = as.formula(paste(block.name, block.form, sep = "~")),
														n0 = ncenter, alpha = alpha,
														wbreps = wbreps, bbreps = bbreps, randomize = randomize,
														coding = make.formulas(paste("x", 1:n_numeric, sep = ""),
																			   numeric_factor_names))
							} else {
							  if (k > n_numeric)
								wbreps <- 2^(k - n_numeric) * wbreps
							  aus <- bsky_ccd_1_41_enhanced(n_numeric, 
														blocks = as.formula(paste(block.name, block.form, sep = "~")),
														n0 = ncenter, alpha = alpha,
														wbreps = wbreps, bbreps = bbreps, randomize = randomize,
														coding = make.formulas(paste("x", 1:n_numeric, sep = ""),
																			   numeric_factor_names))
							}
						  }
						  
						  
						  # Determine block structure
						  if (is.null(di$blocks))
							nblocks <- 1
						  else nblocks <- di$nblocks
						  
						  
						  # Identify star points in the numeric-only design
						  
						  if (add.star) {
							
							star.points <- ((n.c * wbreps + ncenter[1] * nblocks) * bbreps + 1):nrow(aus)
						  } else {
							star.points <- integer(0)  # Empty vector when no star points
						  }
						  
						  
						  # KEY ENHANCEMENT: Expand design by all combinations of categorical factors
						  if (n_categorical > 0) {
							# Get all unique combinations of categorical factors
							cat_combos <- unique(cube[, categorical_factors, drop = FALSE])
							n_cat_combos <- nrow(cat_combos)
							
							if (add.star) {
							  # Add axial (star) points
							  star_design <- decode.data(aus)[star.points, -1]  # Remove block column
							  
							  # Rename columns to match the actual numeric factor names
							  colnames(star_design) <- numeric_factors
							  
							  # Expand star points by categorical combinations
							  expanded_star <- NULL
							  for (i in 1:n_cat_combos) {
								temp_star <- star_design
								# Add categorical factor values
								for (cat_factor in categorical_factors) {
								  temp_star[[cat_factor]] <- cat_combos[i, cat_factor]
								}
								expanded_star <- rbind(expanded_star, temp_star)
							  }
							  
							  # Add any extra columns (response variables, etc.) as NA if they exist in cube
							  if (length(more) > 0) {
								for (col in more) {
								  expanded_star[[col]] <- NA
								}
							  }
							  
							  # Combine with original cube
							  col_order <- c(names(factor.names), more)
							  design <- rbind(cube[, col_order, drop = FALSE], 
											  expanded_star[, col_order, drop = FALSE])
							} else {
							  # Skip axial points - just use the cube with center points
							  col_order <- c(names(factor.names), more)
							  design <- cube[, col_order, drop = FALSE]
							  expanded_star <- NULL
							}
							
							# Row names: Use simple sequential numbering
							n_cube_total <- nrow(cube)
							n_star_total <- if (is.null(expanded_star)) 0 else nrow(expanded_star)
							
							rownames(design) <- 1:(n_cube_total + n_star_total)
							
							# Add block column
							# Use actual row counts instead of recalculating
							current_di <- design.info(cube)
							total_centers_in_cube <- if (!is.null(current_di$ncenter)) current_di$ncenter else 0
							n_factorial_in_cube <- nrow(cube) - total_centers_in_cube
							n_center_in_cube <- total_centers_in_cube
							
							# Assign blocks:
							# 1. Original factorial runs: block 1
							factorial_blocks <- rep(1, n_factorial_in_cube)
							
							# 2. Center points in cube: block 1 or 2 based on whether we're adding star centers
							if (add.star && centers_to_add_star > 0) {
							  center_blocks <- rep(2, n_center_in_cube)
							} else {
							  center_blocks <- rep(1, n_center_in_cube)
							}
							
							if (add.star) {
							  # Convert block factor to numeric to find max
							  block_vals <- as.numeric(as.character(aus[[block.name]]))
							  max_block <- max(block_vals)
							  
							  # Star points get new blocks for each categorical combination
							  star_blocks <- rep(max_block + 1:n_cat_combos, each = length(star.points))
							  
							  design <- cbind(
								c(factorial_blocks, center_blocks, star_blocks),
								design
							  )
							} else {
							  # No star points - just factorial and center blocks
							  design <- cbind(
								c(factorial_blocks, center_blocks),
								design
							  )
							}
							colnames(design)[1] <- block.name
							
						  } else {
							# No categorical factors case
							
							if (add.star) {
							  
							  # Combine cube with star points from CCD
							  decoded_aus <- decode.data(aus)
							  
							  design <- decoded_aus[, -1]
							  
							  if (length(more) > 0) {
								na_matrix <- matrix(NA, nrow = nrow(design), ncol = length(more))
								colnames(na_matrix) <- more  # FIX: Give the NA columns proper names!
								design <- cbind(design, na_matrix)
							  }
							  
							  
							  design <- rbind(cube[, c(names(factor.names), more)], design[star.points, ])
							  design <- cbind(aus[[block.name]], design)
							  colnames(design)[1] <- block.name
							  
							  # Use simple sequential row numbering
							  rownames(design) <- 1:nrow(design)
							} else {
							  # No star points - just cube with center points
							  col_order <- c(names(factor.names), more)
							  design <- cube[, col_order, drop = FALSE]
							  
							  # Don't add block column when just adding centers
							  rownames(design) <- 1:nrow(design)
							}
						  }
						  
						  # Create coded design matrix
						  desnum <- coded.data(design, formulas = attr(aus, "coding"))
						  class(design) <- c("design", "data.frame")
						  attr(desnum, "codings") <- NULL
						  desnum <- model.matrix(~., model.frame(~., desnum, na.action = na.pass))[, -1]
						  
						  # Set column names based on whether block column exists
						  if (add.star && block.name %in% colnames(design)) {
							colnames(desnum)[1] <- block.name
							colnames(desnum)[2:(1 + nfactors)] <- names(factor.names)
						  } else {
							colnames(desnum)[1:nfactors] <- names(factor.names)
						  }
						  desnum(design) <- desnum
						  
						  # Update run order
						  run.order(design) <- data.frame(
							run.no.in.std.order = 1:nrow(design),
							run.no = 1:nrow(design), 
							run.no.std.rp = 1:nrow(design),
							stringsAsFactors = FALSE
						  )
						  
						  # Update design info - FIX: Handle both add.star cases correctly
						  base_type <- bsky_extract_base_type(di$type)
						  
						  if (add.star) {
							if (n_categorical > 0) {
							  di$type <- paste(base_type, "ccd with categorical factors")
							} else {
							  di$type <- paste(base_type, "ccd")
							}
							di$nstar <- length(star.points) * (if (n_categorical > 0 && length(star.points) > 0) n_cat_combos else 1)
							
							# FIX: Get ACTUAL total centers from cube, not the requested value
							# After adding centers, cube's design.info has the true count
							actual_cube_centers <- if (!is.null(design.info(cube)$ncenter)) design.info(cube)$ncenter else 0
							di$ncenter <- actual_cube_centers
							
							di$block.name <- block.name
							di$coding <- lapply(attr(aus, "coding"), "as.formula", env = NULL)
						  } else {
							# This code should never execute since we return early above
							# But keeping for safety
							if (length(grep("with center points", di$type)) == 0) {
							  di$type <- paste(base_type, "with center points")
							}
							di$nstar <- 0
							di$block.name <- NULL
							# Preserve original coding when no star points
						  }
						  
						  di$cube.gen <- generators
						  di$creator <- append(di$creator, creator)
						  di$nruns <- nrow(design)
						  
						  # Calculate ncube correctly
						  if (n_categorical > 0) {
							# For categorical designs, ncube is the factorial portion (excluding centers and stars)
							# Original factorial runs
							cat_combos <- unique(cube[, categorical_factors, drop = FALSE])
							n_cat_combos <- nrow(cat_combos)
							n_factorial <- 2^n_numeric * n_cat_combos
							di$ncube <- n_factorial
						  } else {
							# For non-categorical, it's just the 2^k factorial portion
							di$ncube <- 2^n_numeric
						  }
						  
						  di$n_numeric_factors <- n_numeric
						  di$n_categorical_factors <- n_categorical
						  di$numeric_factors <- numeric_factors
						  di$categorical_factors <- categorical_factors
						  di$add_star <- add.star
						  
						  design.info(design) <- di
						  
						  # Print summary
						  cat("\n=== CCD Augmentation Summary ===\n")
						  cat("Design type:", di$type, "\n")
						  cat("Total runs:", di$nruns, "\n\n")
						  
						  if (n_categorical > 0) {
							cat("Categorical factors:", n_categorical, 
								paste0("(", paste(categorical_factors, collapse=", "), ")"), "\n")
							cat("Categorical combinations:", n_cat_combos, "\n\n")
						  }
						  
						  # Original design info
						  if (has_existing_centers || existing_center_count > 0) {
							if (n_categorical > 0) {
							  centers_per_combo_orig <- existing_center_count / n_cat_combos
							  cat("Original design:\n")
							  cat("  - Factorial runs:", di$ncube, "\n")
							  cat("  - Center points:", existing_center_count, 
								  paste0("(", centers_per_combo_orig, " per combo x ", n_cat_combos, " combos)"), "\n\n")
							} else {
							  cat("Original design:\n")
							  cat("  - Factorial runs:", di$ncube, "\n")
							  cat("  - Center points:", existing_center_count, "\n\n")
							}
						  } else {
							cat("Original design:\n")
							cat("  - Factorial runs:", di$ncube, "\n")
							cat("  - Center points: 0\n\n")
						  }
						  
						  # New additions
						  cat("Additions:\n")
						  
						  # Cube centers added
						  cube_centers_added <- di$ncenter - existing_center_count
						  if (cube_centers_added > 0) {
							if (n_categorical > 0) {
							  centers_per_combo <- cube_centers_added / n_cat_combos
							  cat("  - Cube center points added:", cube_centers_added,
								  paste0("(", centers_per_combo, " per combo x ", n_cat_combos, " combos)"), "\n")
							} else {
							  cat("  - Cube center points added:", cube_centers_added, "\n")
							}
						  }
						  
						  # Star points added
						  if (add.star) {
							# Calculate star centers and axial separately
							n_axial_base <- 2 * n_numeric  # 2 per numeric factor
							if (n_categorical > 0) {
							  n_axial_total <- n_axial_base * n_cat_combos
							  n_star_centers <- centers_to_add_star * n_cat_combos
							  
							  cat("  - Axial points added:", n_axial_total,
								  paste0("(", n_axial_base, " per combo x ", n_cat_combos, " combos)"), "\n")
							  cat("  - Star center points added:", n_star_centers,
								  paste0("(", centers_to_add_star, " per combo x ", n_cat_combos, " combos)"), "\n")
							} else {
							  cat("  - Axial points added:", n_axial_base, 
								  paste0("(2 per numeric factor x ", n_numeric, " factors)"), "\n")
							  cat("  - Star center points added:", centers_to_add_star, "\n")
							}
						  }
						  
						  # Final totals
						  cat("\nFinal design:\n")
						  cat("  - Factorial runs:", di$ncube, "\n")
						  cat("  - Total center points:", di$ncenter, "\n")
						  if (add.star) {
							cat("  - Total star points:", di$nstar, "(axial + star centers)\n")
						  }
						  cat("  - Total runs:", di$nruns, "\n")
						  #cat("================================")
						  
						  design
			}


			bsky_ccd_1_41_enhanced <- function(basis, generators, blocks = "Block", n0 = 4, 
															   alpha = "orthogonal",
															   wbreps = 1, bbreps = 1, randomize = TRUE, 
															   inscribed = FALSE,
															   coding, new.style = FALSE) {
					  # This function remains largely the same as original
					  # It creates the CCD for numeric factors only
					  
					  if (inherits(basis, "formula"))
						xvars = all.vars(basis[[length(basis)]])
					  else if (is.numeric(basis))
						xvars = paste("x", 1:basis, sep = "")
					  else stop("'basis' must be an integer or a formula")
					  
					  args = lapply(xvars, function(nm) c(-1, 1))
					  names(args) = xvars
					  cube = do.call(expand.grid, args)
					  
					  if (!missing(generators)) {
						if (!is.list(generators))
						  generators = list(generators)
						for (gen in generators) {
						  gen = as.character(gen)
						  cube[[gen[[2]]]] = with(cube, eval(parse(text = as.character(gen[[3]]))))
						}
					  }
					  
					  k = ncol(cube)
					  star = as.data.frame(matrix(0, nrow = 2 * k, ncol = k))
					  xvars = names(star) = names(cube)
					  for (j in 1:k) star[c(2 * j - 1, 2 * j), j] = c(-1, 1)
					  
					  if (length(wbreps) == 1)
						wbreps = rep(wbreps, 2)
					  if (length(bbreps) == 1)
						bbreps = rep(bbreps, 2)
					  
					  if (wbreps[1] > 1)
						cube = cube[rep(1:nrow(cube), wbreps[1]), ]
					  if (wbreps[2] > 1)
						star = star[rep(1:nrow(star), wbreps[2]), ]
					  
					  if (is.character(blocks)) {
						blknm = blocks
						nblev = 1
						blk = rep(1, nrow(cube))
						chkterm = ""
					  } else if (inherits(blocks, "formula")) {
						blknm = as.character(blocks[[2]])
						what = as.character(blocks[[3]][[1]])
						if (what == "*")
						  gens = as.character(blocks[3])
						else gens = as.character(blocks[[3]])[-1]
						bgen = lapply(gens, function(g) with(cube, eval(parse(text = g))))
						blk = as.numeric(factor(do.call(paste, bgen)))
						nblev = max(blk)
						chkterm = "factor(blk) + "
					  } else stop("'blocks' must be a string or a formula")
					  
					  v = paste(names(cube), collapse = ",")
					  fake.resp = rnorm(nrow(cube))
					  fstg = paste("fake.resp ~", chkterm, "FO(", v, ") + TWI(", v, ")")
					  modl = lm(formula(fstg), data = cube)
					  
					  if (any(is.na(coef(modl))))
						warning("Some 1st or 2nd-order terms are aliased in the cube portion of this design")
					  
					  zero = as.data.frame(matrix(rep(0, k), nrow = 1))
					  names(zero) = names(cube)
					  
					  if (length(n0) == 1)
						n0 = c(n0, n0)
					  
					  if (n0[1] > 0) {
						cube = rbind(cube, zero[rep(1, nblev * n0[1]), ])
						blk = c(blk, rep(unique(blk), n0[1]))
					  }
					  if (n0[2] > 0)
						star = rbind(star, zero[rep(1, n0[2]), ])
					  
					  nc = nrow(cube)
					  if (bbreps[1] > 1) {
						cube = cube[rep(1:nc, bbreps[1]), ]
						blk = nblev * rep(0:(bbreps[1] - 1), rep(nc, bbreps[1])) + rep(blk, bbreps[1])
						nblev = max(blk)
					  }
					  
					  ns = nrow(star)
					  if (bbreps[2] > 1)
						star = star[rep(1:ns, bbreps[2]), ]
					  sblk = rep((1 + nblev):(bbreps[2] + nblev), rep(ns, bbreps[2]))
					  
					  if (is.character(alpha)) {
						c.ii = sum(cube[[1]]^2)
						s.ii = sum(star[[1]]^2)
						what = pmatch(alpha, c("rotatable", "orthogonal"))
						if (is.na(what))
						  stop("alpha must be 'rotatable', 'orthogonal', or a value")
						if (what == 1)
						  alpha = (2 * c.ii/s.ii)^0.25
						else alpha = sqrt(nrow(star)/s.ii * c.ii/nrow(cube))
					  }
					  
					  if (inscribed)
						cube = cube/alpha
					  else star = star * alpha
					  
					  cube = cbind(blk, cube)
					  star = cbind(sblk, star)
					  names(cube)[1] = names(star)[1] = blknm
					  
					  ord = order(blk, 1:nrow(cube))
					  cube = cube[ord, ]
					  blk = blk[ord]
					  
					  row.names(cube) = paste("C", blk, ".", rep(1:(nrow(cube)/nblev), nblev), sep = "")
					  row.names(star) = paste("S", sblk, ".", rep(1:(nrow(star)/bbreps[2]), bbreps[2]), sep = "")
					  
					  des = rbind(cube, star)
					  
					  if (inherits(basis, "formula") & (length(basis) > 2)) {
						yvars = all.vars(basis[[2]])
						for (v in yvars) des[[v]] = NA
					  }
					  
					  stdord = 1:nrow(des)
					  if (randomize) {
						ord = order(des[[1]] + runif(nrow(des)))
						des = des[ord, ]
						stdord = stdord[ord]
					  }
					  
					  des[[1]] = factor(des[[1]])
					  
					  if (!missing(coding)) {
						des = as.coded.data(des, formulas = coding)
						if (!new.style)
						  attr(des, "rsdes") = NULL
					  }
					  
					  if (new.style) {
						if (missing(coding))
						  coding = sapply(xvars, function(v) as.formula(paste(v, "~", v, ".as.is", sep = "")))
						des = .randomize(as.coded.data(des, formulas = coding), randomize = FALSE)
						des$std.order = stdord
					  }
					
					  des
			}


		
		#############################################
		### Main flow starts here 
		#############################################
		
		if("design" %in% class({{selected.datasetFrF2 | safe}}) &&  grepl("FrF2|pb|full factorial", attr({{selected.datasetFrF2 | safe}}, "design.info")$type))
		{
		
			{{selected.datasetname | safe}} = bsky_ccd_augment_enhanced(cube = {{selected.datasetFrF2 | safe}}, 
										ncenter = c({{selected.numOfCenterPts | safe}}), 
										columns="all", 
										block.name=c('{{selected.blockName | safe}}'),
										add.star = {{selected.addStarPointChk | safe}},
										alpha = c('{{selected.alpha | safe}}'), 
										{{if(options.selected.randomseeds !== "")}} 
										seed= {{selected.randomseeds | safe}},
										{{/if}}
										randomize={{selected.randomizationChk | safe}} 
										)
										
			BSkyLoadRefresh('{{selected.datasetname | safe}}')
			
		}else
		{
			cat("\n Selected design", '{{selected.datasetFrF2 | safe}}', "is not a FrF2 design object\n")
		}

    `
        }
        var objects = {
            dataset_var: { el: new srcDataSetList(config, { action: "move" }) },
       
            datasetname: {
                el: new input(config, {
                    no: 'datasetname',
                    label: localization.en.datasetname,
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    overwrite: "dataset",
                    value: ""
                })
            },
			datasetFrF2: {
                el: new dstVariable(config, {
                    label: localization.en.datasetFrF2,
                    no: "datasetFrF2",
                    filter: "Dataset",
                    //extraction: "UseComma|Enclosed",
					extraction: "ValueAsIs",
                    required: true,
                })
            },
			addStarPointChk: { 
                el: new checkbox(config, {
                    label: localization.en.addStarPointChk, 
					no: "addStarPointChk",
                    bs_type: "valuebox",
					required: false,
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					state: "checked",
					newline: true,
                })
            },
            alpha: {
                el: new input(config, {
                    no: "alpha",
                    label: localization.en.alpha,
                    placeholder: "orthogonal",
                    allow_spaces:true,
                    extraction: "NoPrefix|UseComma",
					style: "ml-5",
                    value: "orthogonal"
                })
            },                
			numOfCenterPts: {
                el: new input(config, {
                    no: 'numOfCenterPts',
                    label: localization.en.numOfCenterPts,
					allow_spaces:true,
                    placeholder: "",
                    extraction: "TextAsIs",
                    value: "4",
					//style: "ml-5 mb-1",
                })
            },
			blockName: {
                el: new input(config, {
                    no: 'blockName',
                    label: localization.en.blockName,
                    placeholder: "",
                    //required: true,
                    extraction: "TextAsIs",
                    value: "Block.ccd",
					style: "ml-5",
					width: "w-50",
                })
            },    
			
            randomseeds: {
                el: new inputSpinner(config, {
                    no: 'randomseeds',
                    label: localization.en.randomseeds,
                    //required: true,
                    //min: 1,
                    max: 99999,
                    step: 1,
                    value: "",
					style: "ml-5",
                })
            },            
            alphalbl: { el: new labelVar(config, { label: localization.en.alphalbl, style: "mt-3 ml-5",h: 6 }) },
            lbl1: { el: new labelVar(config, { label: localization.en.lbl1, style: "mt-3",h: 6 }) },

            randomizationChk: { 
				el: new checkbox(config, { 
					label: localization.en.randomizationChk, 
					no: "randomizationChk", 
					extraction: "Boolean", 
					state: "checked",
					newline: false, 
					//style: "ml-5",
				}) 
			},
        }
        const content = {
            left: [objects.dataset_var.el.content],
            right: [ objects.datasetname.el.content,
                objects.datasetFrF2.el.content,
                objects.numOfCenterPts.el.content,
				
				objects.addStarPointChk.el.content,
				objects.blockName.el.content, 
				objects.alphalbl.el.content,
                objects.alpha.el.content,
				
                objects.lbl1.el.content,
				objects.randomizationChk.el.content,
                objects.randomseeds.el.content],
            nav: {
                name: localization.en.navigation,
                icon: "icon-doe",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
		this.help = localization.en.help;
    }
}
module.exports.item = new createCentralCompositeDesignMixedFactors().render()