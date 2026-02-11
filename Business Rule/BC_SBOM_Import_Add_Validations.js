/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_SBOM_Import_Add_Validations",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_BOM_Smartsheet_Conditions" ],
  "name" : "SBOM Import Add Validations",
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
exports.operation0 = function (node,stepManager,dataIssues,commonBomDerivationLib,commonBomValidationLib) {
var errorFlag = false;
var parentItemNumber = node.getValue("Parent_Item").getSimpleValue();
var parentItem = stepManager.getNodeHome().getObjectByKey("Item.Key", parentItemNumber);
var substituteItemNum = node.getValue("Substitute_Item_Num").getSimpleValue();
var substituteItem = stepManager.getNodeHome().getObjectByKey("Item.Key", substituteItemNum);
if (substituteItem) {
    var subItemLOB = substituteItem.getValue("Line_Of_Business").getID();
    var itemStatus = substituteItem.getValue("Item_Status").getID();
}
if (parentItem) {
    var parentItemLOB = parentItem.getValue("Line_Of_Business").getID();
}
var mandatorySubstituteItemError = commonBomValidationLib.validateMandatoryAttribute(node, stepManager, "Substitute_Item_Num", null)
if (mandatorySubstituteItemError) {
    dataIssues.addError(mandatorySubstituteItemError);
    errorFlag = true;
}
var substituteItemError = commonBomValidationLib.validateReferencedMSTItem(node, stepManager, "Substitute");
if (substituteItemError) {
    dataIssues.addError(substituteItemError);
    errorFlag = true;
}
//SBOM_ValidateItemNumber &
var pbomWorkflowError = commonBomValidationLib.validateBomAwaitingWorkflowState(node);
if (pbomWorkflowError) {
    dataIssues.addError(pbomWorkflowError);
    errorFlag = true;
}
//SBOM_ValidateDate
var bomDateError = commonBomValidationLib.validateBOMEndDate(node);
if (bomDateError) {
    dataIssues.addError(bomDateError);
    errorFlag = true;
}
//SBOM_ValidateDuplicateItemNumber
var duplicateSubstituteBomError = commonBomValidationLib.validateDuplicateSubstitute(node, stepManager);
if (duplicateSubstituteBomError) {
    dataIssues.addError(duplicateSubstituteBomError);
    errorFlag = true;
}
//BC_SBOM_AddImportValidations
var mandatoryParentItemError = commonBomValidationLib.validateMandatoryAttribute(node, stepManager, "Parent_Item", null)
if (mandatoryParentItemError) {
    dataIssues.addError(mandatoryParentItemError);
    errorFlag = true;
}
var mandatoryChildItemError = commonBomValidationLib.validateMandatoryAttribute(node, stepManager, "Child_Item", null)
if (mandatoryChildItemError) {
    dataIssues.addError(mandatoryChildItemError);
    errorFlag = true;
}
var mandatoryQuantityperError = commonBomValidationLib.validateMandatoryAttribute(node, stepManager, "Substitute_Quantity_Per", null)
if (mandatoryQuantityperError) {
    dataIssues.addError(mandatoryQuantityperError);
    errorFlag = true;
}
var parentItemError = commonBomValidationLib.validateReferencedMSTItem(node, stepManager, "Parent");
if (parentItemError) {
    dataIssues.addError(parentItemError);
    errorFlag = true;
}
var qunatityperError = commonBomValidationLib.validateBOMQuantityPer(node);
if (qunatityperError) {
    dataIssues.addError(qunatityperError);
    errorFlag = true;
}
var lineofbusinessMatchError = commonBomValidationLib.validateLineOfBusinessMatch(subItemLOB, parentItemLOB, parentItemNumber, substituteItemNum, "Substitute");
if (lineofbusinessMatchError) {
    dataIssues.addError(lineofbusinessMatchError);
    errorFlag = true;
}
var parentItemStatusError = commonBomValidationLib.validateBomItemStatus(node, stepManager, parentItemLOB, "Parent_Item", "Parent");
if (parentItemStatusError) {
    dataIssues.addError(parentItemStatusError);
    errorFlag = true;
}
var childItemStatusError = commonBomValidationLib.validateBomItemStatus(node, stepManager, parentItemLOB, "Child_Item", "Child");
if (childItemStatusError) {
    dataIssues.addError(childItemStatusError);
    errorFlag = true;
}
var substituteItemStatusError = commonBomValidationLib.validateBomItemStatus(node, stepManager, parentItemLOB, "Substitute_Item_Num", "Substitute");
if (substituteItemStatusError) {
    dataIssues.addError(substituteItemStatusError);
    errorFlag = true;
}
var bomWithinBomError = commonBomValidationLib.validateBomWithinBom(node, stepManager);
if (bomWithinBomError) {
    dataIssues.addError(bomWithinBomError);
    errorFlag = true;
}
if (errorFlag) {
    return dataIssues;
} else {
    return true;
}
}