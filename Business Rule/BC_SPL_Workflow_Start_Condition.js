/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_SPL_Workflow_Start_Condition",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_SPL_Conditions" ],
  "name" : "SPL Workflow Start Condition",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_SPL_Derivation",
    "libraryAlias" : "splLib"
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
exports.operation0 = function (node,stepManager,queryHome,dataIssues,splLib) {
var errorFlag = false;

var itemNumber = node.getValue("Item_Num").getSimpleValue();
var batchId = node.getValue("Batch_Id").getSimpleValue();
var startStateIdList = [];
var enrichStateIdList = [];
var reviewBatchIdList = [];
var publishQueueBatchIdList = [];
var feedbackBatchIdList = [];
var finishBatchIdList = [];
var startStatelist = getNodesInState("SPI_Onboarding", "Start", startStateIdList, stepManager,queryHome);
var enrichStatelist = getNodesInState("SPI_Onboarding", "SPI_Enrichment", enrichStateIdList, stepManager,queryHome);
var reviewStatelist = getNodesInState("SPI_Onboarding", "SPI_Review", reviewBatchIdList, stepManager,queryHome);
var finishStatelist = getNodesInState("SPI_Onboarding", "Finish", finishBatchIdList, stepManager,queryHome);

var count = 0;
if (node.getParent().getObjectType().getID() == "CancelledType") {
    dataIssues.addWarning("Cancelled Object cannot be initiated into WorkFlow");
    errorFlag = true;
}

if (itemNumber) {
    dataIssues.addWarning("Existing Items with Item Number cannot be initiated into SPI Workflow");
    errorFlag = true;
}

if (startStatelist.length == 0 && ( enrichStatelist.length > 0 || reviewStatelist.length > 0  || finishStatelist.length > 0 )) {
    dataIssues.addWarning("Current Batch is in progress, hence cannot initiate new products");
    errorFlag = true;
}

if (batchId == null) {
    dataIssues.addWarning("Items has no Batch ID hence,cannot be initiated into SPI Workflow");
    errorFlag = true;
} else {
    var idList = startStatelist.length;
    if (idList > 0) {
        for (i = 0; i < idList; i++) {
            var stepId = startStatelist[i];
            var stepObject = stepManager.getProductHome().getProductByID(stepId);
            // set Reserved_Item_Numt to reservedItemNum
            var listBatchId = stepObject.getValue("Batch_Id").getSimpleValue();
            if (listBatchId != batchId) {
                count = count + 1;
            }
        }
    }
}

if (count > 0) {
    dataIssues.addWarning("Item exist in Batch Request State with different Batch id in workflow,hence cannot initiate into workflow");
    errorFlag = true;
}

if (errorFlag) {
    return dataIssues;
} else {
    return true
}

function getNodesInState(workflowID, stateID, listName, manager,queryHome) {
    var condition = com.stibo.query.condition.Conditions;
    var query = splLib.getAllSPLWorkflowTasks(manager, queryHome, condition);
    if (query) {
        query.forEach(function(task) {
            var currentNode = task.getNode();
            if (currentNode.isInState(workflowID, stateID)) {
                listName.push(currentNode.getID());
            }
            return true;
        });
    }
    return listName;
}
}