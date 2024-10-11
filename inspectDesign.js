


class inspectDesign extends baseModal {
    static dialogId = 'inspectDesign'
    static t = baseModal.makeT(inspectDesign.dialogId)

    constructor() {
        var config = {
            id: inspectDesign.dialogId,
            label: inspectDesign.t('title'),
            modalType: "one",
            RCode: `
				
				require(DoE.base)
				
				if(c("design") %in% class({{dataset.name}}))
				{
					if({{selected.responseVariablesChk}})
					{
						BSkyFormat(paste("Design Type:", attributes({{dataset.name}})$design.info$type,"and Number of Runs:", attributes({{dataset.name}})$design.info$nruns))
						BSkyFormat(paste("Response variable(s):", paste(response.names({{dataset.name}}), collapse=", ")))
					}
					
					if({{selected.printDesign | safe}})
					{
						no_list_elements <- sapply(attributes({{dataset.name}})$design.info$factor.names, length)
						seq.max <- seq_len(max(no_list_elements))
						factor_matrix <- sapply(attributes({{dataset.name}})$design.info$factor.names, "[", i = seq.max)
						factor_matrix[is.na(factor_matrix)] = c(" ")

						#BSkyFormat(as.data.frame(attributes({{dataset.name}})$design.info$factor.names), outputTableRenames = "Factors Used to Create the Design")
						BSkyFormat(factor_matrix, outputTableRenames = "Factors Used to Create the Design")
						
						if({{selected.printDesignWithRunOrderChk | safe}})
						{
							combinedDesignFrame = cbind(run.order({{dataset.name}})[,c(2,1,3)], as.data.frame( {{dataset.name}} ))
							row.names(combinedDesignFrame) = c()
						}
						else
						{
							combinedDesignFrame = as.data.frame( {{dataset.name}} )
						}
								
						BSkyFormat(combinedDesignFrame, outputTableRenames = paste("Design Type:", attributes({{dataset.name}})$design.info$type,"and Number of Runs:", attributes({{dataset.name}})$design.info$nruns))
					}
					
					if({{selected.summarizeBrief | safe}})
					{
						summary( {{dataset.name}} , brief = TRUE)
					}

					if({{selected.summarizeDetails | safe}})
					{
						summary( {{dataset.name}} , brief = FALSE)
					}

					if({{selected.designinfo | safe}})
					{
						DoE.base::design.info( {{dataset.name}} )  
					}  
				} else
				{
					BSkyFormat("Not a design class - The requested operation cannot be performed")
				}

                `
        }
        var objects = {
			
			responseVariablesChk: { el: new checkbox(config, 
			{ 
				label: inspectDesign.t('responseVariablesChk'), 
				no: "responseVariablesChk", 
				//state:"checked", 
				extraction: "Boolean", 
				newline: true, 
			}) 
			},
            summarizeBrief: { el: new checkbox(config, { label: inspectDesign.t('summarizeBrief'), no: "summarizeBrief", extraction: "Boolean", newline: true }) },
            summarizeDetails: { el: new checkbox(config, { label: inspectDesign.t('summarizeDetails'), no: "summarizeDetails", extraction: "Boolean", newline: true }) },
            printDesign: { el: new checkbox(config, { label: inspectDesign.t('printDesign'), no: "printDesign", extraction: "Boolean", newline: true }) },
	
			printDesignWithRunOrderChk: {
                el: new checkbox(config, {
                    label: inspectDesign.t('printDesignWithRunOrderChk'),
                    no: "printDesignWithRunOrderChk",
                    style: "ml-5",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
			
			designinfo: { el: new checkbox(config, { label: inspectDesign.t('designinfo'), no: "designinfo", extraction: "Boolean", newline: true }) },
        }
        const content = {
            items: [ 
					 objects.responseVariablesChk.el.content,
					 objects.printDesign.el.content,
					 objects.printDesignWithRunOrderChk.el.content,
					 objects.summarizeBrief.el.content,
                     objects.summarizeDetails.el.content,
                        objects.designinfo.el.content],
            nav: {
                name: inspectDesign.t('navigation'),
                icon: "icon-doe",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
    }
}

module.exports = {
    render: () => new inspectDesign().render()
}
