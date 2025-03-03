/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */

var localization = {
    en: {
        title: "Create Box-Behnken (Quantitative) Design",
        navigation: "Create Box-Behnken (Quantitative) Design",
        selectedvars: "Select variables",
        datasetname: "Design name",

        numCenter: "integer number of center points for each block",

        blockName: "Name of the block", 

        lbl1 : "You may not need to change the randomization settings",
        randomseeds : "Seed for randomization",
        randomizationChk:"Randomize the design generation",
		
		help: {
            title: "Create Box-Behnken (Quantitative) Design",
            r_help: "help(bbd.design, package = DoE.wrapper)",
			body: `
				<b>Description</b></br>
				bbd.design function for generating Box-Behnken designs, making use of package rsm
				<br/>
				<br/>
				For the detail help - use R help(bbd.design, package = DoE.wrapper)
				<br/>
				<br/>
				To try this, you may use the sample dataset file called factors for bbd design.xlsx. Open the file in the data grid with file open menu
				<br/>
				
			`
		},
		
    }
}

class createBoxBehnkenDesign extends baseModal {
    constructor() {
        var config = {
            id: "createBoxBehnkenDesign",
            label: localization.en.title,
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
                    label: localization.en.datasetname,
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
                    label: localization.en.selectedvars,
                    no: "selectedvars",
                    filter: "String|Numeric|Date|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UseComma|Enclosed",
                    required: true
                })
            },             
            numCenter: {
                el: new inputSpinner(config, {
                    no: 'numCenter',
                    label: localization.en.numCenter,
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
                    label: localization.en.blockName,
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
                    label: localization.en.randomseeds,
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
					label: localization.en.lbl1, 
					style: "mt-3",
					h: 6 
				}) 
			},
			randomizationChk: { 
				el: new checkbox(config, { 
					label: localization.en.randomizationChk, 
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
module.exports.item = new createBoxBehnkenDesign().render()