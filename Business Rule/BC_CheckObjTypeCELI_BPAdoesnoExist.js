/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_CheckObjTypeCELI_BPAdoesnoExist",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "Check if CILE-Item Refernce Editable True",
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
/**
 * @author - Piyal [CTS]
 * Check if object type CILE And BPA does not Exist
 */

var objectType = node.getObjectType().getID();
if (objectType == "LE_Contract_Item_Child") {

	var parent = node.getParent().getParent();
	var BPAno = parent.getValue("Oracle_Contract_Num").getSimpleValue();
	if (!isProcessedInEBS(node)) {
		return true
	} 
	else {
		return false
	}
}else
{
	return false;
}

function isProcessedInEBS(node) {
    return node.getValue("BPA_Processed_In_EBS").getSimpleValue() == "Yes";
}

}