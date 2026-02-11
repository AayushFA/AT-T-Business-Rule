/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_CBOM_Validate_Children_Exist",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_BOM_Web_UI_Conditions" ],
  "name" : "Validate CBOM Children Exist",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BOM_Child", "Bill_Of_Material", "BOM_Child_Substitute" ],
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
var childrenExist = node.getChildren();
if (childrenExist.size() > 0 && objectType == "BOM_Child") {
    return true;
}
return false;
}