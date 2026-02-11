/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Item_Maintenance_Return_Tasklist",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Web_UI_Actions" ],
  "name" : "Item Maintenance Return Tasklist",
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
var workflow = manager.getWorkflowHome().getWorkflowByID("Item_Maintenance_Workflow");
var stateNetwork = workflow.getStateByID("Network_Mobility");
var stateWireline = workflow.getStateByID("Wireline");
var stateRetail = workflow.getStateByID("Retail");
var stateEntertainment = workflow.getStateByID("Entertainment");
var stateDTV = workflow.getStateByID("DTV");
if (node.isInState("Item_Maintenance_Workflow", "Network_Mobility")) {
    webui.navigate("Item_Maintainance_NTW_Task_List", null, stateNetwork);
} else if (node.isInState("Item_Maintenance_Workflow", "Wireline")) {
    webui.navigate("Item_Maintainance_WRLN_Task_List", null, stateWireline);
} else if (node.isInState("Item_Maintenance_Workflow", "Retail")) {
    webui.navigate("Item_Maintainance_RTL_Task_List", null, stateRetail);
} else if (node.isInState("Item_Maintenance_Workflow", "Entertainment")) {
    webui.navigate("Item_Maintainance_ENT_Task_List", null, stateEntertainment);
} else if (node.isInState("Item_Maintenance_Workflow", "DTV")) {
    webui.navigate("Item_Maintainance_DTV_Task_List", null, stateDTV);
}
}