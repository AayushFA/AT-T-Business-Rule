/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Transportation_Handling_Unit_Onboard",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Transportation_Attribute_Action" ],
  "name" : "BA Transportation Handling Unit Onboarding",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Transportation_Handling_Unit", "Transportation_Package" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Transportation_Validation",
    "libraryAlias" : "transpValLib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
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
    "contract" : "DataIssuesContextBind",
    "alias" : "issue",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,issue,transpValLib) {
/*
 * author: aw240u
 */
if (node.getObjectType().getID() == "Transportation_Handling_Unit") {
  var orderingUOM = node.getValue("TMS_Ordering_UOM").getSimpleValue();
  var handlingUnitType = node.getValue("TMS_Handling_Unit_Type").getSimpleValue();
  var handlingUnitID = node.getValue("TMS_Handling_Unit_ID").getSimpleValue();
  var itemNum = node.getValue("Parent_Item_Number").getSimpleValue();
  var productObject = stepManager.getNodeHome().getObjectByKey("Item.Key", itemNum.trim());
  if (productObject) {
    var huKey = itemNum + "-" + orderingUOM + "-" + handlingUnitType + "-" + handlingUnitID;
    node.setParent(productObject);
    node.getValue("Transportation_Handling_Unit_Key").setSimpleValue(huKey);
  }
}
if (node.getObjectType().getID() == "Transportation_Package") {
  var orderingUOM = node.getValue("TMS_Ordering_UOM").getSimpleValue();
  var itemNum = node.getValue("Parent_Item_Number").getSimpleValue();
  var packageKey = itemNum + "-" + orderingUOM;
  var productObject = stepManager.getNodeHome().getObjectByKey("Item.Key", itemNum.trim());
  if (productObject) {
    node.setParent(productObject);
    var packageKey = itemNum + "-" + orderingUOM;
    node.getValue("Transportation_Package_Key").setSimpleValue(packageKey);
  }
}
}