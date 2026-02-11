/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Display_BPASupplierUOM",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "Display/Hide BPA Supplier UOM",
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "HiddenContextBind",
    "alias" : "hide",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,hide) {
/**
	 * @author - Abiraami [CTS]
	 * This BC is to display Supplier UOM for create
	 */


var processedInEBS = node.getValue("BPA_Processed_In_EBS").getID();
var attrHome= step.getAttributeHome();
if(processedInEBS == "Y"){
		hide.setHidden(node,attrHome.getAttributeByID ("BPA_Onboarding_UOM"));
	}
	else {
		hide.setHidden(node,attrHome.getAttributeByID ("BPA_UOM"));
	}

return true;
}