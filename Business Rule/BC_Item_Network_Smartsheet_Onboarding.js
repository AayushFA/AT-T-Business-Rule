/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_Network_Smartsheet_Onboarding",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Smartsheet_Conditions" ],
  "name" : "Network Smartsheet Onboarding Validations",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Network_Validation",
    "libraryAlias" : "networkValidationLib"
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
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "QueryHomeBindContract",
    "alias" : "query",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "dataIssues",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,query,dataIssues,networkValidationLib) {
/**
 * @author - John and Madhuri [CTS]
 * NTW attributes validation in IIEP
 */
var errorFlag = false;
//Checking duplicate MFG Part number excluding Cancelled item where MpnDetails and Reason are blank
var duplicateMfgPartNumberError = networkValidationLib.validateDuplicateManufacturingPartNumber(node, stepManager, query);
if(duplicateMfgPartNumberError){
	dataIssues.addWarning(duplicateMfgPartNumberError);
	errorFlag = true;
}
// Check Network_Derived_Reference
var networkReferenceError = networkValidationLib.validateNetworkDerivedReference(node, stepManager);
if(networkReferenceError){
	dataIssues.addWarning(networkReferenceError);
	errorFlag = true;
}

if (errorFlag) {
	return dataIssues;
} else {
	return true;
}
}