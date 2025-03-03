/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Create Taguchi Style Inner-Outer Parameter Design",
        navigation: "Create Taguchi Parameter Design",
        datasetname: "Design name",
        inner: "Inner Design (must have been randomized already)",
        outer: "Outer Design",
		lbl1 : "Direction - Generate Design in Long or Wide format",
		directionLongrad: "Long format",
        directionWiderad: "Wide format",
		responses: "Leave it blank or specify one or more response names (separated by comma without any quote or space in between names)",
		
		help: {
            title: "Create Taguchi Style Inner-Outer Parameter Design",
            r_help: "help(param.design, package = DoE.base)",
			body: `
				<b>Description</b></br>
				param.design function to generate Taguchi style parameter designs. It creates parameter designs for signal-to-noise investigations with inner and outer arrays and facilitate their formatting and data aggregation. The experiment crosses the control factors in the “inner array” with the noise factors in the “outer array”.
				<br/>
				<br/>
				For the detail help - use R help(param.design, package = DoE.base)
				<br/>
				<br/>
				To try this, you may use the sample dataset file called factor_grid_twolevel_screen_Design.xlsx. Open the file in the data grid with file open menu
				<br/>
				<br/>
				1. Create a full factorial design with design name FFinnerRandom with the selected factors - AirVolume, Valve, Barrel, and Angle and check the "Randomize the design generation" box
				<br/>
				2. Create an orthogonal array design with design name FFouter with the selected factors - WadType','Voltage','BallType'
				<br/>
				3. Create a Taguchi design (this dialog/UI) and select the FFinnerRandom and FFouter designs already created in step 1 and step 2
				<br/>
				
			`
		},
		
    }
}


class createTaguchiParameterDesign extends baseModal {
    constructor() {
        var config = {
            id: "createTaguchiParameterDesign",
            label: localization.en.title,
            modalType: "two",
            RCode: `

				if(("design" %in% class({{selected.inner | safe}})) &&  ("design" %in% class({{selected.outer | safe}})))
				{
					modified_responses = if({{selected.responses | safe}}[1] == c('')) NULL else {{selected.responses | safe}}
					
					 {{selected.datasetname | safe}} = DoE.base::param.design(inner={{selected.inner | safe}}, 
									outer={{selected.outer | safe}}, 
									direction="{{selected.directiongp | safe}}",
									responses = modified_responses)
									
												 
					BSkyLoadRefresh('{{selected.datasetname | safe}}')
				} else
				{
					if(!("design" %in% class({{selected.inner | safe}})))
					{
						cat("\nSelected design", '{{selected.inner | safe}}', "is not a design object\n")
					}
					
					if(!("design" %in% class({{selected.outer | safe}})))
					{
						cat("\nSelected design", '{{selected.outer | safe}}', "is not a design object\n")
					}
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
                    value: "",
					style: "mb-2",
                })
            },
            inner: {
                el: new dstVariable(config, {
                    label: localization.en.inner,
                    no: "inner",
                    filter: "Dataset",
                    //extraction: "UseComma|Enclosed",
					extraction: "ValueAsIs",
                    required: true,
                })
            },
            outer: {
                el: new dstVariable(config, {
                    label: localization.en.outer,
                    no: "outer",
                    filter: "Dataset",
                    //extraction: "UseComma|Enclosed",
					extraction: "ValueAsIs",
                    required: true,
                })
            },   
            /* direction: {
                el: new comboBox(config, {
                    no: 'direction',
                    label: localization.en.direction,
                    multiple: false,
                    extraction: "NoPrefix|UseComma",
                    options: ["long", "wide"],
                    default: "long",
                })
            }, */
			lbl1: { 
				el: new labelVar(config, { 
					label: localization.en.lbl1, 
					style: "mt-3",
					h: 6,
				}) 
			},
			directionLongrad: { 
				el: new radioButton(config, { 
					label: localization.en.directionLongrad, 
					no: "directiongp", 
					increment: "directionLongrad", 
					value: "long", 
					state: "checked", 
					extraction: "ValueAsIs", 
					style: "ml-5",
				}) 
			},
            directionWiderad: { 
				el: new radioButton(config, { 
					label: localization.en.directionWiderad, 
					no: "directiongp", 
					increment: "directionWiderad", 
					value: "wide", 
					state: "", 
					extraction: "ValueAsIs", 
					style: "ml-5",
				}) 
			},
			responses: {
                el: new input(config, {
                    no: 'responses',
                    label: localization.en.responses,
					allow_spaces:true,
                    placeholder: "",
                    extraction: "CreateArray",
                    //extraction: "NoPrefix|UseComma|Enclosed",
                    value: "",
                })
            },
        }
        const content = {
            left: [objects.dataset_var.el.content],
            right: [objects.datasetname.el.content,
                objects.inner.el.content,
				objects.outer.el.content,
				objects.lbl1.el.content,
                objects.directionLongrad.el.content, objects.directionWiderad.el.content,
				objects.responses.el.content],
            nav: {
                name: localization.en.navigation,
                icon: "icon-doe",
                modal: config.id
            }
        }
        super(config, objects, content);
		this.help = localization.en.help;
    }
}
module.exports.item = new createTaguchiParameterDesign().render()