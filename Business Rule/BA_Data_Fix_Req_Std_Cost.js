/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Data_Fix_Req_Std_Cost",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Data_Fix_Actions" ],
  "name" : "Data fix for Requested STD Cost Attribute",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "Lib"
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,Lib) {
var partialApprList = new java.util.ArrayList();

if (node.getObjectType().getID() == "Companion_SKU") {
	node.getValue("Requested_Standard_Cost").setSimpleValue("0");
	partialApprList.add("Requested_Standard_Cost");
	Lib.partialApproveFields(node, partialApprList);
}


}