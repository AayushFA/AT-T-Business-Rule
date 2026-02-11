/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SPL_Data_Enrichment_Cancel",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_SPL_Web_UI_Actions" ],
  "name" : "SPL Data Enrichment Web UI Cancel Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : true,
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
  "pluginId" : "JavaScriptBusinessActionWithBinds",
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
    "contract" : "WebUiContextBind",
    "alias" : "webUi",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "QueryHomeBindContract",
    "alias" : "queryHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,webUi,queryHome,splLib) {
/**
 * @author - Aditya Rudragoudar
 * Cancels the current batch from enrirchment state
 */

log.info("Inside SPL Data Enrichment Cancel Action");
var cancelFolder = stepManager.getProductHome().getProductByID("CancelledProducts");
var condition = com.stibo.query.condition.Conditions;
var query = splLib.getAllSPLWorkflowTasks(stepManager, queryHome, condition);

if (query) {
    query.forEach(function(task) {
        var currentNode = task.getNode();
        if (currentNode.isInState("SPI_Onboarding", "SPI_Enrichment")) {       
            task.triggerByID("Cancel", "Removed from workflow on cancel");
            splLib.setAttributesNull(currentNode);
            splLib.deleteKey(currentNode,stepManager);
        }
        currentNode.setParent(cancelFolder);
        return true;
    });
}

var screenId=webUi.getScreenId();
webUi.navigate(screenId,node);
}