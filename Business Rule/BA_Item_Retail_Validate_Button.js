/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Item_Retail_Validate_Button",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Validation_Actions" ],
  "name" : "Item Retail Validate Button",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Cost_Common_Attributes_Derivation",
    "libraryAlias" : "commonCostDerivationLib"
  }, {
    "libraryId" : "BL_Item_Retail_Derivation",
    "libraryAlias" : "retailDerivationLib"
  }, {
    "libraryId" : "BL_Item_UNSPSC_Derivation",
    "libraryAlias" : "unspscLib"
  }, {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonDerivationLib"
  }, {
    "libraryId" : "BL_Item_Common_Validation",
    "libraryAlias" : "commonValidationLib"
  }, {
    "libraryId" : "BL_SPL_Derivation",
    "libraryAlias" : "splLib"
  }, {
    "libraryId" : "BL_Item_Retail_Validation",
    "libraryAlias" : "retailValidationLib"
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
    "alias" : "bfRemoveJunkChar",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>BF_Item_RTL_ENT_Trim_Special_Chars</BusinessFunction>\n</BusinessFunctionReference>\n",
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUpTable",
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
    "contract" : "UserGroupBindContract",
    "alias" : "dtvUserGroup",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_DTV_Sourcing",
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "dataIssues",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webUIContext",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessFunctionBindContract",
    "alias" : "bfRemoveJunkCharDevice",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>BF_Item_Retail_Device_Trim_Special_Char</BusinessFunction>\n</BusinessFunctionReference>\n",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,bfRemoveJunkChar,lookUpTable,query,dtvUserGroup,dataIssues,webUIContext,bfRemoveJunkCharDevice,commonCostDerivationLib,retailDerivationLib,unspscLib,commonDerivationLib,commonValidationLib,splLib,retailValidationLib) {
/**
 * @author -Madhuri [CTS]
 * Retail Validate Button Business Rules
 */
var errorFlag = false;
retailDerivationRules();
retailValidationRules();

function retailDerivationRules() {
	unspscLib.createUNSPSCReference(node, stepManager, query);
	commonDerivationLib.removeJunkChars(node, stepManager, "Long_Description", bfRemoveJunkChar); // Removing Junk chars. Allow ASCII 32-126
	retailDerivationLib.clearUserDefinedItemDescription(node, stepManager); // Clear off the values other than Intang or DF item types
	retailDerivationLib.clearChemicalCancerAndReproductive(node); // If Toxicity = ND, Clear the value for "CA Prop 65 Chemical - Cancer" & "CA Prop 65 Chemical - Reproductive"	
	retailDerivationLib.setFieldOrgsAndAssignScope(node); // If Market Linking is "GSM", default to "C" & "Retail All DCs"
	commonCostDerivationLib.setSubmittedDateAndStandardCost(node, stepManager); // Set current date;
	commonDerivationLib.setSerialGeneration(node, "RTL", stepManager); // Serial Generation is "6" for Serailized Item, Else "1"
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "RTL", "Item_Class", "RTL_Item_Class", "LOV"); // Derived Item Class based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "RTL", "Product_Class", "RTL_Product_Class", "LOV"); // Derived Product Class based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "RTL", "Product_Type", "RTL_Product_Type", "LOV"); // Derived Product Type based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "RTL", "Product_Sub_Type", "RTL_Product_Sub_Type", "LOV"); // Derived Product Sub Type based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "RTL", "COGS_Account", "RTL_COGS_Account", "Text"); // Derived COGS Account Type based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "RTL", "Sales_Account", "RTL_Sales_Account", "LOV"); // Derived Sales Account based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "RTL", "Purchasing_Cat_RTL", "RTL_Purchasing_Cat", "LOV"); // Derived Purchasing Cat based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "RTL", "Reservable", "RTL_Reservable_Flag", "LOV"); // Derived Reservable based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "RTL", "Inventory_Asset_Value", "RTL_Inventory_Asset_Flag", "LOV"); // Derived Inventory Asset Value based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "RTL", "User_Item_Type_RTL", "RTL_User_Item_Type", "LOV"); // Derived User Item Type based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "RTL", "Send_Item_Info", "RTL_Send_Item_Info", "LOV"); // Derived Send Item Info based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "RTL", "Intangible_Nonship", "RTL_Intangible_Nonshippable_Item", "LOV"); // Derived Send Item Info based on Item Type	
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "RTL", "Cat_Group_Name", "RTL_Catalog_Group_Name", "LOV"); // Derived Catalog Group Name based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "RTL", "Description_Prefix", "RTL_Description_Prefix", "LOV"); // Derived Description Prefix based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "RTL", "No_Commit_Fee_Eligible", "RTL_No_Commitment_Fee_Eligible", "LOV"); // Derived No Commitment Fee Eligible based on Item Type
	//if (!node.getValue("Item_Num").getValue()) {		
	//	commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Template_Name", "RTL_Template_Name", "LOV"); // Derived TemplateName based on Item Type
	//	}
	commonDerivationLib.setBatteryTechnology(node, stepManager);
	commonDerivationLib.setHazmatUnNumber(node, lookUpTable); // set Hazmat UN Number based on BatteryTechnology & BatteryPackaging attributes
	retailDerivationLib.clearCaProp65ChemicalCancer(node); //Clear CA Prop 65 Chemical - Cancer id if CA Prop 65 Toxicity Type is ND
	retailDerivationLib.clearUniversalItem(node); //Clear Universal Item for non Apple items
	retailDerivationLib.setLineOfBusinessCat(node, stepManager); // set Line Of Business Category from Source Sheet
	retailDerivationLib.setAPCategory(node, stepManager); // set AP Category for Accessory items
	retailDerivationLib.setAPSubCategory(node, stepManager); // set AP SubCategory for Accessory items
	commonDerivationLib.removeJunkChars(node, stepManager, "Model", bfRemoveJunkCharDevice);
	commonDerivationLib.removeJunkChars(node, stepManager, "Marketing_Name", bfRemoveJunkCharDevice);
	commonDerivationLib.convertToUpperCase(node, "Marketing_Name");
	commonDerivationLib.convertToUpperCase(node, "Model");
	commonDerivationLib.setItemRequestor(node, stepManager); // STIBO-2586 Set Current User when blank. Must be in lower case. 
	commonDerivationLib.trimWhiteSpacesAndNewLines(node, stepManager); // STIBO-2634 Prod Support Team
	retailDerivationLib.setDimensionAttributes(node); // STIBO- 2874 PDH Support Team June 7th Release	
	commonDerivationLib.setDefaultValueIfEmpty(node, "Sourcing_Notify", "LOV", "Y");
	retailDerivationLib.convertToUpperCaseMfgPartNoAndItemDesc(node);
	//commonDerivationLib.setUPC(node, stepManager); 
	commonDerivationLib.setStatusControlledAttributesValues(node, lookUpTable);
	commonDerivationLib.setOrderableOnWebFlag(node);
	commonDerivationLib.setListPrice(node);
	commonDerivationLib.setIMEIType(node);
	commonDerivationLib.setIntangibleNonShippable(node, stepManager);
	commonDerivationLib.setItemDescription(node, stepManager, "RTL");
	commonDerivationLib.setCAManufacturerPackageWarning(node)
	retailDerivationLib.setThirdPartyEligible(node);
	commonDerivationLib.setSubmitStandardCost(node);
}

function retailValidationRules() {
	var userRoleError = commonValidationLib.validateUserRole(node, stepManager, lookUpTable);
	if (userRoleError) {
		//webUIContext.showAlert("Error", userRoleError)
		dataIssues.addWarning(userRoleError);
		errorFlag = true;
	}
	var technologyError = commonValidationLib.validateMandatoryAttributeForSerializedItem(node, stepManager, "Technology", "RTL"); // Technology is mandatory for serialized items.	
	if (technologyError) {
		dataIssues.addWarning(technologyError, node, stepManager.getAttributeHome().getAttributeByID("Technology"));
		errorFlag = true;
	}
	var serialTypeError = commonValidationLib.validateMandatoryAttributeForSerializedItem(node, stepManager, "Serial_Type", "RTL"); // Serial_Type is mandatory for serialized items.
	if (serialTypeError) {
		dataIssues.addWarning(serialTypeError, node, stepManager.getAttributeHome().getAttributeByID("Serial_Type"));
		errorFlag = true;
	}
	var marketingError = retailValidationLib.validateMarketingNameCharLimit(node); // Marketing Name char limit is 10. Model char limit is 8. Total limit is 18.
	if (marketingError) {
		dataIssues.addWarning(marketingError, node, stepManager.getAttributeHome().getAttributeByID("Marketing_Name"));
		errorFlag = true;
	}
	var modelError = retailValidationLib.validateModelCharLimit(node); // Model char limit is 8.
	if (modelError) {
		dataIssues.addWarning(modelError, node, stepManager.getAttributeHome().getAttributeByID("Model"));
		errorFlag = true;
	}
	var marketingAndModelError = retailValidationLib.validateMarketingNameAndModelCharLimit(node); // Marketing Name + Model char limit is 18.
	if (marketingAndModelError) {
		dataIssues.addWarning(marketingAndModelError, node, stepManager.getAttributeHome().getAttributeByID("Model"));
		errorFlag = true;
	}
	var customMarketLinkingError = retailValidationLib.validateCustomMarketLinking(node) // CustomMarketLinking is mandatory if Market Linking is CUS.
	if (customMarketLinkingError) {
		dataIssues.addWarning(customMarketLinkingError, node, stepManager.getAttributeHome().getAttributeByID("Custom_Mkt_Link"));
		errorFlag = true;
	}
	var firstNetCapableError = retailValidationLib.validateFirstNetCapable(node); // FirstNetCapable is mandatory for Phone and SIM Item Types	
	if (firstNetCapableError) {
		dataIssues.addWarning(firstNetCapableError, node, stepManager.getAttributeHome().getAttributeByID("FirstNet_Capable"));
		errorFlag = true;
	}
	var userDefinedItemNumberError = retailValidationLib.validateUserDefinedItemNumber(node); //User Defined Item Number is mandatory for DF_3PL and DF_COLLATERAL_YOUNG_AMERICA
	if (userDefinedItemNumberError) {
		dataIssues.addWarning(userDefinedItemNumberError, node, stepManager.getAttributeHome().getAttributeByID("User_Defined_Item_Num"));
		errorFlag = true;
	}
	var caPackageWarningError = commonValidationLib.validateCaManufacturerPackageWarning(node, "RTL");
	if (caPackageWarningError) {
		dataIssues.addWarning(caPackageWarningError, node, stepManager.getAttributeHome().getAttributeByID("CA_Manufacturer_Package_Warning"));
		errorFlag = true;
	}
	var subsidyEligibleError = retailValidationLib.validateSubsidyEligible(node, stepManager); //Subsidy is required based on Item Type	 
	if (subsidyEligibleError) {
		dataIssues.addWarning(subsidyEligibleError, node, stepManager.getAttributeHome().getAttributeByID("Subsidy_Eligible"));
		errorFlag = true;
	}
	var userDefItemDescError = retailValidationLib.validateUserDefItemDesc(node, stepManager); // User def Item Description is mandatory based on Item Class
	if (userDefItemDescError) {
		dataIssues.addWarning(userDefItemDescError, node, stepManager.getAttributeHome().getAttributeByID("User_Defined_Item_Description"));
		errorFlag = true;
	}
	var duplicateUserDefItemNumError = commonValidationLib.validateDuplicateUserDefItemNum(node, stepManager, query);
	if (duplicateUserDefItemNumError) {
		dataIssues.addWarning(duplicateUserDefItemNumError, node, stepManager.getAttributeHome().getAttributeByID("User_Defined_Item_Num"));
		errorFlag = true;
	}
	var caProp65ChemicalCancerError = commonValidationLib.validateCaProp65ChemicalCancer(node, webUIContext); // CAProp65ChemicalCancer is mandatory if Toxicity Type is CD, CR1 or CR2
	if (caProp65ChemicalCancerError) {
		dataIssues.addWarning(caProp65ChemicalCancerError, node, stepManager.getAttributeHome().getAttributeByID("Ca_Prop_65_Chem_Cancr"));
		errorFlag = true;
	}
	var caProp65ChemicalReproductiveError = commonValidationLib.validateCaProp65ChemicalReproductive(node, webUIContext); // CAProp65ChemicalCancer is mandatory if Toxicity Type is CD, CR1 or CR2
	if (caProp65ChemicalReproductiveError) {
		dataIssues.addWarning(caProp65ChemicalReproductiveError, node, stepManager.getAttributeHome().getAttributeByID("Ca_Prop_65_Chem_Repro"));
		errorFlag = true;
	}
	var wip1CompSkuError = retailValidationLib.validateWip1CompSku(node); //blocking WIP1XX Compsku creation; STIBO-3377
	if (wip1CompSkuError) {
		dataIssues.addWarning(wip1CompSkuError, node, stepManager.getAttributeHome().getAttributeByID("Companion_Item_Type"));
		errorFlag = true;
	}
	var VMISupplierSiteError = retailValidationLib.validateVMISupplierSite(node);
	if (VMISupplierSiteError) {
		dataIssues.addWarning(VMISupplierSiteError, node, stepManager.getAttributeHome().getAttributeByID("VMI_Supplier_Site"));
		errorFlag = true;
	}

	var mcDimensionUnitError = retailValidationLib.validateMcDimensionUnit(node); // STIBO- 2874 PDH Support Team June 7th Release
	if (mcDimensionUnitError) {
		dataIssues.addWarning(mcDimensionUnitError, node, stepManager.getAttributeHome().getAttributeByID("MC_Dimension_Unit_Temp"));
		errorFlag = true;
	}
	var mcWeightUnitError = retailValidationLib.validateMcWeightUnit(node); // STIBO- 2874 PDH Support Team June 7th Release
	if (mcWeightUnitError) {
		dataIssues.addWarning(mcWeightUnitError, node, stepManager.getAttributeHome().getAttributeByID("MC_Weight_Unit_Temp"));
		errorFlag = true;
	}
	var sourcingManagerError = commonValidationLib.validateSourcingManager(node, stepManager, dtvUserGroup);
	if (sourcingManagerError) {
		dataIssues.addWarning(sourcingManagerError, node, stepManager.getAttributeHome().getAttributeByID("Contract_Manager"));
		errorFlag = true;
	}

	var generateNewUpcError = commonValidationLib.validateGenerateNewUpc(node);
	if (generateNewUpcError) {
		dataIssues.addWarning(generateNewUpcError, node, stepManager.getAttributeHome().getAttributeByID("Generate_New_UPC"));
		errorFlag = true;
	}

	var costAttributesError = commonValidationLib.validateCostAttributes(node, stepManager);
	if (costAttributesError) {
		dataIssues.addWarning(costAttributesError, node, stepManager.getAttributeHome().getAttributeByID("Requested_Standard_Cost"));
		errorFlag = true;
	}
	var serialGenerationError = retailValidationLib.validateSerialGeneration(node);
	if (serialGenerationError) {
		dataIssues.addWarning(serialGenerationError, node, stepManager.getAttributeHome().getAttributeByID("Serial_Generation"));
		errorFlag = true;
	}
	var ICCIDPrefixError = retailValidationLib.validateICCIDPrefix(node);
	if (ICCIDPrefixError) {
		dataIssues.addWarning(ICCIDPrefixError, node, stepManager.getAttributeHome().getAttributeByID("ICCID_Prefix"));
		errorFlag = true;
	}
	var configCodeError = retailValidationLib.validateConfigCode(node,stepManager);
	if (configCodeError) {
		dataIssues.addWarning(configCodeError, node, stepManager.getAttributeHome().getAttributeByID("Config_Code"));
		errorFlag = true;
	}
	var apDeptError = retailValidationLib.validateAPDept(node);
	if (apDeptError) {
		dataIssues.addWarning(apDeptError, node, stepManager.getAttributeHome().getAttributeByID("AP_Dept"));
		errorFlag = true;
	}
	
	var apSubDeptError = retailValidationLib.validateAPSubDept(node);
	if (apSubDeptError) {
		dataIssues.addWarning(apSubDeptError, node, stepManager.getAttributeHome().getAttributeByID("AP_Sub_Dept"));
		errorFlag = true;
	}
	var apOperatingSystemError = retailValidationLib.validateAPOperatingSystem(node);
	if (apOperatingSystemError) {
		dataIssues.addWarning(apOperatingSystemError, node, stepManager.getAttributeHome().getAttributeByID("AP_Operating_System"));
		errorFlag = true;
	}	
	var batteryTechnologyError=retailValidationLib.validateBatteryTechnology(node);
	if(batteryTechnologyError){
		dataIssues.addWarning(batteryTechnologyError, node, stepManager.getAttributeHome().getAttributeByID("Battery_Technology"));
		errorFlag = true;
	}
	var submitStandardCostError = commonValidationLib.validateSubmitStandardCost(node, stepManager);
	if (submitStandardCostError) {		
		webUIContext.showAlert("INFO", submitStandardCostError);
	}
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
	var unspscError = unspscLib.validateUNSPSCReference(node, stepManager);
	if (unspscError) {
		dataIssues.addWarning(unspscError);
		// webUIContext.showAlert("Error", unspscError);
		errorFlag = true;
	}
	var costingEnabledError = commonValidationLib.validateCostingEnabled(node);
	if (costingEnabledError) {		
		webUIContext.showAlert("INFO", costingEnabledError);
	}
	var mandatoryAttributesError = commonValidationLib.validateMandatoryAttibutesFromGroup(node, "AG_Web_Item_RTL_Mandatory Check", stepManager)
     if (mandatoryAttributesError) {     	
	     dataIssues.addWarning(mandatoryAttributesError);
	     errorFlag = true;
     }
     var submitStdCostBOMError = retailValidationLib.validateSubmitStandardCostBOM(node);
	if (submitStdCostBOMError) {
		dataIssues.addWarning(submitStdCostBOMError, node, stepManager.getAttributeHome().getAttributeByID("Submit_Standard_Cost"));
		errorFlag = true;
	}

	var upcLengthError = commonValidationLib.validateUPCLength(node);
	if (upcLengthError) {
		//webUIContext.showAlert("Error", userRoleError)
		//dataIssues.addWarning(upcLengthError);
		dataIssues.addWarning(upcLengthError, node, stepManager.getAttributeHome().getAttributeByID("UPC"));
		errorFlag = true;
	}

	var upcNonIntError = commonValidationLib.validateUPCNumber(node);
	if (upcNonIntError) {
		//webUIContext.showAlert("Error", userRoleError)
		//dataIssues.addWarning(upcLengthError);
		dataIssues.addWarning(upcNonIntError, node, stepManager.getAttributeHome().getAttributeByID("UPC"));
		errorFlag = true;
	}

	var upcError = commonDerivationLib.setUPC(node,stepManager);
	log.info("upcError :"+upcError);
	if (upcError){
		dataIssues.addWarning(upcError, node, stepManager.getAttributeHome().getAttributeByID("UPC"));
		errorFlag = true;
	}
		
}

if (errorFlag) {
	return dataIssues;
} else {
	return true;
}
}