var localization = {
    en: {
        title: "Add centerpoint to a 2-level Design (quantitative) with no prior centerpoint) - the selected design is the active design on the dataset UI grid",
        navigation: "Add centerpoint 2-level Design (Quantitative)",
        
        datasetname: "Modified Design name with centerpoints",

        numOfCenterPts: "Number of center points (if used, must be minimum 2)",
		centerPointDistribution: "Number of positions for center point distribution (must be >1)",
		
		help: {
            title: "Add centerpoint to a 2-level Design (with no prior centerpoint)",
            r_help: "help(add.center, package = FrF2)",
			body: `
				<b>Description</b></br>
				add.center function to add center points to a 2-level fractional factorial design. All factors must be quantitative 
				<br/>
				<br/>
				For the detail help - use R help(add.center, package = FrF2)
				<br/>
				
			`
		},
		
    }
}


class addCenterpoint2LevelDesign extends baseModal {
    constructor() {
        var config = {
            id: "addCenterpoint2LevelDesign",
            label: localization.en.title,
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
                    label: localization.en.datasetname,
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
                    label: localization.en.numOfCenterPts,
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
                    label: localization.en.centerPointDistribution,
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
module.exports.item = new addCenterpoint2LevelDesign().render()
