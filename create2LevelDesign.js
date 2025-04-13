/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */

var localization = {
    en: {
        title: "Create non-regular (Fractional) Factorial 2-level Screening Design",
        navigation: "Create 2-level Screening Design",
        selectedvars: "Select variables",
        datasetname: "Design name",

        // lblheading: "Size and randomization",
        numOfRuns: "Number of runs (multiple of 4, >=8)",
        taguchiOrderChk:"(Only relevant for) 12 run design in Taguchi order",

        numOfCenterPts: "Number of center points (if used, have minimum 2)",
		centerPointDistribution: "Number of positions for center point distribution (have >1)",
		
        replications: "Replications",
        repeatOnlyChk:"Repeat only",

        lbl1 : "You may not need to change the randomization settings",
        randomseeds : "Seed for randomization",
        randomizationChk:"Randomize the design generation",
		
		help: {
            title: "Create 2-level Screening Design",
            r_help: "help(pb, package = FrF2)",
			body: `
				<b>Description</b></br>
				Plackett-Burman(pb) function to generate non-regular fractional factorial 2-level screening designs
				<br/>
				<br/>
				For the detail help - use R help(pb, package = FrF2)
				<br/>
				<br/>
				To try this, you may use the sample dataset file called factor_grid_twolevel_screen_Design.xlsx. Open the file in the data grid with file open menu
				<br/>
			`
		},
    }
}


class create2LevelDesign extends baseModal {
    constructor() {
        var config = {
            id: "create2LevelDesign",
            label: localization.en.title,
            modalType: "two",
            RCode: `
            require(DoE.base)
            require(FrF2)

			factorParam = BSkyDOECreateFactorListParam(factor_dataframe= {{dataset.name}},factor_names=c({{selected.selectedvars | safe}}), num_factors = ncol({{dataset.name}}), max_num_factor_levels = (nrow({{dataset.name}})), variable_num_of_levels = TRUE)
			factorParam$factor.names[] = lapply(factorParam$factor.names, function(x) type.convert(as.character(x), as.is = TRUE))
			

			modified_ncenter= {{selected.numOfCenterPts | safe}}
			
			modified_center.distribute = {{selected.centerPointDistribution | safe}}
			
			if(modified_ncenter == 0 || modified_ncenter == 1)
			{
				modified_center.distribute = NULL
			}else if(modified_ncenter > 1 && modified_center.distribute == 1)
			{
				modified_center.distribute = 2
			}
			
            {{selected.datasetname | safe}} = FrF2::pb(nruns= {{selected.numOfRuns | safe}} ,n12.taguchi= {{selected.taguchiOrderChk | safe}} ,
                nfactors= ({{selected.numOfRuns | safe}} -1), 
				ncenter= {{selected.numOfCenterPts | safe}} , 
				center.distribute = modified_center.distribute ,
				replications= {{selected.replications | safe}} ,
                repeat.only= {{selected.repeatOnlyChk | safe}} ,randomize= {{selected.randomizationChk | safe}} ,
				{{if(options.selected.randomseeds !== "")}} 
				seed= {{selected.randomseeds | safe}},
				{{/if}}
				factor.names= factorParam$factor.names)
 
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
					style: "mt-1 mb-1",
                })
            },
            selectedvars: {
                el: new dstVariableList(config, {
					no: "selectedvars",
                    label: localization.en.selectedvars,
                    filter: "String|Numeric|Date|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UseComma|Enclosed",                    
                    required: true,
                })
            },             
            numOfRuns: {
                el: new inputSpinner(config, {
                    no: 'numOfRuns',
                    label: localization.en.numOfRuns,
                    required: true,
                    min: 1,
                    max: 9999,
                    step: 1,
                    value: 12,
					style: "mt-1",
                })
            },       
            numOfCenterPts: {
                el: new inputSpinner(config, {
                    no: 'numOfCenterPts',
                    label: localization.en.numOfCenterPts,
                    required: true,
                    min: 0,
                    max: 9999,
                    step: 1,
                    value: 0,
					style: "mt-1 mb-1",
                })
            },    		
			centerPointDistribution: {
                el: new inputSpinner(config, {
                    no: 'centerPointDistribution',
                    label: localization.en.centerPointDistribution,
                    required: true,
                    min: 1,
                    max: 9999,
                    step: 1,
                    value: 2,
					style: "ml-4 mb-3",
                })
            },    
            replications: {
                el: new inputSpinner(config, {
                    no: 'replications',
                    label: localization.en.replications,
                    required: true,
                    min: 1,
                    max: 9999,
                    step: 1,
                    value: 1,
					style: "mt-1",
                })
            },
            randomseeds: {
                el: new inputSpinner(config, {
                    no: 'randomseeds',
                    label: localization.en.randomseeds,
                    //required: true,
                    //min: 1,
                    max: 9999,
                    step: 1,
                    value: "",
					style: "mt-1 mb-1",
                })
            },            
            
			// lblheading: { el: new labelVar(config, { label: localization.en.lblheading, style: "mt-3",h: 5 }) },
            lbl1: { el: new labelVar(config, { label: localization.en.lbl1, style: "mt-3", h:6 }) },
            taguchiOrderChk: { el: new checkbox(config, { label: localization.en.taguchiOrderChk, no: "taguchiOrderChk",  style: "ml-4 mt-1 mb-2", extraction: "Boolean", newline: true }) },
            repeatOnlyChk: { el: new checkbox(config, { label: localization.en.repeatOnlyChk, no: "repeatOnlyChk", style: "ml-4 mt-1 mb-1", extraction: "Boolean", newline: false }) },
            
			randomizationChk: { 
				el: new checkbox(config, { 
					label: localization.en.randomizationChk, 
					no: "randomizationChk", 
					state:"checked", 
					//style: "ml-4 mt-1 mb-1", 
					extraction: "Boolean", 
					newline: false,
				}) 
			},
        }
        const content = {
            left: [objects.content_var.el.content],
            right: [ objects.datasetname.el.content, objects.selectedvars.el.content,
                objects.numOfRuns.el.content,  objects.taguchiOrderChk.el.content,
                objects.numOfCenterPts.el.content, objects.centerPointDistribution.el.content,
                objects.replications.el.content, objects.repeatOnlyChk.el.content,
                objects.lbl1.el.content,
				objects.randomizationChk.el.content,
                objects.randomseeds.el.content],
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
module.exports.item = new create2LevelDesign().render()