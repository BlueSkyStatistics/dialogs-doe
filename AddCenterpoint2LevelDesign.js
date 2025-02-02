


class addCenterpoint2LevelDesign extends baseModal {
    static dialogId = 'addCenterpoint2LevelDesign'
    static t = baseModal.makeT(addCenterpoint2LevelDesign.dialogId)

    constructor() {
        var config = {
            id: addCenterpoint2LevelDesign.dialogId,
            label: addCenterpoint2LevelDesign.t('title'),
            modalType: "one",
            RCode: `
            require(DoE.base)
            require(FrF2)

			if(attributes({{dataset.name}})$design.info$type %in% c("pb","FrF2"))
			{
				modified_ncenter= {{selected.numOfCenterPts | safe}}
				
				modified_center.distribute = {{selected.centerPointDistribution | safe}}
				
				if(modified_ncenter == 0 || modified_ncenter == 1 || modified_center.distribute == 0)
				{
					modified_center.distribute = NULL
				}else if(modified_ncenter > 1 && modified_center.distribute == 1)
				{
					modified_center.distribute = 2
				}
				
				{{selected.datasetname | safe}} = FrF2::add.center(design = {{dataset.name}},
					ncenter= {{selected.numOfCenterPts | safe}} , 
					distribute = modified_center.distribute)
					
				  BSkyLoadRefresh('{{selected.datasetname | safe}}')
			}else {
				BSkyFormat(paste("Design type is:",attributes({{dataset.name}})$design.info$type, "- centerpoints cannot be added for a non 2 Level Design or a Design with centerpoints already added"))
			}

                `
        }
        var objects = {
            datasetname: {
                el: new input(config, {
                    no: 'datasetname',
                    label: addCenterpoint2LevelDesign.t('datasetname'),
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    overwrite: "dataset",
                    value: "",
					style: "mb-4",
					width:"w-50",
                })
            },
            numOfCenterPts: {
                el: new inputSpinner(config, {
                    no: 'numOfCenterPts',
                    label: addCenterpoint2LevelDesign.t('numOfCenterPts'),
                    required: true,
                    min: 0,
                    max: 9999,
                    step: 1,
                    value: 0,
					style: "mt-1 mb-1",
					width:"w-25",
                })
            },    		
			centerPointDistribution: {
                el: new inputSpinner(config, {
                    no: 'centerPointDistribution',
                    label: addCenterpoint2LevelDesign.t('centerPointDistribution'),
                    required: true,
                    min: 0,
                    max: 9999,
                    step: 1,
                    value: 0,
					//style: "ml-4",
					width:"w-25",
                })
            },         
		}
        const content = {
            items: [ objects.datasetname.el.content,
                objects.numOfCenterPts.el.content, objects.centerPointDistribution.el.content],
            nav: {
                name: addCenterpoint2LevelDesign.t('navigation'),
                icon: "icon-doe",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
		
        this.help = {
            title: addCenterpoint2LevelDesign.t('help.title'),
            r_help: addCenterpoint2LevelDesign.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: addCenterpoint2LevelDesign.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new addCenterpoint2LevelDesign().render()
}
