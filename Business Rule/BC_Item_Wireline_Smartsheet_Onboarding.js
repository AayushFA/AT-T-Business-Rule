/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_Wireline_Smartsheet_Onboarding",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Smartsheet_Conditions" ],
  "name" : "Wireline Smartsheet Onboarding Validations",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Wireline_HECI_Validation",
    "libraryAlias" : "heciValidationLib"
  }, {
    "libraryId" : "BL_Item_Wireline_Validation",
    "libraryAlias" : "wirelineValidationLib"
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
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUpTableHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "bomParentRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "BOM_Parent",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ugDTV",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_DTV_Sourcing",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,query,dataIssues,lookUpTableHome,bomParentRef,ugDTV,heciValidationLib,wirelineValidationLib) {
var errorFlag = false;
var mandatoryFieldsError = wirelineValidationLib.validateMaterialItemTypeAndBusinessGroup(node);
if (mandatoryFieldsError) {
	dataIssues.addWarning(mandatoryFieldsError);
	errorFlag = true;
}
var duplicateMfgPartNumberError = wirelineValidationLib.validateDuplicateManufacturingPartNumber(node, stepManager, query);
if (duplicateMfgPartNumberError) {
	dataIssues.addWarning(duplicateMfgPartNumberError, node, stepManager.getAttributeHome().getAttributeByID("Mfg_Part_No"));
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
var nonCatMicCodeError = wirelineValidationLib.validateNonCatsMicCode(node);
if (nonCatMicCodeError) {
	dataIssues.addWarning(nonCatMicCodeError, node, stepManager.getAttributeHome().getAttributeByID("Non_CATS_MIC_Code"));
	errorFlag = true;
}
var plannerAttUidError = wirelineValidationLib.validatePlannerATTUID(node);
if (plannerAttUidError) {
	dataIssues.addWarning(plannerAttUidError, node, stepManager.getAttributeHome().getAttributeByID("PLANNER_ATTUID"));
	errorFlag = true;
}
var ormdClassError = wirelineValidationLib.validateORMDClass(node);
if (ormdClassError) {
	dataIssues.addWarning(ormdClassError, node, stepManager.getAttributeHome().getAttributeByID("ORMD_Class"));
	errorFlag = true;
}
var regionError = wirelineValidationLib.validateRegions(node);
if (regionError) {
	dataIssues.addWarning(regionError, node, stepManager.getAttributeHome().getAttributeByID("Region_Distribution_Center"));
	errorFlag = true;
}
var bomTypeError = wirelineValidationLib.validateBOMType(node, stepManager);
if (bomTypeError) {
	dataIssues.addWarning(bomTypeError, node, stepManager.getAttributeHome().getAttributeByID("NTW_BOM_Type_WRLN"));
	errorFlag = true;
}
var heciError = heciValidationLib.validateHECINumber(node, stepManager);
if (heciError) {
	dataIssues.addWarning(heciError, node, stepManager.getAttributeHome().getAttributeByID("HECI"));
	errorFlag = true;
}
var contractManagerError = wirelineValidationLib.validateContractManager(node);
if (contractManagerError) {
	dataIssues.addWarning(contractManagerError, node, stepManager.getAttributeHome().getAttributeByID("Contract_Manager"));
	errorFlag = true;
}
var micCoeError = wirelineValidationLib.validateMICCOE(node);
if (micCoeError) {
	dataIssues.addWarning(micCoeError, node, stepManager.getAttributeHome().getAttributeByID("MIC_COE_WRLN"));
	errorFlag = true;
}
var oemError = wirelineValidationLib.validateOEMFullName(node);
if (oemError) {
	dataIssues.addWarning(oemError, node, stepManager.getAttributeHome().getAttributeByID("OEM_Full_Name"));
	errorFlag = true;
}
var mfgError = wirelineValidationLib.validateMfgPartNumber(node);
if (mfgError) {
	dataIssues.addWarning(mfgError, node, stepManager.getAttributeHome().getAttributeByID("Mfg_Part_No"));
	errorFlag = true;
}
var itemStatusError = wirelineValidationLib.validateWirelineItemStatus(node);
if (itemStatusError) {
	dataIssues.addWarning(itemStatusError, node, stepManager.getAttributeHome().getAttributeByID("Item_Status_WRLN"));
	errorFlag = true;
}
var dbossTrackQtyError = wirelineValidationLib.validateDbossTrackingQuantity(node);
if (dbossTrackQtyError) {
	dataIssues.addWarning(dbossTrackQtyError, node, stepManager.getAttributeHome().getAttributeByID("Dboss_Track_by_Qty"));
	errorFlag = true;
}
var financialTrackableError = wirelineValidationLib.validateWttFinancialTrackable(node);
if (financialTrackableError) {
	dataIssues.addWarning(financialTrackableError, node, stepManager.getAttributeHome().getAttributeByID("WTT_Financially_Trackable"));
	errorFlag = true;
}
var childBomItemStatusError = wirelineValidationLib.validateChildBOMItemStatus(node, bomParentRef);
if (childBomItemStatusError) {
	dataIssues.addWarning(childBomItemStatusError, node, stepManager.getAttributeHome().getAttributeByID("Item_Status_WRLN"));
	errorFlag = true;
}
var uomError = wirelineValidationLib.validateUOM(node);
if (uomError) {
	dataIssues.addWarning(uomError, node, stepManager.getAttributeHome().getAttributeByID("Primary_UOM_ValidList"));
	errorFlag = true;
}
var wirelineContractManagerError = wirelineValidationLib.validateWirelineContractManager(node, stepManager, ugDTV);
if (wirelineContractManagerError) {
	dataIssues.addWarning(wirelineContractManagerError, node, stepManager.getAttributeHome().getAttributeByID("Contract_Manager"));
	errorFlag = true;
}
/* var planningRouteError = wirelineValidationLib.validatePlanningRoute(node);
if (planningRouteError) {
	dataIssues.addWarning(planningRouteError, node, stepManager.getAttributeHome().getAttributeByID("Planning_Route"));
	errorFlag = true;
} */ //commented as its not entered by user.

if (errorFlag) {
	return dataIssues;
} else {
	return true;
}
/*
var errorFlag = false;
const validations = [
 { fn: wirelineValidationLib.validateMaterialItemTypeandBusinessGroup, args: [node] },
 { fn: wirelineValidationLib.validateDuplicateManufacturingPartNumber, args: [node, stepManager, query] },
 { fn: wirelineValidationLib.validateChildOrgItemStatus, args: [node] },
 { fn: wirelineValidationLib.validateNonCATSMicCode, args: [node] },
 { fn: wirelineValidationLib.validatePlannerATTUID, args: [node] },
 { fn: wirelineValidationLib.validateORMDClass, args: [node] },
 { fn: wirelineValidationLib.validateRegions, args: [node] },
 { fn: wirelineValidationLib.validateBOMType, args: [node] },
 { fn: heciValidationLib.validateHECINumber, args: [node, stepManager] },
 { fn: wirelineValidationLib.validateContractManager, args: [node] },
 { fn: wirelineValidationLib.validateMICCOE, args: [node] },
 { fn: wirelineValidationLib.validateOEMFullName, args: [node] },
 { fn: wirelineValidationLib.validateMfgPartNumber, args: [node] },
 { fn: wirelineValidationLib.validateTemplateNameAndItemClass, args: [node, lookUpTableHome] },
 { fn: wirelineValidationLib.validateWirelineItemStatus, args: [node] },
 { fn: wirelineValidationLib.validateDbossTrackingQuantity, args: [node] },
 { fn: wirelineValidationLib.validateWttFinancialTrackable, args: [node] },
 { fn: wirelineValidationLib.validateChildBOMItemStatus, args: [node, bomParentRef] },
 { fn: wirelineValidationLib.validateUOM, args: [node] },
 { fn: wirelineValidationLib.validateWirelineContractManager, args: [node, stepManager, ugDTV] },
];

for (const { fn, args } of validations) {
 const error = fn(...args);
 if (error) {
  dataIssues.addWarning(error);
  errorFlag = true;
 }
}

return errorFlag ? dataIssues : true;
*/
}