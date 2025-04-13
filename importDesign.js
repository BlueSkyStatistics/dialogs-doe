/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Import Design - must be a csv file with added response column(s) to the previously exported design",
        navigation: "Import Design Response",
        datasetname: "Name to create the design with response(s)",
        importResp: "File path for the design file (must be a csv file) that contains response column(s)",
		
		help: {
            title: "Import Responses to an exsiting Design",
            r_help: "help(add.response, package = DoE.base)",
			body: `
				<b>Description</b></br>
				Import the Design csv file with added response columns i.e. results recoded from the experiments conducted from the original design previously exported
				<br/>
				<br/>
				The purpose of importing the csv file against a design already open in the dataset UI grid is to add the response columns automatically from the csv file to the design in the UI grid and create a new design with the name specified 
				<br/>
				<br/>
				Once the new design with the response columns is created - this can be analyzed with various analysis methods under DOE -> Analyze Design menu
				<br/>
				<br/>
				In addition, designating/un-designating one or more response column(s) can be performed by DOE -> Modify Design - > Add/Remove Response menu 
				<br/>
				<br/>
				If the required design is not already opened on the dataset UI grid, using the file Open menu, load the design R object (.rda file) that was previously exported with "Export Design" menu into a directory on the file system.  
				<br/>
				<br/>
				For additional information - use R help(add.response, package = DoE.base)
				<br/>
				
			`
		}
       
    }
}

class importDesign extends baseModal {
    constructor() {
        var config = {
            id: "importDesign",
            label: localization.en.title,
            modalType: "one",
            RCode: `
require(DoE.base)
{{selected.datasetname | safe}} <- DoE.base::add.response({{dataset.name}},  "{{selected.importResp | safe}}", replace=FALSE)
BSkyLoadRefresh('{{selected.datasetname | safe}}')
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
                    value: ""
                })
            },  
            
            importResp: {
                el: new fileOpenControl(config, 
                    {
                        no: "importResp", 
                        label: localization.en.importResp,
                        extraction: "TextAsIs",
                        required:true
                    })}
            // importResp: {
            //     el: new input(config, {
            //         no: 'importResp',
            //         label: localization.en.importResp,
            //         required: true,
            //         placeholder: "",
            //         allow_spaces:true,
            //         extraction: "TextAsIs",
            //         value: ""
            //     })
            // }
        }
        const content = {
            items: [objects.datasetname.el.content, objects.importResp.el.content],
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
module.exports.item = new importDesign().render()