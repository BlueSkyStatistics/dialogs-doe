var localization = {
    en: {
        title: "A quick overview of the Design of Experiments (DoE) functionality",
        navigation: "DoE Overivew",

        lbl1 : " 1. To create any Design under DOE -> create design menu, first you need a dataset with factor details to create the design from", 
		lbl2 : " 2. To get started, choose one of the sample datasets (excel file) provided in the sample dataset directory in your BlueSky Statistics install directory or you can create a factor detail table/dataset on the fly with DOE -> Create DoE Factor Details menu",
		lbl3 : " 3. Once a dataset is opened with file open menu or created on the fly in step 2 above, go under DOE -> create design menu to create an appropriate design",
		lbl4 : " 4. After a design is successfully created, it will show up on the dataset UI grid. You can use DOE -> Inspect Design menu to inspect the design just created",
		lbl5 : " 5. Let's export the design to a file system directory with DOE -> Export Design menu. It will automatically create three files (.csv, .rda, .html) with the same names as the design dataset on the UI grid in the file directory path specified",
        lbl6 : " 6. The csv file exported out in step 5 is meant to be used to set up the experiments in the real world as specified in the design to collect/record results for later analysis",
        lbl7 : " 7. The results are recorded and added as separate column(s) called responses in the DoE vocabulary into the csv file. Do not change the csv file extension to any other file format. See the sample dataset directory for DoE, examples of csv files tagged as withresp to get the values for the result/response columns to copy from to create response columns in your own csv file that was exported as part of design export in step 5 above",
        lbl8 : " 8. Let's import the csv design file with response column(s) added back to BlueSky Statistic app with DOE -> Import Design Response menu",
		lbl9 : " 9. To import the design csv file in step 8, the original design (that was exported) needs to be available in the dataset UI grid. If it is not available, use the file open menu to load the design .rda file that was created as part of the design export in step 5",
       lbl10 : "10. After the csv file is successfully imported against the right/active design dataset and created a new design with the response column(s), you can use DOE -> Inspect Design menu to inspect the design with response column(s)",
	   lbl11 : "11. Now the design with response column(s) is ready for analysis with DOE -> Analyze Design menu with various analysis methods e.g. Linear model, Response Surface model, etc",
    }
}


class doeOverview extends baseModal {
    constructor() {
        var config = {
            id: "doeOverview",
            label: localization.en.title,
            modalType: "one",
        }
        var objects = {
			lbl1: { 
				el: new labelVar(config, { 
					label: localization.en.lbl1, 
					style: "mt-3", 
					h:6 
				}) 
			},
			lbl2: { 
				el: new labelVar(config, { 
					label: localization.en.lbl2, 
					style: "mt-3", 
					h:6 
				}) 
			},
			lbl3: { 
				el: new labelVar(config, { 
					label: localization.en.lbl3, 
					style: "mt-3", 
					h:6 
				}) 
			},
			lbl4: { 
				el: new labelVar(config, { 
					label: localization.en.lbl4, 
					style: "mt-3", 
					h:6 
				}) 
			},
			lbl5: { 
				el: new labelVar(config, { 
					label: localization.en.lbl5, 
					style: "mt-3", 
					h:6 
				}) 
			},
			lbl6: { 
				el: new labelVar(config, { 
					label: localization.en.lbl6, 
					style: "mt-3", 
					h:6 
				}) 
			},
			lbl7: { 
				el: new labelVar(config, { 
					label: localization.en.lbl7, 
					style: "mt-3", 
					h:6 
				}) 
			},
			lbl8: { 
				el: new labelVar(config, { 
					label: localization.en.lbl8, 
					style: "mt-3", 
					h:6 
				}) 
			},
			lbl9: { 
				el: new labelVar(config, { 
					label: localization.en.lbl9, 
					style: "mt-3", 
					h:6 
				}) 
			},
			lbl10: { 
				el: new labelVar(config, { 
					label: localization.en.lbl10, 
					style: "mt-3", 
					h:6 
				}) 
			},
			lbl11: { 
				el: new labelVar(config, { 
					label: localization.en.lbl11, 
					style: "mt-3", 
					h:6 
				}) 
			},
        }  
        const content = {
            items: [
				objects.lbl1.el.content,
				objects.lbl2.el.content,
				objects.lbl3.el.content,
				objects.lbl4.el.content,
				objects.lbl5.el.content,
				objects.lbl6.el.content,
				objects.lbl7.el.content,
				objects.lbl8.el.content,
				objects.lbl9.el.content,
				objects.lbl10.el.content,
				objects.lbl11.el.content
				],
            nav: {
                name: localization.en.navigation,
                icon: "icon-doe",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
    }
}
module.exports.item = new doeOverview().render()