/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_Retail_Smartsheet_Onboarding",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Smartsheet_Conditions" ],
  "name" : "Retail Smartsheet Onboarding Validations",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonDerivationLib"
  }, {
    "libraryId" : "BL_Item_Common_Validation",
    "libraryAlias" : "commonValidationLib"
  }, {
    "libraryId" : "BL_Item_Retail_Validation",
    "libraryAlias" : "retailValidationLib"
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
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUpTable",
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
exports.operation0 = function (node,stepManager,lookUpTable,dataIssues,commonDerivationLib,commonValidationLib,retailValidationLib) {
var errorFlag = false;
if (!node.getValue("RTL_Item_Type").getID()) {
  dataIssues.addWarning("Retail Item Type is mandatory for Item Creation.",node, stepManager.getAttributeHome().getAttributeByID("RTL_Item_Type"));
  errorFlag = true;
}
var userRoleError = commonValidationLib.validateUserRole(node, stepManager, lookUpTable);
if(userRoleError){
   dataIssues.addWarning(userRoleError);
   errorFlag = true;
}
var upcError = commonValidationLib.validateGenerateNewUpc(node);
if(upcError){
   dataIssues.addWarning(upcError,node, stepManager.getAttributeHome().getAttributeByID("UPC"));
   errorFlag = true;
}

var upcLengthError = commonValidationLib.validateUPCLength(node);
if(upcLengthError){
   dataIssues.addWarning(upcLengthError,node, stepManager.getAttributeHome().getAttributeByID("UPC"));
   errorFlag = true;
}

var upcNumberError = commonValidationLib.validateUPCNumber(node);
if(upcNumberError){
   dataIssues.addWarning(upcNumberError,node, stepManager.getAttributeHome().getAttributeByID("UPC"));
   errorFlag = true;
}

var upcDuplicateError = commonDerivationLib.setUPC(node,stepManager);
log.info("upcError :"+upcDuplicateError);
if (upcDuplicateError){
	dataIssues.addWarning(upcDuplicateError, node, stepManager.getAttributeHome().getAttributeByID("UPC"));
	errorFlag = true;
}

var wip1CompSkuError = retailValidationLib.validateWip1CompSku(node);
if(wip1CompSkuError){
   dataIssues.addWarning(wip1CompSkuError,node,stepManager.getAttributeHome().getAttributeByID("Companion_Item_Type"));
   errorFlag = true;
}

var costAttributesError = commonValidationLib.validateCostAttributes(node, stepManager);
if (costAttributesError) {
	dataIssues.addWarning(costAttributesError, node, stepManager.getAttributeHome().getAttributeByID("Requested_Standard_Cost"));
	errorFlag = true;
}



if (errorFlag) {
	return dataIssues;
} else {
	return true;
}
}