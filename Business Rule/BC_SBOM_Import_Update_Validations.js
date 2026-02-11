/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_SBOM_Import_Update_Validations",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_BOM_Smartsheet_Conditions" ],
  "name" : "SBOM Import Update Validations",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BOM_Child_Substitute" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_BOM_Common_Derivation",
    "libraryAlias" : "commonBomDerivationLib"
  }, {
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,dataIssues,stepManager,commonBomDerivationLib,commonBomValidationLib) {
var errorFlag = false;
var endDateError = commonBomValidationLib.validateBOMEndDate(node);
if (endDateError) {
    dataIssues.addError(endDateError);
    errorFlag = true;
}
var pbomWorkflowError = commonBomValidationLib.validateBomAwaitingWorkflowState(node);
if (pbomWorkflowError) {
    dataIssues.addError(pbomWorkflowError);
    errorFlag = true;
}

var mandatoryParentMSTError = commonBomValidationLib.validateMandatoryAttribute(node, stepManager, "Parent_Item", null);
if (mandatoryParentMSTError) {
    dataIssues.addError(mandatoryParentMSTError);
    errorFlag = true;
}
var mandatoryChildMSTError = commonBomValidationLib.validateMandatoryAttribute(node, stepManager, "Child_Item", null);
if (mandatoryChildMSTError) {
    dataIssues.addError(mandatoryChildMSTError);
    errorFlag = true;
}
var mandatorySubstituteMSTError = commonBomValidationLib.validateMandatoryAttribute(node, stepManager, "Temp_Import_Item_Num", "Substitute");
if (mandatorySubstituteMSTError) {
    dataIssues.addError(mandatorySubstituteMSTError);
    errorFlag = true;
}

var pitemError = commonBomValidationLib.validateItemNumberChange(node);
if (pitemError) {
    dataIssues.addError(pitemError);
    errorFlag = true;
}
if (errorFlag) {
    return dataIssues;
} else {
    return true;
}
}