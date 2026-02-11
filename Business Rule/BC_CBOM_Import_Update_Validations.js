/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_CBOM_Import_Update_Validations",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_BOM_Smartsheet_Conditions" ],
  "name" : "CBOM Import Update Validations",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BOM_Child" ],
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
var parentItemNumber = node.getParent().getValue("Parent_Item").getSimpleValue();
var parentItem = stepManager.getNodeHome().getObjectByKey("Item.Key", parentItemNumber);
if (parentItem) {
	var parentBOMType = parentItem.getValue("NTW_BOM_Type").getID();
	var parentItemLob = parentItem.getValue("Line_Of_Business").getID();
}
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
var pbomMSTMandatoryError = commonBomValidationLib.validateMandatoryAttribute(node, stepManager, "Parent_Item", null);
if (pbomMSTMandatoryError) {
    dataIssues.addError(pbomMSTMandatoryError);
    errorFlag = true;
}
var cbomMSTMandatoryError = commonBomValidationLib.validateMandatoryAttribute(node, stepManager, "Temp_Import_Item_Num", "Child");
if (cbomMSTMandatoryError) {
    dataIssues.addError(cbomMSTMandatoryError);
    errorFlag = true;
}
var pitemError = commonBomValidationLib.validateItemNumberChange(node);
if (pitemError) {
    dataIssues.addError(pitemError);
    errorFlag = true;
}
if (parentBOMType == "NON Stock" && parentItemLob == "WRLN") {
    var childPriceError = commonBomValidationLib.validateChildBOMPrice(node);
    if (childPriceError) {
        dataIssues.addError(childPriceError);
        errorFlag = true;
    }
}
if (errorFlag) {
    return dataIssues;
} else {
    return true;
}
}