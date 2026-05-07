/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


class createCentralCompositeDesignMixedFactors extends baseModal {
    static dialogId = 'createCentralCompositeDesignMixedFactors'
    static t = baseModal.makeT(createCentralCompositeDesignMixedFactors.dialogId)

    constructor() {
        var config = {
            id: createCentralCompositeDesignMixedFactors.dialogId,
            label: createCentralCompositeDesignMixedFactors.t('title'),
            modalType: "two",
            RCode: `
            require(DoE.wrapper)
			 require(DoE.base)
		
			bsky_extract_base_type <- function(type_string) {
						  # Helper function to extract base design type
						  base <- gsub(" with center points.*$", "", type_string)
						  base <- gsub(" ccd.*$", "", base)
						  base <- gsub(" with categorical factors.*$", "", base)
						  base <- trimws(base)
						  return(base)
			}
			
			\`%||%\` <- function(a, b) if (!is.null(a)) a else b

			bsky_normalise_block_encoding <- function(design,
                                           block_col     = NULL,
                                           collapse_reps = FALSE,
                                           verbose       = TRUE) {

 

						  di <- design.info(design)

						  # ── Step 1: resolve block column name ─────────────────────────────────────
						  if (is.null(block_col)) {
							if (!is.null(di$block.name) && di$block.name %in% colnames(design)) {
							  block_col <- di$block.name
							} else {
							  factor_cols <- names(di$factor.names)
							  for (cn in colnames(design)) {
								if (cn %in% factor_cols) next
								cv <- suppressWarnings(as.numeric(as.character(design[[cn]])))
								if (any(is.na(cv))) next
								uv <- sort(unique(cv))
								if (length(uv) >= 2 && length(uv) <= 20) {
								  block_col <- cn
								  break
								}
							  }
							}
						  }

						  if (is.null(block_col)) {
							if (verbose) cat("NOTE: No block column detected. Design returned unchanged.\n")
							return(design)
						  }

						  if (!block_col %in% colnames(design)) {
							warning("Block column '", block_col, "' not found in design. Returned unchanged.")
							return(design)
						  }

						  # ── Step 2: classify the block column ─────────────────────────────────────
						  col_raw <- design[[block_col]]
						  col_num <- suppressWarnings(as.numeric(as.character(col_raw)))

						  if (any(is.na(col_num))) {
							if (verbose)
							  cat("NOTE: Block column '", block_col,
								  "' has non-numeric values. No translation applied.\n", sep = "")
							return(design)
						  }

						  dec_parts   <- round(col_num - floor(col_num), 8)
						  has_decimal <- any(dec_parts > 0)

						  if (!has_decimal) {
							# Format A - already clean integers, no translation needed
							if (verbose)
							  cat("NOTE: Block column '", block_col,
								  "' uses integer encoding (Format A: ",
								  paste(sort(unique(col_num)), collapse = ", "),
								  "). No translation needed.\n", sep = "")
							return(design)
						  }

						  # ── Step 3: classify format and build translation map ─────────────────────
						  int_parts     <- floor(col_num)
						  unique_ints   <- sort(unique(int_parts))      # original block IDs
						  unique_vals   <- sort(unique(col_num))         # all unique session values
						  n_orig_blocks <- length(unique_ints)
						  n_sessions    <- length(unique_vals)

						  is_format_b <- (length(unique_ints) == 1L && unique_ints[1] == 0L)
						  fmt_label   <- if (is_format_b)
										   "Format B (replications only, no original block structure)"
										 else
										   "Format C (block + replication encoding)"

						  if (collapse_reps && !is_format_b) {
							# Format C, collapse=TRUE: integer part -> physical block ID
							orig_to_new   <- setNames(seq_along(unique_ints), as.character(unique_ints))
							new_block_ids <- as.integer(orig_to_new[as.character(int_parts)])
							n_new_blocks  <- n_orig_blocks
							reps_per_block <- n_sessions / n_orig_blocks
							id_map <- setNames(
							  as.integer(orig_to_new[as.character(floor(unique_vals))]),
							  as.character(unique_vals)
							)
							# collapse_map: new integer session block -> physical block (used when
							# collapse_reps=FALSE was used for augmentation and we need to collapse after)
							collapse_map <- NULL   # not needed here - already collapsed

						  } else if (is_format_b && collapse_reps) {
							# Format B, collapse=TRUE: all -> Block 1 (unblocked design)
							new_block_ids <- rep(1L, length(col_num))
							n_new_blocks  <- 1L
							reps_per_block <- n_sessions
							id_map <- setNames(rep(1L, n_sessions), as.character(unique_vals))
							collapse_map <- NULL

						  } else {
							# collapse_reps=FALSE: each unique session -> own sequential integer block
							id_map        <- setNames(seq_along(unique_vals), as.character(unique_vals))
							new_block_ids <- as.integer(id_map[as.character(col_num)])
							n_new_blocks  <- n_sessions
							reps_per_block <- 1L

							# collapse_map: maps each new sequential block ID to its physical block ID
							# e.g. for Format C 2blocks x 3reps: 1->1, 2->1, 3->1, 4->2, 5->2, 6->2
							# Used by bsky_collapse_to_physical_blocks() after augmentation
							if (!is_format_b) {
							  collapse_map <- setNames(
								as.integer(seq_along(unique_ints)[
								  match(as.character(floor(unique_vals)), as.character(unique_ints))
								]),
								as.character(seq_along(unique_vals))
							  )
							} else {
							  # Format B collapse_reps=FALSE: all sessions map to block 1
							  collapse_map <- setNames(rep(1L, n_sessions), as.character(seq_along(unique_vals)))
							}
						  }

						  # ── Step 4: print translation table and model recommendation ──────────────
						  if (verbose) {
							cat("\n")
							cat("Block column  : '", block_col, "'\n", sep = "")
							cat("Encoding      : ", fmt_label, "\n", sep = "")
							cat("Strategy      : ",
								if (collapse_reps) "Collapse replications into physical blocks (analysis mode)"
								else "Each session as its own block (augmentation mode)",
								"\n", sep = "")
							# Report replication structure when detected
							if (!is_format_b && n_orig_blocks > 0 && reps_per_block > 1) {
							  cat("Replications  : ", as.integer(reps_per_block),
								  " per block x ", n_orig_blocks, " block(s) = ",
								  n_sessions, " total sessions\n", sep = "")
							} else if (is_format_b && n_sessions > 1) {
							  cat("Replications  : ", n_sessions,
								  " (no block structure - pure replications)\n", sep = "")
							}
							cat("\n")

							cat("Translation table:\n")
							cat(sprintf("  %-20s  ->  %s\n", "Original value(s)", "New Block ID"))
							cat(sprintf("  %-20s      %s\n", "-------------------", "------------"))

							if (collapse_reps && !is_format_b) {
							  for (bid in unique_ints) {
								sessions_in <- unique_vals[floor(unique_vals) == bid]
								new_id <- id_map[[as.character(sessions_in[1])]]
								cat(sprintf("  %-20s  ->  %d\n",
									paste(as.character(sessions_in), collapse = ", "), new_id))
							  }
							} else if (is_format_b && collapse_reps) {
							  cat(sprintf("  %-20s  ->  %d  (all reps - single block)\n",
								  paste(as.character(unique_vals), collapse = ", "), 1L))
							} else {
							  for (i in seq_along(unique_vals))
								cat(sprintf("  %-20s  ->  %d\n",
									as.character(unique_vals[i]), as.integer(id_map[[i]])))
							}

							cat("\nColumn changes:\n")
							cat("  '", block_col, "' overwritten in-place with integer Block IDs\n", sep = "")
							cat("  '", block_col, ".orig' appended (original decimal values preserved)\n", sep = "")

							cat("\nModel recommendation:\n")
							if (collapse_reps && !is_format_b) {
							  cat("  Include '", block_col, "' in your RSM model (represents ",
								  n_new_blocks, " physical block(s)).\n", sep = "")
							  cat("  Omit replication term - reps contribute directly to pure error.\n")
							  cat("  Y ~ ", block_col, " + FO(...) + PQ(...) + TWI(...)\n", sep = "")
							  cat("  Block df: ", n_new_blocks - 1L, "   Pure error df: n_corners x (",
								  as.integer(reps_per_block), " reps - 1)\n", sep = "")
							} else if (is_format_b && collapse_reps) {
							  cat("  No block structure - omit block term entirely.\n")
							  cat("  Y ~ FO(...) + PQ(...) + TWI(...)\n")
							} else if (is_format_b && !collapse_reps) {
							  # Format B, augmentation mode: 3 replications each as own session-block
							  cat("  Replication-only design (", n_sessions, " sessions = ", n_sessions,
								  " replications).\n", sep = "")
							  cat("  After augmentation, choose one of:\n")
							  cat("    (a) Sessions were identical conditions (pure replication):\n")
							  cat("        Omit Block term - replications contribute to pure error.\n")
							  cat("        Y ~ FO(...) + PQ(...) + TWI(...)\n")
							  cat("    (b) Sessions may have drifted (different days/batches):\n")
							  cat("        Include Block to absorb session-to-session variation.\n")
							  cat("        Y ~ ", block_col, " + FO(...) + PQ(...) + TWI(...)\n", sep = "")
							  cat("  NOTE: bsky_collapse_to_physical_blocks() not needed for Format B.\n")
							} else {
							  # Format C, augmentation mode: sessions as own blocks, collapse_map available
							  cat("  Include '", block_col, "' in your RSM model (", n_new_blocks,
								  " session blocks).\n", sep = "")
							  cat("  Y ~ ", block_col, " + FO(...) + PQ(...) + TWI(...)\n", sep = "")
							  if (!is.null(collapse_map) && n_orig_blocks < n_new_blocks)
								cat("  TIP: After augmentation, call bsky_collapse_to_physical_blocks()\n",
									"       to collapse to ", n_orig_blocks,
									" physical block(s) for analysis (saves ",
									n_new_blocks - 1L - (n_orig_blocks - 1L), " df).\n", sep = "")
							}
							cat("\n  NOTE: Use '", block_col,
								".orig' to schedule runs - rows with the same\n", sep = "")
							cat("  original value should be run in the same experimental session.\n\n")
						  }

						  # ── Step 5: apply column changes (direct assignment only) ─────────────────
						  orig_col_name <- paste0(block_col, ".orig")
						  design[[orig_col_name]] <- col_raw          # preserves original Factor type
						  design[[block_col]]     <- new_block_ids    # clean integer IDs

						  # ── Step 6: rebuild desnum ────────────────────────────────────────────────
						  tryCatch({
							factor_cols <- names(di$factor.names)
							dm_cols <- colnames(design)[colnames(design) %in% c(block_col, factor_cols)]
							if (length(dm_cols) > 0) {
							  dm_fmla  <- as.formula(paste("~", paste(dm_cols, collapse = " + ")))
							  dm_frame <- model.frame(dm_fmla, data = design, na.action = na.pass)
							  dm <- model.matrix(dm_fmla, data = dm_frame)[, -1, drop = FALSE]
							  attr(design, "desnum") <- dm
							}
						  }, error = function(e) {
							attr(design, "desnum") <- NULL
							if (verbose)
							  message("NOTE: desnum cleared (", e$message,
									  "). DoE.base will regenerate it automatically.")
						  })

						  # ── Step 7: update design.info - all five inter-related fields ─────────────
						  # After translation the design is a straight blocked design with n_new_blocks
						  # sequential integer blocks. Setting nruns=total and bbreps=1 means:
						  #   - detection helpers see rep_scale=1 -> no per-rep division needed
						  #   - bsky_ccd_augment_enhanced sees bbreps=1 -> no phantom star blocks
						  #   - nruns==nrow(design) -> design.info<- setter validates without error
						  total_rows    <- nrow(design)
						  new_blocksize <- as.integer(round(total_rows / n_new_blocks))

						  di$block.name <- block_col
						  di$nblocks    <- n_new_blocks
						  di$nruns      <- total_rows     # total rows - matches nrow(design)
						  di$bbreps     <- 1L             # sessions now expressed as separate blocks
						  di$wbreps     <- 1L
						  di$blocksize  <- new_blocksize
						  # Update ncube to total factorial rows so CCD summary reads correct count.
						  # At normalise time no centers have been added yet, so ncube = nruns.
						  # After augmentation, bsky_identify_axial_points repair will correct this
						  # to the exact per-block-per-combo count if needed.
						  if (!is.null(di$ncube)) {
							# Was per-rep: multiply by original n_sessions to get total
							# (safer than using nruns directly in case design has existing centers)
							existing_centers_total <- if (!is.null(di$ncenter) && di$ncenter > 0)
							  di$ncenter * max(1L, di$bbreps %||% 1L)
							else 0L
							di$ncube <- as.integer(total_rows - existing_centers_total)
						  }

						  di$bsky_block_translation <- list(
							original_col   = orig_col_name,
							new_col        = block_col,
							format         = fmt_label,
							collapse_reps  = collapse_reps,
							n_orig_blocks  = n_orig_blocks,
							n_new_blocks   = n_new_blocks,
							reps_per_block = reps_per_block,
							n_sessions     = n_sessions,
							value_map      = id_map,
							collapse_map   = collapse_map   # NULL when collapse_reps=TRUE (already collapsed)
						  )
						  design.info(design) <- di

						  if (verbose) {
							cat("Result: '", block_col, "' -> ", n_new_blocks, " integer block(s);",
								" originals in '", orig_col_name, "'.\n", sep = "")
							cat("design.info: nruns=", total_rows, ", nblocks=", n_new_blocks,
								", blocksize=", new_blocksize, ", bbreps=1, wbreps=1\n\n", sep = "")
						  }

						  return(design)
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
							
						  
						  # ── Pre-process: normalise decimal block encoding ─────────────────────
						  if (exists("bsky_normalise_block_encoding")) {
						    cube <- bsky_normalise_block_encoding(cube, collapse_reps = FALSE, verbose = TRUE)
						    di <- design.info(cube)
						  }
						  # -------------------------------------------------------
						  # BLOCK NAME RESOLUTION
						  # If the input design is already blocked, inherit its existing
						  # block column name rather than using the UI default.
						  # -------------------------------------------------------
						  is_blocked_design <- length(grep("blocked", di$type)) > 0
						  if (!is_blocked_design && !is.null(di$block.name) &&
						      di$block.name %in% colnames(cube)) {
						    .bv_chk <- suppressWarnings(as.integer(as.character(cube[[di$block.name]])))
						    if (!any(is.na(.bv_chk)) && length(unique(.bv_chk)) >= 2L)
						      is_blocked_design <- TRUE
						  }
						  if (is_blocked_design) {
							existing_block_name <- NULL
							# 1. Prefer di$block.name if it points to an actual column
							if (!is.null(di$block.name) && di$block.name %in% colnames(cube)) {
								existing_block_name <- di$block.name
							} else {
								# 2. Fallback: scan for a column of consecutive integer block IDs
								for (.cn in colnames(cube)) {
									.cv_num <- suppressWarnings(as.numeric(as.character(cube[[.cn]])))
									if (!any(is.na(.cv_num))) {
										.uv <- sort(unique(.cv_num))
										if (length(.uv) >= 2 && length(.uv) <= 20 &&
										    all(.cv_num == floor(.cv_num)) &&
										    all(.uv == seq_len(length(.uv)))) {
											existing_block_name <- .cn
											break
										}
									}
								}
							}
							if (!is.null(existing_block_name)) {
								if (existing_block_name != block.name)
									cat(paste0("NOTE: Blocked design detected. Inheriting existing block column name '",
									           existing_block_name, "' instead of UI-supplied '", block.name, "'.\n"))
								block.name <- existing_block_name
								# CRITICAL: sync di$block.name so 'more' excludes the block column
								di$block.name <- existing_block_name
								design.info(cube) <- di
							} else {
								cat(paste0("NOTE: Blocked design detected but no existing block column found. ",
								           "Using UI-supplied block name '", block.name, "'.\n"))
							}

							# Validate replications
							if (!is.null(di$bbreps) && !is.null(di$wbreps)) {
								if (di$bbreps * di$wbreps > 1)
									stop(paste0(
				  "Replicated blocked design (bbreps=", di$bbreps, ").\n",
				  "Call bsky_normalise_block_encoding(cube, collapse_reps=FALSE) before augmenting."))
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
						  # Capture FACTORIAL row count now: after existing_center_count is known
						  # but before any new rows are added. Subtracting existing centers gives
						  # the true factorial count regardless of whether centers already exist.
						  .bsky_n_original_rows <- nrow(cube) - existing_center_count

						  # ── Helper: backfill Blocks.orig for newly added rows ─────────────
						  # Rows added by augmentation (centers, axial) get NA in Blocks.orig
						  # because they were not in the original design. This helper fills
						  # those NAs using the reverse of the value_map so the experimenter
						  # knows which session each new row belongs to for scheduling.
						  bsky_backfill_blocks_orig <- function(df, tr, numeric_factors = NULL) {
						    # Fills Blocks.orig for rows added by augmentation:
						    #   - Center/factorial rows get their original session decimal (e.g. '1.1', '2.3')
						    #     via the reverse of the value_map stored by bsky_normalise_block_encoding.
						    #   - Star block rows have no original session — they are a new session.
						    #     Axial points   -> 's.N'   (e.g. 's.1' for the first star block)
						    #     Star centers   -> 's.c.N' (e.g. 's.c.1')
						    #     where N = star block sequence number (relative to the original blocks).
						    if (is.null(tr)) return(df)
						    orig_col <- tr$original_col
						    new_col  <- tr$new_col
						    vmap     <- tr$value_map
						    if (is.null(orig_col) || !orig_col %in% colnames(df)) return(df)
						    if (is.null(new_col)  || !new_col  %in% colnames(df)) return(df)
						    # Coerce to character to avoid factor level issues
						    df[[orig_col]] <- as.character(df[[orig_col]])
						    na_rows <- which(is.na(df[[orig_col]]))
						    if (length(na_rows) == 0) return(df)
						    # Reverse map: integer block ID -> original decimal string
						    # Only maps IDs that existed in the original design.
						    # New star block IDs (> max original) return NA from this lookup.
						    rev_map  <- setNames(names(vmap), as.character(vmap))
						    max_orig <- max(as.integer(vmap), na.rm = TRUE)  # highest original block ID
						    block_ids_na <- as.integer(as.character(df[[new_col]][na_rows]))
						    orig_vals    <- rev_map[as.character(block_ids_na)]
						    # Rows where lookup still returned NA are star block rows (new sessions)
						    is_star_row  <- is.na(orig_vals)
						    # Fill original-session rows
						    non_star <- na_rows[!is_star_row]
						    if (length(non_star) > 0)
						      df[[orig_col]][non_star] <- orig_vals[!is_star_row]
						    # Label star block rows as s.N or s.c.N
						    star_rows <- na_rows[is_star_row]
						    if (length(star_rows) > 0) {
						      star_block_ids <- block_ids_na[is_star_row]
						      # Star block sequence number: 1 for the first star block, 2 for second, ...
						      unique_star_blocks <- sort(unique(star_block_ids))
						      star_seq <- setNames(seq_along(unique_star_blocks),
						                           as.character(unique_star_blocks))
						      # Determine if each star row is an axial point or a star center point.
						      # A star CENTER point has all numeric factors at their midpoint (coded 0).
						      # An AXIAL point has exactly one factor off-center.
						      # If numeric_factors is not supplied, treat all star rows as axial.
						      for (si in seq_along(star_rows)) {
						        row_idx  <- star_rows[si]
						        blk_id   <- star_block_ids[si]
						        seq_n    <- star_seq[as.character(blk_id)]
						        is_center_row <- FALSE
						        if (!is.null(numeric_factors) && length(numeric_factors) >= 1) {
						          row_vals <- suppressWarnings(
						            as.numeric(as.character(unlist(df[row_idx, numeric_factors, drop = TRUE]))))
						          if (!any(is.na(row_vals))) {
						            midpoints <- sapply(numeric_factors, function(fn) {
						              all_vals <- suppressWarnings(as.numeric(as.character(df[[fn]])))
						              mean(range(all_vals, na.rm = TRUE))
						            })
						            is_center_row <- all(abs(row_vals - midpoints) < 1e-8)
						          }
						        }
						        df[[orig_col]][row_idx] <- if (is_center_row)
						          paste0('s.c.', seq_n)
						        else
						          paste0('s.', seq_n)
						      }
						    }
						    df
						  }
						  .bsky_tr_cache <- design.info(cube)$bsky_block_translation


						  # -------------------------------------------------------
						  # HELPER: Distribute n_centers across n_blocks using
						  # round-robin (extra points go to the first blocks).
						  # Returns a named integer vector of length n_blocks.
						  # Prints a note whenever distribution is unequal.
						  # Warns when fewer centers than blocks (some blocks get 0).
						  # -------------------------------------------------------
						  bsky_distribute_centerpoints <- function(n_centers, n_blocks,
						                                            context = "cube") {
							if (n_blocks <= 1L) {
								dist <- as.integer(n_centers)
								names(dist) <- "Block 1"
								return(dist)
							}
							if (n_centers == 0L) {
								dist <- rep(0L, n_blocks)
								names(dist) <- paste("Block", seq_len(n_blocks))
								return(dist)
							}
							base      <- n_centers %/% n_blocks
							remainder <- n_centers %%  n_blocks
							dist <- rep(base, n_blocks)
							if (remainder > 0L)
								dist[seq_len(remainder)] <- dist[seq_len(remainder)] + 1L
							names(dist) <- paste("Block", seq_len(n_blocks))
							if (n_centers < n_blocks) {
								warning(paste0(
									"Fewer center points (", n_centers, ") than blocks (", n_blocks,
									") for the ", context, ".\n",
									"  Some blocks will have NO center points - curvature test will be unreliable.\n",
									"  Recommended minimum: at least 2 center points per block.\n",
									"  Blocks without centers: ",
									paste(names(dist)[dist == 0L], collapse = ", ")
								))
							} else if (remainder != 0L) {
								cat(paste0(
									"NOTE: ", n_centers, " center point(s) cannot be divided equally across ",
									n_blocks, " blocks for the ", context, ".\n",
									"      Distribution (round-robin, extra point(s) assigned to first block(s)):\n"
								))
								for (b in seq_len(n_blocks))
									cat(sprintf("        Block %d: %d center point(s)\n", b, dist[b]))
								cat(paste0(
									"      Consider using ",
									n_blocks * (base + 1L), " or ", n_blocks * base,
									" center point(s) for a perfectly equal distribution.\n"
								))
							} else {
								cat(paste0(
									"Center points distributed equally across ", n_blocks, " blocks",
									" for the ", context, ": ", base, " per block.\n"
								))
							}
							return(dist)
						  }


						  # -------------------------------------------------------
						  # HELPER: detect the existing block column in cube and
						  # return its name, or NULL when the design is un-blocked.
						  # -------------------------------------------------------
						  bsky_detect_block_col <- function(cube, di, block.name) {
							all_cols <- colnames(cube)
							if (!is.null(block.name) && block.name %in% all_cols) return(block.name)
							if (!is.null(di$block.name) && di$block.name %in% all_cols) return(di$block.name)
							return(NULL)
						  }


						  # -------------------------------------------------------
						  # HELPER: build one center row from a template row.
						  # -------------------------------------------------------
						  bsky_make_center_row <- function(template_row, numeric_factors, factor.names,
						                                   categorical_factors = character(0),
						                                   cat_combo = NULL,
						                                   response_cols = character(0),
						                                   block_col = NULL,
						                                   blk_val = NULL) {
							row <- template_row
							for (nf in numeric_factors) {
								fl  <- factor.names[[nf]]
								row[[nf]] <- mean(as.numeric(as.character(fl)))
							}
							for (cf in categorical_factors) {
								if (!is.null(cat_combo)) row[[cf]] <- cat_combo[[cf]]
							}
							for (rc in response_cols) row[[rc]] <- NA
							if (!is.null(block_col) && !is.null(blk_val))
								row[[block_col]] <- blk_val
							return(row)
						  }


						  # -------------------------------------------------------
						  # HELPER: identify the UNIQUE block levels present in the
						  # FACTORIAL (cube) rows only - excludes pre-existing center rows.
						  # Returns sorted integer vector. Returns 1L for un-blocked designs.
						  # -------------------------------------------------------
						  bsky_cube_block_levels <- function(cube, di, block_col,
						                                     existing_center_count) {
							if (is.null(block_col)) return(1L)
							n_factorial <- nrow(cube) - existing_center_count
							if (n_factorial <= 0L) n_factorial <- nrow(cube)
							factorial_rows <- cube[seq_len(n_factorial), , drop = FALSE]
							blk_vals <- factorial_rows[[block_col]]
							blk_int  <- suppressWarnings(as.integer(as.character(blk_vals)))
							if (any(is.na(blk_int))) blk_int <- as.integer(factor(blk_vals))
							return(sort(unique(blk_int)))
						  }


						  # -------------------------------------------------------
						  # HELPER: build all block-distributed center rows.
						  # n_centers_per_combo : per-combo count (or total for numeric-only).
						  # block_ids           : sorted integer vector from bsky_cube_block_levels().
						  # -------------------------------------------------------
						  bsky_build_center_rows <- function(cube, numeric_factors, factor.names,
						                                     categorical_factors = character(0),
						                                     cat_combos_df = NULL,
						                                     n_centers_per_combo,
						                                     block_ids,
						                                     block_col = NULL,
						                                     di) {
							factor_cols   <- names(di$factor.names)
							all_cols      <- colnames(cube)
							response_cols <- setdiff(all_cols, c(factor_cols, block_col))
							n_blocks      <- length(block_ids)
							n_cat_combos  <- if (is.null(cat_combos_df) || nrow(cat_combos_df) == 0L)
								1L else nrow(cat_combos_df)
							total_centers <- n_centers_per_combo * n_cat_combos
							dist          <- bsky_distribute_centerpoints(total_centers, n_blocks,
								context = "cube")
							center_rows   <- NULL
							template      <- cube[1L, , drop = FALSE]
							for (b in seq_len(n_blocks)) {
								blk_id       <- block_ids[b]
								n_this_block <- dist[b]
								if (n_this_block == 0L) next
								if (n_cat_combos > 1L) {
									combo_dist <- bsky_distribute_centerpoints(
									  n_this_block, n_cat_combos,
									  context = paste0("block ", blk_id, " combos"))
									for (ci in seq_len(n_cat_combos)) {
									  n_combo   <- combo_dist[ci]
									  if (n_combo == 0L) next
									  cat_combo <- cat_combos_df[ci, , drop = FALSE]
									  for (j in seq_len(n_combo)) {
									    row <- bsky_make_center_row(
									      template_row        = template,
									      numeric_factors     = numeric_factors,
									      factor.names        = factor.names,
									      categorical_factors = categorical_factors,
									      cat_combo           = cat_combo,
									      response_cols       = response_cols,
									      block_col           = block_col,
									      blk_val             = blk_id)
									    center_rows <- rbind(center_rows, row)
									  }
									}
								} else {
									for (j in seq_len(n_this_block)) {
									  row <- bsky_make_center_row(
									    template_row    = template,
									    numeric_factors = numeric_factors,
									    factor.names    = factor.names,
									    response_cols   = response_cols,
									    block_col       = block_col,
									    blk_val         = blk_id)
									  center_rows <- rbind(center_rows, row)
									}
								}
							}
							for (nf in numeric_factors)
								if (!is.null(center_rows[[nf]]))
									center_rows[[nf]] <- as.numeric(center_rows[[nf]])
							return(center_rows)
						  }


						  # -------------------------------------------------------
						  # Detect block column and existing block IDs in the cube
						  # -------------------------------------------------------
						  bsky_block_col  <- bsky_detect_block_col(cube, di, block.name)
						  bsky_block_ids  <- bsky_cube_block_levels(cube, di, bsky_block_col,
						                                             existing_center_count)
						  bsky_n_blocks   <- length(bsky_block_ids)


						  # -------------------------------------------------------
						  # Center point addition for add.star=FALSE path only.
						  # For add.star=TRUE, the ncenter handling section below
						  # is the sole place centers are added - running both would
						  # double-count the additions.
						  # -------------------------------------------------------
						  if (!add.star) {

							  # Handle center points for original cube
							  # CASE 1: Design has NO center points yet

							  if (!has_existing_centers) {

								# Convert numeric factors to numeric type FIRST (prevents factor-level warnings)
								for (nf in numeric_factors)
									cube[[nf]] <- as.numeric(as.character(cube[[nf]]))

								if (n_categorical > 0) {
									cat_combos   <- unique(cube[, categorical_factors, drop = FALSE])
									n_cat_combos <- nrow(cat_combos)

									center_points <- bsky_build_center_rows(
										cube                = cube,
										numeric_factors     = numeric_factors,
										factor.names        = factor.names,
										categorical_factors = categorical_factors,
										cat_combos_df       = cat_combos,
										n_centers_per_combo = ncenter[1],
										block_ids           = bsky_block_ids,
										block_col           = bsky_block_col,
										di                  = di)

									cube <- rbind(cube, center_points)
									cube <- bsky_backfill_blocks_orig(cube, .bsky_tr_cache)

									base_type  <- bsky_extract_base_type(di$type)
									di$type    <- paste(base_type, "with center points")
									di$ncenter <- ncenter[1] * n_cat_combos
									di$ncube   <- nrow(cube) - nrow(center_points)
									di$nruns   <- nrow(cube)
									design.info(cube) <- di

								} else {
									# No categorical factors
									center_points <- bsky_build_center_rows(
										cube                = cube,
										numeric_factors     = numeric_factors,
										factor.names        = factor.names,
										n_centers_per_combo = ncenter[1],
										block_ids           = bsky_block_ids,
										block_col           = bsky_block_col,
										di                  = di)

									cube <- rbind(cube, center_points)
									cube <- bsky_backfill_blocks_orig(cube, .bsky_tr_cache)
									class(cube) <- c("design", "data.frame")

									base_type  <- bsky_extract_base_type(di$type)
									di$type    <- paste(base_type, "with center points")
									di$ncenter <- ncenter[1]
									di$ncube   <- nrow(cube) - nrow(center_points)
									di$nruns   <- nrow(cube)
									di$coding  <- NULL
									design.info(cube) <- di
								}						  # CASE 2: Design ALREADY has center points - add MORE if requested  
							  } else if (has_existing_centers) {
								# CASE 2: Design already has center points.
								# Add ncenter[1] per combo to cube (simple additive).
								# Works for single value n AND c(n,0) AND c(n,m).
								# If ncenter[1] == 0: nothing to add, skip silently.
								n_to_add_per_combo <- ncenter[1]

								if (n_to_add_per_combo > 0) {

								  if (n_categorical > 0) {
									cat_combos   <- unique(cube[, categorical_factors, drop = FALSE])
									n_cat_combos <- nrow(cat_combos)
									actual_to_add <- n_to_add_per_combo * n_cat_combos
									message(paste("Design already has", existing_center_count, "center point(s).",
									              "Adding", n_to_add_per_combo,
									              paste0("(", n_to_add_per_combo, " x ", n_cat_combos, " combos = ", actual_to_add, " total)"),
									              "more - distributed across", bsky_n_blocks, "block(s)."))
								  } else {
									actual_to_add <- n_to_add_per_combo
									message(paste("Design already has", existing_center_count,
									              "center point(s). Adding", n_to_add_per_combo, "more - distributed across",
									              bsky_n_blocks, "block(s)."))
								  }

								  for (nf in numeric_factors)
									cube[[nf]] <- as.numeric(as.character(cube[[nf]]))

								  if (n_categorical > 0) {
									additional_centers <- bsky_build_center_rows(
										cube                = cube,
										numeric_factors     = numeric_factors,
										factor.names        = factor.names,
										categorical_factors = categorical_factors,
										cat_combos_df       = cat_combos,
										n_centers_per_combo = n_to_add_per_combo,
										block_ids           = bsky_block_ids,
										block_col           = bsky_block_col,
										di                  = di)
								  } else {
									additional_centers <- bsky_build_center_rows(
										cube                = cube,
										numeric_factors     = numeric_factors,
										factor.names        = factor.names,
										n_centers_per_combo = n_to_add_per_combo,
										block_ids           = bsky_block_ids,
										block_col           = bsky_block_col,
										di                  = di)
								  }

								  cube     <- rbind(cube, additional_centers)
								  cube     <- bsky_backfill_blocks_orig(cube, .bsky_tr_cache)
								  di$ncenter <- existing_center_count + actual_to_add
								  di$nruns   <- nrow(cube)
								  class(cube) <- c("design", "data.frame")
								  di$coding  <- NULL
								  design.info(cube) <- di

								} # end n_to_add_per_combo > 0
							  }

						
						  }  # end !add.star center addition

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
							
							# Block column assignment for center points is already handled by
							# bsky_build_center_rows, which sets the correct block ID on every
							# center row during construction. No override needed here.
							
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
							cat("Total runs:", nrow(cube), "\n")
							.bsky_tr_sum <- design.info(cube)$bsky_block_translation
							if (!is.null(.bsky_tr_sum) && !is.null(.bsky_tr_sum$reps_per_block) &&
							    (.bsky_tr_sum$reps_per_block > 1 || .bsky_tr_sum$n_sessions > 1)) {
							  cat("Replications:", .bsky_tr_sum$n_sessions, "(",
							      if (.bsky_tr_sum$format == "Format B (replications only, no original block structure)")
							        paste(.bsky_tr_sum$n_sessions, "reps, no blocks")
							      else paste(.bsky_tr_sum$n_orig_blocks, "block(s) x",
							               .bsky_tr_sum$reps_per_block, "rep(s)"), ")\n")
							}
							cat("\n")
							
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
								cat("  - Factorial runs:", .bsky_n_original_rows, "\n")
								cat("  - Center points:", existing_center_count, 
									paste0("(", centers_per_combo_orig, " per combo x ", n_cat_combos, " combos)"), "\n\n")
							  } else {
								cat("Original design:\n")
								cat("  - Factorial runs:", .bsky_n_original_rows, "\n")
								cat("  - Center points:", existing_center_count, "\n\n")
							  }
							} else {
							  cat("Original design:\n")
							  cat("  - Factorial runs:", .bsky_n_original_rows, "\n")
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
							cat("  - Factorial runs:", .bsky_n_original_rows, "\n")
							cat("  - Total center points:", di$ncenter, "\n")
							
							# If design has star points, show them
							if (!is.null(di$nstar) && di$nstar > 0) {
							  cat("  - Total star points:", di$nstar, "(axial only, no new star centers added)\n")
							}
							
							cat("  - Total runs:", nrow(cube), "\n")
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
						  
						  # ------------------------------------------------------------------
						  # NCENTER HANDLING
						  # Simple additive interpretation for both single value and c(n,m):
						  #   Single value n  -> add n per combo to cube AND n per combo to star
						  #   c(n, m)         -> add n per combo to cube, add m per combo to star
						  #   n = 0           -> add nothing to cube (regardless of existing centers)
						  #   m = 0           -> add nothing to star block
						  # 'Per combo' means per categorical combination.
						  # For no-categorical designs, n and m are simply totals.
						  # ------------------------------------------------------------------

						  if (length(ncenter) == 1) {
							centers_to_add_cube <- ncenter[1]   # add this many per combo to cube
							star_to_add         <- ncenter[1]   # add same count per combo to star
						  } else if (length(ncenter) == 2) {
							centers_to_add_cube <- ncenter[1]   # add this many per combo to cube
							star_to_add         <- ncenter[2]   # add this many per combo to star
						  } else {
							stop('ncenter must have one or two elements')
						  }

						  # Expand per-combo counts to totals for categorical designs
						  if (n_categorical > 0) {
							cat_combos   <- unique(cube[, categorical_factors, drop = FALSE])
							n_cat_combos <- nrow(cat_combos)
							centers_to_add_cube_total <- centers_to_add_cube * n_cat_combos
						  } else {
							n_cat_combos              <- 1L
							centers_to_add_cube_total <- centers_to_add_cube   # already a total
						  }

						  # Add cube center points if requested
						  if (centers_to_add_cube_total > 0) {
							bsky_block_ids_add <- bsky_cube_block_levels(cube, di, bsky_block_col,
							                                              current_center_count)
							for (nf in numeric_factors)
								cube[[nf]] <- as.numeric(as.character(cube[[nf]]))

							if (n_categorical > 0) {
								additional_centers <- bsky_build_center_rows(
									cube                = cube,
									numeric_factors     = numeric_factors,
									factor.names        = factor.names,
									categorical_factors = categorical_factors,
									cat_combos_df       = cat_combos,
									n_centers_per_combo = centers_to_add_cube,
									block_ids           = bsky_block_ids_add,
									block_col           = bsky_block_col,
									di                  = di)
							} else {
								additional_centers <- bsky_build_center_rows(
									cube                = cube,
									numeric_factors     = numeric_factors,
									factor.names        = factor.names,
									n_centers_per_combo = centers_to_add_cube_total,
									block_ids           = bsky_block_ids_add,
									block_col           = bsky_block_col,
									di                  = di)
							}

							cube <- rbind(cube, additional_centers)
							cube <- bsky_backfill_blocks_orig(cube, .bsky_tr_cache)
							di$ncenter <- current_center_count + centers_to_add_cube_total
							di$nruns   <- nrow(cube)
							design.info(cube) <- di
							current_center_count <- di$ncenter

							if (n_categorical > 0) {
								cat(paste0('Added ', centers_to_add_cube_total, ' cube center point(s) (',
								           centers_to_add_cube, ' per combo x ', n_cat_combos, ' combos).\n'))
							} else {
								cat(paste0('Added ', centers_to_add_cube_total, ' cube center point(s).\n'))
							}
						  }

						  # ncenter in c(cube_total, star_per_combo) format for CCD generation
						  ncenter <- c(current_center_count, star_to_add)


						  # -------------------------------------------------------
						  # GUARD: Validate ncenter for all c(n,m) permutations
						  # ncenter is now fully resolved to c(final_cube_total, star_to_add).
						  # -------------------------------------------------------
						  if (add.star) {

							final_cube_centers <- ncenter[1]
							star_m             <- ncenter[2]

							if (n_categorical > 0 && exists('n_cat_combos') && n_cat_combos > 1) {
								per_combo_label <- paste0(' (', final_cube_centers / n_cat_combos,
								                          ' per combo x ', n_cat_combos, ' combos)')
							} else {
								per_combo_label <- ''
							}

							# INVALID: c(0,0) or c(0,m) with no existing centers anywhere
							if (final_cube_centers == 0) {
								stop(paste0(
									'Cannot add axial/star points: the design has no center points in the cube.\n',
									'  Center points are required before a CCD can be built.\n',
									'  Options:\n',
									'    (a) Specify ncenter = c(n, 0) to add n center points to the cube\n',
									'        and star points in the same step (n >= 1 per combo).\n',
									'    (b) Add center points first (uncheck add star/axial), collect data,\n',
									'        test for curvature, then augment with star points.'
								))
							}

							# VALID c(0,0): existing centers, adding stars only
							if (centers_to_add_cube == 0 && star_m == 0) {
								cat(paste0(
									'NOTE: Design already has ', final_cube_centers, ' center point(s)',
									per_combo_label, ' in the cube.\n',
									'      No new center points requested for cube or star block.\n',
									'      Adding axial/star points only, using existing center points.\n'
								))
							}

							# VALID c(0,m): existing centers, adding stars + star block centers
							if (centers_to_add_cube == 0 && star_m > 0) {
								cat(paste0(
									'NOTE: Design already has ', final_cube_centers, ' center point(s)',
									per_combo_label, ' in the cube.\n',
									'      No new cube center points requested.\n',
									'      Adding axial points + ', star_m,
									' center point(s) per combo to the star block.\n'
								))
							}

						  }   # end add.star guard


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
						  
						  
						  # Determine block structure from the ORIGINAL design (used for star block numbering)
						  if (is.null(di$blocks))
							nblocks <- 1
						  else nblocks <- di$nblocks
						  
						  # Identify star points in the aus design by ROW NAME, not numeric index.
						  # bsky_ccd_1_41_enhanced names cube rows 'C{blk}.{i}' and star rows 'S{blk}.{i}'.
						  # When randomize=TRUE the function shuffles aus rows, making any
						  # numeric index formula (e.g. (n.c + ncenter)*bbreps + 1 : nrow(aus))
						  # invalid -- star rows can appear anywhere after shuffling.
						  # Using rownames starting with 'S' is robust to randomization.
						  
						  if (add.star) {
							star.points <- grep('^S', rownames(aus))
							if (length(star.points) == 0) {
								# Fallback: if rownames don't follow C/S convention,
								# use the numeric formula with nblev_in_aus=1 (no randomize case)
								nblev_in_aus <- 1
								star.points <- ((n.c * wbreps + ncenter[1] * nblev_in_aus) * bbreps + 1):nrow(aus)
								warning('Could not identify star points by row name; falling back to numeric index.')
							}
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
							  # 'more' already contains Blocks.orig (set by bsky_normalise_block_encoding)
							  # because more = setdiff(colnames(cube), c(factor.names, block.name)).
							  # Do NOT add it again — that creates a duplicate Blocks.orig.1 column.
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
							# Build block vector from the ACTUAL block column in cube.
							# bsky_build_center_rows already set the correct block IDs on
							# every center row, so we simply read cube[[bsky_block_col]].
							# We must NOT rebuild from rep(1,...) which ignores the original
							# multi-block structure and assigns all rows to Block 1.
							if (!is.null(bsky_block_col) && bsky_block_col %in% colnames(cube)) {
							  cube_block_vec <- as.integer(as.character(cube[[bsky_block_col]]))
							  max_cube_block <- max(cube_block_vec, na.rm = TRUE)
							} else {
							  # Un-blocked design: all cube rows get block 1
							  cube_block_vec <- rep(1L, nrow(cube))
							  max_cube_block <- 1L
							}
							
							if (add.star) {
							  # Star block(s): one new block ID per categorical combination
							  star_blocks <- rep(max_cube_block + 1:n_cat_combos, each = length(star.points))
							  design <- cbind(
								c(cube_block_vec, star_blocks),
								design
							  )
							} else {
							  # No star points: just prepend the cube block vector
							  design <- cbind(
								cube_block_vec,
								design
							  )
							}
							colnames(design)[1] <- block.name
							design[[block.name]] <- factor(design[[block.name]])
							  # Backfill Blocks.orig now that block column exists
							  if (!is.null(.bsky_tr_cache) && !is.null(.bsky_tr_cache$original_col) &&
							      .bsky_tr_cache$original_col %in% colnames(design)) {
							    design <- bsky_backfill_blocks_orig(design, .bsky_tr_cache,
							                                         numeric_factors = numeric_factors)
							  }
							
						  } else {
							# No categorical factors case
							
							if (add.star) {
							  
							  # Assemble factor columns only, then prepend the real block vector
							  decoded_aus <- decode.data(aus)
							  star_factor_rows <- decoded_aus[star.points, -1, drop = FALSE]
							  colnames(star_factor_rows) <- numeric_factors
							  if (length(more) > 0) {
								for (.mc in more) star_factor_rows[[.mc]] <- NA
								# Blocks.orig is in 'more' — NA is correct for star rows
								# (will be filled with s.N/s.c.N by backfill after cbind)
							  }
							  cube_factor_cols <- c(names(factor.names), more)
							  design <- rbind(
								cube[, cube_factor_cols, drop = FALSE],
								star_factor_rows[, cube_factor_cols, drop = FALSE]
							  )
							  rownames(design) <- 1:nrow(design)
							  
							  # Build block vector from ACTUAL cube block column + new star block ID.
							  # aus[[block.name]] cannot be used here because aus was built with
							  # blocks='string' -> 1 cube block, so it has wrong block IDs for
							  # the original multi-block design.
							  if (!is.null(bsky_block_col) && bsky_block_col %in% colnames(cube)) {
								cube_block_vec <- as.integer(as.character(cube[[bsky_block_col]]))
								max_cube_block <- max(cube_block_vec, na.rm = TRUE)
							  } else {
								cube_block_vec <- rep(1L, nrow(cube))
								max_cube_block <- 1L
							  }
							  star_block_id  <- max_cube_block + 1L
							  star_block_vec <- rep(star_block_id, length(star.points))
							  block_vec      <- c(cube_block_vec, star_block_vec)
							  design <- cbind(block_vec, design)
							  colnames(design)[1] <- block.name
							  design[[block.name]] <- factor(design[[block.name]])
							  rownames(design) <- 1:nrow(design)
							  # Backfill Blocks.orig now that block column exists
							  if (!is.null(.bsky_tr_cache) && !is.null(.bsky_tr_cache$original_col) &&
							      .bsky_tr_cache$original_col %in% colnames(design)) {
							    design <- bsky_backfill_blocks_orig(design, .bsky_tr_cache,
							                                         numeric_factors = numeric_factors)
							  }
							} else {
							  # No star points - just cube with center points
							  # 'more' already contains Blocks.orig — do not add again
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

						  # ── Correct di$ncube/ncenter/nstar from actual row data ──────────────
						  # Values set above use per-replication or aus-based counts that ignore
						  # replication in the cube. Recount from the final design data directly.
						  tryCatch({
						    .bsky_di_fix <- design.info(design)
						    .bsky_ax <- if (exists("bsky_identify_axial_points"))
						      bsky_identify_axial_points(design, repair = FALSE) else integer(0)
						    .bsky_ct <- if (exists("bsky_identify_center_points"))
						      bsky_identify_center_points(design) else integer(0)
						    .bsky_n_ax <- length(.bsky_ax)
						    .bsky_n_ct <- length(.bsky_ct)
						    .bsky_n_cb <- nrow(design) - .bsky_n_ax - .bsky_n_ct
						    if (!isTRUE(.bsky_di_fix$nstar   == .bsky_n_ax) ||
						        !isTRUE(.bsky_di_fix$ncenter == .bsky_n_ct) ||
						        !isTRUE(.bsky_di_fix$ncube   == .bsky_n_cb)) {
						      .bsky_di_fix$nstar   <- .bsky_n_ax
						      .bsky_di_fix$ncenter <- .bsky_n_ct
						      .bsky_di_fix$ncube   <- .bsky_n_cb
						      design.info(design)  <- .bsky_di_fix
						    }
						  }, error = function(e) { })

						  # Print summary
						  cat("\n=== CCD Augmentation Summary ===\n")
						  cat("Design type:", di$type, "\n")
						  cat("Total runs:", nrow(design), "\n")
						  .bsky_tr_sum2 <- design.info(cube)$bsky_block_translation
						  if (!is.null(.bsky_tr_sum2) && !is.null(.bsky_tr_sum2$reps_per_block) &&
						      (.bsky_tr_sum2$reps_per_block > 1 || .bsky_tr_sum2$n_sessions > 1)) {
						    cat("Replications:", .bsky_tr_sum2$n_sessions, "(",
						        if (.bsky_tr_sum2$format == "Format B (replications only, no original block structure)")
						          paste(.bsky_tr_sum2$n_sessions, "reps, no blocks")
						        else paste(.bsky_tr_sum2$n_orig_blocks, "block(s) x",
						                   .bsky_tr_sum2$reps_per_block, "rep(s)"), ")\n")
						  }
						  cat("\n")
						  
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
							  cat("  - Factorial runs:", .bsky_n_original_rows, "\n")
							  cat("  - Center points:", existing_center_count, 
								  paste0("(", centers_per_combo_orig, " per combo x ", n_cat_combos, " combos)"), "\n\n")
							} else {
							  cat("Original design:\n")
							  cat("  - Factorial runs:", .bsky_n_original_rows, "\n")
							  cat("  - Center points:", existing_center_count, "\n\n")
							}
						  } else {
							cat("Original design:\n")
							cat("  - Factorial runs:", .bsky_n_original_rows, "\n")
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
						  cat("  - Factorial runs:", .bsky_n_original_rows, "\n")
						  cat("  - Total center points:", di$ncenter, "\n")
						  if (add.star) {
							cat("  - Total star points:", di$nstar, "(axial + star centers)\n")
						  }
						  cat("  - Total runs:", nrow(design), "\n")
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
					  
					   # In future, if needed, introduce this test for checking aliasing (primariliy for fractional factorial design with low resolution)
					  if(FALSE){ 
							  v = paste(names(cube), collapse = ",")
							  # Aliasing check removed: it used a fake response on the internal
							  # aus cube (1 block, string blocks arg) and fired spuriously for
							  # valid blocked full factorial designs. Input validation upstream
							  # already ensures only valid factorial designs reach this point.
					   }
					  
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
					  
					  if(FALSE) { #remove this block later
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
					    }
					  
					   if (is.character(alpha)) {
						  alpha_type_used = alpha
						c.ii = sum(cube[[1]]^2)
						s.ii = sum(star[[1]]^2)
						what = pmatch(alpha, c("rotatable", "orthogonal"))
						if (is.na(what))
						  stop("alpha must be 'rotatable', 'orthogonal', or a numeric value")
						if (what == 1)
						  alpha = (2 * c.ii/s.ii)^0.25
						else alpha = sqrt(nrow(star)/s.ii * c.ii/nrow(cube))
					  } else {
						  alpha_type_used = "Value specified"
					  }
					  
					  cat("Alpha type used for star points: ", alpha_type_used, "\n")
					  cat("Alpha value used for star points: ", alpha, "\n")
					  
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
										
										alpha = {{if(options.selected.alpha == '' )}} 
															'orthogonal' 
													  {{#else}}
															{{if(options.selected.alpha == 'orthogonal' || options.selected.alpha == 'rotatable' )}}  
																c('{{selected.alpha | safe}}') 
														   {{#else}} 
																	as.numeric('{{selected.alpha | safe}}') 
															{{/if}}
													  {{/if}},
										
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
                    label: createCentralCompositeDesignMixedFactors.t('datasetname'),
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    overwrite: "dataset",
                    value: ""
                })
            },
			datasetFrF2: {
                el: new dstVariable(config, {
                    label: createCentralCompositeDesignMixedFactors.t('datasetFrF2'),
                    no: "datasetFrF2",
                    filter: "Dataset",
                    //extraction: "UseComma|Enclosed",
					extraction: "ValueAsIs",
                    required: true,
                })
            },
			addStarPointChk: { 
                el: new checkbox(config, {
                    label: createCentralCompositeDesignMixedFactors.t('addStarPointChk'), 
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
                    label: createCentralCompositeDesignMixedFactors.t('alpha'),
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
                    label: createCentralCompositeDesignMixedFactors.t('numOfCenterPts'),
					allow_spaces:true,
                    placeholder: "",
                    extraction: "TextAsIs",
                    value: "4, 0",
					//style: "ml-5 mb-1",
                })
            },
			blockName: {
                el: new input(config, {
                    no: 'blockName',
                    label: createCentralCompositeDesignMixedFactors.t('blockName'),
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
                    label: createCentralCompositeDesignMixedFactors.t('randomseeds'),
                    //required: true,
                    //min: 1,
                    max: 99999,
                    step: 1,
                    value: "",
					style: "ml-5",
                })
            },            
            alphalbl: { el: new labelVar(config, { label: createCentralCompositeDesignMixedFactors.t('alphalbl'), style: "mt-3 ml-5",h: 6 }) },
            lbl1: { el: new labelVar(config, { label: createCentralCompositeDesignMixedFactors.t('lbl1'), style: "mt-3",h: 6 }) },

            randomizationChk: { 
				el: new checkbox(config, { 
					label: createCentralCompositeDesignMixedFactors.t('randomizationChk'), 
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
                name: createCentralCompositeDesignMixedFactors.t('navigation'),
                icon: "icon-doe",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
		
        this.help = {
            title: createCentralCompositeDesignMixedFactors.t('help.title'),
            r_help: createCentralCompositeDesignMixedFactors.t('help.r_help'), //Fix by Anil //r_help: "help(data,package='utils')",
            body: createCentralCompositeDesignMixedFactors.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new createCentralCompositeDesignMixedFactors().render()
}
