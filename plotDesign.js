
var localization = {
    en: {
        title: "Plot Design (General)",
        navigation: "Plot Design (General)",
        subsetvars: "Select variables",
        help: {
            "title": "Plot Design",
            "body": "..."
          }
    }
}
class plotDesign extends baseModal {
    constructor() {
        var config = {
            id: "plotDesign",
            label: localization.en.title,
            modalType: "two",
            RCode: `
            temp <-  {{dataset.name}}  
            response.names(temp) <- NULL 
            plot(temp, select = c({{selected.subsetvars | safe}}))
            rm(temp)
            `
        }
        var objects = {
            content_var: { el: new srcVariableList(config, {action: "move"}) },
            subsetvars: {
                el: new dstVariableList(config, {
                    label: localization.en.subsetvars,
                    no: "subsetvars",
                    filter: "String|Numeric|Date|Logical|Ordinal|Nominal|Scale",
                    extraction: "NoPrefix|UseComma|Enclosed",
                    required: true
                }), r: ['{{ var | safe}}']
            },
        }
        const content = {
            left: [objects.content_var.el.content],
            right: [objects.subsetvars.el.content],
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
module.exports.item = new plotDesign().render()