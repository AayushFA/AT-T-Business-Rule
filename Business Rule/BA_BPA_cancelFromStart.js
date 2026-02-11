/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_cancelFromStart",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_CT_BusinessAction" ],
  "name" : "Cancel from start state",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "lib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (webui,step,lib) {
//author: Madhuri

var selection = webui.getSelection();
selection.forEach(function execute(node) {
	var currentWFinstance = node.getWorkflowInstanceByID("BPA_Clone");
	if (currentWFinstance) {
		node.getValue("BPA_Clone_WF_UserAction").setSimpleValue("");
		IDArray = ['BPA_Clone_WF_UserAction'];
		lib.partialApproveFields(node, IDArray);
	     currentWFinstance.delete("Cancelled,removed from BPA clone workflow");
	     webui.navigate("BPA_Home_Page", null);
	}
});
}