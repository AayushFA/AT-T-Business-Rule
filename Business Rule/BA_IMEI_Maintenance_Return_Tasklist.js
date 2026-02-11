/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_IMEI_Maintenance_Return_Tasklist",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_IMEI_Web_UI_Actions" ],
  "name" : "IMEI Maintenance Return Tasklist",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,webui) {
var workflow = manager.getWorkflowHome().getWorkflowByID("IMEI_Maintenance_Workflow");

var stateEnrichment = workflow.getStateByID("Enrichment");

if (node.isInState("IMEI_Maintenance_Workflow", "Enrichment")) {
    webui.navigate("IMEI_Maintenance_Enrichment_State_Task_List", null, stateEnrichment);
}
}