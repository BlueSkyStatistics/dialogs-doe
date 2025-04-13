/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */

var localization = {
    en: {
        title: "Browse the Orthogonal Array (oacat) design catalog",
        navigation: "Browse Orthogonal Design Catalog",
		
		/*
		show.oas(name = "all", nruns = "all", nlevels = "all", factors = "all", 
		regular = "all", GRgt3 = c("all", "tot", "ind"), Rgt3 = FALSE, show = 10, 
		parents.only = FALSE, showGRs = FALSE, showmetrics = FALSE, digits = 3)
		*/

		// designCatalog: "Name of the Design Catalog (must be an object of class catlg)",
        
		designNamefromCatalog: "Name of the Orthogonal Array design in the catalog (e.g. L18.3.6.6.1)",

        numRuns: "Number of runs or a 2-element vector e.g. 4,16 with a minimum and maximum for the number of runs",
		
		numFactors: "Number of factors (seperate them by , e.g. 4,2,1)",
		
		numLevels: "Number of levels (seperate them by , e.g. 3,2,5)",

        showQualityMetricsChk: "Show all array quality metrics with the resulting arrays;",
		
		maxDigits: "Significant digits to show for GR and A metrics",
		
		maxNumberofDesignPrint: "Show maximum number of designs",
		
		help: {
            title: "Browse the Orthogonal Array (oacat) design catalog",
            r_help: "help(show.oas, package = DoE.base)",
			body: `
				<b>Description</b></br>
				Browse/Inspect design elements or extract information from the list of available orthogonal arrays, optionally specifying selection criteria
				<br/>
				<br/>
				For the detail help - use R help(show.oas, package = DoE.base)
				<br/>
				
			`
		},
		
    }
}


class inspectOADesignCatalog extends baseModal {
    constructor() {
        var config = {
            id: "inspectOADesignCatalog",
            label: localization.en.title,
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
                    label: localization.en.designNamefromCatalog,
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
                    label: localization.en.numRuns,
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
                    label: localization.en.numFactors,
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
                    label: localization.en.numLevels,
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
                    label: localization.en.maxDigits,
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
				label: localization.en.showQualityMetricsChk, 
				no: "showQualityMetricsChk", 
				extraction: "Boolean", 
				newline: true,
				}) 
			},
			maxNumberofDesignPrint: {
                el: new inputSpinner(config, {
                    no: 'maxNumberofDesignPrint',
                    label: localization.en.maxNumberofDesignPrint,
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
module.exports.item = new inspectOADesignCatalog().render()