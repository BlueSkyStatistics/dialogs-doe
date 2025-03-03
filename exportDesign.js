/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */





class exportDesign extends baseModal {
    static dialogId = 'exportDesign'
    static t = baseModal.makeT(exportDesign.dialogId)

    constructor() {
        var config = {
            id: exportDesign.dialogId,
            label: exportDesign.t('title'),
            modalType: "one",
            RCode: `
                    export.design({{dataset.name}}, type="all", path="{{selected.exportPath | safe}}", file="{{dataset.name}}", replace=TRUE)
                `
        }
        var objects = {
            // exportPath: {
            //     el: new input(config, {
            //         no: 'exportPath',
            //         label: exportDesign.t('exportPath'),
            //         required: true,
            //         placeholder: "",
            //         allow_spaces:true,
            //         extraction: "TextAsIs",
            //         value: ""
            //     })
            // }

            exportPath: {
                el: new fileOpenControl(config, 
                    {
                        no: "exportPath", 
                        label: exportDesign.t('exportPath'), 
                        type: 'folder', 
                        extraction: "TextAsIs",
                        required:true
                    })},
        }
        const content = {
            items: [objects.exportPath.el.content],
            nav: {
                name: exportDesign.t('navigation'),
                icon: "icon-doe",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
		
        this.help = {
            title: exportDesign.t('help.title'),
            r_help: exportDesign.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: exportDesign.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new exportDesign().render()
}
