


class createDOptimalDesign extends baseModal {
    static dialogId = 'createDOptimalDesign'
    static t = baseModal.makeT(createDOptimalDesign.dialogId)

    constructor() {
        var config = {
            id: createDOptimalDesign.dialogId,
            label: createDOptimalDesign.t('title'),
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
                    label: createDOptimalDesign.t('datasetname'),
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
				label: createDOptimalDesign.t('candidateDesignChk'), 
				no: "candidateDesignChk", 
				extraction: "Boolean", 
				newline: true, 
				style: "mb-3",
				}) 
			},
            selectedvars: {
                el: new dstVariableList(config, {
                    label: createDOptimalDesign.t('selectedvars'),
                    no: "selectedvars",
                    filter: "String|Numeric|Date|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UseComma|Enclosed",
                    //required: true,
                })
            },               
            numOfRuns: {
                el: new inputSpinner(config, {
                    no: 'numOfRuns',
                    label: createDOptimalDesign.t('numOfRuns'),
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
                    label: createDOptimalDesign.t('formula'),
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
                    label: createDOptimalDesign.t('numOfOptiRepeats'),
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
                    label: createDOptimalDesign.t('numOfBlocks'),
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
                    label: createDOptimalDesign.t('blockName'),
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    value: "Blocks",
					//style: "ml-5",
					width: "w-25",
                })
            },
			// lblheading: { el: new labelVar(config, { label: createDOptimalDesign.t('lblheading'), style: "mt-3",h: 5 }) },
            lbl1: { 
				el: new labelVar(config, { 
					label: createDOptimalDesign.t('lbl1'), 
					style: "mt-3",
					h: 6, 
				}) 
			},
            randomseeds: {
                el: new inputSpinner(config, {
                    no: 'randomseeds',
                    label: createDOptimalDesign.t('randomseeds'),
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
					label: createDOptimalDesign.t('randomizationChk'), 
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
                name: createDOptimalDesign.t('navigation'),
                icon: "icon-doe",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
		
        this.help = {
            title: createDOptimalDesign.t('help.title'),
            r_help: createDOptimalDesign.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: createDOptimalDesign.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new createDOptimalDesign().render()
}
