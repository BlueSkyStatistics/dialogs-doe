/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */

var localization = {
    en: {
        title: "Convert DoE Design Object to Plain Data Frame",
        navigation: "Convert Design to Data Frame",

        // ── Info label shown at the top of the dialog ───────────────────────
        lblInfo: "Some standard (non-DoE) analysis and graphics menus expect a plain data.frame. A DoE design dataset (class \"design\") carries extra structure — factor level definitions, run order, block/alias information — that most non-DoE menus do not recognize, which can cause errors such as \"Can't reconstruct data frame\" in dplyr-based analyses. This dialog converts the active dataset to a plain data.frame in a NEW dataset, leaving the original design object untouched so DoE menus (Inspect Design, Modify Design, Export Design, CCD augmentation, etc.) continue to work on it normally.",

        newDatasetName: "New dataset name (optional)",
        newDatasetNameHelp_lbl: "Name for the converted plain data.frame dataset. Leave blank to use '<active dataset name>_df' automatically. If the name entered is not a valid R object name, it will be automatically adjusted and a note will be shown.",

        lbl_note: "If the active dataset is already a plain data.frame (not a DoE design object), no conversion is necessary and no new dataset is created — you can use the active dataset directly with any non-DoE menu.",

        help: {
            title: "Convert DoE Design Object to Plain Data Frame",
            body: `
                <b>Description</b><br/>
                Converts the active dataset to a plain <code>data.frame</code> using
                <code>as.data.frame()</code>, and stores the result as a NEW dataset —
                the original dataset is never modified or overwritten.
                <br/><br/>

                <b>Why this is needed</b><br/>
                Datasets created by DoE dialogs (Create Full Factorial
                Design, Create Regular/Fractional Factorial Design, Create Central
                Composite Design, etc.) carry the R class <code>"design"</code> in
                addition to <code>"data.frame"</code>. This extra class lets DoE-specific
                functions (<code>design.info()</code>, <code>summary.design()</code>,
                CCD/center-point augmentation, alias structure reporting, etc.) work
                correctly.
                <br/><br/>
                Most standard analysis and graphics menus outside the DoE menu — and
                many <code>dplyr</code> / <code>tidyverse</code> operations in
                particular — do not know how to handle this extra class. A common
                symptom is an error such as:
                <br/>
                <code>Error: Can't reconstruct data frame.</code>
                <br/>
                when a design dataset is piped into <code>dplyr::select()</code>,
                <code>dplyr::filter()</code>, or similar verbs, because dplyr cannot
                figure out how to rebuild a valid <code>"design"</code> object from a
                subset of its columns.
                <br/><br/>

                <b>What this dialog does</b><br/>
                <ul>
                  <li>Checks whether the active dataset's class includes <code>"design"</code>.</li>
                  <li>If it does, creates a NEW dataset containing
                      <code>as.data.frame(activeDataset)</code> — a plain data.frame with
                      the same rows and columns, but none of the extra DoE structure.</li>
                  <li>If it does not (the active dataset is already a plain data.frame),
                      no new dataset is created — a message explains that no conversion
                      was necessary.</li>
                  <li>The original dataset is always left completely unchanged, so DoE
                      menus continue to work on it exactly as before.</li>
                </ul>

                <b>Naming the new dataset</b><br/>
                <ul>
                  <li>Leave the name field blank to automatically use
                      <code>&lt;active dataset name&gt;_df</code>.</li>
                  <li>Or specify your own name. If the name is not a syntactically valid
                      R object name, it is automatically adjusted (via
                      <code>make.names()</code>) and a note is shown explaining the
                      change.</li>
                  <li>If a dataset with the resulting name already exists, it will be
                      overwritten — a note is shown when this happens.</li>
                </ul>

                <b>When to use this</b><br/>
                Use this dialog whenever you want to run a standard (non-DoE) analysis,
                graphics, or data-manipulation menu — especially anything based on
                <code>dplyr</code> — on a dataset that was originally created by a DoE
                design dialog.
            `
        },
    }
}


class convertDesignToDataFrame extends baseModal {
    constructor() {
        var config = {
            id: "convertDesignToDataFrame",
            label: localization.en.title,
            modalType: "one",
            RCode: `
# ════════════════════════════════════════════════════════════════════════════
# Convert DoE Design Object to Plain Data Frame
# ════════════════════════════════════════════════════════════════════════════

# ── Determine target dataset name ──────────────────────────────────────────
bsky_conv_raw_name <- {{if(options.selected.newDatasetName !== "")}}'{{selected.newDatasetName | safe}}'{{#else}}paste0('{{dataset.name}}', '_df'){{/if}}

# Sanitize to a syntactically valid R object / dataset name
bsky_conv_target_name <- make.names(bsky_conv_raw_name)

cat(" Convert DoE Design Object to Plain Data Frame\\n")
cat("══════════════════════════════════════════════════════════════════\\n")
cat(sprintf(" Source dataset : %s\\n", "{{dataset.name}}"))

if (bsky_conv_target_name != bsky_conv_raw_name) {
    cat(sprintf(" NOTE: '%s' is not a valid dataset name; using '%s' instead.\\n",
                bsky_conv_raw_name, bsky_conv_target_name))
}

# ── Check the class of the active dataset ──────────────────────────────────
bsky_conv_source_class <- class({{dataset.name}})
cat(sprintf(" Source class   : %s\\n", paste(bsky_conv_source_class, collapse = ", ")))
cat("──────────────────────────────────────────────────────────────────\\n")

if ("design" %in% bsky_conv_source_class) {

    if (exists(bsky_conv_target_name, envir = .GlobalEnv)) {
        cat(sprintf(" NOTE: A dataset named '%s' already exists and will be overwritten.\\n",
                    bsky_conv_target_name))
    }

    # ── Perform the conversion ────────────────────────────────────────────
    assign(bsky_conv_target_name, as.data.frame({{dataset.name}}), envir = .GlobalEnv)

    cat(sprintf(" '%s' is a DoE design object (class: %s).\\n",
                "{{dataset.name}}", paste(bsky_conv_source_class, collapse = ", ")))
    cat(sprintf(" Converted successfully to a plain data.frame: '%s'\\n", bsky_conv_target_name))
    cat(" The original dataset is unchanged \u2014 DoE menus (Inspect Design, Modify\\n")
    cat(" Design, CCD/center-point augmentation, Export Design, etc.) continue to\\n")
    cat(" work on it exactly as before.\\n")
    cat(sprintf(" Use '%s' for standard (non-DoE) analysis and graphics menus,\\n", bsky_conv_target_name))
    cat(" including dplyr-based workflows.\\n")

    # Refresh the dataset explorer / data grid so the new dataset becomes visible
    BSkyLoadRefresh(bsky_conv_target_name)

} else {

    cat(sprintf(" '%s' is already a standard data.frame (class: %s).\\n",
                "{{dataset.name}}", paste(bsky_conv_source_class, collapse = ", ")))
    cat(" No conversion is necessary and no new dataset was created.\\n")
    cat(sprintf(" You can use '%s' directly with any non-DoE analysis or graphics menu.\\n",
                "{{dataset.name}}"))

}

rm(bsky_conv_raw_name, bsky_conv_target_name, bsky_conv_source_class)
`
        }

        var objects = {

            lblInfo: {
                el: new labelVar(config, {
                    label: localization.en.lblInfo,
                    style: "mt-2 mb-3",
                    h: 6,
                })
            },

            newDatasetName: {
                el: new input(config, {
                    no: 'newDatasetName',
                    label: localization.en.newDatasetName,
                    placeholder: "e.g., myDesign_df (leave blank for <design name>_df)",
                    extraction: "TextAsIs",
					overwrite: "dataset",
                    value: "",
                    required: false,
                    allow_spaces: false,
                    //width: "w-75",
                })
            }, 
			 newDatasetNameHelp_lbl: {
                el: new labelVar(config, {
                    label: localization.en.newDatasetNameHelp_lbl,
                    style: "mt-1 mb-2",
                    h: 6,
                })
            },
            lbl_note: {
                el: new labelVar(config, {
                    label: localization.en.lbl_note,
                    style: "mt-1 mb-2",
                    h: 6,
                })
            },
        }

        const content = {
            items: [
                objects.lblInfo.el.content,
				
				objects.newDatasetNameHelp_lbl.el.content,
                objects.newDatasetName.el.content,
				
                objects.lbl_note.el.content,
            ],
            nav: {
                name: localization.en.navigation,
                icon: "icon-convert",
                datasetRequired: true,
                modal: config.id
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new convertDesignToDataFrame().render()
