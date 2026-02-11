/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Initiate_ChildOrg_Maintenance_WF",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Web_UI_Actions" ],
  "name" : "Initiate ChildOrg Maintenance Workflow",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Item", "Companion_SKU" ],
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
//this business rule is used to initiate to maintenance workflow from node detail screen
var workflowId = "Item_Maintenance_Workflow";
var successMessage = "Item moved into Maintenance Workflow";
var errorMessage = "Item Already in Maintenance Workflow";

if(node.isInWorkflow(workflowId)) {	
	webui.showAlert("ERROR", "Error Message", errorMessage);
} else if(node.getObjectType().getID() == "Child_Org_Item" && node.getValue("Line_Of_Business").getID() == "NTW") {				
	webui.showAlert("ERROR", "NTW Org cannot be initiated into Maintenance WorkFlow", "");
}else {	
	node.startWorkflowByID(workflowId, successMessage);
	webui.showAlert("ACKNOWLEDGMENT", "Successful Message", successMessage);
}
}