


class RSMFormula extends baseModal {
    static dialogId = 'RSMFormula'
    static t = baseModal.makeT(RSMFormula.dialogId)

    constructor() {
        var config = {
            id: RSMFormula.dialogId,
            label: RSMFormula.t('title'),
            modalType: "two",
            RCode: `
#require(FrF2)
#require(DoE.base)
#require(conf.design)
#require(gridBase)
require(rsm)
#require(rgl)

#Creating the model
#BSkyFormat("{{selected.modelname | safe}} = rsm::rsm({{selected.dependent | safe}}~{{selected.formula | safe}}, na.action=na.exclude, data={{dataset.name}})")
{{selected.modelname | safe}} = rsm::rsm({{selected.dependent | safe}}~{{selected.formula | safe}}, na.action=na.exclude, data={{dataset.name}})

#Display model summary and coefficients
#BSkyFormat("Display model summary")
convert_lm_type = {{selected.modelname | safe}}; 
class(convert_lm_type) = "lm"
BSkyFormat(convert_lm_type)

BSky_RSM_Summary_{{selected.modelname | safe}} = summary({{selected.modelname | safe}})

#Analysis of Variance Table Response: {{selected.dependent | safe}};
BSkyFormat(BSky_RSM_Summary_{{selected.modelname | safe}}\$lof, outputTableRenames = c("Analysis of Variance - Response: {{selected.dependent | safe}}"))

#Stationary point of response surface
BSkyFormat(BSky_RSM_Summary_{{selected.modelname | safe}}\$canonical$xs, outputTableRenames = c("Stationary point of response surface"))

#Eigenanalysis: eigen() decomposition
BSkyFormat("Eigen analysis: eigen() decomposition")
BSkyFormat(BSky_RSM_Summary_{{selected.modelname | safe}}\$canonical, outputTableIndex = c(2,3), outputTableRenames =c("Eigen Values", "Eigen Vectors"))

#Display Contour(Plots)
BSkyFormat("Display Contour(Plots)")
#par(mfrow=c(2,3))
par(mfrow=c(1,1))
if({{selected.generateContourPlotChk | safe}}) graphics::contour({{selected.modelname | safe}}, ~{{selected.independent | safe}}, image=TRUE, at=summary({{selected.modelname | safe}}\$canonical$xs))

#Display the Response Surface (Plots)
BSkyFormat("Display the Response Surface (Plots)")
par(mfrow=c(1,1))
if({{selected.generateRSMPlotChk | safe}}) suppressWarnings(graphics::persp({{selected.modelname | safe}}, ~{{selected.independent | safe}}, image = TRUE,at = c(summary({{selected.modelname | safe}}\$canonical$xs), Block="B2"),theta=30,zlab="{{selected.dependent | safe}} in MPa",col.lab=33,contour="colors"))

#Show Path of steepest ascent from ridge analysis
#BSkyFormat("Show Path of steepest ascent from ridge analysis")
if({{selected.generatePathSteepestAscentChk | safe}}) BSkyFormat(rsm::steepest({{selected.modelname | safe}}), outputTableRenames =c("Path of steepest ascent from ridge analysis"))

#Show Shapiro Normlity Test
#BSkyFormat("Show Shapiro Normlity Test")
if({{selected.checkShapiroNormalityTestChk | safe}}) BSkyFormat(stats::shapiro.test({{dataset.name}}\${{selected.dependent | safe}}),outputTableIndex = c(tableone=1),outputColumnIndex = c(tableone=c(1,2)),outputColumnRenames = c(tableone=c("Normality check for {{selected.dependent | safe}}","Normality check for {{selected.dependent | safe}}")))

#Plots for checking normality
BSkyFormat("Plots for checking normality - residuals({{selected.modelname | safe}})")
if({{selected.normalityPlotsChk | safe}}) {stats::qqnorm(residuals({{selected.modelname | safe}})); qqline(residuals({{selected.modelname | safe}}))}

`
        };
        var objects = {
            content_var: { el: new srcVariableList(config, {action: "copy", scroll:true}) },
            modelname: {
                el: new input(config, {
                    no: 'modelname',
                    label: RSMFormula.t('modelname'),
                    placeholder: "",
                    required: true,
                    type: "character",
                    extraction: "TextAsIs",
                    value: "ResponseSurfaceModel1",
                    overwrite: "dataset"
                })
            },
            dependent: {
                el: new dstVariable(config, {
                    label: RSMFormula.t('dependent'),
                    no: "dependent",
                    filter: "Numeric|Scale",
                    extraction: "NoPrefix|UseComma",
                    required: true,
                }), r: ['{{ var | safe}}']
            },
            formulaBuilder: {
                el: new formulaBuilder(config, {
                    no: "formula",
					filter: "Numeric|Scale",
					style: "mt-2 mb-3",
                    required:true,
                })
            },
			formulaboxhint: { 
				el: new labelVar(config, { 
					label: RSMFormula.t('formulaboxhint'), 
					style: "ml-5 mb-3", 
					h: 6,
				}) 
			},
			independent: {
                el: new dstVariableList(config, {
                    label: RSMFormula.t('independent'),
                    no: "independent",
                    required: true,
                    //filter: "String|Numeric|Logical|Ordinal|Nominal|Scale",
					filter: "Numeric|Scale",
                    extraction: "NoPrefix|UsePlus",
					style: "mt-3 mb-1",
                }), r: ['{{ var | safe}}']
            },            
            generateContourPlotChk: {
                el: new checkbox(config, {
                    label: RSMFormula.t('generateContourPlotChk'), 
					no: "generateContourPlotChk",
                    bs_type: "valuebox",
                    style: "mt-2 mb-3",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
			generateRSMPlotChk: {
                el: new checkbox(config, {
                    label: RSMFormula.t('generateRSMPlotChk'), 
					no: "generateRSMPlotChk",
                    bs_type: "valuebox",
                    style: "mt-2 mb-3",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
			generatePathSteepestAscentChk: {
                el: new checkbox(config, {
                    label: RSMFormula.t('generatePathSteepestAscentChk'), 
					no: "generatePathSteepestAscentChk",
                    bs_type: "valuebox",
                    style: "mt-2 mb-3",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
			checkShapiroNormalityTestChk: {
                el: new checkbox(config, {
                    label: RSMFormula.t('checkShapiroNormalityTestChk'), 
					no: "checkShapiroNormalityTestChk",
                    bs_type: "valuebox",
                    style: "mt-2 mb-3",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
			normalityPlotsChk: {
                el: new checkbox(config, {
                    label: RSMFormula.t('normalityPlotsChk'), 
					no: "normalityPlotsChk",
                    bs_type: "valuebox",
                    style: "mt-2 mb-3",
                    extraction: "BooleanValue",
                    true_value: "TRUE",
                    false_value: "FALSE",
					newline: true,
                })
            },
        };
        const content = {
            left: [objects.content_var.el.content],
            right: [objects.modelname.el.content, 
					objects.dependent.el.content, 
					objects.formulaBuilder.el.content, 
                    objects.formulaboxhint.el.content,
					objects.independent.el.content, 
					objects.generateContourPlotChk.el.content,
					objects.generateRSMPlotChk.el.content, 
					objects.generatePathSteepestAscentChk.el.content, 
					objects.checkShapiroNormalityTestChk.el.content, 
					objects.normalityPlotsChk.el.content],
            nav: {
                name: RSMFormula.t('navigation'),
                icon: "icon-doe",
                modal: config.id
            }
        };
        super(config, objects, content);
        
        this.help = {
            title: RSMFormula.t('help.title'),
            r_help: RSMFormula.t('help.r_help'),  //r_help: "help(data,package='utils')",
            body: RSMFormula.t('help.body')
        }
;
    }
}

module.exports = {
    render: () => new RSMFormula().render()
}
