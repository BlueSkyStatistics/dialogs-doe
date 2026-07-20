/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */



class convertDesignToDataFrame extends baseModal {
    static dialogId = 'convertDesignToDataFrame'
    static t = baseModal.makeT(convertDesignToDataFrame.dialogId)

    constructor() {
        var config = {
            id: convertDesignToDataFrame.dialogId,
            label: convertDesignToDataFrame.t('title'),
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
                    label: convertDesignToDataFrame.t('lblInfo'),
                    style: "mt-2 mb-3",
                    h: 6,
                })
            },

            newDatasetName: {
                el: new input(config, {
                    no: 'newDatasetName',
                    label: convertDesignToDataFrame.t('newDatasetName'),
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
                    label: convertDesignToDataFrame.t('newDatasetNameHelp_lbl'),
                    style: "mt-1 mb-2",
                    h: 6,
                })
            },
            lbl_note: {
                el: new labelVar(config, {
                    label: convertDesignToDataFrame.t('lbl_note'),
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
                name: convertDesignToDataFrame.t('navigation'),
                icon: "icon-convert",
                datasetRequired: true,
                modal: config.id
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: convertDesignToDataFrame.t('help.title'),
            r_help: convertDesignToDataFrame.t('help.r_help'), //Fix by Anil //r_help: "help(data,package='utils')",
            body: convertDesignToDataFrame.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new convertDesignToDataFrame().render()
}

