/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_Create_DC_Org_Button_Visibility",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Web_UI_Conditions" ],
  "name" : "Create DC Org Button Visibility",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item", "Companion_SKU" ],
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
var objectType = node.getObjectType().getID();
var validTypes = ["Item", "Companion_SKU"];
var lob = node.getValue("Line_Of_Business").getID();
var validLobTypes = ["RTL", "ENT"];
if (validTypes.includes(String(objectType))) {
    if (validLobTypes.includes(String(lob))) {
        return validLobTypes.includes(String(lob));
    }
}
}