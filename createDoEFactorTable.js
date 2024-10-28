

/*createDoEgrid*/
class createDoEFactorTable extends baseModal {
    static dialogId = 'createDoEFactorTable'
    static t = baseModal.makeT(createDoEFactorTable.dialogId)

    constructor() {
        var config = {
            id: createDoEFactorTable.dialogId,
            label: createDoEFactorTable.t('title'),
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
                    label: createDoEFactorTable.t('datasetname'),
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
                    label: createDoEFactorTable.t('numOfVars'),
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
                    label: createDoEFactorTable.t('numOfFactorLevels'),
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
                    label: createDoEFactorTable.t('factorLevels'),
                    //required: true,
                    placeholder: "-1,1",
                    extraction: "TextAsIs",
                    allow_spaces:true,
                    value: "-1,1"
                })
            },
            chkbxAutofill: { 
				el: new checkbox(config, { 
					label: createDoEFactorTable.t('autoFillChkbx'), 
					no: "chkbxAutofill", 
					state:"checked", 
					extraction: "Boolean", 
					newline: true,
					style: "mb-5",
				}) 
			},
			label1: { 
				el: new labelVar(config, { 
					label: createDoEFactorTable.t('label1'), 
					style: "mt-2", 
					h: 6,
				}) 
			},
            
			convertFactorToCharInt: { 
				el: new checkbox(config, { 
					label: createDoEFactorTable.t('convertFactorToCharInt'), 
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
                name: createDoEFactorTable.t('navigation'),
                icon: "icon-doe",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
		
        this.help = {
            title: createDoEFactorTable.t('help.title'),
            r_help: "help(data,package='utils')",
            body: createDoEFactorTable.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new createDoEFactorTable().render()
}
