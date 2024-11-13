var localization = {
    en: {
        title: "Auto generate factor (variable size) details for a DoE study",
        navigation: "Factor Details (variable size)",
        
		datasetname: "Factor detail table name",
        
		label1: "Factor details for factor1",
		label2: "Factor details for factor2",
		label3: "Factor details for factor3",
		label4: "Factor details for factor4",
		label5: "Factor details for factor5",
		
		factor1: "Name of the factor1 (e.g. Parts, Operator, Machine, etc)",
        numOfFactorLevels1: "Number of levels for factor1",
		factorLevels1: "Leave blank to auto-generate values or specify values - example: -1, 1, 'string1', 2, 0",
		prefixForfactorLevels1: "If auto-generate, specify any Prefix. If blank, it will create values as 1,2,3,..",
		
		factor2: "Name of the factor2 (e.g. Parts, Operator, Machine, etc)",
        numOfFactorLevels2: "Number of levels for factor2",
		factorLevels2: "Leave blank to auto-generate values or specify values - example: -1, 1, 'string1', 2, 0",
		prefixForfactorLevels2: "If auto-generate, specify any Prefix. If blank, it will create values as 1,2,3,..",
		
		factor3: "Name of the factor3 (e.g. Parts, Operator, Machine, etc)",
        numOfFactorLevels3: "Number of levels for factor3",
		factorLevels3: "Leave blank to auto-generate values or specify values - example: -1, 1, 'string1', 2, 0",
		prefixForfactorLevels3: "If auto-generate, specify any Prefix. If blank, it will create values as 1,2,3,..",
		
		factor4: "Name of the factor4 (e.g. Parts, Operator, Machine, etc)",
        numOfFactorLevels4: "Number of levels for factor4",
		factorLevels4: "Leave blank to auto-generate values or specify values - example: -1, 1, 'string1', 2, 0",
		prefixForfactorLevels4: "If auto-generate, specify any Prefix. If blank, it will create values as 1,2,3,..",
		
		factor5: "Name of the factor5 (e.g. Parts, Operator, Machine, etc)",
        numOfFactorLevels5: "Number of levels for factor5",
		factorLevels5: "Leave blank to auto-generate values or specify values - example: -1, 1, 'string1', 2, 0",
		prefixForfactorLevels5: "If auto-generate, specify any Prefix. If blank, it will create values as 1,2,3,..",
        
		autoFillChkbx:"Auto fill levels",
		
		//label1: "Ignore the following option - dataset clean up option for later use",
		//convertFactorToCharInt:"For the active dataset selected - convert all columns of factor type to character or integer (and when this option is selected, all the above options on this UI will be ignored)",
		
		help: {
            title: "Auto generate factor details",
            //r_help: "help(t.test, package=stats)",
			body: `
				<b>Description</b></br>
				Factors can variable sizes i.e. each factor can have different number of levels
				Automatically generates a table with factor details based on the parameter specified - number of factors and the maximum levels for the factors along with the default values for the factor to be used. If non numeric values are used for factor, specify within single quote for example 1,-1,'name1',0,'string2'
				<br/>
				<br/>
				Once the factor details are automatically generated and the factor table shows up on the data grid UI, you can change the values and/or remove some values from the grid to manipulate the table as you choose 
				<br/>
				<br/>
				Once the factor table is ready, go to DoE -> Create Design menu to create a design from this factor table 
				<br/>
				<br/>
				If the number of factors are <= 26, the factors are named with upper case alphabets as A, B, C, .., otherwise, named as F1, F2, ..., F27, F28, ..
			`
		},
    }
}


class createDoEgrid extends baseModal {
    constructor() {
        var config = {
            id: "createDoEgrid2",
            label: localization.en.title,
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
                    label: localization.en.datasetname,
                    placeholder: "",
                    //required: true,
                    extraction: "TextAsIs",
                    overwrite: "dataset",
                    value: "DoEStudyFactorTable"
                })
            },
            
			label1: { 
				el: new labelVar(config, { 
					label: localization.en.label1, 
					h: 6, 
					//style: "mb-2",
				}) 
			},
			factor1: {
                el: new input(config, {
                    no: 'factor1',
                    label: localization.en.factor1,
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
                    label: localization.en.numOfFactorLevels1,
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
                    label: localization.en.factorLevels1,
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
                    label: localization.en.prefixForfactorLevels1,
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
					label: localization.en.label2, 
					h: 6, 
					//style: "mb-2",
				}) 
			},
			factor2: {
                el: new input(config, {
                    no: 'factor2',
                    label: localization.en.factor2,
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
                    label: localization.en.numOfFactorLevels2,
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
                    label: localization.en.factorLevels2,
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
                    label: localization.en.prefixForfactorLevels2,
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
					label: localization.en.label3, 
					h: 6, 
					//style: "mb-2",
				}) 
			},
			factor3: {
                el: new input(config, {
                    no: 'factor3',
                    label: localization.en.factor3,
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
                    label: localization.en.numOfFactorLevels3,
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
                    label: localization.en.factorLevels3,
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
                    label: localization.en.prefixForfactorLevels3,
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
					label: localization.en.label4, 
					h: 6, 
					//style: "mb-2",
				}) 
			},
			factor4: {
                el: new input(config, {
                    no: 'factor4',
                    label: localization.en.factor4,
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
                    label: localization.en.numOfFactorLevels4,
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
                    label: localization.en.factorLevels4,
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
                    label: localization.en.prefixForfactorLevels4,
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
					label: localization.en.label5, 
					h: 6, 
					//style: "mb-2",
				}) 
			},
			factor5: {
                el: new input(config, {
                    no: 'factor5',
                    label: localization.en.factor5,
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
                    label: localization.en.numOfFactorLevels5,
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
                    label: localization.en.factorLevels5,
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
                    label: localization.en.prefixForfactorLevels5,
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
					label: localization.en.autoFillChkbx, 
					no: "chkbxAutofill", 
					state:"checked", 
					extraction: "Boolean", 
					newline: true,
					style: "mb-5",
				}) 
			},
			label1: { 
				el: new labelVar(config, { 
					label: localization.en.label1, 
					style: "mt-2", 
					h: 6,
				}) 
			},
            
			convertFactorToCharInt: { 
				el: new checkbox(config, { 
					label: localization.en.convertFactorToCharInt, 
					no: "convertFactorToCharInt", 
					//state:"checked", 
					extraction: "Boolean", 
					newline: true,
				}) 
			},*/
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
                name: localization.en.navigation,
                icon: "icon-doe",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
		this.help = localization.en.help;
    }
}
module.exports.item = new createDoEgrid().render()