/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_Clone_Return_Task_List",
  "type" : "BusinessAction",
  "setupGroups" : [ "BA_BPAClone" ],
  "name" : "BPA Clone Return Task List",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
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
//author: aw240u(aayush kumar mahato)
if (node.isInState("BPA_Clone", "Suspend_Sources_BPA")) {
  var Workflow = manager.getWorkflowHome().getWorkflowByID("BPA_Clone")
  var State = Workflow.getStateByID("Suspend_Sources_BPA");
  log.info("State: " + State);
  webui.navigate("BPA_Clone_WF_SourceSuspend_TaskList", null, State);
}
if (node.isInState("BPA_Clone", "Publish_to_EBS")) {
  var Workflow = manager.getWorkflowHome().getWorkflowByID("BPA_Clone");
  var State = Workflow.getStateByID("Publish_to_EBS");
  webui.navigate("BPA_Clone_WF_EBSResponse_TaskList", null, State);
}
if (node.isInState("BPA_Clone", "Enrich_ClonedBPA")) {
  var Workflow = manager.getWorkflowHome().getWorkflowByID("BPA_Clone");
  var State = Workflow.getStateByID("Enrich_ClonedBPA");
  webui.navigate("BPA_Clone_WF_Enrichment_TaskList", null, State);
}
if (node.isInState("BPA_Clone", "Enrich_ClonedBPA")) {
  var Workflow = manager.getWorkflowHome().getWorkflowByID("BPA_Clone");
  var State = Workflow.getStateByID("Move_Enrichment");
  webui.navigate("BPA_Clone_WF_MoveEnrich_TaskList", null, State);
}
if (node.isInState("BPA_Clone", "Enrich_ClonedBPA")) {
  var Workflow = manager.getWorkflowHome().getWorkflowByID("BPA_Clone");
  var State = Workflow.getStateByID("Copy_Enrichment");
  webui.navigate("BPA_Clone_WF_CopyEnrich_TaskList", null, State);
}
}