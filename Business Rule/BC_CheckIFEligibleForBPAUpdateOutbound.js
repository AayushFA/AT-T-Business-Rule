/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_CheckIFEligibleForBPAUpdateOutbound",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "Check If Eligible for BPA Update Outbound",
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step) {
/**
 * @author - Piyal [CTS]
 * Check If Eligible for BPA Update Outbound
 */

if (node.getObjectType().getID() == 'BPA') {
	var Oracle_Contract_Num = node.getValue("Oracle_Contract_Num").getSimpleValue();
	if (Oracle_Contract_Num) {
		return true;
	} else
		return false;
}

if (node.getObjectType().getID() == 'Contract_Item') {
	var Oracle_Contract_Num = node.getParent().getValue("Oracle_Contract_Num").getSimpleValue();
	log.info(node.getParent())
	if (Oracle_Contract_Num) {
		return true;
	} else
		return false;
}

if (node.getObjectType().getID() == 'LE_Contract_Item_Child') {
	var Oracle_Contract_Num = node.getParent().getParent().getValue("Oracle_Contract_Num").getSimpleValue();
	if (Oracle_Contract_Num) {
		return true;
	} else
		return false;
}
}