/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SPL_Review_Approve_OnSelect",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_SPL_Web_UI_Actions" ],
  "name" : "SPL Review Web UI Approve Action",
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
var workflow = stepManager.getWorkflowHome().getWorkflowByID("SPI_Onboarding");
//1. Generate UPC & GTIN
//2. Create Child Orgs & Generate Item Number for Child Orgs
//3. Send Successful Email with list of all Items Data
//4. Reset Batch Id
//5. Approves all Nodes
splLib.processWorkflowCompleteItems(stepManager,queryHome);
	
var stateNew = workflow.getStateByID("Finish")
webUi.navigate("SPI_Finish_Tasklist", null, stateNew);
}