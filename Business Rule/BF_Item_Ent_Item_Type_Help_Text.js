/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BF_Item_Ent_Item_Type_Help_Text",
  "type" : "BusinessFunction",
  "setupGroups" : [ "ATT_Item_Web_UI_Functions" ],
  "name" : "Entertainment Item Type Help Text",
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
  "pluginId" : "JavaScriptBusinessFunctionWithBinds",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation",
  "functionReturnType" : "java.lang.String",
  "functionParameterBinds" : [ {
    "contract" : "NodeBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : "current Object"
  } ]
}
*/
exports.operation0 = function (node) {
var ItemStatus = node.getValue("Item_Status_ENT").getID();
if(node.getID() && (ItemStatus == "Inactive")){
	var message = "<B> <font color= 'red'> ** Please confirm that there are no open Purchase Orders for this item before changing Item Status. </B> " 
	return message
}

}