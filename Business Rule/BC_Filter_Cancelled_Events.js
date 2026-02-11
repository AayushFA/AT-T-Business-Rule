/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Filter_Cancelled_Events",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Integration_Conditions" ],
  "name" : "Filter Cancelled Item Events",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
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
/**
 * @author Megha 
 * Condition to filter Cancelled Events for SOA Outbound Integration Endpoint
 */
var parent = node.getParent();
var grandParent = parent.getParent();
var greatGrandParent = grandParent.getParent();
if (parent.getID() == "CancelledProducts" || grandParent.getID() == "CancelledProducts" || greatGrandParent.getID() == "CancelledProducts") {
    return false;
} else {
    return true;
}
}