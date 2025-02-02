



class createTaguchiParameterDesign extends baseModal {
    static dialogId = 'createTaguchiParameterDesign'
    static t = baseModal.makeT(createTaguchiParameterDesign.dialogId)

    constructor() {
        var config = {
            id: createTaguchiParameterDesign.dialogId,
            label: createTaguchiParameterDesign.t('title'),
            modalType: "two",
            RCode: `

				if(("design" %in% class({{selected.inner | safe}})) &&  ("design" %in% class({{selected.outer | safe}})))
				{
					modified_responses = if({{selected.responses | safe}}[1] == c('')) NULL else {{selected.responses | safe}}
					
					 {{selected.datasetname | safe}} = DoE.base::param.design(inner={{selected.inner | safe}}, 
									outer={{selected.outer | safe}}, 
									direction="{{selected.directiongp | safe}}",
									responses = modified_responses)
									
												 
					BSkyLoadRefresh('{{selected.datasetname | safe}}')
				} else
				{
					if(!("design" %in% class({{selected.inner | safe}})))
					{
						cat("\nSelected design", '{{selected.inner | safe}}', "is not a design object\n")
					}
					
					if(!("design" %in% class({{selected.outer | safe}})))
					{
						cat("\nSelected design", '{{selected.outer | safe}}', "is not a design object\n")
					}
				}
`
        }
        var objects = {
            dataset_var: { el: new srcDataSetList(config, { action: "move" }) },
            datasetname: {
                el: new input(config, {
                    no: 'datasetname',
                    label: createTaguchiParameterDesign.t('datasetname'),
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    overwrite: "dataset",
                    value: "",
					style: "mb-2",
                })
            },
            inner: {
                el: new dstVariable(config, {
                    label: createTaguchiParameterDesign.t('inner'),
                    no: "inner",
                    filter: "Dataset",
                    //extraction: "UseComma|Enclosed",
					extraction: "ValueAsIs",
                    required: true,
                })
            },
            outer: {
                el: new dstVariable(config, {
                    label: createTaguchiParameterDesign.t('outer'),
                    no: "outer",
                    filter: "Dataset",
                    //extraction: "UseComma|Enclosed",
					extraction: "ValueAsIs",
                    required: true,
                })
            },   
            /* direction: {
                el: new comboBox(config, {
                    no: 'direction',
                    label: createTaguchiParameterDesign.t('direction'),
                    multiple: false,
                    extraction: "NoPrefix|UseComma",
                    options: ["long", "wide"],
                    default: "long",
                })
            }, */
			lbl1: { 
				el: new labelVar(config, { 
					label: createTaguchiParameterDesign.t('lbl1'), 
					style: "mt-3",
					h: 6,
				}) 
			},
			directionLongrad: { 
				el: new radioButton(config, { 
					label: createTaguchiParameterDesign.t('directionLongrad'), 
					no: "directiongp", 
					increment: "directionLongrad", 
					value: "long", 
					state: "checked", 
					extraction: "ValueAsIs", 
					style: "ml-5",
				}) 
			},
            directionWiderad: { 
				el: new radioButton(config, { 
					label: createTaguchiParameterDesign.t('directionWiderad'), 
					no: "directiongp", 
					increment: "directionWiderad", 
					value: "wide", 
					state: "", 
					extraction: "ValueAsIs", 
					style: "ml-5",
				}) 
			},
			responses: {
                el: new input(config, {
                    no: 'responses',
                    label: createTaguchiParameterDesign.t('responses'),
					allow_spaces:true,
                    placeholder: "",
                    extraction: "CreateArray",
                    //extraction: "NoPrefix|UseComma|Enclosed",
                    value: "",
                })
            },
        }
        const content = {
            left: [objects.dataset_var.el.content],
            right: [objects.datasetname.el.content,
                objects.inner.el.content,
				objects.outer.el.content,
				objects.lbl1.el.content,
                objects.directionLongrad.el.content, objects.directionWiderad.el.content,
				objects.responses.el.content],
            nav: {
                name: createTaguchiParameterDesign.t('navigation'),
                icon: "icon-doe",
                modal: config.id
            }
        }
        super(config, objects, content);
		
        this.help = {
            title: createTaguchiParameterDesign.t('help.title'),
            r_help: createTaguchiParameterDesign.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: createTaguchiParameterDesign.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new createTaguchiParameterDesign().render()
}
