/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_Maintenance_Workflow_Start",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Workflow_Conditions" ],
  "name" : "Item Maintenance Workflow Start Condition",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Companion_SKU", "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Common_Validation",
    "libraryAlias" : "commonValidationLib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "dataIssues",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUpTable",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,dataIssues,stepManager,lookUpTable,commonValidationLib) {
/**
 * @author - Madhuri, John, Aditya R [CTS]
 * Condition to initiate Item Maintenance WorkFlow
 */
var errorFlag = false;

var userRoleError = commonValidationLib.validateUserRole(node, stepManager, lookUpTable);
if (userRoleError) {
	dataIssues.addError(userRoleError);
	errorFlag = true;
}

if (node.getParent().getObjectType().getID() == "CancelledType") {
	dataIssues.addError("Cancelled Object cannot be initiated into WorkFlow");
	errorFlag = true;
}

if (node.isInWorkflow("Item_Maintenance_Workflow")) {
    dataIssues.addWarning("ERROR: Item is already in Maintenance Workflow.");
    errorFlag = true;
}

var itemNum = node.getValue("Item_Num").getSimpleValue();
if( !itemNum ) {
    dataIssues.addError("Item Number is mandatory to initiate Maintenance WorkFlow");
    errorFlag = true;
}

if (node.getObjectType().getID() == "Child_Org_Item" && node.getValue("Line_Of_Business").getID() == "NTW") {
	dataIssues.addError("NTW Org cannot be initiated into Maintenance WorkFlow");
	errorFlag = true;
}

if (errorFlag) {
	return dataIssues;
} else {
	return true;
}
}