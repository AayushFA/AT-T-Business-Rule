/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Item_Network_Validate_Button",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Validation_Actions" ],
  "name" : "Item Network Validate Button",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Network_Validation",
    "libraryAlias" : "networkValidationLib"
  }, {
    "libraryId" : "BL_Item_UNSPSC_Derivation",
    "libraryAlias" : "unspscLib"
  }, {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonDerivationLib"
  }, {
    "libraryId" : "BL_Item_Network_Derivation",
    "libraryAlias" : "networkDerivationLib"
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
    "alias" : "networkLookUp",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessFunctionBindContract",
    "alias" : "trimSpecialChars",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>BF_Item_Network_Trim_Special_Chars</BusinessFunction>\n</BusinessFunctionReference>\n",
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "dataIssues",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "QueryHomeBindContract",
    "alias" : "queryHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "statusControlledLookupTable",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,networkLookUp,trimSpecialChars,dataIssues,queryHome,statusControlledLookupTable,networkValidationLib,unspscLib,commonDerivationLib,networkDerivationLib,commonValidationLib) {
/**
 * @author -Madhuri [CTS]
 * Network Validate Button Business Rules
 */

var errorFlag = false;
commonDerivationLib.trimWhiteSpacesAndNewLines(node, stepManager); // STIBO-2634 Prod Support Team
if (!commonValidationLib.isItemNumberExist(node)) { // creation
    var networkDerivedReferenceError = networkValidationLib.validateNetworkDerivedReference(node, stepManager); // Check Network_Derived_Reference  
    if (networkDerivedReferenceError) {
        dataIssues.addWarning(networkDerivedReferenceError);
        errorFlag = true;
    }
    var alternateAssetRefError = commonValidationLib.validateAlternateAssetReferences(node, stepManager); // Check AlternateAssetReferences
    if (alternateAssetRefError) {
        dataIssues.addWarning(alternateAssetRefError);
        errorFlag = true;
    }
}
var duplicateManufacturingPartNoError = networkValidationLib.validateDuplicateManufacturingPartNumber(node, stepManager, queryHome) // Checking duplicate MFG Part number excluding Cancelled item where MpnDetails and Reason are blank
if (duplicateManufacturingPartNoError) {
    dataIssues.addWarning(duplicateManufacturingPartNoError, node, stepManager.getAttributeHome().getAttributeByID("Mfg_Part_No"));
    errorFlag = true;
}
commonDerivationLib.removeSpecialCharsAndToUpperCase(node, stepManager, trimSpecialChars, "User_Defined_Item_Description");
commonDerivationLib.removeSpecialCharsAndToUpperCase(node, stepManager, trimSpecialChars, "Mfg_Part_No");
commonDerivationLib.removeSpecialCharsAndToUpperCase(node, stepManager, trimSpecialChars, "Long_Description");
commonDerivationLib.roundListPrice(node);
commonDerivationLib.setItemDescription(node,stepManager,"NTW");
unspscLib.createUNSPSCReference(node, stepManager, queryHome); 
if (!commonValidationLib.isItemNumberExist(node)) {
    networkDerivationLib.setNetworkDerivedAttributes(node, stepManager, networkLookUp);
} else {
    networkDerivationLib.setDerivedExternalDownloadFlag(node, stepManager)
    var ntwBOMTypeError = commonValidationLib.validateNTWBOMType(node, stepManager, "NTW_BOM_Type"); // STIBO-3172 Prod Support Team (22 Feb Release)
    if (ntwBOMTypeError) {
        dataIssues.addWarning(ntwBOMTypeError, node, stepManager.getAttributeHome().getAttributeByID("NTW_BOM_Type"));
        errorFlag = true;
    }
}
commonDerivationLib.setStatusControlledAttributesValues(node,statusControlledLookupTable);
commonDerivationLib.setOrderableOnWebFlag(node);
networkDerivationLib.setExpenditureTypeEBS(node);
networkDerivationLib.setAssignToFieldOrgsForSWIM(node);
var uomError = commonValidationLib.validateMandatoryAttribute(node, stepManager, "Primary_UOM_NTW"); // STIBO-1975 Support Team (July 20 Release)
if (uomError) {
    dataIssues.addWarning(uomError, node, stepManager.getAttributeHome().getAttributeByID("Primary_UOM_NTW"));
    errorFlag = true;
}
var mandatoryAttributesError = commonValidationLib.validateMandatoryAttibutesFromGroup(node, "AG_Web_Item_NTW_Mandatory Check", stepManager)
     if (mandatoryAttributesError) {     	
	     dataIssues.addWarning(mandatoryAttributesError);
	     errorFlag = true;
}

if (errorFlag) {
    return dataIssues;
} else {
    return true;
}

}