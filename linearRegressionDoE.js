
var localization = {
    en: {
        title: "Design of Experiments analysis with Linear Model",
        navigation: "Design Analysis - Linear Model",
		
        modelname: "Enter Model Name",
		
        dependent: "Response (dependent) variable",
        independent: "Independent variable(s)",
		nointercept: "Ignore intercept (if checked, then do not check the specific options below for the 2-level Factor Design)",
		degree: "Degree (leave it blank or type 2 for the linear model with main effects and 2-factor interactions)",
		
		effectsplot:"All effects plot (generated only when Degree is not specified)",

        generateplotchk: "Plot residuals vs fitted, normal Q-Q , scale-location and residuals vs leverage",

        weights: "Specify a variable with weights",
		
		twoLevelDesignTypeChk: "The following options are only applicable for a 2-level Factor Design (e.g. pb, FrF2, ..) - also do not check this if Ignore intercept option is checked above",
		
		AliasChk: "Determine aliases",
		AliasCodedChk: "Coded aliases",
		
		DanielplotChk: "Daniel Plot (plot of effects)",
		DanielplotCodeChk: "Coded label",
		DanielplotHalfChk: "Half Normal",
		DanielplotAlpha: "Alpha (significance level for labelling)",
		
		MEPlotChk: "MEPlot(main effects plots)",
		
		IAPlotChk: "IAPlot(interaction plots)",
		IAPlotShowAliasChk: "Show aliases in the plot",
		
		cubePlotChk: "Cube plot of three factor interactions with modeled means",
		cubePlotModelMeanChk: "Plot both modeled means and non-modeled means",
		cubePlotIndependent: "Select three independent variable(s) for the cube plot",
		
        help: {
            title: "Design of Experiments analysis with Linear Model",
            r_help: "help(lm, package = 'stats')",
            body: `
				<b>Description</b></br>
				Builds a linear regression model for the design to analyze the response (i.e. the results recorded/collected from the experiments). Internally calls function lm in stats package. Displays a summary of the model, coefficient table, Anova table and sum of squares table and plots the following  residuals vs. fitted, normal Q-Q, theoretical quantiles, residuals vs. leverage. You can optionally specify a variable with weights and choose to ignore the intercept.
				<br/>
				<br/>
				For more details, see R help for the following
				<br/>
				help(lm, package = stats)
				<br/>
				help(anova, package = stats)
				<br/>
				help(allEffects, package = effects)
				<br/>
				help(aliases , package = FrF2)
				<br/>
				help(DanielPlot, package = FrF2)
				<br/>
				help(MEPlot, package = FrF2)
				<br/>
				help(IAPlot, package = FrF2)
				<br/>
				help(cubePlot, package = FrF2)
				<br/>
				<br/>
				<b>Usage</b>
				<br/>
				<code> 
				LinearRegModel1 <- lm(depVar~indepVars, dataset)​<br/>
				#Summarizing the model<br/>
				summary(LinearRegModel1)<br/>
				#Displaying the Anova table<br/>
				anova(LinearRegModel1)<br/>
				#Plots residuals vs. fitted, normal Q-Q, scale-location, residuals vs. leverage<br/>
				plot(effects::allEffects(LinearRegModel1))<br/>
				plot(LinearRegModel1)<br/>
                </code> <br/>

			`
		}
    }
}


class linearRegressionDoE extends baseModal {
    constructor() {
        var config = {
            id: "linearRegressionDoE",
            label: localization.en.title,
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
                    label: localization.en.modelname,
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
                    label: localization.en.dependent,
                    no: "dependent",
                    filter: "Numeric|Scale",
                    extraction: "NoPrefix|UseComma",
                    required: true,
                }), r: ['{{ var | safe}}']
            },
            independent: {
                el: new dstVariableList(config, {
                    label: localization.en.independent,
                    no: "independent",
                    required: true,
                    filter: "String|Numeric|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UsePlus",
                }), r: ['{{ var | safe}}']
            },
            degree: {
                el: new input(config, {
                    no: 'degree',
                    label: localization.en.degree,
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
                    label: localization.en.nointercept,
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
                    label: localization.en.effectsplot,
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
                    label: localization.en.generateplotchk,
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
                    label: localization.en.weights,
                    no: "weights",
                    filter: "String|Numeric|Date|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UseComma",
                }), r: ['{{ var | safe}}']
            },
			twoLevelDesignTypeChk: {
                el: new checkbox(config, {
                    label: localization.en.twoLevelDesignTypeChk,
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
                    label: localization.en.AliasChk,
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
                    label: localization.en.AliasCodedChk,
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
                    label: localization.en.DanielplotChk,
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
                    label: localization.en.DanielplotCodeChk,
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
                    label: localization.en.DanielplotHalfChk,
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
                    label: localization.en.DanielplotAlpha,
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
                    label: localization.en.MEPlotChk,
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
                    label: localization.en.IAPlotChk,
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
                    label: localization.en.IAPlotShowAliasChk,
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
                    label: localization.en.cubePlotChk,
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
                    label: localization.en.cubePlotModelMeanChk,
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
                    label: localization.en.cubePlotIndependent,
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
                name: localization.en.navigation,
                icon: "icon-doe",
                modal: config.id
            }
        };
        super(config, objects, content);
        this.help = localization.en.help;
    }
}
module.exports.item = new linearRegressionDoE().render()