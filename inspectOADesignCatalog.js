/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */




class inspectOADesignCatalog extends baseModal {
    static dialogId = 'inspectOADesignCatalog'
    static t = baseModal.makeT(inspectOADesignCatalog.dialogId)

    constructor() {
        var config = {
            id: inspectOADesignCatalog.dialogId,
            label: inspectOADesignCatalog.t('title'),
            modalType: "one",
            RCode: `
				require(DoE.base)
				
				updated_name = '{{selected.designNamefromCatalog | safe}}'
				if(trimws(updated_name) != 'all') updated_name = c('{{selected.designNamefromCatalog | safe}}')
				
				updated_nruns = '{{selected.numRuns | safe}}'
				if(trimws(updated_nruns) != 'all') updated_nruns = c({{selected.numRuns | safe}})
				
				updated_nfactors = '{{selected.numFactors | safe}}'
				if(trimws(updated_nfactors) != 'all') updated_nfactors = c({{selected.numFactors | safe}})
				
				updated_nLevels = '{{selected.numLevels | safe}}'
				if(trimws(updated_nLevels) != 'all') updated_nLevels = c({{selected.numLevels | safe}})
				
				DoE.base::show.oas(name = updated_name, 
						nruns = updated_nruns, 
						nlevels = updated_nLevels, 
						factors = updated_nfactors, 
						regular = "all", GRgt3 = c("all", "tot", "ind"), Rgt3 = FALSE, 
						show = {{selected.maxNumberofDesignPrint | safe}}, 
						parents.only = FALSE, 
						showGRs = FALSE, 
						digits = 3,
						showmetrics = {{selected.showQualityMetricsChk | safe}} 
						)
                `
        }
        var objects = {
			
			designNamefromCatalog: {
                el: new input(config, {
                    no: 'designNamefromCatalog',
                    label: inspectOADesignCatalog.t('designNamefromCatalog'),
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
                    label: inspectOADesignCatalog.t('numRuns'),
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
                    label: inspectOADesignCatalog.t('numFactors'),
					allow_spaces:true,
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    value: "all",
					style: "mb-2",
					width: "w-25",
                })
            },
			numLevels: {
                el: new input(config, {
                    no: 'numLevels',
                    label: inspectOADesignCatalog.t('numLevels'),
					allow_spaces:true,
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    value: "all",
					style: "mb-2",
					width: "w-25",
                })
            },
			maxDigits: {
                el: new inputSpinner(config, {
                    no: 'maxDigits',
                    label: inspectOADesignCatalog.t('maxDigits'),
                    //required: true,
                    min: 0,
                    max: 99,
                    step: 1,
                    value: 2,
					style: "mb-2",
					width: "w-25",
                })
            }, 	
           showQualityMetricsChk: { 
				el: new checkbox(config, { 
				label: inspectOADesignCatalog.t('showQualityMetricsChk'), 
				no: "showQualityMetricsChk", 
				extraction: "Boolean", 
				newline: true,
				}) 
			},
			maxNumberofDesignPrint: {
                el: new inputSpinner(config, {
                    no: 'maxNumberofDesignPrint',
                    label: inspectOADesignCatalog.t('maxNumberofDesignPrint'),
                    required: true,
                    min: 1,
                    max: 99,
                    step: 1,
                    value: 5,
					style: "mb-2",
					width: "w-25",
                })
            }, 
        }
        const content = {
            items: [ objects.designNamefromCatalog.el.content,
					 objects.numRuns.el.content,
					 objects.numLevels.el.content,
					 objects.numFactors.el.content,
					 objects.showQualityMetricsChk.el.content,
					 //objects.maxDigits.el.content,
                     objects.maxNumberofDesignPrint.el.content],
            nav: {
                name: inspectOADesignCatalog.t('navigation'),
                icon: "icon-doe",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
		
        this.help = {
            title: inspectOADesignCatalog.t('help.title'),
            r_help: inspectOADesignCatalog.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: inspectOADesignCatalog.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new inspectOADesignCatalog().render()
}
