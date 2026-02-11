/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SPL_Workflow_Cancel_Transition",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_SPL_Web_UI_Actions" ],
  "name" : "SPL Workflow On Cancel Transition",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
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
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager) {
/**
 AUTHOR: AAYUSH MAHATO(AW240U)
 * 
 * 
 */

 var cancelFolder = stepManager.getProductHome().getProductByID("CancelledProducts");
 node.setParent(cancelFolder);
}
/*===== business rule plugin definition =====
{
  "pluginId" : "RemoveObjectFromWorkflowAction",
  "parameters" : [ {
    "id" : "Workflow",
    "type" : "com.stibo.core.domain.state.Workflow",
    "value" : null
  }, {
    "id" : "Message",
    "type" : "java.lang.String",
    "value" : "Removed on cancel transition"
  } ],
  "pluginType" : "Operation"
}
*/
