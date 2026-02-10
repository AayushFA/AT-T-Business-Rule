/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ABC_Task_Reassignment_Notification",
  "type" : "BusinessAction",
  "setupGroups" : [ "ABC_BusinessAction" ],
  "name" : "ABC Workflow Task Reassignment Notification",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_Audit_Library",
    "libraryAlias" : "libAudit"
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
    "contract" : "MailHomeBindContract",
    "alias" : "mailHome",
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
exports.operation0 = function (node,mailHome,webui,libAudit) {
var nodes;
if (node) {
	nodes = java.util.Arrays.asList(node);
} else {
	nodes = webui.getSelection();
}
if (nodes.size() == 0) {
	return;
}
execute(nodes);

function execute(selectedNodes) {
	var firstNode = selectedNodes.get(0);
	var WFInstance = firstNode.getWorkflowInstanceByID("ABC_Workflow");
	var targetState = null;
	if (firstNode.isInState("ABC_Workflow", "ALM_Enrichment_State")) {
		targetState = "ALM_Enrichment_State";
	} else if (firstNode.isInState("ABC_Workflow", "ABC_Failed_State")) {
		targetState = "ABC_Failed_State";
	} else {
		return;
	}
	for (var i = 1; i < selectedNodes.size(); i++) {
		var node = selectedNodes.get(i);
		if (!node.isInState("ABC_Workflow", targetState)) {
			return;
		}
	}
	var userTasksMap = {};
	for (var j = 0; j < selectedNodes.size(); j++) {
		var node = selectedNodes.get(j);
		var WFInstance = node.getWorkflowInstanceByID("ABC_Workflow");
		var task = WFInstance.getTaskByID(targetState);
		var assignee = task.getAssignee();
		if (assignee) {
			var userEmail = assignee.getEMail();
			var taskInfo = {
				name: node.getName(),
				objectType: node.getObjectType().getName(),
				id: node.getID()
			};
			if (!userTasksMap[userEmail]) {
				userTasksMap[userEmail] = [];
			}
			userTasksMap[userEmail].push(taskInfo);
		}
	}
	var stateName =stateNodeName(node);
	var instanceName = libAudit.getHostEnvironment();
	var sender = instanceName + "-noreply@cloudmail.stibo.com";
	for (var userEmail in userTasksMap) {
		var tasks = userTasksMap[userEmail];
		var body = "Dear User,\n\n" + "A " +stateName+" task has been assigned to you. \n"+"Please login to STEP to take appropriate actions.\n\n" + "Workflow: Catalog Management Workflow\n" + "State: " + stateName + "\n\n";
		for (var k = 0; k < tasks.length; k++) {
			var t = tasks[k];
			var taskNumber = k + 1;
			body += taskNumber +". Object Type: " + t.objectType +"\n"+ "    STEP ID: " + t.id + "\n" + "    Name: " + t.name +  "\n\n";
		}
		body += "If you feel that this task was assigned to you in error, please contact WTSC Data Governance (g12717@att.com).";
		var mail = mailHome.mail();
		mail.from(sender);
		mail.addTo(userEmail);
		mail.subject("A "+stateName+" Task Has Been Assigned To You");
		mail.plainMessage(body);
		mail.send();
	}
}
function stateNodeName(node) {
  var wflwHme = node.getWorkflowInstanceByID("ABC_Workflow");
  var state = wflwHme.getTasks().toArray();
  state = state[0].getState().getTitle();
  return state
}
}