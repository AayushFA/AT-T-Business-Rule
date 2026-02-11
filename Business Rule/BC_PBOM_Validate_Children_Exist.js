/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_PBOM_Validate_Children_Exist",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_BOM_Web_UI_Conditions" ],
  "name" : "Validate PBOM Children Exist",
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
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager) {
//author @aw240u@att.com(Aayush Kumar Mahato)
var parentItemNumber = node.getValue("Parent_Item").getSimpleValue();
var objectType = node.getObjectType().getID();
var childrenExist = node.getChildren();
var item = stepManager.getNodeHome().getObjectByKey("Item.Key", parentItemNumber);
var parentBOMType = item.getValue("NTW_BOM_Type").getID();
if (childrenExist.size() > 0 && objectType == "Bill_Of_Material" && parentBOMType != "NON Stock") {
    return true
} else {
    return false
}
}