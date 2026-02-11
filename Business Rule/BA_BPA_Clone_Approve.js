/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_Clone_Approve",
  "type" : "BusinessAction",
  "setupGroups" : [ "BA_BPAClone" ],
  "name" : "BPA Clone Approve",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item", "BPA" ],
  "allObjectTypesValid" : false,
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
//author @aw240u@att.com(Aayush Kumar Mahato)
//Aprrove and submit Routing happening using this Business rule

var workFlowInstance = node.getWorkflowInstanceByID("BPA_Clone");
var stateID = "Enrich_ClonedBPA";
var task = workFlowInstance.getTaskByID(stateID);
if (task != null) {
    var event = task.triggerByID("CloneSubmit", "Routing to Awaiting EBS publish state");
    var message = event.getScriptMessage();
    if (message == null) {
        var Workflow = manager.getWorkflowHome().getWorkflowByID("BPA_Clone")
        var State = Workflow.getStateByID("Enrich_ClonedBPA");
        webui.navigate("BPA_Clone_WF_Enrichment_TaskList", null, State);
        webui.showAlert("INFO", "Object Approved successfully");
    } else {
        webui.showAlert("ERROR", message);
    }
}
}