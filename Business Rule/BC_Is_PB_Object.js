/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Is_PB_Object",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ABC_BusinessCondition" ],
  "name" : "Is Price Break Object",
  "description" : "Checking if Object type is \"Pbreak\" or not",
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
 * @authors -  aw240u(cognizant)
 * 
 */
var objTyp = node.getObjectType().getID();
if (objTyp == "Price_Break") {
        return true
    } else {
        return false
    }
}