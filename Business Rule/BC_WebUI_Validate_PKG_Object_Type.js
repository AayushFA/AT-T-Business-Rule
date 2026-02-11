/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_WebUI_Validate_PKG_Object_Type",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Transportation_Attribute_Conditions" ],
  "name" : "WebUI Validate PKG Object Type",
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
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
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
/*
 *author : aw240u@att.com
 */
 
var objType = node.getObjectType().getID();
if(objType=="Transportation_Package"){
	return true;
}else{
	return false;
}

}