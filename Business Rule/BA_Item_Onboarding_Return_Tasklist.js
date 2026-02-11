/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Item_Onboarding_Return_Tasklist",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Web_UI_Actions" ],
  "name" : "Item Onboarding Return Tasklist",
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
var workflow = manager.getWorkflowHome().getWorkflowByID("Item_Creation_Workflow");
var stateNetwork = workflow.getStateByID("Network_Mobility");
var stateWireline = workflow.getStateByID("Wireline");
var stateRetail = workflow.getStateByID("Retail");
var stateEntertaintment = workflow.getStateByID("Entertainment");
var stateDTV = workflow.getStateByID("DTV");
if (node.isInState("Item_Creation_Workflow", "Network_Mobility")) {
    webui.navigate("Item_Onboarding_NTW_Task_List", null, stateNetwork);
} else if (node.isInState("Item_Creation_Workflow", "Wireline")) {
    webui.navigate("Item_Onboarding_WRLN_Task_List", null, stateWireline);
} else if (node.isInState("Item_Creation_Workflow", "Retail")) {
    webui.navigate("Item_Onboarding_RTL_Task_List", null, stateRetail);
} else if (node.isInState("Item_Creation_Workflow", "Entertainment")) {
    webui.navigate("Item_Onboarding_ENT_Task_List", null, stateEntertaintment);
} else if (node.isInState("Item_Creation_Workflow", "DTV")) {
    webui.navigate("Item_Onboarding_DTV_Task_List", null, stateDTV);
}
}