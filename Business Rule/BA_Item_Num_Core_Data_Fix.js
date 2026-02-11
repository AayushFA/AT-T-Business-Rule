/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Item_Num_Core_Data_Fix",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Data_Fix_Actions" ],
  "name" : "Item Num Core Data Fix",
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
  "pluginId" : "JavaScriptBusinessActionWithBinds",
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
var itemNumber = node.getValue("Item_Num").getSimpleValue();
var itemNumberBase = itemNumber.split("\\.");
node.getValue("Item_Num_Core").setSimpleValue(itemNumberBase[1].trim());
}