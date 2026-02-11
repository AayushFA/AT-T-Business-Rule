/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_CI_Current_Price_Bulk_Updt",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_GlobalBusinessAction" ],
  "name" : "CI Current Price Bulk Updt",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "BPALib"
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,BPALib) {
var IDArray_CI = new java.util.ArrayList();
IDArray_CI = ['Current_Price'];
var CIPrice = node.getValue("Price").getSimpleValue();
if (node.getValue("BPA_Processed_In_EBS").getID() == "Y") {
     node.getValue("Current_Price").setSimpleValue(CIPrice);
     log.info(node.getValue("Current_Price").getSimpleValue());
     BPALib.partialApproveFields(node, IDArray_CI);
}
}