/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "AT&T Item Library",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "AT&T_Global_Libraries" ],
  "name" : "AT&T Item Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ ]
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
/**
 * @authors - Madhuri, John [CTS]
 * Item Library
 */

function getCurrentDate() {
	var date = new Date();
	var dateFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd");
	var formattedDate = dateFormatter.format(date);
	return formattedDate;
}

//STIBO-3393 SBOM creation should not be allowed for inactive and future dated Components
function getCurrentDateTimestamp() {
	var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	var dateTimeNow = new Date();
	var formattedDateTime = dateTimeFormatter.format(dateTimeNow);
	return formattedDateTime;
}
//STIBO-3393 SBOM creation should not be allowed for inactive and future dated Components
//Madhuri- Moved to Item Common Derivation Library - Can be removed here
function setAssignee(step, task, userId) { //Function to reassign the item to the Initiator in every state of both the Item Workflows	
	if (userId) {
		var user = step.getUserHome().getUserById(userId);
		if (user) {
			task.reassign(user);
		}
	}
}

function removeJunkCharsLongDescription(node, step, bf) {
	var bf_Remove_Junk_Char_Param = {};
	bf_Remove_Junk_Char_Param.node = node;
	var longDescription = node.getValue("Long_Description").getSimpleValue();
	var longDescriptionID = step.getAttributeHome().getAttributeByID("Long_Description");
	if (longDescription != null) {
		bf_Remove_Junk_Char_Param.attr = longDescriptionID;
		node.getValue("Long_Description").setSimpleValue(bf.evaluate(bf_Remove_Junk_Char_Param));
	}
}

function clearUserDefinedItemDescription(node, itemClassList) {
	var itemClass = node.getValue("Item_Class").getLOVValue();
	if (itemClass != null) {
		itemClass = itemClass.getID() + "";
		if (itemClassList.includes(itemClass) == false) {
			node.getValue("User_Defined_Item_Description").setSimpleValue(null);
		}
	}
}

//Input must be child Org
function setChildKey(child, step) {
	if (child.getObjectType().getID() == "Child_Org_Item") {
		var orgCode = child.getValue("Organization_Code").getLOVValue();
		var itemNum = child.getParent().getValue("Item_Num").getSimpleValue();
		var currentKey = child.getValue("DM_Child_Org_Key").getSimpleValue();
		if (itemNum) {
			var key = itemNum + "." + orgCode.getID();
			if (!currentKey) {
				child.getValue("DM_Child_Org_Key").setSimpleValue(key);
			} else if (currentKey != key) {
				// Update the key
				step.getKeyHome().updateUniqueKeyValues2({
					"DM_Child_Org_Key": String(key)
				}, child);
			}
		}
	}
}

function setNodeName(node) { //Set name for all the objects
	if (node.getObjectType().getID() == "Item" || node.getObjectType().getID() == "Child_Org_Item") {
		var orgCode = node.getValue("Organization_Code").getLOVValue();
		var itemNum = node.getValue("Item_Num").getSimpleValue();
		// Set Name--> Item Number(organization Code)
		if (orgCode != null && itemNum != null)
			node.setName(itemNum + "(" + orgCode.getID() + ")");
		if (orgCode != null && itemNum == null)
			node.setName(orgCode.getID());
	}

	if (node.getObjectType().getID() == "Companion_SKU") {
		if (node.getValue("Line_Of_Business").getSimpleValue() == "Retail")
			var compType = node.getValue("Companion_Item_Type").getSimpleValue();
		if (node.getValue("Line_Of_Business").getSimpleValue() == "Entertainment")
			var compType = node.getValue("ENT_Companion_Item_Type").getSimpleValue();
		var itemNum = node.getValue("Item_Num").getSimpleValue();
		// Set Name-->  Item Number(CompanionType)	
		if (node.getName() == null) {
			if (compType != null && itemNum != null)
				node.setName(itemNum + "(" + compType + ")");
			if (compType != null && itemNum == null)
				node.setName(compType);
		}
	}
}

function createCompanionChildOrgs(node, compSKU, manager, query) {
	//Get the list of Child Orgs to be created for Companions
	var childOrgs = new java.util.ArrayList();
	var children = node.getChildren().iterator();
	while (children.hasNext()) {
		var child = children.next();
		if (child.getObjectType().getID() == "Child_Org_Item") {
			childOrgs.add(child.getValue("Organization_Code").getLOVValue().getID());
		}
	}

	if (childOrgs.size() > 0) {
		for (c = 0; c < childOrgs.size(); c++) {
			var curOrg = childOrgs.get(c);
			var OrgID = manager.getListOfValuesHome().getListOfValuesByID("LOV_ORG_Code").getListOfValuesValueByID(curOrg);
			if (OrgID) {
				var flag = checkChildOrg(compSKU, manager, query, curOrg);
				if (flag) {
					childOrgItem = compSKU.createProduct(null, "Child_Org_Item");
					setChildOrgAttrs(compSKU, childOrgItem, curOrg);
				}
			} else
				log.info("Organization Code " + curOrg + " doesn't exist");
		}
	}
}

function checkChildOrg(node, manager, query, orgCode) {
	var newItemKey = manager.getNodeHome().getObjectByKey("Child.Org.Item.Key", node.getID() + "." + orgCode);
	var itemNum = node.getValue("Item_Num").getSimpleValue();
	if (itemNum)
		var UpdtItemKey = manager.getNodeHome().getObjectByKey("DM.Child.Item.Key", itemNum + "." + orgCode);
	if (newItemKey || UpdtItemKey)
		return false;
	else
		return true;
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

function createCompanionSKUs(node, manager, query, compType, orgCode) {
	var flag = checkCompSKU(node, manager, query, compType);
	log.info("flag: " + flag)
	if (flag) {
		compSKU = node.createProduct(null, "Companion_SKU"); //Create Companion SKU Object
		setCompSKUCoreAttrs(node, compSKU, compType, orgCode, manager); //Set CompanionSKU Attributes 		
		if (compType.substring(0, 2).equals("FG"))
			compEntity = manager.getEntityHome().getEntityByID("FG");
		else if (compType.substring(0, 3).equals("WIP"))
			compEntity = manager.getEntityHome().getEntityByID("WIP");
		else
			compEntity = manager.getEntityHome().getEntityByID(compType);
		if (compEntity) {
			setCompSKUVariableAttrs(node, compSKU, compEntity)
		}
		//STIBO-2035
		if (compType == "DEM") {
			compSKU.getValue("Description_Prefix").setLOVValueByID("DEM");
		}
		if (compType == "DISPLAY") {
			compSKU.getValue("Description_Prefix").setLOVValueByID("DIS");
		}
		createCompanionChildOrgs(node, compSKU, manager, query); // Create Child Org Items for Companion SKU		
	}
}
//Madhuri - Function moved to Companion SKU Commomn Derivation Library, can be deleted here 
function checkCompSKU(node, manager, query, compType) {
	if (manager.getNodeHome().getObjectByKey("Comp.SKU.Key", node.getID() + "." + compType))
		return false;
	else
		return true;
}
//Madhuri - Function moved to Companion SKU Commomn Derivation Library, can be deleted here 
function setCompSKUCoreAttrs(node, compSKU, compType, orgCode, manager) {
	compSKU.getValue("Organization_Code").setLOVValueByID(orgCode);
	if (node.getValue("Line_Of_Business").getSimpleValue() == "Retail")
		compSKU.getValue("Companion_Item_Type").replace().addLOVValueByID(compType).apply();
	if (node.getValue("Line_Of_Business").getSimpleValue() == "Entertainment") {
		compSKU.getValue("ENT_Companion_Item_Type").replace().addLOVValueByID(compType).apply();
		compSKU.getValue("Companion_Item_Type").replace().addLOVValueByID(compType).apply();
	}
	compSKU.getValue("Comp_SKU_Identity").setSimpleValue(node.getID() + "." + compType);
	//STIBO- 2586 Support Team(7 August Release)
	var reqVal = compSKU.getValue("Requestor").getSimpleValue();
	if (reqVal == null) {
		var pReqVal = node.getValue("Requestor").getSimpleValue();
		if (pReqVal) {
			compSKU.getValue('Requestor').setSimpleValue(pReqVal);
		} else {
			var userID = manager.getCurrentUser().getID();
			if (userID && userID.contains('@'))
				userID = userID.substring(0, userID.indexOf('@'));
			compSKU.getValue('Requestor').setSimpleValue(userID);
		}
	}
	
	
	//STIBO- 2586 Support Team(7 August Release) 
}
//Madhuri - Function moved to Companion SKU Commomn Derivation Library, can be deleted here 
function setCompSKUVariableAttrs(node, compSKU, compEntity) {
	var expAcctOrg = compEntity.getValue("compSKU_ExpAcctOrg").getLOVValue();
	if (expAcctOrg != null) {
		expAcctOrg = expAcctOrg.getID()
	};
	var OEM = compEntity.getValue("compSKU_OEM").getLOVValue();
	if (OEM != null) {
		OEM = OEM.getID()
	};
	var OEMName = compEntity.getValue("compSKU_OEM_Name").getLOVValue();
	if (OEMName != null) {
		OEMName = OEMName.getID()
	};
	var financing = compEntity.getValue("CompSKU_FinancingAvailable").getLOVValue();
	if (financing != null) {
		financing = financing.getID()
	};
	var purchCat = compEntity.getValue("CompSKU_PurchasingCat").getLOVValue();
	if (purchCat != null) {
		purchCat = purchCat.getID()
	};
	var itemStatus = compEntity.getValue("CompSKU_ItemStatus").getLOVValue();
	if (itemStatus != null) {
		itemStatus = itemStatus.getID()
	};
	var productType = compEntity.getValue("CompSKU_ProductType").getLOVValue();
	if (productType != null) {
		productType = productType.getID()
	};
	var productSubType = compEntity.getValue("CompSKU_Product_SubType").getLOVValue();
	if (productSubType != null) {
		productSubType = productSubType.getID()
	};
	var descPrefix = compEntity.getValue("CompSKU_ItemDesc_Prefix").getSimpleValue();
	var invCat = compEntity.getValue("CompSKU_InventoryCat").getLOVValue();
	if (invCat != null) {
		invCat = invCat.getID()
	};
	var catGroup = compEntity.getValue("CompSKU_CatalogGroup_Name").getLOVValue();
	if (catGroup != null) {
		catGroup = catGroup.getID()
	};
	var COGS = compEntity.getValue("CompSKU_COGSAccount").getSimpleValue();
	var salesAccount = compEntity.getValue("CompSKU_SalesAccount").getLOVValue();
	if (salesAccount != null) {
		salesAccount = salesAccount.getID()
	};
	var technology = compEntity.getValue("CompSKU_Technology").getLOVValue();
	if (technology != null) {
		technology = technology.getID()
	};
	// STIBO-2911  Prod Support Jan 25 Release
	var submitStdCost = compEntity.getValue("CompSKU_SubmitStandardCost").getSimpleValue();
	if (submitStdCost) {
		compSKU.getValue("Submit_Standard_Cost").setLOVValueByID(submitStdCost);
	}
	// STIBO-2911  Prod Support Jan 25 Release

	//STIBO-2934 Prod Support Feb 22 Release
	var itemClass = compEntity.getValue("CompSKU_ItemClass").getLOVValue();
	if (itemClass != null) {
		itemClass = itemClass.getID()
	};
//Syed - need to review
	var inventoryAsset = compEntity.getValue("CompSKU_Inventory_Asset_Value").getLOVValue();
	if (inventoryAsset != null) {
		inventoryAsset = inventoryAsset.getID();

		if(compEntity.getID() == "REFURB") {
			compSKU.getValue("Inventory_Asset_Value").setLOVValueByID(inventoryAsset);
		}
		}
	//STIBO-2934 Prod Support Feb 22 Release
	if (compEntity.getID() == "DTVR") {
		compSKU.getValue("Expense_Account_Org").setLOVValueByID(expAcctOrg);
		compSKU.getValue("OEM").setLOVValueByID(OEM);
		compSKU.getValue("OEM_Full_Name").setLOVValueByID(OEMName);
		compSKU.getValue("List_Price").setSimpleValue(compEntity.getValue("CompSKU_ListPrice").getSimpleValue());
	}
	if (compEntity.getID() == "UVR") {
		compSKU.getValue("Expense_Account_Org").setLOVValueByID(expAcctOrg);
		compSKU.getValue("Market_Price").setSimpleValue(compEntity.getValue("CompSKU_MarketPrice").getSimpleValue());
		compSKU.getValue("Requested_Standard_Cost").setSimpleValue(compEntity.getValue("CompSKU_StandardCost").getSimpleValue());
	}
	if (compEntity.getID() != "UVR" && compEntity.getID() != "DTVR")
		compSKU.getValue("Financing_Available").setLOVValueByID(financing);
	if (compEntity.getID() != "DEP" || compEntity.getID() != "KIT" && compEntity.getID() != "UVR" && compEntity.getID() != "DTVR") {
		compSKU.getValue("Purchasing_Cat_RTL").setLOVValueByID(purchCat);
	}
	if (compEntity.getID() == "DEM" || compEntity.getID() == "FG" || compEntity.getID() == "WIP" || compEntity.getID() == "DISPLAY") {
		compSKU.getValue("Item_Status").setLOVValueByID(itemStatus);
		compSKU.getValue("Item_Status_RTL").setLOVValueByID(itemStatus);
	}
	if (compEntity.getID() != "DEM" && compEntity.getID() != "FG" && compEntity.getID() != "WIP" && compEntity.getID() != "DISPLAY" && compEntity.getID() != "DTVR" && compEntity.getID() != "UVR") {
		var status = node.getValue("Item_Status_RTL").getLOVValue();
		if (status != null) {
			var statusStr = (status.getID()).substring(0, 3);
			if ((status.getID()) == "Pre Launch" || statusStr == "Act" || statusStr == "ACT") {
				compSKU.getValue("Item_Status_RTL").setLOVValueByID(node.getValue("Item_Status_RTL").getLOVValue().getID());
				compSKU.getValue("Item_Status").setLOVValueByID(node.getValue("Item_Status_RTL").getLOVValue().getID());
			}
		}
	}
	if (compEntity.getID() == "DEM") {
		compSKU.getValue("Description_Prefix").setLOVValueByID(descPrefix);
		compSKU.getValue("Product_Type").setLOVValueByID(productType);
		var inventory = node.getValue("Inventory_Cat_RTL").getSimpleValue();
		if (inventory != null)
			compSKU.getValue("Inventory_Cat_RTL").setLOVValueByID(inventory.substring(0, inventory.indexOf('.')) + ".DEMO");
	}
	if (compEntity.getID() != "DTVR" && compEntity.getID() != "UVR" && compEntity.getID() != "DISPLAY") {
		var marketPrice = node.getValue("Market_Price").getSimpleValue();
		var calcMarketPrice = marketPrice * ((compEntity.getValue("CompSKU_MarketPrice").getSimpleValue()) / 100);
		compSKU.getValue("Market_Price").setSimpleValue(calcMarketPrice);
	}
	if (compEntity.getID() != "DTVR" && compEntity.getID() != "UVR") {
		var listPrice = node.getValue("List_Price").getSimpleValue();
		var calcListPrice = listPrice * ((compEntity.getValue("CompSKU_ListPrice").getSimpleValue()) / 100);
		calcListPrice = calcListPrice.toFixed(4) * 1; // Round to 4 decimal places STIBO-3410 Prod Support Team April 12 Release
		compSKU.getValue("List_Price").setSimpleValue(calcListPrice);
				
		// STIBO- 2523 Support Team(August Release)
		var mwfInstance = node.getWorkflowInstanceByID("Item_Maintenance_Workflow");
		var currentSTDCost = node.getValue("Current_Standard_Cost").getSimpleValue();
		if (mwfInstance && currentSTDCost) {
			var calcstdCost = currentSTDCost * ((compEntity.getValue("CompSKU_StandardCost").getSimpleValue()) / 100);
			calcstdCost = calcstdCost.toFixed(4) * 1; // Round to 4 decimal places STIBO-2370              
			compSKU.getValue("Requested_Standard_Cost").setSimpleValue(calcstdCost);
		} else {
			var stdCost = node.getValue("Requested_Standard_Cost").getSimpleValue();
			var calcstdCost = stdCost * ((compEntity.getValue("CompSKU_StandardCost").getSimpleValue()) / 100);
			calcstdCost = calcstdCost.toFixed(4) * 1; // Round to 4 decimal places STIBO-2370
			compSKU.getValue("Requested_Standard_Cost").setSimpleValue(calcstdCost);
		}
		//STIBO- 2523 Support Team(August Release)               
	}
	if (compEntity.getID() == "DISPLAY") {
		compSKU.getValue("Description_Prefix").setLOVValueByID(descPrefix);
		compSKU.getValue("Product_Type").setLOVValueByID(productType);
		compSKU.getValue("Product_Sub_Type").setLOVValueByID(productSubType);
		compSKU.getValue("Inventory_Cat_RTL").setLOVValueByID(invCat);
		compSKU.getValue("Cat_Group_Name").setLOVValueByID(catGroup);
		compSKU.getValue("COGS_Account").setSimpleValue(compEntity.getValue("CompSKU_COGSAccount").getSimpleValue());
		compSKU.getValue("Sales_Account").setLOVValueByID(salesAccount);
		compSKU.getValue("Technology").setLOVValueByID(technology);
	}
	if (compEntity.getID() == "DEP") {
		compSKU.getValue("Item_Class").setLOVValueByID(itemClass);
	}
	setSerialGenerationVal(compSKU);
}
//Madhuri - Function moved to Item Commomn Derivation Library, can be deleted here 
function setSerialGenerationVal(obj) {
	//Variable Initialization
	const serializedList = ['COMPUTER', 'DEMO PHONE', 'DSL', 'ELECTRONIC', 'ENTMOB ELE', 'FEMTOCELL', 'HSIA', 'MSSNONSTCK',
		'PHONE', 'PREPAY', 'PREPAY SER', 'SECURITY', 'SIM', 'UVERSE', 'SATELLITE', 'ENTCPE', 'ENTTOOLS', '3PP ELECTR'
	];

	const orgCodeList = ['RLO', 'RL1', 'RL2', 'DSW', 'FLC', 'SAM'];
	if (obj.getObjectType().getID() == "Child_Org_Item") {
		var orgCode = obj.getValue('Organization_Code').getLOVValue();
		var productSubType = obj.getValue('Product_Sub_Type').getLOVValue();
		if (orgCode != null && productSubType != null) {
			orgCode = orgCode.getID() + "";
			productSubType = productSubType.getID().toLowerCase();
			if ((orgCodeList.includes(orgCode) == true) && (productSubType.contains('serial'))) {
				if (!productSubType.contains('non')) {
					obj.getValue('Serial_Generation').setLOVValueByID('5');
				}
			}
		}
	}
	if (obj.getObjectType().getID() == "Companion_SKU") {
		var userItemTypeRTL = obj.getValue('User_Item_Type_RTL').getLOVValue();
		var productSubType = obj.getValue('Product_Sub_Type').getLOVValue();
		if (userItemTypeRTL != null && productSubType != null) {
			userItemTypeRTL = userItemTypeRTL.getID() + "";
			productSubType = productSubType.getID().toLowerCase();
			if ((serializedList.includes(userItemTypeRTL) == true) && (productSubType.contains('serial'))) {
				if (!productSubType.contains('non')) {
					obj.getValue('Serial_Generation').setLOVValueByID('6');
				} else {
					obj.getValue('Serial_Generation').setLOVValueByID('1');
				}
			}
		}
	}
}

function childObjectsApprove(node, step) {
	children = node.getChildren().toArray();
	children.forEach(function(child) {
		if (child.getObjectType().getID() == "Child_Org_Item" || child.getObjectType().getID() == "Companion_SKU")
			child.approve();
		if (child.getObjectType().getID() == "Companion_SKU") {
			compSKUChildren = child.getChildren().toArray();
			compSKUChildren.forEach(function(compSKUchild) {
				compSKUchild.approve();
			});
		}
	});
}

function convertToUpperCase(text) {

	var desc = text.toUpperCase();
	if (desc.includes("<LT/>")) {
		desc = desc.replace("<LT/>", "<lt/>");
	}
	if (desc.includes("<GT/>")) {
		desc = desc.replace("<GT/>", "<gt/>");
	}
	return desc;
}
//Madhuri- moved to Item Common Derivation Library, can be removed here
function setRequestor(node, stepManager) {
	var reqVal = node.getValue("Requestor").getSimpleValue();
	if (reqVal == null) {
		var userID = stepManager.getCurrentUser().getID();
		if (userID && userID.contains('@'))
			userID = userID.substring(0, userID.indexOf('@'));
		node.getValue('Requestor').setSimpleValue(userID);
	}
}

function getchildOrgsfromLookup(lookUpTable, itemClass) {
	return lookUpTable.getLookupTableValue("LT_Additional_DC_Child_Orgs", itemClass);
}

function setSerialGenChildOrgCreation(obj) {
	const orgCodeList = ['RLO', 'RL1', 'RL2', 'DSW', 'FLC', 'SAM'];
	if (obj.getObjectType().getID() == "Child_Org_Item") {
		var orgCode = obj.getValue('Organization_Code').getLOVValue();
		var productSubType = obj.getValue('Product_Sub_Type').getLOVValue();
		if (orgCode != null && productSubType != null) {
			orgCode = orgCode.getID() + "";
			productSubType = productSubType.getID().toLowerCase();
			if ((orgCodeList.includes(orgCode) == true) && (productSubType.contains('serial'))) {
				if (!productSubType.contains('non')) {
					obj.getValue('Serial_Generation').setLOVValueByID('5');
				}
			}
		}
	}
}

// Stibo- 3357 Prod Support Team Mar 15 Release
function setGtinUPC(node) {

	var UPC = node.getValue("UPC").getSimpleValue();
	var errorMessage = "";
	if (UPC) {
		try {
			node.getValue("UPC_GTIN").setSimpleValue(UPC);
		} catch (error) {
			errorMessage = "Please enter valid UPC number or clear off the value for System Generated UPC";
		}		
	}
	return errorMessage;
}
// Stibo- 3357 Prod Support Team Mar 15 Release
// Stibo- 3647 Prod Support Team June Release
function deleteKey(node, step, objectType) {
  if (objectType == "Child_Org_Item") {
    var childorgkey = node.getValue("DM_Child_Org_Key").getSimpleValue();
    var childOrgIdentity = node.getValue("Child_Org_Identity").getSimpleValue();
    if (childorgkey) {
      step.getKeyHome().updateUniqueKeyValues2({
        "DM_Child_Org_Key": String("")
      }, node);
    }
    if (childOrgIdentity) {
      step.getKeyHome().updateUniqueKeyValues2({
        "Child_Org_Identity": String("")
      }, node);
    }
  } else if (objectType == "Companion_SKU") { 
    var companionskuIdentity = node.getValue("Comp_SKU_Identity").getSimpleValue();
    if (companionskuIdentity) {
      step.getKeyHome().updateUniqueKeyValues2({
        "Comp_SKU_Identity": String("")
      }, node);
    }
  }
}

// Stibo- 3647 Prod Support Team June Release
/*===== business library exports - this part will not be imported to STEP =====*/
exports.getCurrentDate = getCurrentDate
exports.getCurrentDateTimestamp = getCurrentDateTimestamp
exports.setAssignee = setAssignee
exports.removeJunkCharsLongDescription = removeJunkCharsLongDescription
exports.clearUserDefinedItemDescription = clearUserDefinedItemDescription
exports.setChildKey = setChildKey
exports.setNodeName = setNodeName
exports.createCompanionChildOrgs = createCompanionChildOrgs
exports.checkChildOrg = checkChildOrg
exports.createDataContainers = createDataContainers
exports.createCompanionSKUs = createCompanionSKUs
exports.checkCompSKU = checkCompSKU
exports.setCompSKUCoreAttrs = setCompSKUCoreAttrs
exports.setCompSKUVariableAttrs = setCompSKUVariableAttrs
exports.setSerialGenerationVal = setSerialGenerationVal
exports.childObjectsApprove = childObjectsApprove
exports.convertToUpperCase = convertToUpperCase
exports.setRequestor = setRequestor
exports.getchildOrgsfromLookup = getchildOrgsfromLookup
exports.setSerialGenChildOrgCreation = setSerialGenChildOrgCreation
exports.setGtinUPC = setGtinUPC
exports.deleteKey = deleteKey