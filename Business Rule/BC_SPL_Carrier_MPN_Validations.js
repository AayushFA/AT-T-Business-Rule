/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_SPL_Carrier_MPN_Validations",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_SPL_Conditions" ],
  "name" : "SPL Carrier MPN Validations",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item", "Companion_SKU" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_SPL_Validation_Library",
    "libraryAlias" : "splValidationLib"
  }, {
    "libraryId" : "BL_SPL_Derivation",
    "libraryAlias" : "splLib"
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
    "contract" : "QueryHomeBindContract",
    "alias" : "query",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webUiContext",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,dataIssues,stepManager,query,webUiContext,splValidationLib,splLib) {
var mfgPartNumber = node.getValue("Mfg_Part_No").getSimpleValue();
var error = "";
if (node.isInState("SPI_Onboarding", "SPI_Enrichment") || node.isInState("Item_Maintenance_Workflow", "Retail") || node.isInState("Item_Maintenance_Workflow", "Entertainment")) {
	var itemMap = new java.util.HashMap();
	var duplicateMap = new java.util.HashMap();
	
	var currentNodeCarrierList = splLib.getCurrentCarrierDCData(node);
	itemMap = splLib.getAllCarrierDCData(node,stepManager,query,itemMap);
	
	for (var i = 0; i < currentNodeCarrierList.length; i++) {			
		duplicateMap = splLib.validateDuplicateCarrierDCAcrossSystem(itemMap, currentNodeCarrierList[i], duplicateMap);
		error = error + splLib.validateDuplicateCarrierMPNAcrossSKUs(node,currentNodeCarrierList[i],query,stepManager);
	}	
	error = error + splValidationLib.generateErrorMessage(duplicateMap);
	if(error) {
	    error = mfgPartNumber+ " Validations: \n"+error;
	    dataIssues.addWarning(error)
	    webUiContext.showAlert("ERROR",error);
	    return error;
	    
	}
	else
	 return true;
}
else {
	error = mfgPartNumber+ " Validations: \n Item is not in the Enrich state of the Workflow";
	dataIssues.addWarning(error)
	webUiContext.showAlert("ERROR",error);
	return error;
}
}