var localization = {
    en: {
        title: "Create Central Composite (Quantitative) Design from an exsiting FrF2 Design",
        navigation: "Create Central Composite (Quantitative) Design",
        
		datasetname: "Design name",
		
        datasetFrF2 : "Select an exisiting FrF2 (Quantitative) design",
        
		alpha: "Number of star points(alpha)",
        alphalbl: "“orthogonal”, “rotatable”, or a number that indicates the position of the star points",
        
        numOfCenterPts: "Number of center points, or two numbers seperated by comma (for cube and the star portion)",
		
		blockName: "Name of the block", 

        lbl1 : "You may not need to change the randomization settings",
        randomseeds : "Seed for randomization",
        randomizationChk:"Randomize the design generation",
		
		help: {
            title: "Create Central Composite (Quantitative) Design from an exsiting FrF2 Design",
            r_help: "help(ccd.augment, package = DoE.wrapper)",
			body: `
				<b>Description</b></br>
				ccd.augment function for augmenting an existing fractional factorial with a star portion (using rsm package) in case of a late decision for a sequential procedure
				<br/>
				<br/>
				For the detail help - use R help(ccd.augment, package = DoE.wrapper)
				<br/>
				<br/>
				To try this, you may use the sample dataset file called factors for FrF2 design for CCD.xlsx. Open the file in the data grid with file open menu
				<br/>
				Create the FrF2 design first (with the 4 factors) - choose option number of runs as 0 and resolution as 5.
				Then ceate the central composite design from the above FrF2 design keeping all the deafult options on this central composite design dialog/UI  
				<br/>
			`
		},
		
		
    }
}

class createCentralCompositeDesign extends baseModal {
    constructor() {
        var config = {
            id: "createCentralCompositeDesign",
            label: localization.en.title,
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
                    label: localization.en.datasetname,
                    placeholder: "",
                    required: true,
                    extraction: "TextAsIs",
                    overwrite: "dataset",
                    value: ""
                })
            },
			datasetFrF2: {
                el: new dstVariable(config, {
                    label: localization.en.datasetFrF2,
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
                    label: localization.en.alpha,
                    placeholder: "orthogonal",
                    allow_spaces:true,
                    extraction: "NoPrefix|UseComma",
                    value: "orthogonal"
                })
            },                
			numOfCenterPts: {
                el: new input(config, {
                    no: 'numOfCenterPts',
                    label: localization.en.numOfCenterPts,
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
                    label: localization.en.blockName,
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
                    label: localization.en.randomseeds,
                    //required: true,
                    //min: 1,
                    max: 99999,
                    step: 1,
                    value: "",
					style: "ml-5",
                })
            },            
            // lblheading: { el: new labelVar(config, { label: localization.en.lblheading, style: "mt-3",h: 5 }) },
            lbl1: { el: new labelVar(config, { label: localization.en.lbl1, style: "mt-3",h: 6 }) },

            randomizationChk: { 
				el: new checkbox(config, { 
					label: localization.en.randomizationChk, 
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
module.exports.item = new createCentralCompositeDesign().render()