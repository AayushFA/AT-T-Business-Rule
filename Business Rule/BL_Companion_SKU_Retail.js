/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Companion_SKU_Retail",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Derivation_Libraries" ],
  "name" : "Companion SKU Retail Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Companion_SKU_Common_Derivation",
    "libraryAlias" : "companionDerivationLib"
  }, {
    "libraryId" : "BL_SPL_Derivation",
    "libraryAlias" : "splLib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessLibrary",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
function createRetailCompanionSKUs(node, stepManager, lookUpTableHome, query) {
	var supplier = node.getValue("OEM_Full_Name").getSimpleValue();
	var Companions = node.getValue("Companion_Item_Type").getSimpleValue();	
	if (Companions) {
		var itemClass = node.getValue("Item_Class").getID();
		var deviceClassList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Device_Item_Class").getSimpleValue();
		if (deviceClassList.includes(itemClass) == true) { // create CompanionSKUs only for Device Item Types         	    			
			Companions = Companions.split("<multisep/>");
			for (i = 0; i < Companions.length; i++) {
				var compType = Companions[i];
				compType = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_Companion_Item_Type_Duplicate").getListOfValuesValueByID(compType);
				if (compType) {
					compType = compType.getValue();
					if (compType.substring(0, 2).equals("FG") || compType.equals("WIP2XX") || compType.equals("WIP3XX") || compType.equals("WIP4XX")) {
						var counter = 0;
						var existingDCs = node.getDataContainerByTypeID("DC_Companion_Type").getDataContainers();
						if (existingDCs.size() > 0) {
							var existingDCsItr = existingDCs.iterator();
							while (existingDCsItr.hasNext()) {
								var curDC = existingDCsItr.next().getDataContainerObject();
								if (curDC.getValue("Additional_Companion_Type").getSimpleValue() == compType)
									counter++;
							}
						}
						if (counter == 0) {
							createDataContainers(node, compType);
						}
						createCompanionSKUs(node, compType, stepManager, query, lookUpTableHome);
					} else {
						if (compType != "APL1YRREFURB" && compType != "APL90DAYREFURB" && compType != "COU") {
							var lookUpResult = lookUpTableHome.getLookupTableValue("LT_CompanionSKU_Flags", compType);
							if (lookUpResult) {
								node.getValue(lookUpResult).setLOVValueByID("Y");
							}
							createCompanionSKUs(node, compType, stepManager, query, lookUpTableHome);
						}
						if ((supplier == "Apple" || supplier == "APPLE_TV") && (compType == "APL1YRREFURB" || compType == "APL90DAYREFURB" || compType == "COU")) {
							var lookUpResult = lookUpTableHome.getLookupTableValue("LT_CompanionSKU_Flags", compType);
							if (lookUpResult) {
								node.getValue(lookUpResult).setLOVValueByID("Y");
							}
							createCompanionSKUs(node, compType, stepManager, query, lookUpTableHome);
						}
					}
				}
			}
		}
	}
}

function createDataContainers(node, compType) {
	dc = node.getDataContainerByTypeID("DC_Companion_Type").addDataContainer().createDataContainerObject(null);
	dc.getValue("Additional_Companion_Type").addLOVValueByID(compType);
	if (compType.substring(0, 2) == "FG") {
		dc.getValue("Used_Item_Type").addLOVValueByID(compType.substring(0, 2));
		dc.getValue("Grade").addLOVValueByID(compType.substring(2, 3));
		dc.getValue("Kitting_Packaging").addLOVValueByID(compType.substring(3, 4));
		dc.getValue("Special_Condition").addLOVValueByID(compType.substring(4));
	} else {
		dc.getValue("Used_Item_Type").addLOVValueByID(compType.substring(0, 3));
		dc.getValue("Grade").addLOVValueByID(compType.substring(3, 4));
		dc.getValue("Kitting_Packaging").addLOVValueByID(compType.substring(4, 5));
		dc.getValue("Special_Condition").addLOVValueByID(compType.substring(5));
	}
}

function createCompanionSKUs(node, compType, stepManager, query, lookUpTableHome) {
	
	var flag = companionDerivationLib.checkCompSKU(node, stepManager, query, compType);	
	if (flag) {
		compSKU = node.createProduct(null, "Companion_SKU"); //Create Companion SKU Object		
		companionDerivationLib.setCompSKUCoreAttributes(node, compSKU, compType, "MST", stepManager); //Set CompanionSKU Attributes  	
		if (compType.substring(0, 2).equals("FG")) {
			compEntity = stepManager.getEntityHome().getEntityByID("FG");
		} else if (compType.substring(0, 3).equals("WIP")) {
			compEntity = stepManager.getEntityHome().getEntityByID("WIP");
		} else {
			compEntity = stepManager.getEntityHome().getEntityByID(compType);
		}
		
		if (compEntity) {
			
			companionDerivationLib.setCompSkuCreateOnlyAttributes(node, compSKU, compEntity, stepManager, lookUpTableHome);
			companionDerivationLib.setCompSkuCreateUpdateAttributes(node, compSKU, compEntity, stepManager, lookUpTableHome);
		}
		if (compType != "DEP") {
			splLib.createCarrierDC(node, compSKU, stepManager);
		}
		//compSKU.approve();
	}
}

/*===== business library exports - this part will not be imported to STEP =====*/
exports.createRetailCompanionSKUs = createRetailCompanionSKUs
exports.createDataContainers = createDataContainers
exports.createCompanionSKUs = createCompanionSKUs