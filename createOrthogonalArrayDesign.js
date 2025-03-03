/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */

var localization = {
    en: {
        title: "Create Orthogonal Array Design",
        navigation: "Create Orthogonal Array Design",
        selectedvars: "Select variables",
        datasetname: "Design name",

        // lblheading: "Size and randomization",
        numOfRuns: "Minimum number of runs (can be left blank)",

        minNumOfResidual: "Minimum number of residual degrees of freedom",
        replications: "Replications",
        repeatOnlyChk:"Repeat only",

        lbl1 : "You may not need to change the randomization settings",
        randomseeds : "Seed for randomization",
        randomizationChk:"Randomize the design generation",
		
		designnamefromcatlg : "(Optional) Orthogonal design array(example: from oacat$name as L12.2.2.6.1)",
		columnOptimization: "Column optimization (default is order, other choices min3, min34, min3.rela, min34.rela, minRPFT, minRelProjAberr",
		
		help: {
            title: "Create Orthogonal Array Design",
            r_help: "help(oa.design, package = DoE.base)",
			body: `
				<b>Description</b></br>
				oa.design function for accessing orthogonal arrays, allowing limited optimal allocation of columns
				<br/>
				<br/>
				For the detail help - use R help(oa.design, package = DoE.base)
				<br/>
				<br/>
				Use the menu DOE->Inpect Design->Inspect Orthogonal Design Catalog (oacat) to browse avaiable Orthogonal Designs to reference from the loaded design catalog in DoE.base package
				<br/>
				<br/>
				To try this, you may use the sample dataset file called factor_grid_orthogonal_array_Design.xlsx. Open the file in the data grid with file open menu
				Optionally, you can specify L72.2.53.3.2.4.1 as the design from oacat$name 
				<br/>
			`
		},
    }
}


class createOrthogonalArrayDesign extends baseModal {
    constructor() {
        var config = {
            id: "createOrthogonalArrayDesign",
            label: localization.en.title,
            modalType: "two",
            RCode: `
            require(DoE.base)
            require(FrF2)

            factorParam = BSkyDOECreateFactorListParam(factor_dataframe= {{dataset.name}},factor_names=c({{selected.selectedvars | safe}}), num_factors = ncol({{dataset.name}}), max_num_factor_levels = (nrow({{dataset.name}})), variable_num_of_levels = TRUE);
			factorParam$factor.names[] = lapply(factorParam$factor.names, function(x) type.convert(as.character(x), as.is = TRUE))
			
			designnamefromcatlg1 = c(trimws('{{selected.designnamefromcatlg | safe}}'));
			if(designnamefromcatlg1 == "") {designnamefromcatlg1 = NULL} else {designnamefromcatlg1 = c({{selected.designnamefromcatlg | safe}})}
			
			num_runs = c(trimws('{{selected.numOfRuns | safe}}'));
			if(num_runs == "") {num_runs = NULL} else {num_runs = as.numeric({{selected.numOfRuns | safe}})}
			
			if(is.null(designnamefromcatlg1) && is.null(num_runs)){
				{{selected.datasetname | safe}} <- DoE.base::oa.design(ID= NULL ,nruns= NULL ,nfactors= factorParam$nfactors ,replications= {{selected.replications | safe}} ,
                    repeat.only= {{selected.repeatOnlyChk | safe}} ,randomize= {{selected.randomizationChk | safe}} ,
					{{if(options.selected.randomseeds !== "")}} 
					seed= {{selected.randomseeds | safe}},
					{{/if}}
					nlevels=factorParam$nlevels,
                    factor.names=factorParam$factor.names , columns = '{{selected.columnOptimization | safe}}' , min.residual.df= {{selected.minNumOfResidual | safe}} )
			}else if(is.null(designnamefromcatlg1)){
				{{selected.datasetname | safe}} <- DoE.base::oa.design(ID= NULL ,nruns= num_runs ,nfactors= factorParam$nfactors ,replications= {{selected.replications | safe}} ,
                    repeat.only= {{selected.repeatOnlyChk | safe}} ,randomize= {{selected.randomizationChk | safe}} ,
					{{if(options.selected.randomseeds !== "")}} 
					seed= {{selected.randomseeds | safe}},
					{{/if}}
					nlevels=factorParam$nlevels,
                    factor.names=factorParam$factor.names , columns = '{{selected.columnOptimization | safe}}' , min.residual.df= {{selected.minNumOfResidual | safe}} )
			}else if(is.null(num_runs)){
				{{selected.datasetname | safe}} <- DoE.base::oa.design(ID= {{selected.designnamefromcatlg | safe}} ,nruns= NULL ,nfactors= factorParam$nfactors ,replications= {{selected.replications | safe}} ,
                    repeat.only= {{selected.repeatOnlyChk | safe}} ,randomize= {{selected.randomizationChk | safe}} ,
					{{if(options.selected.randomseeds !== "")}} 
					seed= {{selected.randomseeds | safe}},
					{{/if}}
					nlevels=factorParam$nlevels,
                    factor.names=factorParam$factor.names , columns = '{{selected.columnOptimization | safe}}' , min.residual.df= {{selected.minNumOfResidual | safe}} )
			}else{
				{{selected.datasetname | safe}} <- DoE.base::oa.design(ID= {{selected.designnamefromcatlg | safe}} ,nruns= num_runs ,nfactors= factorParam$nfactors ,replications= {{selected.replications | safe}} ,
                    repeat.only= {{selected.repeatOnlyChk | safe}} ,randomize= {{selected.randomizationChk | safe}} ,
					{{if(options.selected.randomseeds !== "")}} 
					seed= {{selected.randomseeds | safe}},
					{{/if}}
					nlevels=factorParam$nlevels,
                    factor.names=factorParam$factor.names , columns = '{{selected.columnOptimization | safe}}' , min.residual.df= {{selected.minNumOfResidual | safe}} )
			}
            			 
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
                    value: ""
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
			numOfRuns: {
                el: new input(config, {
                    no: 'numOfRuns',
                    label: localization.en.numOfRuns,
					allow_spaces:true,
                    placeholder: "",
                    extraction: "TextAsIs",
                    value: "",
					style: "mb-1",
					width: "w-25",
                })
            },
            minNumOfResidual: {
                el: new inputSpinner(config, {
                    no: 'minNumOfResidual',
                    label: localization.en.minNumOfResidual,
                    required: true,
                    min: 0,
                    max: 9999999,
                    step: 1,
                    value: 0,
                })
            },                 
            replications: {
                el: new inputSpinner(config, {
                    no: 'replications',
                    label: localization.en.replications,
                    required: true,
                    min: 1,
                    max: 9999999,
                    step: 1,
                    value: 1,
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
			designnamefromcatlg: {
                el: new input(config, {
                    no: 'designnamefromcatlg',
                    label: localization.en.designnamefromcatlg,
					allow_spaces:true,
                    placeholder: "",
                    extraction: "TextAsIs",
                    value: "",
					style: "mb-1",
                })
            },
			columnOptimization: {
                el: new input(config, {
                    no: 'columnOptimization',
                    label: localization.en.columnOptimization,
					allow_spaces:true,
                    placeholder: "",
                    extraction: "TextAsIs",
                    value: "order",
					style: "mb-1",
                })
            },
            // lblheading: { el: new labelVar(config, { label: localization.en.lblheading, style: "mt-3",h: 5 }) },
            lbl1: { el: new labelVar(config, { label: localization.en.lbl1, style: "mt-3",h: 6 }) },
           
            repeatOnlyChk: { el: new checkbox(config, { label: localization.en.repeatOnlyChk, no: "repeatOnlyChk", style: "ml-5", extraction: "Boolean", newline: false }) },
            randomizationChk: { 
				el: new checkbox(config, { 
					label: localization.en.randomizationChk, 
					no: "randomizationChk", 
					//style: "ml-5", 
					state: "checked", 
					extraction: "Boolean", 
					newline: false 
				}) 
			},
        }
        const content = {
            left: [objects.content_var.el.content],
            right: [ objects.datasetname.el.content, objects.selectedvars.el.content,
                objects.numOfRuns.el.content,  
                objects.minNumOfResidual.el.content, 
                objects.replications.el.content, objects.repeatOnlyChk.el.content,
                objects.lbl1.el.content,
				objects.randomizationChk.el.content,
                objects.randomseeds.el.content, 
				objects.designnamefromcatlg.el.content,
				objects.columnOptimization.el.content], 
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
module.exports.item = new createOrthogonalArrayDesign().render()