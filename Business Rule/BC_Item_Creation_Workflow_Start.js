/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_Creation_Workflow_Start",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Workflow_Conditions" ],
  "name" : "Item Creation Workflow Start Condition",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
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
 * @author - Madhuri, John 
 * Condition to initiate Item Creation WorkFlow
 */

var errorFlag = false;

if (node.getParent().getObjectType().getID() == "CancelledType") {
	dataIssues.addError("Cancelled Object cannot be initiated into WorkFlow");
	errorFlag = true;
}
var userRoleError = commonValidationLib.validateUserRole(node, stepManager, lookUpTable);
if (userRoleError) {
	dataIssues.addError(userRoleError);
	errorFlag = true;
}

if (errorFlag) {
	return dataIssues;
} else {
	return true;
}

}