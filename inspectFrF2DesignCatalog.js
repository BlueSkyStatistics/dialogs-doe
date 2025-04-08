/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */




class inspectFrF2DesignCatalog extends baseModal {
    static dialogId = 'inspectFrF2DesignCatalog'
    static t = baseModal.makeT(inspectFrF2DesignCatalog.dialogId)

    constructor() {
        var config = {
            id: inspectFrF2DesignCatalog.dialogId,
            label: inspectFrF2DesignCatalog.t('title'),
            modalType: "one",
            RCode: `
				require(DoE.base)
				require(FrF2)
				
				updated_nruns = '{{selected.numRuns | safe}}'
				if(trimws(updated_nruns) != 'all') updated_nruns = c({{selected.numRuns | safe}})
				
				updated_nfactors = '{{selected.numFactors | safe}}'
				if(trimws(updated_nfactors) != 'all') updated_nfactors = c({{selected.numFactors | safe}})
				
				print(	x = {{selected.designCatalog | safe}}, 
						name = '{{selected.designNamefromCatalog | safe}}', 
						nruns = updated_nruns, 
						nfactors = updated_nfactors,
						res.min= {{selected.minResolution | safe}}, 
						MaxC2 = {{selected.MaxC2Chk | safe}},  
						show.alias = {{selected.showAliasChk | safe}}, 
						show={{selected.maxNumberofDesignPrint | safe}}  
					)
                `
        }
        var objects = {
			
			designCatalog: {
                el: new input(config, {
                    no: 'designCatalog',
                    label: inspectFrF2DesignCatalog.t('designCatalog'),
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    value: "catlg",
					width: "w-25",
                })
            },
			designNamefromCatalog: {
                el: new input(config, {
                    no: 'designNamefromCatalog',
                    label: inspectFrF2DesignCatalog.t('designNamefromCatalog'),
					allow_spaces:true,
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    value: "all",
					width: "w-25",
                })
            },
			numRuns: {
                el: new input(config, {
                    no: 'numRuns',
                    label: inspectFrF2DesignCatalog.t('numRuns'),
					allow_spaces:true,
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    value: "all",
					width: "w-25",
                })
            },
			numFactors: {
                el: new input(config, {
                    no: 'numFactors',
                    label: inspectFrF2DesignCatalog.t('numFactors'),
					allow_spaces:true,
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    value: "all",
					style: "mb-2",
					width: "w-25",
                })
            },
			minResolution: {
                el: new inputSpinner(config, {
                    no: 'minResolution',
                    label: inspectFrF2DesignCatalog.t('minResolution'),
                    required: true,
                    min: 3,
                    max: 99,
                    step: 1,
                    value: 3,
					style: "mb-2",
					width: "w-25",
                })
            },  
			maxNumberofDesignPrint: {
                el: new inputSpinner(config, {
                    no: 'maxNumberofDesignPrint',
                    label: inspectFrF2DesignCatalog.t('maxNumberofDesignPrint'),
                    required: true,
                    min: 1,
                    max: 99,
                    step: 1,
                    value: 5,
					style: "mb-2",
					width: "w-25",
                })
            },     	
			
            MaxC2Chk: { el: new checkbox(config, { label: inspectFrF2DesignCatalog.t('MaxC2Chk'), no: "MaxC2Chk", extraction: "Boolean", newline: true }) },
			showAliasChk: { el: new checkbox(config, { label: inspectFrF2DesignCatalog.t('showAliasChk'), no: "showAliasChk", extraction: "Boolean", newline: true }) },
        }
        const content = {
            items: [objects.designCatalog.el.content,
                     objects.designNamefromCatalog.el.content,
					 objects.numRuns.el.content,
					 objects.numFactors.el.content,
					 objects.minResolution.el.content,
					 objects.MaxC2Chk.el.content,
					 objects.showAliasChk.el.content,
                     objects.maxNumberofDesignPrint.el.content],
            nav: {
                name: inspectFrF2DesignCatalog.t('navigation'),
                icon: "icon-doe",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
		
        this.help = {
            title: inspectFrF2DesignCatalog.t('help.title'),
            r_help: inspectFrF2DesignCatalog.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: inspectFrF2DesignCatalog.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new inspectFrF2DesignCatalog().render()
}
