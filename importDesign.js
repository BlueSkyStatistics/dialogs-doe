


class importDesign extends baseModal {
    static dialogId = 'importDesign'
    static t = baseModal.makeT(importDesign.dialogId)

    constructor() {
        var config = {
            id: importDesign.dialogId,
            label: importDesign.t('title'),
            modalType: "one",
            RCode: `
require(DoE.base)
{{selected.datasetname | safe}} <- DoE.base::add.response({{dataset.name}},  "{{selected.importResp | safe}}", replace=FALSE)
BSkyLoadRefresh('{{selected.datasetname | safe}}')
`
        }
        var objects = {
            datasetname: {
                el: new input(config, {
                    no: 'datasetname',
                    label: importDesign.t('datasetname'),
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    overwrite: "dataset",
                    value: ""
                })
            },  
            
            importResp: {
                el: new fileOpenControl(config, 
                    {
                        no: "importResp", 
                        label: importDesign.t('importResp'),
                        extraction: "TextAsIs",
                        required:true
                    })}
            // importResp: {
            //     el: new input(config, {
            //         no: 'importResp',
            //         label: importDesign.t('importResp'),
            //         required: true,
            //         placeholder: "",
            //         allow_spaces:true,
            //         extraction: "TextAsIs",
            //         value: ""
            //     })
            // }
        }
        const content = {
            items: [objects.datasetname.el.content, objects.importResp.el.content],
            nav: {
                name: importDesign.t('navigation'),
                icon: "icon-doe",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
		
        this.help = {
            title: importDesign.t('help.title'),
            r_help: "help(data,package='utils')",
            body: importDesign.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new importDesign().render()
}
