

class addRemoveResp extends baseModal {
    static dialogId = 'addRemoveResp'
    static t = baseModal.makeT(addRemoveResp.dialogId)

    constructor() {
        var config = {
            id: addRemoveResp.dialogId,
            label: addRemoveResp.t('title'),
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
                    label: addRemoveResp.t('subsetvars'),
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
                name: addRemoveResp.t('navigation'),
                icon: "icon-doe",
                modal: config.id
            }
        }
        super(config, objects, content);
        
        this.help = {
            title: addRemoveResp.t('help.title'),
            r_help: "help(data,package='utils')",
            body: addRemoveResp.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new addRemoveResp().render()
}
