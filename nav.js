/**
  * This file is protected by copyright (c) 2023-2025 by BlueSky Statistics, LLC.
  * All rights reserved. The copy, modification, or distribution of this file is not
  * allowed without the prior written permission from BlueSky Statistics, LLC.
 */

const nav = {
    "name": "DoE",
    "tab": "DoE",
    "buttons": [
        "./doeOverview",
        {
            "name": "Create DoE Factor Table",
            "icon": "icon-doe",
            "children": [
                "./createDoEgrid",
                "./createDoEgrid2"
            ]
        },
		
        "./importDesign",
        "./exportDesign",

        {
            "name": "Create Design",
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
            "name": "Inspect Design",
            "icon": "icon-doe",
            "children": [
                "./inspectDesign",
                "./plotDesign",
                "./inspectFrF2DesignCatalog",
                "./inspectOADesignCatalog" 
            ]
        },
        {
            "name": "Modify Design",
            "icon": "icon-doe",
            "children": [
                "./addRemoveResp",
                "./addCenterpoint2LevelDesign"						
            ]
        },
        {
            "name": "Analyze Design",
            "icon": "icon-doe",
            "children": [
                "./linearRegressionDoE",
                "./RSMFormula",
                "./mainEffectsIntractionPlots", 
                "./effectsPlot2LevelFactor"
                
            ]
        }                                               

        
    ]

}

module.exports.nav = nav
