



class effectsPlot2LevelFactor extends baseModal {
    static dialogId = 'effectsPlot2LevelFactor'
    static t = baseModal.makeT(effectsPlot2LevelFactor.dialogId)

    constructor() {
        var config = {
            id: effectsPlot2LevelFactor.dialogId,
            label: effectsPlot2LevelFactor.t('title'),
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
                    label: effectsPlot2LevelFactor.t('respVar'),
                    no: "respVar",
                    filter: "Numeric|Scale",
                    extraction: "NoPrefix|UseComma",
                    required: true
                }), r: ['{{ var | safe}}']
            },
            alpha: {
                el: new inputSpinner(config, {
                    no: 'alpha',
                    label: effectsPlot2LevelFactor.t('alpha'),
                    min: 0,
                    max: 999,
                    step: .1,
                    style: "mt-3",                    
                    value: 0.5,
                    extraction: "NoPrefix|UseComma"
                })
            },            
            halfChk: { el: new checkbox(config, { label: effectsPlot2LevelFactor.t('halfChk'), no: "halfChk", state:"checked", extraction: "Boolean", newline: true }) },
            codeChk: { el: new checkbox(config, { label: effectsPlot2LevelFactor.t('codeChk'), no: "codeChk", state:"checked", extraction: "Boolean", newline: true}) },
            autolabChk: { el: new checkbox(config, { label: effectsPlot2LevelFactor.t('autolabChk'), no: "autolabChk", state:"checked", extraction: "Boolean", newline: true}) },            
        }
        const content = {
            left: [objects.content_var.el.content],
            right: [objects.respVar.el.content,
                objects.halfChk.el.content,objects.codeChk.el.content,
                objects.alpha.el.content,objects.autolabChk.el.content],
            nav: {
                name: effectsPlot2LevelFactor.t('navigation'),
                icon: "icon-doe",
                modal: config.id
            }
        }
        super(config, objects, content);
		
        this.help = {
            title: effectsPlot2LevelFactor.t('help.title'),
            r_help: effectsPlot2LevelFactor.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: effectsPlot2LevelFactor.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new effectsPlot2LevelFactor().render()
}
