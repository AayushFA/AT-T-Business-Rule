/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_PBOM_Import_Validations",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_BOM_Smartsheet_Conditions" ],
  "name" : "PBOM Import Validations",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Bill_Of_Material" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_BOM_Common_Validation",
    "libraryAlias" : "commonBomValidationLib"
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
    "contract" : "ManagerBindContract",
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "dataIssues",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,dataIssues,commonBomValidationLib) {
var errorFlag = false;
var parentItemNumError = commonBomValidationLib.validateReferencedMSTItem(node, stepManager, "Parent");
if (parentItemNumError) {
  dataIssues.addError(parentItemNumError);
  errorFlag = true;
}
var pbomWorkflowError = commonBomValidationLib.validateBomAwaitingWorkflowState(node);
if (pbomWorkflowError) {
     dataIssues.addError(pbomWorkflowError);
  errorFlag = true;
}
if (errorFlag) {
    return dataIssues;
} else {
    return true;
}
}