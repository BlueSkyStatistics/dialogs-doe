/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */



class plotDesign extends baseModal {
    static dialogId = 'plotDesign'
    static t = baseModal.makeT(plotDesign.dialogId)

    constructor() {
        var config = {
            id: plotDesign.dialogId,
            label: plotDesign.t('title'),
            modalType: "two",
            RCode: `
            temp <-  {{dataset.name}}  
            response.names(temp) <- NULL 
            plot(temp, select = c({{selected.subsetvars | safe}}))
            rm(temp)
            `
        }
        var objects = {
            content_var: { el: new srcVariableList(config, {action: "move"}) },
            subsetvars: {
                el: new dstVariableList(config, {
                    label: plotDesign.t('subsetvars'),
                    no: "subsetvars",
                    filter: "String|Numeric|Date|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UseComma|Enclosed",
                    required: true
                }), r: ['{{ var | safe}}']
            },
        }
        const content = {
            left: [objects.content_var.el.content],
            right: [objects.subsetvars.el.content],
            nav: {
                name: plotDesign.t('navigation'),
                icon: "icon-doe",
                modal: config.id
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: plotDesign.t('help.title'),
            r_help: plotDesign.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: plotDesign.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new plotDesign().render()
}
