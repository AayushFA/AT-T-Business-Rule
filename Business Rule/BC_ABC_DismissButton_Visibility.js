/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_ABC_DismissButton_Visibility",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ABC_BusinessCondition" ],
  "name" : "Check if Dismiss Button Visible",
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
/**
 * @author -  
 * desc
 */
var curUser = step.getCurrentUser();
if(abcComLib.checkUser(curUser,step)){ 
var wfInstance = node.getWorkflowInstanceByID("ABC_Workflow");
if (wfInstance)
    var task = wfInstance.getTaskByID("ALM_Enrichment_State");
var agreementNumber = node.getValue("Agreement_Number").getSimpleValue();
var gscFlag = node.getValue("SI_GSC_Flag").getID();
if (agreementNumber && gscFlag != "Y" && task) {
    return true;
} else {
	 return false;
}
}else{
	return false;
}

}