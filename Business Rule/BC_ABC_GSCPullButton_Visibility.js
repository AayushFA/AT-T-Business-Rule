/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_ABC_GSCPullButton_Visibility",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ABC_BusinessCondition" ],
  "name" : "ABC GSC Pull Button Visibility",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item", "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_ABC_Common",
    "libraryAlias" : "abcComLib"
  } ]
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,abcComLib) {

var curUser = step.getCurrentUser();
if(abcComLib.checkUser(curUser,step)){
var WFInstance=node.getWorkflowInstanceByID("ABC_Workflow");
var task = WFInstance.getTaskByID("ALM_Enrichment_State");
if (task) {
    return true;
} else {
    return false;
}
}else{
	return false
}

}