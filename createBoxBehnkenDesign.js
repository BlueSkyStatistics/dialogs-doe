/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */



class createBoxBehnkenDesign extends baseModal {
    static dialogId = 'createBoxBehnkenDesign'
    static t = baseModal.makeT(createBoxBehnkenDesign.dialogId)

    constructor() {
        var config = {
            id: createBoxBehnkenDesign.dialogId,
            label: createBoxBehnkenDesign.t('title'),
            modalType: "two",
            RCode: `
			require(DoE.wrapper)

            factorParam = BSkyDOECreateFactorListParam(factor_dataframe= {{dataset.name}},factor_names=c({{selected.selectedvars | safe}}), num_factors = ncol({{dataset.name}}), max_num_factor_levels = (nrow({{dataset.name}})), variable_num_of_levels = TRUE);
			factorParam$factor.names[] = lapply(factorParam$factor.names, function(x) type.convert(as.character(x), as.is = TRUE))
			
            {{selected.datasetname | safe}} = DoE.wrapper::bbd.design( nfactor = factorParam$nfactors, 
										ncenter= {{selected.numCenter | safe}},
										factor.names = factorParam$factor.names,
										block.name = c('{{selected.blockName | safe}}'),
										{{if(options.selected.randomseeds !== "")}} 
										seed= {{selected.randomseeds | safe}},
										{{/if}} 
										randomize = {{selected.randomizationChk| safe}})  
										
			
              BSkyLoadRefresh('{{selected.datasetname | safe}}')

                `
        }
        var objects = {
            content_var: { el: new srcVariableList(config, {action: "move"}) },
           
            datasetname: {
                el: new input(config, {
                    no: 'datasetname',
                    label: createBoxBehnkenDesign.t('datasetname'),
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    overwrite: "dataset",
                    value: "",
					style: "mb-2",
                })
            },
            selectedvars: {
                el: new dstVariableList(config, {
                    label: createBoxBehnkenDesign.t('selectedvars'),
                    no: "selectedvars",
                    filter: "String|Numeric|Date|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UseComma|Enclosed",
                    required: true
                })
            },             
            numCenter: {
                el: new inputSpinner(config, {
                    no: 'numCenter',
                    label: createBoxBehnkenDesign.t('numCenter'),
                    required: true,
                    min: 1,
                    max: 9999,
                    step: 1,
                    value: 4,
					style: "mb-1",
                })
            },   
            blockName: {
                el: new input(config, {
                    no: 'blockName',
                    label: createBoxBehnkenDesign.t('blockName'),
                    placeholder: "",
                    //required: true,
                    extraction: "TextAsIs",
                    value: "Block",
					//style: "ml-5",
					width: "w-50",
                })
            },           
            randomseeds: {
                el: new inputSpinner(config, {
                    no: 'randomseeds',
                    label: createBoxBehnkenDesign.t('randomseeds'),
                    //required: true,
                    //min: 1,
                    max: 99999,
                    step: 1,
                    value: "",
					style: "ml-5",
                })
            },       
            lbl1: { 
				el: new labelVar(config, { 
					label: createBoxBehnkenDesign.t('lbl1'), 
					style: "mt-3",
					h: 6 
				}) 
			},
			randomizationChk: { 
				el: new checkbox(config, { 
					label: createBoxBehnkenDesign.t('randomizationChk'), 
					no: "randomizationChk", 
					extraction: "Boolean",
					state: "checked",
					newline: true,
					//style: "ml-5",
				}) 
			},
        }
        const content = {
            left: [objects.content_var.el.content],
            right: [ objects.datasetname.el.content, objects.selectedvars.el.content,
                objects.numCenter.el.content,  
                objects.blockName.el.content, 
				
				objects.lbl1.el.content,
				objects.randomizationChk.el.content,
                objects.randomseeds.el.content,
				],
    
            nav: {
                name: createBoxBehnkenDesign.t('navigation'),
                icon: "icon-doe",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
		
        this.help = {
            title: createBoxBehnkenDesign.t('help.title'),
            r_help: createBoxBehnkenDesign.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: createBoxBehnkenDesign.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new createBoxBehnkenDesign().render()
}
