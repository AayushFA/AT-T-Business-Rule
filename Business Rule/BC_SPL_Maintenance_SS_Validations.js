/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_SPL_Maintenance_SS_Validations",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_SPL_Conditions" ],
  "name" : "SPL Maintenance Smartsheet Validations",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_SPL_Validation_Library",
    "libraryAlias" : "splValidationLib"
  }, {
    "libraryId" : "BL_Item_UNSPSC_Derivation",
    "libraryAlias" : "unspscLib"
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
    "contract" : "DataIssuesContextBind",
    "alias" : "dataIssues",
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
    "contract" : "AttributeGroupBindContract",
    "alias" : "attributeGroup",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "AG_Apple_Mandatory",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,dataIssues,stepManager,attributeGroup,splValidationLib,unspscLib) {
var errorMessage ="";
var appleLoB = node.getValue("Apple_LoB").getSimpleValue();
var objectType = node.getObjectType().getID();
if (appleLoB && objectType == "Item") {
	errorMessage += splValidationLib.validateMandatoryAttributeGroup(node,stepManager,attributeGroup);
	errorMessage += unspscLib.validateUNSPSCReference(node,stepManager);
}

if(errorMessage)
{
	dataIssues.addWarning(errorMessage);
	return dataIssues;
}
else 
    return true;
}