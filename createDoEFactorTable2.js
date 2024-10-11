


class createDoEgrid extends baseModal {
    static dialogId = 'createDoEgrid'
    static t = baseModal.makeT(createDoEgrid.dialogId)

    constructor() {
        var config = {
            id: createDoEgrid.dialogId,
            label: createDoEgrid.t('title'),
            modalType: "one",
            RCode: `
			
			bsky_max_fact_length = max( (c({{selected.numOfFactorLevels1 | safe}})),
										(c({{selected.numOfFactorLevels2 | safe}})),
										(c({{selected.numOfFactorLevels3 | safe}})),
										(c({{selected.numOfFactorLevels4 | safe}})),
										(c({{selected.numOfFactorLevels5 | safe}}))
										)
			bsky_temp_df = c()
			
			{{if(options.selected.factor1 !== "")}}
				{{if(options.selected.factorLevels1 === "")}}
				   bsky_factor_values = paste0("{{selected.prefixForfactorLevels1 | safe}}",seq(1:c({{selected.numOfFactorLevels1 | safe}})))
				{{#else}}
					bsky_factor_values = c({{selected.factorLevels1 | safe}})[1:c({{selected.numOfFactorLevels1 | safe}})]
				{{/if}}
				length(bsky_factor_values) = bsky_max_fact_length
				bsky_temp_df = cbind(bsky_temp_df, '{{selected.factor1 | safe}}' = bsky_factor_values)
			{{/if}}	
			
			{{if(options.selected.factor2 !== "")}}
				{{if(options.selected.factorLevels2 === "")}}
				   bsky_factor_values = paste0("{{selected.prefixForfactorLevels2 | safe}}",seq(1:c({{selected.numOfFactorLevels2 | safe}})))
				{{#else}}
					bsky_factor_values = c({{selected.factorLevels2 | safe}})[1:c({{selected.numOfFactorLevels2 | safe}})]
				{{/if}}
				length(bsky_factor_values) = bsky_max_fact_length
				bsky_temp_df = cbind(bsky_temp_df, '{{selected.factor2 | safe}}' = bsky_factor_values)
			{{/if}}	
			
			{{if(options.selected.factor3 !== "")}}
				{{if(options.selected.factorLevels3 === "")}}
				   bsky_factor_values = paste0("{{selected.prefixForfactorLevels3 | safe}}",seq(1:c({{selected.numOfFactorLevels3 | safe}})))
				{{#else}}
					bsky_factor_values = c({{selected.factorLevels3 | safe}})[1:c({{selected.numOfFactorLevels3 | safe}})]
				{{/if}}
				length(bsky_factor_values) = bsky_max_fact_length
				bsky_temp_df = cbind(bsky_temp_df, '{{selected.factor3 | safe}}' = bsky_factor_values)
			{{/if}}	
			
			{{if(options.selected.factor4 !== "")}}
				{{if(options.selected.factorLevels4 === "")}}
				   bsky_factor_values = paste0("{{selected.prefixForfactorLevels4 | safe}}",seq(1:c({{selected.numOfFactorLevels4 | safe}})))
				{{#else}}
					bsky_factor_values = c({{selected.factorLevels4 | safe}})[1:c({{selected.numOfFactorLevels4 | safe}})]
				{{/if}}
				length(bsky_factor_values) = bsky_max_fact_length
				bsky_temp_df = cbind(bsky_temp_df, '{{selected.factor4 | safe}}' = bsky_factor_values)
			{{/if}}	
			
			{{if(options.selected.factor5 !== "")}}
				{{if(options.selected.factorLevels5 === "")}}
				   bsky_factor_values = paste0("{{selected.prefixForfactorLevels5 | safe}}",seq(1:c({{selected.numOfFactorLevels5 | safe}})))
				{{#else}}
					bsky_factor_values = c({{selected.factorLevels5 | safe}})[1:c({{selected.numOfFactorLevels5 | safe}})]
				{{/if}}
				length(bsky_factor_values) = bsky_max_fact_length
				bsky_temp_df = cbind(bsky_temp_df, '{{selected.factor5 | safe}}' = bsky_factor_values)
			{{/if}}	
			
			{{selected.datasetname | safe}} = as.data.frame(bsky_temp_df)		
			BSkyLoadRefresh('{{selected.datasetname | safe}}')	

  `
        }
        var objects = {
            datasetname: {
                el: new input(config, {
                    no: 'datasetname',
                    label: createDoEgrid.t('datasetname'),
                    placeholder: "",
                    //required: true,
                    extraction: "TextAsIs",
                    overwrite: "dataset",
                    value: "DoEStudyFactorTable"
                })
            },
            
			label1: { 
				el: new labelVar(config, { 
					label: createDoEgrid.t('label1'), 
					h: 6, 
					//style: "mb-2",
				}) 
			},
			factor1: {
                el: new input(config, {
                    no: 'factor1',
                    label: createDoEgrid.t('factor1'),
                    //required: true,
                    placeholder: "",
                    allow_spaces:true,
                    type : "character",
                    extraction: "TextAsIs",
                    value: "",
					style: "ml-3",
                })
            },       
            numOfFactorLevels1: {
                el: new input(config, {
                    no: 'numOfFactorLevels1',
                    label: createDoEgrid.t('numOfFactorLevels1'),
                    required: true,
                    placeholder: "",
                    allow_spaces:true,
                    type : "numeric",
                    extraction: "TextAsIs",
                    value: "2",
					style: "ml-3", 
                })
            },                 
            factorLevels1: {
                el: new input(config, {
                    no: 'factorLevels1',
                    label: createDoEgrid.t('factorLevels1'),
                    //required: true,
                    placeholder: "",
                    extraction: "TextAsIs",
                    allow_spaces:true,
                    value: "",
					style: "ml-3",
                })
            },
			prefixForfactorLevels1: {
                el: new input(config, {
                    no: 'prefixForfactorLevels1',
                    label: createDoEgrid.t('prefixForfactorLevels1'),
                    //required: true,
                    placeholder: "",
                    allow_spaces:true,
                    type : "character",
                    extraction: "TextAsIs",
                    value: "",
					style: "ml-3",
                })
            },       
			
			label2: { 
				el: new labelVar(config, { 
					label: createDoEgrid.t('label2'), 
					h: 6, 
					//style: "mb-2",
				}) 
			},
			factor2: {
                el: new input(config, {
                    no: 'factor2',
                    label: createDoEgrid.t('factor2'),
                    //required: true,
                    placeholder: "",
                    allow_spaces:true,
                    type : "character",
                    extraction: "TextAsIs",
                    value: "",
					style: "ml-3",
                })
            },       
            numOfFactorLevels2: {
                el: new input(config, {
                    no: 'numOfFactorLevels2',
                    label: createDoEgrid.t('numOfFactorLevels2'),
                    required: true,
                    placeholder: "",
                    allow_spaces:true,
                    type : "numeric",
                    extraction: "TextAsIs",
                    value: "2",
					style: "ml-3",
                })
            },                 
            factorLevels2: {
                el: new input(config, {
                    no: 'factorLevels2',
                    label: createDoEgrid.t('factorLevels2'),
                    //required: true,
                    placeholder: "",
                    extraction: "TextAsIs",
                    allow_spaces:true,
                    value: "",
					style: "ml-3",
                })
            },
			prefixForfactorLevels2: {
                el: new input(config, {
                    no: 'prefixForfactorLevels2',
                    label: createDoEgrid.t('prefixForfactorLevels2'),
                    //required: true,
                    placeholder: "",
                    allow_spaces:true,
                    type : "character",
                    extraction: "TextAsIs",
                    value: "",
					style: "ml-3",
                })
            },       
			
			label3: { 
				el: new labelVar(config, { 
					label: createDoEgrid.t('label3'), 
					h: 6, 
					//style: "mb-2",
				}) 
			},
			factor3: {
                el: new input(config, {
                    no: 'factor3',
                    label: createDoEgrid.t('factor3'),
                    //required: true,
                    placeholder: "",
                    allow_spaces:true,
                    type : "character",
                    extraction: "TextAsIs",
                    value: "",
					style: "ml-3",
                })
            },       
            numOfFactorLevels3: {
                el: new input(config, {
                    no: 'numOfFactorLevels3',
                    label: createDoEgrid.t('numOfFactorLevels3'),
                    required: true,
                    placeholder: "",
                    allow_spaces:true,
                    type : "numeric",
                    extraction: "TextAsIs",
                    value: "2",
					style: "ml-3",
                })
            },                 
            factorLevels3: {
                el: new input(config, {
                    no: 'factorLevels3',
                    label: createDoEgrid.t('factorLevels3'),
                    //required: true,
                    placeholder: "",
                    extraction: "TextAsIs",
                    allow_spaces:true,
                    value: "",
					style: "ml-3",
                })
            },
			prefixForfactorLevels3: {
                el: new input(config, {
                    no: 'prefixForfactorLevels3',
                    label: createDoEgrid.t('prefixForfactorLevels3'),
                    //required: true,
                    placeholder: "",
                    allow_spaces:true,
                    type : "character",
                    extraction: "TextAsIs",
                    value: "",
					style: "ml-3",
                })
            },       
			
			label4: { 
				el: new labelVar(config, { 
					label: createDoEgrid.t('label4'), 
					h: 6, 
					//style: "mb-2",
				}) 
			},
			factor4: {
                el: new input(config, {
                    no: 'factor4',
                    label: createDoEgrid.t('factor4'),
                    //required: true,
                    placeholder: "",
                    allow_spaces:true,
                    type : "character",
                    extraction: "TextAsIs",
                    value: "",
					style: "ml-3",
                })
            },       
            numOfFactorLevels4: {
                el: new input(config, {
                    no: 'numOfFactorLevels4',
                    label: createDoEgrid.t('numOfFactorLevels4'),
                    required: true,
                    placeholder: "",
                    allow_spaces:true,
                    type : "numeric",
                    extraction: "TextAsIs",
                    value: "2",
					style: "ml-3",
                })
            },                 
            factorLevels4: {
                el: new input(config, {
                    no: 'factorLevels4',
                    label: createDoEgrid.t('factorLevels4'),
                    //required: true,
                    placeholder: "",
                    extraction: "TextAsIs",
                    allow_spaces:true,
                    value: "",
					style: "ml-3",
                })
            },
			prefixForfactorLevels4: {
                el: new input(config, {
                    no: 'prefixForfactorLevels4',
                    label: createDoEgrid.t('prefixForfactorLevels4'),
                    //required: true,
                    placeholder: "",
                    allow_spaces:true,
                    type : "character",
                    extraction: "TextAsIs",
                    value: "",
					style: "ml-3",
                })
            },       
			
			label5: { 
				el: new labelVar(config, { 
					label: createDoEgrid.t('label5'), 
					h: 6, 
					//style: "mb-2",
				}) 
			},
			factor5: {
                el: new input(config, {
                    no: 'factor5',
                    label: createDoEgrid.t('factor5'),
                    //required: true,
                    placeholder: "",
                    allow_spaces:true,
                    type : "character",
                    extraction: "TextAsIs",
                    value: "",
					style: "ml-3",
                })
            },       
            numOfFactorLevels5: {
                el: new input(config, {
                    no: 'numOfFactorLevels5',
                    label: createDoEgrid.t('numOfFactorLevels5'),
                    required: true,
                    placeholder: "",
                    allow_spaces:true,
                    type : "numeric",
                    extraction: "TextAsIs",
                    value: "2",
					style: "ml-3",
                })
            },                 
            factorLevels5: {
                el: new input(config, {
                    no: 'factorLevels5',
                    label: createDoEgrid.t('factorLevels5'),
                    //required: true,
                    placeholder: "",
                    extraction: "TextAsIs",
                    allow_spaces:true,
                    value: "",
					style: "ml-3",
                })
            },
			prefixForfactorLevels5: {
                el: new input(config, {
                    no: 'prefixForfactorLevels5',
                    label: createDoEgrid.t('prefixForfactorLevels5'),
                    //required: true,
                    placeholder: "",
                    allow_spaces:true,
                    type : "character",
                    extraction: "TextAsIs",
                    value: "",
					style: "ml-3",
                })
            },       
			
            chkbxAutofill: { 
				el: new checkbox(config, { 
					label: createDoEgrid.t('autoFillChkbx'), 
					no: "chkbxAutofill", 
					state:"checked", 
					extraction: "Boolean", 
					newline: true,
					style: "mb-5",
				}) 
			},
			label1: { 
				el: new labelVar(config, { 
					label: createDoEgrid.t('label1'), 
					style: "mt-2", 
					h: 6,
				}) 
			},
            
			convertFactorToCharInt: { 
				el: new checkbox(config, { 
					label: createDoEgrid.t('convertFactorToCharInt'), 
					no: "convertFactorToCharInt", 
					//state:"checked", 
					extraction: "Boolean", 
					newline: true,
				}) 
			},
	   }
        const content = {
            items: [objects.datasetname.el.content,  
				
				objects.label1.el.content, 
				objects.factor1.el.content,  
                objects.numOfFactorLevels1.el.content, 
				objects.factorLevels1.el.content, 
				objects.prefixForfactorLevels1.el.content,
				
				objects.label2.el.content,
				objects.factor2.el.content,  
                objects.numOfFactorLevels2.el.content, 
				objects.factorLevels2.el.content,
				objects.prefixForfactorLevels2.el.content,
				
				objects.label3.el.content,
				objects.factor3.el.content,  
                objects.numOfFactorLevels3.el.content, 
				objects.factorLevels3.el.content,
				objects.prefixForfactorLevels3.el.content,
				
				objects.label4.el.content,
				objects.factor4.el.content,  
                objects.numOfFactorLevels4.el.content, 
				objects.factorLevels4.el.content,
				objects.prefixForfactorLevels4.el.content,
				
				objects.label5.el.content,
				objects.factor5.el.content,  
                objects.numOfFactorLevels5.el.content, 
				objects.factorLevels5.el.content,
				objects.prefixForfactorLevels5.el.content,
				
                //objects.chkbxAutofill.el.content,
				//objects.label1.el.content,
				//objects.convertFactorToCharInt.el.content,
				],
            nav: {
                name: createDoEgrid.t('navigation'),
                icon: "icon-doe",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
		
        this.help = {
            title: createDoEgrid.t('help.title'),
            r_help: "help(data,package='utils')",
            body: createDoEgrid.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new createDoEgrid().render()
}
