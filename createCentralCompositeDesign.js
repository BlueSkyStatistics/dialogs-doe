

class createCentralCompositeDesign extends baseModal {
    static dialogId = 'createCentralCompositeDesign'
    static t = baseModal.makeT(createCentralCompositeDesign.dialogId)

    constructor() {
        var config = {
            id: createCentralCompositeDesign.dialogId,
            label: createCentralCompositeDesign.t('title'),
            modalType: "two",
            RCode: `
            require(DoE.wrapper)

		if("design" %in% class({{selected.datasetFrF2 | safe}}) &&  grepl("FrF2|pb|full factorial", attr({{selected.datasetFrF2 | safe}}, "design.info")$type))
				{
				
					{{selected.datasetname | safe}} = DoE.wrapper::ccd.augment(cube = {{selected.datasetFrF2 | safe}}, 
												ncenter = {{selected.numOfCenterPts | safe}}, 
												columns="all", 
												block.name=c('{{selected.blockName | safe}}'),
												alpha = c('{{selected.alpha | safe}}'), 
												{{if(options.selected.randomseeds !== "")}} 
												seed= {{selected.randomseeds | safe}},
												{{/if}}
												randomize={{selected.randomizationChk | safe}} 
												)
												
					BSkyLoadRefresh('{{selected.datasetname | safe}}')
					
				}else
				{
					cat("\n Selected design", '{{selected.datasetFrF2 | safe}}', "is not a FrF2 design object\n")
				}

                `
        }
        var objects = {
            dataset_var: { el: new srcDataSetList(config, { action: "move" }) },
       
            datasetname: {
                el: new input(config, {
                    no: 'datasetname',
                    label: createCentralCompositeDesign.t('datasetname'),
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    overwrite: "dataset",
                    value: ""
                })
            },
			datasetFrF2: {
                el: new dstVariable(config, {
                    label: createCentralCompositeDesign.t('datasetFrF2'),
                    no: "datasetFrF2",
                    filter: "Dataset",
                    //extraction: "UseComma|Enclosed",
					extraction: "ValueAsIs",
                    required: true,
                })
            },
            alpha: {
                el: new input(config, {
                    no: "alpha",
                    label: createCentralCompositeDesign.t('alpha'),
                    placeholder: "orthogonal",
                    allow_spaces:true,
                    extraction: "NoPrefix|UseComma",
                    value: "orthogonal"
                })
            },                
			numOfCenterPts: {
                el: new input(config, {
                    no: 'numOfCenterPts',
                    label: createCentralCompositeDesign.t('numOfCenterPts'),
					allow_spaces:true,
                    placeholder: "",
                    extraction: "TextAsIs",
                    value: "4",
					//style: "ml-5 mb-1",
                })
            },
			blockName: {
                el: new input(config, {
                    no: 'blockName',
                    label: createCentralCompositeDesign.t('blockName'),
                    placeholder: "",
                    //required: true,
                    extraction: "TextAsIs",
                    value: "Block.ccd",
					//style: "ml-5",
					width: "w-50",
                })
            },    
            randomseeds: {
                el: new inputSpinner(config, {
                    no: 'randomseeds',
                    label: createCentralCompositeDesign.t('randomseeds'),
                    //required: true,
                    //min: 1,
                    max: 99999,
                    step: 1,
                    value: "",
					style: "ml-5",
                })
            },            
            // lblheading: { el: new labelVar(config, { label: createCentralCompositeDesign.t('lblheading'), style: "mt-3",h: 5 }) },
            lbl1: { el: new labelVar(config, { label: createCentralCompositeDesign.t('lbl1'), style: "mt-3",h: 6 }) },

            randomizationChk: { 
				el: new checkbox(config, { 
					label: createCentralCompositeDesign.t('randomizationChk'), 
					no: "randomizationChk", 
					extraction: "Boolean", 
					state: "checked",
					newline: false, 
					//style: "ml-5",
				}) 
			},
        }
        const content = {
            left: [objects.dataset_var.el.content],
            right: [ objects.datasetname.el.content,
                objects.datasetFrF2.el.content,
                objects.numOfCenterPts.el.content,

				objects.blockName.el.content,
				
                objects.alpha.el.content,
                objects.lbl1.el.content,
				objects.randomizationChk.el.content,
                objects.randomseeds.el.content],
            nav: {
                name: createCentralCompositeDesign.t('navigation'),
                icon: "icon-doe",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
		
        this.help = {
            title: createCentralCompositeDesign.t('help.title'),
            r_help: createCentralCompositeDesign.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: createCentralCompositeDesign.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new createCentralCompositeDesign().render()
}
