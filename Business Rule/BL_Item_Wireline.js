/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Item_Wireline",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Derivation_Libraries" ],
  "name" : "Item Wireline Derivation Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonLib"
  }, {
    "libraryId" : "BL_Item_Common_Validation",
    "libraryAlias" : "commonValidationLib"
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
function setProductType(node) {
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	if (materialItemType && materialItemType != "Product Family Parent") {
		if (materialItemType == "Cable") {
			materialItemType = materialItemType.toUpperCase()
			node.getValue("Product_Type").setLOVValueByID(materialItemType);
		} else if (materialItemType == "Minor Material") {
			node.getValue("Product_Type").setLOVValueByID("MINOR MATL GENERAL");
		} else {
			node.getValue("Product_Type").setLOVValueByID(materialItemType);
		}
	}
}

function setTechStaff(node, stepManager) {
	var techStaff = node.getValue("Tech_Staff").getSimpleValue();
	if (!techStaff) {
		var user = stepManager.getCurrentUser().getID().toUpperCase() + "";
		if (user.includes("@")) {
			user = user.match(/^([^@]*)@/)[1];
		}
		node.getValue("Tech_Staff").setSimpleValue(user);
	}
}

function setMicCoe(node) {
	var micCoeWRLN = node.getValue("MIC_COE_WRLN").getID();
	if (micCoeWRLN) {
		node.getValue("Mic_Coe").setLOVValueByID(micCoeWRLN);
	}
}

function setE911Category(node) {
	var inventoryCat = node.getValue("Inventory_Cat").getSimpleValue();
	if (inventoryCat == "E1.911") {
		node.getValue("E911_Cat").setSimpleValue("E911");
	}
}

function setItemCriticalityIndicator(node) {
	var materialItemType = node.getValue("Material_Item_Type_Web").getSimpleValue();
	var criticalityIndicator = node.getValue("Item_Criticality_Indicator").getSimpleValue();
	if (materialItemType && materialItemType == "Plug-In" && !criticalityIndicator) {
		node.getValue("Item_Criticality_Indicator").setLOVValueByID("U");
	} else if(materialItemType && materialItemType != "Plug-In")  {
		node.getValue("Item_Criticality_Indicator").setLOVValueByID("");
	}
}

function setPlanningRoute(node) {
	const routes = ["Plug-In", "Minor Material", "Cable"];
	var materialTypeId = node.getValue("Material_Item_Type_Web").getID();
	if (routes.indexOf(String(materialTypeId)) > -1) {
		node.getValue("Planning_Route").setSimpleValue(materialTypeId);
	}
}

function setExternalAppDownloadCode(node) {
	const materialItemTypeList = ["Minor Material", "Cable", "Toolsets"];
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	if (materialItemTypeList.indexOf(String(materialItemType)) > -1) {
		node.getValue("Ext_App_Dwnld_Code").setLOVValueByID("U");
	} else {
		node.getValue("Ext_App_Dwnld_Code").setLOVValueByID("X");
	}
}

function clearSafetyIndicatorAndOrmdClass(node) {
	var itemStatus = node.getValue("Item_Status_WRLN").getID();
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	if (materialItemType && itemStatus && materialItemType != "Minor Material" && itemStatus != "Active S") {
		node.getValue("Safety_Indicator").setLOVValueByID(null);
		node.getValue("ORMD_Class").setLOVValueByID(null);
	}
}

function setOALCTrk(node) {
	var BOMType = node.getValue("NTW_BOM_Type_WRLN").getID();
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	var price = node.getValue("List_Price").getSimpleValue();
	var HECI = node.getValue("HECI").getSimpleValue();
	if (BOMType == "PIE KIT") {
		node.getValue("WTT_OALC_Track").setLOVValueByID("Y");
	} else if (materialItemType == "Plug-In" || (materialItemType == "Hardwired" && HECI) || (materialItemType == "Hardwired" && !HECI && price > 2000)) {
		node.getValue("WTT_OALC_Track").setLOVValueByID("Y");
	} else {
		node.getValue("WTT_OALC_Track").setLOVValueByID("N");
	}
}

function setBarCodeReceiptReq(node) {
	//Derive 'Bar Code Receipt Required'
	var wttOALCTrack = node.getValue("WTT_OALC_Track").getID();
	var businessGrp = node.getValue("Business_Group").getID();
	var DbossTrackByQty = node.getValue("Dboss_Track_by_Qty").getID();
	if (businessGrp == "DBOSS") {		
		if (wttOALCTrack == "N" && DbossTrackByQty == "Y") node.getValue("Bar_Code_Receipt_Req").setLOVValueByID("Z");
		if (wttOALCTrack == "N" && (DbossTrackByQty == "N" || !DbossTrackByQty)) node.getValue("Bar_Code_Receipt_Req").setLOVValueByID("N");
		if (wttOALCTrack == "Y" && DbossTrackByQty == "Y") node.getValue("Bar_Code_Receipt_Req").setLOVValueByID("Z");
		if (wttOALCTrack == "Y" && (DbossTrackByQty == "N" || !DbossTrackByQty)) {			
			node.getValue("Bar_Code_Receipt_Req").setLOVValueByID("Y");
		}
	} else {
		if (!commonValidationLib.isItemNumberExist(node)) {
			if (wttOALCTrack == "Y") {
				node.getValue("Bar_Code_Receipt_Req").setLOVValueByID("N");
			} else {
				node.getValue("Bar_Code_Receipt_Req").setLOVValueByID("Z");
			}
		}
	}
}

function getMicCoe(node) {
  var price = node.getValue("List_Price").getSimpleValue();
  var oalcTrack = node.getValue("WTT_OALC_Track").getID();
  var businessGroup = node.getValue("Business_Group").getID();
  var materialItemType = node.getValue("Material_Item_Type_Web").getID();
  var bomType = node.getValue("NTW_BOM_Type_WRLN").getID();
  if (businessGroup == "NONE") {
    if (materialItemType == "Product Family Parent" || bomType == "LOCAL EXPLOSION" || bomType == "NON Stock" || bomType == "STOCK_KIT") {
      node.getValue("MIC_COE_WRLN").setSimpleValue("COEOTHER");
    } else if (oalcTrack == "Y" && price) {
      deriveMicCoe(node, price);
    }
  }
  if (businessGroup == "DBOSS" && materialItemType == "Billing Category Item") {
    node.getValue("MIC_COE_WRLN").setLOVValueByID("SATOTHER");
  }
  if (businessGroup == "NONE" && materialItemType == "Billing Category Item") {
    node.getValue("MIC_COE_WRLN").setLOVValueByID("COEOTHER");
  }
}

function deriveMicCoe(node, price) {
	try {
		var mic = ""
		if (price > 0 && price <= 1000) mic = "COE1K"
		else if (price > 1000 && price <= 2000) mic = "COE2K"
		else if (price > 2000 && price <= 5000) mic = "COE5K"
		else if (price > 5000 && price <= 10000) mic = "COE10K"
		else if (price > 10000 && price <= 15000) mic = "COE15K"
		else if (price > 15000 && price <= 30000) mic = "COE30K"
		else if (price > 30000 && price <= 50000) mic = "COE50K"
		else if (price > 50000 && price <= 100000) mic = "COE100K"
		else if (price > 100000 && price <= 200000) mic = "COE200K"
		else if (price > 200000 && price <= 400000) mic = "COE400K"
		else if (price > 400000) mic = "COE1M"
		node.getValue("MIC_COE_WRLN").setSimpleValue(mic);
	} catch (e) {
		throw (e);
	}
}

function deriveAssetandSerializedIndicator(node) {
	var businessGrp = node.getValue("Business_Group").getID();
	var DbossTrackByQty = node.getValue("Dboss_Track_by_Qty").getID();
	var wttFinTrackable = node.getValue("WTT_Financially_Trackable").getID();
	// setAssetTransaction
	if (businessGrp == "DBOSS" && wttFinTrackable && wttFinTrackable == "Y") {
		node.getValue("Send_Asset_Txn_To_Finance").setLOVValueByID("Y");
	} else {
		node.getValue("Send_Asset_Txn_To_Finance").setLOVValueByID("N");
	}
	//Derive 'Serialized Indicator'
	if (businessGrp == "DBOSS" && DbossTrackByQty && DbossTrackByQty == "Y") {
		node.getValue("Serialized_Indicator").setLOVValueByID("N");
	} else {
		node.getValue("Serialized_Indicator").setLOVValueByID("Y");
	}
}

function setAssetTransaction(node) {
	var businessGrp = node.getValue("Business_Group").getID();
	var wttFinTrackable = node.getValue("WTT_Financially_Trackable").getID();
	if (businessGrp == "DBOSS" && wttFinTrackable) {
		if (wttFinTrackable == "Y") node.getValue("Send_Asset_Txn_To_Finance").setLOVValueByID("Y");
		else node.getValue("Send_Asset_Txn_To_Finance").setLOVValueByID("N");
	}
}

function setBarCode(node) {
	var businessGroup = node.getValue("Business_Group").getID();
	var dbossTrackByQuantity = node.getValue("Dboss_Track_by_Qty").getID();
	var wttOalcTrack = node.getValue("WTT_OALC_Track").getID();
	var barCodeReceiptReq = node.getValue("Bar_Code_Receipt_Req");
	if (businessGroup == "DBOSS") {
		if (wttOalcTrack == "N" && dbossTrackByQuantity == "Y") barCodeReceiptReq.setLOVValueByID("Z");
		if (wttOalcTrack == "N" && (dbossTrackByQuantity == "N" || !dbossTrackByQuantity)) barCodeReceiptReq.setLOVValueByID("N");
		if (wttOalcTrack == "Y" && dbossTrackByQuantity == "Y") barCodeReceiptReq.setLOVValueByID("Z");
		if (wttOalcTrack == "Y" && (dbossTrackByQuantity == "N" || !dbossTrackByQuantity)) barCodeReceiptReq.setLOVValueByID("Y");
	} else {
		if (!commonValidationLib.isItemNumberExist(node) && wttOalcTrack == "Y") {
			barCodeReceiptReq.setLOVValueByID("N");
		} else {
			barCodeReceiptReq.setLOVValueByID("Z");
		}
	}
}

function setExpenditureCode(node) {
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	if (materialItemType && materialItemType == "RTU Capital") {
		node.getValue("Expenditure_Code").setLOVValueByID("61J");
	} else if (materialItemType && materialItemType == "RTU Expense") {
		node.getValue("Expenditure_Code").setLOVValueByID("61M");
	} else {
		node.getValue("Expenditure_Code").setLOVValueByID("520");
	}
}

function setRegionalItemFlag(node) {
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	const exemptTypes = ["Plug-In", "Minor Material", "Product Family Parent", "Cable"];
	if (exemptTypes.indexOf(String(materialItemType)) > -1) {
		node.getValue("Regional_Item_Flag").setSimpleValue(null);
	} else {
		node.getValue("Regional_Item_Flag").setLOVValueByID("N");
	}
}

function setPurchasingCat(node, stepManager) {
	var inventoryCatWRLN = node.getValue("Inventory_Cat_WRLN").getID();
	if (inventoryCatWRLN) {
		var invenCatSplit = inventoryCatWRLN.split("\\.");
		var afterDecimalPoint = invenCatSplit[1];
		var length = afterDecimalPoint.length();
		if (length == 1) {
			afterDecimalPoint = afterDecimalPoint + "00";
		}
		if (length == 2) {
			afterDecimalPoint = afterDecimalPoint + "0";
		}
		purchCat = "NTW.9999." + invenCatSplit[0] + "." + invenCatSplit[0] + afterDecimalPoint
		purchCatLOV = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_Purchasing_Category_WRLN")
		if (purchCatLOV.getListOfValuesValueByID(purchCat)) node.getValue("Purchasing_Cat_WRLN").setSimpleValue("NTW.9999." + invenCatSplit[0] + "." + invenCatSplit[0] + afterDecimalPoint);
		else {
			purchCatLOV.createListOfValuesValue(purchCat, null, purchCat)
			node.getValue("Purchasing_Cat_WRLN").setSimpleValue("NTW.9999." + invenCatSplit[0] + "." + invenCatSplit[0] + afterDecimalPoint);
		}
	}
}

function setUserDefinedItemNumber(node, stepManager) {
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	var heci = node.getValue("HECI").getSimpleValue();
	var userDefinedItemNumberEntity = stepManager.getEntityHome().getEntityByID("User_Defined_Item_Num");
	var isMaterialTypeValid = materialItemType && materialItemType != "Minor Material" && materialItemType != "Cable";
	var isBillingCategoryItem = materialItemType && materialItemType == "Billing Category Item";
	if (heci) {
		node.getValue("User_Defined_Item_Num").setSimpleValue(heci);
	} else if (isBillingCategoryItem) {
		var billingItemNum = userDefinedItemNumberEntity.getValue("BillingCat_ItemNum_Counter").getSimpleValue();
		node.getValue("User_Defined_Item_Num").setSimpleValue(billingItemNum);
		userDefinedItemNumberEntity.getValue("BillingCat_ItemNum_Counter").setSimpleValue(parseInt(billingItemNum) + 1);
	} else if (isMaterialTypeValid) {
		var itemNum = userDefinedItemNumberEntity.getValue("UserDef_ItemNum_Counter").getSimpleValue();
		node.getValue("User_Defined_Item_Num").setSimpleValue(itemNum);
		userDefinedItemNumberEntity.getValue("UserDef_ItemNum_Counter").setSimpleValue(parseInt(itemNum) + 1);
	} else {
		node.getValue("User_Defined_Item_Num").setSimpleValue("");
	}
}

function clearRecoveryTypeAndHandlingClass(node) {
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	if (materialItemType && materialItemType != "Plug-In") {
		node.getValue("Recovery_Type").setLOVValueByID(null);
		node.getValue("Handling_Class").setLOVValueByID(null);
	}
}

function setCapitalTool(node) {
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	var patternAccount = node.getValue("Pattern_Account_WRLN").getID();
	if (materialItemType && patternAccount && materialItemType == "Minor Material" && patternAccount == "T4") {
		node.getValue("Capital_Tool").setLOVValueByID("Y");
	} else if (!node.getValue("Capital_Tool").getID()) {
		node.getValue("Capital_Tool").setLOVValueByID("N");
	}
}

function setItemStatus(node) {
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	var planningSystem = node.getValue("Planning_System").getID();
	if ((materialItemType == "Minor Material" || materialItemType == "Cable") && planningSystem == "JDA") node.getValue("Item_Status_WRLN").setLOVValueByID("Active S");
}

function setUOMandPatternAccount(node) {
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	if (materialItemType == "Billing Category Item") {
		node.getValue("Primary_UOM_ValidList").setLOVValueByID("EA - Each");
		node.getValue("Pattern_Account_WRLN").setLOVValueByID("C7");
	}
}

function setASEStatus(node) {
	var status = node.getValue("Item_Status_WRLN").getSimpleValue();
	var children = node.queryChildren();
	var statusMap = {
		"Active S": "Active NI",
		"Active NS": "Active NI",
		"Obs S": "Obs NI",
		"Obs NS": "Obs NI",
		"Phase S": "Phase NI",
		"Phase NS": "Phase NI",
		"Replaced": "Replaced"
	};
	children.forEach(function(child) {
		var isChildOrgItem = child.getObjectType().getID() == "Child_Org_Item";
		var isASE = child.getValue("Organization_Code").getID() == "ASE";
		if (isChildOrgItem && isASE) {
			var mappedStatus = statusMap[status];
			if (mappedStatus) {
				child.getValue("Item_Status").setSimpleValue(mappedStatus);
			}
		}
		return true;
	});
}

function setRestrictedtoExternalSystem(node) {
	var patternAccount = node.getValue("Pattern_Account_WRLN").getID();
	if (patternAccount) {
		var patternID = String(patternAccount); //use this 
		// var patternID = patternAccount+"";     // or use this
		const restrictedIDs = ["P3", "P4", "P5", "P9", "T4"];
		if (restrictedIDs.includes(patternID)) {
			node.getValue("Restricted_to_External_System").setLOVValueByID("VIPS AND CEEOT");
		}
	}
}

function setSerializedIndicator(node) {
	var businessGroup = node.getValue("Business_Group").getID();
	var dbossTrackByQuantity = node.getValue("Dboss_Track_by_Qty").getID();
	if (businessGroup == "DBOSS" && dbossTrackByQuantity) {
		if (dbossTrackByQuantity == "Y") {
			node.getValue("Serialized_Indicator").setLOVValueByID("N");
		} else {
			node.getValue("Serialized_Indicator").setLOVValueByID("Y");
		}
	}
}

function clearStockItemGroup(node) {
	var itemStatus = node.getValue("Item_Status_WRLN").getID();
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	if (materialItemType && itemStatus) {
		if (materialItemType != "Minor Material" && materialItemType != "Cable") node.getValue("Stock_Item_Group").setLOVValueByID(null);
		else {
			var counter = 0;
			children = node.queryChildren();
			children.forEach(function(child) {
				if (child.getObjectType().getID() == "Child_Org_Item") {
					if (child.getValue("Item_Status_WRLN").getID() != "Active S") counter++;
				}
				return true;
			});
			if (counter > 0) node.getValue("Stock_Item_Group").setLOVValueByID(null);
		}
	}
}

function setWirelineItemDescription(node) {
	var businessGroup = node.getValue("Business_Group").getID();
	var longDescription = node.getValue("Long_Description").getSimpleValue();
	var userDefItemDesc = node.getValue("User_Defined_Item_Description").getSimpleValue();
	if (longDescription && businessGroup && businessGroup == "DBOSS") { //  Business_Group --> DTV 
		node.getValue("Item_Description").setSimpleValue(longDescription);
	} else if (userDefItemDesc && businessGroup && businessGroup == "NONE") { // Business_Group --> Wireline
		node.getValue("Item_Description").setSimpleValue(userDefItemDesc);
	}
}

function getApprWSBomType(node, stepManager) {
	var apprWSBomType = "";
	stepManager.executeInWorkspace("Approved", function(approvedManager) {
		var approveWSObj = approvedManager.getObjectFromOtherManager(node);
		if (approveWSObj) {
			apprWSBomType = approveWSObj.getValue('NTW_BOM_Type_WRLN').getID();
		}
	});
	return apprWSBomType;
}

function setWirelineDefaultAttributes(node, step) { //tested
	commonLib.setDefaultValueIfEmpty(node, "Organization_Code", "LOV", "MST");
	commonLib.setDefaultValueIfEmpty(node, "Catalog_Indicator", "LOV", "Y");
	var approver = step.getEntityHome().getEntityByID("CCR_Approver_3").getValue("Approver_3").getValue();
	commonLib.setDefaultValueIfEmpty(node, "CCR_Approver_3", "Simple", approver);
	commonLib.setDefaultValueIfEmpty(node, "Product_Class", "LOV", "NETWORK WIRELINE");
	commonLib.setDefaultValueIfEmpty(node, "Product_Sub_Type", "LOV", "NON SERIALIZED");
	commonLib.setDefaultValueIfEmpty(node, "Cat_Group_Name", "LOV", "ATT_CATALOG");
	commonLib.setDefaultValueIfEmpty(node, "COGS_Account", "LOV", "1001.9899.0000.000000.0000.0000");
	commonLib.setDefaultValueIfEmpty(node, "Sales_Account", "LOV", "1002.9899.0000.000000.0000.0000");
	commonLib.setDefaultValueIfEmpty(node, "Business_Owner", "LOV", "WIRELINE");
	commonLib.setDefaultValueIfEmpty(node, "Send_Item_Info", "LOV", "Y");
	commonLib.setDefaultValueIfEmpty(node, "iProc_Enabled", "LOV", "Y");
	commonLib.setDefaultValueIfEmpty(node, "Expense_Account_Org", "LOV", "9963.2269.0000.000000.9999.0000");
	//commonLib.setDefaultValueIfEmpty(node, "Costing_Enabled", "LOV", "Y");
	//commonLib.setDefaultValueIfEmpty(node, "Inventory_Asset_Value", "LOV", "Y");
	//commonLib.setDefaultValueIfEmpty(node, "Inventory_Item", "LOV", "Y");
	commonLib.setDefaultValueIfEmpty(node, "Reservable", "LOV", "1");
	commonLib.setDefaultValueIfEmpty(node, "Serial_Generation", "LOV", "1");
	//commonLib.setDefaultValueIfEmpty(node, "Returnable", "LOV", "Y");
	//commonLib.setDefaultValueIfEmpty(node, "Shippable", "LOV", "Y");
	//commonLib.setDefaultValueIfEmpty(node, "OM_Transaction_Enabled", "LOV", "Y");
	commonLib.setDefaultValueIfEmpty(node, "CA_Prop_65_Toxicity_Type", "LOV", "ND");
	commonLib.setDefaultValueIfEmpty(node, "CA_Manufacturer_Package_Warning", "LOV", "NA");
	commonLib.setDefaultValueIfEmpty(node, "Business_Region", "LOV", "SOUTHEAST_MM");
	commonLib.setDefaultValueIfEmpty(node, "Catalog_Indicator", "LOV", "Y");
	commonLib.setDefaultValueIfEmpty(node, "Transship_Allowable", "LOV", "N");
	commonLib.setDefaultValueIfEmpty(node, "Sourcing_Notify", "LOV", "Y"); // @author-Anudeep
}

function setDefaultRecoveryType(node) {
	if (!node.getValue("Recovery_Type").getID() && node.getValue("Material_Item_Type_Web").getSimpleValue() == "Plug-In") {
		commonLib.setDefaultValueIfEmpty(node, "Recovery_Type", "LOV", "3-5 DAY");
	}
}

function setDefaultHandlingClass(node) {
	if (!node.getValue("Handling_Class").getID() && node.getValue("Material_Item_Type_Web").getSimpleValue() == "Plug-In") {
		commonLib.setDefaultValueIfEmpty(node, "Handling_Class", "LOV", "ECONOMY CLASS");
	}
}

function validateDuplicateManufacturingPartNumber(node, stepManager, query) {
	var errorMessage = "";
	var currentNodeID = node.getID();
	var mfgPartNoAttribute = stepManager.getAttributeHome().getAttributeByID("Mfg_Part_No");
	var businessGroupAttribute = stepManager.getAttributeHome().getAttributeByID("Business_Group");
	var mfgPartNumber = node.getValue("Mfg_Part_No").getSimpleValue();
	var currentBusinessGroup = node.getValue("Business_Group").getID();
	var heciValue = node.getValue("HECI").getSimpleValue();
	if (mfgPartNumber && currentBusinessGroup == "NONE" && !heciValue) {
		var Conditions = com.stibo.query.condition.Conditions;
		var querySpec = query.queryFor(com.stibo.core.domain.Product).where(Conditions.valueOf(mfgPartNoAttribute).eq(mfgPartNumber).and(Conditions.valueOf(businessGroupAttribute).eq("Wireline")));
		var resultSet = querySpec.execute();
		var matchingProducts = new java.util.ArrayList();
		var hasDuplicate = false;
		resultSet.forEach(function(result) {
			matchingProducts.add(result);
			return true;
		});
		for (var i = 0; i < matchingProducts.size(); i++) {
			var product = matchingProducts.get(i);
			var productObjectType = product.getParent().getObjectType().getID();
			var productID = product.getID();
			if (productObjectType != "CancelledType" && productID != currentNodeID) {
				hasDuplicate = true;
				break;
			}
		}
		if (hasDuplicate) {
			var duplicateDetails = node.getValue("Duplicate_MPN_Details").getSimpleValue();
			var duplicateReason = node.getValue("Duplicate_MPN_Reason").getSimpleValue();
			if (!duplicateDetails || !duplicateReason) {
				errorMessage = "Duplicate MSN Details and Duplicate Reason are mandatory when Mfg Part No is duplicate.";
			}
		}
	}
	return errorMessage;
}
/**
 * @author - John
 * set Wireline ESI Attributes default values
 * @author - Pradeep PP588A - 08222025
 * added 7 more columns - ATO_Forecast_Control, ATP_Components_Flag, ATP_Flag, Create_Supply_Flag, Planning_Make_Buy_Code, Preprocessing_Lead_Time, Rounding_Control_Type
 */
function setESIAttributesValues(node, wirelineESILookupTable) {
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	var itemStatus = node.getValue("Item_Status_WRLN").getID();

	if (materialItemType && itemStatus) {
		var wrlnLookupResult = wirelineESILookupTable.getLookupTableValue("LT_Wireline_ESI_Attributes", materialItemType + "|" + itemStatus);
		if (wrlnLookupResult) {
			wrlnLookupResult = wrlnLookupResult.split("\\|");
			if (node.getObjectType().getID() == "Item") {
				node.getValue("Template_Name").setLOVValueByID(wrlnLookupResult[0]);
				node.getValue("Item_Class").setLOVValueByID(wrlnLookupResult[1]);
			}
			var itemClass = getLookupTableValue(wrlnLookupResult[1]);
			if (itemClass) {

			}
			var costingEnabled = getLookupTableValue(wrlnLookupResult[2]);
			if (costingEnabled) {
				node.getValue("Costing_Enabled").setLOVValueByID(costingEnabled);
			}
			var customerOrderFlag = getLookupTableValue(wrlnLookupResult[3]);
			if (customerOrderFlag) {
				node.getValue("Customer_Order_Flag").setLOVValueByID(customerOrderFlag);
			}
			var engineeredItemFlag = getLookupTableValue(wrlnLookupResult[4]);
			if (engineeredItemFlag) {
				node.getValue("Engineered_Item_Flag").setLOVValueByID(engineeredItemFlag);
			}
			var internalOrderFlag = getLookupTableValue(wrlnLookupResult[5]);
			if (internalOrderFlag) {
				node.getValue("Internal_Order_Flag").setLOVValueByID(internalOrderFlag);
			}
			var inventoryAssetValue = getLookupTableValue(wrlnLookupResult[6]);
			if (inventoryAssetValue) {
				node.getValue("Inventory_Asset_Value").setLOVValueByID(inventoryAssetValue);
			}
			var inventoryItem = getLookupTableValue(wrlnLookupResult[7]);
			if (inventoryItem) {
				node.getValue("Inventory_Item").setLOVValueByID(inventoryItem);
			}
			var inventoryPlanningCode = getLookupTableValue(wrlnLookupResult[8]);
			if (inventoryPlanningCode) {
				node.getValue("Inventory_Planning_Code").setLOVValueByID(inventoryPlanningCode);
			}
			var invoiceableItemFlag = getLookupTableValue(wrlnLookupResult[9]);
			if (invoiceableItemFlag) {
				node.getValue("Invoiceable_Item_Flag").setLOVValueByID(invoiceableItemFlag);
			}
			var matchApprovalLevel = getLookupTableValue(wrlnLookupResult[10]);
			if (matchApprovalLevel) {
				node.getValue("Match_Approval_Level").setLOVValueByID(matchApprovalLevel);
			}
			var minMaxQtyMaximum = getLookupTableValue(wrlnLookupResult[11]);
			if (minMaxQtyMaximum) {
				node.getValue("Min_Max_Qty_Maximum").setSimpleValue(minMaxQtyMaximum);
			}
			var minMaxQtyMinimum = getLookupTableValue(wrlnLookupResult[12]);
			if (minMaxQtyMinimum) {
				node.getValue("Min_Max_Qty_Minimum").setSimpleValue(minMaxQtyMinimum);
			}
			var MRPPlanningCode = getLookupTableValue(wrlnLookupResult[13]);
			if (MRPPlanningCode) {
				node.getValue("MPS_MRP_Planning_Method").setLOVValueByID(MRPPlanningCode);
			}
			var purchasingItemFlag = getLookupTableValue(wrlnLookupResult[15]);
			if (purchasingItemFlag) {
				node.getValue("Purchasing_Item_Flag").setLOVValueByID(purchasingItemFlag);
			}
			var receiveCloseTolerance = getLookupTableValue(wrlnLookupResult[16]);
			if (receiveCloseTolerance) {
				node.getValue("Receive_Close_Tolerance").setSimpleValue(receiveCloseTolerance);
			}
			var returnable = getLookupTableValue(wrlnLookupResult[17]);
			if (returnable) {
				node.getValue("Returnable").setLOVValueByID(returnable);
			}
			var safetyStockPlanningMethod = getLookupTableValue(wrlnLookupResult[18]);
			if (safetyStockPlanningMethod) {
				node.getValue("Safety_Stock_Planning_Method").setLOVValueByID(safetyStockPlanningMethod);
			}
			var shippable = getLookupTableValue(wrlnLookupResult[19]);
			if (shippable) {
				node.getValue("Shippable").setLOVValueByID(shippable);
			}
			var omTransactionEnabled = getLookupTableValue(wrlnLookupResult[20]);
			if (omTransactionEnabled) {
				node.getValue("OM_Transaction_Enabled").setLOVValueByID(omTransactionEnabled);
			}
			var atoForecastControl = getLookupTableValue(wrlnLookupResult[21]);
			if (atoForecastControl) {
				node.getValue("ATO_Forecast_Control").setLOVValueByID(atoForecastControl);
			}
			var atpComponentsFlag = getLookupTableValue(wrlnLookupResult[22]);
			if (atpComponentsFlag) {
				node.getValue("ATP_Components_Flag").setLOVValueByID(atpComponentsFlag);
			}
			var atpFlag = getLookupTableValue(wrlnLookupResult[23]);
			if (atpFlag) {
				node.getValue("ATP_Flag").setLOVValueByID(atpFlag);
			}
			var createSupplyFlag = getLookupTableValue(wrlnLookupResult[24]);
			if (createSupplyFlag) {
				node.getValue("Create_Supply_Flag").setLOVValueByID(createSupplyFlag);
			}
			var planningMakeBuyCode = getLookupTableValue(wrlnLookupResult[25]);
			if (planningMakeBuyCode) {
				node.getValue("Planning_Make_Buy_Code").setLOVValueByID(planningMakeBuyCode);
			}
			var preprocessingLeadTime = getLookupTableValue(wrlnLookupResult[26]);
			if (preprocessingLeadTime) {
				node.getValue("Preprocessing_Lead_Time").setSimpleValue(preprocessingLeadTime);
			}
			var roundingControlType = getLookupTableValue(wrlnLookupResult[27]);
			if (roundingControlType) {
				node.getValue("Rounding_Control_Type").setLOVValueByID(roundingControlType);
			}
			if (node.getObjectType().getID() == "Item") {
				var MRPSafetyStockCode = getLookupTableValue(wrlnLookupResult[14]);
				if (MRPSafetyStockCode) {
					node.getValue("MRP_Safety_Stock_Code").setLOVValueByID(MRPSafetyStockCode);
				}
			}
		}
	}
}

function getLookupTableValue(wrlnLookupResult) {
	var attributeValue = "";
	try {
		attributeValue = wrlnLookupResult;
		attributeValue = attributeValue.split("\\:");
		attributeValue = attributeValue[1];
		if (attributeValue) {
			return attributeValue;
		} else {
			attributeValue = "";
		}
	} catch (exception) {}
	return attributeValue;
}

// New rules........Item Processing---Aman
function setExlTpiFlag(node) {
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	if (materialItemType == "Minor Material" || materialItemType == "Cable") {
		node.getValue("EXL_TPI_FLG").setLOVValueByID("Y");
	}
}

function setPatternAccount(node) {
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	var barCodeReceiptReq = node.getValue("Bar_Code_Receipt_Req").getID();	
	if (materialItemType == "Plug-In" || (barCodeReceiptReq == "Y" && materialItemType == "Hardwired")) {
		log.info("Loop Test");		
		node.getValue("Pattern_Account_WRLN").setLOVValueByID("C7");
	}
}
 
function setWirelineSourcingNotification(node, stepManager) {
	var objectType = node.getObjectType().getID();
	if (objectType == "Item" || objectType == "Child_Org_Item") {
		var bomType = (objectType == "Item") ? node.getValue("NTW_BOM_Type_WRLN").getID() : node.getParent().getValue("NTW_BOM_Type_WRLN").getID();
		if (bomType != "NON Stock") {
			if (!commonValidationLib.isItemNumberExist(node)) {
				setDefaultSourcingNotifyOnboarding(node);
			} else {
				commonLib.setSourcingNotify(node, stepManager);
			}
		} else {
			node.getValue("Sourcing_Notify").setSimpleValue("");
			node.getValue("Sourcing_Comments").setSimpleValue("");
		}
	}
}

function setDefaultSourcingNotifyOnboarding(node) {
	if (!node.getValue("Sourcing_Notify").getID()) {
		node.getValue("Sourcing_Notify").setLOVValueByID("Y");
	}
}


function setJDAAttributes(node) {
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	var itemStatus = node.getValue("Item_Status_WRLN").getID();
	if (materialItemType == "Minor Material" && (itemStatus == "Active S" ||itemStatus =="Obs S"||itemStatus =="Phase S") && node.getValue("Planning_System").getID() == "JDA") {
		node.getValue("MPS_MRP_Planning_Method").setLOVValueByID("6");
		node.getValue("Buyer").setLOVValueByID(node.getValue("PLANNER_ATTUID").getID());
	     node.getValue("Requestor").setSimpleValue(node.getValue("PLANNER_ATTUID").getID());
	}
}
function setChildOrgsListPrice(node, stepManager, lookUpTable) {

	var listPriceCheck = commonLib.isAttributeValueChanged(node, stepManager, "List_Price");
	if (listPriceCheck) {
		var children = node.queryChildren();
		children.forEach(function(child) {
			if (child.getObjectType().getID() == "Child_Org_Item") {
				revertListPrice(node, child, stepManager, lookUpTable)
			}
			return true;
		});
	}
}

function revertListPrice(node, childOrgItem, stepManager, lookUpTable) {

	var materialItemType = childOrgItem.getValue("Material_Item_Type").getID();
	var orgCode = childOrgItem.getValue("Organization_Code").getID();
	var lookUpTableResult = "";
	lookUpTableResult = lookUpTable.getLookupTableValue("LT_ChildOrg_UI_ReadOnly_Attributes", "List_Price|" + orgCode);
	if (lookUpTableResult) {
		if (!lookUpTableResult.includes(materialItemType)) {
			var ChildOrgListPriceCheck = commonLib.isAttributeValueChanged(childOrgItem, stepManager, "List_Price");
			if (ChildOrgListPriceCheck) {
				var approvedListPrice = commonValidationLib.getApprovedWSAttributeValue(childOrgItem, stepManager, "List_Price");
				childOrgItem.getValue("List_Price").setSimpleValue(approvedListPrice);
			}
		}
	}
}

/**
 * @author - AW304F
 * Rule Name: Set Planning Feature for Wireline LOB
 * Relex Retrofitting
 */

function setPlanningFeature(node) {

	var wirelineFeatures = node.getValue("WRLN_Features").getSimpleValue();
	var materialItemType = node.getValue("Material_Item_Type").getID();
	var planningSystem = node.getValue("Planning_System").getSimpleValue();
	
	if (wirelineFeatures!= null && materialItemType == "Minor Material" && planningSystem != null) {
		node.getValue("Planning_Features").setSimpleValue(wirelineFeatures);
	}
}

/**
 * @author - AW304F
 * Rule Name: Set Planning Tier for Wireline LOB
 * Relex Retrofitting
 */



function setPlanningTier(node) {
	
	var planningSystem = node.getValue("Planning_System").getSimpleValue();
	var materialItemType = node.getValue("Material_Item_Type").getID();
	if (materialItemType == "Minor Material" && planningSystem != null) {
		node.getValue("Planning_Tier").setLOVValueByID("MINOR MATERIAL");
	}
}

/**
 * @author - AW304F
 * Rule Name: Set Units Per Alt Ship for Wireline LOB
 * Relex Retrofitting
 */


function setDefaultUnitsPerAltShip(node) {

	var materialItemType = node.getValue("Material_Item_Type").getSimpleValue();
	var planningSystem = node.getValue("Planning_System").getSimpleValue();

	if (materialItemType == "Minor Material" && planningSystem != null) {
		if (node.getValue("Units_Per_Alt_Ship").getSimpleValue() == null) {
			node.getValue("Units_Per_Alt_Ship").setSimpleValue("1");
		}
	}
}

/**
 * @author - AW304F
 * Rule Name: Set Units Per Pallet for Wireline LOB
 * Relex Retrofitting
 */

function setDefaultUnitsPerPallet(node) {

	var materialItemType = node.getValue("Material_Item_Type").getSimpleValue();
	var planningSystem = node.getValue("Planning_System").getSimpleValue();

	if (materialItemType == "Minor Material" && planningSystem != null) {
		if (node.getValue("Units_per_Pallet").getSimpleValue() == null) {
			node.getValue("Units_per_Pallet").setSimpleValue("1");
		}
	}
}

/**
 * @author - AW304F
 * Rule Name: Set Units Per Pallet Layer for Wireline LOB
 * Relex Retrofitting
 */

function setDefaultUnitsPerPalletLayer(node) {

	var materialItemType = node.getValue("Material_Item_Type").getSimpleValue();
	var planningSystem = node.getValue("Planning_System").getSimpleValue();

	if (materialItemType == "Minor Material" && planningSystem != null) {
		if (node.getValue("Units_Per_Pallet_Layer").getSimpleValue() == null) {
			node.getValue("Units_Per_Pallet_Layer").setSimpleValue("1");
		}
	}
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.setProductType = setProductType
exports.setTechStaff = setTechStaff
exports.setMicCoe = setMicCoe
exports.setE911Category = setE911Category
exports.setItemCriticalityIndicator = setItemCriticalityIndicator
exports.setPlanningRoute = setPlanningRoute
exports.setExternalAppDownloadCode = setExternalAppDownloadCode
exports.clearSafetyIndicatorAndOrmdClass = clearSafetyIndicatorAndOrmdClass
exports.setOALCTrk = setOALCTrk
exports.setBarCodeReceiptReq = setBarCodeReceiptReq
exports.getMicCoe = getMicCoe
exports.deriveMicCoe = deriveMicCoe
exports.deriveAssetandSerializedIndicator = deriveAssetandSerializedIndicator
exports.setAssetTransaction = setAssetTransaction
exports.setBarCode = setBarCode
exports.setExpenditureCode = setExpenditureCode
exports.setRegionalItemFlag = setRegionalItemFlag
exports.setPurchasingCat = setPurchasingCat
exports.setUserDefinedItemNumber = setUserDefinedItemNumber
exports.clearRecoveryTypeAndHandlingClass = clearRecoveryTypeAndHandlingClass
exports.setCapitalTool = setCapitalTool
exports.setItemStatus = setItemStatus
exports.setUOMandPatternAccount = setUOMandPatternAccount
exports.setASEStatus = setASEStatus
exports.setRestrictedtoExternalSystem = setRestrictedtoExternalSystem
exports.setSerializedIndicator = setSerializedIndicator
exports.clearStockItemGroup = clearStockItemGroup
exports.setWirelineItemDescription = setWirelineItemDescription
exports.getApprWSBomType = getApprWSBomType
exports.setWirelineDefaultAttributes = setWirelineDefaultAttributes
exports.setDefaultRecoveryType = setDefaultRecoveryType
exports.setDefaultHandlingClass = setDefaultHandlingClass
exports.validateDuplicateManufacturingPartNumber = validateDuplicateManufacturingPartNumber
exports.setESIAttributesValues = setESIAttributesValues
exports.getLookupTableValue = getLookupTableValue
exports.setExlTpiFlag = setExlTpiFlag
exports.setPatternAccount = setPatternAccount
exports.setWirelineSourcingNotification = setWirelineSourcingNotification
exports.setDefaultSourcingNotifyOnboarding = setDefaultSourcingNotifyOnboarding
exports.setJDAAttributes = setJDAAttributes
exports.setChildOrgsListPrice = setChildOrgsListPrice
exports.revertListPrice = revertListPrice
exports.setPlanningFeature = setPlanningFeature
exports.setPlanningTier = setPlanningTier
exports.setDefaultUnitsPerAltShip = setDefaultUnitsPerAltShip
exports.setDefaultUnitsPerPallet = setDefaultUnitsPerPallet
exports.setDefaultUnitsPerPalletLayer = setDefaultUnitsPerPalletLayer