


class createOrthogonalArrayDesign extends baseModal {
    static dialogId = 'createOrthogonalArrayDesign'
    static t = baseModal.makeT(createOrthogonalArrayDesign.dialogId)

    constructor() {
        var config = {
            id: createOrthogonalArrayDesign.dialogId,
            label: createOrthogonalArrayDesign.t('title'),
            modalType: "two",
            RCode: `
            require(DoE.base)
            require(FrF2)

            factorParam = BSkyDOECreateFactorListParam(factor_dataframe= {{dataset.name}},factor_names=c({{selected.selectedvars | safe}}), num_factors = ncol({{dataset.name}}), max_num_factor_levels = (nrow({{dataset.name}})), variable_num_of_levels = TRUE);
			factorParam$factor.names[] = lapply(factorParam$factor.names, function(x) type.convert(as.character(x), as.is = TRUE))
			
			designnamefromcatlg1 = c(trimws('{{selected.designnamefromcatlg | safe}}'));
			if(designnamefromcatlg1 == "") {designnamefromcatlg1 = NULL} else {designnamefromcatlg1 = c({{selected.designnamefromcatlg | safe}})}
			
			num_runs = c(trimws('{{selected.numOfRuns | safe}}'));
			if(num_runs == "") {num_runs = NULL} else {num_runs = as.numeric({{selected.numOfRuns | safe}})}
			
			if(is.null(designnamefromcatlg1) && is.null(num_runs)){
				{{selected.datasetname | safe}} <- DoE.base::oa.design(ID= NULL ,nruns= NULL ,nfactors= factorParam$nfactors ,replications= {{selected.replications | safe}} ,
                    repeat.only= {{selected.repeatOnlyChk | safe}} ,randomize= {{selected.randomizationChk | safe}} ,
					{{if(options.selected.randomseeds !== "")}} 
					seed= {{selected.randomseeds | safe}},
					{{/if}}
					nlevels=factorParam$nlevels,
                    factor.names=factorParam$factor.names , columns = '{{selected.columnOptimization | safe}}' , min.residual.df= {{selected.minNumOfResidual | safe}} )
			}else if(is.null(designnamefromcatlg1)){
				{{selected.datasetname | safe}} <- DoE.base::oa.design(ID= NULL ,nruns= num_runs ,nfactors= factorParam$nfactors ,replications= {{selected.replications | safe}} ,
                    repeat.only= {{selected.repeatOnlyChk | safe}} ,randomize= {{selected.randomizationChk | safe}} ,
					{{if(options.selected.randomseeds !== "")}} 
					seed= {{selected.randomseeds | safe}},
					{{/if}}
					nlevels=factorParam$nlevels,
                    factor.names=factorParam$factor.names , columns = '{{selected.columnOptimization | safe}}' , min.residual.df= {{selected.minNumOfResidual | safe}} )
			}else if(is.null(num_runs)){
				{{selected.datasetname | safe}} <- DoE.base::oa.design(ID= {{selected.designnamefromcatlg | safe}} ,nruns= NULL ,nfactors= factorParam$nfactors ,replications= {{selected.replications | safe}} ,
                    repeat.only= {{selected.repeatOnlyChk | safe}} ,randomize= {{selected.randomizationChk | safe}} ,
					{{if(options.selected.randomseeds !== "")}} 
					seed= {{selected.randomseeds | safe}},
					{{/if}}
					nlevels=factorParam$nlevels,
                    factor.names=factorParam$factor.names , columns = '{{selected.columnOptimization | safe}}' , min.residual.df= {{selected.minNumOfResidual | safe}} )
			}else{
				{{selected.datasetname | safe}} <- DoE.base::oa.design(ID= {{selected.designnamefromcatlg | safe}} ,nruns= num_runs ,nfactors= factorParam$nfactors ,replications= {{selected.replications | safe}} ,
                    repeat.only= {{selected.repeatOnlyChk | safe}} ,randomize= {{selected.randomizationChk | safe}} ,
					{{if(options.selected.randomseeds !== "")}} 
					seed= {{selected.randomseeds | safe}},
					{{/if}}
					nlevels=factorParam$nlevels,
                    factor.names=factorParam$factor.names , columns = '{{selected.columnOptimization | safe}}' , min.residual.df= {{selected.minNumOfResidual | safe}} )
			}
            			 
            BSkyLoadRefresh('{{selected.datasetname | safe}}')

                `
        }
        var objects = {
            content_var: { el: new srcVariableList(config, {action: "move"}) },
           
            datasetname: {
                el: new input(config, {
                    no: 'datasetname',
                    label: createOrthogonalArrayDesign.t('datasetname'),
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    overwrite: "dataset",
                    value: ""
                })
            },
            selectedvars: {
                el: new dstVariableList(config, {
                    label: createOrthogonalArrayDesign.t('selectedvars'),
                    no: "selectedvars",
                    filter: "String|Numeric|Date|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UseComma|Enclosed",
                    required: true
                })
            },             
			numOfRuns: {
                el: new input(config, {
                    no: 'numOfRuns',
                    label: createOrthogonalArrayDesign.t('numOfRuns'),
					allow_spaces:true,
                    placeholder: "",
                    extraction: "TextAsIs",
                    value: "",
					style: "mb-1",
					width: "w-25",
                })
            },
            minNumOfResidual: {
                el: new inputSpinner(config, {
                    no: 'minNumOfResidual',
                    label: createOrthogonalArrayDesign.t('minNumOfResidual'),
                    required: true,
                    min: 0,
                    max: 9999999,
                    step: 1,
                    value: 0,
                })
            },                 
            replications: {
                el: new inputSpinner(config, {
                    no: 'replications',
                    label: createOrthogonalArrayDesign.t('replications'),
                    required: true,
                    min: 1,
                    max: 9999999,
                    step: 1,
                    value: 1,
                })
            },
            randomseeds: {
                el: new inputSpinner(config, {
                    no: 'randomseeds',
                    label: createOrthogonalArrayDesign.t('randomseeds'),
                    //required: true,
                    //min: 1,
                    max: 99999,
                    step: 1,
                    value: "",
					style: "ml-5",
                })
            },  
			designnamefromcatlg: {
                el: new input(config, {
                    no: 'designnamefromcatlg',
                    label: createOrthogonalArrayDesign.t('designnamefromcatlg'),
					allow_spaces:true,
                    placeholder: "",
                    extraction: "TextAsIs",
                    value: "",
					style: "mb-1",
                })
            },
			columnOptimization: {
                el: new input(config, {
                    no: 'columnOptimization',
                    label: createOrthogonalArrayDesign.t('columnOptimization'),
					allow_spaces:true,
                    placeholder: "",
                    extraction: "TextAsIs",
                    value: "order",
					style: "mb-1",
                })
            },
            // lblheading: { el: new labelVar(config, { label: createOrthogonalArrayDesign.t('lblheading'), style: "mt-3",h: 5 }) },
            lbl1: { el: new labelVar(config, { label: createOrthogonalArrayDesign.t('lbl1'), style: "mt-3",h: 6 }) },
           
            repeatOnlyChk: { el: new checkbox(config, { label: createOrthogonalArrayDesign.t('repeatOnlyChk'), no: "repeatOnlyChk", style: "ml-5", extraction: "Boolean", newline: false }) },
            randomizationChk: { 
				el: new checkbox(config, { 
					label: createOrthogonalArrayDesign.t('randomizationChk'), 
					no: "randomizationChk", 
					//style: "ml-5", 
					state: "checked", 
					extraction: "Boolean", 
					newline: false 
				}) 
			},
        }
        const content = {
            left: [objects.content_var.el.content],
            right: [ objects.datasetname.el.content, objects.selectedvars.el.content,
                objects.numOfRuns.el.content,  
                objects.minNumOfResidual.el.content, 
                objects.replications.el.content, objects.repeatOnlyChk.el.content,
                objects.lbl1.el.content,
				objects.randomizationChk.el.content,
                objects.randomseeds.el.content, 
				objects.designnamefromcatlg.el.content,
				objects.columnOptimization.el.content], 
            nav: {
                name: createOrthogonalArrayDesign.t('navigation'),
                icon: "icon-doe",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
		
        this.help = {
            title: createOrthogonalArrayDesign.t('help.title'),
            r_help: "help(data,package='utils')",
            body: createOrthogonalArrayDesign.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new createOrthogonalArrayDesign().render()
}
