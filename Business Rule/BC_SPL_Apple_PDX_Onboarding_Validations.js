/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_SPL_Apple_PDX_Onboarding_Validations",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_SPL_Conditions" ],
  "name" : "SPL Apple PDX Onboarding Validations",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_SPL_Validation_Library",
    "libraryAlias" : "splValidationLib"
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
    "contract" : "QueryHomeBindContract",
    "alias" : "queryHome",
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
exports.operation0 = function (node,stepManager,queryHome,dataIssues,splValidationLib) {
var errorMessage = "";
errorMessage += splValidationLib.validateMandatoryAttribute(node, "Mfg_Part_No", stepManager);
errorMessage += splValidationLib.validateDuplicateAttributeValue(node,"Mfg_Part_No",stepManager,queryHome);

if (errorMessage) {
	dataIssues.addWarning(errorMessage);
	return dataIssues;
} else {
	return true;
}
}