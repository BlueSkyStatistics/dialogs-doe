

class createLatinHypercubeDesign extends baseModal {
    static dialogId = 'createLatinHypercubeDesign'
    static t = baseModal.makeT(createLatinHypercubeDesign.dialogId)

    constructor() {
        var config = {
            id: createLatinHypercubeDesign.dialogId,
            label: createLatinHypercubeDesign.t('title'),
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
                    label: createLatinHypercubeDesign.t('datasetname'),
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    overwrite: "dataset",
                    value: ""
                })
            },
            selectedvars: {
                el: new dstVariableList(config, {
                    label: createLatinHypercubeDesign.t('selectedvars'),
                    no: "selectedvars",
                    filter: "String|Numeric|Date|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UseComma|Enclosed",
                    required: true
                })
            },             
            numOfRuns: {
                el: new inputSpinner(config, {
                    no: 'numOfRuns',
                    label: createLatinHypercubeDesign.t('numOfRuns'),
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
                    label: createLatinHypercubeDesign.t('numOfDeciPlaces'),
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
                    label: createLatinHypercubeDesign.t('randomseeds'),
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
                    label: createLatinHypercubeDesign.t('lhsDesignType'),
                    multiple: false,
                    extraction: "NoPrefix|UseComma",
                    options: ["optimum", "genetic", "improved", "maximum", "random"],
                    default: "optimum",
                })
            }, */     
			lhsDesignType: {
                el: new input(config, {
                    no: 'lhsDesignType',
                    label: createLatinHypercubeDesign.t('lhsDesignType'),
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    value: "optimum",
                })
            },
			lblheading: { 
				el: new labelVar(config, { 
					label: createLatinHypercubeDesign.t('lblheading'), 
					style: "mt-3",
					h: 5 
				}) 
			},
            lbl1: { 
				el: new labelVar(config, { 
					label: createLatinHypercubeDesign.t('lbl1'), 
					style: "mt-3",
					h: 6 
				}) 
			},
			randomizationChk: { 
				el: new checkbox(config, { 
					label: createLatinHypercubeDesign.t('randomizationChk'), 
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
                name: createLatinHypercubeDesign.t('navigation'),
                icon: "icon-doe",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
		
        this.help = {
            title: createLatinHypercubeDesign.t('help.title'),
            r_help: createLatinHypercubeDesign.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: createLatinHypercubeDesign.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new createLatinHypercubeDesign().render()
}
