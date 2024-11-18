var localization = {
    en: {
        title: "Create Regular (Fractional) Factorial 2-level Design",
        navigation: "Create Regular (Fractional) Factorial 2-level Design",
        selectedvars: "Select variables",
        datasetname: "Design name",

        lblheading: "Size and randomization",
        numOfRuns: "Number of runs (if specified, it must be a power of 2 otherwise make it 0)",

        //numOfFactors: "Number of factors",
        numOfBlocks:"Number of blocks",
        alias2FIsChk:"blocks may be aliased with 2fis",

        //numOfCenterPts: "Number of center points",
		numOfCenterPts: "Number of center points (if used, have minimum 2)",
		centerPointDistribution: "Number of positions for center point distribution (have >1)",
		
        replications: "Replications",
        repeatOnlyChk:"Repeat only",

        lbl1 : "You may not need to change the randomization settings",
        randomseeds : "Seed for randomization",
        randomizationChk:"Randomize the design generation",

        lbl2 : "NOTE: affects design generation for MaxC2 choice OR unspecified number of runs only",
        lbldesignheading: "Design properties",
        roman:"Minimum resolution(III, IV, V...)",
        marad:"MA (Maximum resolution and minimum aberration)",
        maxC2rad:"MaxC2 (Maximum number of clear 2fis)",
		
		lbl3 : "Specify a design catalog (optional)",
		designChk:"Use a design from the catalog",
		designcatlgname : "Design catalog name e.g. catlg",
        designnamefromcatlg : "Design name from the design catalog",
		nrunsChk:"Auto calculate number of runs from the design specified above",
		
		help: {
            title: "Create Regular (Fractional) Factorial 2-level Design",
            r_help: "help(FrF2, package = FrF2)",
			body: `
				<b>Description</b></br>
				FrF2 function to generate regular Fractional Factorial 2-level designs
				<br/>
				<br/>
				For the detail help - use R help(FrF2, package = FrF2)
				<br/>
				<br/>
				Use the menu DOE->Inpect Design->Inspect FrF2 Catalog to browse avaiable FrF2 Designs to reference from the loaded design catalog in FrF2 package
				<br/>
				<br/>
				To try this, you may use the sample dataset file called factor_grid_Injection Molding FrF2.xlsx. Open the file in the data grid with file open menu
				<br/>
			`
		},
    }
}


class createRegularFrF2Design extends baseModal {
    constructor() {
        var config = {
            id: "createRegularFrF2Design",
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
			
			 if ( {{selected.numOfRuns | safe}} == 0) 
             {
                updated_nruns = NULL
             } else
             {
                updated_nruns = {{selected.numOfRuns | safe}}
             }
			
			selectedCatlg = catlg
			designnamefromcatlg1 = NULL
			
			if({{selected.designChk | safe}})
			{
				selectedCatlg = c({{selected.designcatlgname | safe}})
				if(length(selectedCatlg) == 0) selectedCatlg = catlg else selectedCatlg = {{selected.designcatlgname | safe}}
				
				designnamefromcatlg1 = trimws('{{selected.designnamefromcatlg | safe}}') 
				if(designnamefromcatlg1 == "") designnamefromcatlg1 = NULL
			}
			
			{{selected.datasetname | safe}} = FrF2::FrF2(nruns= updated_nruns, nfactors= factorParam$nfactors , 
				blocks= {{selected.numOfBlocks | safe}} , alias.block.2fis =  {{selected.alias2FIsChk | safe}} , 
				ncenter= {{selected.numOfCenterPts | safe}} , 
				center.distribute = modified_center.distribute ,
				MaxC2 = {{selected.maxC2radgp | safe}} , resolution = {{selected.roman | safe}} ,replications= {{selected.replications | safe}} , wbreps= {{selected.numOfBlocks | safe}}, 
				repeat.only= {{selected.repeatOnlyChk | safe}} ,randomize= {{selected.randomizationChk | safe}} , 
				{{if(options.selected.randomseeds !== "")}} 
				seed= {{selected.randomseeds | safe}},
				{{/if}}
				factor.names=factorParam$factor.names, select.catlg = selectedCatlg, design = designnamefromcatlg1 )
				 
            BSkyLoadRefresh('{{selected.datasetname | safe}}') 

                `
        }
        var objects = {
            content_var: { el: new srcVariableList(config, {action: "move", scroll:true}) },
           
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
                    required: true,
                    //items_count : 2
                })
            },             
            numOfRuns: {
                el: new inputSpinner(config, {
                    no: 'numOfRuns',
                    label: localization.en.numOfRuns,
                    required: false,
                    min: 0,
                    max: 99999,
                    step: 1,
                    value: 8,
					width: "w-25",
					style: "mb-2",
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
					style: "ml-5 mb-2",
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
                   // min: 1,
                    max: 9999,
                    step: 1,
                    value: "",
					style: "ml-5",
                })
            },     
            roman: {
                el: new inputSpinner(config, {
                    no: 'roman',
                    label: localization.en.roman,
                    required: true,
                    min: 3,
                    max: 99,
                    step: 1,
                    value: 3,
                })
            },   
				
			designcatlgname: {
                el: new input(config, {
                    no: 'designcatlgname',
                    label: localization.en.designcatlgname,
					allow_spaces:true,
                    placeholder: "",
                    extraction: "TextAsIs",
                    value: "catlg",
					style: "ml-5",
					disabled: true, 
                })
            },
			
			designnamefromcatlg: {
                el: new input(config, {
                    no: 'designnamefromcatlg',
                    label: localization.en.designnamefromcatlg,
					allow_spaces:true,
                    placeholder: "",
                    extraction: "TextAsIs",
                    value: "",
					style: "ml-5 mb-1",
					state: "disabled",
                })
            },
			
            lblheading: { el: new labelVar(config, { label: localization.en.lblheading, style: "mt-3",h: 5 }) },
            lbl1: { el: new labelVar(config, { label: localization.en.lbl1, style: "mt-3",h: 6 }) },
            lbl2: { el: new labelVar(config, { label: localization.en.lbl2, style: "mt-3",h: 6 }) },
			lbl3: { el: new labelVar(config, { label: localization.en.lbl3, style: "mt-3",h: 6 }) },
            lbldesignheading: { el: new labelVar(config, { label: localization.en.lbldesignheading, style: "mt-3",h: 5 }) },
            
            alias2FIsChk: { el: new checkbox(config, { label: localization.en.alias2FIsChk, no: "alias2FIsChk",  style: "ml-5", extraction: "Boolean", newline: false }) },
            repeatOnlyChk: { el: new checkbox(config, { label: localization.en.repeatOnlyChk, no: "repeatOnlyChk", style: "ml-5", extraction: "Boolean", newline: false }) },
            
			randomizationChk: { 
				el: new checkbox(config, { 
					label: localization.en.randomizationChk, 
					no: "randomizationChk", 
					//style: "ml-5", 
					state: "checked", 
					extraction: "Boolean", 
					newline: false, 
				}) 
			},
            
			marad: { el: new radioButton(config, { label: localization.en.marad, no: "maxC2radgp", increment: "marad", value: "FALSE", state: "checked", extraction: "ValueAsIs" }) },
            maxC2rad: { el: new radioButton(config, { label: localization.en.maxC2rad, no: "maxC2radgp", increment: "maxC2rad", value: "TRUE", state: "", extraction: "ValueAsIs" }) },
			designChk: { 
				el: new checkbox(config, { 
					label: localization.en.designChk, 
					no: "designChk", 
					//dependant_objects: ["designcatlgname","designnamefromcatlg", "nrunsChk"], 
					state: "unchecked", 
					extraction: "Boolean", 
					newline: false, 
				}) 
			},
			nrunsChk: { el: new checkbox(config, { label: localization.en.nrunsChk, no: "nrunsChk",  style: "mt-5, ml-5", extraction: "Boolean", newline: false }) },
		}
        const content = {
            left: [objects.content_var.el.content],
            right: [objects.datasetname.el.content, objects.selectedvars.el.content,
                objects.lblheading.el.content,
				objects.numOfRuns.el.content,
                //objects.numOfFactors.el.content,
                objects.numOfBlocks.el.content,objects.alias2FIsChk.el.content,
                objects.numOfCenterPts.el.content, objects.centerPointDistribution.el.content,
                objects.replications.el.content, objects.repeatOnlyChk.el.content,
                objects.lbl1.el.content,
                objects.randomizationChk.el.content,
				objects.randomseeds.el.content, 
                objects.lbldesignheading.el.content,
                objects.lbl2.el.content, objects.roman.el.content,
                objects.marad.el.content,objects.maxC2rad.el.content,
				objects.lbl3.el.content, objects.designChk.el.content, objects.designcatlgname.el.content, objects.designnamefromcatlg.el.content,
				objects.nrunsChk.el.content],
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
module.exports.item = new createRegularFrF2Design().render()