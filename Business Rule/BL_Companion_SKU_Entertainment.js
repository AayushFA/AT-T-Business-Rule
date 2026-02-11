/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Companion_SKU_Entertainment",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Derivation_Libraries" ],
  "name" : "Companion SKU Entertainment Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Companion_SKU_Common_Derivation",
    "libraryAlias" : "companionDerivationLib"
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

/*version - 1
 * CTXSCM-26004
 */
function createEntertainmentCompanionSKUs(node, stepManager, lookUpTableHome, query) {
	
	var userItemType = node.getValue("User_Item_Type_ENT").getID();
	var itemClass = node.getValue("Item_Class").getID();
	var wCableCreated = node.getValue("Item_w/Cable_Create").getSimpleValue();
	var woCableCreated = node.getValue("Item_w/oCable_Create").getSimpleValue();
	var companions = node.getValue("ENT_Companion_Item_Type").getSimpleValue();		
	if (itemClass == "ATT DirecTV" || (itemClass == "BAU Wireline"|| itemClass == "BAU Broadband")) {
		if (companions) {				
			var companionsList = new java.util.ArrayList();			
			companions = companions.split("<multisep/>");			
			for (var i = 0; i < companions.length; i++) {
				var companion = companions[i];
				companionsList.add(companion);			
			}
			if (companionsList.size() > 0) {
				for (var j = 0; j < companionsList.size(); j++) {					
					var curCompanion = companionsList.get(j);	
								
					if (((curCompanion == "DTV_Refurb Bulk" || curCompanion == "DTV_Refurb Single w/ Cable" || curCompanion == "DTV_Refurb Single Pack w/o Cable") && itemClass == "ATT DirecTV") ||
						(curCompanion == "UVR_REFURB" && (itemClass == "BAU Wireline" || itemClass == "BAU Broadband"))) {
						setCompanionFlag(node, curCompanion,lookUpTableHome);						
						createCompanionSKUs(node, stepManager, query, curCompanion,lookUpTableHome);						
					}
					if (((curCompanion == "DTV_Single Pack w/ Cable" && wCableCreated != "Yes") ||
						(curCompanion == "DTV_Single Pack w/o Cable" && woCableCreated != "Yes")) &&
						itemClass == "ATT DirecTV") {
						cloneItem(node, curCompanion, stepManager, query);
					}
				}
			}
		}
	}
}

function setCompanionFlag(node, compType,lookUpTableHome) {
	var lookUpResult = lookUpTableHome.getLookupTableValue("LT_CompanionSKU_Flags", compType);
	if (lookUpResult) {
		node.getValue(lookUpResult).setLOVValueByID("Y");
	}
}

function cloneItem(node, companion, stepManager, query) {
	var parent = node.getParent();
	var clonedItem = parent.createProduct(null, "Item");
	if (clonedItem) {
		var AttrGrp_ENT = stepManager.getAttributeGroupHome().getAttributeGroupByID("AG_ENT_Mandatory");
		if (AttrGrp_ENT) {
			copyAttributeValue(node, clonedItem, AttrGrp_ENT) //Copy the ENT Specification Attr values
		}
		var attrGrpEntOptional = stepManager.getAttributeGroupHome().getAttributeGroupByID("AG_ENT_Optional");
		if (attrGrpEntOptional) {
			copyAttributeValue(node, clonedItem, attrGrpEntOptional); //Copy the ENT Specification Attr values
		}
		var attrGrpEntUpdatable = stepManager.getAttributeGroupHome().getAttributeGroupByID("AG_ENT_Updatable");
		if (attrGrpEntUpdatable) {
			copyAttributeValue(node, clonedItem, attrGrpEntUpdatable); //Copy the ENT Specification Attr values
		}

		var attrGrpGlobal = stepManager.getAttributeGroupHome().getAttributeGroupByID("AG_Global");
		if (attrGrpGlobal) {
			copyAttributeValue(node, clonedItem, attrGrpGlobal); //Copy the Global Specification Attr values
		}

		//Set Long_Description on Cloned Item'
		var longDesc = node.getValue("Long_Description").getSimpleValue();
		if (longDesc) {
			clonedItem.getValue("Long_Description").setSimpleValue(longDesc.concat(" - " + companion.substring(4, companion.length())));
		} else {
			clonedItem.getValue("Long_Description").setSimpleValue(companion.substring(4, companion.length()));
		}
		if (clonedItem.getValue("Line_Of_Business").getSimpleValue() == "Entertainment") {
			if (clonedItem.isInState("Item_Creation_Workflow", "Start")) {
				var instance = clonedItem.getWorkflowInstanceByID("Item_Creation_Workflow");
				instance.getTaskByID("Start").triggerByID("ToEntertainment", "Initiating Single Pack Item into WF");
			}
		}

		// companionsList is not used elsewhere, remove related code
		if (companion == "DTV_Single Pack w/ Cable") {
			node.getValue("Item_w/Cable_Create").setSimpleValue("Yes");
		}
		if (companion == "DTV_Single Pack w/o Cable") {
			node.getValue("Item_w/oCable_Create").setSimpleValue("Yes");
		}
		clonedItem.startWorkflowByID("Item_Creation_Workflow", "Cloned Item Initiated into WF");
	}
}

function copyAttributeValue(src, dest, AttrGrp) {
	var singleValId = null;
	var singleVal = null;
	var mulVal = null;
	var val = null;
	const exclude = ["Long_Description", "ENT_Companion_Item_Type", "Item_Num"];

	try {
		var attrs = AttrGrp.getAttributes();
		var attrItr = attrs.iterator();
		while (attrItr.hasNext()) {
			var attr = attrItr.next();
			var attrId = attr.getID();
			if (!exclude.includes(attrId + "")) {
				if (attr.hasLOV()) {
					if (attr.isMultiValued()) {
						mulVal = src.getValue(attrId).getValues();
						if (mulVal.size() > 0) {
							for (var i = 0; i < mulVal.size(); i++) {
								var valId = mulVal.get(i).getID();
								dest.getValue(attrId).append().addLOVValueByID(valId).apply();
							}
						}
					} else {
						singleValId = src.getValue(attrId).getID();
						if (singleValId) {
							dest.getValue(attrId).setLOVValueByID(singleValId);
						}
					}
				} else {
					singleVal = src.getValue(attrId).getSimpleValue();
					if (singleVal) {
						dest.getValue(attrId).setValue(singleVal);
					}
				}
			}
		}
	} catch (e) {
		throw (e);
	}
}

function createCompanionSKUs(item, stepManager, query, companion,lookUpTableHome) {
	
	var itemClass = item.getValue("Item_Class").getID();
	if ((companion == "UVR_REFURB" && (itemClass == "BAU Wireline" || itemClass == "BAU Broadband")) ||
		((companion == "DTV_Refurb Bulk" || companion == "DTV_Refurb Single w/ Cable" || companion == "DTV_Refurb Single Pack w/o Cable") && itemClass == "ATT DirecTV")) {
		var flag = companionDerivationLib.checkCompSKU(item, stepManager, query, "REFURB");		
		if (flag) {
			log.info(" IN--> ")	
			var compSku = item.createProduct(null, "Companion_SKU"); //Create Companion SKU Object			
			companionDerivationLib.setCompSKUCoreAttributes(item, compSku, "REFURB", "MST", stepManager);
			var compEntity = null;
			if (companion == "UVR_REFURB") {
				compEntity = stepManager.getEntityHome().getEntityByID("UVR");
			}
			if (companion.startsWith("DTV_")) {
				compEntity = stepManager.getEntityHome().getEntityByID("DTVR");
			}
			if (compEntity) {			
				companionDerivationLib.setCompSkuCreateOnlyAttributes(item, compSku, compEntity, stepManager, lookUpTableHome);
	              companionDerivationLib.setCompSkuCreateUpdateAttributes(item, compSku, compEntity, stepManager, lookUpTableHome);				
			}			
		}
	}
}

/*
 version: 0
function createEntertainmentCompanionSKUs(node, stepManager, lookUpTableHome, query) {
	
	var userItemType = node.getValue("User_Item_Type_ENT").getID();
	var itemClass = node.getValue("Item_Class").getID();
	var wCableCreated = node.getValue("Item_w/Cable_Create").getSimpleValue();
	var woCableCreated = node.getValue("Item_w/oCable_Create").getSimpleValue();
	var companions = node.getValue("ENT_Companion_Item_Type").getSimpleValue();		
	if (itemClass == "ATT DirecTV" || (userItemType == "UVERSE" && (itemClass == "BAU Wireline"|| itemClass == "BAU Broadband"))) {
		if (companions) {				
			var companionsList = new java.util.ArrayList();			
			companions = companions.split("<multisep/>");			
			for (var i = 0; i < companions.length; i++) {
				var companion = companions[i];
				companionsList.add(companion);			
			}
			if (companionsList.size() > 0) {
				for (var j = 0; j < companionsList.size(); j++) {					
					var curCompanion = companionsList.get(j);	
								
					if (((curCompanion == "DTV_Refurb Bulk" || curCompanion == "DTV_Refurb Single w/ Cable" || curCompanion == "DTV_Refurb Single Pack w/o Cable") && itemClass == "ATT DirecTV") ||
						(curCompanion == "UVR_REFURB" && userItemType == "UVERSE" && (itemClass == "BAU Wireline" || itemClass == "BAU Broadband"))) {
						setCompanionFlag(node, curCompanion,lookUpTableHome);						
						createCompanionSKUs(node, stepManager, query, curCompanion, userItemType,lookUpTableHome);						
					}
					if (((curCompanion == "DTV_Single Pack w/ Cable" && wCableCreated != "Yes") ||
						(curCompanion == "DTV_Single Pack w/o Cable" && woCableCreated != "Yes")) &&
						itemClass == "ATT DirecTV") {
						cloneItem(node, curCompanion, stepManager, query, userItemType);
					}
				}
			}
		}
	}
}

function setCompanionFlag(node, compType,lookUpTableHome) {
	var lookUpResult = lookUpTableHome.getLookupTableValue("LT_CompanionSKU_Flags", compType);
	if (lookUpResult) {
		node.getValue(lookUpResult).setLOVValueByID("Y");
	}
}

function cloneItem(node, companion, stepManager, query, userItemType) {
	var parent = node.getParent();
	var clonedItem = parent.createProduct(null, "Item");
	if (clonedItem) {
		var AttrGrp_ENT = stepManager.getAttributeGroupHome().getAttributeGroupByID("AG_ENT_Mandatory");
		if (AttrGrp_ENT) {
			copyAttributeValue(node, clonedItem, AttrGrp_ENT) //Copy the ENT Specification Attr values
		}
		var attrGrpEntOptional = stepManager.getAttributeGroupHome().getAttributeGroupByID("AG_ENT_Optional");
		if (attrGrpEntOptional) {
			copyAttributeValue(node, clonedItem, attrGrpEntOptional); //Copy the ENT Specification Attr values
		}
		var attrGrpEntUpdatable = stepManager.getAttributeGroupHome().getAttributeGroupByID("AG_ENT_Updatable");
		if (attrGrpEntUpdatable) {
			copyAttributeValue(node, clonedItem, attrGrpEntUpdatable); //Copy the ENT Specification Attr values
		}

		var attrGrpGlobal = stepManager.getAttributeGroupHome().getAttributeGroupByID("AG_Global");
		if (attrGrpGlobal) {
			copyAttributeValue(node, clonedItem, attrGrpGlobal); //Copy the Global Specification Attr values
		}

		//Set Long_Description on Cloned Item'
		var longDesc = node.getValue("Long_Description").getSimpleValue();
		if (longDesc) {
			clonedItem.getValue("Long_Description").setSimpleValue(longDesc.concat(" - " + companion.substring(4, companion.length())));
		} else {
			clonedItem.getValue("Long_Description").setSimpleValue(companion.substring(4, companion.length()));
		}
		if (clonedItem.getValue("Line_Of_Business").getSimpleValue() == "Entertainment") {
			if (clonedItem.isInState("Item_Creation_Workflow", "Start")) {
				var instance = clonedItem.getWorkflowInstanceByID("Item_Creation_Workflow");
				instance.getTaskByID("Start").triggerByID("ToEntertainment", "Initiating Single Pack Item into WF");
			}
		}

		// companionsList is not used elsewhere, remove related code
		if (companion == "DTV_Single Pack w/ Cable") {
			node.getValue("Item_w/Cable_Create").setSimpleValue("Yes");
		}
		if (companion == "DTV_Single Pack w/o Cable") {
			node.getValue("Item_w/oCable_Create").setSimpleValue("Yes");
		}
		clonedItem.startWorkflowByID("Item_Creation_Workflow", "Cloned Item Initiated into WF");
	}
}

function copyAttributeValue(src, dest, AttrGrp) {
	var singleValId = null;
	var singleVal = null;
	var mulVal = null;
	var val = null;
	const exclude = ["Long_Description", "ENT_Companion_Item_Type", "Item_Num"];

	try {
		var attrs = AttrGrp.getAttributes();
		var attrItr = attrs.iterator();
		while (attrItr.hasNext()) {
			var attr = attrItr.next();
			var attrId = attr.getID();
			if (!exclude.includes(attrId + "")) {
				if (attr.hasLOV()) {
					if (attr.isMultiValued()) {
						mulVal = src.getValue(attrId).getValues();
						if (mulVal.size() > 0) {
							for (var i = 0; i < mulVal.size(); i++) {
								var valId = mulVal.get(i).getID();
								dest.getValue(attrId).append().addLOVValueByID(valId).apply();
							}
						}
					} else {
						singleValId = src.getValue(attrId).getID();
						if (singleValId) {
							dest.getValue(attrId).setLOVValueByID(singleValId);
						}
					}
				} else {
					singleVal = src.getValue(attrId).getSimpleValue();
					if (singleVal) {
						dest.getValue(attrId).setValue(singleVal);
					}
				}
			}
		}
	} catch (e) {
		throw (e);
	}
}

function createCompanionSKUs(item, stepManager, query, companion, userItemType,lookUpTableHome) {
	
	var itemClass = item.getValue("Item_Class").getID();
	if ((companion == "UVR_REFURB" && userItemType == "UVERSE" && (itemClass == "BAU Wireline" || itemClass == "BAU Broadband")) ||
		((companion == "DTV_Refurb Bulk" || companion == "DTV_Refurb Single w/ Cable" || companion == "DTV_Refurb Single Pack w/o Cable") && itemClass == "ATT DirecTV")) {
		var flag = companionDerivationLib.checkCompSKU(item, stepManager, query, "REFURB");		
		if (flag) {
			log.info(" IN--> ")	
			var compSku = item.createProduct(null, "Companion_SKU"); //Create Companion SKU Object			
			companionDerivationLib.setCompSKUCoreAttributes(item, compSku, "REFURB", "MST", stepManager);
			var compEntity = null;
			if (userItemType == "UVERSE") {
				compEntity = stepManager.getEntityHome().getEntityByID("UVR");
			}
			if (userItemType == "SATELLITE") {
				compEntity = stepManager.getEntityHome().getEntityByID("DTVR");
			}
			if (compEntity) {			
				companionDerivationLib.setCompSkuCreateOnlyAttributes(item, compSku, compEntity, stepManager, lookUpTableHome);
	              companionDerivationLib.setCompSkuCreateUpdateAttributes(item, compSku, compEntity, stepManager, lookUpTableHome);				
			}			
		}
	}
}
*/
/*===== business library exports - this part will not be imported to STEP =====*/
exports.createEntertainmentCompanionSKUs = createEntertainmentCompanionSKUs
exports.setCompanionFlag = setCompanionFlag
exports.cloneItem = cloneItem
exports.copyAttributeValue = copyAttributeValue
exports.createCompanionSKUs = createCompanionSKUs