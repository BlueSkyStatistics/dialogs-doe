var localization = {
    en: {
        title: "Create D-Optimal Design",
        navigation: "Create D-Optimal Design",
		
		datasetname: "D-optimal Design name",

		candidateDesignChk: "Create D-optimal design from an existing candidate design (full factorial, FrF2, Orthogonal, or Latin) - make sure this dialog is opened on the existing design on the data grid to choose the candidate design implicitely",
		
        selectedvars: "Select variables (Ignored if candidate design is checked above) to create a D-optmal design not from an exsiting candidate design",
        
        numOfRuns: "Number of runs",
        formula : "Formula - leave it deafult to include all factiors in the model or type in a linear model formula e.g. ~quad(.)",
		
        numOfOptiRepeats: "Number of optimization Repeats",
		//repeatOnlyChk:"Repeat only",
		
		numOfBlocks: "Number of blocks",
		blockName: "Name of the block", 

		lbl1 : "You may not need to change the randomization settings",
        randomseeds : "Seed for randomization",
        randomizationChk:"Randomize the design generation",
		
		help: {
            title: "Create D-Optimal Design",
            r_help: "help(Dopt.design, package = DoE.wrapper)",
			body: `
				<b>Description</b></br>
				Dopt.design function for creating D-optimal designs with or without blocking
				<br/>
				<br/>
				For the detail help - use R help(Dopt.design, package = DoE.wrapper)
				<br/>
				<br/>
				To try this, you may use the sample dataset file called factor_grid_full_factorial_to use_for_Doptimal_Design.xlsx. Open the file in the data grid with file open menu
				<br/>
				Create the full factorial design first, choose the full fatorial design from this dialog/UI and specify runs = 16 to create a D-optimal design from a full factorial design  
			`
		},
		
    }
}


class createDOptimalDesign extends baseModal {
    constructor() {
        var config = {
            id: "createDOptimalDesign",
            label: localization.en.title,
            modalType: "two",
            RCode: `
            require(DoE.base)
            require(FrF2)
			require(DoE.wrapper)

			factorParam = list()
			factorParam$factor.names = NULL
			factorParam$nlevels = NULL
			
			if({{selected.candidateDesignChk}}) 
			{
				candidateData = {{dataset.name}} 
			}else {
				factorParam = BSkyDOECreateFactorListParam(factor_dataframe= {{dataset.name}},factor_names=c({{selected.selectedvars | safe}}), num_factors = ncol({{dataset.name}}), max_num_factor_levels = (nrow({{dataset.name}})), variable_num_of_levels = TRUE);
				factorParam$factor.names[] = lapply(factorParam$factor.names, function(x) type.convert(as.character(x), as.is = TRUE))

				candidateData = NULL
			}
			
			{{selected.datasetname | safe}} = DoE.wrapper::Dopt.design( nruns = {{selected.numOfRuns | safe}} , data= candidateData , 
				formula= {{selected.formula | safe}} , nRepeat= {{selected.numOfOptiRepeats | safe}} ,
				nlevels= factorParam$nlevels, factor.names=factorParam$factor.names,
				digits=NULL, constraint=NULL, center=FALSE,
				blocks={{selected.numOfBlocks | safe}}, block.name="{{selected.blockName | safe}}", wholeBlockData=NULL, qual=NULL,
				{{if(options.selected.randomseeds !== "")}} 
				seed= {{selected.randomseeds | safe}},
				{{/if}}
				randomize= {{selected.randomizationChk| safe}} ,
				
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
					style: "mb-4",
                })
            },
			candidateDesignChk: { 
				el: new checkbox(config, { 
				label: localization.en.candidateDesignChk, 
				no: "candidateDesignChk", 
				extraction: "Boolean", 
				newline: true, 
				style: "mb-3",
				}) 
			},
            selectedvars: {
                el: new dstVariableList(config, {
                    label: localization.en.selectedvars,
                    no: "selectedvars",
                    filter: "String|Numeric|Date|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UseComma|Enclosed",
                    //required: true,
                })
            },               
            numOfRuns: {
                el: new inputSpinner(config, {
                    no: 'numOfRuns',
                    label: localization.en.numOfRuns,
                    required: true,
                    min: 1,
                    max: 99999,
                    step: 1,
                    value: 8,
                })
            },      
            formula: {
                el: new input(config, {
                    no: "formula",
                    label: localization.en.formula,
                    placeholder: "",
                    allow_spaces:true,
                    extraction: "TextAsIs",
                    overwrite: "dataset",
                    value: "~.",
					style: "mb-2",
                })
            },                      
            numOfOptiRepeats: {
                el: new inputSpinner(config, {
                    no: 'numOfOptiRepeats',
                    label: localization.en.numOfOptiRepeats,
                    required: true,
                    min: 1,
                    max: 9999,
                    step: 1,
                    value: 5,
					style: "mb-2",
                })
            },
			numOfBlocks: {
                el: new inputSpinner(config, {
                    no: 'numOfBlocks',
                    label: localization.en.numOfBlocks,
                    required: true,
                    min: 1,
                    max: 99,
                    step: 1,
                    value: 1,
                })
            },
			blockName: {
                el: new input(config, {
                    no: 'blockName',
                    label: localization.en.blockName,
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    value: "Blocks",
					//style: "ml-5",
					width: "w-25",
                })
            },
			// lblheading: { el: new labelVar(config, { label: localization.en.lblheading, style: "mt-3",h: 5 }) },
            lbl1: { 
				el: new labelVar(config, { 
					label: localization.en.lbl1, 
					style: "mt-3",
					h: 6, 
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
            right: [ objects.datasetname.el.content, 
				objects.candidateDesignChk.el.content,
				objects.selectedvars.el.content,
                objects.numOfRuns.el.content,  
                objects.formula.el.content,  
                objects.numOfOptiRepeats.el.content, 
				objects.numOfBlocks.el.content,
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
module.exports.item = new createDOptimalDesign().render()