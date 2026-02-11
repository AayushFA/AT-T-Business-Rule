/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Clone_Start_Condition",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BA_BPAClone" ],
  "name" : "Clone Copy Move Start Condition",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "lib"
  }, {
    "libraryId" : "AT&T_BPA_Validation_Library",
    "libraryAlias" : "valLib"
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
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "issue",
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
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "zoomDataLookUp",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,issue,query,contractItemReference,zoomDataLookUp,lib,valLib) {
/**
 * @Author:AAYUSH MAHATO(COGNIZANT)
 */
var effectiveDate = node.getValue("Effect_Date").getSimpleValue();
var userAction = node.getValue("BPA_Clone_WF_UserAction").getID();
var expirationDate = node.getValue("Expiration_Date").getSimpleValue();
var bpaStatus = node.getValue("BPA_Status").getSimpleValue();
var bpaNumber = node.getValue("Oracle_Contract_Num").getSimpleValue();
var nodeInWF = node.isInWorkflow("Create_BPA");
var childCount = node.getChildren().toArray().length;
var itemlist = "";
var error = "";
var allErrors = "";
var bpaErrors = "";
var cloneSupplierCheck = "";
var effDateCheck = "";
var contractItemErrors = "";
if (!userAction) {
  if (expirationDate) {
    var expiry = lib.checkDateIfLessthanToday(expirationDate);
    if (expiry) {
      error = error + "\n BPA is expired hence can't be initiated into BPA Clone Copy Move workflow \n";
    }
  }
  if (!bpaStatus || bpaStatus != "Open") {
    error = error + "\n BPA Item Status is not Open, BPA Header can't be initiated into BPA Clone Copy Move workflow \n";
  }
  if (bpaNumber == null || bpaNumber == "") {
    error = error + "\n Blanket Purchase Agreement Number is null. The souce must have Blanket Purchase Agreement Number. \n";
  }
  if (nodeInWF == true) {
    error = error + "\n Header is in BPA Workflow. Please finish the BPA workflow to initiate Clone/Copy/Move BPA Workflow. \n";
  }
  /*
  if (areChildrenInBPAWorkflow(node)) {
    error = error + "\n The following Children Contract Items: " + getContractItemIDs(node) + " are in BPA Workflow. Please finish BPA workflow for Contract Items.  \n";
  }*/
  bpaErrors = validateHeader(node, manager, query);
/*  var children = node.getChildren().toArray();
  children.forEach(function(contractItem) {
    if (contractItem.getValue("ContractItem_Status").getID() == "OPEN") {
      var contraItemId = contractItem.getID();
      var ciValidation = validateContractItem(contractItem, manager)
      if (ciValidation) {
        contractItemErrors = contractItemErrors + contraItemId + " Validations: \n" + ciValidation + " \n";
      }
    }
  });*/
}
allErrors = error + bpaErrors;
//+ contractItemErrors;
if (allErrors.trim()) {
  //issue.addError("This action cannot be completed for the following reasons: \n " + allErrors);
  // log.info("-->" + allErrors);
  return "This action cannot be completed for the following reasons: \n " + allErrors;
} else {
  return true;
}

function validateHeader(node, step, query) {
	log.info("inn");
  var bpaErrors = "";
  var headerErrors = "";
  var bpaStatusCheck = valLib.validateMandatoryAttribute(node, "BPA_Status", step);
  var zipCheck = valLib.validateMandatoryAttribute(node, "FOB_ZIP", step);
  var legacySourceCheck = valLib.validateBPALegacyContractNumber(node, step);
  var payTermCheck = valLib.validateMandatoryAttribute(node, "Payment_Terms", step);
  var freightTermCheck = valLib.validateMandatoryAttribute(node, "Freight_Terms", step);
  var headerDesc = valLib.validateMandatoryAttribute(node, "BPA_Description", step);
  var childrenCheck = valLib.checkBPAHeaderChildren(node);
  var expirationDateCheck = valLib.validateBPAExpirationDate(node);
  var contractMangerCheck = valLib.validateMandatoryAttribute(node, "BPA_Contract_Manager", step);
  // var checkDuplicateLegacyContractNum = valLib.validateDuplicateLegacyContractNumber(node, step, query);
  bpaErrors = bpaStatusCheck + zipCheck + legacySourceCheck + payTermCheck + freightTermCheck + contractMangerCheck + headerDesc + expirationDateCheck + childrenCheck;
  if (bpaErrors) {
    var bpaId = node.getID();
    headerErrors = "\n" + bpaId + " - Header Validations: \n" + bpaErrors + " \n";
  }
  return headerErrors;
}

/*
function validateContractItem(contractItem, step) {
  var ciChecks = "";
  var nonRTLErrors = "";
  var invalidZoomDataCheck = "";
  var itemNum = contractItem.getValue("Oracle_Item_Num").getValue();
  var refItem = step.getNodeHome().getObjectByKey("Item.Key", itemNum);
  var leadTimeCheck = valLib.validateMandatoryAttribute(contractItem, "Lead_Time", step);
  var priceCheck = valLib.validateMandatoryAttribute(contractItem, "Price", step);
  var itemTypeCheck = valLib.validateMandatoryAttribute(contractItem, "Item_Type", step);
  //var uomCheck = validateMandatoryAttribute(contractItem, "BPA_UOM", step);
  var onboardingUomCheck = valLib.validateMandatoryAttribute(contractItem, "BPA_Onboarding_UOM", step);
  if (onboardingUomCheck) {
    onboardingUomCheck = "Onboarding UOM is blank due to invalid value, please check with Data Governance Team.";
  }
  var legacySource = node.getValue("Legacy_Source").getID();
  // var supplierItemCheck = lib.validateMandatoryAttribute(contractItem, "Supplier_Item", step); // Rule relaxed by Brenda for clone    
  var itemStatusCheck = valLib.validateCIOracleItemNumStatus(contractItem, step);
  if (legacySource && (legacySource != "RTL")) {
    var nonProcessFlagCheck = valLib.validateMandatoryAttribute(contractItem, "Non_Process_Flag", step);
    var stdPackagingCheck = valLib.validateMandatoryAttribute(contractItem, "STD_PACKAGING", step);
    var minMaxOrderQtyCheck = valLib.validateMinMaxOrderQty(contractItem);
    var zoomDCCheck = valLib.validateActiveZoomData(contractItem);
    var duplicateZoomDataCheck = valLib.validateDuplicateZoomData(contractItem, contractItemReference, lib, step);
   // if (refItem)
     // invalidZoomDataCheck = valLib.validateInvalidZoomData(contractItem, step, refItem,zoomDataLookUp)
    nonRTLErrors = nonProcessFlagCheck + stdPackagingCheck + minMaxOrderQtyCheck + zoomDCCheck + duplicateZoomDataCheck + invalidZoomDataCheck;
  }
  //var checkLEPercentage = valLib.validateContractItemLEPercentage(contractItem, lib, step);
   var checkLEPrice = valLib.validateContractItemLEPrice(contractItem, lib, step);
  var consignmentDataCheck = valLib.validateConsignOrgCodeData(contractItem, "Consign_Org_Code", step);
  var miscDCCheck = valLib.validateMiscChargeDC(contractItem);
  ciChecks = leadTimeCheck + priceCheck + itemTypeCheck + onboardingUomCheck + uomCheck + nonRTLErrors + checkLEPrice + consignmentDataCheck + miscDCCheck;
  return ciChecks;
}
*/


}