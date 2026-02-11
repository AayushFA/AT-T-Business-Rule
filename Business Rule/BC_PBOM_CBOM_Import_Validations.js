/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_PBOM_CBOM_Import_Validations",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_BOM_Smartsheet_Conditions" ],
  "name" : "PBOM CBOM Import Validations",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BOM_Child", "Bill_Of_Material" ],
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
//var parentItemNumber = node.getValue("Parent_Item").getSimpleValue();
var parentItemNumber = node.getParent().getValue("Parent_Item").getSimpleValue();
var parentItem = stepManager.getNodeHome().getObjectByKey("Item.Key", parentItemNumber);
var childItemNumber = node.getValue("Child_Item").getSimpleValue();
var childItem = stepManager.getNodeHome().getObjectByKey("Item.Key", childItemNumber);
if (parentItem) {
    var parentItemLOB = parentItem.getValue("Line_Of_Business").getID();
    var parentBOMType = parentItem.getValue("NTW_BOM_Type").getID();
}
if (childItem) {
    var childItemLOB = childItem.getValue("Line_Of_Business").getID();
    var itemStatus = childItem.getValue("Item_Status").getID();
}
//Mandatory Attributes
var mandatoryChildItemNumError = commonBomValidationLib.validateMandatoryAttribute(node, stepManager, "Child_Item", null);
if (mandatoryChildItemNumError) {
    dataIssues.addError(mandatoryChildItemNumError);
    errorFlag = true;
}
var mandatoryParentItemNumError = commonBomValidationLib.validateMandatoryAttribute(node, stepManager, "Parent_Item", "Parent");
if (mandatoryParentItemNumError) {
    dataIssues.addError(mandatoryParentItemNumError);
    errorFlag = true;
}
var mandatoryChildsMSTItemNumError = commonBomValidationLib.validateReferencedMSTItem(node, stepManager, "Child");
if (mandatoryChildsMSTItemNumError) {
    dataIssues.addError(mandatoryChildsMSTItemNumError);
    errorFlag = true;
}
var mandatoryStartDateError = commonBomValidationLib.validateMandatoryAttribute(node, stepManager, "BOM_Start_Date", null);
if (mandatoryStartDateError) {
    dataIssues.addError(mandatoryStartDateError);
    errorFlag = true;
}
var mandatoryQtyError = commonBomValidationLib.validateMandatoryAttribute(node, stepManager, "BOM_Quantity_Per", null);
if (mandatoryQtyError) {
    dataIssues.addError(mandatoryQtyError);
    errorFlag = true;
}
if (parentBOMType && parentItemLOB && parentBOMType == "NON Stock" && parentItemLOB == "WRLN") {
    var bomPriceError = commonBomValidationLib.validateChildBOMPrice(node);
    if (bomPriceError) {
        dataIssues.addError(bomPriceError);
        errorFlag = true;
    }
    var childRefError = commonBomValidationLib.validateChildRef(node.getParent(),node, stepManager);
    if (childRefError) {
       dataIssues.addError(childRefError);
        errorFlag = true;
    }
}
var qtyError = commonBomValidationLib.validateBOMQuantityPer(node);
if (qtyError) {
    dataIssues.addError(qtyError);
    errorFlag = true;
}
var startDateError = commonBomValidationLib.validateStartDate(node);
if (startDateError) {
    dataIssues.addError(startDateError);
    errorFlag = true;
}
var endDateError = commonBomValidationLib.validateBOMEndDate(node);
if (endDateError) {
    dataIssues.addError(endDateError);
    errorFlag = true;
}
var mandatoryPbomMSTItemNumError = commonBomValidationLib.validateReferencedMSTItem(node, stepManager, "Parent");
if (mandatoryPbomMSTItemNumError) {
    dataIssues.addError(mandatoryPbomMSTItemNumError);
    errorFlag = true;
}
if (parentItem && childItem) {
    // Initiate Workflow
    var pbomWorkflowError = commonBomValidationLib.validateBomAwaitingWorkflowState(node);
    if (pbomWorkflowError) {
        dataIssues.addError(pbomWorkflowError);
        errorFlag = true;
    }
    //Match LOB
    var lineofbusinessMatchError = commonBomValidationLib.validateLineOfBusinessMatch(childItemLOB, parentItemLOB, parentItemNumber, childItemNumber, "Child");
    if (lineofbusinessMatchError) {
        dataIssues.addError(lineofbusinessMatchError);
        errorFlag = true;
    } else {
        //Validate Item Status
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
        if (parentItemLOB == "NTW") {
            var extAppDownloadCodeError = commonBomValidationLib.validateExtAppDownloadCode(node, stepManager);
            if (extAppDownloadCodeError) {
                dataIssues.addError(extAppDownloadCodeError);
                errorFlag = true;
            }
        }
    }
}
//Validate Duplicate check
var duplicateItemBomError = commonBomValidationLib.validateDuplicateChildBom(node, stepManager);
if (duplicateItemBomError) {
    dataIssues.addError(duplicateItemBomError);
    errorFlag = true;
}
var bomWithinBomError = commonBomValidationLib.validateBomWithinBom(node, stepManager);
if (bomWithinBomError) {
    dataIssues.addError(bomWithinBomError);
    errorFlag = true;
}
if (parentItemLOB == "RTL" || parentItemLOB == "ENT") {
    var childorgError = commonBomValidationLib.validateChildOrgs(node, stepManager);
    if (childorgError) {
        dataIssues.addError(childorgError);
        errorFlag = true;
    }
}
if (errorFlag) {
    return dataIssues;
} else {
    return true;
}
}