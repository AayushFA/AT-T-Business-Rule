/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_BPA_SingleSmartsheet_Upd_Validation",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "BPA SingleSmartsheet Update Validation",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "StagingBPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_Audit_Library",
    "libraryAlias" : "auditLib"
  }, {
    "libraryId" : "ATT_BPA_SingleSS_Library",
    "libraryAlias" : "bpaSingleSsLib"
  }, {
    "libraryId" : "AT&T_BPA_Validation_Library",
    "libraryAlias" : "bpaValidLib"
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
    "alias" : "queryHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "AttributeGroupBindContract",
    "alias" : "ciGrp",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "AG_CotractItemAttributes",
    "description" : null
  }, {
    "contract" : "AttributeGroupBindContract",
    "alias" : "cileGrp",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "AG_LE_Attr",
    "description" : null
  }, {
    "contract" : "AttributeGroupBindContract",
    "alias" : "ciSSGrp",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "AG_BPA_SmartSheet_CI",
    "description" : null
  }, {
    "contract" : "AttributeGroupBindContract",
    "alias" : "cileSSGrp",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "AG_BPA_SmartSheet_CILE",
    "description" : null
  }, {
    "contract" : "AttributeGroupBindContract",
    "alias" : "miscDCGrp",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "AG_DC_MisC_Attr",
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "issue",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "BPAZoomDataLookUP",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "headerObj",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "BPA",
    "description" : null
  }, {
    "contract" : "AttributeGroupBindContract",
    "alias" : "headerGrp",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "AG_BPA_Header_Attributes",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "ciObjType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "Contract_Item",
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
exports.operation0 = function (node,step,queryHome,ciGrp,cileGrp,ciSSGrp,cileSSGrp,miscDCGrp,issue,BPAZoomDataLookUP,headerObj,headerGrp,ciObjType,contractItemReference,auditLib,bpaSingleSsLib,bpaValidLib) {
/*
 * Author - Abiraami, Madhuri, John
 * Single smartsheet  Update validation - 
 */
var error = "";
var minMaxCheckError = "";
var regionDCError = "";
var miscDCError = "";
var ALLTZoomDataCheckError = "";
var WESTTZoomDataCheckError = "";
var activeZoomDataCheckError = "";
var cileError = "";
var ciUpdateCheckError = "";
var duplicateZoomDataCheckError = "";
var zoomDataError = "";
var zoomInfo = "";
var futurePriceError = "";
var pitemError = "";
var cloneWfError = ""
var headerWfError = "";
var headerExpError = "";
var bpaHeaderObj = "";
var headerStatusCheckErr = "";
var dateAttr = "Imported_TS";
var inactiveZoomDataCheck = "";
var stdPackageNonZeroCheck = "";
bpaSingleSsLib.trimSpaces(node, step); // Trim spaces and new line for all text fields
var bpaContractNum = node.getValue("Oracle_Contract_Num").getSimpleValue();
var ciItemNum = node.getValue("Item_No_Refrenced_To_CI").getSimpleValue();
if (bpaSingleSsLib.isCIandCILEValueProvided(node, step)) {
    if (!bpaContractNum) headerExpError = "\n Could not process line-item changes as Oracle Blanket Purchase Agreement is required field please review and resubmit"
    if (bpaContractNum && !ciItemNum) headerExpError = "\n Could not process line-item changes as Oracle Item Number is required field please review and resubmit"
    if (!bpaContractNum && !ciItemNum) headerExpError = "\n Could not process line-item changes as Oracle Blanket Purchase Agreement and Oracle Item Number are required fields please review and resubmit"
} else {
    if (!bpaContractNum) headerExpError = "\n Could not process line-item changes as Oracle Blanket Purchase Agreement is required field please review and resubmit"
}
var ciItemNumAttr = step.getAttributeHome().getAttributeByID("Oracle_Item_Num");
var cileType = node.getValue("LE_TYPE").getSimpleValue();
var cileNum = node.getValue("Item_No_Referenced_to_CILE").getSimpleValue();
var cileName = node.getValue("LE_Name").getSimpleValue();
var cilePrice = node.getValue("LE_Price").getSimpleValue();
var cileQty = node.getValue("Quantity_2").getSimpleValue();
//Identify the Item Object
if (ciItemNum) {
    node.getValue("Oracle_Item_Num").setSimpleValue(ciItemNum);
    var pitem = step.getNodeHome().getObjectByKey("Item.Key", ciItemNum);
    if (pitem) {
        var itemLOB = pitem.getValue("Line_Of_Business").getID();
    } else {
        pitemError = "\n Item number does not exist. Please verify the Item number provided"
    }
}
if (bpaContractNum) { //Identify the BPA Header Object
    bpaHeaderObj = step.getNodeHome().getObjectByKey("BPANumber.Key", bpaContractNum);
}
if (bpaContractNum && bpaHeaderObj) {
    if (bpaHeaderObj.isInWorkflow("BPA_Clone")) {
        cloneWfError = "\n BPA Header Object already exist in BPA Clone Copy Move Workflow"
    }
    var [headerStatusCheckErr, headerClosed, ciClosed] = bpaSingleSsLib.headerCheck(bpaHeaderObj, node);
    if (!headerStatusCheckErr && !headerClosed) {
        //Update header attributes        
        var headerUpdateFlag = bpaSingleSsLib.headerUpdateCheck(node);
        var bpaInstance = bpaHeaderObj.getWorkflowInstanceByID("Create_BPA");
        var wrlnEngUser = bpaSingleSsLib.wrlnUserCheck(step);
        if (!bpaInstance && headerUpdateFlag) {
            if (!wrlnEngUser) {
                bpaSingleSsLib.populateAttributes(node, bpaHeaderObj, headerGrp, step);
                headerExpError = bpaSingleSsLib.checkExpDateGreaterThanToday(bpaHeaderObj, step);
                if (!bpaHeaderObj.isInWorkflow("Create_BPA")) {
                    bpaHeaderObj.startWorkflowByID("Create_BPA", "Initiated to workflow- Item updated through Singlesmartsheet");
                }
            } else {
                headerWfError = "\n Wireline Engineer does not have access to edit BPA header. Please contact sourcing manager";
            }
        } else if (bpaInstance && headerUpdateFlag) {
            var BPAWFPublishQueueState = bpaInstance.getTaskByID("Publish_to_EBSQueue");
            if (BPAWFPublishQueueState) {
                headerWfError = "\n Could not process line-item changes as BPA Contract Status is in Publish Q State";
            } else {
                if (!wrlnEngUser) {
                    bpaSingleSsLib.populateAttributes(node, bpaHeaderObj, headerGrp, step);
                    headerExpError = bpaSingleSsLib.checkExpDateGreaterThanToday(bpaHeaderObj, step);
                } else {
                    headerWfError = "\n Wireline Engineer does not have access to edit BPA header. Please contact sourcing manager";
                }
            }
        }
        // Update contract item		 
        if (ciItemNum) {
            var ciObj = "";
            ciObj = bpaSingleSsLib.existingObjCheck(bpaHeaderObj, ciItemNum, "Oracle_Item_Num");
            if (ciObj) {
                var ciObjClosed = "";
                var WFInstance = ciObj.getWorkflowInstanceByID("Create_BPA");
                if (WFInstance) {
                    var task = WFInstance.getTaskByID("Publish_to_EBSQueue");
                    if (task) {
                        ciUpdateCheckError += "\n Could not process line-item changes as Contract Item is in Publish Q State";
                    }
                }
                /*
				ciObjClosed = ciObj.getValue("ContractItem_Status").getSimpleValue();
				var stgCIStatus = node.getValue("ContractItem_Status").getID();
				if ((ciClosed && bpaSingleSsLib.checkSSCiCloseStatus(node, step)) || (ciObjClosed == "CLOSED" && (!stgCIStatus || stgCIStatus != "OPEN") && bpaSingleSsLib.checkSSCiCloseStatus(node, step))) {
					ciUpdateCheckError += "\n Could not process line-item changes as Contract Item Status is Closed, please change Contract Item status and resubmit or disregard change.";
				}*/
                if (ciClosed) {
                    var ciInstance = ciObj.getWorkflowInstanceByID("Create_BPA");
                    if (!ciInstance) ciObj.startWorkflowByID("Create_BPA", "Initiated to workflow- Item updated through Singlesmartsheet");
                    ciObj.getValue("ContractItem_Status").setLOVValueByID("CLOSED");
                } else if (!headerUpdateFlag && !bpaSingleSsLib.isCIandCILEValueProvided(node, step)) {
                    ciUpdateCheckError += "\n Could not process line-item changes as there are no attributes indicated for change please review and resubmit";
                } else {
                    ciUpdateCheckError += bpaSingleSsLib.ciUpdate(node, ciObj, ciGrp, dateAttr, itemLOB, pitem, step);
                    futurePriceError = bpaValidLib.validateFuturePriceAndDate(ciObj);
                    if (itemLOB == "WRLN" || itemLOB == "ENT") {
                        minMaxCheckError = bpaValidLib.validateMinMaxOrderQty(ciObj);
                        if (node.getValue("STD_PACKAGING").getSimpleValue()) {
                            var stdPackageNonZeroCheck = bpaValidLib.validateStdPackaging(node);
                        }
                    }
                    if (node.getValue("CI_Region_Distribution_Center").getValues().size() > 0) {
                        [zoomDataError, zoomInfo] = bpaSingleSsLib.zoomDataCheck(ciObj, node, pitem, BPAZoomDataLookUP, step, bpaHeaderObj);
                    }
                    if (!bpaSingleSsLib.updateExistingDC(node, ciObj, "Region", step)) {
                        regionDCError = bpaSingleSsLib.createRegionDC(node, ciObj, pitem, step);
                    }
                    if (!bpaSingleSsLib.updateExistingDC(node, ciObj, "DC_MiscCharges", step)) {
                        miscDCError = bpaSingleSsLib.createMiscDC(node, ciObj, miscDCGrp, step);
                        miscDCError = miscDCError + bpaValidLib.validateMiscChargeDC(ciObj);
                    }
                    var legacySource = bpaHeaderObj.getValue("Legacy_Source").getLOVValue();
                    if (legacySource) {
                        legacySource = legacySource.getID();
                        if (legacySource != "RTL") {
                            ALLTZoomDataCheckError = bpaValidLib.validateALLTZoomData(ciObj);
                            WESTTZoomDataCheckError = bpaValidLib.validateWESTTZoomData(ciObj);
                            inactiveZoomDataCheck = bpaValidLib.validateInActiveZoomData(ciObj);
                            activeZoomDataCheckError = bpaValidLib.validateActiveZoomData(ciObj);
                        }
                    }
                    var lib = "";
                    if (ciObj.getValue("ContractItem_Status").getSimpleValue() == "Open") {
                        duplicateZoomDataCheckError = bpaValidLib.validateDuplicateZoomData(ciObj, contractItemReference, lib, step);
                    }
                    //CILE check - Check for NTW BOM type and create CILE object
                    if (ciObj && (cileType || cileNum || cileName || cilePrice || cileQty) && pitem) {
                        cileError = bpaValidLib.validateCILENtwBOMType(pitem);
                        if (!cileError) cileError = bpaSingleSsLib.cileUpdate(node, ciObj, cileGrp, cileSSGrp, dateAttr, step)
                    }
                }
            } else {
                pitemError = "\n Item number does not exist under entered BPA. Please verify the Item number provided"
            }
        }
    } else if (headerStatusCheckErr) return headerStatusCheckErr;
} else if (bpaContractNum && !bpaHeaderObj) {
    headerStatusCheckErr = "\n BPA Header Object does not exist with the provided Blanket Purchase Agreement Please review and resubmit"
} else {
    //do nothing
}
error = headerStatusCheckErr + headerWfError + headerExpError + pitemError + ciUpdateCheckError + futurePriceError + minMaxCheckError + stdPackageNonZeroCheck + zoomDataError + regionDCError + miscDCError + activeZoomDataCheckError + duplicateZoomDataCheckError + ALLTZoomDataCheckError + WESTTZoomDataCheckError + inactiveZoomDataCheck + cileError;
if (cloneWfError) {
    return cloneWfError;
} else if (error) {
    return error;
} else {
    auditLib.setDateTime(node, dateAttr);
    var procBpa = step.getProductHome().getProductByID("Processed_BPAs");
    node.setParent(procBpa); // Move the staging BPA object to Processed BPA folder
    return true;
}
}