/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */




class create2LevelDesign extends baseModal {
    static dialogId = 'create2LevelDesign'
    static t = baseModal.makeT(create2LevelDesign.dialogId)

    constructor() {
        var config = {
            id: create2LevelDesign.dialogId,
            label: create2LevelDesign.t('title'),
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
                    label: create2LevelDesign.t('datasetname'),
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
                    label: create2LevelDesign.t('selectedvars'),
                    filter: "String|Numeric|Date|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UseComma|Enclosed",                    
                    required: true,
                })
            },             
            numOfRuns: {
                el: new inputSpinner(config, {
                    no: 'numOfRuns',
                    label: create2LevelDesign.t('numOfRuns'),
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
                    label: create2LevelDesign.t('numOfCenterPts'),
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
                    label: create2LevelDesign.t('centerPointDistribution'),
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
                    label: create2LevelDesign.t('replications'),
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
                    label: create2LevelDesign.t('randomseeds'),
                    //required: true,
                    //min: 1,
                    max: 9999,
                    step: 1,
                    value: "",
					style: "mt-1 mb-1",
                })
            },            
            
			// lblheading: { el: new labelVar(config, { label: create2LevelDesign.t('lblheading'), style: "mt-3",h: 5 }) },
            lbl1: { el: new labelVar(config, { label: create2LevelDesign.t('lbl1'), style: "mt-3", h:6 }) },
            taguchiOrderChk: { el: new checkbox(config, { label: create2LevelDesign.t('taguchiOrderChk'), no: "taguchiOrderChk",  style: "ml-4 mt-1 mb-2", extraction: "Boolean", newline: true }) },
            repeatOnlyChk: { el: new checkbox(config, { label: create2LevelDesign.t('repeatOnlyChk'), no: "repeatOnlyChk", style: "ml-4 mt-1 mb-1", extraction: "Boolean", newline: false }) },
            
			randomizationChk: { 
				el: new checkbox(config, { 
					label: create2LevelDesign.t('randomizationChk'), 
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
                name: create2LevelDesign.t('navigation'),
                icon: "icon-doe",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
		
        this.help = {
            title: create2LevelDesign.t('help.title'),
            r_help: create2LevelDesign.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: create2LevelDesign.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new create2LevelDesign().render()
}
