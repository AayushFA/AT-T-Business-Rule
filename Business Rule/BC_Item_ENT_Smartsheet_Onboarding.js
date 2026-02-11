/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_ENT_Smartsheet_Onboarding",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Smartsheet_Conditions" ],
  "name" : "Entertainment Smartsheet Onboarding Validations",
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
    "libraryId" : "BL_Item_Entertainment_Validation",
    "libraryAlias" : "entertainmentValidationLib"
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
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "dtvUserGroup",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_DTV_Sourcing",
    "description" : null
  }, {
    "contract" : "QueryHomeBindContract",
    "alias" : "query",
    "parameterClass" : "null",
    "value" : null,
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
exports.operation0 = function (node,stepManager,lookUpTable,dataIssues,dtvUserGroup,query,webUIContext,commonDerivationLib,commonValidationLib,entertainmentValidationLib) {
var errorFlag = false;
if (!node.getValue("ENT_Item_Type").getID()) {
  dataIssues.addWarning("Entertainment Item Type is mandatory for Item Creation.");
  errorFlag = true;
}
var userRoleError = commonValidationLib.validateUserRole(node, stepManager, lookUpTable);
if(userRoleError){
   dataIssues.addWarning(userRoleError);
   errorFlag = true;
}
var upcError = commonValidationLib.validateGenerateNewUpc(node);
if(upcError){
   dataIssues.addWarning(upcError);
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
var itemType = node.getValue("ENT_Item_Type").getID();
var userItemType = node.getValue("User_Item_Type_ENT").getID();
var itemClass = node.getValue("Item_Class").getID();
var productType = node.getValue("Product_Type").getID();
var descriptionPrefixError = entertainmentValidationLib.validateDescriptionPrefix(node,userItemType,itemClass);
if(descriptionPrefixError){
   dataIssues.addWarning(descriptionPrefixError, node, stepManager.getAttributeHome().getAttributeByID("Description_Prefix"));
   errorFlag = true;
}
var userDefinedItemNumberError = entertainmentValidationLib.validateUserDefItemNumber(node);
if(userDefinedItemNumberError){
   dataIssues.addWarning(userDefinedItemNumberError, node, stepManager.getAttributeHome().getAttributeByID("User_Defined_Item_Num"));
   errorFlag = true;
}
var linkingCodeError = entertainmentValidationLib.validateLinkingCode(node,userItemType,itemClass);
if(linkingCodeError){
   dataIssues.addWarning(linkingCodeError, node, stepManager.getAttributeHome().getAttributeByID("Linking_Code"));
   errorFlag = true;
}
var serialTypeError = commonValidationLib.validateMandatoryAttributeForSerializedItem(node,stepManager,"Serial_Type","ENT"); // Serial_Type is mandatory for serialized items.
if(serialTypeError){
   dataIssues.addWarning(serialTypeError, node, stepManager.getAttributeHome().getAttributeByID("Serial_Type"));
   errorFlag = true;
}
var caPackageWarningError = commonValidationLib.validateCaManufacturerPackageWarning(node,"ENT");
if(caPackageWarningError){
   dataIssues.addWarning(caPackageWarningError, node, stepManager.getAttributeHome().getAttributeByID("CA_Manufacturer_Package_Warning"));
   errorFlag = true;
}
var dtvMandatoryAttributesList = ['Buyer','Model','OEM','Asset_Tracking_Scope','Requestor','Send_Asset_Txn_To_Finance'];
var dtvAttributeError ="";
dtvMandatoryAttributesList.forEach(function (attribute) {
   dtvAttributeError = entertainmentValidationLib.validateDTVMandatoryAttributes(node,stepManager,attribute,itemClass); 
   if(dtvAttributeError){
	   dataIssues.addWarning(dtvAttributeError);
	   errorFlag = true;
   }
});
var mfgPartNumberError = entertainmentValidationLib.validateMfgPartNo(node,itemClass);
if(mfgPartNumberError){
	   dataIssues.addWarning(mfgPartNumberError, node, stepManager.getAttributeHome().getAttributeByID("Mfg_Part_No"));
	   errorFlag = true;
   }
var brandNameError = entertainmentValidationLib.validateBrandName(node,itemClass);
if(brandNameError){
	   dataIssues.addWarning(brandNameError, node, stepManager.getAttributeHome().getAttributeByID("Brand_Name"));
	   errorFlag = true;
   }
var omsItemNumberError = entertainmentValidationLib.validateOmsItemNumber(node,itemType);
if(omsItemNumberError){
	   dataIssues.addWarning(omsItemNumberError, node, stepManager.getAttributeHome().getAttributeByID("OMS_Item_Number"));
	   errorFlag = true;
   }
var assetTrackingError = entertainmentValidationLib.validateAssetTrackingScope(node,itemClass);
if(assetTrackingError){
	   dataIssues.addWarning(assetTrackingError, node, stepManager.getAttributeHome().getAttributeByID("Asset_Tracking_Scope"));
	   errorFlag = true;
   }
var accessCardTarrifCodeError = entertainmentValidationLib.validateTariffCode(node,itemType);
if(accessCardTarrifCodeError){
	   dataIssues.addWarning(accessCardTarrifCodeError, node, stepManager.getAttributeHome().getAttributeByID("Access_Card_Tariff_Code"));
	   errorFlag = true;
   }
var duplicateUserDefItemNumError = commonValidationLib.validateDuplicateUserDefItemNum(node,stepManager,query);
if(duplicateUserDefItemNumError){
   dataIssues.addWarning(duplicateUserDefItemNumError, node, stepManager.getAttributeHome().getAttributeByID("User_Defined_Item_Num"));
   errorFlag = true;
}
var userDefItemNumMandateError = entertainmentValidationLib.validateMandateUserDefItemNumber(node,itemClass,productType,userItemType)
if(userDefItemNumMandateError){
   dataIssues.addWarning(userDefItemNumMandateError, node, stepManager.getAttributeHome().getAttributeByID("User_Defined_Item_Num"));
   errorFlag = true;
} 
var bvoipLeItemAttributeError = entertainmentValidationLib.validateBvoipAttributes(node,stepManager,itemType,"LE_Item")
if(bvoipLeItemAttributeError){
   dataIssues.addWarning(bvoipLeItemAttributeError, node, stepManager.getAttributeHome().getAttributeByID("LE_Item"));
   errorFlag = true;
}
var bvoipExpCodeAttributeError = entertainmentValidationLib.validateBvoipAttributes(node,stepManager,itemType,"Expenditure_Code")
if(bvoipExpCodeAttributeError){
   dataIssues.addWarning(bvoipExpCodeAttributeError, node, stepManager.getAttributeHome().getAttributeByID("Expenditure_Code"));
   errorFlag = true;
} 
var caProp65ChemicalCancerError = commonValidationLib.validateCaProp65ChemicalCancer(node,webUIContext); // CAProp65ChemicalCancer is mandatory if Toxicity Type is CD, CR1 or CR2
if(caProp65ChemicalCancerError){
   dataIssues.addWarning(caProp65ChemicalCancerError, node, stepManager.getAttributeHome().getAttributeByID("Ca_Prop_65_Chem_Cancr"));
   errorFlag = true;
}
var caProp65ChemicalReproductiveError = commonValidationLib.validateCaProp65ChemicalReproductive(node,webUIContext); // CAProp65ChemicalCancer is mandatory if Toxicity Type is CD, CR1 or CR2
if(caProp65ChemicalReproductiveError){
   dataIssues.addWarning(caProp65ChemicalReproductiveError, node, stepManager.getAttributeHome().getAttributeByID("Ca_Prop_65_Chem_Repro"));
   errorFlag = true;
}
var productLineError = entertainmentValidationLib.validateProductLine(node,itemType);
if(productLineError){
   dataIssues.addWarning(productLineError, node, stepManager.getAttributeHome().getAttributeByID("Product_Line"));
   errorFlag = true;
}
var fieldInventoryIhsCodeError = entertainmentValidationLib.validateFieldInventoryIhsCode(node,itemType);
if(fieldInventoryIhsCodeError){
   dataIssues.addWarning(fieldInventoryIhsCodeError, node, stepManager.getAttributeHome().getAttributeByID("IHS_Code"));
   errorFlag = true;
}
var brandNameForSerializedError=entertainmentValidationLib.validateBrandNameForSerialized(node, stepManager);
if(brandNameForSerializedError){
   dataIssues.addWarning(brandNameForSerializedError, node, stepManager.getAttributeHome().getAttributeByID("Brand_Name"));
   errorFlag = true;
}
var sendAssetTxnToFinanceError=entertainmentValidationLib.validateSendAssetTxnToFinance(node);
if(sendAssetTxnToFinanceError){
   dataIssues.addWarning(sendAssetTxnToFinanceError, node, stepManager.getAttributeHome().getAttributeByID("Send_Asset_Txn_To_Finance"));
   errorFlag = true;
}
var makeModelMandatoryAttributesList = ['Mfg_Part_No','OEM_Full_Name','CPE_Type'];
var makeModelAttributeError ="";
makeModelMandatoryAttributesList.forEach(function (attribute) {
   makeModelAttributeError = entertainmentValidationLib.validateMakeModelMandatoryAttributes(node,stepManager,attribute,itemType); 
   if(makeModelAttributeError){
	   dataIssues.addWarning(makeModelAttributeError);
	   errorFlag = true;
   }
});
var sourcingManagerError = commonValidationLib.validateSourcingManager(node,stepManager,dtvUserGroup);
if(sourcingManagerError){
   dataIssues.addWarning(sourcingManagerError, node, stepManager.getAttributeHome().getAttributeByID("Contract_Manager"));
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