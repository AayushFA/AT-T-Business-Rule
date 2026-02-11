/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "CITEM_SetDefaultAttributes",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_GlobalBusinessAction" ],
  "name" : "CITEM Set Default Attributes",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "TriggerAndApproveNewParts",
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
/**
 * @author - Aditya [CTS]
 * Set Item Number from Parent Node
 */
 
var parent = node.getParent();

if(parent) {
	var parentItemNum = parent.getValue("Item_Num").getSimpleValue();
}

if(parentItemNum) {
	node.getValue("Item_Num").setSimpleValue(parentItemNum);
}

}