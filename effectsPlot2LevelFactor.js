/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Daniel Plot - Effects Normal (or Half) Plot for 2 Level Factor",
        navigation: "Half Normal Plot for 2 Level",
        respVar: "Response variable(select one)",
        halfChk:"Half normal plot",
        codeChk:"Label effects with codes instead of names",
        alpha: "Enter significance level for labelling",
        autolabChk:"Label significant effects only",
		
		help: {
            title: "Daniel Plot - Effects Normal (or Half) Plot for 2 Level Factor",
            r_help: "help(DanielPlot, package = FrF2)",
			body: `
				<b>Description</b></br>
				Normal or Half-Normal Effects Plots for response variable  
				<br/>
				<br/>
				For the detail help - use R help(DanielPlot, package = FrF2)
				<br/>
				
			`
		},
    }
}


class effectsPlot2LevelFactor extends baseModal {
    constructor() {
        var config = {
            id: "effectsPlot2LevelFactor",
            label: localization.en.title,
            modalType: "two",
            RCode: `
                FrF2::DanielPlot({{dataset.name}}, code={{selected.codeChk | safe}}, autolab={{selected.autolabChk | safe}}, alpha={{selected.alpha | safe}}, half={{selected.halfChk | safe}},
                    response="{{selected.respVar | safe}}")
`
        }
        var objects = {
            content_var: { el: new srcVariableList(config, {action: "move"}) },
            respVar: {
                el: new dstVariable(config, {
                    label: localization.en.respVar,
                    no: "respVar",
                    filter: "Numeric|Scale",
                    extraction: "NoPrefix|UseComma",
                    required: true
                }), r: ['{{ var | safe}}']
            },
            alpha: {
                el: new inputSpinner(config, {
                    no: 'alpha',
                    label: localization.en.alpha,
                    min: 0,
                    max: 999,
                    step: .1,
                    style: "mt-3",                    
                    value: 0.5,
                    extraction: "NoPrefix|UseComma"
                })
            },            
            halfChk: { el: new checkbox(config, { label: localization.en.halfChk, no: "halfChk", state:"checked", extraction: "Boolean", newline: true }) },
            codeChk: { el: new checkbox(config, { label: localization.en.codeChk, no: "codeChk", state:"checked", extraction: "Boolean", newline: true}) },
            autolabChk: { el: new checkbox(config, { label: localization.en.autolabChk, no: "autolabChk", state:"checked", extraction: "Boolean", newline: true}) },            
        }
        const content = {
            left: [objects.content_var.el.content],
            right: [objects.respVar.el.content,
                objects.halfChk.el.content,objects.codeChk.el.content,
                objects.alpha.el.content,objects.autolabChk.el.content],
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
module.exports.item = new effectsPlot2LevelFactor().render()