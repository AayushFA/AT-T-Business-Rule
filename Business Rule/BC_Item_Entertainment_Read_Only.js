/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_Entertainment_Read_Only",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Web_UI_Conditions" ],
  "name" : "Entertainment UI Read Only",
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
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
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
exports.operation0 = function (node,stepManager,readOnly) {
/*
var attrHome = stepManager.getAttributeHome();
var lob = node.getValue("Line_Of_Business").getID();
var objectType = node.getObjectType().getID();
var entItemType = node.getValue("ENT_Item_Type").getID();
if (lob == "ENT" && objectType == "Item" && entItemType == "UVERSE") {
    readOnly.setReadOnly(node, attrHome.getAttributeByID("User_Defined_Item_Num"));
    return true;
}
return false;

*/
}