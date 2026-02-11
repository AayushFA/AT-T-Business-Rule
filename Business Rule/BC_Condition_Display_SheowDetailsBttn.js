/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Condition_Display_SheowDetailsBttn",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "Condition BPA Show Details Button",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item" ],
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "ctx",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,ctx) {
/**
 * @author - Piyal [CTS]
 * Condition BPA Show Details Button
 */

var selection = ctx.getSelection();
var Workflow = step.getWorkflowHome().getWorkflowByID("Create_BPA")
var State = Workflow.getStateByID("Enrich_BPA_CI_LE");

selection.forEach(function(item) {
	if (item.getObjectType().getID() == 'Contract_Item') {
		if (item.isInState("Create_BPA", State.getID())) {
			return true;
		}
	}
	if (item.getObjectType().getID() == 'LE_Contract_Item_Child') {
		if (item.isInState("Create_BPA", State.getID())) {
			return true;
		}
	}

});
return false;
}