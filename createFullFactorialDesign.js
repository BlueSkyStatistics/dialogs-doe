var localization = {
    en: {
        title: "Create Full Factorial Design",
        navigation: "Create Full Factorial Design",
        datasetname: "Design name",
        selectedvars: "Select variables",

        numOfBlocks: "Number of blocks",
        replications: "Replications",
        repeatOnlyChk:"Repeat only",

        lbl1 : "You may not need to change the randomization settings",
        randomseeds : "Seed for randomization",
        randomizationChk:"Randomize the design generation",
		
		help: {
            title: "Create Full Factorial Design",
            r_help: "help(fac.design, package = DoE.base)",
			body: `
				<b>Description</b></br>
				fac.design function to generate full factorial designs
				<br/>
				<br/>
				For the detail help - use R help(fac.design, package = DoE.base)
				<br/>
				<br/>
				To try this, you may use the sample dataset file called factor_grid_full_factorial_Design.xlsx. Open the file in the data grid with file open menu
				<br/>
			`
		},

    }
}

class createFullFactorialDesign extends baseModal {
    constructor() {
        var config = {
            id: "createFullFactorialDesign",
            label: localization.en.title,
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
                    label: localization.en.datasetname,
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
                    label: localization.en.selectedvars,
                    no: "selectedvars",
                    filter: "String|Numeric|Date|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UseComma|Enclosed",
                    required: true
                })
            },             
     
            numOfBlocks: {
                el: new inputSpinner(config, {
                    no: 'numOfBlocks',
                    label: localization.en.numOfBlocks,
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
                    label: localization.en.replications,
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
                    label: localization.en.randomseeds,
                    //required: true,
                    //min: 1,
                    max: 9999,
                    step: 1,
                    value: "",
					style: "ml-5",
                })
            },            
            // lblheading: { el: new labelVar(config, { label: localization.en.lblheading, style: "mt-3",h: 5 }) },
            lbl1: { el: new labelVar(config, { label: localization.en.lbl1, style: "mt-3", h:6 }) },
            repeatOnlyChk: { el: new checkbox(config, { label: localization.en.repeatOnlyChk, no: "repeatOnlyChk", style: "ml-4 mt-1 mb-1", extraction: "Boolean", newline: false }) },
            randomizationChk: { 
				el: new checkbox(config, { 
					label: localization.en.randomizationChk, 
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
                name: localization.en.navigation,
                icon: "icon-sample",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
		this.help = localization.en.help;
    }
}
module.exports.item = new createFullFactorialDesign().render()