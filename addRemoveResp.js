/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Add/Remove Response Variable(s) - first check the list of exsiting response variables with the DOE -> Inspect Design menu",
        navigation: "Add/Remove Response",
        subsetvars: "Select response variables",
		
		help: {
            title: "Add/Remove Response Variable(s)",
            r_help: "help(response.names, package = DoE.base)",
			body: `
				<b>Description</b></br>
				To designate one or more variables to be response variable(s) for the design 
				<br/>
				<br/>
				For the detail help - use R help(response.names, package = DoE.base)
				<br/>
				
			`
		},
    }
}
class addRemoveResp extends baseModal {
    constructor() {
        var config = {
            id: "addRemoveResp",
            label: localization.en.title,
            modalType: "two",
            RCode: `
			require(DoE.base)
			
            response.names({{dataset.name}}) = c({{selected.subsetvars | safe}})
            `
        }
        var objects = {
            content_var: { el: new srcVariableList(config, {action: "move"}) },
            subsetvars: {
                el: new dstVariableList(config, {
                    label: localization.en.subsetvars,
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
                name: localization.en.navigation,
                icon: "icon-doe",
                modal: config.id
            }
        }
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new addRemoveResp().render()