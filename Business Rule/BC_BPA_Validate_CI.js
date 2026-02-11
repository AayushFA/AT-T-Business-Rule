/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_BPA_Validate_CI",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "CI Validations",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item", "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "ATT_BPA_SingleSS_Library",
    "libraryAlias" : "bpaSingleSsLib"
  }, {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "lib"
  }, {
    "libraryId" : "ATT_BPA_Zoom_Library",
    "libraryAlias" : "bpaZoomLib"
  }, {
    "libraryId" : "ATT_BPA_ASL_Library",
    "libraryAlias" : "aslLib"
  }, {
    "libraryId" : "AT&T_BPA_Validation_Library",
    "libraryAlias" : "validationLib"
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
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "UgWrlnEng",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_WRLN_Engineering",
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ugWrlnSrc",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_WRLN_Sourcing",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,contractItemReference,zoomDataLookUp,UgWrlnEng,webui,ugWrlnSrc,bpaSingleSsLib,lib,bpaZoomLib,aslLib,validationLib) {
/***
 * @author Piyal, Madhuri, Tanushree, Aayush
 * @author Refactored & Reviewed By Aditya
 * @param  ContractItem - This action is valid for only Contract Item object type
 * @returns Validation Errors on webui
 */
var curUser = step.getCurrentUser();
var wrlnEngUser = UgWrlnEng.isMember(curUser) && !ugWrlnSrc.isMember(curUser); //STIBO-2529;
var parent = null;
if (node.getObjectType().getID() == "Contract_Item") {
    if (node.isInWorkflow("Create_BPA")) {
        parent = node.getParent();
    } else {
        var tempPar = node.getValue("Temp_Parent_Item").getSimpleValue();
        if (tempPar != null) {
            parent = step.getProductHome().getProductByID(tempPar);
        } else {
            var BPAno = node.getValue("Oracle_Contract_Num").getSimpleValue();
            if (BPAno == null) {
                webui.showAlert("ERROR", "BPA Number is Blank", "Please Provide the BPA Number to proceed");
            } else if (BPAno != null) {
                var BPAnoPen = node.getValue("Oracle_Contract_Num").getSimpleValue().trim();
                var magBPAno = step.getAttributeHome().getAttributeByID("Oracle_Contract_Num");
                var bpaObject = step.getNodeHome().getObjectByKey("BPANumber.Key", BPAno);
                if (bpaObject == null) {
                    webui.showAlert("ERROR", "BPA Number is Invalid", "Entered BPA number does not exist in the system,Please Provide valid BPA Number to proceed");
                } else {
                    parent = bpaObject;
                }
            }
        }
    }
    if (parent) {
        var effectiveDate = parent.getValue("Effect_Date").getSimpleValue();
        var legacySource = parent.getValue("Legacy_Source").getID();
        var bpaStatus = parent.getValue("BPA_Status").getID();
        var contractItemReferences = node.getReferences(contractItemReference);
        if (contractItemReferences.size() > 0) {
            var refItem = contractItemReferences.get(0).getTarget();
        }
        var regionDataCheck = "";
        var ALLTZoomDataCheckError = "";
        var WESTTZoomDataCheckError = "";
        var CFASZoomDataCheckError = "";
        var inactiveZoomDataCheck = "";
        var duplicateZoomDataCheck = "";
        var invalidZoomDataCheck = "";
        var checkLEPrice = "";
        var checkLEFuturePrice = "";
        var checkLEErrors = "";
        var nonRTLErrors = "";
        var ciChecks = "";
        var closedCICheck = "";
        var contractItemErrors = "";
        var nonProcessFlagCheck = "";
		var stdPackagingCheck = "";
		var minMaxOrderQtyCheck = "";
		var stdPackageNonZeroCheck = "";
        var contraItemId = node.getID();
        var ciObjectType = node.getObjectType().getID();
        var processFlag = node.getValue("BPA_Processed_In_EBS").getID();
        var CIStatus = node.getValue("ContractItem_Status").getSimpleValue();
        if (CIStatus != "Closed") { //Phase 2 July 20 Release, STIBO-2512
            var globalError = lib.globalError(node, step, parent);
            var leadTimeCheck = validationLib.validateMandatoryAttribute(node, "Lead_Time", step);
            var priceCheck = validationLib.validateMandatoryAttribute(node, "Price", step);
            var itemTypeCheck = validationLib.validateMandatoryAttribute(node, "Item_Type", step);
            var uomCheck = validationLib.validateSupplierUOM(node);
            var supplierItemCheck = validationLib.validateMandatoryAttribute(node, "Supplier_Item", step);
            var itemNumUniquenessCheck = validationLib.validateCIUniqueness(node, step, parent);
            if (legacySource && (legacySource != "RTL")) {
                 nonProcessFlagCheck = validationLib.validateMandatoryAttribute(node, "Non_Process_Flag", step);
                 stdPackagingCheck = validationLib.validateMandatoryAttribute(node, "STD_PACKAGING", step);
                 minMaxOrderQtyCheck = validationLib.validateMinMaxOrderQty(node);
                var zoomDCCheck = validationLib.validateActiveZoomData(node);
                //STIBO-2735, Validate if Sum of Active CILE Price = CI Price                        
                if (processFlag != "Y") checkLEPrice = validationLib.validateContractItemLEPrice(node, step, "Price");
                if (processFlag == "Y") checkLEPrice = validationLib.validateContractItemLEPrice(node, step, "Current_Price");
                if (!checkLEPrice) {
                    var children = node.getChildren().toArray();
                    children.forEach(function(child) {
                        checkLEErrors += lib.CILEValidations(child, legacySource, step);
                    });
                    if (!checkLEErrors && processFlag == "Y") checkLEFuturePrice = validationLib.validateContractItemLEPrice(node, step, "Price_2");
                }
                if (node.getValue("STD_PACKAGING").getSimpleValue()) {
                        var stdPackageNonZeroCheck = validationLib.validateStdPackaging(node);
                    }
                    nonRTLErrors = nonProcessFlagCheck + stdPackagingCheck + minMaxOrderQtyCheck + zoomDCCheck + checkLEPrice + checkLEFuturePrice + checkLEErrors + stdPackageNonZeroCheck;
                }
                var refItemTypeCheck = validationLib.validateReferencedItemType(node, contractItemReference, parent, wrlnEngUser);
                var miscDCCheck = validationLib.validateMiscChargeDC(node);
                //var checkLEPercentage = validationLib.validateContractItemLEPercentage(node, lib, step);
                // var checkLEPrice = validationLib.validateContractItemLEPrice(node, lib, step);   
                var checkFuturePriceAndDate = validationLib.validateFuturePriceAndDate(node);
                var consignmentDataCheck = validationLib.validateConsignOrgCodeData(node, "Consign_Org_Code", step); // STIBO-2011  
                if (contractItemReferences.size() > 0) {
                    regionDataCheck = aslLib.validateRegionData(node, refItem, step);
                }
                if (!consignmentDataCheck && !regionDataCheck) {
                    ALLTZoomDataCheckError = validationLib.validateALLTZoomData(node);
                    WESTTZoomDataCheckError = validationLib.validateWESTTZoomData(node);
                    CFASZoomDataCheckError = validationLib.validateBlankCFASZoomData(node);
                    inactiveZoomDataCheck = validationLib.validateInActiveZoomData(node); // STIBO-2464                        
                    duplicateZoomDataCheck = validationLib.validateDuplicateZoomData(node, contractItemReference, lib, step); // STIBO-2377                                       
                    if (contractItemReferences.size() > 0) {
                        invalidZoomDataCheck = validationLib.validateInvalidZoomData(node, step, refItem, zoomDataLookUp); //STIBO-2754   	              
                    }
                }
                ciChecks = globalError + leadTimeCheck + priceCheck + supplierItemCheck + itemTypeCheck + uomCheck + itemNumUniquenessCheck + nonRTLErrors + refItemTypeCheck + miscDCCheck + checkFuturePriceAndDate + consignmentDataCheck + regionDataCheck + ALLTZoomDataCheckError + WESTTZoomDataCheckError + CFASZoomDataCheckError + inactiveZoomDataCheck + invalidZoomDataCheck + duplicateZoomDataCheck;
            }
            if (processFlag == "Y" && CIStatus == "Closed") { //Phase 2 July 20 Release, STIBO-2512
                ciChecks += validationLib.validateClosedCIData(node, step);
            }
            if (ciChecks) {
                contractItemErrors = contraItemId + " Validations \n" + ciChecks + " \n";
            }
            if (contractItemErrors) {
                log.info(contractItemErrors)
                webui.showAlert("ERROR", contractItemErrors);
                return contractItemErrors;
            } else {
                return true;
            }
        } else {
            return true;
        }
    } else {
        return true;
    }
}