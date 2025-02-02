



class mainEffectsIntractionPlots extends baseModal {
    static dialogId = 'mainEffectsIntractionPlots'
    static t = baseModal.makeT(mainEffectsIntractionPlots.dialogId)

    constructor() {
        var config = {
            id: mainEffectsIntractionPlots.dialogId,
            label: mainEffectsIntractionPlots.t('title'),
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
                    label: mainEffectsIntractionPlots.t('tvarbox1'),
                    no: "tvarbox1",
                    filter: "String|Numeric|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UseComma",
                    required: true,
                })
            },
            tvarbox2: {
                el: new dstVariable(config, {
                    label: mainEffectsIntractionPlots.t('tvarbox2'),
                    no: "tvarbox2",
                    filter: "String|Numeric|Logical|Ordinal|Nominal|Scale",
                    // extraction: "Prefix|UseComma",
                    wrapped: ', factor2= %val%'
                })
            },            
            tvarbox3: {
                el: new dstVariable(config, {
                    label: mainEffectsIntractionPlots.t('tvarbox3'),
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
                name: mainEffectsIntractionPlots.t('navigation'),
                icon: "icon-doe",
                modal: config.id
            }
        }
        super(config, objects, content);
		
        this.help = {
            title: mainEffectsIntractionPlots.t('help.title'),
            r_help: mainEffectsIntractionPlots.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: mainEffectsIntractionPlots.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new mainEffectsIntractionPlots().render()
}
