/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */

var localization = {
    en: {
        title: "Browse a FrF2 design catalog (e.g. catlg)",
        navigation: "Browse FrF2 Design Catalog",
		
		//print(catlg, name="all", nruns="all", nfactors="all",res.min=3, MaxC2=FALSE, show=10, gen.letters=FALSE, show.alias=FALSE)

		designCatalog: "Name of the design catalog (must be an object of class catlg)",
        
		designNamefromCatalog: "Name of the design in the catalog",

        numRuns: "Number of runs (if more than one, seperate them by , e.g. 8,16,64)",
		
		numFactors: "Number of factors (if more than one, seperate them by , e.g. 4,5,11)",
		
		minResolution: "Minimum Design Resolution (e.g. type 3 for III, 4 for IV, 5 for V, ..)", 
		
		MaxC2Chk: "If unchecked - designs are ordered by minimum aberration or if checked - by maximum number of clear 2fis",

        showAliasChk: "Show alias structure (up to 2fis)",
		
		maxNumberofDesignPrint: "Show maximum number of designs",
		
		help: {
            title: "Browse a FrF2 design catalog (e.g. catlg)",
            r_help: "help(catlg, package = FrF2)",
			body: `
				<b>Description</b></br>
				Browse/Inspect design elements or extract information from design catalog of class catlg in FrF2 package
				<br/>
				<br/>
				For the detail help - use R help(catlg, package = FrF2)
				<br/>
				
			`
		},
		
    }
}


class inspectFrF2DesignCatalog extends baseModal {
    constructor() {
        var config = {
            id: "inspectFrF2DesignCatalog",
            label: localization.en.title,
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
                    label: localization.en.designCatalog,
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
			minResolution: {
                el: new inputSpinner(config, {
                    no: 'minResolution',
                    label: localization.en.minResolution,
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
			
            MaxC2Chk: { el: new checkbox(config, { label: localization.en.MaxC2Chk, no: "MaxC2Chk", extraction: "Boolean", newline: true }) },
			showAliasChk: { el: new checkbox(config, { label: localization.en.showAliasChk, no: "showAliasChk", extraction: "Boolean", newline: true }) },
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
module.exports.item = new inspectFrF2DesignCatalog().render()