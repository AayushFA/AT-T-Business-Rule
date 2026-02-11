/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Validate_NTW_BOM_Type_Is_NonStock",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_BOM_Web_UI_Conditions" ],
  "name" : "Validate NTW BOM Type is Non Stock",
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
/**
 * @author - John [CTS]
 * Check Parent BOM is WRLN NON Stock
 */
var parentItemNum = node.getValue("Parent_Item").getSimpleValue();
var itemID = stepManager.getNodeHome().getObjectByKey("Item.Key", parentItemNum);
var parentBomType = itemID.getValue("NTW_BOM_Type").getID();
var childrenExist = node.getChildren();
if (node.getObjectType().getID() == "Bill_Of_Material" && childrenExist.size() > 0 && node.getParent().getID() == "BOM_WRLN" && parentBomType == "NON Stock") {
    return true;
} else {
    return false;
}
}