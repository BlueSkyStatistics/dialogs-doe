/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */


var localization = {
    en: {
        title: "Export Design - three files (csv, html, rda) will be created with the same name as the design",
        navigation: "Export Design",
        exportPath: "File path to export the design",
		
		help: {
            title: "Export Design",
            //r_help: "help(param.design, package=DoE.base)",
			body: `
				<b>Description</b></br>
				Exporting the Design will create three files (csv, html, rda) with the same name as the design in the directory path chosen
				<br/>
				<br/>
				The purpose of exporting the design is to set up and conduct the experiments per the design in the real world and collect the results. 
				<br/>
				<br/>
				Add column(s) that are compliant with R variable naming convention to the csv file to record the results. These additional columns are known as the response(s) per the vocabulary of Design of Experiments. 
				<br/>
				<br/>
				Once the response column(s) are added to the csv file, DOE -> Import Design menu can be used to load the csv file against the correct design (already open) on the dataset UI grid.  
				<br/>
				
			`
		},
    }
}


class exportDesign extends baseModal {
    constructor() {
        var config = {
            id: "exportDesign",
            label: localization.en.title,
            modalType: "one",
            RCode: `
                    export.design({{dataset.name}}, type="all", path="{{selected.exportPath | safe}}", file="{{dataset.name}}", replace=TRUE)
                `
        }
        var objects = {
            // exportPath: {
            //     el: new input(config, {
            //         no: 'exportPath',
            //         label: localization.en.exportPath,
            //         required: true,
            //         placeholder: "",
            //         allow_spaces:true,
            //         extraction: "TextAsIs",
            //         value: ""
            //     })
            // }

            exportPath: {
                el: new fileOpenControl(config, 
                    {
                        no: "exportPath", 
                        label: localization.en.exportPath, 
                        type: 'folder', 
                        extraction: "TextAsIs",
                        required:true
                    })},
        }
        const content = {
            items: [objects.exportPath.el.content],
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
module.exports.item = new exportDesign().render()