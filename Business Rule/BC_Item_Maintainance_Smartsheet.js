/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_Maintainance_Smartsheet",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Smartsheet_Conditions" ],
  "name" : "Item Maintainance Smartsheet Validations",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Companion_SKU", "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonDerivationLib"
  }, {
    "libraryId" : "BL_Companion_SKU_Retail_Validation",
    "libraryAlias" : "retailCompSkuValidationLib"
  }, {
    "libraryId" : "BL_Item_Wireline_Validation",
    "libraryAlias" : "wirelineValidationLib"
  }, {
    "libraryId" : "BL_Item_Common_Validation",
    "libraryAlias" : "commonValidationLib"
  }, {
    "libraryId" : "BL_Item_Retail_Validation",
    "libraryAlias" : "retailValidationLib"
  }, {
    "libraryId" : "BL_Child_Org_Wireline_Validation",
    "libraryAlias" : "wirelineChildOrgValidationLib"
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
exports.operation0 = function (node,stepManager,lookUpTable,dataIssues,commonDerivationLib,retailCompSkuValidationLib,wirelineValidationLib,commonValidationLib,retailValidationLib,wirelineChildOrgValidationLib) {
var errorFlag = false;
var lob = node.getValue("Line_Of_Business").getID();
var objectType = node.getObjectType().getID();
if (lob == "WRLN" && objectType == "Item") {
	var heciOemNameError = wirelineValidationLib.validateOEMFullName(node);
	if (heciOemNameError) {
		dataIssues.addWarning(heciOemNameError);
		errorFlag = true;
	}
	var heciMfgPartNumberError = wirelineValidationLib.validateMfgPartNumber(node);
	if (heciMfgPartNumberError) {
		dataIssues.addWarning(heciMfgPartNumberError);
		errorFlag = true;
	}
	var nonCatsMicCodeError = wirelineValidationLib.validateNonCatsMicCode(node);
	if (nonCatsMicCodeError) {
		dataIssues.addWarning(nonCatsMicCodeError, node, stepManager.getAttributeHome().getAttributeByID("Planning_Route"));
		errorFlag = true;
	}
	const regionStatusConfigs = wirelineValidationLib.getRegionStatusConfigs();
	regionStatusConfigs.forEach(function(regionConfig) {
		var childOrgStatusError = wirelineValidationLib.validateRegionStatus(node, regionConfig.region, regionConfig.statusField, regionConfig.message);
		if (childOrgStatusError) {
			dataIssues.addWarning(childOrgStatusError, node, stepManager.getAttributeHome().getAttributeByID(regionConfig.statusField));
			errorFlag = true;
		}
	});
}
if (lob == "RTL" || lob == "ENT") {
	var userRoleError = commonValidationLib.validateUserRole(node, stepManager, lookUpTable);
	if (userRoleError) {
		dataIssues.addWarning(userRoleError);
		errorFlag = true;
	}

	var upcLengthError = commonValidationLib.validateUPCLength(node);
if(upcLengthError){
   dataIssues.addWarning(upcLengthError);
   errorFlag = true;
}

var upcNumberError = commonValidationLib.validateUPCNumber(node);
if(upcNumberError){
   dataIssues.addWarning(upcNumberError);
   errorFlag = true;
}

var upcDuplicateError = commonDerivationLib.setUPC(node,stepManager);
log.info("upcError :"+upcDuplicateError);
if (upcDuplicateError){
	dataIssues.addWarning(upcDuplicateError, node, stepManager.getAttributeHome().getAttributeByID("UPC"));
	errorFlag = true;
}
}

if (lob == "RTL" && objectType == "Item") {
	var existingCompanionSkusError = retailCompSkuValidationLib.validateExistingCompanionSkus(node);
	if (existingCompanionSkusError) {
		dataIssues.addWarning(existingCompanionSkusError);
		errorFlag = true;
	}
	var wip1CompSkuError = retailValidationLib.validateWip1CompSku(node);
	if (wip1CompSkuError) {
		dataIssues.addWarning(wip1CompSkuError);
		errorFlag = true;
	}	
}
if (lob == "WRLN" && objectType == "Child_Org_Item") {
	var minmaxError = wirelineChildOrgValidationLib.validateMinMaxPack(node);
	if (minmaxError) {
		dataIssues.addWarning(minmaxError);
		errorFlag = true;
	}
	var minmaxcompError = wirelineChildOrgValidationLib.validateMinMaxComparison(node);
	if (minmaxcompError) {
		dataIssues.addWarning(minmaxcompError);
		errorFlag = true;
	}
	var minMaxQtyMaximumError = wirelineChildOrgValidationLib.validateMinMaxQtyMaximum(node);
	if (minMaxQtyMaximumError) {
		dataIssues.addWarning(minMaxQtyMaximumError);
		errorFlag = true;
	}
	var consignError = wirelineChildOrgValidationLib.validateConsignInd(node);
	if (consignError) {
		dataIssues.addWarning(consignError);
		errorFlag = true;
	}
	var stockpackError = wirelineChildOrgValidationLib.validateStockPackRequirements(node);
	if (stockpackError) {
		dataIssues.addWarning(stockpackError);
		errorFlag = true;
	}
}

if (lob == "RTL" && (objectType == "Item" || objectType == "Companion_SKU")) {
	var costChangeReasonError = retailValidationLib.validateCostChangeReason(node, stepManager);
	if (costChangeReasonError) {		
		dataIssues.addWarning(costChangeReasonError);
		errorFlag = true;
	}
}


if (objectType == "Item" && (lob == "RTL" || lob == "ENT")) {

	var costAttributesError = commonValidationLib.validateCostAttributes(node, stepManager);	
	if (costAttributesError) {
		dataIssues.addWarning(costAttributesError);		
		errorFlag = true;
	}		
}

if (errorFlag) {
	return dataIssues;
} else {
	return true;
}
}