/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */



class createFullFactorialDesign extends baseModal {
    static dialogId = 'createFullFactorialDesign'
    static t = baseModal.makeT(createFullFactorialDesign.dialogId)

    constructor() {
        var config = {
            id: createFullFactorialDesign.dialogId,
            label: createFullFactorialDesign.t('title'),
            modalType: "two",
            RCode: `
            require(DoE.base)
            require(FrF2)

            factorParam = BSkyDOECreateFactorListParam(factor_dataframe= {{dataset.name}},factor_names=c({{selected.selectedvars | safe}}), num_factors = ncol({{dataset.name}}), max_num_factor_levels = (nrow({{dataset.name}})), variable_num_of_levels = TRUE)
			factorParam$factor.names[] = lapply(factorParam$factor.names, function(x) type.convert(as.character(x), as.is = TRUE))

            {{selected.datasetname | safe}} <- DoE.base::fac.design(nfactors = factorParam$nfactors ,replications= {{selected.replications | safe}} ,repeat.only= {{selected.repeatOnlyChk | safe}} ,
                blocks= {{selected.numOfBlocks | safe}} ,randomize= {{selected.randomizationChk | safe}} ,
				{{if(options.selected.randomseeds !== "")}} 
				seed= {{selected.randomseeds | safe}},
				{{/if}}
                nlevels = factorParam$nlevels, 
                factor.names = factorParam$factor.names )
				
			if({{selected.repeatOnlyChk | safe}} == FALSE && {{selected.numOfBlocks | safe}} == 1 && {{selected.replications | safe}} > 1)
			{
				non_factor_col_names = names({{selected.datasetname | safe}})[!(names({{selected.datasetname | safe}}) %in% names(factorParam$factor.names))]
				if(length(non_factor_col_names) > 0) {{selected.datasetname | safe}}[, non_factor_col_names] = type.convert({{selected.datasetname | safe}}[, non_factor_col_names], as.is = TRUE) 
			}
				
             BSkyLoadRefresh('{{selected.datasetname | safe}}')

                `
        }
        var objects = {
            content_var: { el: new srcVariableList(config, {action: "move"}) },
            datasetname: {
                el: new input(config, {
                    no: 'datasetname',
                    label: createFullFactorialDesign.t('datasetname'),
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    overwrite: "dataset",
                    value: "",
					style: "mt-1 mb-1"
                })
            },
            selectedvars: {
                el: new dstVariableList(config, {
                    label: createFullFactorialDesign.t('selectedvars'),
                    no: "selectedvars",
                    filter: "String|Numeric|Date|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UseComma|Enclosed",
                    required: true
                })
            },             
     
            numOfBlocks: {
                el: new inputSpinner(config, {
                    no: 'numOfBlocks',
                    label: createFullFactorialDesign.t('numOfBlocks'),
                    required: true,
                    min: 1,
                    max: 9999,
                    step: 1,
                    value: 1,
                })
            },                 
            replications: {
                el: new inputSpinner(config, {
                    no: 'replications',
                    label: createFullFactorialDesign.t('replications'),
                    required: true,
                    min: 1,
                    max: 9999,
                    step: 1,
                    value: 1,
                })
            },
            randomseeds: {
                el: new inputSpinner(config, {
                    no: 'randomseeds',
                    label: createFullFactorialDesign.t('randomseeds'),
                    //required: true,
                    //min: 1,
                    max: 9999,
                    step: 1,
                    value: "",
					style: "ml-5",
                })
            },            
            // lblheading: { el: new labelVar(config, { label: createFullFactorialDesign.t('lblheading'), style: "mt-3",h: 5 }) },
            lbl1: { el: new labelVar(config, { label: createFullFactorialDesign.t('lbl1'), style: "mt-3", h:6 }) },
            repeatOnlyChk: { el: new checkbox(config, { label: createFullFactorialDesign.t('repeatOnlyChk'), no: "repeatOnlyChk", style: "ml-4 mt-1 mb-1", extraction: "Boolean", newline: false }) },
            randomizationChk: { 
				el: new checkbox(config, { 
					label: createFullFactorialDesign.t('randomizationChk'), 
					no: "randomizationChk", 
					state:"checked", 
					//style: "ml-4 mt-1 mb-1", 
					extraction: "Boolean", 
					newline: false 
				}) 
			},
         }
        const content = {
            left: [objects.content_var.el.content],
            right: [objects.datasetname.el.content, objects.selectedvars.el.content,
                objects.numOfBlocks.el.content, 
                objects.replications.el.content, objects.repeatOnlyChk.el.content,
                objects.lbl1.el.content,
				objects.randomizationChk.el.content,
                objects.randomseeds.el.content],
            nav: {
                name: createFullFactorialDesign.t('navigation'),
                icon: "icon-sample",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
		
        this.help = {
            title: createFullFactorialDesign.t('help.title'),
            r_help: createFullFactorialDesign.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: createFullFactorialDesign.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new createFullFactorialDesign().render()
}
