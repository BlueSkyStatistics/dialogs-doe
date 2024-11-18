
var localization = {
    en: {
        title: "Main Effects and interaction Plots (General) - plots means only",
        navigation: "Main Effects and interaction Plots (General)",
        tvarbox1: "Factor 1 - factor defining horizontal axis of the plot.",
        tvarbox2: "Factor 2 - if present, factor defining profiles of means",
        tvarbox3: "Response variable(select one)",
		
		help: {
            title: "Main Effects and interaction Plots (General) - plots means only",
            r_help: "help(plotMeans, package = RcmdrMisc)", 
			body: `
				<b>Description</b></br>
				Plot Means for one or two-way layout  
				<br/>
				<br/>
				For the detail help - use R help(plotMeans, package = RcmdrMisc)
				<br/>
				
			`
		},
    }
}


class mainEffectsIntractionPlots extends baseModal {
    constructor() {
        var config = {
            id: "mainEffectsIntractionPlots",
            label: localization.en.title,
            modalType: "two",
            RCode: `
            require(RcmdrMisc)
			
            with({{dataset.name}}, RcmdrMisc::plotMeans(response = {{selected.tvarbox3 | safe}}, factor1 = {{selected.tvarbox1 | safe}}  {{selected.tvarbox2 | safe}},
                error.bars="none", 
                main="Plot of Means from {{dataset.name}}"))
`
        }
        var objects = {
            content_var: { el: new srcVariableList(config, {action: "move"}) },
            tvarbox1: {
                el: new dstVariable(config, {
                    label: localization.en.tvarbox1,
                    no: "tvarbox1",
                    filter: "String|Numeric|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UseComma",
                    required: true,
                })
            },
            tvarbox2: {
                el: new dstVariable(config, {
                    label: localization.en.tvarbox2,
                    no: "tvarbox2",
                    filter: "String|Numeric|Logical|Ordinal|Nominal|Scale",
                    // extraction: "Prefix|UseComma",
                    wrapped: ', factor2= %val%'
                })
            },            
            tvarbox3: {
                el: new dstVariable(config, {
                    label: localization.en.tvarbox3,
                    no: "tvarbox3",
                    filter: "Numeric|Scale",
                    extraction: "NoPrefix|UseComma",
                    required: true
                }), r: ['{{ var | safe}}']
            },

        }
        const content = {
            left: [objects.content_var.el.content],
            right: [objects.tvarbox3.el.content, objects.tvarbox1.el.content, objects.tvarbox2.el.content],
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
module.exports.item = new mainEffectsIntractionPlots().render()