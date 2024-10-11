


class doeOverview extends baseModal {
    static dialogId = 'doeOverview'
    static t = baseModal.makeT(doeOverview.dialogId)

    constructor() {
        var config = {
            id: doeOverview.dialogId,
            label: doeOverview.t('title'),
            modalType: "one",
        }
        var objects = {
			lbl1: { 
				el: new labelVar(config, { 
					label: doeOverview.t('lbl1'), 
					style: "mt-3", 
					h:6 
				}) 
			},
			lbl2: { 
				el: new labelVar(config, { 
					label: doeOverview.t('lbl2'), 
					style: "mt-3", 
					h:6 
				}) 
			},
			lbl3: { 
				el: new labelVar(config, { 
					label: doeOverview.t('lbl3'), 
					style: "mt-3", 
					h:6 
				}) 
			},
			lbl4: { 
				el: new labelVar(config, { 
					label: doeOverview.t('lbl4'), 
					style: "mt-3", 
					h:6 
				}) 
			},
			lbl5: { 
				el: new labelVar(config, { 
					label: doeOverview.t('lbl5'), 
					style: "mt-3", 
					h:6 
				}) 
			},
			lbl6: { 
				el: new labelVar(config, { 
					label: doeOverview.t('lbl6'), 
					style: "mt-3", 
					h:6 
				}) 
			},
			lbl7: { 
				el: new labelVar(config, { 
					label: doeOverview.t('lbl7'), 
					style: "mt-3", 
					h:6 
				}) 
			},
			lbl8: { 
				el: new labelVar(config, { 
					label: doeOverview.t('lbl8'), 
					style: "mt-3", 
					h:6 
				}) 
			},
			lbl9: { 
				el: new labelVar(config, { 
					label: doeOverview.t('lbl9'), 
					style: "mt-3", 
					h:6 
				}) 
			},
			lbl10: { 
				el: new labelVar(config, { 
					label: doeOverview.t('lbl10'), 
					style: "mt-3", 
					h:6 
				}) 
			},
			lbl11: { 
				el: new labelVar(config, { 
					label: doeOverview.t('lbl11'), 
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
                name: doeOverview.t('navigation'),
                icon: "icon-doe",
                datasetRequired: false,
                modal: config.id
            }
        }
        super(config, objects, content);
    }
}

module.exports = {
    render: () => new doeOverview().render()
}
