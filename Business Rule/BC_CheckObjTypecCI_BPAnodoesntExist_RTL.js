/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_CheckObjTypecCI_BPAnodoesntExist_RTL",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "Check if CI-Item Refernce Editable True(RTL)",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item", "BPA" ],
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
//AUTHOR:AAYUSH(COGNIZANT)

var objectType = node.getObjectType().getID();
if (objectType == 'Contract_Item') {
	//var status = node.getValue("EBS_ResponseStatus_BPA").getID();
	var parent = node.getParent();
	//var BPAno = parent.getValue("Oracle_Contract_Num").getSimpleValue();
	var lob = node.getParent().getValue("Legacy_Source").getID();
	if (lob == "RTL") {
		return true
	}
	else {
		return false;
	}
}else
{
	return false;
}




/**
 * @author - Piyal [CTS]
 * Check if object type Contract item OR CILE And BPA no does not Exist(RTL)
 */
/*
var objectType = node.getObjectType().getID();
if (objectType == 'Contract_Item') {
	//var status = node.getValue("EBS_ResponseStatus_BPA").getID();
	var parent = node.getParent();
	var BPAno = parent.getValue("Oracle_Contract_Num").getSimpleValue();
	var lob = node.getParent().getValue("Legacy_Source").getID();
	if (!isProcessedInEBS(node) && lob == "RTL") {
		return true
	}
	else {
		return false;
	}
}else
{
	return false;
}
function isProcessedInEBS(node) {
    return node.getValue("BPA_Processed_In_EBS").getSimpleValue() == "Yes";
}
*/


}