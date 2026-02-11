/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SOA_Outbound_Derivation",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Integration_Actions" ],
  "name" : "SOA Outbound Integration Derivation",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Companion_SKU" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
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
/**
 * author: aw240u(cts),aditya(cts)
 * desc: to populate temp attribute : Parent_Item_Number at the time of approval
 */
if (node.getObjectType().getID() == "Companion_SKU") {
  var parent = node.getParent();
  var itemVal = parent.getValue("Item_Num").getSimpleValue();
  node.getValue("Parent_Item_Number").setValue(itemVal);
} else if (node.getObjectType().getID() == "Child_Org_Item") {
  var parent = node.getParent();
  if (parent.getObjectType().getID() == "Companion_SKU") {
    var grandPar = parent.getParent();
    var itemVal = grandPar.getValue("Item_Num").getSimpleValue();
    node.getValue("Parent_Item_Number").setValue(itemVal);
  } else {
    var itemVal = parent.getValue("Item_Num").getSimpleValue();
    node.getValue("Parent_Item_Number").setValue(itemVal);
  }
} else {
  //nothing
}
}