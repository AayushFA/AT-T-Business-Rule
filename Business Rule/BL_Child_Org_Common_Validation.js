/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Child_Org_Common_Validation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Validation_Libraries" ],
  "name" : "Child Org Common Validation Library",
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
//function to check if the Child Org is already present on the Parent Item.
function validateChildOrgObject(node, stepManager, orgCode) { 
	var newItemKey = stepManager.getNodeHome().getObjectByKey("Child.Org.Item.Key", node.getID() + "." + orgCode);
	var itemNum = node.getValue("Item_Num").getSimpleValue();
	if (itemNum) var updtItemKey = stepManager.getNodeHome().getObjectByKey("DM.Child.Item.Key", itemNum + "." + orgCode);
	if (newItemKey || updtItemKey) {
		return false;
	} else {
		return true;
	}
}

function validateMinMaxQtyFields(node){
	var errorMessage = "";
	if(parseInt(node.getValue("Min_Max_Qty_Maximum").getSimpleValue()) >0){
		if (parseInt(node.getValue("Min_Max_Qty_Maximum").getSimpleValue()) < parseInt(node.getValue("Min_Max_Qty_Minimum").getSimpleValue())) {		
			errorMessage = "Min Max Qty Maximum should not be less than Min Max Qty Minimum";
		   }
	}
	return errorMessage;
}

// for ent&RTL
function validateExpenseAccount(node) {
  var costingEnabled   = node.getValue("Costing_Enabled").getID();
  var inventoryFlag    = node.getValue("Inventory_Asset_Value").getID();
  var expenseAccount   = node.getValue("Expense_Account_Org").getID();
  var errorMessage="";
  if (costingEnabled == "Y"){
	if (inventoryFlag != "Y" && !expenseAccount){
	errorMessage= "If item is costing enabled, Inventory Asset must be Y or Expense acct must be provided";
	}
  }
  return errorMessage;
}

/*===== business library exports - this part will not be imported to STEP =====*/
exports.validateChildOrgObject = validateChildOrgObject
exports.validateMinMaxQtyFields = validateMinMaxQtyFields
exports.validateExpenseAccount = validateExpenseAccount