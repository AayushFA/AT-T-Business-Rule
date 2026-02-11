/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_UI_ABC_CI_ReadOnly",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ABC_BusinessCondition" ],
  "name" : "ABC CI Read Only Condition",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item" ],
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
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager) {
/*
 * @author: Aayush Kumar Mahato
 * desc: to display contract item screen based on consumer type value
 */
var consTypeObj = manager.getEntityHome().getEntityByID("ABC_Attributes_Configurations");
var consumerTypeList = consTypeObj.getValue("ABC_Consumer_List").getSimpleValue();
var nodeConsumerType = node.getValue("Consumer_Type").getSimpleValue();
var nodeConListArr = new java.util.ArrayList();
var conListArr = new java.util.ArrayList();
var count = 0;
if(nodeConsumerType){
	nodeConsumerType = nodeConsumerType.split("<multisep/>");
	nodeConsumerType.forEach(function(nodeValue) {
	    nodeConListArr.add(nodeValue.trim());
	});
}
consumerTypeList = consumerTypeList.split("<multisep/>");
consumerTypeList.forEach(function(value) {
    conListArr.add(value.trim());
});

if (nodeConsumerType) {
    nodeConListArr.forEach(function(a) {
        if (conListArr.contains(a)) {
            count = count + 1
        }
    });
}

if (count > 0) {
    return true
} else {
    return false
}
}