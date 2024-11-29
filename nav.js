let t = getT('menutoolbar')
const nav = () => ({
    "name": t('doe_top_level_title'),// {ns: 'menutoolbar'}),
    "tab": "DoE",
    "buttons": [
        "./doeoverview",
        {
            "name": t('doe_Create_DoE_Factor_Table'),// {ns: 'menutoolbar'}),
            "icon": "icon-doe",
            "children": [
                "./createDoEgrid",
                "./createDoEgrid2"
            ]
        },
		
        "./importDesign",
        "./exportDesign",

        {
            "name": t('doe_Create_Design'),// {ns: 'menutoolbar'}),
            "icon": "icon-doe",
            "children": [
                "./create2LevelDesign",
                "./createRegularFrF2Design",
                "./createFullFactorialDesign",
                "./createOrthogonalArrayDesign",
                "./createDOptimalDesign",
                "./createCentralCompositeDesign",
                "./createBoxBehnkenDesign",
                "./createLatinHypercubeDesign",
                "./createTaguchiParameterDesign"
            ]
        },
        {
            "name": t('doe_Inspect_Design'),// {ns: 'menutoolbar'}),
            "icon": "icon-doe",
            "children": [
                "./inspectDesign",
                "./plotDesign",
                "./inspectFrF2DesignCatalog",
                "./inspectOADesignCatalog" 
            ]
        },
        {
            "name": t('doe_Modify_Design'),// {ns: 'menutoolbar'}),
            "icon": "icon-doe",
            "children": [
                "./addRemoveResp",
                "./addCenterpoint2LevelDesign"						
            ]
        },
        {
            "name": t('doe_Analyze_Design'),// {ns: 'menutoolbar'}),
            "icon": "icon-doe",
            "children": [
                "./linearRegressionDoE",
                "./RSMFormula",
                "./mainEffectsIntractionPlots", 
                "./effectsPlot2LevelFactor"
                
            ]
        }                                               

        
    ]

})

module.exports = {
    nav: nav(),
    render: () => nav()
}
