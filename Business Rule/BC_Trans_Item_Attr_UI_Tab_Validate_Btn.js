/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Trans_Item_Attr_UI_Tab_Validate_Btn",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Web_UI_Conditions" ],
  "name" : "Transportation UI Tab & Validate Button Visibility",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
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
log.info("objectType:"+objectType);
if (validTypes.includes(String(objectType))) {
    var lob = node.getValue("Line_Of_Business").getSimpleValue();
    log.info("lob:"+lob);
    return lob == "Retail" || lob == "Entertainment" || lob == "Wireline" || lob == "Network Mobility";
}
// If ObjType is not one of the valid types, return false or handle accordingly
return false;
}