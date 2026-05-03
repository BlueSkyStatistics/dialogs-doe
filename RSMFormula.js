/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Design of Experiments analysis with Response Surface Model (Quantitative)",
        navigation: "Design Analysis - Response Surface Model",
		
        modelname: "RSM Model Name (dataset name will be appended automatically)",
		
        dependent: "Response (dependent) variable",
        formulaboxhint: "Recommendation: Use RSM macro terms (FO, TWI, PQ, SO) for numeric factors in the formula builder. If your design is blocked, include the block column BEFORE the RSM macro: e.g., Blocks + SO(Temp, Pressure, Thinner) or Block.ccd + SO(Temp, Pressure, Thinner, Speed, Angle). The block term is automatically detected and forced into the model at every stepwise step. Type SO(var1, var2,...) for main effects + interactions + quadratics, FO(...) for main effects only, TWI(...) for two-way interactions.",  
		//independent:"Numeric Predictors - insert below the numeric formula variables",
        generateContourPlotChk: "Display Contour(plots)",
		generateRSMPlotChk: "Display Response Surface (plots)",
		generatePathSteepestAscentChk: "Show path of steepest ascent from ridge analysis",
		steepestHandComputedChk: "Also show hand-computed steepest ascent path in natural (un-coded) units (always computed from first principles — useful when model was not fitted with coded data or when stepwise is enabled)",

        stepwiseSectionLbl: "Stepwise Model Selection (optional)",
        stepwiseChk: "Enable stepwise model selection (uncheck to fit full model as specified above)",
        stepwiseMethodLbl: "Stepwise method",
        stepwiseMethod: "stepwise",
        stepwiseCriterionLbl: "Information criterion (used only when method is Forward information criteria, i.e., forward_ic selected above)",
        stepwiseCriterion: "AICc",
        alphaEnterLbl: "Alpha to add (for Stepwise and Forward addition)",
        alphaEnter: "0.15",
        alphaRemoveLbl: "Alpha to remove (for Stepwise and Backward elimination)",
        alphaRemove: "0.15",
        hierarchyChk: "Require hierarchical model at each step (recommended — enforces effect heredity)",
        showStepDetailChk: "Show details for each step of the selection procedure",
        stepwiseNote: "Note: default alpha = 0.15 used. For Forward information criteria (forward_ic), AICc or BIC replaces the p-value threshold as the stopping criterion, which avoids inflated Type-I error from repeated testing. Hierarchical enforcement ensures that if an interaction term is selected, all its constituent main effects are also retained — consistent with effect heredity. After selection the reduced model is refit with rsm() so all downstream outputs (contour plots, surface plots, steepest ascent, canonical analysis) remain valid.",

		showResidualPlotsChk:    "Show residual plots for the rsm model",
		checkShapiroNormalityTestChk: "Shapiro normality test for residuals",
		checkADNormalityTestChk: "Anderson-Darling normality test for residuals",
		flipaxisPPplotChk: "Flip axis for the P-P plot",
		deGroupPlotsChk:  "De-group plots to plot individually",
		
		observationDiagnosticsChk: "Show observation diagnostics table (Std. Residuals, Leverage, Cook's D, DFFITS)",
		VIFChk: "Show Variance Inflation Factors (VIF) for main effects",
		
		
        help: {
				title: "Response Surface Model with a model formula builder",
				r_help: "help(rsm, package = rsm)",
				body: `
				<b>Description</b></br>
				Response-surface regression - fit a linear model with a response-surface component, and produce appropriate analyses and summaries
				<br/> In the formula builder, you can type SO(var1, var2, var3, ...) or FO(var1, ..) or other function from the rsm package - help(SO, package =rsm)
				<br/>
				<br/>
				For more details, see R help for the following
				<br/>
				help(rsm, package = rsm)
				<br/>
				help(SO, package = rsm)
				<br/>
				help(FO, package = rsm)
				<br/>
				help(contour, package = graphics) 
				<br/>
				help(persp, package = graphics) 
				<br/>
				help(steepest, package = rsm)  
				<br/>
				help(shapiro.test, package = stats)  
				<br/>
				help(qqnorm, package = stats)  
				<br/>
				<br/>
				<b>Stepwise Model Selection</b><br/>
				When enabled, stepwise selection identifies a reduced subset of significant RSM terms. Methods available:<br/>
				<b>Stepwise</b>: combines forward and backward steps using alpha-to-enter and alpha-to-remove thresholds.<br/>
				<b>Forward selection</b>: starts from an empty model and adds the most significant term at each step.<br/>
				<b>Backward elimination</b>: starts from the full model and removes the least significant term at each step.<br/>
				<b>Forward information criteria</b>: uses AICc or BIC as the stopping criterion instead of p-values, which avoids inflated Type-I error from repeated testing and penalises model complexity directly.<br/>
				Hierarchical enforcement ensures that if an interaction or quadratic term is selected, all constituent lower-order terms are also retained (effect heredity).<br/>
				After selection the reduced formula is refit using rsm() so contour plots, surface plots, steepest ascent and canonical analysis all remain valid.<br/>
				help(step, package = stats)<br/>
				help(stepAIC, package = MASS)<br/>

			`
		}
    }
}

class RSMFormula extends baseModal {
    constructor() {
        var config = {
            id: "RSMFormula",
            label: localization.en.title,
            modalType: "two",
            RCode: `
require(rsm)
require(ggplot2);
require(ggthemes);
require(qqplotr);
require(nortest);

bsky_get_numeric_predictors <- function(model, data) {
  # Returns the names of the true numeric RSM predictors from a fitted model.
  #
  # The key challenge: block ID columns (Block.ccd = 1, 2, 3...) are stored
  # as integers and pass is.numeric() — they cannot be distinguished from real
  # continuous predictors by data type alone.
  #
  # Strategy: use the FORMULA STRUCTURE as the primary source of truth.
  # Variables that appear inside rsm macros (FO, SO, TWI, PQ, PE) are
  # definitively numeric RSM predictors — that is exactly what those macros
  # mean. Variables in the formula but OUTSIDE all macros are covariates or
  # block terms regardless of their storage type.
  #
  # If no rsm macros are present (plain lm-style formula), fall back to
  # filtering by is.numeric() but additionally exclude any variable whose
  # values are a small set of consecutive integers (block ID heuristic).

  data <- as.data.frame(data)
  fmla <- formula(model)
  resp <- as.character(fmla[[2]])

  # ── Primary path: extract variables from rsm macros ──────────────────────
  term_labels <- attr(terms(model), "term.labels")
  rsm_macros  <- c("FO", "SO", "TWI", "PQ", "PE", "CS", "IS", "RS")
  macro_pattern <- paste0("^(", paste(rsm_macros, collapse = "|"), ")\\\\s*\\\\(")

  macro_terms <- term_labels[grepl(macro_pattern, term_labels)]

  # ── Block ID heuristic helper ────────────────────────────────────────────
  # Handles numeric, integer, factor, AND character stored block columns.
  # A block ID column is one whose unique values, when converted to numeric,
  # form a consecutive integer sequence starting at 1 (e.g. 1,2,3 or "1","2","3").
  bsky_is_block_col <- function(col) {
    cv_num <- suppressWarnings(as.numeric(as.character(col)))
    if (any(is.na(cv_num))) return(FALSE)   # non-numeric levels like "Left","Right"
    uvals <- sort(unique(cv_num[!is.na(cv_num)]))
    n <- length(uvals)
    n >= 2 && n <= 20 &&
      all(cv_num == floor(cv_num), na.rm = TRUE) &&
      all(uvals == seq_len(n))
  }

  # ── Collect macro vars (always, even in mixed formulas) ──────────────────
  macro_vars <- character(0)
  if (length(macro_terms) > 0) {
    macro_vars <- unique(unlist(lapply(macro_terms, function(lab) {
      tryCatch(all.vars(str2lang(lab)), error = function(e) character(0))
    })))
    macro_vars <- macro_vars[
      macro_vars %in% names(data) & sapply(data[macro_vars], is.numeric)
    ]
  }

  # ── Collect plain numeric vars typed OUTSIDE macros ──────────────────────
  # Handles mixed formulas like: Temp + Pressure + Pressure:Thinner + SO(Speed,Angle)
  # The macro path finds Speed,Angle but misses Temp, Pressure, Thinner.
  # all.vars() on the whole formula catches all variable names including those
  # in plain terms and interactions outside macros.
  all_pred_vars <- setdiff(all.vars(fmla), resp)
  all_pred_vars <- all_pred_vars[all_pred_vars %in% names(data)]

  plain_numeric_vars <- all_pred_vars[
    !all_pred_vars %in% macro_vars &
    sapply(all_pred_vars, function(v) {
      col <- data[[v]]
      if (!is.numeric(col) && !is.integer(col)) return(FALSE)
      if (bsky_is_block_col(col)) return(FALSE)
      TRUE
    })
  ]

  # ── Combine macro vars + plain numeric vars ───────────────────────────────
  result <- unique(c(macro_vars, plain_numeric_vars))
  if (length(result) > 0) return(result)
  return(character(0))
}
		
# .bsky_num_vars is derived from the fitted model in STEP 1 (after
# .bsky_initial_full is created) using bsky_get_numeric_predictors().
# Using the fitted model is more reliable than asking the user to list
# numeric variables manually — it introspects the formula and dataset
# to determine which predictors are actually numeric.


# ── Helper: compute PRESS (leave-one-out prediction error sum of squares) ──
# Returns NA with a warning for fully saturated models (hat values == 1)
# to avoid division by zero.
bsky_rsm_press <- function(model) {
  h <- hatvalues(model)
  r <- residuals(model)
  if (any(h >= 1 - 1e-10)) {
    warning("PRESS statistic undefined: model is fully saturated (hat values = 1 for some observations). Returning NA.")
    return(NA_real_)
  }
  sum((r / (1 - h))^2)
}

# ── Helper: compute R-squared predicted from PRESS ──
bsky_rsm_r2pred <- function(model) {
  press <- bsky_rsm_press(model)
  if (is.na(press)) return(NA_real_)
  sst <- sum((model$model[[1]] - mean(model$model[[1]]))^2)
  1 - press / sst
}

# ── Helper: compute AICc (corrected AIC for small samples) ──
bsky_rsm_aicc <- function(model) {
  n   <- length(residuals(model))
  k   <- length(coef(model))
  aic <- AIC(model)
  aic + (2 * k * (k + 1)) / (n - k - 1)
}

# ── Helper: expand an rsm model to a plain lm using its actual fitted terms ──
# step() and stepAIC() cannot expand rsm formula macros (SO, FO, PQ, TWI, PE,
# CS, IS, RS, etc.) — they must receive a standard lm with individual terms.
# By the time rsm() has fitted the model, ALL macros are already expanded into
# standard R terms: main effects (x), quadratics (I(x^2)), and interactions
# (x:y). We extract those expanded term labels directly from the fitted rsm
# object's terms attribute, so this function works correctly regardless of
# which rsm macro combination was used in the formula.
bsky_rsm_to_lm <- function(rsm_model, dataset) {
  resp      <- as.character(formula(rsm_model)[[2]])
  tm        <- terms(rsm_model)
  tlabs_raw <- attr(tm, "term.labels")

  # ── Expand rsm macro labels into individual standard R term strings ──────
  # attr(terms(), "term.labels") returns macro-group labels like
  # "FO(Temp,Pressure,...)", "PQ(Temp,...)", "TWI(Temp,...)" when the formula
  # used rsm macros. Passing these intact to step()/stepAIC() causes whole
  # groups to enter/exit together — individual weak terms are never evaluated.
  #
  # We expand each macro to its constituent individual terms using the same
  # approach as bsky_create_df_from_model_frame: parse the macro call with
  # str2lang() to extract the variable names, then reconstruct the correct
  # R term strings for each macro type:
  #   FO(x,y,z)        -> x, y, z            (main effects)
  #   PQ(x,y,z)        -> I(x^2), I(y^2), I(z^2)   (pure quadratics)
  #   TWI(x,y,z)       -> x:y, x:z, y:z      (all pairwise interactions)
  #   SO(x,y,z)        -> FO + PQ + TWI of x,y,z
  #   plain term (x)   -> kept as-is
  #   I(x^2)           -> kept as-is
  #   x:y              -> kept as-is

  bsky_expand_rsm_macro <- function(lab) {
    # Identify macro type
    macro <- sub("\\\\(.*", "", lab)   # everything before first "("

    if (macro %in% c("FO", "SO", "TWI", "PQ")) {
      vars <- all.vars(str2lang(lab))   # extract variable names from macro call

      fo_terms  <- vars                                          # main effects
      pq_terms  <- paste0("I(", vars, "^2)")                   # quadratics
      twi_terms <- if (length(vars) >= 2) {                    # pairwise interactions
        pairs <- combn(vars, 2, simplify = FALSE)
        sapply(pairs, function(p) paste(p, collapse = ":"))
      } else character(0)

      switch(macro,
        "FO"  = fo_terms,
        "PQ"  = pq_terms,
        "TWI" = twi_terms,
        "SO"  = c(fo_terms, pq_terms, twi_terms)
      )
    } else {
      lab   # plain term, I(x^2), x:y — keep unchanged
    }
  }

  # Expand all term labels and flatten to unique individual terms
  tlabs <- unique(unlist(lapply(tlabs_raw, bsky_expand_rsm_macro)))

  # ── Strip covariate terms (block IDs + factor/char columns) ────────────
  # Interactions (x:y) and quadratics (I(x^2)) are always kept.
  # Plain-name terms are stripped if they are factor/character columns OR
  # numeric block ID columns (consecutive integers from 1).
  is_covariate_term <- sapply(tlabs, function(t) {
    if (grepl(":", t, fixed = TRUE) || grepl("^I\\\\(", t)) return(FALSE)
    v <- dataset[[t]]
    if (is.null(v)) return(FALSE)
    if (is.factor(v) || is.character(v)) return(TRUE)
    if (is.numeric(v) || is.integer(v)) {
      uvals <- sort(unique(v[!is.na(v)]))
      n <- length(uvals)
      return(n <= 20 && all(v == floor(v), na.rm = TRUE) && all(uvals == seq_len(n)))
    }
    FALSE
  })
  tlabs <- tlabs[!is_covariate_term]

  if (length(tlabs) == 0) {
    fmla <- as.formula(paste(resp, "~ 1"))
  } else {
    fmla <- as.formula(paste(resp, "~", paste(tlabs, collapse = " + ")))
  }
  lm(fmla, data = dataset, na.action = na.exclude)
}

# ── Generic RSM refit function ─────────────────────────────────────────────
# Converts any set of individual term labels (plain names, I(x^2), x:y)
# back into rsm macros (FO, PQ, TWI) and refits with rsm() so the returned
# object always has class "rsm". This gives full access to all native RSM
# callouts: summary.rsm()$lof, summary.rsm()$canonical, rsm::steepest(),
# graphics::contour.lm(), graphics::persp.lm().
#
# Used in two scenarios:
#   1. After stepwise selection — refit the reduced term set
#   2. When user's original formula had no macros — refit the full term set
#      so all downstream RSM outputs work natively
#
# If rsm() refit fails (e.g. too few df after aggressive reduction), the
# function returns the plain lm() fit and emits a warning. The first-
# principles helpers in STEP 3 then serve as the fallback.
#
# Arguments:
#   term_labels  : character vector of individual term labels to include
#                  (main effects, I(x^2) quadratics, x:y interactions)
#   resp_var     : response variable name (string)
#   numeric_vars : character vector of numeric predictor names in model
#                  (needed to correctly assign TWI vars)
#   dataset      : the data frame
#   block_term   : optional block term string to prepend (e.g. "Block.ccd")

bsky_refit_as_rsm <- function(term_labels, resp_var, numeric_vars,
                               dataset_name, covariate_terms = NULL) {
  # covariate_terms: character vector of non-numeric covariate term names to
  # prepend to the formula (block columns, categorical covariates like
  # Paintbox, Position, etc.). These are preserved in the refit formula exactly
  # as-is before the RSM macros FO/PQ/TWI.
  #
  # dataset_name: STRING (the dataset name in GlobalEnv) — ensures rsm() $call
  # stores the real name so steepest(), loftest(), contour() etc. can re-evaluate.

  # Resolve the dataset object from its name
  dataset <- get(dataset_name, envir = .GlobalEnv)

  # ── Separate covariate terms from RSM numeric terms ─────────────────────
  # Layer 1: exclude covariate_terms (block IDs, Paintbox etc.) from RSM terms.
  # Layer 2: fo_vars further restricted to known numeric_vars as safety net.
  rsm_term_labels <- term_labels[
    !term_labels %in% covariate_terms |
     grepl(":", term_labels, fixed = TRUE) |
     grepl("^I\\\\(", term_labels)
  ]

  # ── Classify RSM terms into FO / PQ / TWI ────────────────────────────────
  # FO: plain names that are confirmed numeric RSM predictors
  fo_vars_raw <- rsm_term_labels[
    !grepl(":", rsm_term_labels, fixed = TRUE) &
    !grepl("^I\\\\(", rsm_term_labels)
  ]
  fo_vars <- if (length(numeric_vars) > 0) {
    fo_vars_raw[fo_vars_raw %in% numeric_vars]
  } else {
    fo_vars_raw
  }

  # PQ: I(x^2) terms — extract variable name x
  pq_vars <- sub("^I\\\\((.+)\\\\^2\\\\)$", "\\\\1",
    rsm_term_labels[grepl("^I\\\\(.+\\\\^2\\\\)$", rsm_term_labels)])

  # TWI: plain x:y interaction terms
  # IMPORTANT: keep the exact pairs as specified — do NOT expand to all
  # combinations of unique variable names. This matters for mixed formulas
  # like Temp + Pressure:Thinner + SO(Speed,Angle) where only Pressure:Thinner
  # was intended, not all pairs of Pressure, Thinner, Speed, Angle.
  # TWI() in rsm accepts individual pairs: TWI(x=Pressure, y=Thinner) is not
  # valid syntax — rsm TWI only accepts a variable list and generates ALL pairs.
  # So for specific pairs we must keep them as plain x:y terms outside macros.
  twi_pairs_all <- rsm_term_labels[grepl(":", rsm_term_labels, fixed = TRUE)]

  # Separate TWI pairs into two groups:
  #   "full" pairs: both variables also appear in fo_vars (from SO/TWI macros)
  #                 → can be expressed as TWI(var1, var2, ...)
  #   "partial" pairs: one or both vars NOT in fo_vars (plain typed interactions)
  #                 → must stay as individual x:y plain terms outside macros
  if (length(twi_pairs_all) > 0 && length(fo_vars) > 0) {
    pair_vars_in_fo <- sapply(twi_pairs_all, function(p) {
      vars <- strsplit(p, ":", fixed = TRUE)[[1]]
      all(vars %in% fo_vars)
    })
    twi_pairs_full    <- twi_pairs_all[ pair_vars_in_fo]   # → TWI() macro
    twi_pairs_partial <- twi_pairs_all[!pair_vars_in_fo]   # → plain x:y terms
  } else {
    twi_pairs_full    <- character(0)
    twi_pairs_partial <- twi_pairs_all
  }

  # Build TWI macro from full pairs (both vars in FO)
  twi_vars <- if (length(twi_pairs_full) > 0) {
    unique(unlist(strsplit(twi_pairs_full, ":", fixed = TRUE)))
  } else {
    character(0)
  }

  # Heredity check: every var in PQ or TWI must be in FO.
  # For plain formulas the user may have written I(x^2) without x as a main
  # effect (unusual but possible). Add missing FO vars silently.
  missing_from_fo <- setdiff(
    unique(c(pq_vars, twi_vars)),
    fo_vars
  )
  if (length(missing_from_fo) > 0) {
    fo_vars <- unique(c(fo_vars, missing_from_fo))
    cat(sprintf(
      "NOTE: Adding %s to FO() to satisfy heredity for PQ/TWI terms.\n",
      paste(missing_from_fo, collapse = ", ")
    ))
  }

  # ── Build macro formula parts ────────────────────────────────────────────
  rsm_parts <- character(0)

  if (length(fo_vars) > 0)
    rsm_parts <- c(rsm_parts,
      paste0("FO(", paste(fo_vars, collapse = ", "), ")"))

  if (length(pq_vars) > 0)
    rsm_parts <- c(rsm_parts,
      paste0("PQ(", paste(pq_vars, collapse = ", "), ")"))

  if (length(twi_vars) > 0)
    rsm_parts <- c(rsm_parts,
      paste0("TWI(", paste(twi_vars, collapse = ", "), ")"))

  # Plain partial interactions (vars not all in FO) stay as individual x:y terms
  # These are appended after the macros as plain formula terms
  plain_interaction_parts <- twi_pairs_partial

  # ── Assemble formula ─────────────────────────────────────────────────────
  # Order: covariate terms | RSM macros | plain partial interactions
  rhs_parts <- unique(c(covariate_terms, rsm_parts, plain_interaction_parts))

  if (length(rhs_parts) == 0) {
    warning("bsky_refit_as_rsm: no terms to fit, returning intercept-only lm.")
    return(lm(as.formula(paste(resp_var, "~ 1")),
               data = dataset, na.action = na.exclude))
  }

  rsm_formula <- as.formula(
    paste(resp_var, "~", paste(rhs_parts, collapse = " + "))
  )

  # ── Refit with rsm() using eval/call so $call stores the real dataset name ──
  # Using eval(call("rsm::rsm", ...)) rather than rsm::rsm(...) directly
  # ensures the stored $call shows data = <actual_name> not data = dataset.
  tryCatch({
    cl <- call("rsm", formula = rsm_formula,
                      na.action = quote(na.exclude))
    cl[["data"]] <- as.name(dataset_name)
    eval(cl, envir = list2env(list(rsm = rsm::rsm), parent = .GlobalEnv))
  },
    error = function(e) {
      warning(paste0(
        "bsky_refit_as_rsm: rsm() failed on formula\n  ",
        deparse(rsm_formula),
        "\n  Reason: ", conditionMessage(e),
        "\n  Falling back to lm(). First-principles helpers will be used."
      ))
      # Fallback plain formula: covariate_terms first, then RSM numeric terms
      # Use unique() to avoid duplicates when covariate_terms overlap term_labels
      plain_terms <- unique(c(covariate_terms, term_labels))
      cl2 <- call("lm",
                  formula   = as.formula(paste(resp_var, "~",
                                paste(plain_terms, collapse = " + "))),
                  na.action = quote(na.exclude))
      cl2[["data"]] <- as.name(dataset_name)
      eval(cl2, envir = .GlobalEnv)
    }
  )
}


# ── Helper: enforce strong heredity ──
# For every higher-order term in the selected model, ensures all constituent
# lower-order terms are present. Handles both interaction (A:B) and quadratic
# (I(x^2)) terms. Returns a formula string ready for rsm() or lm().
bsky_rsm_enforce_heredity <- function(full_model, reduced_model, response_var) {
  full_terms <- attr(terms(full_model),  "term.labels")
  red_terms  <- attr(terms(reduced_model), "term.labels")

  required <- character(0)
  for (trm in red_terms) {
    # Interaction terms (contain ":")
    parts <- strsplit(trm, ":")[[1]]
    if (length(parts) > 1) {
      for (sz in 1:(length(parts) - 1)) {
        combos <- combn(parts, sz, paste, collapse = ":")
        required <- c(required, combos)
      }
    }
    # Quadratic terms of the form I(varname^2) — single backslash at R level
    if (grepl("^I\\\\(.*\\\\^2\\\\)$", trm)) {
      lin <- gsub("^I\\\\((.*)\\\\^2\\\\)$", "\\\\1", trm)
      required <- c(required, lin)
    }
  }
  required <- unique(required)

  missing_terms <- setdiff(required, red_terms)
  missing_valid <- intersect(missing_terms, full_terms)
  all_terms     <- unique(c(red_terms, missing_valid))

  if (length(missing_valid) > 0) {
    cat("\nHeredity enforcement added the following lower-order terms:\n")
    cat(" ", paste(missing_valid, collapse = ", "), "\n")
  }

  if (length(all_terms) == 0) return(NULL)   # signal empty selection
  paste(response_var, "~", paste(all_terms, collapse = " + "))
}

# ════════════════════════════════════════════════════════════════════
# STEP 1 — Fit the full RSM model and normalise to rsm class
# ════════════════════════════════════════════════════════════════════
# First, fit with the user's original formula exactly as specified.
# Then extract the expanded individual terms and refit via
# bsky_refit_as_rsm() so the model always carries class "rsm",
# giving full access to $lof, $canonical, steepest() etc. regardless
# of whether the user typed SO(...), FO(...)+PQ(...)+TWI(...), or plain
# individual terms like Temp + I(Temp^2) + Temp:Pressure.

.bsky_initial_full = suppressMessages(rsm::rsm(
  {{selected.dependent | safe}} ~ {{selected.formula | safe}},
  na.action = na.exclude,
  data = {{dataset.name}}
))

# ── Derive numeric predictor names from the fitted model ─────────────────────
# Done here (after fitting) so we use the actual model formula and dataset
# rather than relying on the user to manually list which variables are numeric.
# bsky_get_numeric_predictors() inspects the formula variables and keeps only
# those that are numeric in the dataset — automatically excluding block factors,
# categorical covariates (Paintbox, Position, etc.) and any non-numeric column.
.bsky_num_vars <- bsky_get_numeric_predictors(
  model = .bsky_initial_full,
  data  = {{dataset.name}}
)
cat("Numeric RSM predictors identified:", paste(.bsky_num_vars, collapse = ", "), "\n\n")

# Extract ALL non-numeric covariate terms from the formula (block, categorical
# covariates like Paintbox, Position, etc.). These must be preserved in the
# refit formula even though they are not part of the RSM surface optimisation.
.bsky_full_tlabs_raw <- attr(terms(.bsky_initial_full), "term.labels")
.bsky_covariate_terms <- character(0)
for (.t in .bsky_full_tlabs_raw) {
  # Only plain names — not interactions or I() terms
  if (!grepl(":", .t, fixed = TRUE) && !grepl("^I\\\\(", .t)) {
    .v <- {{dataset.name}}[[.t]]
    # A term is a covariate (block or categorical) if it exists in the dataset
    # AND is not one of the numeric RSM predictors the user specified.
    # This catches all non-RSM terms regardless of storage type:
    #   - factor columns: Paintbox, Position, Block.ccd-as-factor
    #   - numeric/integer columns: Block.ccd-as-numeric, run order columns etc.
    if (!is.null(.v)) {
      if (.t %in% .bsky_num_vars) {
        next  # already a confirmed numeric RSM predictor
      } else if (is.numeric(.v) || is.integer(.v)) {
        .bsky_cv_vals  <- .v[!is.na(.v)]
        .bsky_uvals    <- sort(unique(.bsky_cv_vals))
        .bsky_n_uvals  <- length(.bsky_uvals)
        .bsky_is_block <- all(.bsky_cv_vals == floor(.bsky_cv_vals)) &&
                          .bsky_n_uvals <= 20 &&
                          all(.bsky_uvals == seq_len(.bsky_n_uvals))
        if (.bsky_is_block) {
          .bsky_covariate_terms <- c(.bsky_covariate_terms, .t)
        } else {
          .bsky_num_vars <- c(.bsky_num_vars, .t)  # safety net
        }
      } else {
        .bsky_covariate_terms <- c(.bsky_covariate_terms, .t)
      }
    }
  }
}
# Keep backward compatibility: .bsky_block_term = first covariate if any
.bsky_block_term <- if (length(.bsky_covariate_terms) > 0) .bsky_covariate_terms else NULL

# ── Split covariate terms into two groups for stepwise handling ───────────────
# Block terms (integer columns with consecutive IDs like 1,2,3,...,6) are
# FORCED into the model at every step — they are structural design terms, not
# scientifically optional. Categorical covariates (factor/character columns like
# Paintbox, Position) ARE candidates for stepwise selection — they should enter
# or exit based on significance just like numeric terms.
.bsky_block_terms <- character(0)       # forced-in structural terms
.bsky_categ_terms <- character(0)       # optional categorical covariates

for (.ct in .bsky_covariate_terms) {
  .cv <- {{dataset.name}}[[.ct]]
  if (!is.null(.cv)) {
    # ── Block ID heuristic applied to BOTH factor and numeric columns ────────
    # DoE design objects store Block.ccd as a factor with levels "1","2",...,"6"
    # (consecutive integer strings). Paintbox/Position have non-integer levels
    # like "Left","Right","Top","Bottom". We detect block columns by testing
    # whether all unique values, when converted to numeric, form a consecutive
    # integer sequence starting at 1 — regardless of the storage class.
    .cv_vals <- suppressWarnings(as.numeric(as.character(.cv)))
    .is_numeric_vals <- !any(is.na(.cv_vals))

    if (.is_numeric_vals) {
      # All values convert cleanly to numeric — apply block ID heuristic
      .uvals  <- sort(unique(.cv_vals))
      .n_uvals <- length(.uvals)
      .is_block_id <- all(.cv_vals == floor(.cv_vals), na.rm = TRUE) &&
                      .n_uvals <= 20 &&
                      all(.uvals == seq_len(.n_uvals))
    } else {
      .is_block_id <- FALSE   # non-numeric levels (Left/Right etc.) → not a block
    }

    if (.is_block_id) {
      # Consecutive integer IDs → block structural term, always forced in
      .bsky_block_terms <- c(.bsky_block_terms, .ct)
    } else {
      # Non-block covariate (Paintbox, Position etc.) → stepwise candidate
      .bsky_categ_terms <- c(.bsky_categ_terms, .ct)
    }
  }
}

if (length(.bsky_block_terms) > 0) {
  cat("Block/structural terms (forced into model at every stepwise step):", paste(.bsky_block_terms, collapse=", "), "\n")
} else {
  cat("NOTE: No block term detected in formula.\n")
  cat("If your design is blocked, you may add the block column BEFORE the RSM macro:\n")
  cat("e.g., Blocks + SO(Temp, Pressure, Thinner)\n")
  cat("or    Block.ccd + FO(Temp, Pressure) + PQ(Temp, Pressure) + TWI(Temp, Pressure)\n\n")
}
if (length(.bsky_categ_terms) > 0)
  cat("Categorical covariates (stepwise candidates):", paste(.bsky_categ_terms, collapse=", "), "\n")
cat("\n")

# Get expanded individual numeric terms from the fitted model
.bsky_full_lm_ref  <- bsky_rsm_to_lm(.bsky_initial_full, {{dataset.name}})
.bsky_full_tlabs   <- attr(terms(.bsky_full_lm_ref), "term.labels")

.bsky_orig_formula_str <- deparse(formula(.bsky_initial_full))
.bsky_has_macros <- any(grepl("\\\\b(FO|SO|TWI|PQ|PE)\\\\s*\\\\(", .bsky_orig_formula_str))
if (!.bsky_has_macros) {
  cat("\nNote:\n") 
  cat("      The formula you entered does not contain RSM macros (FO, SO, TWI, PQ).\n")
  cat("      The model has been automatically refit using RSM macros:\n")
  cat("      Main effects => FO(), I(x^2) quadratic terms => PQ(), x:y interactions => TWI()\n")
  cat("     This ensures all RSM outputs (canonical analysis, steepest ascent, contour plots are available. Coefficient estimates are identical)\n")
  cat("     Otherwise, lm() model will be used that cannot support important RSM specific anaysis/outputs mentioned above.\n\n")

  #BSkyFormat(" ")
}



# Refit as proper rsm object with macros
{{selected.modelname | safe}}_full <- suppressMessages(bsky_refit_as_rsm(
  term_labels  = .bsky_full_tlabs,
  resp_var     = "{{selected.dependent | safe}}",
  numeric_vars = .bsky_num_vars,
  dataset_name = "{{dataset.name}}",
  covariate_terms = .bsky_covariate_terms   # all covariates for the full model
))

cat("\nFull model class:", class({{selected.modelname | safe}}_full), "\n")

# ════════════════════════════════════════════════════════════════════
# STEP 2 — Stepwise selection (runs only when the checkbox is ticked)
# ════════════════════════════════════════════════════════════════════
if ({{selected.stepwiseChk | safe}}) {

  .bsky_method    <- "{{selected.stepwiseMethod | safe}}"
  .bsky_criterion <- "{{selected.stepwiseCriterion | safe}}"
  .bsky_a_enter   <- as.numeric("{{selected.alphaEnter | safe}}")
  .bsky_a_remove  <- as.numeric("{{selected.alphaRemove | safe}}")
  .bsky_hier      <- {{selected.hierarchyChk | safe}}
  
  .bsky_detail    <- {{selected.showStepDetailChk | safe}}

 BSkyFormat(" ")
  cat("\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n")
  cat("  Stepwise Model Selection for RSM\n")
  cat("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n")
  cat("  Method          :", .bsky_method, "\n")
  if (.bsky_method %in% c("stepwise", "forward")) cat("  Alpha to enter  :", .bsky_a_enter, "\n")
  if (.bsky_method %in% c("stepwise", "backward")) cat("  Alpha to remove :", .bsky_a_remove, "\n")
  if (.bsky_method == "forward_ic") cat("  IC criterion    :", .bsky_criterion, "\n")
  cat("  Hierarchy       :", ifelse(.bsky_hier, "Required at each step", "Not enforced"), "\n")
  cat("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n\n")

  # Full-model baseline statistics — suppress near-stationary-ridge warnings
  # since summary.rsm() calls canonical() internally and may emit this warning
  # repeatedly. The user has already seen it from the primary model fit.
  .bsky_full_smry <- suppressMessages(summary({{selected.modelname | safe}}_full))
  .bsky_full_r2      <- .bsky_full_smry$r.squared
  .bsky_full_r2adj   <- .bsky_full_smry$adj.r.squared
  .bsky_full_press   <- bsky_rsm_press({{selected.modelname | safe}}_full)
  .bsky_full_r2pred  <- bsky_rsm_r2pred({{selected.modelname | safe}}_full)
  .bsky_full_aic     <- AIC({{selected.modelname | safe}}_full)
  .bsky_full_aicc    <- bsky_rsm_aicc({{selected.modelname | safe}}_full)
  .bsky_full_bic     <- BIC({{selected.modelname | safe}}_full)
  .bsky_n_full       <- length(coef({{selected.modelname | safe}}_full))

  cat("Full model (before selection):\n")
  cat(sprintf("  Terms            : %d\n", .bsky_n_full))
  cat(sprintf("  R\u00b2               : %.4f\n", .bsky_full_r2))
  cat(sprintf("  R\u00b2(adj)          : %.4f\n", .bsky_full_r2adj))
  cat(sprintf("  R\u00b2(pred/PRESS)   : %.4f\n", .bsky_full_r2pred))
  cat(sprintf("  PRESS            : %.4f\n", .bsky_full_press))
  cat(sprintf("  AIC              : %.4f\n", .bsky_full_aic))
  cat(sprintf("  AICc             : %.4f\n", .bsky_full_aicc))
  cat(sprintf("  BIC              : %.4f\n\n", .bsky_full_bic))

  # ── KEY FIX: expand rsm to a plain lm using actual fitted term labels ──
  # step() and stepAIC() cannot handle rsm macros like SO(); we must pass them
  # a standard lm whose formula uses the already-expanded individual terms.
  .bsky_full_lm <- bsky_rsm_to_lm({{selected.modelname | safe}}_full, {{dataset.name}})

  # Build the stepwise candidate pool:
  #   - Numeric RSM terms (main, quadratic, interaction) from .bsky_full_lm
  #   - Categorical covariate terms (Paintbox, Position etc.) — optional candidates
  #   - Block terms are EXCLUDED from candidates — they are forced-in structural terms
  .bsky_all_terms_ref <- c(
    attr(terms(.bsky_full_lm), "term.labels"),  # numeric RSM terms
    .bsky_categ_terms                            # optional categorical covariates
  )
  # Remove block terms — they are always in the model, never candidates
  .bsky_all_terms_ref <- .bsky_all_terms_ref[
    !.bsky_all_terms_ref %in% .bsky_block_terms
  ]

  # ── Run selection ──────────────────────────────────────────────────────────
  if (.bsky_method == "forward_ic") {

    require(MASS)
    .bsky_k_ic    <- if (.bsky_criterion == "BIC") log(nrow({{dataset.name}})) else 2
    .bsky_ic_label <- .bsky_criterion   # "AICc" or "BIC" — used in our own trace

    # ── Build the upper scope for stepAIC ────────────────────────────────────
    # The scope must include ALL candidate terms: numeric RSM terms AND
    # categorical covariates (Paintbox, Position etc.).
    # Block terms are forced into the lower bound so they are always present.
    .bsky_fwdic_lower_rhs <- if (length(.bsky_block_terms) > 0)
      paste(.bsky_block_terms, collapse = " + ")
    else "1"

    # Build upper formula from all terms in the candidate pool + block terms
    .bsky_fwdic_all_terms <- c(.bsky_block_terms, .bsky_all_terms_ref)
    .bsky_fwdic_upper_fmla <- as.formula(paste(
      "{{selected.dependent | safe}} ~",
      paste(unique(.bsky_fwdic_all_terms), collapse = " + ")
    ))

    .bsky_scope <- list(
      lower = as.formula(paste("{{selected.dependent | safe}} ~",
                               .bsky_fwdic_lower_rhs)),
      upper = .bsky_fwdic_upper_fmla
    )

    # ── Run stepAIC with trace=FALSE and print our own step table ──────────
    # stepAIC() hardcodes "AIC" as the column header regardless of the penalty k
    # used. To show the correct criterion label (AICc or BIC) we suppress its
    # built-in trace and reproduce a clean table ourselves at each step.

    # Helper: compute the IC value stepAIC uses internally at any model
    bsky_ic_val <- function(model, k_pen) {
      n   <- length(residuals(model))
      rss <- sum(residuals(model)^2)
      p   <- length(coef(model)) + 1
      -n * log(rss / n) + k_pen * p
    }

    # Step 0 — start with block terms forced in (structural terms always present)
    .bsky_fwdic_start_fmla <- as.formula(paste(
      "{{selected.dependent | safe}} ~", .bsky_fwdic_lower_rhs
    ))
    .bsky_current_ic_lm <- lm(.bsky_fwdic_start_fmla,
                               data = {{dataset.name}}, na.action = na.exclude)
    .bsky_ic_null <- extractAIC(.bsky_current_ic_lm, k = .bsky_k_ic)[2]

    if (.bsky_detail) {
      cat(sprintf("\nStart:  %s = %.2f\n", .bsky_ic_label, .bsky_ic_null))
      cat(sprintf("Forced in: %s\n",
                  if (length(.bsky_block_terms) > 0)
                    paste(.bsky_block_terms, collapse = ", ")
                  else "(none)"))
    }

    # Run stepAIC silently — we only use the final selected model from it
    .bsky_step_lm <- MASS::stepAIC(
      .bsky_current_ic_lm,
      scope     = .bsky_scope,
      direction = "forward",
      k         = .bsky_k_ic,
      trace     = FALSE          # suppress built-in AIC-labelled trace
    )

    # ── Reconstruct and print our own step-by-step trace if detail requested ──
    if (.bsky_detail) {
      # Walk forward through the terms stepAIC added (skip block terms already forced in)
      .bsky_final_terms <- attr(terms(.bsky_step_lm), "term.labels")
      .bsky_added_terms <- .bsky_final_terms[!.bsky_final_terms %in% .bsky_block_terms]
      # Start trace from the forced-in baseline (block terms already in model)
      .bsky_trace_terms <- .bsky_block_terms
      .bsky_prev_ic     <- .bsky_ic_null

      for (.bsky_t in .bsky_added_terms) {
        .bsky_trace_terms <- c(.bsky_trace_terms, .bsky_t)
        .bsky_m <- lm(
          as.formula(paste("{{selected.dependent | safe}} ~",
                           paste(.bsky_trace_terms, collapse = " + "))),
          data = {{dataset.name}}, na.action = na.exclude
        )
        .bsky_ic_now <- extractAIC(.bsky_m, k = .bsky_k_ic)[2]
        .bsky_rss    <- sum(residuals(.bsky_m)^2)

        cat(sprintf("\nStep:  %s = %.2f\n", .bsky_ic_label, .bsky_ic_now))
        cat(sprintf("Added: %s\n", .bsky_t))
        cat(sprintf("  RSS = %.2f   %s improvement = %.2f\n",
                    .bsky_rss, .bsky_ic_label, .bsky_prev_ic - .bsky_ic_now))
        .bsky_prev_ic <- .bsky_ic_now
      }
      cat("\n")
    }

  } else {

    .bsky_direction <- switch(.bsky_method,
      "stepwise"  = "both",
      "forward"   = "forward",
      "backward"  = "backward",
      "both"
    )

    # ── Use full-model MSE as the fixed reference variance for all F-tests ──
    # This matches Minitab's behaviour: every candidate term is evaluated with
    # an F-statistic whose denominator is the full-model MSE, not the current
    # step's residual MS. Using the null-model variance (what step() does by
    # default) makes the penalty so large that nothing can enter from an
    # intercept-only start — especially with over-parameterised RSM designs.
    .bsky_full_sigma2 <- summary(.bsky_full_lm)$sigma^2
    .bsky_full_df_res <- .bsky_full_lm$df.residual
    .bsky_all_terms   <- .bsky_all_terms_ref  # already extracted above
    .bsky_resp        <- "{{selected.dependent | safe}}"

    # ── Custom p-value stepwise using full-model MSE as fixed denominator ──
    bsky_pval_fixed_mse <- function(current_terms, candidate_term,
                                    sigma2_full, df_full, dataset, resp) {
      # F-test for adding candidate_term to current_terms, using sigma2_full as
      # the fixed error variance (denominator MS = full-model MSE, not current MSE)
      if (length(current_terms) == 0) {
        f0 <- as.formula(paste(resp, "~ 1"))
      } else {
        f0 <- as.formula(paste(resp, "~", paste(current_terms, collapse = " + ")))
      }
      f1 <- as.formula(paste(resp, "~",
                             paste(c(current_terms, candidate_term), collapse = " + ")))
      m0 <- lm(f0, data = dataset, na.action = na.exclude)
      m1 <- lm(f1, data = dataset, na.action = na.exclude)
      ss_diff <- sum(residuals(m0)^2) - sum(residuals(m1)^2)
      df_diff <- m0$df.residual - m1$df.residual
      if (df_diff <= 0 || sigma2_full <= 0) return(1)
      f_stat <- (ss_diff / df_diff) / sigma2_full
      pf(f_stat, df_diff, df_full, lower.tail = FALSE)
    }

    bsky_pval_remove_fixed_mse <- function(current_terms, remove_term,
                                           sigma2_full, df_full, dataset, resp) {
      # F-test for removing remove_term from current_terms, using sigma2_full
      remaining <- setdiff(current_terms, remove_term)
      if (length(remaining) == 0) {
        f0 <- as.formula(paste(resp, "~ 1"))
      } else {
        f0 <- as.formula(paste(resp, "~", paste(remaining, collapse = " + ")))
      }
      f1 <- as.formula(paste(resp, "~", paste(current_terms, collapse = " + ")))
      m0 <- lm(f0, data = dataset, na.action = na.exclude)
      m1 <- lm(f1, data = dataset, na.action = na.exclude)
      ss_diff <- sum(residuals(m0)^2) - sum(residuals(m1)^2)
      df_diff <- m0$df.residual - m1$df.residual
      if (df_diff <= 0 || sigma2_full <= 0) return(0)
      f_stat <- (ss_diff / df_diff) / sigma2_full
      pf(f_stat, df_diff, df_full, lower.tail = FALSE)
    }

    # ── Identify removable terms: those with no higher-order dependents ──
    bsky_removable_terms <- function(current_terms) {
      # A term is removable only if no other term in the model requires it
      # for hierarchy. E.g. cannot remove x1 if x1:x2 or I(x1^2) is present.
      sapply(current_terms, function(t) {
        dependents <- current_terms[current_terms != t]
        # Check if any remaining term has t as a constituent
        has_dependent <- any(sapply(dependents, function(d) {
          parts_d <- strsplit(d, ":")[[1]]
          # t is a constituent of interaction d
          is_interaction_parent <- length(parts_d) > 1 && (t %in% parts_d)
          # t is the linear base of I(t^2)
          is_quadratic_base <- grepl(paste0("^I\\\\(", t, "\\\\^2\\\\)$"), d)
          is_interaction_parent || is_quadratic_base
        }))
        !has_dependent
      })
    }

    # ── Main stepwise loop ────────────────────────────────────────────────
    # "stepwise" (both) and "backward" start from the FULL candidate set PLUS
    # block terms (which are forced structural and must always remain).
    # "forward" alone starts with block terms only (forced), then adds others.
    .bsky_current_terms <- if (.bsky_direction %in% c("both", "backward")) {
      unique(c(.bsky_block_terms, .bsky_all_terms))
    } else {
      .bsky_block_terms   # forward starts with block terms already in
    }
    .bsky_changed <- TRUE
    .bsky_step_count <- 0
    .bsky_max_steps  <- 200   # safety limit

    while (.bsky_changed && .bsky_step_count < .bsky_max_steps) {
      .bsky_changed    <- FALSE
      .bsky_step_count <- .bsky_step_count + 1

      # ── Backward pass runs FIRST when starting from full model ──
      # For "both" and "backward": remove the least significant term first,
      # then (for "both") check if any previously removed term should re-enter.
      if (.bsky_direction %in% c("both", "backward") && length(.bsky_current_terms) > 0) {
        # Block terms are structural — never candidates for removal
        .bsky_removable <- names(which(bsky_removable_terms(.bsky_current_terms)))
        .bsky_removable <- .bsky_removable[!.bsky_removable %in% .bsky_block_terms]

        if (length(.bsky_removable) > 0) {
          .bsky_rem_pvals <- sapply(.bsky_removable, function(rt)
            bsky_pval_remove_fixed_mse(.bsky_current_terms, rt,
                                       .bsky_full_sigma2, .bsky_full_df_res,
                                       {{dataset.name}}, .bsky_resp))
          .bsky_worst_p    <- max(.bsky_rem_pvals)
          .bsky_worst_term <- .bsky_removable[which.max(.bsky_rem_pvals)]

          if (.bsky_worst_p > .bsky_a_remove) {
            if (.bsky_detail) {
              cat(sprintf("  Step %d REMOVE : %-30s  p = %.4f\n",
                          .bsky_step_count, .bsky_worst_term, .bsky_worst_p))
            }
            .bsky_current_terms <- setdiff(.bsky_current_terms, .bsky_worst_term)
            .bsky_changed <- TRUE
          }
        }
      }

      # ── Forward pass: try adding each candidate term ──
      # For "forward" only, or re-entry check in "both" direction.
      if (.bsky_direction %in% c("both", "forward")) {
        .bsky_candidates <- setdiff(.bsky_all_terms, .bsky_current_terms)

        # Enforce hierarchy: only consider terms whose parents are all present
        if (.bsky_hier) {
          .bsky_candidates <- Filter(function(t) {
            parts <- strsplit(t, ":")[[1]]
            # For interactions: all sub-combinations must be in current model
            if (length(parts) > 1) {
              sub_combos <- unlist(lapply(1:(length(parts)-1), function(sz)
                combn(parts, sz, paste, collapse=":", simplify=FALSE)))
              return(all(sub_combos %in% .bsky_current_terms))
            }
            # For quadratics I(x^2): linear term x must be present
            if (grepl("^I\\\\(.*\\\\^2\\\\)$", t)) {
              lin <- gsub("^I\\\\((.*)\\\\^2\\\\)$", "\\\\1", t)
              return(lin %in% .bsky_current_terms)
            }
            TRUE  # main effects are always eligible
          }, .bsky_candidates)
        }

        if (length(.bsky_candidates) > 0) {
          .bsky_pvals <- sapply(.bsky_candidates, function(ct)
            bsky_pval_fixed_mse(.bsky_current_terms, ct,
                                .bsky_full_sigma2, .bsky_full_df_res,
                                {{dataset.name}}, .bsky_resp))
          .bsky_best_p   <- min(.bsky_pvals)
          .bsky_best_term <- .bsky_candidates[which.min(.bsky_pvals)]

          if (.bsky_best_p <= .bsky_a_enter) {
            if (.bsky_detail) {
              cat(sprintf("  Step %d ADD    : %-30s  p = %.4f\n",
                          .bsky_step_count, .bsky_best_term, .bsky_best_p))
            }
            .bsky_current_terms <- c(.bsky_current_terms, .bsky_best_term)
            .bsky_changed <- TRUE
          }
        }
      }

    }

    if (.bsky_detail) cat("\n")

    # Build a minimal lm from the selected terms for heredity enforcement
    if (length(.bsky_current_terms) == 0) {
      .bsky_step_lm <- lm(
        as.formula(paste(.bsky_resp, "~ 1")),
        data = {{dataset.name}}, na.action = na.exclude
      )
    } else {
      .bsky_step_lm <- lm(
        as.formula(paste(.bsky_resp, "~",
                         paste(.bsky_current_terms, collapse = " + "))),
        data = {{dataset.name}}, na.action = na.exclude
      )
    }
  }

  # ── Check selection outcome ──────────────────────────────────────────────
  .bsky_selected_terms <- attr(terms(.bsky_step_lm), "term.labels")

  # Detect the three possible outcomes:
  #   (a) zero terms selected (forward started from empty, nothing entered)
  #   (b) same terms as full model (backward/stepwise removed nothing)
  #   (c) a genuinely reduced subset — proceed with refit
  # "same as full" means selected terms match all candidates PLUS the block
  # terms that are always forced in. For forward_ic the block terms are in the
  # lower bound and always appear in .bsky_selected_terms, so we compare
  # against the union of candidates and forced-in terms.
  .bsky_full_ref_set <- unique(c(.bsky_all_terms_ref, .bsky_block_terms))
  .bsky_same_as_full <- setequal(.bsky_selected_terms, .bsky_full_ref_set)

  if (length(.bsky_selected_terms) == 0) {
    cat("\nNOTE: Stepwise selection found no terms that meet the entry criterion.\n")
    cat("      The full model will be used for all subsequent outputs.\n")
    cat("      Consider: (a) relaxing alpha-to-enter, (b) using Backward elimination,\n")
    cat("      or (c) switching to Forward information criteria (AICc/BIC).\n\n")
    {{selected.modelname | safe}} <- {{selected.modelname | safe}}_full

  } else if (.bsky_same_as_full) {
    if (.bsky_method == "forward_ic") {
      cat("\nNOTE: Forward IC selected the full model — every term group improved\n")
      cat(paste0("      ", .bsky_criterion, " at each step, so no reduction was possible.\n"))
      cat("      The full model is the optimal model by this criterion.\n")
      if (.bsky_criterion == "AICc") {
        cat("      To obtain a reduced model try BIC instead (applies a heavier\n")
        cat("      complexity penalty: log(n) per parameter vs 2 for AICc).\n\n")
      } else {
        cat("      BIC already applies the heaviest standard penalty (log(n) per\n")
        cat("      parameter). To obtain a reduced model try Stepwise or Backward\n")
        cat("      elimination with alpha-to-remove < 0.15.\n\n")
      }
    } else {
      cat("\nNOTE: No terms were removed — all terms in the full model are significant\n")
      cat("      at the specified alpha-to-remove level. The full model is retained.\n")
      cat("      To force reduction consider increasing alpha-to-remove above 0.15.\n\n")
    }
    {{selected.modelname | safe}} <- {{selected.modelname | safe}}_full
    .bsky_final_num_vars <- .bsky_num_vars  # full model retained

  } else {

    # ── Apply heredity enforcement ──────────────────────────────────────────
    .bsky_reduced_formula_str <- bsky_rsm_enforce_heredity(
      .bsky_full_lm, .bsky_step_lm, "{{selected.dependent | safe}}"
    )

    # Guard: if heredity somehow still returns NULL, fall back to full model
    if (is.null(.bsky_reduced_formula_str)) {
      cat("\nNOTE: Heredity enforcement produced an empty formula. Using full model.\n\n")
      {{selected.modelname | safe}} <- {{selected.modelname | safe}}_full
    .bsky_final_num_vars <- .bsky_num_vars  # full model retained

    } else {

      cat("\nSelected model formula (after heredity enforcement):\n")
      cat(" ", .bsky_reduced_formula_str, "\n\n")

      # ── Refit the reduced model as a proper rsm object ──────────────────
      # IMPORTANT: derive term labels from the HEREDITY-ENFORCED formula string,
      # not from .bsky_step_lm which is the pre-heredity stepwise model.
      # bsky_rsm_enforce_heredity() may have added lower-order main effects
      # (e.g. Angle when Speed:Angle was selected but Angle was not) — these
      # must be present in term_labels for bsky_refit_as_rsm to correctly
      # classify all interactions as "full pairs" that go into TWI().
      .bsky_reduced_tlabs <- attr(
        terms(lm(as.formula(.bsky_reduced_formula_str),
                 data = {{dataset.name}}, na.action = na.exclude)),
        "term.labels"
      )

      cat("\nSelected terms (after heredity enforcement):\n")
      cat(" ", paste(.bsky_reduced_tlabs, collapse = ", "), "\n\n")

      # Build covariate_terms for the reduced model:
      # Always include block terms (structural). Include categorical covariates
      # only if stepwise selected them (they appear in .bsky_reduced_tlabs).
      .bsky_selected_categ <- intersect(.bsky_categ_terms, .bsky_reduced_tlabs)
      .bsky_reduced_covariates <- c(.bsky_block_terms, .bsky_selected_categ)

      # Remove selected categorical covariates from term_labels since they go
      # into covariate_terms, not into FO/PQ/TWI macros
      .bsky_rsm_only_tlabs <- .bsky_reduced_tlabs[
        !.bsky_reduced_tlabs %in% .bsky_reduced_covariates
      ]

      # Derive numeric vars actually present in the REDUCED model.
      # .bsky_num_vars holds all numeric vars from the full model — after
      # stepwise some may have been dropped entirely. Extract variable names
      # from the reduced RSM terms (plain names, I(x^2), and x:y interactions)
      # and keep only those confirmed as numeric RSM predictors.
      .bsky_final_num_vars <- intersect(
        unique(unlist(lapply(.bsky_rsm_only_tlabs, function(t) {
          if (grepl(":", t, fixed = TRUE)) {
            strsplit(t, ":", fixed = TRUE)[[1]]          # x:y → c(x,y)
          } else if (grepl("^I\\\\((.+)\\\\^2\\\\)$", t)) {
            sub("^I\\\\((.+)\\\\^2\\\\)$", "\\\\1", t)  # I(x^2) → x
          } else {
            t                                            # plain main effect
          }
        }))),
        .bsky_num_vars
      )

      {{selected.modelname | safe}} <- suppressMessages(bsky_refit_as_rsm(
        term_labels  = .bsky_rsm_only_tlabs,
        resp_var     = "{{selected.dependent | safe}}",
        numeric_vars = .bsky_num_vars,
        dataset_name = "{{dataset.name}}",
        covariate_terms = .bsky_reduced_covariates
      ))

      cat("Reduced model class:", class({{selected.modelname | safe}}), "\n\n")

      # ── Comparison table: full vs reduced model ───────────────────────────
      .bsky_red_smry   <- suppressMessages(summary({{selected.modelname | safe}}))
      .bsky_red_r2     <- .bsky_red_smry$r.squared
      .bsky_red_r2adj  <- .bsky_red_smry$adj.r.squared
      .bsky_red_press  <- bsky_rsm_press({{selected.modelname | safe}})
      .bsky_red_r2pred <- bsky_rsm_r2pred({{selected.modelname | safe}})
      .bsky_red_aic    <- AIC({{selected.modelname | safe}})
      .bsky_red_aicc   <- bsky_rsm_aicc({{selected.modelname | safe}})
      .bsky_red_bic    <- BIC({{selected.modelname | safe}})
      .bsky_n_red      <- length(coef({{selected.modelname | safe}}))

      .bsky_compare <- data.frame(
        Metric        = c("Terms", "R\u00b2", "R\u00b2(adj)", "R\u00b2(pred/PRESS)", "PRESS", "AIC", "AICc", "BIC"),
        Full_model    = round(c(.bsky_n_full, .bsky_full_r2, .bsky_full_r2adj, .bsky_full_r2pred,
                                .bsky_full_press, .bsky_full_aic, .bsky_full_aicc, .bsky_full_bic), 4),
        Reduced_model = round(c(.bsky_n_red,  .bsky_red_r2,  .bsky_red_r2adj,  .bsky_red_r2pred,
                                .bsky_red_press,  .bsky_red_aic,  .bsky_red_aicc,  .bsky_red_bic),  4),
        stringsAsFactors = FALSE
      )

      if (abs(.bsky_red_r2 - .bsky_red_r2pred) > 0.2) {
        cat("WARNING: Gap between R\u00b2 and R\u00b2(pred) exceeds 0.2 in the reduced model.\n")
        cat("         This may indicate overfitting. Consider retaining more terms.\n\n")
      }

      BSkyFormat(.bsky_compare,
                 outputTableRenames = c("Model Selection Summary: Full vs Reduced RSM Model"))
    }
  }

} else {
  # No stepwise — use the full model as fitted
  {{selected.modelname | safe}} <- {{selected.modelname | safe}}_full
  # All full-model numeric vars are in the final model
  .bsky_final_num_vars <- .bsky_num_vars
}

# ════════════════════════════════════════════════════════════════════
# STEP 3 — Display model summary and coefficients (full or reduced)
# ════════════════════════════════════════════════════════════════════

# Numeric predictor names for the FINAL model (full or reduced after stepwise).
# .bsky_final_num_vars is set in each branch above — it contains only the
# numeric RSM predictors that actually appear in the final fitted model.
# Using .bsky_num_vars here would be wrong when stepwise dropped some vars
# entirely, causing contour plots and canonical analysis to reference vars
# not in the model.
bsky_numeric_model_predictors <- .bsky_final_num_vars


convert_lm_type = NULL
convert_lm_type = {{selected.modelname | safe}}

class(convert_lm_type) = "lm"
BSkyFormat(convert_lm_type)
if(!is.null(convert_lm_type)) rm(convert_lm_type)
	

BSky_RSM_Summary_{{selected.modelname | safe}} = withCallingHandlers(
  summary({{selected.modelname | safe}}),
  message = function(m) {
    if (grepl("stationary-ridge|stationary point altered", conditionMessage(m))) {
      cat("NOTE: Near-stationary-ridge situation detected in canonical analysis.\n")
      cat("      The stationary point has been altered. The response surface may have\n")
      cat("      a flat or saddle-shaped region. Interpret canonical results with care.\n")
      cat("      Adjust 'threshold' in canonical() if needed.\n\n")
      invokeRestart("muffleMessage")
    }
  }
)

# ── Helper: compute LOF, canonical, and xs from any lm or rsm object ──────
# When the model is an rsm object fitted with macros, these are read directly
# from summary.rsm. When the model is a plain lm (e.g. after stepwise refit
# without macros, or when user specified a non-macro formula), we compute them
# from first principles so the outputs are always available regardless of
# how the user constructed the original formula.

bsky_rsm_lof <- function(model, dataset, resp_var, numeric_vars) {
  # Produces a combined ANOVA table matching the summary.rsm layout:
  #   Part 1 — Sequential SS decomposition by model term (from anova(model))
  #   Part 2 — Lack-of-fit test rows (Model residual / Lack of fit / Pure error)
  # This ensures the output is identical in structure whether the model is an
  # rsm object (which gets it from summary.rsm) or a plain lm (computed here).
  tryCatch({

    # ── Part 1: sequential SS by term ─────────────────────────────────────
    term_aov   <- anova(model)
    # Drop the Residuals row — we will reattach it as part of Part 2
    resid_row  <- term_aov[nrow(term_aov), , drop = FALSE]
    term_rows  <- term_aov[-nrow(term_aov), , drop = FALSE]

    # Rename columns to match summary.rsm style
    names(term_rows) <- c("Df", "Sum Sq", "Mean Sq", "F value", "Pr(>F)")
    term_rows[["F value"]] <- as.numeric(term_rows[["F value"]])
    term_rows[["Pr(>F)"]]  <- as.numeric(term_rows[["Pr(>F)"]])

    # ── Part 2: LOF test rows ──────────────────────────────────────────────
    grp <- interaction(
      as.data.frame(lapply(dataset[, numeric_vars, drop = FALSE], round, digits = 8)),
      drop = TRUE
    )
    df_aug           <- dataset
    df_aug$.bsky_grp <- grp
    sat_formula      <- as.formula(paste(resp_var, "~ .bsky_grp"))
    sat_model        <- lm(sat_formula, data = df_aug, na.action = na.exclude)
    lof_anova        <- anova(model, sat_model)

    df_lof  <- c(lof_anova[1, 1], lof_anova[2, 3], lof_anova[2, 1])
    ss_lof  <- c(lof_anova[1, 2], lof_anova[2, 4], lof_anova[2, 2])
    lof_rows <- data.frame(
      "Df"      = df_lof,
      "Sum Sq"  = ss_lof,
      "Mean Sq" = ss_lof / df_lof,
      "F value" = c(NA_real_, lof_anova[2, 5], NA_real_),
      "Pr(>F)"  = c(NA_real_, lof_anova[2, 6], NA_real_),
      row.names = c("Residuals", "Lack of fit", "Pure error"),
      check.names = FALSE
    )

    # ── Combine: term rows on top, LOF rows below ──────────────────────────
    full_tbl <- rbind(term_rows, lof_rows)
    full_tbl

  }, error = function(e) {
    cat(paste("NOTE: LOF test could not be computed:", conditionMessage(e), "\n"))
    NULL
  })
}

bsky_rsm_canonical <- function(model, numeric_vars) {
  # Canonical analysis: extract b (linear) and B (quadratic) coefficient
  # vectors/matrix from the fitted model, then compute stationary point
  # xs = -0.5 * B^{-1} * b and eigendecomposition of B.
  tryCatch({
    cf       <- coef(model)
    cf_names <- names(cf)
    k        <- length(numeric_vars)

    # Linear coefficients b — main effect terms
    b <- sapply(numeric_vars, function(v) {
      nm <- cf_names[cf_names == v]
      if (length(nm) == 1) cf[nm] else 0
    })

    # Quadratic coefficient matrix B
    # Diagonal: 0.5 * coef of I(v^2) (factor of 0.5 because d^2/dv^2 of b*v^2 = 2b)
    # Off-diagonal: 0.5 * coef of v1:v2
    B <- matrix(0, k, k, dimnames = list(numeric_vars, numeric_vars))
    for (i in seq_len(k)) {
      v  <- numeric_vars[i]
      nm <- cf_names[grepl(paste0("^I\\\\(", v, "\\\\^2\\\\)$"), cf_names)]
      if (length(nm) == 1) B[i, i] <- cf[nm]   # rsm convention: full coef on diagonal
    }
    for (i in seq_len(k)) {
      for (j in seq_len(k)) {
        if (i >= j) next
        vi <- numeric_vars[i]; vj <- numeric_vars[j]
        # Try both orderings of the interaction term name
        nm <- cf_names[cf_names %in% c(paste0(vi, ":", vj), paste0(vj, ":", vi))]
        if (length(nm) == 1) {
          B[i, j] <- cf[nm] / 2
          B[j, i] <- cf[nm] / 2
        }
      }
    }

    # Only proceed if B has at least one non-zero quadratic term
    if (all(B == 0)) return(NULL)

    # Stationary point: xs = -0.5 * B^{-1} * b
    xs <- tryCatch(
      as.numeric(-0.5 * solve(B) %*% b),
      error = function(e) rep(NA_real_, k)
    )
    names(xs) <- numeric_vars

    # Eigendecomposition of B
    eig      <- eigen(B)
    eig_vals <- data.frame(Eigenvalue = eig$values,
                           row.names  = paste0("e", seq_len(k)))
    eig_vecs <- as.data.frame(eig$vectors)
    rownames(eig_vecs) <- numeric_vars
    colnames(eig_vecs) <- paste0("e", seq_len(k))

    list(xs = xs, eigen = list(values = eig_vals, vectors = eig_vecs))
  }, error = function(e) {
    cat(paste("NOTE: Canonical analysis could not be computed:", conditionMessage(e), "\n"))
    NULL
  })
}

bsky_rsm_steepest <- function(model, numeric_vars,
                               dist = seq(0, 5, by = 0.5),
                               descent = FALSE) {
  # Ridge analysis (Draper 1963) — computes the path of steepest ascent or
  # descent for a second-order response surface without requiring an rsm object.
  #
  # Algorithm: for each distance d, find the scalar lambda such that the
  # constrained optimum x*(lambda) = -(B + lambda*I)^{-1} * b/2 satisfies
  # ||x*(lambda)||^2 = d^2. Then compute yhat at that point.
  # For ascent: seek lambda < -lambda_min(B) so (B+lI) is negative definite
  # For descent: seek lambda > -lambda_max(B) so (B+lI) is positive definite

  tryCatch({
    cf       <- coef(model)
    cf_names <- names(cf)
    k        <- length(numeric_vars)

    # ── Extract b (linear) and B (quadratic) from fitted coefficients ──────
    b0 <- if ("(Intercept)" %in% cf_names) cf["(Intercept)"] else 0

    b <- sapply(numeric_vars, function(v) {
      nm <- cf_names[cf_names == v]
      if (length(nm) == 1) cf[nm] else 0
    })

    B <- matrix(0, k, k, dimnames = list(numeric_vars, numeric_vars))
    for (i in seq_len(k)) {
      v  <- numeric_vars[i]
      nm <- cf_names[grepl(paste0("^I\\\\(", v, "\\\\^2\\\\)$"), cf_names)]
      if (length(nm) == 1) B[i, i] <- cf[nm]
    }
    for (i in seq_len(k)) {
      for (j in seq_len(k)) {
        if (i >= j) next
        vi <- numeric_vars[i]; vj <- numeric_vars[j]
        nm <- cf_names[cf_names %in% c(paste0(vi, ":", vj), paste0(vj, ":", vi))]
        if (length(nm) == 1) { B[i,j] <- cf[nm]/2; B[j,i] <- cf[nm]/2 }
      }
    }

    # If no quadratic terms present, use linear steepest ascent direction
    has_quadratic <- any(diag(B) != 0) || any(B[upper.tri(B)] != 0)

    if (!has_quadratic) {
      # First-order model: steepest direction is proportional to b
      b_norm <- sqrt(sum(b^2))
      if (b_norm == 0) {
        cat("NOTE: All linear coefficients are zero — path of steepest ascent undefined.\n")
        return(NULL)
      }
      direction <- if (descent) -b / b_norm else b / b_norm
      path <- do.call(rbind, lapply(dist, function(d) {
        x_pt  <- d * direction
        yhat  <- as.numeric(b0 + sum(b * x_pt))
        row        <- as.data.frame(t(round(x_pt, 4)))
        names(row) <- numeric_vars
        row$dist   <- round(d, 4)
        row[["| "]] <- "|"
        row$yhat   <- round(yhat, 4)
        row
      }))
      path <- path[, c("dist", numeric_vars, "| ", "yhat")]
      return(path)
    }

    # ── Second-order: ridge analysis ────────────────────────────────────────
    eig_B  <- eigen(B, symmetric = TRUE)
    lam_B  <- eig_B$values   # eigenvalues of B, decreasing order

    # For ascent (descent=FALSE): we want (B + lam*I) negative semi-definite
    # => lam < -max(lam_B). Search from just below -max(lam_B) downward.
    # For descent (descent=TRUE): we want (B + lam*I) positive semi-definite
    # => lam > -min(lam_B). Search from just above -min(lam_B) upward.
    if (descent) {
      lam_bound <- -min(lam_B)
      lam_search <- function(d) {
        # f(lam) = ||x*(lam)||^2 - d^2; find root for lam > lam_bound
        f <- function(lam) {
          Bl <- B + lam * diag(k)
          Bl_inv <- tryCatch(solve(Bl), error = function(e) NULL)
          if (is.null(Bl_inv)) return(Inf)
          x_star <- -0.5 * Bl_inv %*% b
          sum(x_star^2) - d^2
        }
        # upper search limit
        lam_hi <- lam_bound + 1000
        for (trial in 1:50) {
          if (f(lam_hi) < 0) break
          lam_hi <- lam_hi * 10 + 1000
        }
        tryCatch(
          uniroot(f, c(lam_bound + 1e-8, lam_hi), tol = 1e-10)$root,
          error = function(e) NA_real_
        )
      }
    } else {
      lam_bound <- -max(lam_B)
      lam_search <- function(d) {
        f <- function(lam) {
          Bl <- B + lam * diag(k)
          Bl_inv <- tryCatch(solve(Bl), error = function(e) NULL)
          if (is.null(Bl_inv)) return(-Inf)
          x_star <- -0.5 * Bl_inv %*% b
          sum(x_star^2) - d^2
        }
        lam_lo <- lam_bound - 1000
        for (trial in 1:50) {
          if (f(lam_lo) > 0) break
          lam_lo <- lam_lo - 1000
        }
        tryCatch(
          uniroot(f, c(lam_lo, lam_bound - 1e-8), tol = 1e-10)$root,
          error = function(e) NA_real_
        )
      }
    }

    # ── Build path table ─────────────────────────────────────────────────────
    path_rows <- lapply(dist, function(d) {
      if (d == 0) {
        x_pt <- rep(0, k)
        yhat <- as.numeric(b0)
      } else {
        lam  <- lam_search(d)
        if (is.na(lam)) return(NULL)
        Bl     <- B + lam * diag(k)
        Bl_inv <- tryCatch(solve(Bl), error = function(e) NULL)
        if (is.null(Bl_inv)) return(NULL)
        x_pt   <- as.numeric(-0.5 * Bl_inv %*% b)
        yhat   <- as.numeric(b0 + sum(b * x_pt) + t(x_pt) %*% B %*% x_pt)
      }
      row        <- as.data.frame(t(round(x_pt, 4)))
      names(row) <- numeric_vars
      row$dist   <- round(d, 4)
      row[["| "]] <- "|"
      row$yhat   <- round(yhat, 4)
      row
    })

    path_rows <- Filter(Negate(is.null), path_rows)
    if (length(path_rows) == 0) return(NULL)

    path <- do.call(rbind, path_rows)
    path <- path[, c("dist", numeric_vars, "| ", "yhat")]
    rownames(path) <- NULL
    path

  }, error = function(e) {
    cat(paste("NOTE: Steepest ascent path could not be computed:", conditionMessage(e), "\n"))
    NULL
  })
}



# ── Retrieve or compute lof and canonical ───────────────────────────────────
# If the model is a proper rsm object (fitted with macros), use summary.rsm
# directly. If it is a plain lm (macro-free formula or stepwise lm fallback),
# compute from first principles so outputs are never NULL.
if (inherits({{selected.modelname | safe}}, "rsm")) {
  .bsky_lof       <- BSky_RSM_Summary_{{selected.modelname | safe}}\$lof
  .bsky_canonical <- BSky_RSM_Summary_{{selected.modelname | safe}}\$canonical
} else {
  .bsky_lof       <- bsky_rsm_lof({{selected.modelname | safe}},
                                   {{dataset.name}},
                                   "{{selected.dependent | safe}}",
                                   .bsky_num_vars)
  .bsky_canonical <- bsky_rsm_canonical({{selected.modelname | safe}}, .bsky_num_vars)
}

#Analysis of Variance Table
BSkyFormat(.bsky_lof, outputTableRenames = c("Analysis of Variance - Response: {{selected.dependent | safe}}"))

#Stationary point of response surface
if (!is.null(.bsky_canonical))
  BSkyFormat(as.data.frame(t(.bsky_canonical\$xs)),
             outputTableRenames = c("Stationary point of response surface"))

#Eigenanalysis
BSkyFormat("Eigen analysis: eigen() decomposition")
if (!is.null(.bsky_canonical))
  BSkyFormat(.bsky_canonical\$eigen, outputTableIndex = c(1,2),
             outputTableRenames = c("Eigen Values", "Eigen Vectors"))

#Display Contour(Plots)
BSkyFormat("Display Contour(Plots)")
par(mfrow=c(1,1))
if({{selected.generateContourPlotChk | safe}}) graphics::contour({{selected.modelname | safe}}, reformulate(bsky_numeric_model_predictors), image=TRUE, at=summary({{selected.modelname | safe}}\$canonical$xs))

#Display the Response Surface (Plots)
BSkyFormat("Display the Response Surface (Plots)")
par(mfrow=c(1,1))
if({{selected.generateRSMPlotChk | safe}}) suppressWarnings(graphics::persp({{selected.modelname | safe}}, reformulate(bsky_numeric_model_predictors), image = TRUE,at = c(summary({{selected.modelname | safe}}\$canonical$xs), Block="B2"),theta=30,zlab="{{selected.dependent | safe}} in MPa",col.lab=33,contour="colors"))

#Show Path of steepest ascent from ridge analysis
if({{selected.generatePathSteepestAscentChk | safe}}) {
  if (inherits({{selected.modelname | safe}}, "rsm")) {
    # rsm object — use native steepest() in coded units
    BSkyFormat(rsm::steepest({{selected.modelname | safe}}),
               outputTableRenames = c("Path of steepest ascent from ridge analysis (coded units)"))
  } else {
    # plain lm — compute ridge analysis from first principles
    .bsky_steep <- bsky_rsm_steepest({{selected.modelname | safe}}, .bsky_num_vars)
    if (!is.null(.bsky_steep))
      BSkyFormat(.bsky_steep,
                 outputTableRenames = c("Path of steepest ascent from ridge analysis (natural units)"))
  }
}

# Optionally show hand-computed steepest path in natural units regardless of model type
if (FALSE) { # meant to check whether steepestHandComputedChk is checked to show natural units
  .bsky_steep_hc <- bsky_rsm_steepest({{selected.modelname | safe}}, .bsky_num_vars)
  if (!is.null(.bsky_steep_hc))
    BSkyFormat(.bsky_steep_hc,
               outputTableRenames = c("Path of steepest ascent — hand-computed in natural (un-coded) units"))
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
	
	{{if(options.selected.showResidualPlotsChk === "TRUE" )}} 
			bsky_resids = NULL
			bsky_resids = bsky_plot_residuals(model = {{selected.modelname | safe}},  residual_type = NULL, grouping_var_label = c(""), flipaxisPPplot = {{selected.flipaxisPPplotChk | safe}}, deGroupPlots = {{selected.deGroupPlotsChk | safe}})
			bsky_normality_test(dataVar = bsky_resids, dataVarName = "Residuals", Shapiro = {{selected.checkShapiroNormalityTestChk | safe}}, Anderson = {{selected.checkADNormalityTestChk | safe}})
	{{/if}}
	
	# ── Set BlueSky metadata attributes on the final RSM model ──────────────
	# BSkyPredict() and other BlueSky evaluation functions require these custom
	# attributes to be present on any model object. They are normally attached
	# when a model is fitted through the BlueSky UI, but must be set explicitly
	# here so that the saved RSM model works correctly in downstream dialogs
	# (predictions, model evaluation, convert RSM to LM, etc.).
	tryCatch({
    #bsky_live_dataset  <- get("{{dataset.name}}", envir = .GlobalEnv)
    bsky_dep_var_name  <- "{{selected.dependent | safe}}"

    # Use bsky_get_numeric_predictors() — already defined above — to correctly
    # extract predictor names from RSM macro formulas (SO, FO, TWI, PQ etc.)
    # as well as plain lm-style formulas. all.vars() alone is not reliable
    # when RSM macros are present because it parses macro names as symbols.
    bsky_indep_names   <- bsky_get_numeric_predictors(
                              model = {{selected.modelname | safe}},
                              data  ={{dataset.name}}
                          )
    bsky_indep_in_data <- intersect(bsky_indep_names, names({{dataset.name}}))

    # classDepVar: R class of the response variable in the dataset
    attr({{selected.modelname | safe}}, "classDepVar")  <- class({{dataset.name}}[[bsky_dep_var_name]])
	
	# indepVars: independent variable names present in the dataset
		attr({{selected.modelname | safe}}, "indepVars") <- bsky_indep_in_data
	
	# depVar: response variable name as a string
		attr({{selected.modelname | safe}}, "depVar") <- bsky_dep_var_name
		
    # Re-assign model with attributes back to .GlobalEnv
    assign("{{selected.modelname | safe}}_{{dataset.name}}", {{selected.modelname | safe}}, envir = .GlobalEnv)

    # ── Create expanded lm companion model ───────────────────────────────────
    # If the final model uses RSM macros (FO, SO, TWI, PQ etc.), create a
    # companion plain lm model named {{selected.modelname | safe}}_lm with all
    # macros expanded to individual terms (Temp, I(Temp^2), Temp:Pressure etc.)
    # This is useful for standard lm-based diagnostics, predict(), and tools
    # that do not recognise the rsm class.
    # The companion model is NOT created when the final model is already a
    # plain lm (no macros) — it would be identical and redundant.
    .bsky_final_formula_str <- paste(
      deparse(formula({{selected.modelname | safe}})), collapse = " "
    )
    .bsky_final_has_macros <- any(grepl(
      "\\\\b(FO|SO|TWI|PQ|PE)\\\\s*\\\\(", .bsky_final_formula_str
    ))

     if (.bsky_final_has_macros) {
		  # Expand macros to individual terms using bsky_rsm_to_lm().
          # bsky_rsm_to_lm() builds the lm with a local 'fmla' variable which
          # appears in $call as the symbol 'fmla' rather than the real formula.
          # We rebuild the lm directly with an explicit formula string and the
          # real dataset name so that $call is fully self-contained and
          # downstream tools (formula(), predict(), anova() etc.) work correctly.
          .bsky_expanded_tlabs <- attr(
            terms(bsky_rsm_to_lm({{selected.modelname | safe}}, {{dataset.name}})),
            "term.labels"
          )
          .bsky_companion_fmla <- as.formula(paste(
            "{{selected.dependent | safe}} ~",
            paste(.bsky_expanded_tlabs, collapse = " + ")
          ))
          # Refit with explicit formula and real dataset name so $call stores both
          .bsky_companion_call <- call("lm",
            formula   = .bsky_companion_fmla,
            na.action = quote(na.exclude)
          )
          .bsky_companion_call[["data"]] <- as.name("{{dataset.name}}")
          .bsky_lm_companion <- eval(.bsky_companion_call, envir = .GlobalEnv)

          # Store with same BSky metadata attributes as the primary model
          attr(.bsky_lm_companion, "classDepVar") <- class({{dataset.name}}[[bsky_dep_var_name]])
          attr(.bsky_lm_companion, "indepVars")   <- bsky_indep_in_data
          attr(.bsky_lm_companion, "depVar")      <- bsky_dep_var_name
          assign("{{selected.modelname | safe}}_lm_{{dataset.name}}", .bsky_lm_companion, envir = .GlobalEnv)
		  
		  cat("NOTE: A companion linear i.e., lm model '{{selected.modelname | safe}}_lm_{{dataset.name}}' has been created in addition to the rsm model '{{selected.modelname | safe}}_{{dataset.name}}' ")
		  cat("with all RSM macros (i.e., FO, TWI, PQ, SO) expanded to individual terms.\n")
		  cat("Use '{{selected.modelname | safe}}_lm_{{dataset.name}}' model for standard lm-based diagnostics and predictions using analysis menus under MODEL EVALUATION on the top menu bar.\n")
    }

	}, error = function(e) {
		warning("Could not set BSky metadata attributes on {{selected.modelname | safe}}: ", e$message)
	})

	
	# ════════════════════════════════════════════════════════════════════
	# STEP 4 — Observation Diagnostics
	# ════════════════════════════════════════════════════════════════════
	{{if(options.selected.observationDiagnosticsChk === "TRUE")}}
		# Observation diagnostics table — uses the final RSM model
		# (full or reduced after stepwise) which includes block and all terms.
		tryCatch({
		  bsky_rsm_p <- length(coef({{selected.modelname | safe}}))
		  bsky_rsm_n <- nrow({{selected.modelname | safe}}$model)
		  bsky_rsm_dffits_threshold <- 2 * sqrt(bsky_rsm_p / bsky_rsm_n)

		  bsky_rsm_diag_df <- data.frame(
		    Obs       = seq_len(bsky_rsm_n),
		    Fitted    = round(fitted({{selected.modelname | safe}}),    BSkyGetDecimalDigitSetting()),
		    Residual  = round(residuals({{selected.modelname | safe}}), BSkyGetDecimalDigitSetting()),
		    Std.Resid = round(rstandard({{selected.modelname | safe}}), BSkyGetDecimalDigitSetting()),
		    HI        = round(hatvalues({{selected.modelname | safe}}), BSkyGetDecimalDigitSetting()),
		    Cooks.D   = round(cooks.distance({{selected.modelname | safe}}), BSkyGetDecimalDigitSetting()),
		    DFFITS    = round(dffits({{selected.modelname | safe}}),    BSkyGetDecimalDigitSetting())
		  )

		  bsky_rsm_diag_df$Unusual <- ifelse(
		    abs(bsky_rsm_diag_df$Std.Resid) > 2 & bsky_rsm_diag_df$Cooks.D > 1, "RC",
		    ifelse(abs(bsky_rsm_diag_df$Std.Resid) > 2,                           "R",
		    ifelse(bsky_rsm_diag_df$HI > 2 * mean(bsky_rsm_diag_df$HI),           "X",
		    ifelse(bsky_rsm_diag_df$Cooks.D > 1,                                  "C",
		    ifelse(abs(bsky_rsm_diag_df$DFFITS) > bsky_rsm_dffits_threshold,      "D", "")))))

		  BSkyFormat(bsky_rsm_diag_df, singleTableOutputHeader = "Observation Diagnostics")

		  cat("Unusual observation flags:\n",
		      "  R  = |Std. Residual| > 2 (large residual)\n",
		      "  X  = Leverage > 2 * mean leverage (high influence point)\n",
		      "  C  = Cook\'s D > 1 (highly influential observation)\n",
		      "  D  = |DFFITS| > 2*sqrt(p/n) =", round(bsky_rsm_dffits_threshold, 3), "\n",
		      "  RC = both large residual AND highly influential\n")

		  if (length(unique(round(bsky_rsm_diag_df$HI, 8))) == 1)
		    cat("Note: All leverage values equal (", round(bsky_rsm_diag_df$HI[1], 4),
		        ") - expected for a balanced CCD with a near-saturated model.\n")

		  rm(bsky_rsm_p, bsky_rsm_n, bsky_rsm_dffits_threshold, bsky_rsm_diag_df)

		}, error = function(e) {
		  cat("Observation diagnostics could not be computed:", conditionMessage(e), "\n")
		})
	{{/if}}

	# ════════════════════════════════════════════════════════════════════
	# STEP 5 — Variance Inflation Factors (main effects model)
	# ════════════════════════════════════════════════════════════════════
	{{if(options.selected.VIFChk === "TRUE")}}
		# VIF computed on main effects only model — standard Minitab/JMP convention.
		# Interaction and quadratic terms are excluded to avoid artificial inflation.
		# Block terms are included since they are part of the analysis model.
		tryCatch({
		  bsky_rsm_vif_terms <- unique(c(bsky_numeric_model_predictors, .bsky_block_terms))
		  if (length(bsky_rsm_vif_terms) < 2) {
		    cat("VIF requires at least 2 predictors. Skipping.\n")
		  } else {
		    bsky_rsm_vif_formula <- as.formula(
		      paste("{{selected.dependent | safe}} ~", paste(bsky_rsm_vif_terms, collapse = " + "))
		    )
		    bsky_rsm_vif_model <- lm(bsky_rsm_vif_formula,
		                              data      = {{dataset.name}},
		                              na.action = na.exclude)
		    bsky_rsm_vif_result <- car::vif(bsky_rsm_vif_model)

		    # car::vif returns a simple named numeric vector for main-effects-only models
		    bsky_rsm_vif_df <- data.frame(
		      Term = names(bsky_rsm_vif_result),
		      VIF  = round(as.numeric(bsky_rsm_vif_result), BSkyGetDecimalDigitSetting()),
		      Flag = ifelse(as.numeric(bsky_rsm_vif_result) > 4,  "HIGH",
		             ifelse(as.numeric(bsky_rsm_vif_result) > 2,  "MODERATE", ""))
		    )
		    BSkyFormat(bsky_rsm_vif_df,
		               singleTableOutputHeader = "Variance Inflation Factors (Main Effects)")
		    cat("Note: VIF computed on main effects model (Minitab/JMP convention).\n",
		        "      VIF = 1.0 : no collinearity - predictor is orthogonal to all others.\n",
		        "      VIF > 2   : MODERATE - worth investigating.\n",
		        "      VIF > 4   : HIGH - collinearity is problematic.\n",
		        "      VIF > 10  : SEVERE - coefficient estimates are unreliable.\n",
		        "      For a balanced CCD, all VIF values should be close to 1.0.\n")
		    rm(bsky_rsm_vif_formula, bsky_rsm_vif_model, bsky_rsm_vif_result, bsky_rsm_vif_df)
		  }
		}, error = function(e) {
		  cat("VIF could not be computed:", conditionMessage(e), "\n")
		})
	{{/if}}

	#Clean up
	
	# Models
	if(exists("{{selected.modelname | safe}}_full")) rm({{selected.modelname | safe}}_full)
	if(exists("{{selected.modelname | safe}}")) rm({{selected.modelname | safe}})
	if(exists("{{selected.modelname | safe}}_lm")) rm({{selected.modelname | safe}}_lm)
	if(exists("convert_lm_type", envir = .GlobalEnv)) rm(convert_lm_type, envir = .GlobalEnv)
	
    # Other items
	if(exists("BSky_RSM_Summary_{{selected.modelname | safe}}")) rm(BSky_RSM_Summary_{{selected.modelname | safe}})
	bsky_rsm_cleanup_vars <- c(
	  ".bsky_initial_full", ".bsky_num_vars", ".bsky_full_tlabs_raw",
	  ".bsky_covariate_terms", ".bsky_block_term", ".bsky_block_terms",
	  ".bsky_categ_terms", ".bsky_full_lm_ref", ".bsky_full_tlabs",
	  ".bsky_orig_formula_str", ".bsky_has_macros",
	  ".bsky_final_formula_str", ".bsky_final_has_macros",
	  ".bsky_expanded_tlabs", ".bsky_companion_fmla", ".bsky_lm_companion",
	  "bsky_resids"
	)
	for (.bsky_v in bsky_rsm_cleanup_vars)
	  if (exists(.bsky_v, envir = .GlobalEnv)) rm(list = .bsky_v, envir = .GlobalEnv)
	rm(bsky_rsm_cleanup_vars, .bsky_v)
	

\t
`
        };
        var objects = {
            content_var: { el: new srcVariableList(config, {action: "copy", scroll:true}) },
            modelname: {
                el: new input(config, {
                    no: 'modelname',
                    label: localization.en.modelname,
                    placeholder: "",
                    required: true,
                    type: "character",
                    extraction: "TextAsIs",
                    value: "ResponseSurfaceModel1",
                    overwrite: "dataset"
                })
            },
            dependent: {
                el: new dstVariable(config, {
                    label: localization.en.dependent,
                    no: "dependent",
                    filter: "Numeric|Scale",
                    extraction: "NoPrefix|UseComma",
                    required: true,
                }), r: ['{{ var | safe}}']
            },
            formulaBuilder: {
                el: new formulaBuilder(config, {
                    no: "formula",
					filter: "Numeric|Scale",
					style: "mt-2 mb-3",
                    required:true,
                })
            },
			formulaboxhint: { 
				el: new labelVar(config, { 
					label: localization.en.formulaboxhint, 
					style: "ml-5 mb-3", 
					h: 6,
				}) 
			},
			/*
			independent: {
                el: new dstVariableList(config, {
                    label: localization.en.independent,
                    no: "independent",
                    required: true,
                    //filter: "String|Numeric|Logical|Ordinal|Nominal|Scale",
					filter: "Numeric|Scale",
                    extraction: "NoPrefix|UsePlus",
					style: "mt-3 mb-1",
                }), r: ['{{ var | safe}}']
            },   
			*/
            generateContourPlotChk: {
                el: new checkbox(config, {
                    label: localization.en.generateContourPlotChk, 
					no: "generateContourPlotChk",
                    bs_type: "valuebox",
                    //style: "mt-2 mb-3",
					 style: "mt-2",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
			generateRSMPlotChk: {
                el: new checkbox(config, {
                    label: localization.en.generateRSMPlotChk, 
					no: "generateRSMPlotChk",
                    bs_type: "valuebox",
                    //style: "mt-2 mb-3",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
			generatePathSteepestAscentChk: {
                el: new checkbox(config, {
                    label: localization.en.generatePathSteepestAscentChk, 
					no: "generatePathSteepestAscentChk",
                    bs_type: "valuebox",
                   // style: "mt-2 mb-3",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
            steepestHandComputedChk: {
                el: new checkbox(config, {
                    label: localization.en.steepestHandComputedChk,
                    no: "steepestHandComputedChk",
                    bs_type: "valuebox",
                    style: "ml-4 mt-1 mb-3",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
                    newline: true,
                    //state: "unchecked",
                })
            },
			checkShapiroNormalityTestChk: {
                el: new checkbox(config, {
                    label: localization.en.checkShapiroNormalityTestChk, 
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
                    label: localization.en.checkADNormalityTestChk, 
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
                    label: localization.en.showResidualPlotsChk,
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
                    label: localization.en.flipaxisPPplotChk, 
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
                    label: localization.en.deGroupPlotsChk,
					no: "deGroupPlotsChk",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					style: "ml-5",
					newline: true,
                })
            },
			observationDiagnosticsChk: {
                el: new checkbox(config, {
                    label: localization.en.observationDiagnosticsChk,
					no: "observationDiagnosticsChk",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					style: "mt-2",
					newline: true,
                })
            },
			VIFChk: {
                el: new checkbox(config, {
                    label: localization.en.VIFChk,
					no: "VIFChk",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					style: "mt-1",
					newline: true,
                })
            },
            stepwiseSectionLbl: {
                el: new labelVar(config, {
                    label: localization.en.stepwiseSectionLbl,
                    style: "mt-4 mb-1",
                    h: 5,
                })
            },
            stepwiseChk: {
                el: new checkbox(config, {
                    label: localization.en.stepwiseChk,
                    no: "stepwiseChk",
                    bs_type: "valuebox",
                    style: "mt-1 mb-1",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
                    newline: true,
                    state: "unchecked",
                })
            },
            stepwiseMethod: {
                el: new comboBox(config, {
                    no: "stepwiseMethod",
                    label: localization.en.stepwiseMethodLbl,
                    multiple: false,
                    extraction: "NoPrefix|UseComma",
                    style: "ml-4 mt-1 mb-1",
                    options: ["stepwise", "forward", "backward", "forward_ic"],
                    default: "stepwise",
                })
            },
            stepwiseCriterion: {
                el: new comboBox(config, {
                    no: "stepwiseCriterion",
                    label: localization.en.stepwiseCriterionLbl,
                    multiple: false,
                    extraction: "NoPrefix|UseComma",
                    style: "ml-4 mt-1 mb-1",
                    options: ["AICc", "BIC"],
                    default: "AICc",
                })
            },
            alphaEnter: {
                el: new input(config, {
                    no: "alphaEnter",
                    label: localization.en.alphaEnterLbl,
                    placeholder: "0.15",
                    allow_spaces: true,
                    extraction: "TextAsIs",
                    style: "ml-4 mt-1 mb-1",
                    value: "0.15",
                })
            },
            alphaRemove: {
                el: new input(config, {
                    no: "alphaRemove",
                    label: localization.en.alphaRemoveLbl,
                    placeholder: "0.15",
                    allow_spaces: true,
                    extraction: "TextAsIs",
                    style: "ml-4 mt-1 mb-1",
                    value: "0.15",
                })
            },
            hierarchyChk: {
                el: new checkbox(config, {
                    label: localization.en.hierarchyChk,
                    no: "hierarchyChk",
                    bs_type: "valuebox",
                    style: "ml-4 mt-1 mb-1",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
                    newline: true,
                    state: "checked",
                })
            },
            showStepDetailChk: {
                el: new checkbox(config, {
                    label: localization.en.showStepDetailChk,
                    no: "showStepDetailChk",
                    bs_type: "valuebox",
                    style: "ml-4 mt-1 mb-1",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
                    newline: true,
                    state: "unchecked",
                })
            },
            stepwiseNote: {
                el: new labelVar(config, {
                    label: localization.en.stepwiseNote,
                    style: "ml-4 mt-2 mb-3",
                    h: 6,
                })
            },
        };
        const content = {
            left: [objects.content_var.el.content],
            right: [objects.modelname.el.content, 
					objects.dependent.el.content, 
					objects.formulaBuilder.el.content, 
                    objects.formulaboxhint.el.content,
					//objects.independent.el.content, 
					
					objects.generateContourPlotChk.el.content,
					objects.generateRSMPlotChk.el.content, 
					objects.generatePathSteepestAscentChk.el.content,
					//objects.steepestHandComputedChk.el.content, 
					
					objects.stepwiseSectionLbl.el.content,
					objects.stepwiseChk.el.content,
					objects.stepwiseMethod.el.content,
					objects.stepwiseCriterion.el.content,
					objects.alphaEnter.el.content,
					objects.alphaRemove.el.content,
					objects.hierarchyChk.el.content,
					objects.showStepDetailChk.el.content,
					objects.stepwiseNote.el.content,
					
					objects.showResidualPlotsChk.el.content, 
					objects.checkADNormalityTestChk.el.content,
					objects.checkShapiroNormalityTestChk.el.content, 
					objects.flipaxisPPplotChk.el.content, 
					objects.deGroupPlotsChk.el.content, 
					objects.observationDiagnosticsChk.el.content,
					objects.VIFChk.el.content,
				],
				
            nav: {
                name: localization.en.navigation,
                icon: "icon-doe",
                modal: config.id
            }
        };
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new RSMFormula().render()