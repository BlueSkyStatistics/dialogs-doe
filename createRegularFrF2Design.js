


class createRegularFrF2Design extends baseModal {
    static dialogId = 'createRegularFrF2Design'
    static t = baseModal.makeT(createRegularFrF2Design.dialogId)

    constructor() {
        var config = {
            id: createRegularFrF2Design.dialogId,
            label: createRegularFrF2Design.t('title'),
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
                    label: createRegularFrF2Design.t('datasetname'),
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    overwrite: "dataset",
                    value: ""
                })
            },
            selectedvars: {
                el: new dstVariableList(config, {
                    label: createRegularFrF2Design.t('selectedvars'),
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
                    label: createRegularFrF2Design.t('numOfRuns'),
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
                    label: createRegularFrF2Design.t('numOfBlocks'),
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
                    label: createRegularFrF2Design.t('numOfCenterPts'),
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
                    label: createRegularFrF2Design.t('centerPointDistribution'),
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
                    label: createRegularFrF2Design.t('replications'),
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
                    label: createRegularFrF2Design.t('randomseeds'),
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
                    label: createRegularFrF2Design.t('roman'),
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
                    label: createRegularFrF2Design.t('designcatlgname'),
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
                    label: createRegularFrF2Design.t('designnamefromcatlg'),
					allow_spaces:true,
                    placeholder: "",
                    extraction: "TextAsIs",
                    value: "",
					style: "ml-5 mb-1",
					state: "disabled",
                })
            },
			
            lblheading: { el: new labelVar(config, { label: createRegularFrF2Design.t('lblheading'), style: "mt-3",h: 5 }) },
            lbl1: { el: new labelVar(config, { label: createRegularFrF2Design.t('lbl1'), style: "mt-3",h: 6 }) },
            lbl2: { el: new labelVar(config, { label: createRegularFrF2Design.t('lbl2'), style: "mt-3",h: 6 }) },
			lbl3: { el: new labelVar(config, { label: createRegularFrF2Design.t('lbl3'), style: "mt-3",h: 6 }) },
            lbldesignheading: { el: new labelVar(config, { label: createRegularFrF2Design.t('lbldesignheading'), style: "mt-3",h: 5 }) },
            
            alias2FIsChk: { el: new checkbox(config, { label: createRegularFrF2Design.t('alias2FIsChk'), no: "alias2FIsChk",  style: "ml-5", extraction: "Boolean", newline: false }) },
            repeatOnlyChk: { el: new checkbox(config, { label: createRegularFrF2Design.t('repeatOnlyChk'), no: "repeatOnlyChk", style: "ml-5", extraction: "Boolean", newline: false }) },
            
			randomizationChk: { 
				el: new checkbox(config, { 
					label: createRegularFrF2Design.t('randomizationChk'), 
					no: "randomizationChk", 
					//style: "ml-5", 
					state: "checked", 
					extraction: "Boolean", 
					newline: false, 
				}) 
			},
            
			marad: { el: new radioButton(config, { label: createRegularFrF2Design.t('marad'), no: "maxC2radgp", increment: "marad", value: "FALSE", state: "checked", extraction: "ValueAsIs" }) },
            maxC2rad: { el: new radioButton(config, { label: createRegularFrF2Design.t('maxC2rad'), no: "maxC2radgp", increment: "maxC2rad", value: "TRUE", state: "", extraction: "ValueAsIs" }) },
			designChk: { 
				el: new checkbox(config, { 
					label: createRegularFrF2Design.t('designChk'), 
					no: "designChk", 
					//dependant_objects: ["designcatlgname","designnamefromcatlg", "nrunsChk"], 
					state: "unchecked", 
					extraction: "Boolean", 
					newline: false, 
				}) 
			},
			nrunsChk: { el: new checkbox(config, { label: createRegularFrF2Design.t('nrunsChk'), no: "nrunsChk",  style: "mt-5, ml-5", extraction: "Boolean", newline: false }) },
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
                name: createRegularFrF2Design.t('navigation'),
                icon: "icon-doe",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
		
        this.help = {
            title: createRegularFrF2Design.t('help.title'),
            r_help: createRegularFrF2Design.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: createRegularFrF2Design.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new createRegularFrF2Design().render()
}
