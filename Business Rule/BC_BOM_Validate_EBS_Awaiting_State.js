/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_BOM_Validate_EBS_Awaiting_State",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_BOM_Web_UI_Conditions" ],
  "name" : "BOM Validate EBS Awaiting State",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BOM_Child", "Bill_Of_Material", "BOM_Child_Substitute" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,commonBomValidationLib) {
if (commonBomValidationLib.validatePbomWorkflowState(node, "ATT_BOM_Workflow", "EBS_Awaiting_Feedback")) {
    return true;
} else {
    return false;
}
}