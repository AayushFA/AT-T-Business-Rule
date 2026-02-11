/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_Validate_Children_Exist",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Web_UI_Conditions" ],
  "name" : "Validate Children Exist",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Item" ],
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
var children = node.getChildren();
if (children.size() > 0) {
    return children.size() > 0;
}
return false;
}