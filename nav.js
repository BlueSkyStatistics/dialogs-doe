const nav = {
    "id": "menu-doe",
    "buttons": [
        "./doeOverview",
        {
            "id": "menu-doe-createdoefactortable",
            "icon": "icon-doe",
            "children": [
                "./createDoEgrid",
                "./createDoEgrid2"
            ]
        },
 		
        "./importDesign",
        "./exportDesign",

        {
            "id": "menu-doe-createdesign",
            "icon": "icon-doe",
            "children": [
                "./create2LevelDesign",
                "./createRegularFrF2Design",
                "./createFullFactorialDesign",
                "./createOrthogonalArrayDesign",
                "./createDOptimalDesign",
                "./createBoxBehnkenDesign",
                "./createLatinHypercubeDesign",
                "./createTaguchiParameterDesign"
            ]
        },
        {
            "id": "menu-doe-inspectdesign",
            "icon": "icon-doe",
            "children": [
                "./inspectDesign",
                "./plotDesign",
                "./inspectFrF2DesignCatalog",
                "./inspectOADesignCatalog" 
            ]
        },
        {
            "id": "menu-doe-modifydesign",
            "icon": "icon-doe",
            "children": [
                "./createCentralCompositeDesignMixedFactors",
                "./addRemoveResp",
                "./addCenterpoint2LevelDesign"						
            ]
        },
        {
            "id": "menu-doe-analyzedesign",
            "icon": "icon-doe",
            "children": [
                "./linearRegressionCurvTestDoE",
                "./linearRegressionDoE",
                "./RSMFormula",
                "./mainEffectsIntractionPlots", 
                "./effectsPlot2LevelFactor"
                
            ]
        }

        
    ]

}

module.exports.nav = nav
