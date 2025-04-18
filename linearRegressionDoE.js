/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */





class linearRegressionDoE extends baseModal {
    static dialogId = 'linearRegressionDoE'
    static t = baseModal.makeT(linearRegressionDoE.dialogId)

    constructor() {
        var config = {
            id: linearRegressionDoE.dialogId,
            label: linearRegressionDoE.t('title'),
            modalType: "two",
            RCode: `

#myfrf2$response = InjectionMoldingFrF2Design_withresp$Measurements

require(equatiomatic)
require(textutils)
require(effects)
require(DoE.base)
require(FrF2)
#require(BsMD)

#Creating the model
{{if (options.selected.degree =="")}} {{if (options.selected.nointercept =="TRUE")}}{{selected.modelname | safe}} = stats::lm({{selected.dependent | safe}}~0+{{selected.independent | safe}},{{ if (options.selected.weights != "")}}weights ={{selected.weights | safe}},{{/if}} na.action=na.exclude, data={{dataset.name}})\n{{#else}}{{selected.modelname | safe}} = lm({{selected.dependent | safe}}~{{selected.independent | safe}}, {{ if (options.selected.weights != "")}}weights ={{selected.weights | safe}},{{/if}} na.action=na.exclude, data={{dataset.name}})\n{{/if}} {{/if}}
{{if (options.selected.degree !="")}} {{if (options.selected.nointercept =="TRUE")}}{{selected.modelname | safe}} = stats::lm({{selected.dependent | safe}}~0+({{selected.independent | safe}})^{{selected.degree | safe}}, {{ if (options.selected.weights != "")}}weights ={{selected.weights | safe}},{{/if}} na.action=na.exclude, data={{dataset.name}})\n{{#else}}{{selected.modelname | safe}} = lm({{selected.dependent | safe}}~({{selected.independent | safe}})^{{selected.degree | safe}}, {{ if (options.selected.weights != "")}}weights ={{selected.weights | safe}},{{/if}} na.action=na.exclude, data={{dataset.name}})\n{{/if}} {{/if}}

##local ({

#Display theoretical model equation and coefficients

#Display theoretical model
reg_formula = equatiomatic::extract_eq({{selected.modelname | safe}}, raw_tex = FALSE,\n\t wrap = TRUE, intercept = "alpha", ital_vars = FALSE) 
BSkyFormat(reg_formula)

#Display coefficients
reg_equation = equatiomatic::extract_eq({{selected.modelname | safe}}, use_coefs = TRUE,\n\t wrap = TRUE,  ital_vars = FALSE, coef_digits = BSkyGetDecimalDigitSetting() )
BSkyFormat(reg_equation)

#Summarizing the model
BSky_LM_Summary_{{selected.modelname | safe}} = summary({{selected.modelname | safe}})
BSkyFormat(BSky_LM_Summary_{{selected.modelname | safe}}, singleTableOutputHeader = "Model Summary")

#Displaying the Anova table
AnovaRes = stats::anova({{selected.modelname | safe}} )
BSkyFormat(as.data.frame(AnovaRes), singleTableOutputHeader = "Anova table")

#Displaying sum of squares table
df = as.data.frame(AnovaRes)
totalrows = nrow(df)
regSumOfSquares = sum(df[1:totalrows - 1, 3])
residualSumOfSquares = df[totalrows, 3]
totalSumOfSquares = regSumOfSquares + residualSumOfSquares
matSumOfSquares = matrix(c(regSumOfSquares, residualSumOfSquares, 
        totalSumOfSquares), nrow = 3, ncol = 1, dimnames = list(c("Sum of squares of regression", 
        "Sum of squares of residuals", "Total sum of squares"), 
        c("Values")))
BSkyFormat(matSumOfSquares, singleTableOutputHeader = "Sum of squares table")

#remove(BSky_LM_Summary_{{selected.modelname | safe}})
#remove({{selected.modelname | safe}})

{{if (options.selected.effectsplot == "TRUE" && options.selected.degree =="")}}
BSkyFormat("Ploting All Effects for the Model")
plot(effects::allEffects({{selected.modelname | safe}}))
{{/if}}

{{if (options.selected.generateplotchk == "TRUE" && options.selected.degree =="")}}#displaying plots\n#Plots residuals vs. fitted, normal Q-Q, scale-location, residuals vs. leverage\nplot({{selected.modelname | safe}}){{/if}}


#if({{selected.twoLevelDesignTypeChk | safe}})
#{
	# The following plots and analysis is only valid for 2-level Factor Design - e.g. pb, FrF2, etc design type
	
	if({{selected.AliasChk | safe}} && {{selected.twoLevelDesignTypeChk | safe}}){BSkyFormat("Check for Aliases"); FrF2::aliases({{selected.modelname | safe}}, code={{selected.AliasCodedChk | safe}})}
	
	if({{selected.DanielplotChk | safe}} && {{selected.twoLevelDesignTypeChk | safe}}) {BSkyFormat("Daniel Plot (plot of effects)"); FrF2::DanielPlot({{selected.modelname | safe}}, code={{selected.DanielplotCodeChk | safe}}, alpha={{selected.DanielplotAlpha}}, half={{selected.DanielplotHalfChk | safe}})}

	if({{selected.MEPlotChk | safe}} && {{selected.twoLevelDesignTypeChk | safe}}) 
	{
		BSkyFormat("MEPlot(main effects plots)"); 
		mainEffectsMatrixfromMEPlot = FrF2::MEPlot({{selected.modelname | safe}})
		BSkyFormat(mainEffectsMatrixfromMEPlot, outputTableRenames = "Main Effects Matrix Generated from MEPlot()")
	}

	if({{selected.IAPlotChk | safe}} && length(c({{selected.degree}})) > 0 && {{selected.twoLevelDesignTypeChk | safe}}) 
	{ 	BSkyFormat("IAPlot(interaction plots)")
		interactionMatrixfromIAPlot = FrF2::IAPlot({{selected.modelname | safe}}, show.alias = {{selected.IAPlotShowAliasChk | safe}})
		BSkyFormat(interactionMatrixfromIAPlot, outputTableRenames = "Interaction Matrix Generated from IAPlot()")
	}
		
	#{{selected.dependent | safe}} = {{dataset.name}}[,which(names({{dataset.name}}) == '{{selected.dependent | safe}}')]
	#if({{selected.cubePlotChk | safe}}) {BSkyFormat("Cube plot of three factor interactions"); FrF2::cubePlot({{selected.dependent | safe}}, {{selected.cubePlotIndependent | safe}}, round = BSkyGetDecimalDigitSetting())}
	if({{selected.cubePlotChk | safe}} && {{selected.twoLevelDesignTypeChk | safe}}) 
	{
		if({{selected.cubePlotModelMeanChk | safe}})
		{
			BSkyFormat("Cube plot of three factor interactions with and without modeled means") 
			FrF2::cubePlot({{selected.modelname | safe}}, {{selected.cubePlotIndependent | safe}}, round = BSkyGetDecimalDigitSetting())
			FrF2::cubePlot({{selected.modelname | safe}}, {{selected.cubePlotIndependent | safe}}, modeled = FALSE, round = BSkyGetDecimalDigitSetting() )
		}
		else
		{
			BSkyFormat("Cube plot of three factor interactions with modeled means") 
			FrF2::cubePlot({{selected.modelname | safe}}, {{selected.cubePlotIndependent | safe}}, round = BSkyGetDecimalDigitSetting())
		}
	}
#}

#Adding attributes to support scoring
#We don't add dependent and independent variables as this is handled by our functions
attr(.GlobalEnv\${{selected.modelname | safe}},"classDepVar")= class({{dataset.name}}[, c("{{selected.dependent | safe}}")])
attr(.GlobalEnv\${{selected.modelname | safe}},"depVarSample")= sample({{dataset.name}}[, c("{{selected.dependent | safe}}")], size = 2, replace = TRUE)

##})

`
        }
        var objects = {
            content_var: { el: new srcVariableList(config, {action: "copy", scroll:true}) },
            modelname: {
                el: new input(config, {
                    no: 'modelname',
                    label: linearRegressionDoE.t('modelname'),
                    placeholder: "",
                    required: true,
                    type: "character",
                    extraction: "TextAsIs",
                    value: "LinearRegModel1",
                    overwrite: "dataset"
                })
            },
            dependent: {
                el: new dstVariable(config, {
                    label: linearRegressionDoE.t('dependent'),
                    no: "dependent",
                    filter: "Numeric|Scale",
                    extraction: "NoPrefix|UseComma",
                    required: true,
                }), r: ['{{ var | safe}}']
            },
            independent: {
                el: new dstVariableList(config, {
                    label: linearRegressionDoE.t('independent'),
                    no: "independent",
                    required: true,
                    filter: "String|Numeric|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UsePlus",
                }), r: ['{{ var | safe}}']
            },
            degree: {
                el: new input(config, {
                    no: 'degree',
                    label: linearRegressionDoE.t('degree'),
                    placeholder: "",
                    allow_spaces:true,
                    type: "numeric",
                    extraction: "TextAsIs",
                    value: "",
					style: "mb-1",
					width: "w-25",
                })
            },            
            nointercept: {
                el: new checkbox(config, {
                    label: linearRegressionDoE.t('nointercept'),
                    no: "nointercept",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
			effectsplot: {
                el: new checkbox(config, {
                    label: linearRegressionDoE.t('effectsplot'),
                    no: "effectsplot",
                    style: "mt-2 mb-1",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },     		
			generateplotchk: {
                el: new checkbox(config, {
                    label: linearRegressionDoE.t('generateplotchk'),
                    no: "generateplotchk",
                    style: "mt-2 mb-3",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
			weights: {
                el: new dstVariable(config, {
                    label: linearRegressionDoE.t('weights'),
                    no: "weights",
                    filter: "String|Numeric|Date|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UseComma",
                }), r: ['{{ var | safe}}']
            },
			twoLevelDesignTypeChk: {
                el: new checkbox(config, {
                    label: linearRegressionDoE.t('twoLevelDesignTypeChk'),
                    no: "twoLevelDesignTypeChk",
                    style: "mt-2",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },  
			AliasChk: {
                el: new checkbox(config, {
                    label: linearRegressionDoE.t('AliasChk'),
                    no: "AliasChk",
                    style: "ml-4 mt-2",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },  
			AliasCodedChk: {
                el: new checkbox(config, {
                    label: linearRegressionDoE.t('AliasCodedChk'),
                    no: "AliasCodedChk",
                    style: "ml-5 mb-2",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },       
			DanielplotChk: {
                el: new checkbox(config, {
                    label: linearRegressionDoE.t('DanielplotChk'),
                    no: "DanielplotChk",
                    style: "ml-4 mt-2",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },  
			DanielplotCodeChk: {
                el: new checkbox(config, {
                    label: linearRegressionDoE.t('DanielplotCodeChk'),
                    no: "DanielplotCodeChk",
                    style: "ml-5",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },    
			DanielplotHalfChk: {
                el: new checkbox(config, {
                    label: linearRegressionDoE.t('DanielplotHalfChk'),
                    no: "DanielplotHalfChk",
                    style: "ml-5",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },  
			DanielplotAlpha: {
                el: new input(config, {
                    no: 'DanielplotAlpha',
                    label: linearRegressionDoE.t('DanielplotAlpha'),
                    placeholder: "",
                    allow_spaces:true,
                    type: "numeric",
                    extraction: "TextAsIs",
                    value: "0.5",
					style: "ml-5 mb-2",
					width: "w-25",
					newline: true,
                })
            },     
			MEPlotChk: {
                el: new checkbox(config, {
                    label: linearRegressionDoE.t('MEPlotChk'),
                    no: "MEPlotChk",
                    style: "ml-4 mb-2",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },  
			IAPlotChk: {
                el: new checkbox(config, {
                    label: linearRegressionDoE.t('IAPlotChk'),
                    no: "IAPlotChk",
                    style: "ml-4 mt-2",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },  
			IAPlotShowAliasChk: {
                el: new checkbox(config, {
                    label: linearRegressionDoE.t('IAPlotShowAliasChk'),
                    no: "IAPlotShowAliasChk",
                    style: "ml-5 mb-2",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },  
			cubePlotChk: {
                el: new checkbox(config, {
                    label: linearRegressionDoE.t('cubePlotChk'),
                    no: "cubePlotChk",
                    style: "ml-4 mt-2 mb-1",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            }, 
			cubePlotModelMeanChk: {
                el: new checkbox(config, {
                    label: linearRegressionDoE.t('cubePlotModelMeanChk'),
                    no: "cubePlotModelMeanChk",
                    style: "ml-5 mb-1",
                    bs_type: "valuebox",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					//state: "checked",
					newline: true,
                })
            }, 
			cubePlotIndependent: {
                el: new dstVariableList(config, {
                    label: linearRegressionDoE.t('cubePlotIndependent'),
                    no: "cubePlotIndependent",
                    required: false,
                    filter: "String|Numeric|Logical|Ordinal|Nominal|Scale",
                    extraction: "Enclosed|UseComma",
					items_count : 3,
					style: "mb-3",
                }), r: ['{{ var | safe}}']
            },
        };
        const content = {
            left: [objects.content_var.el.content],
            right: [objects.modelname.el.content, objects.dependent.el.content, objects.independent.el.content, 
			
                objects.degree.el.content,
				
                objects.nointercept.el.content, 
				
				objects.effectsplot.el.content, 
				
				objects.generateplotchk.el.content,
				
				objects.weights.el.content,
				
				objects.twoLevelDesignTypeChk.el.content,
				
				objects.AliasChk.el.content,
				objects.AliasCodedChk.el.content,
				
				objects.DanielplotChk.el.content,
				objects.DanielplotCodeChk.el.content,
				objects.DanielplotHalfChk.el.content,
				objects.DanielplotAlpha.el.content,
				
				objects.MEPlotChk.el.content,
				
				objects.IAPlotChk.el.content,
				objects.IAPlotShowAliasChk.el.content,
				
				objects.cubePlotChk.el.content,
				objects.cubePlotModelMeanChk.el.content,
				objects.cubePlotIndependent.el.content],
		
            nav: {
                name: linearRegressionDoE.t('navigation'),
                icon: "icon-doe",
                modal: config.id
            }
        };
        super(config, objects, content);
        
        this.help = {
            title: linearRegressionDoE.t('help.title'),
            r_help: linearRegressionDoE.t('help.r_help'), //Fix by Anil //r_help: "help(data,package='utils')",
            body: linearRegressionDoE.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new linearRegressionDoE().render()
}
