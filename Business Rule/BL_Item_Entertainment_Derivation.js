/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Item_Entertainment_Derivation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Derivation_Libraries" ],
  "name" : "Item Entertainment Derivation Library",
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
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonLib"
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
function setEntertainmentDefaultAttributes(node) {
	var itemType = node.getValue("ENT_Item_Type").getID();
	var userItemType = node.getValue("User_Item_Type_ENT").getID();
	const entItemTypeList = ['Wireless Video Bridge','IRD STB','IRD CLIENT','AIM Meter','WildBlue Internet','IRD STB DVR','DVR To Go','External Hard Drive','Off Air Tuner'];
	if (itemType != "DTV MAKEMODEL" && itemType != "UVR BB MAKEMODEL") {
		commonLib.setDefaultValueIfEmpty(node, "Business_Owner", "Simple", "WIRELINE");
		commonLib.setDefaultValueIfEmpty(node, "Business_Region", "Simple", "SOUTHEAST_MM");
		commonLib.setDefaultValueIfEmpty(node, "Ebs_Dff_Context", "LOV", "DTV");
		commonLib.setDefaultValueIfEmpty(node, "CPE_Item", "LOV", "Y");
		if (userItemType == "SATELLITE") {
			commonLib.setDefaultValueIfEmpty(node, "Material_Item_Type", "LOV", "Minor Material");
			if (itemType != "Minor Material Field Only" && itemType != "Access Card" && itemType != "Field Inventory Aggregation Code") {
				commonLib.setDefaultValueIfEmpty(node, "Expenditure_Code", "LOV", "521");
			}
		}
	}
	if (itemType != "DTV MAKEMODEL" && itemType != "UVR BB MAKEMODEL" && itemType != "Field Inventory Aggregation Code") {
		commonLib.setDefaultValueIfEmpty(node, "iProc_Enabled", "LOV", "Y");
		commonLib.setDefaultValueIfEmpty(node, "Send_Item_Info", "LOV", "Y");
		commonLib.setDefaultValueIfEmpty(node, "CA_Manufacturer_Package_Warning", "LOV", "NA");
		commonLib.setDefaultValueIfEmpty(node, "CA_Prop_65_Toxicity_Type", "LOV", "ND");
	}
	if (itemType == "Field Inventory Aggregation Code") {
		commonLib.setDefaultValueIfEmpty(node, "OEM", "LOV", "VAR");
		commonLib.setDefaultValueIfEmpty(node, "OEM_Full_Name", "LOV", "Various");
		commonLib.setDefaultValueIfEmpty(node, "Product_Family", "LOV", "50A03B01");
		commonLib.setDefaultValueIfEmpty(node, "Sub_Family", "LOV", "50A03B01C13");
	}
	if (itemType == "Generic Group") {
		commonLib.setDefaultValueIfEmpty(node, "OMS_Item_Number", "Simple", "DUMMY");
	}
	if (itemType == "UVERSE") {
	//	commonLib.setDefaultValueIfEmpty(node, "User_Defined_Item_Num", "Simple", "NA"); -- PP588A: Commented as User will provide the value. 
	}
	if (itemType == "DTV MAKEMODEL" || itemType == "UVR BB MAKEMODEL" || itemType == "PRODUCTLINE") {
		commonLib.setDefaultValueIfEmpty(node, "Product_Family", "LOV", "50A00B00");
		commonLib.setDefaultValueIfEmpty(node, "Sub_Family", "LOV", "50A00B00C00");
		commonLib.setDefaultValueIfEmpty(node, "Generate_New_UPC", "LOV", "N");
		commonLib.setDefaultValueIfEmpty(node, "Parent_BOM", "LOV", "N");
		commonLib.setDefaultValueIfEmpty(node, "Default_Serial_Status_Id", "LOV", "1");		
	}
	if (itemType == "Access Card") {
		commonLib.setDefaultValueIfEmpty(node, "Product_Family", "LOV", "50A00B00");
		commonLib.setDefaultValueIfEmpty(node, "Sub_Family", "LOV", "50A00B00C00");
	}
	if(entItemTypeList.includes(String(itemType))){
		commonLib.setDefaultValueIfEmpty(node, "Brand_Name", "Simple", "DIRECTV");
	}
	if (itemType == "Minor Material Field Only") {
	commonLib.setDefaultValueIfEmpty(node, "Expenditure_Code", "LOV", "520");
	}
	//commonLib.setDefaultValueIfEmpty(node, "Linking_Code", "LOV", "ALLZ"); -- Pradeep: Need to be run only for Ent Wireline item types
	commonLib.setDefaultValueIfEmpty(node, "Primary_UOM_ValidList", "LOV", "EA - Each");
}

function setMaterialItemType(node) {
	var itemType = node.getValue("ENT_Item_Type").getID();
	if (itemType == "DTV MAKEMODEL" || itemType == "UVR BB MAKEMODEL") {
		node.getValue("Material_Item_Type").setLOVValueByID("Make Model");
	}
	if (itemType == "PRODUCTLINE") {
		node.getValue("Material_Item_Type").setLOVValueByID("Product Line");
	}
}

function setExtAppDownloadCode(node) {
	var itemType = node.getValue("ENT_Item_Type").getID();
	if (itemType != "Generic Group") {
		node.getValue("Ext_App_Dwnld_Code").setLOVValueByID("R");
	}
}

function setProductClass(node) {
	var itemType = node.getValue("ENT_Item_Type").getID();
	var userItemType = node.getValue("User_Item_Type_ENT").getID();
	var itemClass = node.getValue("Item_Class").getID();
	if (itemType != "DTV MAKEMODEL" && itemType != "UVR BB MAKEMODEL" && itemType != "Field Inventory Aggregation Code") {
		if (userItemType == "UVERSE" || userItemType == "DSL" || itemClass.contains("Broadband") == true) {
			node.getValue("Product_Class").setLOVValueByID("WIRELINE");
		}
		if (userItemType == "BVOIP") {
			node.getValue("Product_Class").setLOVValueByID("CPE");
		}
		if (userItemType == "SATELLITE") {
			node.getValue("Product_Class").setLOVValueByID("Satellite");
		}
	}
}

function setSubmitStandardCost(node) {
	var itemClass = node.getValue("Item_Class").getID();
	if (itemClass == "ATT DirecTV") {
		if (node.getValue("Requested_Standard_Cost").getSimpleValue()) {
			node.getValue("Submit_Standard_Cost").setLOVValueByID("N");
			 node.getValue("Submitted_Date").setSimpleValue(commonLib.getCurrentDate());
		} else {
			commonDerivationLib.clearAttributeValue(node, "Submit_Standard_Cost");
		}
	}
}

function setMatchApprovalLevel(node) {
	var itemClass = node.getValue("Item_Class").getID();
	if (itemClass == "ATT DirecTV") {
		node.getValue("Match_Approval_Level").setLOVValueByID("3");
	} else {
		commonLib.clearAttributeValue(node, "Match_Approval_Level");
	}
}

// Pradeep - 11/11/25: changed the below rule from running for SATELLITE to all Entertainment Wireline Item types
function setLineOfBusinessCat(node, stepManager) {
	var userItemType = node.getValue("User_Item_Type_ENT").getID();
	var entATTWirelineList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Wireline_Item_Types").getSimpleValue();
	if ( entATTWirelineList.includes(userItemType) ) {
		node.getValue("Line_Of_Business_Cat").setLOVValueByID("WIRELINE.DEFAULT");
	}
}

function deriveIrdDesignator(node, lookUpTable) {
	var productFamily = node.getValue("Product_Family").getID();
	if (productFamily) {
		var irdLookUpResult = lookUpTable.getLookupTableValue("LT_Entertainment_IRD_Designator", productFamily);
		if (irdLookUpResult) {
			node.getValue("IRD_Designator").setLOVValueByID(irdLookUpResult);
		}
	}
}

function setProductName(node) {
	if (node.getValue("Item_Class").getID() == "ATT Entertainment Make Model") {
		var brandName = node.getValue("Brand_Name").getSimpleValue();
		var model = node.getValue("Model").getSimpleValue();
		if (brandName && model) {
			node.getValue("Product_Name").setSimpleValue(brandName + " " + model);
		}
		if (brandName && !model) {
			node.getValue("Product_Name").setSimpleValue(brandName);
		}
	}
}

function setSubmitStandardCost(node, stepManager) {
	var entATTEntList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Item_Types").getSimpleValue();
	var entATTWirelineList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Wireline_Item_Types").getSimpleValue();
	var itemType = node.getValue("ENT_Item_Type").getID();
	var submitCost = node.getValue("Submit_Standard_Cost").getID();
	if (!submitCost && entATTEntList.includes(itemType) || !submitCost && entATTWirelineList.includes(itemType)) {
		node.getValue("Submit_Standard_Cost").setLOVValueByID("N");
	}
}



/**
 * author: Syed
 * rule  : set Expense Account org value if Inventory Asset Value is "No"
 */
function setENTExpenseAccountOrg(node, stepManager) {
	var entATTWirelineList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Wireline_Item_Types").getSimpleValue();
	var itemType = node.getValue("ENT_Item_Type").getID();
	var inventoryAssetValue = node.getValue("Inventory_Asset_Value").getID();
	if (entATTWirelineList.includes(itemType) && inventoryAssetValue == "N") {
		node.getValue("Expense_Account_Org").setSimpleValue("9963.2269.0000.000000.9999.0000");
	}
}

/**
 * @author - AW304F
 * Rule Name: Set_RIO_Part_Number
 * Added to Item Entertainment Derivation Library  
 */
 
function setRIOPartNumber(node){
	var objType = node.getObjectType().getID();
	var model = node.getValue("Model").getSimpleValue();
	var brandName = node.getValue("Brand_Name").getSimpleValue();
	var barCodeReceiptRequired = node.getValue("Bar_Code_Receipt_Req").getID();	
		if (model) {
			if (barCodeReceiptRequired == "Y"){				
				node.getValue("RIO_Part_Number").setSimpleValue(brandName+ " " +model);
			} else if (barCodeReceiptRequired == "N" || barCodeReceiptRequired == "Z"){
				node.getValue("RIO_Part_Number").setSimpleValue(model);
			}
		}
}

/**
 * @author - John
 * Rule Name: Set_State_Impact 
 */
 function setRecoverableStateImpact(node) {

	var stateRecoverableList = node.getDataContainerByTypeID("DC_State_Recoverable").getDataContainers().toArray();
	if (stateRecoverableList.length == 0) {
		node.getValue("Recoverable_State_Impact").setLOVValueByID("N");
	} else {
		var defectiveSwapERP = node.getValue("Defective_Swap/ERP").getID();
		if (defectiveSwapERP) {
			var stateRecoverableFlag = false;
			stateRecoverableList.forEach(function(stateRecoverableDC) {
				var stateRecoverableDCObj = stateRecoverableDC.getDataContainerObject();
				var defectiveSwapErpDCvalue = stateRecoverableDCObj.getValue("Defective_Swap/ERP").getID();
				if (defectiveSwapERP == defectiveSwapErpDCvalue) {
					stateRecoverableFlag = true;
				}
			});
			if (stateRecoverableFlag) {
				node.getValue("Recoverable_State_Impact").setLOVValueByID("N");
			} else {
				node.getValue("Recoverable_State_Impact").setLOVValueByID("Y");
			}
		}
	}
}


/**
 * @author - John
 * Rule Name: set Product_Line_Item_Number 
 */

function setProductLineItemNumber(node, stepManager, query) {

 	var itemType = node.getValue("ENT_Item_Type").getID();
 	if (itemType == "DTV MAKEMODEL" || itemType == "UVR BB MAKEMODEL") {
 		var productLine = node.getValue("Product_Line").getID();
 		if (productLine) {
 			var productLineNodeID = getDuplicateProductLine(node, stepManager, query, productLine);
 			if (productLineNodeID) {
 				var itemNum = productLineNodeID.getValue("Item_Num").getSimpleValue();
 				if (itemNum) {
 					node.getValue("Product_Line_Item_Number").setSimpleValue(itemNum);
 				}
 			}
 		}
 	}
}

function getDuplicateProductLine(node, stepManager, query, productLine) {
	var duplicateProductLineID = "";
	var productLineAttribute = stepManager.getAttributeHome().getAttributeByID("Product_Line");
	var currentNodeID = node.getID();
	var Conditions = com.stibo.query.condition.Conditions;
	var querySpec = query.queryFor(com.stibo.core.domain.Product).where(Conditions.valueOf(productLineAttribute).eq(productLine));
	var resultSet = querySpec.execute();
	var matchingItems = new java.util.ArrayList();
	resultSet.forEach(function(result) {
		matchingItems.add(result);
		return true;
	});
	if (matchingItems.size() > 0) {
		for (var i = 0; i < matchingItems.size(); i++) {
		var item = matchingItems.get(i);
		var itemObjectType = item.getObjectType().getID();
		var itemID = item.getID();
		if (itemObjectType != "CancelledType" && itemID != currentNodeID && item.getValue("ENT_Item_Type").getID() == "PRODUCTLINE") {
			duplicateProductLineID = item;
			break;
		}
	}
	}	
	return duplicateProductLineID;
}

/**
 * @author - Pradeep
 * Rule Name: set Inventory_Asset_Flag for Ent Wireline MST (funct of child orgs in Child Org Library)  
 */

function setInventoryAssetValueMST(node, stepManager) {
	var productSubType = node.getValue("Product_Sub_Type").getID();
	var entWirelineItemTypeList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Wireline_Item_Types").getSimpleValue();
	var itemType = node.getValue("ENT_Item_Type").getID();
	if (entWirelineItemTypeList.includes(String(itemType))) {
		if (productSubType == "WIRELINE_SERIAL" || productSubType == "WIRELINE_NON SERIAL") {
			node.getValue("Inventory_Asset_Value").setLOVValueByID("Y");
		} else if (productSubType == "WIRELINE_COLLATERAL" || productSubType == "WIRELINE_D2C_COL_K2") {
			node.getValue("Inventory_Asset_Value").setLOVValueByID("N");
		}
	}
}

/**
 * @author - Pradeep
 * Added to restrict the default Linking_Code value only for Ent Wireline Item Types
*/
function setLinkingCode(node, stepManager) {
	var entATTWirelineList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Wireline_Item_Types").getSimpleValue();
	var itemType = node.getValue("ENT_Item_Type").getID();
	var linkingCode = node.getValue("Linking_Code").getID();
	if (!linkingCode && entATTWirelineList.includes(itemType)) {
		node.getValue("Linking_Code").setLOVValueByID("ALLZ");
	}
}

function copyRSCtoCSCandLP(node) {

	var currentStandardCost = node.getValue("Current_Standard_Cost").getSimpleValue();
	var requestedStandardCost = node.getValue("Requested_Standard_Cost").getSimpleValue();	
	if (currentStandardCost != requestedStandardCost) {		
		var isSuperOrgPresent = false;
		var children = node.queryChildren();
		children.forEach(function(child) {
			if (child.getObjectType().getID() == "Child_Org_Item" && child.getValue("Organization_Code").getID() == "000") {
				isSuperOrgPresent = true;
			}
			return true;
		});
		if (!isSuperOrgPresent) {			
			node.getValue("Current_Standard_Cost").setSimpleValue(requestedStandardCost);
			node.getValue("List_Price").setSimpleValue(requestedStandardCost);
		}
	}
}




/*===== business library exports - this part will not be imported to STEP =====*/
exports.setEntertainmentDefaultAttributes = setEntertainmentDefaultAttributes
exports.setMaterialItemType = setMaterialItemType
exports.setExtAppDownloadCode = setExtAppDownloadCode
exports.setProductClass = setProductClass
exports.setSubmitStandardCost = setSubmitStandardCost
exports.setMatchApprovalLevel = setMatchApprovalLevel
exports.setLineOfBusinessCat = setLineOfBusinessCat
exports.deriveIrdDesignator = deriveIrdDesignator
exports.setProductName = setProductName
exports.setSubmitStandardCost = setSubmitStandardCost
exports.setENTExpenseAccountOrg = setENTExpenseAccountOrg
exports.setRIOPartNumber = setRIOPartNumber
exports.setRecoverableStateImpact = setRecoverableStateImpact
exports.setProductLineItemNumber = setProductLineItemNumber
exports.getDuplicateProductLine = getDuplicateProductLine
exports.setInventoryAssetValueMST = setInventoryAssetValueMST
exports.setLinkingCode = setLinkingCode
exports.copyRSCtoCSCandLP = copyRSCtoCSCandLP