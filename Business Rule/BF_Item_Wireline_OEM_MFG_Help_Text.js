/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BF_Item_Wireline_OEM_MFG_Help_Text",
  "type" : "BusinessFunction",
  "setupGroups" : [ "ATT_Item_Web_UI_Functions" ],
  "name" : "Wireline OEM Manufacturing Help Text",
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
	var message = "<B> <font color= 'red'> ** OEM Full Name and MFG Part No cannot be changed for HECI Items. </B> " 
	return message
}

}