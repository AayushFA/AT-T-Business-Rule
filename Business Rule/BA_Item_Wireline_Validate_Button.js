/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Item_Wireline_Validate_Button",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Validation_Actions" ],
  "name" : "Item Wireline Validate Button",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Wireline",
    "libraryAlias" : "wirelineDerivationLib"
  }, {
    "libraryId" : "BL_Item_Wireline_HECI_Validation",
    "libraryAlias" : "heciValidationLib"
  }, {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonDerivationLib"
  }, {
    "libraryId" : "BL_Item_UNSPSC_Derivation",
    "libraryAlias" : "unspscLib"
  }, {
    "libraryId" : "BL_Item_Wireline_Validation",
    "libraryAlias" : "wirelineValidationLib"
  }, {
    "libraryId" : "BL_Item_Wireline_HECI_Derivation",
    "libraryAlias" : "heciDerivationLib"
  }, {
    "libraryId" : "BL_Item_Common_Validation",
    "libraryAlias" : "commonValidationLib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
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
    "contract" : "BusinessFunctionBindContract",
    "alias" : "bf",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>BF_Item_Wireline_Trim_Special_Chars</BusinessFunction>\n</BusinessFunctionReference>\n",
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "dataIssues",
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
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookupTableHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "GatewayBinding",
    "alias" : "giep",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.gateway.FrontGatewayIntegrationEndpointImpl",
    "value" : "HECI_GIEP",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ug",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_DTV_Sourcing",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "bomParentRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "BOM_Parent",
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webUIContext",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,bf,dataIssues,query,lookupTableHome,giep,ug,bomParentRef,webUIContext,wirelineDerivationLib,heciValidationLib,commonDerivationLib,unspscLib,wirelineValidationLib,heciDerivationLib,commonValidationLib) {
var errorFlag = false;
var heci = node.getValue("HECI").getSimpleValue();
commonDerivationLib.trimWhiteSpacesAndNewLines(node, stepManager); // STIBO-2634 Prod Support Team
commonDerivationLib.roundListPrice(node);
if (!commonValidationLib.isItemNumberExist(node)) { // creation
	var heciNumberError = heciValidationLib.validateHECINumber(node, stepManager);
	if (heciNumberError) {
		dataIssues.addWarning(heciNumberError, node, stepManager.getAttributeHome().getAttributeByID("HECI"));
		errorFlag = true;
	}
	heciDerivationLib.getHECIdetails(node, giep);
	heciDerivationLib.setDefaultUserSelection(node);
	if (heci) {
		heciDerivationLib.setHECIAttributes(node, stepManager);
		var heciUserSelectionError = heciValidationLib.validateHECIUserSelection(node, stepManager);
		if (heciUserSelectionError) {
			dataIssues.addWarning(heciUserSelectionError);
			errorFlag = true;
		}
		var heciMaterialItemTypeError = heciValidationLib.validateHECIMaterialItemType(node, stepManager);
		if (heciMaterialItemTypeError) {
			dataIssues.addWarning(heciMaterialItemTypeError, node, stepManager.getAttributeHome().getAttributeByID("Material_Item_Type_Web"));
			errorFlag = true;
		}
		var duplicateManufacturingPartNoError = wirelineValidationLib.validateDuplicateManufacturingPartNumber(node, stepManager, query);
		if (duplicateManufacturingPartNoError) {
			dataIssues.addWarning(duplicateManufacturingPartNoError, node, stepManager.getAttributeHome().getAttributeByID("Mfg_Part_No"));
			errorFlag = true;
		}
	}
}
if (commonValidationLib.isItemNumberExist(node)) {
	var ntwBOMTypeError = commonValidationLib.validateNTWBOMType(node, stepManager, "NTW_BOM_Type_WRLN"); // STIBO-3172 Prod Support Team(22 Feb Release)
	if (ntwBOMTypeError) {
		dataIssues.addWarning(ntwBOMTypeError, node, stepManager.getAttributeHome().getAttributeByID("NTW_BOM_Type_WRLN"));
		errorFlag = true;
	}
}
var wirelineContractManagerError = wirelineValidationLib.validateWirelineContractManager(node, stepManager, ug);
if (wirelineContractManagerError) {
	dataIssues.addWarning(wirelineContractManagerError, node, stepManager.getAttributeHome().getAttributeByID("Contract_Manager"));
	errorFlag = true;
}
if (!commonValidationLib.isItemNumberExist(node)) {
	wirelineDerivationLib.setTechStaff(node, stepManager); // STIBO-3172 Prod Support Team(22 Feb Release)
}

wirelineDerivationLib.setMicCoe(node); // set Mic_Coe from MIC_COE_WRLN
wirelineDerivationLib.setRestrictedtoExternalSystem(node); // Set Restricted to External System
wirelineDerivationLib.setPurchasingCat(node, stepManager);
wirelineDerivationLib.setE911Category(node); // STIBO-3172 Prod Support Team(22 Feb Release)
if (!commonValidationLib.isItemNumberExist(node)) {
	wirelineDerivationLib.setItemCriticalityIndicator(node); // STIBO-3172 Prod Support Team(22 Feb Release)
}
wirelineDerivationLib.setRegionalItemFlag(node); // Set Regional Item Flag
wirelineDerivationLib.setExpenditureCode(node); // Set Expenditure Code
wirelineDerivationLib.setPlanningRoute(node); // Set Planning Route
wirelineDerivationLib.setExternalAppDownloadCode(node); // Set External App Download Code
wirelineDerivationLib.setProductType(node);
wirelineDerivationLib.clearSafetyIndicatorAndOrmdClass(node); // Clear Safety Indicator and Ormd Class if Material item type = !Minor Material, Item Status ! = Active S,  Region_Distribution_Center  != MW1, SW1, WE2, WE3
wirelineDerivationLib.clearStockItemGroup(node);
commonDerivationLib.removeSpecialCharsAndToUpperCase(node, stepManager, bf, "Mfg_Part_No");
commonDerivationLib.removeSpecialCharsAndToUpperCase(node, stepManager, bf, "User_Defined_Item_Description");
commonDerivationLib.removeSpecialCharsAndToUpperCase(node, stepManager, bf, "Long_Description");
wirelineDerivationLib.setWirelineItemDescription(node);
wirelineDerivationLib.setOALCTrk(node);
wirelineDerivationLib.clearRecoveryTypeAndHandlingClass(node); // Recovery Type and Handling class are only applicable for Plug In items
wirelineDerivationLib.setCapitalTool(node); // Set Capital Tool
wirelineDerivationLib.setUOMandPatternAccount(node); // set "CA" for UMO and "C7" for Pattern Account if material Item Type is "Billing Category Item"
wirelineDerivationLib.setASEStatus(node);
wirelineDerivationLib.setBarCodeReceiptReq(node); // STIBO- 2404  Support Team(July 20 Release)	
wirelineDerivationLib.getMicCoe(node); //Derive the value for MIC COE based on Material Type, OALC Trk, BOM Type & Price range on the node
wirelineDerivationLib.deriveAssetandSerializedIndicator(node); // Derive Asset & Serialized Indicator
wirelineDerivationLib.setUserDefinedItemNumber(node, stepManager); //Derive User Item Number	
wirelineDerivationLib.setESIAttributesValues(node, lookupTableHome); // Set ESI Attributes Values
commonDerivationLib.setStatusControlledAttributesValues(node, lookupTableHome);
commonDerivationLib.setReceiveCloseTolerance(node, stepManager); // // Consolidated rules for Receive_Close_Tolerance, Receipt_Required_Flag and Match_Approval_Level
commonDerivationLib.setOrderableOnWebFlag(node);
commonDerivationLib.setListPrice(node);
wirelineDerivationLib.setPatternAccount(node);
wirelineDerivationLib.setExlTpiFlag(node);
wirelineDerivationLib.setJDAAttributes(node);
commonDerivationLib.copyAttributeValue(node, "COGS_Account_Org", "COGS_Account", "LOV");
commonDerivationLib.copyAttributeValue(node, "Sales_Account_Org", "Sales_Account", "LOV");


var ESIAttributesError = wirelineValidationLib.validateESIAttributesValues(node, lookupTableHome);
if (ESIAttributesError) {
	dataIssues.addWarning(ESIAttributesError, node, stepManager.getAttributeHome().getAttributeByID("Item_Status_WRLN"));
	errorFlag = true;
}

var wirelineItemStatusError = wirelineValidationLib.validateWirelineItemStatus(node);
if (wirelineItemStatusError) {
	dataIssues.addWarning(wirelineItemStatusError, node, stepManager.getAttributeHome().getAttributeByID("Item_Status_WRLN"));
	errorFlag = true;
}
var nonCatsMicCodeError = wirelineValidationLib.validateNonCatsMicCode(node);
if (nonCatsMicCodeError) {
	dataIssues.addWarning(nonCatsMicCodeError, node, stepManager.getAttributeHome().getAttributeByID("Non_CATS_MIC_Code"));
	//dataIssues.addWarning(nonCatsMicCodeError);
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
if (!commonValidationLib.isItemNumberExist(node)) {
	var regionsError = wirelineValidationLib.validateRegions(node);
	if (regionsError) {
		dataIssues.addWarning(regionsError, node, stepManager.getAttributeHome().getAttributeByID("Region_Distribution_Center"));
		errorFlag = true;
	}
}
var bomTypeError = wirelineValidationLib.validateBOMType(node, stepManager);
if (bomTypeError) {
	dataIssues.addWarning(bomTypeError, node, stepManager.getAttributeHome().getAttributeByID("NTW_BOM_Type_WRLN"));
	errorFlag = true;
}
var contractManagerError = wirelineValidationLib.validateContractManager(node);
if (contractManagerError) {
	dataIssues.addWarning(contractManagerError, node, stepManager.getAttributeHome().getAttributeByID("Contract_Manager"));
	errorFlag = true;
}
var validateMicCOEError = wirelineValidationLib.validateMICCOE(node);
if (validateMicCOEError) {
	dataIssues.addWarning(validateMicCOEError, node, stepManager.getAttributeHome().getAttributeByID("MIC_COE_WRLN"));
	errorFlag = true;
}
var dbossTrackingQtyError = wirelineValidationLib.validateDbossTrackingQuantity(node);
if (dbossTrackingQtyError) {
	dataIssues.addWarning(dbossTrackingQtyError, node, stepManager.getAttributeHome().getAttributeByID("Dboss_Track_by_Qty"));
	errorFlag = true;
}
var wttFinancialTrackableError = wirelineValidationLib.validateWttFinancialTrackable(node);
if (wttFinancialTrackableError) {
	dataIssues.addWarning(wttFinancialTrackableError, node, stepManager.getAttributeHome().getAttributeByID("WTT_Financially_Trackable"));
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
const regionStatusConfigs = wirelineValidationLib.getRegionStatusConfigs();
regionStatusConfigs.forEach(function(regionConfig) {
	var childOrgStatusError = wirelineValidationLib.validateRegionStatus(node, regionConfig.region, regionConfig.statusField, regionConfig.message);
	if (childOrgStatusError) {
		dataIssues.addWarning(childOrgStatusError, node, stepManager.getAttributeHome().getAttributeByID(regionConfig.statusField));
		errorFlag = true;
	}
});
/* var planningRouteError = wirelineValidationLib.validatePlanningRoute(node);
if (planningRouteError) {
	dataIssues.addWarning(planningRouteError, node, stepManager.getAttributeHome().getAttributeByID("Planning_Route"));
	errorFlag = true;
} */

var shippableError = commonValidationLib.validateShippable(node);
if (shippableError) {
	webUIContext.showAlert("INFO", shippableError);
}
var purchasingItemFlagError = commonValidationLib.validatePurchasingItemFlag(node);
if (purchasingItemFlagError) {
	webUIContext.showAlert("INFO", purchasingItemFlagError);
}
var inventoryItemFlagError = commonValidationLib.validateInventoryItem(node);
if (inventoryItemFlagError) {		
	webUIContext.showAlert("INFO", inventoryItemFlagError);
}
var customerOrderFlagError = commonValidationLib.validateCustomerOrderFlag(node);
if (customerOrderFlagError) {		
	webUIContext.showAlert("INFO", customerOrderFlagError);
}
var costingEnabledError = commonValidationLib.validateCostingEnabled(node);
if (costingEnabledError) {		
	webUIContext.showAlert("INFO", costingEnabledError);
}
var mandatoryAttributesError = commonValidationLib.validateMandatoryAttibutesFromGroup(node, "AG_Web_Item_WRLN_Mandatory Check", stepManager)
     if (mandatoryAttributesError) {     	
	     dataIssues.addWarning(mandatoryAttributesError);
	     errorFlag = true;
}

unspscLib.createUNSPSCReference(node, stepManager, query);

if (errorFlag) {
	return dataIssues;
} else {
	return true;
}
}