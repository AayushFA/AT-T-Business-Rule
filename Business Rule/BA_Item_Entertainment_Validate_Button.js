/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Item_Entertainment_Validate_Button",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Validation_Actions" ],
  "name" : "Item Entertainment Validate Button",
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
    "libraryId" : "BL_Item_UNSPSC_Derivation",
    "libraryAlias" : "unspscLib"
  }, {
    "libraryId" : "BL_Item_Entertainment_Validation",
    "libraryAlias" : "entertainmentValidationLib"
  }, {
    "libraryId" : "BL_Item_Entertainment_Derivation",
    "libraryAlias" : "entertainmentDerivationLib"
  }, {
    "libraryId" : "BL_SPL_Derivation",
    "libraryAlias" : "splLib"
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
    "alias" : "bfRemoveJunkChar",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>BF_Item_RTL_ENT_Trim_Special_Chars</BusinessFunction>\n</BusinessFunctionReference>\n",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,lookUpTable,query,dtvUserGroup,dataIssues,webUIContext,bfRemoveJunkChar,commonDerivationLib,unspscLib,entertainmentValidationLib,entertainmentDerivationLib,splLib,commonValidationLib) {
/**
 * @author -Madhuri [CTS]
 * Entertainment Validate Button Business Rules
 */

var errorFlag = false;
entertainmentDerivationRules();
entertainmentValidationRules();

if (errorFlag) {
	return dataIssues;
} else {
	return true;
}

function entertainmentDerivationRules() {
	unspscLib.createUNSPSCReference(node, stepManager, query);
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "ENT", "Asset_Tracking_Scope", "Ent_Asset_Tracking_Scope", "LOV"); // Derived Item Class based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "ENT", "Bar_Code_Receipt_Req", "Ent_Bar_Code_Receipt_Required", "LOV"); // Derived Product Class based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "ENT", "Product_Type", "Ent_Product_Type", "LOV"); // Derived Product Type based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "ENT", "Product_Sub_Type", "Ent_Product_SubType", "LOV"); // Derived Product Sub Type based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "ENT", "Description_Prefix", "Ent_Description_Prefix", "LOV"); // Derived Description Prefix based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "ENT", "Purchasing_Cat_ENT", "Ent_Purchasing_Category", "LOV"); // Derived Purchasing Cat based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "ENT", "Regional_Item_Flag", "Ent_Regional_Item_Flag", "LOV"); // Derived Purchasing Cat based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "ENT", "Sales_Account", "Ent_Sales_Account", "LOV"); // Derived Sales Account based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "ENT", "Send_Asset_Txn_To_Finance", "Ent_Send_Asset_Txn_To_Finance", "LOV"); // Derived Sales Account based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "ENT", "Send_Item_Info", "Ent_Send_Item_Info", "LOV"); // Derived Send Item Info based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "ENT", "Technology", "Ent_Technology", "LOV"); // Derived Send Item Info based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "ENT", "User_Item_Type_ENT", "Ent_User_Item_Type", "LOV"); // Derived User Item Type based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "ENT", "Item_Class", "Ent_Item_Class", "LOV");
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "ENT", "Item_Assign_Scope", "Ent_Item_Assignment_Scope", "LOV");
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "ENT", "COGS_Account", "Ent_COGS_Account", "LOV"); // Derived COGS Account Type based on Item Type
	commonDerivationLib.deriveBasedOnItemType(node, stepManager, "ENT", "Cat_Group_Name", "Ent_Cat_Group_Name", "LOV"); // Derived Catalog Group Name based on Item Type
	entertainmentDerivationLib.setRIOPartNumber(node);
	if (!node.getValue("Item_Num").getValue()) {
		commonDerivationLib.deriveBasedOnItemType(node, stepManager, "ENT", "Item_Status_ENT", "Ent_Item_Status", "LOV"); // Derived Item Status based on Item Type
	}

	var itemType = node.getValue("ENT_Item_Type").getID();
	var userItemType = node.getValue("User_Item_Type_ENT").getID();
	var itemClass = node.getValue("Item_Class").getID();

	commonDerivationLib.removeJunkChars(node, stepManager, "Long_Description", bfRemoveJunkChar); // Removing Junk chars. Allow ASCII 32-126
	commonDerivationLib.removeSpecialCharsAndToUpperCase(node, stepManager, bfRemoveJunkChar, "Model");
	commonDerivationLib.removeSpecialCharsAndToUpperCase(node, stepManager, bfRemoveJunkChar, "Marketing_Name");
	commonDerivationLib.removeSpecialCharsAndToUpperCase(node, stepManager, bfRemoveJunkChar, "Mfg_Part_No");
	commonDerivationLib.removeSpecialCharsAndToUpperCase(node, stepManager, bfRemoveJunkChar, "User_Defined_Item_Description");
	entertainmentDerivationLib.setExtAppDownloadCode(node);
	entertainmentDerivationLib.setProductClass(node);
	node.getValue("Submitted_Date").setSimpleValue(commonDerivationLib.getCurrentDate());
	entertainmentDerivationLib.setSubmitStandardCost(node, stepManager);
	commonDerivationLib.setItemRequestor(node, stepManager);
	entertainmentDerivationLib.setMatchApprovalLevel(node);
	entertainmentDerivationLib.deriveIrdDesignator(node, lookUpTable);
	entertainmentDerivationLib.setLineOfBusinessCat(node,stepManager);
	entertainmentDerivationLib.setProductName(node);
	entertainmentDerivationLib.setENTExpenseAccountOrg(node, stepManager);
	commonDerivationLib.trimWhiteSpacesAndNewLines(node, stepManager);
	commonDerivationLib.roundListPrice(node);
	commonDerivationLib.setUPC(node, stepManager);
	commonDerivationLib.setSerialGeneration(node, "ENT", stepManager); // Serial Generation is "6" for Serailized Item, Else "1"
	commonDerivationLib.setListPrice(node);
	commonDerivationLib.setIMEIType(node);
	commonDerivationLib.setStatusControlledAttributesValues(node, lookUpTable);
	commonDerivationLib.setIntangibleNonShippable(node, stepManager);
	commonDerivationLib.setItemDescription(node, stepManager, "ENT");
	commonDerivationLib.setOrderableOnWebFlag(node);
	commonDerivationLib.setReceiptRequiredFlag(node, stepManager);
	commonDerivationLib.setCAManufacturerPackageWarning(node);
	entertainmentDerivationLib.setRecoverableStateImpact(node);
	entertainmentDerivationLib.setProductLineItemNumber(node, stepManager, query);
	commonDerivationLib.setSubmitStandardCost(node);	
	if (userItemType == "SATELLITE" && itemType != "Field Inventory Aggregation Code") {
		commonDerivationLib.clearAttributeValue(node, "User_Defined_Item_Num");
		commonDerivationLib.clearAttributeValue(node, "Requested_Standard_Cost");
	}
	if (itemClass == "ATT Entertainment Make Model")
		commonDerivationLib.clearAttributeValue(node, "Make");
}

function entertainmentValidationRules() {
	var itemType = node.getValue("ENT_Item_Type").getID();
	var userItemType = node.getValue("User_Item_Type_ENT").getID();
	var itemClass = node.getValue("Item_Class").getID();
	var productType = node.getValue("Product_Type").getID();

	var descriptionPrefixError = entertainmentValidationLib.validateDescriptionPrefix(node, userItemType, itemClass);
	if (descriptionPrefixError) {
		dataIssues.addWarning(descriptionPrefixError, node, stepManager.getAttributeHome().getAttributeByID("Description_Prefix"));
		errorFlag = true;
	}
	var userDefinedItemNumberError = entertainmentValidationLib.validateUserDefItemNumber(node);
	if (userDefinedItemNumberError) {
		dataIssues.addWarning(userDefinedItemNumberError, node, stepManager.getAttributeHome().getAttributeByID("User_Defined_Item_Num"));
		errorFlag = true;
	}
	var linkingCodeError = entertainmentValidationLib.validateLinkingCode(node, userItemType, itemClass);
	if (linkingCodeError) {
		dataIssues.addWarning(linkingCodeError, node, stepManager.getAttributeHome().getAttributeByID("Linking_Code"));
		errorFlag = true;
	}
	var serialTypeError = commonValidationLib.validateMandatoryAttributeForSerializedItem(node, stepManager, "Serial_Type", "ENT"); // Serial_Type is mandatory for serialized items.
	if (serialTypeError) {
		dataIssues.addWarning(serialTypeError, node, stepManager.getAttributeHome().getAttributeByID("Serial_Type"));
		errorFlag = true;
	}
	var caPackageWarningError = commonValidationLib.validateCaManufacturerPackageWarning(node, "ENT");
	if (caPackageWarningError) {
		dataIssues.addWarning(caPackageWarningError, node, stepManager.getAttributeHome().getAttributeByID("CA_Manufacturer_Package_Warning"));
		errorFlag = true;
	}
	var dtvMandatoryAttributesList = ['Buyer', 'Model', 'OEM', 'Asset_Tracking_Scope', 'Requestor', 'Send_Asset_Txn_To_Finance'];
	var dtvAttributeError = "";
	dtvMandatoryAttributesList.forEach(function(attribute) {
		dtvAttributeError = entertainmentValidationLib.validateDTVMandatoryAttributes(node, stepManager, attribute, itemClass);
		if (dtvAttributeError) {
			dataIssues.addWarning(dtvAttributeError, node, stepManager.getAttributeHome().getAttributeByID(attribute));
			errorFlag = true;
		}
	});
	var mfgPartNumberError = entertainmentValidationLib.validateMfgPartNo(node, itemClass);
	if (mfgPartNumberError) {
		dataIssues.addWarning(mfgPartNumberError, node, stepManager.getAttributeHome().getAttributeByID("Mfg_Part_No"));
		errorFlag = true;
	}
	var brandNameError = entertainmentValidationLib.validateBrandName(node, itemClass);
	if (brandNameError) {
		dataIssues.addWarning(brandNameError, node, stepManager.getAttributeHome().getAttributeByID("Brand_Name"));
		errorFlag = true;
	}
	var omsItemNumberError = entertainmentValidationLib.validateOmsItemNumber(node, itemType);
	if (omsItemNumberError) {
		dataIssues.addWarning(omsItemNumberError, node, stepManager.getAttributeHome().getAttributeByID("OMS_Item_Number"));
		errorFlag = true;
	}
	var assetTrackingError = entertainmentValidationLib.validateAssetTrackingScope(node, itemClass);
	if (assetTrackingError) {
		dataIssues.addWarning(assetTrackingError, node, stepManager.getAttributeHome().getAttributeByID("Asset_Tracking_Scope"));
		errorFlag = true;
	}
	var accessCardTarrifCodeError = entertainmentValidationLib.validateTariffCode(node, itemType);
	if (accessCardTarrifCodeError) {
		dataIssues.addWarning(accessCardTarrifCodeError, node, stepManager.getAttributeHome().getAttributeByID("Access_Card_Tariff_Code"));
		errorFlag = true;
	}
	var duplicateUserDefItemNumError = commonValidationLib.validateDuplicateUserDefItemNum(node, stepManager, query);
	if (duplicateUserDefItemNumError) {
		dataIssues.addWarning(duplicateUserDefItemNumError, node, stepManager.getAttributeHome().getAttributeByID("User_Defined_Item_Num"));
		errorFlag = true;
	}
	var userDefItemNumMandateError = entertainmentValidationLib.validateMandateUserDefItemNumber(node, itemClass, productType, userItemType)
	if (userDefItemNumMandateError) {
		dataIssues.addWarning(userDefItemNumMandateError, node, stepManager.getAttributeHome().getAttributeByID("User_Defined_Item_Num"));
		errorFlag = true;
	}
	var bvoipLeItemAttributeError = entertainmentValidationLib.validateBvoipAttributes(node, stepManager, itemType, "LE_Item")
	if (bvoipLeItemAttributeError) {
		dataIssues.addWarning(bvoipLeItemAttributeError, node, stepManager.getAttributeHome().getAttributeByID("LE_Item"));
		errorFlag = true;
	}
	var bvoipExpCodeAttributeError = entertainmentValidationLib.validateBvoipAttributes(node, stepManager, itemType, "Expenditure_Code")
	if (bvoipExpCodeAttributeError) {
		dataIssues.addWarning(bvoipExpCodeAttributeError, node, stepManager.getAttributeHome().getAttributeByID("Expenditure_Code"));
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
	var productLineError = entertainmentValidationLib.validateProductLine(node, itemType);
	if (productLineError) {
		dataIssues.addWarning(productLineError, node, stepManager.getAttributeHome().getAttributeByID("Product_Line"));
		errorFlag = true;
	}
	var fieldInventoryIhsCodeError = entertainmentValidationLib.validateFieldInventoryIhsCode(node, itemType);
	if (fieldInventoryIhsCodeError) {
		dataIssues.addWarning(fieldInventoryIhsCodeError, node, stepManager.getAttributeHome().getAttributeByID("IHS_Code"));
		errorFlag = true;
	}
	var brandNameForSerializedError = entertainmentValidationLib.validateBrandNameForSerialized(node, stepManager);
	if (brandNameForSerializedError) {
		dataIssues.addWarning(brandNameForSerializedError, node, stepManager.getAttributeHome().getAttributeByID("Brand_Name"));
		errorFlag = true;
	}
	var sendAssetTxnToFinanceError = entertainmentValidationLib.validateSendAssetTxnToFinance(node);
	if (sendAssetTxnToFinanceError) {
		dataIssues.addWarning(sendAssetTxnToFinanceError, node, stepManager.getAttributeHome().getAttributeByID("Send_Asset_Txn_To_Finance"));
		errorFlag = true;
	}
	var makeModelMandatoryAttributesList = ['Mfg_Part_No', 'OEM_Full_Name', 'CPE_Type'];
	var makeModelAttributeError = "";
	makeModelMandatoryAttributesList.forEach(function(attribute) {
		makeModelAttributeError = entertainmentValidationLib.validateMakeModelMandatoryAttributes(node, stepManager, attribute, itemType);
		if (makeModelAttributeError) {
			dataIssues.addWarning(makeModelAttributeError, node, stepManager.getAttributeHome().getAttributeByID(attribute));
			errorFlag = true;
		}
	});
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
	var userDefinedItemDescError = entertainmentValidationLib.validateUserDefinedItemDescription(node, stepManager, query);
	if (userDefinedItemDescError) {
		webUIContext.showAlert("INFO", userDefinedItemDescError);
	}
	
	var costAttributesError = commonValidationLib.validateCostAttributes(node, stepManager);
	if (costAttributesError) {
		dataIssues.addWarning(costAttributesError, node, stepManager.getAttributeHome().getAttributeByID("Requested_Standard_Cost"));
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
	var costingEnabledError = commonValidationLib.validateCostingEnabled(node);
	if (costingEnabledError) {		
		webUIContext.showAlert("INFO", costingEnabledError);
	}
	var unspscError = unspscLib.validateUNSPSCReference(node, stepManager);
	if (unspscError) {
		dataIssues.addWarning(unspscError);
		// webUIContext.showAlert("Error", unspscError);
		errorFlag = true;
	}
	if(itemType != "Generic Group"){
		var ihsError = entertainmentValidationLib.validateIhsCode(node,stepManager,query);
		if (ihsError) {
			webUIContext.showAlert("INFO", ihsError);
		}
	}
	var mandatoryAttributesError = commonValidationLib.validateMandatoryAttibutesFromGroup(node, "AG_Web_Item_ENT_Mandatory Check", stepManager)
     if (mandatoryAttributesError) {     	
	     dataIssues.addWarning(mandatoryAttributesError);
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

}