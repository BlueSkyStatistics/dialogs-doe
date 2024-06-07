var localization = {
    en: {
        title: "Auto generate factor (equal size) details for a DoE study",
        navigation: "Factor Details (equal size)",
        datasetname: "Factor detail table name",
        numOfVars: "Number of factors",
        numOfFactorLevels: "Maximum number of levels among factors",
        factorLevels: "Level values separated by a comma - example: -1, 1, 'string1', 2, 0",
        autoFillChkbx:"Auto fill levels",
		label1: "Ignore the following option - dataset clean up option for later use",
		convertFactorToCharInt:"For the active dataset selected - convert all columns of factor type to character or integer (and when this option is selected, all the above options on this UI will be ignored)",
		
		help: {
            title: "Auto generate factor details",
            //r_help: "help(t.test, package=stats)",
			body: `
				<b>Description</b></br>
				Automatically generates a table with factor details based on the parameter specified - number of factors and the maximum levels for the factors along with the default values for the factor to be used. If non numeric values are used for factor, specify within single quote for example 1,-1,'name1',0,'string2'
				<br/>
				<br/>
				Once the factor details are automatically generated and the factor table shows up on the data grid UI, you can change the values and/or remove some values from the grid to manipulate the table as you choose including factors with different number of values 
				<br/>
				<br/>
				If the number of factors are <= 26, the factors are named with upper case alphabets as A, B, C, .., otherwise, named as F1, F2, ..., F27, F28, ..
			`
		},
    }
}


class createDoEgrid extends baseModal {
    constructor() {
        var config = {
            id: "createDoEgrid",
            label: localization.en.title,
            modalType: "one",
            RCode: `
				require(FrF2)
				
				if({{selected.convertFactorToCharInt | safe}})
				{	
					{{dataset.name}}[] = lapply({{dataset.name}}, function(x) type.convert(as.character(x), as.is = TRUE))
			
					BSkyLoadRefresh('{{dataset.name}}')

				}else{
					{{selected.datasetname | safe}} = BSkyDOESetupFactorDataGrid(num_factors = {{selected.numOfVars | safe}}, num_factor_levels = {{selected.numOfFactorLevels | safe}}, factor_levels = c({{selected.factorLevels | safe}}), autofil_levels = {{selected.chkbxAutofill | safe}})                
				
					if({{selected.numOfVars | safe}} <= 26)
					{
						names({{selected.datasetname | safe}}) = Letters[1:{{selected.numOfVars | safe}}]
					}
							
					BSkyLoadRefresh('{{selected.datasetname | safe}}')
				}

                `
        }
        var objects = {
            datasetname: {
                el: new input(config, {
                    no: 'datasetname',
                    label: localization.en.datasetname,
                    placeholder: "",
                    //required: true,
                    extraction: "TextAsIs",
                    overwrite: "dataset",
                    value: "DoEfactorTable"
                })
            },
            numOfVars: {
                el: new input(config, {
                    no: 'numOfVars',
                    label: localization.en.numOfVars,
                    //required: true,
                    placeholder: "5",
                    allow_spaces:true,
                    type : "numeric",
                    extraction: "TextAsIs",
                    value: "5"
                })
            },       
            numOfFactorLevels: {
                el: new input(config, {
                    no: 'numOfFactorLevels',
                    label: localization.en.numOfFactorLevels,
                    //required: true,
                    placeholder: "2",
                    allow_spaces:true,
                    type : "numeric",
                    extraction: "TextAsIs",
                    value: "2"
                })
            },                 
            factorLevels: {
                el: new input(config, {
                    no: 'factorLevels',
                    label: localization.en.factorLevels,
                    //required: true,
                    placeholder: "-1,1",
                    extraction: "TextAsIs",
                    allow_spaces:true,
                    value: "-1,1"
                })
            },
            chkbxAutofill: { 
				el: new checkbox(config, { 
					label: localization.en.autoFillChkbx, 
					no: "chkbxAutofill", 
					state:"checked", 
					extraction: "Boolean", 
					newline: true,
					style: "mb-5",
				}) 
			},
			label1: { 
				el: new labelVar(config, { 
					label: localization.en.label1, 
					style: "mt-2", 
					h: 6,
				}) 
			},
            
			convertFactorToCharInt: { 
				el: new checkbox(config, { 
					label: localization.en.convertFactorToCharInt, 
					no: "convertFactorToCharInt", 
					//state:"checked", 
					extraction: "Boolean", 
					newline: true,
				}) 
			},
	   }
        const content = {
            items: [objects.datasetname.el.content,  objects.numOfVars.el.content,  
                objects.numOfFactorLevels.el.content, objects.factorLevels.el.content, 
                objects.chkbxAutofill.el.content,
				objects.label1.el.content,
				objects.convertFactorToCharInt.el.content],
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
module.exports.item = new createDoEgrid().render()