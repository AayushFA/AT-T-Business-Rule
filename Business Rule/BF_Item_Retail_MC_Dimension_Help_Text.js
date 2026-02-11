/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BF_Item_Retail_MC_Dimension_Help_Text",
  "type" : "BusinessFunction",
  "setupGroups" : [ "ATT_Item_Web_UI_Functions" ],
  "name" : "Retail Master Card Dimension Help Text",
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
    "description" : "current object"
  } ]
}
*/
exports.operation0 = function (node) {

if(node.getID()){
	var message = "<B> <font color= 'red'> ** This Section applicable for Retail Accessories only. </B> " 
	return message
}

}