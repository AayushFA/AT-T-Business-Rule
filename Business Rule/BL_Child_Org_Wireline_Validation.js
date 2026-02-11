/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Child_Org_Wireline_Validation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Validation_Libraries" ],
  "name" : "Child Org Wireline Validation Library",
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
 * @author - Anudeep
 * Rule Name: Max_MinMax_Qty_NonStock_Items
 * Rule for child org
 */ 
function validateMinMaxQtyMaximum(node){
	var minMaxQtyMaximum = node.getValue("Min_Max_Qty_Maximum").getSimpleValue();
	var itemStatus = node.getValue("Item_Status_WRLN").getID();
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	const itemTypeList = ["Cable","Minor Material","Hardwired","Plug-In"];
	errorMessage="";
	if (itemTypeList.includes(String(materialItemType)) && itemStatus != "Active S" && minMaxQtyMaximum){
		errorMessage= "Min Max Quantity Maximum should be NULL for Non Stock Enabled Items.";
	}
	return errorMessage;
}

function validateMinMaxPack(node) {
	var errorMessage = '';
	if (parseInt(node.getValue("Min_Max_Qty_Maximum").getSimpleValue()) < parseInt(node.getValue("Stock_STD_Pack").getSimpleValue())) {
		errorMessage = "Min Max Quantity should be greater than STD Pack";
	}
	return errorMessage;
}

function validateMinMaxComparison(node) {
	var errorMessage = '';
	if (parseInt(node.getValue("Min_Max_Qty_Maximum").getSimpleValue()) > 0) {
		if (parseInt(node.getValue("Min_Max_Qty_Maximum").getSimpleValue()) < parseInt(node.getValue("Min_Max_Qty_Minimum").getSimpleValue())) {
			errorMessage = "Min Max Qty Maximum should not be less than Min Max Qty Minimum";
		}
	}
	return errorMessage;
}

function validateConsignInd(node) {
	var errorMessages = [];
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	var consignmentIndicator = node.getValue("Consignment").getID();
	var itemStatus = node.getValue("Item_Status_WRLN").getID();
	if (materialItemType && consignmentIndicator && materialItemType == "Plug-In" && consignmentIndicator == "1") {
		errorMessages.push("Plug-In Item cannot be Consigned.");
	}
	if (materialItemType !== "Plug-In" && itemStatus != "Active S" && consignmentIndicator == "1") {
		errorMessages.push("Only Active Stocked Item can be Consigned.");
	}
	return errorMessages.join('\n').toString();
}

function validateStockPackRequirements(node) {
	var itemType = node.getValue("Material_Item_Type_Web").getID();
	var itemStatus = node.getValue("Item_Status_WRLN").getID();
	var organization = node.getValue("Organization_Code").getID();
	var maxQty = node.getValue("Min_Max_Qty_Maximum").getSimpleValue();
	var stdPackQty = node.getValue("Stock_STD_Pack").getSimpleValue();
	var validTypes = ["Minor Material", "Cable"];
	var validOrgs = ["MW1", "SW1", "WE2", "WE3"];
	var errorMessage = [];
	if (itemType && itemStatus) {
		itemType = itemType + "";
		if (validTypes.includes(String(itemType)) && itemStatus == "Active S") {
			organization = organization + "";
			if (validOrgs.includes(String(organization))) {
				if (!maxQty || maxQty == "0") {
					errorMessage.push("Min Max Qty Maximum is required for stocked Minor Material or Cable items.");
				}
				if (!stdPackQty || stdPackQty == "0") {
					errorMessage.push("Stock STD Pack is required for stocked Minor Material or Cable items.");
				}
			}
			return errorMessage.join('\n').toString();
		}
	}
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.validateMinMaxQtyMaximum = validateMinMaxQtyMaximum
exports.validateMinMaxPack = validateMinMaxPack
exports.validateMinMaxComparison = validateMinMaxComparison
exports.validateConsignInd = validateConsignInd
exports.validateStockPackRequirements = validateStockPackRequirements