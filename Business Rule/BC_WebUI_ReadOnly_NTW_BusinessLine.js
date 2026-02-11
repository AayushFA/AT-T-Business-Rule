/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_WebUI_ReadOnly_NTW_BusinessLine",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Transportation_Attribute_Conditions" ],
  "name" : "Make ReadOnly Business Line Attribute",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Companion_SKU", "Item" ],
  "allObjectTypesValid" : false,
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
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ReadOnlyContextBind",
    "alias" : "readOnly",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,readOnly) {
/*
 *author : aw240u@att.com(cognizant)
 
 */
var lob = node.getValue("Line_Of_Business").getID();
if (lob =="NTW") {
	var attributeHome = manager.getAttributeHome();
    readOnly.setReadOnly(node, attributeHome.getAttributeByID("Business_Line"));
}
return true;
}