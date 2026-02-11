/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Companion_SKU_Common_Derivation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Derivation_Libraries" ],
  "name" : "Companion SKU Common Derivation Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Child_Org_Common_Derivation",
    "libraryAlias" : "commonChildOrgDerivationLib"
  }, {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonDerivationLib"
  }, {
    "libraryId" : "BL_Item_Transportation_Derivation",
    "libraryAlias" : "transportationDerivationLib"
  }, {
    "libraryId" : "BL_Item_Entertainment_Derivation",
    "libraryAlias" : "entertainmentDerivationLib"
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
function checkCompSKU(node, stepManager, query, compType) {	
	if (stepManager.getNodeHome().getObjectByKey("Comp.SKU.Key", node.getID() + "." + compType))	
		return false;
	else
		return true;
}

function setCompSKUCoreAttributes(node, compSKU, compType, orgCode, stepManager) {	
	
	compSKU.getValue("Organization_Code").setLOVValueByID(orgCode);
	if (node.getValue("Line_Of_Business").getSimpleValue() == "Retail")
		compSKU.getValue("Companion_Item_Type").replace().addLOVValueByID(compType).apply();
	if (node.getValue("Line_Of_Business").getSimpleValue() == "Entertainment") {
		compSKU.getValue("ENT_Companion_Item_Type").replace().addLOVValueByID(compType).apply();
		compSKU.getValue("Companion_Item_Type").replace().addLOVValueByID(compType).apply();
	}	
	compSKU.getValue("Comp_SKU_Identity").setSimpleValue(node.getID() + "." + compType);
	compSKU.getValue("Submit_Standard_Cost").setLOVValueByID("Y");
	setCompSkuRequestor(compSKU, node, stepManager);
	commonDerivationLib.setSerialGenerationVal(compSKU, node, stepManager);
	transportationDerivationLib.setTMSItemType(node);
     transportationDerivationLib.setTMSProductType(node);
	transportationDerivationLib.setSerializedProduct(node);
}


function setCompSkuCreateOnlyConstantRules(node, compSKU, compEntity, stepManager, lookUpTableHome) {

	if (compEntity.getID() == "DTVR") {
		var compEntityListPrice = compEntity.getValue("CompSKU_ListPrice").getSimpleValue();
		if (compEntityListPrice) {
			compSKU.getValue("List_Price").setSimpleValue(compEntityListPrice);
		}
	}
}

function setCompSkuCreateUpdateConstantRules(node, compSKU, compEntity, stepManager, lookUpTableHome) {

	if (compEntity.getID() == "DISPLAY") {
		var compEntityInventoryCat = compEntity.getValue("CompSKU_InventoryCat").getSimpleValue();
		if (compEntityInventoryCat) {
			compSKU.getValue("Inventory_Cat").setSimpleValue(compEntityInventoryCat);
		}
	}
	if (compEntity.getID() == "UVR") {
		var compEntityMarketPrice = compEntity.getValue("CompSKU_MarketPrice").getSimpleValue();
		if (compEntityMarketPrice) {
			compSKU.getValue("Market_Price").setSimpleValue(compEntityMarketPrice);
		}
		var compEntityStandardCost = compEntity.getValue("CompSKU_StandardCost").getSimpleValue();
		if (compEntityStandardCost) {
			compSKU.getValue("Requested_Standard_Cost").setSimpleValue(compEntityStandardCost);
		}
	}
	if(compEntity.getID() == "DTVR") {
		var compEntityInventoryAssetValue =compEntity.getValue("CompSKU_Inventory_Asset_Value").getID();
		var inventoryAssetValue = compSKU.getValue("Inventory_Asset_Value").getID();
		if(compEntityInventoryAssetValue){
			compSKU.getValue("Inventory_Asset_Value").setLOVValueByID(compEntityInventoryAssetValue);
			var invVal=compSKU.getValue("Inventory_Asset_Value").getID();
		}
	}
}

function setCompSkuCreateOnlyAttributes(node, compSKU, compEntity, stepManager, lookUpTableHome) {
	
	setCompSkuCreateOnlyConstantRules(node, compSKU, compEntity, stepManager, lookUpTableHome);
	var createOnlyAttributesList = "";
	createOnlyAttributesList = lookUpTableHome.getLookupTableValue("LT_CompSKU_Attribute_Derivation_Rules", "CreateOnly_Attributes");
	if (createOnlyAttributesList) {
		createOnlyAttributesList = createOnlyAttributesList.split("\\|");
		createOnlyAttributesList.forEach(function(createOnlyAttributeID) {
			var compSKURule = "";
			compSKURule = lookUpTableHome.getLookupTableValue("LT_CompSKU_Attribute_Derivation_Rules", createOnlyAttributeID + "|Create_Only");
			if (compSKURule) {
				setCompSkuAttributes(node, compSKU, compEntity, stepManager, compSKURule, "Create_Only", createOnlyAttributeID);
			}
		});
	}
}

function setCompSkuCreateUpdateAttributes(node, compSKU, compEntity, stepManager, lookUpTableHome) {	
	 // All the Companian types and Attributes from below function calls should be added to "LT_Item_Partial_Approve_Attributes"	
	setCompSkuCreateUpdateConstantRules(node, compSKU, compEntity, stepManager, lookUpTableHome);
	var createUpdateAttributesList = "";
	createUpdateAttributesList = lookUpTableHome.getLookupTableValue("LT_CompSKU_Attribute_Derivation_Rules", "CreateUpdate_Attributes");
	if (createUpdateAttributesList) {		
		createUpdateAttributesList = createUpdateAttributesList.split("\\|");		
		createUpdateAttributesList.forEach(function(createUpdateAttributeID) {
			var compSKURule = "";
			compSKURule = lookUpTableHome.getLookupTableValue("LT_CompSKU_Attribute_Derivation_Rules", createUpdateAttributeID + "|Create_Update");
			if (compSKURule) {			
				setCompSkuAttributes(node, compSKU, compEntity, stepManager, compSKURule, "Create_Update", createUpdateAttributeID);
			}
		});
	}
	commonDerivationLib.setItemDescription(compSKU,stepManager,node.getValue("Line_Of_Business").getID());
     commonDerivationLib.setPublishItemDescription(compSKU, stepManager);
}

function setCompSkuAttributes(node, compSKU, compEntity, stepManager, compSKURule, compSKURuleType, attributeID) {	
	
	compSKURule = compSKURule.split("\\|");
	var compTypeList = compSKURule[0];
	var ruleType = compSKURule[1];
	var parentAttributeValue = "";		
	if (compTypeList.includes(compEntity.getID())) {			
		if (ruleType == "Copy" && compSKURuleType == "Create_Only") {
			if (stepManager.getAttributeHome().getAttributeByID(attributeID).hasLOV()) {
				parentAttributeValue = node.getValue(attributeID).getID();
				if (parentAttributeValue) {
					compSKU.getValue(attributeID).setLOVValueByID(parentAttributeValue);
				}
			} else {
				parentAttributeValue = node.getValue(attributeID).getSimpleValue();
				if (parentAttributeValue) {
					compSKU.getValue(attributeID).setSimpleValue(parentAttributeValue);
				}
			}
		}
		if (ruleType == "Constant") {
			var compEntityAttributeID = compSKURule[2];
			var compEntityAttributeValue = "";
			if (stepManager.getAttributeHome().getAttributeByID(attributeID).hasLOV()) {
				if (stepManager.getAttributeHome().getAttributeByID(compEntityAttributeID).hasLOV()) {
					compEntityAttributeValue = compEntity.getValue(compEntityAttributeID).getID();
				} else {
					compEntityAttributeValue = compEntity.getValue(compEntityAttributeID).getSimpleValue();
				}
				if (compEntityAttributeValue) {
					compSKU.getValue(attributeID).setLOVValueByID(compEntityAttributeValue);
				}
			} else {
				if (stepManager.getAttributeHome().getAttributeByID(compEntityAttributeID).hasLOV()) {
					compEntityAttributeValue = compEntity.getValue(compEntityAttributeID).getID();
				} else {
					compEntityAttributeValue = compEntity.getValue(compEntityAttributeID).getSimpleValue();
				}
				if (compEntityAttributeValue) {
					compSKU.getValue(attributeID).setSimpleValue(compEntityAttributeValue);
				}
			}
		}
		if (ruleType == "Percentage") {								
			var compEntityAttributeID = compSKURule[2];
			parentAttributeValue = node.getValue(attributeID).getSimpleValue();
			compEntityAttributeValue = compEntity.getValue(compEntityAttributeID).getSimpleValue();							
			if (parentAttributeValue && compEntityAttributeValue) {									
				if (!node.getValue("Item_Num").getSimpleValue()) {
					
					var percentage = parentAttributeValue * ((compEntityAttributeValue) / 100);
					if (attributeID == "Market_Price") {
						percentage = percentage.toFixed(2) * 1; // Round to 2 decimal places 
					} else {
						percentage = percentage.toFixed(4) * 1; // Round to 4 decimal places
					}					
					compSKU.getValue(attributeID).setSimpleValue(percentage);
				} else {					
					if (attributeID == "Requested_Standard_Cost") {													
						var compSKURequestedStandardCost = compSKU.getValue("Requested_Standard_Cost").getSimpleValue();
						if ((!compSKURequestedStandardCost) ||
							(node.getValue("Requested_Standard_Cost").getSimpleValue() == node.getValue("Current_Standard_Cost").getSimpleValue() && compSKU.getValue("No_Std_Cost_Propagation").getID() != "Y")) {
						var percentage = parentAttributeValue * ((compEntityAttributeValue) / 100);
							percentage = percentage.toFixed(4) * 1;
							compSKU.getValue(attributeID).setSimpleValue(percentage);	
														
							if(!compSKU.getValue("Item_Num").getSimpleValue()){														
								compSKU.getValue("Current_Standard_Cost").setSimpleValue(percentage);
							}							 
	                            compSKU.getValue("Submitted_Date").setSimpleValue("");
						}
					} else {
						
						var percentage = parentAttributeValue * ((compEntityAttributeValue) / 100);
						if (attributeID == "Market_Price") {
							percentage = percentage.toFixed(2) * 1; // Round to 2 decimal places 
						} else {
							percentage = percentage.toFixed(4) * 1; // Round to 4 decimal places
						}
						
						compSKU.getValue(attributeID).setSimpleValue(percentage);
					}
				}
			}
		}

		if (ruleType == "SQL_Expression") {
			if (attributeID == "Item_Status") {
					parentAttributeValue = node.getValue(attributeID+"_"+node.getValue("Line_Of_Business").getID()).getID();
			if (parentAttributeValue) {
					var statusSubstring = "";
					statusSubstring = (parentAttributeValue).substring(0, 3).toUpperCase();
				}
				if (parentAttributeValue == "Pre Launch" || statusSubstring == "ACT") {
					if (node.getValue("Line_Of_Business").getID() == "RTL") {
						compSKU.getValue("Item_Status_RTL").setLOVValueByID(node.getValue("Item_Status_RTL").getID());
						compSKU.getValue("Item_Status").setLOVValueByID(node.getValue("Item_Status_RTL").getID());
					} else if (node.getValue("Line_Of_Business").getID() == "ENT") {
						compSKU.getValue("Item_Status_ENT").setLOVValueByID(node.getValue("Item_Status_ENT").getID());
						compSKU.getValue("Item_Status").setLOVValueByID(node.getValue("Item_Status_ENT").getID());
					}
				}
			}
			if (attributeID == "Inventory_Cat") {
				parentAttributeValue = node.getValue("Inventory_Cat_RTL").getID();
				if (parentAttributeValue) {
					compSKU.getValue("Inventory_Cat_RTL").setLOVValueByID(parentAttributeValue.substring(0, parentAttributeValue.indexOf('.')) + ".DEMO");
				}
			}
							
			if (attributeID == "Planning_Business_Group") {			
				if (ruleType == "SQL_Expression") {					
					var planningBusinessGroup = compSKU.getValue("Planning_Business_Group").getSimpleValue();					
					if(planningBusinessGroup!="MOBILITY"){
						compSKU.getValue("Planning_Business_Group").setLOVValueByID("MOBILITY");
					}
				}
			}					
		}
	}	
	if (!compTypeList.includes(compEntity.getID())) {		
		if (attributeID == "Planning_Parent_Model") {			
			if (ruleType == "SQL_Expression") {
				var parentModel = node.getValue("Planning_Parent_Model").getSimpleValue();
				var capacity = compSKU.getValue("Capacity").getSimpleValue();				
				if(parentModel && capacity){
					var planningParentModel = parentModel + "_" + capacity;
					compSKU.getValue("Planning_Parent_Model").setSimpleValue(planningParentModel);			
				}
			}			
		}		
		if (attributeID == "Planning_Business_Group") {			
			if (ruleType == "SQL_Expression") {				
				var planningBusinessGroup = compSKU.getValue("Planning_Business_Group").getSimpleValue();				
				if(planningBusinessGroup!="MOBILITY RL"){
					compSKU.getValue("Planning_Business_Group").setLOVValueByID("MOBILITY RL");
				}
			}
		}
	}		
}

function setCompSkuRequestor(compSKU, node, stepManager) {
	var companionRequestor = compSKU.getValue("Requestor").getSimpleValue();
	if (!companionRequestor) {
		var itemRequestor = node.getValue("Requestor").getSimpleValue();
		if (itemRequestor) {
			compSKU.getValue('Requestor').setSimpleValue(itemRequestor);
		} else {
			var userID = stepManager.getCurrentUser().getID();
			if (userID && userID.contains('@'))
				userID = userID.substring(0, userID.indexOf('@'));
			compSKU.getValue('Requestor').setSimpleValue(userID);
		}
	}
}

function updateCompSKUandChildOrgAttributes(node, stepManager, lookUpTableHome) {	
	
	var createUpdateAttributesList = "";
	createUpdateAttributesList = lookUpTableHome.getLookupTableValue("LT_CompSKU_Attribute_Derivation_Rules", "CreateUpdate_Attributes");
	if (createUpdateAttributesList) {
		var pitemChildren = node.queryChildren();
		pitemChildren.forEach(function(pitemChild) {
			if (pitemChild.getObjectType().getID() == 'Companion_SKU') {
				getCompanionTypeVariableAttributes(node, pitemChild, stepManager, lookUpTableHome, createUpdateAttributesList);
				if (node.getValue('Line_Of_Business').getID() == "ENT")	{
					entertainmentDerivationLib.copyRSCtoCSCandLP(pitemChild);					
				}				
				commonDerivationLib.setItemDescription(pitemChild,stepManager,node.getValue("Line_Of_Business").getID());
                   commonDerivationLib.setPublishItemDescription(pitemChild, stepManager);
                   commonDerivationLib.revertGenerateNewUPC(pitemChild, stepManager);
				commonChildOrgDerivationLib.updateChildOrgsAttributes(pitemChild, stepManager, lookUpTableHome);				
			}			
			return true;
		});		
	}
}

function getCompanionTypeVariableAttributes(node, compSKU, stepManager, lookUpTableHome, createUpdateAttributesList) {	
	var compSKUEntity = getCompSKUEntity(node, stepManager, compSKU);
	if (compSKUEntity) {
		createUpdateAttributesList = createUpdateAttributesList.split("\\|");
		createUpdateAttributesList.forEach(function(createUpdateAttributeID) {			
          if(createUpdateAttributeID != "Requested_Standard_Cost"){          	
			if (commonDerivationLib.isAttributeValueChanged(node, stepManager, createUpdateAttributeID)) {
				var compSKURule = lookUpTableHome.getLookupTableValue("LT_CompSKU_Attribute_Derivation_Rules", createUpdateAttributeID + "|Create_Update");
				if (compSKURule) {
					setCompSkuAttributes(node, compSKU, compSKUEntity, stepManager, compSKURule, "Create_Update", createUpdateAttributeID);
				}
			}
           }
           // This condition  is to avoid the check for parent value change
           if(createUpdateAttributeID == "Item_Status" || createUpdateAttributeID == "Description_Prefix" ){
				var compSKURule = lookUpTableHome.getLookupTableValue("LT_CompSKU_Attribute_Derivation_Rules", createUpdateAttributeID + "|Create_Update");
				if (compSKURule) {
					setCompSkuAttributes(node, compSKU, compSKUEntity, stepManager, compSKURule, "Create_Update", createUpdateAttributeID);
			}
           }
		});
	}
}

function getCompSKUEntity(node, stepManager, compSKU) {

	var compSKUEntity = "";
	if (compSKU.getValue("Line_Of_Business").getID() == "RTL") {
		compSKUEntity = compSKU.getValue("Companion_Item_Type").getSimpleValue();
		compSKUEntity = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_Companion_Item_Type_Duplicate").getListOfValuesValueByID(compSKUEntity).getValue();
		if (compSKUEntity.substring(0, 2).equals("FG")) {
			compSKUEntity = stepManager.getEntityHome().getEntityByID("FG");
		}else if (compSKUEntity.substring(0, 3).equals("WIP")) {
			compSKUEntity = stepManager.getEntityHome().getEntityByID("WIP");
		}else {
			compSKUEntity = stepManager.getEntityHome().getEntityByID(compSKUEntity);
		}

	} else if (compSKU.getValue("Line_Of_Business").getID() == "ENT") {
		
		var userItemType = node.getValue("User_Item_Type_ENT").getID();		
		if(userItemType == "UVERSE") {			
			compSKUEntity = stepManager.getEntityHome().getEntityByID("UVR");			
		}else if (userItemType == "SATELLITE") {
			compSKUEntity = stepManager.getEntityHome().getEntityByID("DTVR");
		}else{
			compSKUEntity = stepManager.getEntityHome().getEntityByID(compSKUEntity);
		}		
	}
	return compSKUEntity;
}

/*===== business library exports - this part will not be imported to STEP =====*/
exports.checkCompSKU = checkCompSKU
exports.setCompSKUCoreAttributes = setCompSKUCoreAttributes
exports.setCompSkuCreateOnlyConstantRules = setCompSkuCreateOnlyConstantRules
exports.setCompSkuCreateUpdateConstantRules = setCompSkuCreateUpdateConstantRules
exports.setCompSkuCreateOnlyAttributes = setCompSkuCreateOnlyAttributes
exports.setCompSkuCreateUpdateAttributes = setCompSkuCreateUpdateAttributes
exports.setCompSkuAttributes = setCompSkuAttributes
exports.setCompSkuRequestor = setCompSkuRequestor
exports.updateCompSKUandChildOrgAttributes = updateCompSKUandChildOrgAttributes
exports.getCompanionTypeVariableAttributes = getCompanionTypeVariableAttributes
exports.getCompSKUEntity = getCompSKUEntity