/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_Node_Clone_UserAction",
  "type" : "BusinessAction",
  "setupGroups" : [ "BA_BPAClone" ],
  "name" : "BPA Clone Execute UserAction(Node Detail)",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Clone_Library",
    "libraryAlias" : "clonelib"
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
exports.operation0 = function (node,manager,webui,clonelib) {
/**
 * @author : Aayush Mahato
 * @desc : to move the product from "clone start" to respective enrichment state
 */
var errorMsg = ""
var workFlowInstance = node.getWorkflowInstanceByID("BPA_Clone");
var task = workFlowInstance.getTaskByID("Start");
var userAction = node.getValue("BPA_Clone_WF_UserAction").getID();
if (!userAction) {
  errorMsg = errorMsg + "\n" + node.getID() + "<html><body><b><font color = red>  : Please Provide User Action to execute </font></b></body></html>";
} else if (userAction == "Copy") {
	if (clonelib.wrlnUserCheck(manager)) {
  	var busSource = node.getValue("Legacy_Source").getID();
    if (busSource == "WRLN_NON" || busSource == "WRLN" || busSource == "QTE" || busSource == "DTV_NTW") {
      task.triggerByID("Copy", "moving to move enrichment");
      errorMsg = errorMsg + "\n" + node.getID() + "<html><body><b><font color = green> : Moved to Copy Enrichment State </font></b></body></html>";
      var Workflow = manager.getWorkflowHome().getWorkflowByID("BPA_Clone")
      var State = Workflow.getStateByID("Copy_Enrichment");
      webui.navigate("BPA_Clone_WF_CopyEnrich_TaskList", null, State);
    } else {
      errorMsg = errorMsg + "\n" + node.getID() + "<html><body><b><font color = red> The Business Source must be Wireline to use copy action.  </font></b></body></html>";
    }
  } else {
    errorMsg = errorMsg + "\n <html><body><b><font color = red>Only Wireline Engineer or Sourcing user have access to Copy Item with Regions Action.</font></b></body></html>";
  }
} else if (userAction == "Move") {
  task.triggerByID("Move", "moving to copy enrichment");
  errorMsg = errorMsg + "\n" + node.getID() + "<html><body><b><font color = green>  : Moved to Move Enrichment State </font></b></body></html>";
  var Workflow = manager.getWorkflowHome().getWorkflowByID("BPA_Clone")
  var State = Workflow.getStateByID("Move_Enrichment");
  webui.navigate("BPA_Clone_WF_MoveEnrich_TaskList", null, State);
} else if (userAction == "Clone") {
  var wfBPAClone = manager.getWorkflowHome().getWorkflowByID("BPA_Clone");
  var clonedBPA = clonelib.createClone(node, manager, log);
  clonedBPA.getValue("BPA_Clone_WF_UserAction").setLOVValueByID("Clone");
  wfBPAClone.start(clonedBPA, null);
  task.triggerByID("stibo.suspend", "Moved to suspend state");
  errorMsg = errorMsg + "\n" + clonedBPA.getID() + "<html><body><b><font color = green>  : Moved to Clone Enrichment State </font></b></body></html>";
  var Workflow = manager.getWorkflowHome().getWorkflowByID("BPA_Clone")
  var State = Workflow.getStateByID("Enrich_ClonedBPA");
  webui.navigate("BPA_Clone_WF_Enrichment_TaskList", null, State);
}
if (errorMsg) {
  webui.showAlert("Warning", "Result Details: ", errorMsg);
}

}