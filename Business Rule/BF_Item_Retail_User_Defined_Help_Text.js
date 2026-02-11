/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BF_Item_Retail_User_Defined_Help_Text",
  "type" : "BusinessFunction",
  "setupGroups" : [ "ATT_Item_Web_UI_Functions" ],
  "name" : "Retail User Defined Help Text",
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
if(node.getID()){
	var message = "<B> <font color= 'red'> ** Please enter value only for Intang or DF Item types. </B> " 
	return message
}

}