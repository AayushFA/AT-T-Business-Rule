/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_BPA_Clone_PostEnrich_Validation",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_Clone_BC" ],
  "name" : "BPA Clone Post Enrichment Validation",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "bpaLib"
  }, {
    "libraryId" : "AT&T_BPA_Clone_Library",
    "libraryAlias" : "cloneLib"
  }, {
    "libraryId" : "AT&T_BPA_Validation_Library",
    "libraryAlias" : "lib"
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
    "alias" : "step",
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
    "contract" : "ReferenceTypeBindContract",
    "alias" : "contractItemReference",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ContractItem_Item",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,query,contractItemReference,bpaLib,cloneLib,lib) {
/**
 * @author Aayush Mahato & Aditya Rudragoudar
 * BPA Clone validations
 */

var effectiveDate = node.getValue("Effect_Date").getSimpleValue();
var legacySource = node.getValue("Legacy_Source").getID();
var allErrors = "";
var bpaErrors = "";
var contractItemErrors = "";

var headerDesc = lib.validateMandatoryAttribute(node, "BPA_Description", step);
var bpaStatusCheck = lib.validateMandatoryAttribute(node, "BPA_Status", step);
var zipCheck = lib.validateMandatoryAttribute(node, "FOB_ZIP", step);
var payTermCheck = lib.validateMandatoryAttribute(node, "Payment_Terms", step);
var freightTermCheck = lib.validateMandatoryAttribute(node, "Freight_Terms", step);
var effDateCheck = lib.validateBPAHeaderEffectiveDate(effectiveDate);
var childrenCheck = lib.checkBPAHeaderChildren(node);
var expirationDateCheck = lib.validateBPAExpirationDate(node);
var contractMangerCheck = lib.validateBPAContractManager(node, step);
var legacySourceCheck = lib.validateBPALegacyContractNumber(node, step);
var cloneSupplierCheck = lib.cloneBPASupplierCheck(node, step);
var checkDuplicateLegacyContractNum = lib.validateDuplicateLegacyContractNumber(node, step, query);

bpaErrors = headerDesc+bpaStatusCheck + zipCheck + legacySourceCheck +  payTermCheck + freightTermCheck +
    contractMangerCheck + effDateCheck + expirationDateCheck + childrenCheck + cloneSupplierCheck + checkDuplicateLegacyContractNum;

var children = node.getChildren().toArray();

if(cloneLib.isPartialClone(children)) {
    children.forEach(function(contractItem) {
        if (contractItem.getValue("Partial_Clone_Flag").getSimpleValue() == "Yes") {
            //validateContractItem(contractItem);
			contractItemErrors += lib.validateContractItem(contractItem, step,contractItemReference,bpaLib)
        }
    });	
} else {
    children.forEach(function(contractItem) {
        //validateContractItem(contractItem);
		contractItemErrors += lib.validateContractItem(contractItem, step,contractItemReference,bpaLib)
    });
}

if (bpaErrors) {
    var bpaId = node.getID();
    allErrors = bpaId + " Header Validations \n" + bpaErrors + " \n";
}

if (contractItemErrors) {
    allErrors = allErrors + contractItemErrors
}

if (allErrors) {
     //log.info(allErrors);	
    return allErrors;
} else {
	return true;
}

/*
function validateContractItem(contractItem) {
    var nonRTLErrors = ""; 
    var contraItemId = contractItem.getID();
    var leadTimeCheck = lib.validateMandatoryAttribute(contractItem, "Lead_Time", step);
    var priceCheck = lib.validateMandatoryAttribute(contractItem, "Price", step);
    var itemTypeCheck = lib.validateMandatoryAttribute(contractItem, "Item_Type", step);
    var onboardingUomCheck = lib.validateMandatoryAttribute(contractItem, "BPA_Onboarding_UOM", step);   
    if(onboardingUomCheck){
    	  onboardingUomCheck = "Onboarding UOM is blank due to Invalid value, please check with Data Governance Team.";
    }
// var supplierItemCheck = lib.validateMandatoryAttribute(contractItem, "Supplier_Item", step); // Rule relaxed by Brenda for clone
    var itemStatusCheck = lib.validateCIOracleItemNumStatus(node, step);

    if (legacySource && (legacySource != "RTL")) {
        var nonProcessFlagCheck = lib.validateMandatoryAttribute(contractItem, "Non_Process_Flag", step);
        var stdPackagingCheck = lib.validateMandatoryAttribute(contractItem, "STD_PACKAGING", step);
        var minMaxOrderQtyCheck = lib.validateMinMaxOrderQty(contractItem);
        nonRTLErrors =  nonProcessFlagCheck + stdPackagingCheck + minMaxOrderQtyCheck;
    }

    //var checkLEPercentage = lib.validateContractItemLEPercentage(contractItem, bpaLib, step);
    var checkLEPrice = validationLib.validateContractItemLEPrice(contractItem, bpalib, step);
    var zoomDCCheck = validationLib.validateActiveZoomData(contractItem);
    var duplicateZoomDataCheck = validationLib.validateDuplicateZoomData(contractItem, contractItemReference, bpaLib, step);
    var consignmentDataCheck = validationLib.validateConsignOrgCodeData(contractItem, "Consign_Org_Code", step);
    ciChecks = itemStatusCheck + leadTimeCheck + priceCheck + itemTypeCheck + onboardingUomCheck + nonRTLErrors + checkLEPrice+zoomDCCheck+duplicateZoomDataCheck+consignmentDataCheck;

    if (ciChecks) {
        contractItemErrors = contractItemErrors + contraItemId + " Validations \n" + ciChecks + " \n";
    }
}
*/
}