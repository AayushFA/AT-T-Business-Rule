/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Child_Org_Common_Derivation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Derivation_Libraries" ],
  "name" : "Child Org Common Derivation Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "itemCommonDerivationLib"
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
const materialType = ['Plug-In', 'Billing Category Item', 'Toolsets', 'Minor Material'];
const propOrgs = ['AK1', 'MW1', 'SE2', 'SW1', 'WE1', 'WE2', 'WE3', 'WE4'];
const materialTypeASE = ['Undefined', 'MOA Minor', 'Plug-In Non Stock', 'Hardwired', 'Plug-In', 'Catalog Expense',
	'MOA Expense', 'Catalog Minor', 'RTU Capital', 'RTU Expense', 'Major Material XPID LE', 'Billing Category Item', 'Toolsets'
];

function setChildOrgAttributes(node, childOrgItem, orgCode, stepManager, lookupTableHome) {	
	
	childOrgItem.getValue("Organization_Code").setLOVValueByID(orgCode);
     if(!childOrgItem.getValue("Child_Org_Identity").getSimpleValue()){
     	childOrgItem.getValue("Child_Org_Identity").setSimpleValue(node.getID() + "." + orgCode);
     }			
     // All the Org Codes and Attributes from below function calls should be added to "LT_Item_Partial_Approve_Attributes"	
	setSerialGeneration(node, stepManager, childOrgItem, orgCode);
	setExtAppDownloadCode(node, childOrgItem, orgCode);
	setSendItemInfo(node, childOrgItem, orgCode);
	setItemStatus(node, childOrgItem, orgCode, stepManager, lookupTableHome);	
	setInventoryAssetValue(node, childOrgItem, stepManager, orgCode);
	setMinMaxQty(node, childOrgItem, stepManager, orgCode);
	setSerialStatusEnabled(node, childOrgItem, stepManager, orgCode);
	setWIPSupplyType(node, childOrgItem, stepManager, orgCode);
	setExpenseAccountOrg(node, childOrgItem, stepManager, orgCode);
	setTransportLeadTime(node, childOrgItem, orgCode);
	setInventoryPlanningCode(node,childOrgItem, orgCode);	
	setCogsAndSalesAccountOrg(node, childOrgItem, orgCode, lookupTableHome,stepManager);
	setShippable(node, childOrgItem, orgCode);
	setInvoiceCloseTolerancePercentage(childOrgItem, orgCode);
	setCSCandRSC(node,childOrgItem);
	setListPrice(node,childOrgItem, orgCode);	
	setDefaultSerialStatusId(node, childOrgItem, stepManager, orgCode);
	setFullLeadTime(node, childOrgItem, orgCode, lookupTableHome)
}

function updateChildOrgsAttributes(node, stepManager, lookupTableHome) {
	var objectType = node.getObjectType().getID();	
	if (objectType == "Item" || objectType == "Companion_SKU") {
		var pItemChildren = node.queryChildren();
		pItemChildren.forEach(function(pItemChlid) {	      
			if (pItemChlid.getObjectType().getID() == "Child_Org_Item") {
				var orgCode =  pItemChlid.getValue("Organization_Code").getID();
				setChildOrgAttributes(node, pItemChlid,orgCode, stepManager, lookupTableHome)
			} 
			return true;
		});
	} 
}

function setSerialGeneration(node, stepManager, childOrgItem, orgCode) { //tested by John  
	var lob = node.getValue("Line_Of_Business").getID();
	var entSerialGenOrgList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Serial_Generation_Orgs").getSimpleValue();		
	var productSubType = node.getValue("Product_Sub_Type").getID();
	var itemType = node.getValue("RTL_Item_Type").getSimpleValue();	
	if (lob == "ENT") {
		if (orgCode == "MSD") {
			childOrgItem.getValue("Serial_Generation").setLOVValueByID("5");
		}
		// Added by syed - Rule : Set Serial Generation Value as "No Serial Control" for Average costing orgs ("MDB", "FDA", "RLI", "RLE", "RLT", "ODC", "MW2", "SW2", "WE5", "WE6", "WE7", "RLB", "RLL", "RLR", "RLY", "RLS", "SBD", "GDA", "DDA", "RLC")	
		if (entSerialGenOrgList.includes(String(orgCode))) {
			childOrgItem.getValue("Serial_Generation").setLOVValueByID("1");
		}
	}
	if(lob == "RTL"){
		itemCommonDerivationLib.setSerialGenerationVal(childOrgItem,node,stepManager);
	}
}

// Added by mb916k to set ExtAppDownloadCode to R for items assigned to RL1 org

function setExtAppDownloadCode(node, childOrgItem, orgCode) {
	var lob = node.getValue("Line_Of_Business").getID();
	var itemTypeRTL = node.getValue("RTL_Item_Type").getID();
	if (lob == "RTL" && itemTypeRTL && orgCode == "RL1") {
		childOrgItem.getValue("Ext_App_Dwnld_Code").setLOVValueByID("R");
	}
}


// Added by mb916k to Set SendItemInfo to N for items assigned to RL1 org

function setSendItemInfo(node, childOrgItem, orgCode) {
	var lob = node.getValue("Line_Of_Business").getID();
	if (lob == "RTL" && orgCode == "RL1") { 
		childOrgItem.getValue("Send_Item_Info").setLOVValueByID("N");
	}
}

function setItemStatus(node, childOrgItem, orgCode, stepManager, lookupTableHome) {
	var lob = node.getValue("Line_Of_Business").getID();
	var itemStatus = " ";	
	itemStatus = node.getValue("Item_Status_"+lob).getID();	
	if (itemStatus) {		
		var lookupResult = lookupTableHome.getLookupTableValue("LT_ChildOrg_Item_Status", orgCode + "|" + itemStatus);
		if (lookupResult) {					
			childOrgItem.getValue("Item_Status").setLOVValueByID(lookupResult);			
			childOrgItem.getValue("Item_Status_"+lob).setLOVValueByID(lookupResult);
		}else{							
			childOrgItem.getValue("Item_Status").setLOVValueByID(itemStatus);			
			childOrgItem.getValue("Item_Status_"+lob).setLOVValueByID(itemStatus);
		}
	}
}

// Added by mb916k -- Automatically update Cogs Account and Sales Account Org  status based on Parent Cogs and Sales Account Org Status


// Added by mb916k -- Replacing COGS Account Org based on MST - Org Propagation
function setCogsAndSalesAccountOrg(node, childOrgItem, orgCode, lookupTableHome, stepManager) {
		
	var lob = node.getValue("Line_Of_Business").getID();
	var cogsAccount = String(node.getValue("COGS_Account").getID());
	var salesAccount = String(node.getValue("Sales_Account").getID());

	const vaildAccOrgCodeList = ["AK1", "WE2", "MW1", "WE1", "SE2", "SW1"];
	if (lob == "WRLN" && vaildAccOrgCodeList.includes(String(orgCode)) == true) {
		if (cogsAccount == "1001.9899.0000.000000.0000.0000") {
			childOrgItem.getValue("COGS_Account_Org").setLOVValueByID("9963.2269.0000.000000.9999.0000");
		}
		if (salesAccount == "1002.9899.0000.000000.0000.0000") {
			childOrgItem.getValue("Sales_Account_Org").setLOVValueByID("9963.2269.0000.000000.9999.0000");
		}
	}
	var accountOrgsLT = lookupTableHome.getLookupTableValue("LT_ChildOrg_COGS_Sales_AccountOrg", orgCode);
	if ((lob == "RTL" || lob == "ENT") && accountOrgsLT) {		
		var salesAccountOrgLOV = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_Sales_Account_Org");
		if (cogsAccount) {
			var cogsSegments = cogsAccount.split(".");
			cogsSegments[3] = accountOrgsLT;			
			 var updatedCogsOrg = cogsSegments.join(".");								
	           var validLovList = salesAccountOrgLOV.getListOfValuesValueByID(updatedCogsOrg);	          
	           if (validLovList) {			           	 
	           	childOrgItem.getValue("COGS_Account_Org").setLOVValueByID(updatedCogsOrg);
	           }								
		}
		if (salesAccount) {
			var salesSegments = salesAccount.split(".");
			salesSegments[3] = accountOrgsLT;
			var updatedSalesOrg = salesSegments.join(".");
			var validLovList = salesAccountOrgLOV.getListOfValuesValueByID(updatedSalesOrg);
	           if (validLovList) {		
	           	childOrgItem.getValue("Sales_Account_Org").setLOVValueByID(updatedSalesOrg);
	           }					
		}
	}
}

/**
 * author : Syed
 * Rule 	: Set Inventory Asset Value based on Product Sub Type attribute
 */

function setInventoryAssetValue(node, childOrgItem, stepManager, orgCode) {
	const vaildInventoryOrgCodeList = ["FDA", "MDB", "MSD", "ODC"];
	const validENTWirelineOrgsList = ["RLI", "RLE", "RLT", "RLB", "RLL", "RLR", "RLY", "RLS"];
	var lob = node.getValue("Line_Of_Business").getID();
	var productSubType = node.getValue("Product_Sub_Type").getID();
	var entWirelineItemTypeList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Wireline_Item_Types").getSimpleValue();
	var attEntertainmentItemTypeList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Item_Types").getSimpleValue();
	var itemType = node.getValue("ENT_Item_Type").getID();
	if (lob == "ENT") {
		if (entWirelineItemTypeList.includes(String(itemType)) && vaildInventoryOrgCodeList.includes(String(orgCode))) {
			if (productSubType == "WIRELINE_SERIAL" || productSubType == "WIRELINE_NON SERIAL") {
				childOrgItem.getValue("Inventory_Asset_Value").setLOVValueByID("Y");
			} else if (productSubType == "WIRELINE_COLLATERAL" || productSubType == "WIRELINE_D2C_COL_K2") {
				childOrgItem.getValue("Inventory_Asset_Value").setLOVValueByID("N");
			}
		}
		if (validENTWirelineOrgsList.includes(String(orgCode)) || (attEntertainmentItemTypeList.includes(String(itemType)) && orgCode == "ASE")) {
			childOrgItem.getValue("Inventory_Asset_Value").setLOVValueByID("N");
		}
	}
	if (lob == "WRLN" && orgCode == "ASE") {
		childOrgItem.getValue("Inventory_Asset_Value").setLOVValueByID("N");
	}
}

function setMinMaxQty(node, childOrgItem, stepManager, orgCode) {
	var lob = node.getValue("Line_Of_Business").getID();
	var itemType = node.getValue("ENT_Item_Type").getID();
	var itemNumber = node.getValue("Item_Num").getSimpleValue();
	var minMaxQtyMax = node.getValue("Min_Max_Qty_Maximum").getSimpleValue();
	var minMaxQtyMin = node.getValue("Min_Max_Qty_Minimum").getSimpleValue();
	const itemTypeList = ["DTV MAKEMODEL", "PRODUCTLINE", "UVR BB MAKEMODEL"];
	if (lob == "ENT" && orgCode == "MSD" && (!minMaxQtyMax || !minMaxQtyMin) && !itemTypeList.includes(itemType)) {	
		childOrgItem.getValue("Min_Max_Qty_Maximum").setSimpleValue("0");
		childOrgItem.getValue("Min_Max_Qty_Minimum").setSimpleValue("0");
	}	
	if (lob == "WRLN" && !itemNumber) {	
		childOrgItem.getValue("Min_Max_Qty_Maximum").setSimpleValue(minMaxQtyMax); // Setting same value as Parent for Description attr.
	}
}
	
/**
 * author: Syed
 * rule  : set Serial Status Enabled value as "Y"  if Bar Code Receipt Required  Value is "Y" for MSD org
 */
function setSerialStatusEnabled(node, childOrgItem, stepManager, orgCode) {
	var lob = node.getValue("Line_Of_Business").getID();
	var itemType = node.getValue("ENT_Item_Type").getID();
	var serialEnabled = node.getValue("Serial_Status_Enabled").getID();
	var barCodeRequired = node.getValue("Bar_Code_Receipt_Req").getID();
	const itemTypeList =["DTV MAKEMODEL","PRODUCTLINE","UVR BB MAKEMODEL"];
	if (lob == "ENT" && !itemTypeList.includes(itemType) && orgCode == "MSD" && barCodeRequired == "Y") {
		childOrgItem.getValue("Serial_Status_Enabled").setLOVValueByID("Y");
	}
}

/**
 * author: Syed
 * rule  : For MSD Org, set WIP Supply Type = 2 
 */
function setWIPSupplyType(node, childOrgItem, stepManager, orgCode) {
	var lob = node.getValue("Line_Of_Business").getID();
	var itemType = node.getValue("ENT_Item_Type").getID();
	var entATTWirelineList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Wireline_Item_Types").getSimpleValue();
	if (lob == "ENT" && entATTWirelineList.includes(itemType) && orgCode == "MSD") {
		childOrgItem.getValue("WIP_Supply_Type").setLOVValueByID("2");
	}
}

/**
 * author: Syed
 * rule  : For ASE Org, if ExpenseAccountOrgEFF is NULL, then copy the value of CostOfGoodsSoldAcctOrg into it. 
 */
function setExpenseAccountOrg(node, childOrgItem, stepManager, orgCode) {
	var lob = node.getValue("Line_Of_Business").getID();
	var entATTEntList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Item_Types").getSimpleValue();
	var entATTWirelineList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Wireline_Item_Types").getSimpleValue();
	var expenseAccOrgChild = childOrgItem.getValue("Expense_Account_Org").getID();
	var inventoryAssetValue = childOrgItem.getValue("Inventory_Asset_Value").getID();
	var cogsAccOrg = node.getValue("COGS_Account_Org").getID();
	var itemTypeENT = node.getValue("ENT_Item_Type").getID();
	if (lob == "ENT") {
		if (entATTEntList.includes(itemTypeENT) && !expenseAccOrgChild && cogsAccOrg && orgCode == "ASE") {
			childOrgItem.getValue("Expense_Account_Org").setSimpleValue(cogsAccOrg);
		}
	}
}

function setTransportLeadTime(node, childOrgItem, orgCode) {
	var lob = node.getValue("Line_Of_Business").getID();
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	var itemStatus = childOrgItem.getValue("Item_Status_WRLN").getID();	
	var transportLeadTime = node.getValue("Transport_Lead_Time").getSimpleValue();
	if (lob == "WRLN" && (itemStatus == "Active S" ||itemStatus =="Obs S"||itemStatus =="Phase S") && !transportLeadTime) {
		if (materialItemType == "Cable"||materialItemType == "Minor Material") {
			if (orgCode == "MW1") {
				childOrgItem.getValue("Transport_Lead_Time").setSimpleValue("4");
			}
			if (orgCode == "SW1") {
				childOrgItem.getValue("Transport_Lead_Time").setSimpleValue("6");
			}
		}
		if (materialItemType == "Minor Material") {
			if (orgCode == "WE4") {
				childOrgItem.getValue("Transport_Lead_Time").setSimpleValue("5");
			}
			if (orgCode == "WE3") {
				childOrgItem.getValue("Transport_Lead_Time").setSimpleValue("3");
			}
		}
	}
}

function setInventoryPlanningCode(node, childOrgItem, orgCode) {
	var lob = node.getValue("Line_Of_Business").getID();
	if (lob == "ENT" && orgCode == "MSD") {		
		childOrgItem.getValue("Inventory_Planning_Code").setLOVValueByID("2");
	}
}


/**
 * @author - John
 * Rule: FLC_Shippable_flag_N	
 * Rule: GTB_Shippable_flag_N
 */
function setShippable(node, childOrgItem, orgCode) {
	var lob = node.getValue("Line_Of_Business").getID();
	const itemTypeList = ["DF_COLLATERAL_GENERAL", "DF_COLLATERAL_INTANG2", "DF_COLLATERAL_YOUNG_AMERICA", "DF_FREIGHT"];
	const orgCodeList = ["FLC", "GTB", "SAM"];
	var itemType = node.getValue("RTL_Item_Type").getID();
	if (lob == "RTL" && itemTypeList.includes(String(itemType)) && orgCodeList.includes(String(orgCode))) {
		childOrgItem.getValue("Shippable").setLOVValueByID("N");
	}
}

/**
 * @author - John
 * Rule: FLC_Invoice_Close_Tolerance	
 * Rule: GTB_Invoice_Close_Tolerance
 */
function setInvoiceCloseTolerancePercentage(childOrgItem, orgCode){
	if(orgCode == "FLC" || orgCode == "GTB" ){
		childOrgItem.getValue("Invoice_Close_Tolerance_Percentage").setSimpleValue("100");
	}
}
/**
 * @author - John
 * Rule: FLC_List_price_per_unit	
 * Rule: GTB_List_price_per_unit
 * Rule: Copy Parent List Price to Child Org List Price
 */
function setListPrice(node,childOrgItem, orgCode) {

   var parentListPrice = node.getValue("List_Price").getSimpleValue();
   if (parentListPrice) {
      childOrgItem.getValue("List_Price").setSimpleValue(parentListPrice);
   }
   if (orgCode == "FLC" || orgCode == "GTB") {
      childOrgItem.getValue("List_Price").setSimpleValue("0");
   }
}

/**
 * author: John
 * rule  : Default_Serial_Status_MSD
 */
function setDefaultSerialStatusId(node, childOrgItem, stepManager, orgCode) {

	var entATTEntList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Item_Types").getSimpleValue();
	var entATTWirelineList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Wireline_Item_Types").getSimpleValue();
	var entATTBVOIPList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("BVoIP_Item").getSimpleValue();
	var itemType = node.getValue("ENT_Item_Type").getID() + "";
	if (node.getValue("Bar_Code_Receipt_Req").getID() == "Y" && childOrgItem.getValue("Organization_Code").getID() == "MSD" &&
		(entATTEntList.includes(itemType) || entATTWirelineList.includes(itemType) || entATTBVOIPList.includes(itemType))) {
		   childOrgItem.getValue("Default_Serial_Status_Id").setLOVValueByID("1");		
	}
}

/**
 * author: John
 * rule  : set Full_Lead_Time
 */
function setFullLeadTime(node, childOrgItem, orgCode, lookupTableHome) {

	var lob = node.getValue("Line_Of_Business").getID();	
	if (lob == "WRLN") {
		var materialItemType = node.getValue("Material_Item_Type_Web").getID();		
		var lookUpTableResult = "";
		lookUpTableResult = lookupTableHome.getLookupTableValue("LT_ChildOrg_UI_ReadOnly_Attributes", "Full_Lead_Time|" + orgCode);		
		if (lookUpTableResult && lookUpTableResult.includes(materialItemType)) {
			var fullLeadTime = node.getValue("Full_Lead_Time").getSimpleValue();
			if (fullLeadTime) {
				childOrgItem.getValue("Full_Lead_Time").setSimpleValue(fullLeadTime);
			}
		}
	}
}

function dcChildOrgUiNavigation(node, webUiContext,stepManager) {
	var workFlow = stepManager.getWorkflowHome().getWorkflowByID("Item_Maintenance_Workflow");
	var workFlowInstance = node.getWorkflowInstanceByID("Item_Maintenance_Workflow");
	if (workFlowInstance) {
		if (node.isInState("Item_Maintenance_Workflow", "Retail")) {
			var stateID = "Retail";
			var state = workFlow.getStateByID(stateID);
			if (node.getObjectType().getID() == "Item") {
				webUiContext.navigate("Item_Maintainance_WF_Node_Detail", node, state);
			} else if (node.getObjectType().getID() == "Companion_SKU") {
				webUiContext.navigate("Item_Maintainance_WF_Node_Details(CompSKU)", node, state);
			}
		} else if (node.isInState("Item_Maintenance_Workflow", "Entertainment")) {
			var stateID = "Entertainment";
			var state = workFlow.getStateByID(stateID);
			if (node.getObjectType().getID() == "Item") {
				webUiContext.navigate("Item_Maintainance_WF_Node_Detail", node, state);
			} else if (node.getObjectType().getID() == "Companion_SKU") {
				webUiContext.navigate("Item_Maintainance_WF_Node_Details(CompSKU)", node, state);
			}
		} else if (node.isInState("Item_Maintenance_Workflow", "DTV")) {
			var stateID = "DTV";
			var state = workFlow.getStateByID(stateID);
			if (node.getObjectType().getID() == "Item") {
				webUiContext.navigate("Item_Maintainance_WF_Node_Detail", node, state);
			} else if (node.getObjectType().getID() == "Companion_SKU") {
				webUiContext.navigate("Item_Maintainance_WF_Node_Details(CompSKU)", node, state);
			}
		}
	}
}

function setCSCandRSC(node,childOrgItem){
		
	var parentRSC =  node.getValue("Requested_Standard_Cost").getSimpleValue();
	var parentCSC =  node.getValue("Current_Standard_Cost").getSimpleValue();
	if(parentRSC){
		childOrgItem.getValue("Requested_Standard_Cost").setSimpleValue(parentRSC);
	}
	if(parentCSC){
		childOrgItem.getValue("Current_Standard_Cost").setSimpleValue(parentCSC);
	}	
}



/*===== business library exports - this part will not be imported to STEP =====*/
exports.materialType = materialType
exports.propOrgs = propOrgs
exports.materialTypeASE = materialTypeASE
exports.setChildOrgAttributes = setChildOrgAttributes
exports.updateChildOrgsAttributes = updateChildOrgsAttributes
exports.setSerialGeneration = setSerialGeneration
exports.setExtAppDownloadCode = setExtAppDownloadCode
exports.setSendItemInfo = setSendItemInfo
exports.setItemStatus = setItemStatus
exports.setCogsAndSalesAccountOrg = setCogsAndSalesAccountOrg
exports.setInventoryAssetValue = setInventoryAssetValue
exports.setMinMaxQty = setMinMaxQty
exports.setSerialStatusEnabled = setSerialStatusEnabled
exports.setWIPSupplyType = setWIPSupplyType
exports.setExpenseAccountOrg = setExpenseAccountOrg
exports.setTransportLeadTime = setTransportLeadTime
exports.setInventoryPlanningCode = setInventoryPlanningCode
exports.setShippable = setShippable
exports.setInvoiceCloseTolerancePercentage = setInvoiceCloseTolerancePercentage
exports.setListPrice = setListPrice
exports.setDefaultSerialStatusId = setDefaultSerialStatusId
exports.setFullLeadTime = setFullLeadTime
exports.dcChildOrgUiNavigation = dcChildOrgUiNavigation
exports.setCSCandRSC = setCSCandRSC