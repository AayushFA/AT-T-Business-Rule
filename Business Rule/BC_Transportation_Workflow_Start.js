/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Transportation_Workflow_Start",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Workflow_Conditions" ],
  "name" : "Transportation Maintenance Workflow Start Condition",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Companion_SKU", "Item" ],
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
/*
============================================================================================================
 Business Condition : BC_Transportation_Workflow_Start
 Author        : AS388G (Aditya Sreepad)
 Description   : Item Transportation Attribute Maintenance Workflow Start Pre-condition

REVISION HISTORY
=======
VERSION  DATE        AUTHOR(S)               DESCRIPTION
-------- ----------- ----------------------- ---------------------------------------------------------------
1.0      17-SEP-2025 AS388G (Aditya Sreepad)  PDH - STIBO Transition (CTXSCM-4769 TRANSPORTATION)
============================================================================================================
*/

var errorFlag = false;

/*
var userRoleError = commonValidationLib.validateUserRole(node, stepManager, lookUpTable);
if (userRoleError) {
	dataIssues.addError(userRoleError);
	errorFlag = true;
}
*/
var userGroups = stepManager.getCurrentUser().getGroups().toString();
if (userGroups.contains("UG_Transportation_Item_Planner") || userGroups.contains("Stibo") || userGroups.contains("Super user")) {
  //do nothing
} else {
  dataIssues.addError("User is not privileged to Initiate to Transportation Workflow");
  errorFlag = true;
}


if (node.getParent().getObjectType().getID() == "CancelledType") {
	dataIssues.addError("Cancelled Object cannot be initiated into WorkFlow");
	errorFlag = true;
}

if (node.isInWorkflow("WF_Transportation_Workflow")) {
    dataIssues.addWarning("ERROR: Item is already in Transportation Workflow.");
    errorFlag = true;
}

var itemNum = node.getValue("Item_Num").getSimpleValue();
if( !itemNum ) {
    dataIssues.addError("Item Number is mandatory to initiate Transportation Maintenance Workflow");
    errorFlag = true;
}

/*
if (node.getObjectType().getID() == "Child_Org_Item" && node.getValue("Line_Of_Business").getID() == "NTW") {
	dataIssues.addError("NTW Org cannot be initiated into Maintenance WorkFlow");
	errorFlag = true;
}
*/

if (errorFlag) {
	return dataIssues;
} else {
	return true;
}



	
	
}