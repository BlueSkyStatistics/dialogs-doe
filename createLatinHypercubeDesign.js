var localization = {
    en: {
        title: "Create Latin Hypercube Design (for Quantitative Factors)",
        navigation: "Create Latin Hypercube (Quantitative) Design",
        selectedvars: "Select variables",
        datasetname: "Design name",

        lblheading: "Size and randomization",
        numOfRuns: "Number of runs",

        numOfDeciPlaces: "Number of decimal places",

        lbl1 : "You may not need to change the randomization settings",
        randomseeds : "Seed for randomization",
        randomizationChk:"Randomize the design generation",

        lhsDesignType: "latin hypercube sampling designs (check lhs or DiceDesign packages for other types)",
		
		help: {
            title: "Create Latin Hypercube Design (for Quantitative Factors)",
            r_help: "help(lhs.design, package = DoE.wrapper)",
			body: `
				<b>Description</b></br>
				lhs.design function for accessing latin hypercube sampling designs from package lhs or space-filling designs from package DiceDesign, which are useful for quantitative factors with many possible levels. In particular, they can be used in computer experiments. Most of the designs are random samples.
				<br/>
				<br/>
				For the detail help - use R help(lhs.design, package = DoE.wrapper)
				<br/>
				<br/>
				To try this, you may use the sample dataset file called factor_grid__latin_hypercube_Design.xlsx. Open the file in the data grid with file open menu
				<br/>
				
			`
		},
    }
}

class createLatinHypercubeDesign extends baseModal {
    constructor() {
        var config = {
            id: "createLatinHypercubeDesign",
            label: localization.en.title,
            modalType: "two",
            RCode: `
            require(DoE.base)
            require(FrF2)
			require(DoE.wrapper)

            factorParam = BSkyDOECreateFactorListParam(factor_dataframe= {{dataset.name}},factor_names=c({{selected.selectedvars | safe}}), num_factors = ncol({{dataset.name}}), max_num_factor_levels = (nrow({{dataset.name}})), variable_num_of_levels = TRUE);
			factorParam$factor.names[] = lapply(factorParam$factor.names, function(x) type.convert(as.character(x), as.is = TRUE))
			
            {{selected.datasetname | safe}} <- DoE.wrapper::lhs.design( type= "{{selected.lhsDesignType | safe}}" , nruns= c({{selected.numOfRuns | safe}}) ,nfactors= factorParam$nfactors ,
                digits= {{selected.numOfDeciPlaces | safe}} ,
				{{if(options.selected.randomseeds !== "")}} 
				seed= {{selected.randomseeds | safe}},
				{{/if}}
				nlevels = factorParam$nlevels, randomize = {{selected.randomizationChk| safe}}, factor.names=factorParam$factor.names)

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
                el: new inputSpinner(config, {
                    no: 'numOfRuns',
                    label: localization.en.numOfRuns,
                    required: true,
                    min: 1,
                    max: 9999,
                    step: 1,
                    value: 20,
					style: "mb-3",
                })
            },   
            
            numOfDeciPlaces: {
                el: new inputSpinner(config, {
                    no: 'numOfDeciPlaces',
                    label: localization.en.numOfDeciPlaces,
                    required: true,
                    min: 0,
                    max: 999,
                    step: 1,
                    value: 2,
					style: "mb-3",
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
            /* lhsDesignType: {
                el: new comboBox(config, {
                    no: 'lhsDesignType',
                    label: localization.en.lhsDesignType,
                    multiple: false,
                    extraction: "NoPrefix|UseComma",
                    options: ["optimum", "genetic", "improved", "maximum", "random"],
                    default: "optimum",
                })
            }, */     
			lhsDesignType: {
                el: new input(config, {
                    no: 'lhsDesignType',
                    label: localization.en.lhsDesignType,
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    value: "optimum",
                })
            },
			lblheading: { 
				el: new labelVar(config, { 
					label: localization.en.lblheading, 
					style: "mt-3",
					h: 5 
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
                objects.lblheading.el.content,
                objects.numOfRuns.el.content,  
                objects.numOfDeciPlaces.el.content, 
				
				objects.lbl1.el.content,
                
				objects.randomizationChk.el.content,
				objects.randomseeds.el.content,
     
                objects.lhsDesignType.el.content],
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
module.exports.item = new createLatinHypercubeDesign().render()