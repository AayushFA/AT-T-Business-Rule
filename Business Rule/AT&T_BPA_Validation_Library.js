/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "AT&T_BPA_Validation_Library",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "AT&T_Global_Libraries" ],
  "name" : "AT&T BPA Validation Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "lib"
  }, {
    "libraryId" : "ATT_BPA_Zoom_Library",
    "libraryAlias" : "bpaZoomLib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessLibrary",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
/***
 * @author Piyal, Madhuri, Tanushree, Aayush
 * @author Refactored & Reviewed By Aditya
 */
/*************************** Common Functions ***************************/
/** Validates Mandatory Attributes **/
function validateMandatoryAttribute(node, attr_id, step) {
    var error = "";
    var attributeValue = node.getValue(attr_id).getSimpleValue();
    var attr = step.getAttributeHome().getAttributeByID(attr_id);
    if (!attributeValue) {
        error =  attr.getName() + " is mandatory.\n";
    }
    return error;
}

/** Validates if given date is less than current date or not **/
function checkDateIfLessthanToday(date) {
    var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd"); // For ISO Date Format
    var dateNow = new Date();
    var formattedDateTime = dateTimeFormatter.format(dateNow);
    if (date < formattedDateTime) {
        return true;
    } else if (date == formattedDateTime || date > formattedDateTime) {
        return false;
    }
}

function getFourteenDate() {
    var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd");
    var dateTimeNow = new Date();
    dateTimeNow.setDate(dateTimeNow.getDate() + 14);
    var formattedDateTime = dateTimeFormatter.format(dateTimeNow);
    return formattedDateTime;
}

/************************ BPA Header Validations ************************/
/** Validates if BPA has children or not **/
function checkBPAHeaderChildren(node) {
    var error = "";
    if (node.getChildren().size() == 0) {
        error = "BPA does not have any child Contract Item. Please Create it from The Header BPA.\n";
    }
    return error;
}

/** Validates BPA Header effrective date **/
function validateBPAHeaderEffectiveDate(effectiveDate) {
    var error = "";
    if (!effectiveDate) {
        error = "Effective Date is Mandatory.\n";
    }
    if (checkDateIfLessthanToday(effectiveDate)) {
        error = "Effective Date should be greater than or Equal to Today.\n";
    }
    return error;
}


/** Validates BPA Contract Manager **/
function validateBPAContractManager(node, step) {
    var error = "";
    var legacySource = node.getValue("Legacy_Source").getID();
    if (legacySource != "RTL") {
        error = validateMandatoryAttribute(node, "BPA_Contract_Manager", step);
    }
    return error;
}

/** Validates BPA Expiration Date **/
function validateBPAExpirationDate(node) {
    var error = "";
    var legacySource = node.getValue("Legacy_Source").getID();
    var tempBusinessSourceId = node.getValue("Temp_Legacy_Source").getID();
    var effectiveDate = node.getValue("Effect_Date").getSimpleValue();
    var expirationDate = node.getValue("Expiration_Date").getSimpleValue();
    if (expirationDate && effectiveDate && (expirationDate < effectiveDate)) {
        return "Expiration Date should be in future than Effective Date.\n";
    }
    if (legacySource != "WRLN_NON" && tempBusinessSourceId != "WRLN_NON" && !expirationDate) {
        return "Expiration Date is required.\n"
    }
    return error;
}

/** Validates BPA Legacy Contract Number **/
function validateBPALegacyContractNumber(node, step) {
    var error = "";
    var legacySource = node.getValue("Legacy_Source").getID();
    if (legacySource != "RTL" && legacySource != "WRLN_NON") {
        return validateMandatoryAttribute(node, "BPA_Legacy_Contract_No", step);
    }
    return error;
}

/** Validates if Clone BPA has same supplier as Source BPA **/
function cloneBPASupplierCheck(node, step) {
    var error = "";
    var bpaSupplierRef = step.getLinkTypeHome().getClassificationProductLinkTypeByID("BPA_To_Supplier");
    var srcRefTargetSupSiteCode = node.queryClassificationProductLinks(bpaSupplierRef).asList(1);
    if (srcRefTargetSupSiteCode.size() == 0) {
        error = error + "Supplier reference is mandatory.\n";
    } else {
        var clonedfromNode = node.getValue("BPA_Cloned_From").getSimpleValue();
        var ClonedObject = step.getProductHome().getProductByID(clonedfromNode);
        var bpaToSup = step.getLinkTypeHome().getClassificationProductLinkTypeByID("BPA_To_Supplier");
    var refType = node.getClassificationProductLinks().get(bpaToSup).toArray();
    if (refType[0] != null) {
        var bpaToSupTarget = refType[0].getClassification();;
        var purchSiteFlag = bpaToSupTarget.getValue("Supplier_Purchasing_Site_Flag").getSimpleValue();
        if (purchSiteFlag == "N") {
             error = error + "Supplier reference with Purchase Site Flag as No cannot proceed.\n"
		}
    }
         if (ClonedObject) {
            var refType = step.getLinkTypeHome().getClassificationProductLinkTypeByID("BPA_To_Supplier");
            var cloneSupRef = ClonedObject.getClassificationProductLinks().get(refType).toArray();
            if (cloneSupRef.length > 0) {
                var cloneSupRefID = cloneSupRef[0].getClassification().getID();
            }
            var nodeSupRef = node.getClassificationProductLinks().get(refType).toArray();
            if (nodeSupRef.length > 0) {
                var nodeSupRefID = nodeSupRef[0].getClassification().getID();
            }

            if (cloneSupRefID == nodeSupRefID) {
                error = error + "Supplier cannot be same as source BPA supplier.\n";
            }
        } else {
            error = error + "BPA Source clone reference not found.\n"
        }
    }
    return error;
}

/** Validates duplicate legacy contract number **/
function validateDuplicateLegacyContractNumber(node, manager, query) {
    var error = "";
    var result = "";
    var legacyNumAttribute = manager.getAttributeHome().getAttributeByID("BPA_Legacy_Contract_No");
    var curNode = node.getValue("BPA_Legacy_Contract_No").getSimpleValue();
    if (curNode) {
        var c = com.stibo.query.condition.Conditions;
        var querySpecification = query.queryFor(com.stibo.core.domain.Product).where(
            c.valueOf(legacyNumAttribute).eq(curNode)
        );
        var queryResult = querySpecification.execute().asList(1000);
        if (queryResult.size() > 1) {
            queryResult.forEach(function(contract) {
                if (node.getID() != contract.getID()) {
                    result = result + contract.getID() + " "
                }
            });
            error = "Duplicate legacy contractor number found on other BPA Header " + result + ". Provide unique value.\n";
        }
    }
    return error;
}

/************************ BPA Contract Item Validations ************************/
/** Validates if Contract Item is unique or not on BPA **/
function validateCIUniqueness(node, manager, parent) {
    var error = "";
    var itemRef = manager.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
    var refNode = node.getReferences(itemRef).toArray();
    if (refNode.length > 0) {
        var refTarget = refNode[0].getTarget();
        var itemNumRef = refTarget.getValue("Item_Num").getSimpleValue();
        //var oracleItemNo = node.getValue("Oracle_Item_Num").getSimpleValue();
        if (itemNumRef) {
            var children = parent.getChildren();
            for (var i = 0; i < children.size(); i++) {
                var child = children.get(i);
                if (node.getID() != child.getID()) {
                    var itemNo = child.getValue("Oracle_Item_Num").getSimpleValue();
                    if (itemNumRef.equals(itemNo)) {
                        error = error + "Same MST item is already linked with another Contract item under same Header. Please link different MST Item.\n";
                    }
                }
            }
        }
    }
    return error;

}

/************************ BPA Contract Item Consignment Code Validations ************************/
// STIBO-2011 Prod Support July release
function validateConsignOrgCodeData(node, attr_id, step) {
	var error = "";
	var childConsignOrgCodes = new java.util.ArrayList();
	var ci_consign_org_codes = node.getValue(attr_id).getValues();
	var refTypeObj = step.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
	var refNode = node.queryReferences(refTypeObj).asList(1);
	var duplicatesOrg = new java.util.ArrayList();
	var uniqueOrgSet = new java.util.HashSet();
		if(refNode.size()>0) {
			var item = refNode.get(0).getTarget();
			if((item.getObjectType().getID()=='Item') && (item)) {
				var children = item.getChildren();
				if(children) {
					children.forEach(function(child) {
						var objChildID = child.getObjectType().getID();
						var objChildConsign = child.getValue("Consignment").getSimpleValue();
						var objChildItemStatus = child.getValue("Item_Status").getSimpleValue();
						var objChildItemStatus_WRLN = child.getValue("Item_Status_WRLN").getID();
						var objChildItemStatus_RTL = child.getValue("Item_Status_RTL").getID();
						var objChildItemStatus_ENT = child.getValue("Item_Status_ENT").getID();
						var objChildItem_LOB = child.getValue('Line_Of_Business').getID();
						if((objChildItem_LOB == 'WRLN') && (objChildID=='Child_Org_Item') && (objChildConsign=='Yes') && (objChildItemStatus_WRLN == "Active S")) {
							if(child.getValue('Organization_Code').getSimpleValue()!=null) {
								var orgCode = child.getValue('Organization_Code').getID()+"";
								childConsignOrgCodes.add(orgCode);
							}
						}
						else if((objChildItem_LOB == 'RTL') && (objChildID == 'Child_Org_Item') && (objChildConsign == 'Yes') && ((objChildItemStatus_RTL.startsWith('Act') || (objChildItemStatus_RTL == 'Pre Launch') || (objChildItemStatus_RTL == 'No Buy') || (objChildItemStatus_RTL == 'DSL COL'))))
						{
							if(child.getValue('Organization_Code').getSimpleValue()!=null) {
								var orgCode = child.getValue('Organization_Code').getID()+"";
								childConsignOrgCodes.add(orgCode);
							}
						}
						else if((objChildItem_LOB == 'ENT') && (objChildID == 'Child_Org_Item') && (objChildConsign == 'Yes') && ((objChildItemStatus_ENT.startsWith('Act') || (objChildItemStatus_ENT == 'Pre Launch') || (objChildItemStatus_ENT == 'No Buy') || (objChildItemStatus_ENT == 'DSL COL'))))
						{
							if(child.getValue('Organization_Code').getSimpleValue()!=null) {
								var orgCode = child.getValue('Organization_Code').getID()+"";
								childConsignOrgCodes.add(orgCode);
							}
						}
					});
				}
			}
		}
		if(ci_consign_org_codes) {
			ci_consign_org_codes.forEach(function(ci_consign_org_code) {
				var orgCode = ci_consign_org_code.getSimpleValue();
				if(!(childConsignOrgCodes.contains(orgCode))) {
					error = error + " Please take action, remove " + orgCode + " from Consignment Organization Code List as it is not consigned Or not active and click on Set Values.\n";
				}
				if(uniqueOrgSet.contains(orgCode)) {
					duplicatesOrg.add(orgCode);
				}
				else {
					uniqueOrgSet.add(orgCode);
				}
			});
			if(duplicatesOrg) {
				duplicatesOrg.forEach(function(duplicateOrg) {
					error = error + " Duplicate Consignment Organization Code exists " + duplicateOrg + ", please remove the duplicate Consignment Organization Code.\n";
				});
			}
		}
	return error;
}


function validateMandatoryAttribute(node, attr_id, step) {
    var error = "";
    var attributeValue = node.getValue(attr_id).getSimpleValue();
    var attr = step.getAttributeHome().getAttributeByID(attr_id);
    if (!attributeValue) {
        error = attr.getName() + " is mandatory.\n";
    }
    return error;
}

/** Validates Oracle Item Status **/ 
//Prod support Aug release -STIBO-1048
function validateCIOracleItemNumStatus(node, step) {
    var error = "";
    var ciToItemRef = step.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
    var item = node.getReferences(ciToItemRef).toArray();
    if (item.length > 0) {
        var itemStatus = item[0].getTarget().getValue("Item_Status").getID();
		var itemLOB = item[0].getTarget().getValue("Line_Of_Business").getID();
		if(itemLOB == "RTL" || itemLOB == "ENT"){
			if (!itemStatus.startsWith("Act") && itemStatus != "No Buy" && itemStatus != "Pre Launch" && itemStatus != "DSL COL"){
				error = "\nItem Status is not in Active* status, please work with Technical SME to change item status and then resubmit or disregard change.";
			}
		}else if(itemLOB == "WRLN"){
			
			if (!itemStatus.startsWith("Act")) {
            error = "\nItem Status is not in Active S or Active NS status, please update item status prior submission.";
        }
		}
    }
    return error;
}
//Prod support Aug release -STIBO-1048

/** Validates Min Max Order Quantity **/
function validateMinMaxOrderQty(node) {
    var error = "";
    var minOrder = node.getValue("Min_Order_Qty").getSimpleValue();
    var maxOrder = node.getValue("Max_Order_Qty").getSimpleValue();
    if (!minOrder || !maxOrder) {
        error = "\nMin Order Qty & Max Order Qty are mandatory.\n";
    }
    if (minOrder && maxOrder && (parseInt(maxOrder) < parseInt(minOrder))) {
        error = "\nMin Order Qty is greater than Max Order Qty.\n";
    }    
    return error;
}

/** Validates Supplier UOM **/
function validateSupplierUOM(node) {
    var error = "";
    var supplierOnboardingUOM = node.getValue("BPA_Onboarding_UOM").getSimpleValue();
    var processedInEBS = node.getValue("BPA_Processed_In_EBS").getID();
    if (processedInEBS != "Y" && !supplierOnboardingUOM) {
        error = "\nSupplier UOM is required.";
    }
    return error;
}

/** Validates LE percentage **/
function validateContractItemLEPercentage(node, lib, step) {
    var children = null;
    var total = 0;
    var counter = 0;
    var result = "";
	var errorValue = "";
    var leStatus = null;
    var error = ""
    if (node.getObjectType().getID() == 'Contract_Item') {
        children = node.getChildren().toArray();
        children.forEach(function(child) {
            var lob = node.getValue("Legacy_Source").getID()
             errorValue = validateMandatoryAttribute(child, "LE_Status", step) + lib.CILEValidations(child, lob, step);
               if(errorValue){
      	error = error + "\n" + child.getID() + ": " + errorValue ;
      }else{
      	error = error + ""
      }
		});
            if (error) {
                return error
            } else {
				children.forEach(function(child) {
                leStatus = child.getValue("LE_Status").getID();
                if (leStatus == "ACTIVE") {
                    lePercentage = child.getValue("LE_Percentage").getSimpleValue();
                    lePercentage = parseFloat(lePercentage);
                    total = parseFloat(total) + lePercentage;
                    counter++;
                }
            
        });

        if (node.getChildren().size() > 0) {
            total = total.toFixed(2);
            if (total != 100 && counter > 0) {
                result = result + "\nPlease adjust the total percentages for all Local Explosions. Total should be equal to 100%. The current total percentage is " + total;
            }
        }
    
    return result;
			}
}else{
	return result;
}
}


/** Validates altleast one active zoom data on contract item if status is open **/
function validateActiveZoomData(node) {
    var error = "";
    var regionDC = node.getDataContainerByTypeID("Region").getDataContainers().toArray();
    var ciStatus = node.getValue("ContractItem_Status").getID();
    var check = 0;

    if (regionDC.length != 0) {
        regionDC.forEach(function(dc) {
            var regionDCObj = dc.getDataContainerObject();
            var regionDCObjID = regionDCObj + "";
            regionDCObjID = regionDCObjID.split(":");
            regionDCObjID = regionDCObjID[1];
            if (regionDCObj.getValue("Regional_Status").getID() == "ACTIVE" &&
                regionDCObj.getValue("ZIP_Action").getID() == "INCLUDE") {
                check = check + 1;
                log.info("check:"+check);
            }
        });
    }

    if (check == 0 && ciStatus == "OPEN") {
        error = "\nAt least one Region / CFAS Company code must be present and Active to publish\n";
    }
    return error;
}

/** Inactive Zoom data is not allowed for new and eligible to reopen CI's**/
function validateInActiveZoomData(node) {
	var error = "";
    var ciStatus = node.getValue("ContractItem_Status").getID();
    if(ciStatus != "CLOSED"){	    
	    var regionDC = node.getDataContainerByTypeID("Region").getDataContainers().toArray();	    
	    var processFlag = node.getValue("BPA_Processed_In_EBS").getID();
	    var check = 0;
	    if(processFlag != "Y") {
	        regionDC.forEach(function(dc) {
	            var regionDCObj = dc.getDataContainerObject();
	            var regionDCObjID = regionDCObj + "";
	            regionDCObjID = regionDCObjID.split(":");
	            regionDCObjID = regionDCObjID[1];
	            if (regionDCObj.getValue("Regional_Status").getID() == "INACTIVE") {
	                check = check + 1;
	            }
	        });
	    }
	    if (check > 0 ) {
	        error = "\nInactive company codes are not permissible in scenarios involving creation or reopening of contract items. Please delete Inactive company codes. \n";
	    }
    }
    return error;
}

/** Active ALLT Zoom data is not allowed for create, update and reopen CI's**/
function validateALLTZoomData(node) {
	var error = "";
    var ciStatus = node.getValue("ContractItem_Status").getID();
    if(ciStatus != "CLOSED"){	    
	    var regionDC = node.getDataContainerByTypeID("Region").getDataContainers().toArray();    
	    var processFlag = node.getValue("BPA_Processed_In_EBS").getID();
	    var check = 0;
	    regionDC.forEach(function(dc) {
	            var regionDCObj = dc.getDataContainerObject();
	            var regionDCObjID = regionDCObj + "";
	            regionDCObjID = regionDCObjID.split(":");
	            regionDCObjID = regionDCObjID[1];
	            if(processFlag != "Y"){
		            if (regionDCObj.getValue("CFAS_CO_Code").getID() == "ALLT") {
		                check = check + 1;
		            }
	            }
	            else{
		            if (regionDCObj.getValue("CFAS_CO_Code").getID() == "ALLT" && regionDCObj.getValue("Regional_Status").getID() == "ACTIVE") {
		                check = check + 1;
		            }
	            }
	        });    	    
	    if (check > 0 ) {	        	          
	        if(processFlag != "Y")
	           error = "\nPlease delete ALLT and add appropriate company codes or regions.";
	        else
	           error = "\nActive ALLT company code is not permissible on the contract item. Please Inactive the ALLT code.";
	    }
    }
    return error;
}

/** Active WESTT Zoom data is not allowed for create, update and reopen CI's**/
function validateWESTTZoomData(node) {
	var error = "";
    var ciStatus = node.getValue("ContractItem_Status").getID();
    if(ciStatus != "CLOSED"){	    
	    var regionDC = node.getDataContainerByTypeID("Region").getDataContainers().toArray();    
	    var processFlag = node.getValue("BPA_Processed_In_EBS").getID();
	    var check = 0;
	    regionDC.forEach(function(dc) {
	            var regionDCObj = dc.getDataContainerObject();
	            var regionDCObjID = regionDCObj + "";
	            regionDCObjID = regionDCObjID.split(":");
	            regionDCObjID = regionDCObjID[1];
	            if(processFlag != "Y"){
		            if (regionDCObj.getValue("CFAS_CO_Code").getID() == "WESTT") {
		                check = check + 1;
		            }
	            }
	            else{
		            if (regionDCObj.getValue("CFAS_CO_Code").getID() == "WESTT" && regionDCObj.getValue("Regional_Status").getID() == "ACTIVE") {
		                check = check + 1;
		            }
	            }
	        });    	    
	    if (check > 0 ) {	        	          
	        if(processFlag != "Y")
	           error = "\nPlease delete WESTT and add appropriate company codes or regions.";
	        else
	           error = "\nActive WESTT company code is not permissible on the contract item. Please Inactive the WESTT code.";
	    }
    }
    return error;
}

/** Active Blank CFAS Zoom data is not allowed for create, update and reopen CI's**/
function validateBlankCFASZoomData(node) {
	var error = "";
    var ciStatus = node.getValue("ContractItem_Status").getID();
 //   if(ciStatus != "CLOSED"){	    
	    var regionDC = node.getDataContainerByTypeID("Region").getDataContainers().toArray();    
	    var processFlag = node.getValue("BPA_Processed_In_EBS").getID();
	    var check = 0;
	    regionDC.forEach(function(dc) {
	            var regionDCObj = dc.getDataContainerObject();
	            var regionDCObjID = regionDCObj + "";
	            regionDCObjID = regionDCObjID.split(":");
	            regionDCObjID = regionDCObjID[1];
	           // if(processFlag != "Y"){
		            if (!regionDCObj.getValue("CFAS_CO_Code").getID() && regionDCObj.getValue("Regional_Status").getID() == "ACTIVE") {
		                check = check + 1;
		            }
	         //   }
	         /*   else{
		            if (regionDCObj.getValue("CFAS_CO_Code").getID() == "WESTT" && regionDCObj.getValue("Regional_Status").getID() == "ACTIVE") {
		                check = check + 1;
		            }
	            }*/
	        });    	    
	    if (check > 0 ) {	        	          	       
	           error = "\nBlank CFAS company code is not permissible on the contract item. Please delete the Blank Zoom record.";    
	    }
  //  }
    return error;
}

/** Validates Misc Chanrge data **/
function validateMiscChargeDC(node) {
    var error = "";
    var miscChargeDC = node.getDataContainerByTypeID("DC_MiscCharges").getDataContainers().toArray();
    if (miscChargeDC.length != 0) {
        miscChargeDC.forEach(function(DC) {
            var miscChargeDCObj = DC.getDataContainerObject();
            var miscChargeDCObjID = miscChargeDCObj + "";
            miscChargeDCObjID = miscChargeDCObjID.split(":");
            miscChargeDCObjID = miscChargeDCObjID[1];
           /* if (miscChargeDCObj.getValue("Service_Charge_Code").getSimpleValue() == null) {
                error = miscChargeDCObjID + ": Could not process line-item changes due to dependency rule, anytime Service Charge/Service Amount/Flat charge is populated all are required, please review, correct, and resubmit. \n "
            }
            if (miscChargeDCObj.getValue("Service_Amount").getSimpleValue() == null) {
                error = error + miscChargeDCObjID + ": Could not process line-item changes due to dependency rule, anytime Service Charge/Service Amount/Flat charge is populated all are required, please review, correct, and resubmit. \n ";
            }else if (miscChargeDCObj.getValue("Service_Amount").getSimpleValue() <= 0) {
                error = error + miscChargeDCObjID + ": Please provide Service Charge Amount greater than zero \n";
            }
            if (miscChargeDCObj.getValue("Flat_Charge_Flag").getSimpleValue() == null) {
                error = error + miscChargeDCObjID + ": Could not process line-item changes due to dependency rule, anytime Service Charge/Service Amount/Flat charge is populated all are required, please review, correct, and resubmit. \n";
            }*/

            if (miscChargeDCObj.getValue("Service_Charge_Code").getSimpleValue() == null
            || miscChargeDCObj.getValue("Service_Amount").getSimpleValue() == null
            || (miscChargeDCObj.getValue("Flat_Charge_Flag").getSimpleValue() == null)){
            	error = error + miscChargeDCObjID + ": Could not process line-item changes due to dependency rule, anytime Service Charge/Service Amount/Flat charge is populated all are required, please review, correct, and resubmit. \n";
            }
            if (miscChargeDCObj.getValue("Service_Amount").getSimpleValue() && miscChargeDCObj.getValue("Service_Amount").getSimpleValue() <= 0) {
                error = error + miscChargeDCObjID + ": Please provide Service Charge Amount greater than zero \n";
            }
            
        });
    }
    return error;
}

/** Validates future price and date **/
function validateFuturePriceAndDate(node) {
    var error = "";
    var futureEffectiveDate = node.getValue("Future_Effective_Date").getSimpleValue();
    var currentEffectiveDate = node.getValue("Current_Effective_Date").getSimpleValue();
    var currentPrice = node.getValue("Current_Price").getSimpleValue();
    var futurePrice = node.getValue("Price_2").getSimpleValue();
    // Error msg when effective date is past date ( can use expiry date as well)
    if (futureEffectiveDate && checkDateIfLessthanToday(futureEffectiveDate)) {
        error = "\nThe effective date is not today or a future date please change.";
    }
    // Error msg when effective date is past date ( can use expiry date as well)
    if (futureEffectiveDate > getFourteenDate()) {
        error = error + "\nPrice changes cannot be submitted more than two weeks in advance. Please wait until the maintenance window to submit this change.";
    }
    // STEP should automatically apply the current date if the start/effective date is null and price is filled
    if (futurePrice > 0) {
        if (futureEffectiveDate == null) {
            error = error + "\nEffective Date cannot be null if future price is greater than 0.";
        }
        var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd"); // For ISO Date Format
        var dateNow = new Date();
        var formattedDateTime = dateTimeFormatter.format(dateNow);
        if (futureEffectiveDate == formattedDateTime) {
            error = error + "\nFuture Effective Date should be greater than Current Date.";
        }
    }
    // price should be mandatory if price effective date is not null
    if (futureEffectiveDate != null) {
        if (futurePrice == null || futurePrice == 0) {
            error = error + "\nThe price cannot be blank or 0 if price effective date is populated. Please enter a new Price or remove Price Effective Date.";
        }
    }
    if (futureEffectiveDate != null && futurePrice != null) {
        //  price is same as current price
        if (futurePrice == currentPrice) {
            error = error + "\nThe future price is equal to current price, no change to process";
        }
        //  future date is same as current date
        if (futureEffectiveDate == currentEffectiveDate) {
            error = error + "\nThe future date is equal to current date, no change to process";
        }
    }

    return error;
}

/** Validates Referenced Item Type based on LOB **/
function validateReferencedItemType(node, contractItemReference, parent, wrlnEngUser) {//STIBO-1432
    var error = "";
    var itemRef;
    if (node.getObjectType().getID() == "Contract_Item") {
        var parent = node.getParent();
        var legacySrc = parent.getValue("Legacy_Source").getID();
        var itemRef = node.queryReferences(contractItemReference).asList(1);
        if (itemRef && itemRef.size() == 0) {
            error = error + "\nItem Reference  with Line Item is mandatory.";
        }
        if (itemRef && itemRef.size() > 0) {
            var refTrgt = itemRef.get(0).getTarget();
            var ntwBomType = refTrgt.getValue("NTW_BOM_Type").getID();//STIBO-1432
            var trgtLOB = refTrgt.getValue("Line_Of_Business").getID();
            var targetItemType =refTrgt.getParent().getID();
            if ((wrlnEngUser && ntwBomType && ntwBomType == "LOCAL EXPLOSION") || !wrlnEngUser) { //STIBO-1432
                if (legacySrc && legacySrc != "RTL") {                   
                    if (trgtLOB == "RTL" || trgtLOB == "NTW") {
                        error = error + "\nIf Business source of the BPA is non Retail, Contract Item " + node.getID() + " can be linked with only Entertainment or Wire line  MST items \n";
                    }
                   /* if (targetItemType == "SATELLITE") {
                        error = error + "\nIf Business source of the BPA is non DTV, Contract Item " + node.getID() + " cannot be linked with a DTV item \n";
                    }*/

                } 
				else if (legacySrc && legacySrc == "DTV") {                                         
                    if (targetItemType != "SATELLITE") {
                        error = error + "\nIf Business source of the BPA is DTV, Contract Item " + node.getID() + " can be linked with only DTV Entertainment MST items \n";
                    }

                }
				else if (legacySrc && legacySrc == "RTL") {

                    var trgtLOB = refTrgt.getValue("Line_Of_Business").getID();
                    if (trgtLOB != "RTL") {
                        error = error + "\nBusiness Source for Contract Item " + node.getID() + " is Retail Consumer. It can be linked with only Retail MST Item \n";
                    }
                  /*  if (trgtLOB == "RTL" && (targetItemType == "ENTMOB_ACC" || targetItemType == "ENTMOB_COL" || targetItemType =="ENTMOB_ELE")) {
                        error = error + "\nBusiness Source for Contract Item " + node.getID() + " is Retail Consumer. It cannot be linked with DTV Item \n";
                    }*/

                }
            } 
            //STIBO-1432
            else if (wrlnEngUser && ntwBomType != "LOCAL EXPLOSION") {
                error = error + "\nThe item you are attempting to add is not defined as a Local Explosion. Please review item set and/or work with the sourcing manger in order to add to BPA (Blanket Purchase Agreement).";
            }
            //STIBO-1432
        }
    }
    logger.info("Error from lib: "+error)
    return error;
}

/** Validates duplicate zoom data **/
function validateDuplicateZoomDataAcrossCI(node, contractItemReference, lib, step) {
    var currentNodeList = [];
    var mainRegionDCList = [];
    var dupRegionDC = "";
    var itemStatus;
    var error = "";
    var cfasDataList;
    var citemMap = new java.util.HashMap();
    var dupMap = new java.util.HashMap();

    var refContractItemID = node.getReferences(contractItemReference);
    if (refContractItemID.size() > 0) {
        var refItem = refContractItemID.get(0).getTarget();
        var refItemLOB = refItem.getValue("Line_Of_Business").getSimpleValue();
        if (refItemLOB == "Entertainment") {
            itemStatus = refItem.getValue("Item_Status_ENT").getSimpleValue();
        }
        if (refItemLOB == "Wireline") {
            itemStatus = refItem.getValue("Item_Status_WRLN").getSimpleValue();
        }
	        if ((refItemLOB == "Entertainment" && (itemStatus.startsWith("Act") || itemStatus == "Pre Launch" || itemStatus == "No Buy")) ||
	            (refItemLOB == "Wireline" && itemStatus.startsWith("Act"))) {
	            if (node.getDataContainerByTypeID("Region").getDataContainers().toArray().length != 0) {
	                dupRegionDC = "";
	                var regionDCsItr = node.getDataContainerByTypeID("Region").getDataContainers().iterator();
	                while (regionDCsItr.hasNext()) {
	                    var regDcObj = regionDCsItr.next().getDataContainerObject();
	                    var cfasCompCodeMain = regDcObj.getValue("CFAS_CO_Code").getSimpleValue();
	                    var regDCZip = regDcObj.getValue("ZIP").getID();
	                    var regDCState = regDcObj.getValue("STATE").getID();
	                    var regDCRegionalStatus = regDcObj.getValue("Regional_Status").getID();
	                    var regDC = cfasCompCodeMain + regDCZip + regDCState;
	                    if (regDC != 0) {
	                        if (regDCRegionalStatus && regDCRegionalStatus != "INACTIVE") {
	                            if (!currentNodeList.includes(regDC)) {
	                                currentNodeList.push(regDC); // adding unique CFAS code into the list for cross CI dup check
	                            }
	                        }
	                    }
	                }
	            }
	        }       
        log.info("currentNodeList = " + currentNodeList);
        citemMap = getRefCICFASCompCodes(node, refItem); // Get the Map for all referenced CI CFAS code combinations
        log.info("citemMap = " + citemMap);
        for (var i = 0; i < currentNodeList.length; i++) {
            checkDuplicateCFASDataAcrossCI(citemMap, dupMap, currentNodeList[i]); // Check duplicate CFAS throughout the system							
        }
        log.info("dupMap = " + dupMap);
        var ebsFlag = node.getValue("BPA_Processed_In_EBS").getID();
        error = error + generateErrorMessage(dupMap, ebsFlag);
        log.info(error);
    }
    return error;
}

function validateDuplicateZoomData(node, contractItemReference, lib, step) {
    var currentNodeList = [];
    var mainRegionDCList = [];
    var dupRegionDC = "";
    var itemStatus;
    var error = "";
    var cfasDataList;
    var citemMap = new java.util.HashMap();
    var dupMap = new java.util.HashMap();

    var refContractItemID = node.getReferences(contractItemReference);
    if (refContractItemID.size() > 0) {
        var refItem = refContractItemID.get(0).getTarget();
        var refItemLOB = refItem.getValue("Line_Of_Business").getSimpleValue();
        if (refItemLOB == "Entertainment") {
            itemStatus = refItem.getValue("Item_Status_ENT").getSimpleValue();
        }
        if (refItemLOB == "Wireline") {
            itemStatus = refItem.getValue("Item_Status_WRLN").getSimpleValue();
        }

        if ((refItemLOB == "Entertainment" && (itemStatus.startsWith("Act") || itemStatus == "Pre Launch" || itemStatus == "No Buy")) ||
            (refItemLOB == "Wireline" && itemStatus.startsWith("Act"))) {
            if (node.getDataContainerByTypeID("Region").getDataContainers().toArray().length != 0) {
                dupRegionDC = "";
                var regionDCsItr = node.getDataContainerByTypeID("Region").getDataContainers().iterator();
                while (regionDCsItr.hasNext()) {
                    var regDcObj = regionDCsItr.next().getDataContainerObject();
                    var cfasCompCodeMain = regDcObj.getValue("CFAS_CO_Code").getSimpleValue();
                    var regDCZip = regDcObj.getValue("ZIP").getID();
                    var regDCState = regDcObj.getValue("STATE").getID();
                    var regDCRegionalStatus = regDcObj.getValue("Regional_Status").getID();
                    var regDC = cfasCompCodeMain + regDCZip + regDCState;
                    if (regDC != 0) {
                        var cfasCombined = cfasCompCodeMain + "-" + regDCState + "-" + regDCZip + "-" + regDCRegionalStatus;
                        //if(!mainRegionDCList.includes(cfasCombined)) {
                        mainRegionDCList.push(cfasCombined); // adding CFAS code and status into list for current CI dup check
                        //}
                        if (regDCRegionalStatus && regDCRegionalStatus != "INACTIVE") {
                            if (!currentNodeList.includes(regDC)) {
                                currentNodeList.push(regDC); // adding unique CFAS code into the list for cross CI dup check
                            }
                        }

                    }
                }
            }
        }
        dupRegionDC = checkDupInCurrentCI(mainRegionDCList); // Current CI dup check function call
        if (dupRegionDC != "") {
            dupRegionDC = dupRegionDC.substring(0, dupRegionDC.length - 1);
            error = "\nCould not process region selection as " + dupRegionDC + " combination already exists to the current Contract Item.\n";
        }

        log.info("currentNodeList = " + currentNodeList + " dupRegionDC = " + dupRegionDC);
        citemMap = getRefCICFASCompCodes(node, refItem); // Get the Map for all referenced CI CFAS code combinations
        log.info("citemMap = " + citemMap);
        for (var i = 0; i < currentNodeList.length; i++) {
            checkDuplicateCFASDataAcrossCI(citemMap, dupMap, currentNodeList[i]); // Check duplicate CFAS throughout the system							
        }
        log.info("dupMap = " + dupMap);
        var ebsFlag = node.getValue("BPA_Processed_In_EBS").getID();
        error = error + generateErrorMessage(dupMap, ebsFlag,step);
        log.info(error);
    }
    return error;
}

function checkDupInCurrentCI(mainRegionDCList) {
    var cfasList = [];
    var cfasCombinedList = [];
    var dupRegionDC = "";
    for (var i = 0; i < mainRegionDCList.length; i++) {
        var cfasData = mainRegionDCList[i].split("-");
        /*
        if (cfasData[0] != "ZB") {
            if (!cfasList.includes(cfasData[0]))
                cfasList.push(cfasData[0]);
            else {
                if (!dupRegionDC.includes(cfasData[0]))
                    dupRegionDC = dupRegionDC + cfasData[0] + ",";
            }
        } else { */
            var cfasCombination = cfasData[0] + cfasData[1] + cfasData[2];
            if (!cfasCombinedList.includes(cfasCombination))
                cfasCombinedList.push(cfasCombination);
            else {
                if (!dupRegionDC.includes(cfasData[0]))
                    dupRegionDC = dupRegionDC + cfasData[0] + ",";
            }
      //  }
    }
    return dupRegionDC;
}

function getRefCICFASCompCodes(node, pitem) {
    var citem;
    var citemCFASCodeList;
    var citemMap = new java.util.HashMap();
    var refCI = pitem.getReferencedByProducts();
    var itr = refCI.iterator();
    while (itr.hasNext()) {
        var obj = itr.next();
        citem = obj.getSource();
        log.info("citem = " + citem);       
        if (citem.getObjectType().getID() == "Contract_Item" && citem.getID() != node.getID()) {
        	   var parent = citem.getParent();
	        if(parent.getObjectType().getID() == "BPA")
	          var folder = parent.getParent().getID();     
	        else
	          var folder = citem.getParent().getID()	
	         if((parent == "BPA" && (folder != "CancelledProducts" && folder != "BPA_Onboarding")) || (folder != "CancelledProducts" && folder != "BPA_Onboarding")) {
	            if (citem.getDataContainerByTypeID("Region").getDataContainers().toArray().length != 0) {
	                citemCFASCodeList = new java.util.ArrayList();
	                var regionDCsItr = citem.getDataContainerByTypeID("Region").getDataContainers().iterator();
	                while (regionDCsItr.hasNext()) {
	                    //log.info("inside region DC loop");
	                    var regDcObj = regionDCsItr.next().getDataContainerObject();
	                    var regDCcfasCompCode = regDcObj.getValue("CFAS_CO_Code").getSimpleValue();
	                    var regDCZip = regDcObj.getValue("ZIP").getID();
	                    var regDCState = regDcObj.getValue("STATE").getID();
	                    var regionalStatus = regDcObj.getValue("Regional_Status").getSimpleValue();
	                    var regDCData = regDCcfasCompCode + regDCZip + regDCState;
	                    if (regDCData != 0) {
	                        var expirationDate = citem.getParent().getValue("Expiration_Date").getSimpleValue();
	                        //log.info("expirationDate = " + expirationDate);
	                        if (citem.getParent().getValue("BPA_Status").getSimpleValue() == "Open") {
	                            //log.info("Inside BPA status = " + citem.getParent().getValue("BPA_Status").getSimpleValue());
	                            if ((expirationDate && expirationDate >= lib.getCurrentDate()) || !expirationDate || expirationDate == "") {
	                                //log.info("is Expired = " + lib.getCurrentDate());								
	                                if (citem.getValue("ContractItem_Status").getSimpleValue() == "Open") {
	                                    // log.info("citem status = " + citem.getValue("ContractItem_Status").getSimpleValue());
	                                    if (regionalStatus && regionalStatus == "ACTIVE") {
	                                        log.info("regionalStatus = " + regionalStatus);
	                                        prepareCitemMap(citem.getID(), regDCData, citemMap, citemCFASCodeList);
	                                    }
	                                }
	                            }
	                        }
	                    }
	                }
	            }
	        }
        }
    }
    return citemMap;
}

function checkDuplicateCFASDataAcrossCI(citemMap, dupMap, currentCFASData) {
    var dupCFASList;
    var citemSet = citemMap.keySet();
    var itr = citemSet.iterator();
    while (itr.hasNext()) {
        var citem = itr.next();
        var cfasDataList = citemMap.get(citem);
        //log.info(citem + "|" + cfasDataList);
        if (cfasDataList.size() > 0 && cfasDataList.contains(currentCFASData)) {
            prepareCitemMap(citem, currentCFASData, dupMap, dupCFASList);
        }
    }
    return dupMap;
}

function prepareCitemMap(citem, currentCFASData, citemMap, cfasDataList) {
    if (citemMap.get(citem)) {
        cfasDataList = citemMap.get(citem);
        if (!cfasDataList.contains(currentCFASData))
            cfasDataList.add(currentCFASData);
    } else {
        cfasDataList = new java.util.ArrayList();
        cfasDataList.add(currentCFASData);
        citemMap.put(citem, cfasDataList);
    }
   
}

function generateErrorMessage(citemMap, ebsFlag,step) {
    var cfasCode;
    var cfasDataString = "";
    var errorMsg = "";
    var citemIDSS = null;
    var citemSet = citemMap.keySet();
    var itr = citemSet.iterator();
    while (itr.hasNext()) {
        cfasDataString = "";       
        var citemID = itr.next();       
        var cfasDataList = citemMap.get(citemID);
        for (var i = 0; i < cfasDataList.size(); i++) {
            var cfasData = cfasDataList.get(i);
            if (cfasData.includes("null")) {                
                cfasCode = cfasData.replaceAll("null", "");
            } else {
                cfasCode = cfasData;
            }
            cfasDataString = cfasDataString + cfasCode + ",";
        }
        cfasDataString = cfasDataString.substring(0, cfasDataString.length - 1);            
        var citem = step.getProductHome().getProductByID(citemID);
        if(citem.getValue("SS_Creation").getValue() =="Yes"){
           citemIDSS = citem.getValue("Serial_No").getValue();             
           errorMsg = errorMsg + "\nDuplicate Active CFAS company code(s) " + cfasDataString + " found for Contract Item in Serial No " + citemIDSS + " from Smartsheet or "+citemID+".\n";                    
        }
        else{
        	errorMsg = errorMsg + "\nDuplicate Active CFAS company code(s) " + cfasDataString + " found for Contract Item "+citemID+".\n";             	
        }
    }    
    return errorMsg;
}


function validateClosedCIData(node,step){ //Phase 2 July 20 Release , STIBO-2512
      var ciStatus = node.getValue("ContractItem_Status").getSimpleValue();
      var specCounter = 0; 
      var DCCounter = 0;   
      var error ="";
	  var apprCIStatus=""
	  var parent = node.getParent();
	  var legSou =parent.getValue("Legacy_Source").getSimpleValue();
	  if(legSou=="Retail Consumer"){
	  var AttrGrp = step.getAttributeGroupHome().getAttributeGroupByID("AG_CI_Close_Status_Attrs_RTL").getAllAttributes();
	  }else{
      var AttrGrp = step.getAttributeGroupHome().getAttributeGroupByID("AG_CI_Close_Status_Attrs").getAllAttributes();
	  }
	  
	  var attrList = new java.util.ArrayList();
      AttrGrp.forEach(function(attr){
      attrList.add(attr.getID())
      });	
      var set = new java.util.HashSet();
      var setUnapproved = node.getNonApprovedObjects();
      var unapprovedIterator = setUnapproved.iterator();
      log.info("setUnapproved:"+setUnapproved);
      while(unapprovedIterator.hasNext()){
          var partObject = unapprovedIterator.next();
          var partObjectStr = partObject.toString();        
          if(partObjectStr.indexOf("ValuePartObject") != -1 && attrList.contains(String(partObject.getAttributeID()))){
              specCounter++;
          }
          if(partObjectStr.indexOf("DataContainerPartObject") != -1)
               DCCounter++;
      }
      var appNode = step.executeInWorkspace("Approved", function(approvedManager) {
      var approveWSOBJ = approvedManager.getObjectFromOtherManager(node);
      if (approveWSOBJ) {        
         apprCIStatus = approveWSOBJ.getValue("ContractItem_Status").getSimpleValue();             
        }
      });    
      if((apprCIStatus == "Closed" && ciStatus == "Closed" && DCCounter > 0) ||
             (ciStatus == "Closed" && specCounter > 0)){		          
          error = error + "\nCould not process line-item changes as Contract Item Status is Closed, please change Contract Item status and resubmit or disregard change. \n";
          }
      return error;
}	

//STIBO-1048
function validateCILENtwBOMType(item){
	var bomType=item.getValue("NTW_BOM_Type").getSimpleValue();
	var errMsg ="";
	if(bomType!="LOCAL EXPLOSION")
	      errMsg = "\nLE Child is not processed as referenced Item BOM type is not LOCAL EXPLOSION";
	return errMsg;
}

/** STIBO-2735 (Project Support,Feb 22nd) -- Validates LE Price Total **/

function validateContractItemLEPrice(node, step,attr) {	
	log.info("attr: "+attr)
    var total = 0;    
    var result = "";
    var leStatus = "";
	var lePrice  =0;
	var error = "";
	var priceError = "";
    if (node.getObjectType().getID() == 'Contract_Item' && node.getChildren().size()>0) {
        var CIPrice = node.getValue(attr).getSimpleValue();
        if(CIPrice)
          CIPrice = parseFloat(CIPrice).toFixed(8);
        log.info("CIPrice:"+CIPrice)
	   children = node.getChildren().toArray();
        children.forEach(function(child) {        	
            var lob = node.getValue("Legacy_Source").getID();                   
            if (error) {            	  
                result = child.getID() + ": " + error;
            } else {
                leStatus = child.getValue("LE_Status").getID();
                if (leStatus == "ACTIVE") {
                	if(attr == "Price" || attr == "Current_Price")
                     lePrice = child.getValue("LE_Price").getSimpleValue();
                   if(attr == "Price_2")
                     lePrice = child.getValue("LE_Future_Price").getSimpleValue();
				 leQty = child.getValue("Quantity_2").getSimpleValue();
				 leType = child.getValue("LE_TYPE").getID();
				 if(leType == "MATERIAL" || leType == "EXPENSE") {
				   lePrice = parseFloat(lePrice * leQty);  	
                    }			
                    else{
                      lePrice = parseFloat(lePrice*1);
                    }                  
                    total = parseFloat(total) + lePrice;          
                    total = total.toFixed(2);                       
                 }
            }
        });
       
        if (Number(total) != Number(CIPrice)) {     
        	 if(attr == "Price")      
            priceError = "\nPlease adjust the Price for all Local Explosions under " + node.getID() + ". Total should be equal to Contract Line Price " +CIPrice+". The current LE price total is " + total; 
           if(attr == "Current_Price")      
            priceError = "\nPlease adjust the Price for all Local Explosions under " + node.getID() + ". Total should be equal to Contract Line Current Price " +CIPrice+". The current LE price total is " + total;              
           if(attr == "Price_2" && CIPrice)      
            priceError = "\nPlease adjust the Future Price for all Local Explosions under " + node.getID() + ". Total should be equal to Contract Line Future Price " +CIPrice+". The LE Future price total is " + total;    
           if(attr == "Price_2" && (!CIPrice || CIPrice==0) && total >0)      
            priceError = "\nPlease adjust the Future Price for all Local Explosions under " + node.getID() + ". Contract Line Future Price is blank."; 
        }
    }    
    return result+priceError;
}

function bpaClonePostEnrichValHeader(node,step,query){
var effectiveDate = node.getValue("Effect_Date").getSimpleValue();
var userAction = node.getValue("BPA_Clone_WF_UserAction").getID();
var allErrors = "";
var bpaErrors = "";
var cloneSupplierCheck = "" ;
var effDateCheck="";
if(!userAction ||(userAction == "Clone" && !node.getValue("BPA_Cloned_From").getSimpleValue()) /*||
       ((userAction == "Copy" || userAction == "Move") && node.getValue("BPA_Cloned_From").getSimpleValue())*/){
var bpaStatusCheck = validateMandatoryAttribute(node, "BPA_Status", step);
var zipCheck = validateMandatoryAttribute(node, "FOB_ZIP", step);
var legacySourceCheck =validateBPALegacyContractNumber(node, step);
var payTermCheck = validateMandatoryAttribute(node, "Payment_Terms", step);
var freightTermCheck = validateMandatoryAttribute(node, "Freight_Terms", step);
var childrenCheck = checkBPAHeaderChildren(node);
var expirationDateCheck = validateBPAExpirationDate(node);
var headerDesc = validateMandatoryAttribute(node, "BPA_Description", step);
var contractMangerCheck = validateBPAContractManager(node, step);
/*
if(userAction == "Clone"){
var cloneSupplierCheck = cloneBPASupplierCheck(node, step);
var effDateCheck = validateBPAHeaderEffectiveDate(effectiveDate);
}else{
	var cloneSupplierCheck = "" ;
	var effDateCheck="";
}*/

var checkDuplicateLegacyContractNum = validateDuplicateLegacyContractNumber(node, step, query);

bpaErrors = bpaStatusCheck + zipCheck + legacySourceCheck +  payTermCheck + freightTermCheck + headerDesc +
    contractMangerCheck + effDateCheck + expirationDateCheck + childrenCheck + cloneSupplierCheck + checkDuplicateLegacyContractNum;

}

if (bpaErrors) {
    var bpaId = node.getID();
    allErrors = bpaId + " Header Validations \n" + bpaErrors + " \n";
}
return allErrors
}


function validateContractItem(contractItem, step,contractItemReference,lib) {
  var ciChecks = "";
  var nonRTLErrors = "";
  var contractItemErrors = "";
  var checkLEPrice = "";
  var checkLEFuturePrice = "";
  var checkLEErrors = "";
  var contraItemId = contractItem.getID();
  var processFlag = contractItem.getValue("BPA_Processed_In_EBS").getID();
  var itemNum = contractItem.getValue("Oracle_Item_Num").getValue();
  var refItem = step.getNodeHome().getObjectByKey("Item.Key", itemNum);
  var leadTimeCheck = validateMandatoryAttribute(contractItem, "Lead_Time", step);
  var priceCheck = validateMandatoryAttribute(contractItem, "Price", step);
  var itemTypeCheck = validateMandatoryAttribute(contractItem, "Item_Type", step);
  //var uomCheck = validateMandatoryAttribute(contractItem, "BPA_UOM", step);
  var onboardingUomCheck = validateMandatoryAttribute(contractItem, "BPA_Onboarding_UOM", step);
  if (onboardingUomCheck) {
    onboardingUomCheck = "Onboarding UOM is blank due to invalid value, please check with Data Governance Team.";
  }
  var node = contractItem.getParent();
  var legacySource = node.getValue("Legacy_Source").getID();
  var itemStatusCheck = validateCIOracleItemNumStatus(contractItem, step);
  if (legacySource && (legacySource != "RTL")) {
    var nonProcessFlagCheck = validateMandatoryAttribute(contractItem, "Non_Process_Flag", step);
    var stdPackagingCheck = validateMandatoryAttribute(contractItem, "STD_PACKAGING", step);
    var minMaxOrderQtyCheck = validateMinMaxOrderQty(contractItem);
    var zoomDCCheck = validateActiveZoomData(contractItem);
    var duplicateZoomDataCheck = validateDuplicateZoomData(contractItem, contractItemReference, lib, step);
    //STIBO-2735, Validate if Sum of Active CILE Price = CI Price                            
            if(processFlag != "Y")
	           checkLEPrice = validateContractItemLEPrice(contractItem,step,"Price");    
	        if(processFlag == "Y")
	        	 checkLEPrice = validateContractItemLEPrice(contractItem,step,"Current_Price"); 	       	        
	        if(!checkLEPrice){	        	
	        	 var children = contractItem.getChildren().toArray();
               children.forEach(function(child) {
             	  checkLEErrors += lib.CILEValidations(child, legacySource, step); 
               });	        	        
	        if(!checkLEErrors && processFlag == "Y")	        	
	        	 checkLEFuturePrice = validateContractItemLEPrice(contractItem,step,"Price_2");    
	        }	     				                       
   nonRTLErrors = nonProcessFlagCheck + stdPackagingCheck + minMaxOrderQtyCheck + zoomDCCheck + duplicateZoomDataCheck
   + checkLEPrice + checkLEFuturePrice+checkLEErrors;
  }
 // var checkLEPercentage = validateContractItemLEPercentage(contractItem, lib, step);  
  var consignmentDataCheck = validateConsignOrgCodeData(contractItem, "Consign_Org_Code", step);
  var miscDCCheck = validateMiscChargeDC(contractItem);
  ciChecks = leadTimeCheck + priceCheck + itemTypeCheck + onboardingUomCheck + itemStatusCheck + nonRTLErrors  + consignmentDataCheck + miscDCCheck;
  if (ciChecks) {
        contractItemErrors = contractItemErrors + contraItemId + " Validations \n" + ciChecks + " \n";
    }
	
	
  log.info("contractItemErrors:"+contractItemErrors); 
return contractItemErrors ;
}

function validateInvalidZoomData(node,step,refItem,zoomDataLookUp) {
  var errMsg = "";
  var consignError = "";
  var statusError = "";
  var noConsignError= "";  
  var noStatusError = "";
  var regionDCList = new java.util.ArrayList();
  var ciStatus = node.getValue("ContractItem_Status").getID();
  var regMap = new java.util.HashMap();
  var consignRegMap = new java.util.HashMap();
    
  var entityObj = step.getEntityHome().getEntityByID("BPA_Region_DC_Hierarchy");
  var consignInvalidCFASList = entityObj.getValue("Consign_Invalid_CFAS_Codes").getSimpleValue();
  consignInvalidCFASList = JSON.parse(consignInvalidCFASList);
  var invalidCFASList = entityObj.getValue("Invalid_CFAS_Codes").getSimpleValue();
  invalidCFASList = JSON.parse(invalidCFASList);
  var CFASCodesList = entityObj.getValue("BPA_DC_Region_CFAS_Code").getSimpleValue();
  CFASCodesList = JSON.parse(CFASCodesList);
  
  var [CIRegDistList, consignOrgList, apprConsignOrgList] = bpaZoomLib.getRegionsList(node,step);
  var [activeDCList,inactiveDCList] = getRegionDCList(node,activeDCList,inactiveDCList);//Get the list of Regions from Data Container on the Contract Item
  
  var childOrgs = refItem.getChildren().toArray();
  var material = refItem.getValue("Material_Item_Type").getSimpleValue();
  if (CIRegDistList) {
    for (var i = 0; i < CIRegDistList.size(); i++) {
      curRegDC= CIRegDistList.get(i);    
      
          if(material == "Minor Material" || material == "Cable"){                
	         childOrgs.forEach(function (child) {
	          var childOrgCode = child.getValue("Organization_Code").getID();
	          var childConsignInd = child.getValue("Consignment").getID(); 
	          var childStatus = child.getValue("Item_Status_WRLN").getID();		      	      
          //Inactivate the Non Consigned CFAS Codes if the Child Org is Consigned                
          if(curRegDC == childOrgCode && consignOrgList.contains(curRegDC) && childConsignInd == "1"){  
          	var consignErrorCode = "";            	             	  
		      for (var j = 0; j < consignInvalidCFASList.length; j++) {
		        for (key in consignInvalidCFASList[j]) {
		          if (curRegDC == key) {          	
			            var cfasList = consignInvalidCFASList[j][key];
			            cfasList.forEach(function (code) {
			              if (activeDCList.contains(code))
			                consignErrorCode += code+",";
			            });          	
		          }
		        }
		      }
		      if (consignErrorCode) {
                  consignError += consignErrorCode+" for Consign Org " + curRegDC + "\n";
                }
          }
          //Inactivate the Consigned CFAS Codes if the Child Org is Not Consigned    
          if(curRegDC == childOrgCode && !consignOrgList.contains(curRegDC) && apprConsignOrgList.contains(curRegDC) && childConsignInd != "1" ||
               curRegDC == childOrgCode && !consignOrgList.contains(curRegDC) && apprConsignOrgList.contains(curRegDC) && childConsignInd == "1" ||
               curRegDC == childOrgCode && !consignOrgList.contains(curRegDC) && !apprConsignOrgList.contains(curRegDC) && childConsignInd == "1"                
               ){  
          	var noConsignCode = "";            	  
		      for (var k = 0; k < invalidCFASList.length; k++) {
		        for (key in invalidCFASList[k]) {
		          if ((curRegDC+";"+childStatus) == key) {          	
			            var cfasInvalidList = invalidCFASList[k][key];
			            cfasInvalidList.forEach(function (code) {
			              if (activeDCList.contains(code))
			                 noConsignCode += code+",";
			            });          	
		          }
		        }
		      }
		      if (noConsignCode) {
                  noConsignError += noConsignCode+" for Region " + curRegDC + "\n";
		      }
          }
           //Inactivate the Stocked CFAS Codes if the Child Org Status is Non Stocked or viceversa for Minor Material  
          if(curRegDC == childOrgCode && !consignOrgList.contains(curRegDC) && !apprConsignOrgList.contains(curRegDC) && childConsignInd != "1"){  
          	var noStatusCode = "";            	  
		      for (var p = 0; p < invalidCFASList.length; p++) {
		        for (key in invalidCFASList[p]) {
		          if ((curRegDC+";"+childStatus) == key) {          	
			            var cfasInvalidList = invalidCFASList[p][key];
			            cfasInvalidList.forEach(function (code) {
			              if (activeDCList.contains(code))
			                 noStatusCode += code+",";
			            });          	
		          }
		        }
		      }
		      if (noStatusCode) {
                  noStatusError += noStatusCode+" for Region " + curRegDC + "\n";
		      }
          }
      });
    }        
    else{ //Inactivate the Stocked CFAS Codes if the Child Org Status is Non Stocked or viceversa (other than Minor Material)
    	          var status = refItem.getValue("Item_Status_WRLN").getID();  
          	var  errorCode= "";            	  
		      for (var q = 0; q < invalidCFASList.length; q++) {
		        for (key in invalidCFASList[q]) {
		          if ((curRegDC+";"+status) == key) {          	
			            var cfasInvalidList = invalidCFASList[q][key];
			            cfasInvalidList.forEach(function (code) {
			              if (activeDCList.contains(code))
			                 errorCode += code+",";
			            });          	
		          }
		        }
		      }
		      if (errorCode) {
                  statusError += errorCode+" for Region " + curRegDC + "\n";
		      }
       }
        //Remove the Orgs from the dropdowns if the corresponding CFAS code is deleted or inactivated
       if(!consignError && !noConsignError && !statusError && !noStatusError)
         errMsg += validateCFASCodes(node,refItem,curRegDC,consignOrgList,activeDCList,inactiveDCList,CFASCodesList,CIRegDistList);
    }          
  }
  if (consignError)    {
    errMsg += "\nPlease Inactive the regional status for the following CFAS codes since the Org is Consigned: \n"+consignError;
  } 
  if (noConsignError)    {
    errMsg += "\nPlease Inactive the regional status for the following CFAS codes since they are no longer Consigned: \n"+noConsignError;
  }  
  if(statusError||noStatusError){
    errMsg += "\nPlease Inactive the regional status for the following CFAS codes since Org Status is changed: \n"+statusError+noStatusError;
  }      
  if(!errMsg && activeDCList.size()>0) {
    [regMap,consignRegMap] = checkActiveCodes(node,step,refItem,activeDCList,zoomDataLookUp,CFASCodesList,invalidCFASList,regMap,consignRegMap) //activeDCList = SW,SWQB Active but SW is Active S
   
  //generate status err
  log.info("generate err")
   var CIStatus = node.getValue("BPA_Processed_In_EBS").getID();
   var regSet = regMap.keySet();    
   var itr = regSet.iterator();
    while (itr.hasNext()) {    	
    	var cfasDataString = "";
    	var regID = itr.next();   
    	log.info(   "regID:"+regID) 
        var cfasDataList = regMap.get(regID);
        for (var i = 0; i < cfasDataList.size(); i++) {
            var cfasData = cfasDataList.get(i);
            cfasDataString = cfasDataString+cfasData+",";
        }
        	if(CIStatus == "Y")
                errMsg += "\nPlease take action, either add '" + regID + "' to the Region(s) for Zoom Form - ADD ONLY dropdown and click on Set Values Or InActivate the Regional Status of the below CFAS Code(s): \n" + cfasDataString;
         if(CIStatus != "Y")
                errMsg += "\nPlease take action, either add '" + regID + "' to the Region(s) for Zoom Form - ADD ONLY dropdown and click on Set Values Or Delete the CFAS Code(s): \n" + cfasDataString;
    }  
  //generate consign err
  log.info("generate err")
   var regSetConsign = consignRegMap.keySet();    
   var itrConsign = regSetConsign.iterator();
    while (itrConsign.hasNext()) {    	
    	var cfasDataStr = "";
    	var regIDConsign = itrConsign.next();   
    	log.info(   "regID:"+regIDConsign) 
        var cfasConsignList = consignRegMap.get(regIDConsign);
        for (var i = 0; i < cfasConsignList.size(); i++) {
            var cfasConsign = cfasConsignList.get(i);
            cfasDataStr = cfasDataStr+cfasConsign+",";
        }
        	if(CIStatus == "Y")
                errMsg += "\nPlease InActivate the Regional Status of CFAS Code(s): " + cfasDataStr+" Or add "+regIDConsign+" to the Consignment Organization Code list if needed and click on Set Values.\n";
         if(CIStatus != "Y")
                errMsg += "\nPlease Delete the CFAS Code(s): " + cfasDataStr+" Or add "+regIDConsign+" to the Consignment Organization Code list if needed and click on Set Values.\n";
    }
  }
  return errMsg;
}

function  getRegionDCList(node,activeDCList,inactiveDCList){
    var activeDCList = new java.util.ArrayList();
    var inactiveDCList = new java.util.ArrayList();
    var regionDC = node.getDataContainerByTypeID("Region").getDataContainers().toArray();        
    if (regionDC.length != 0) {
        regionDC.forEach(function(dc) {
            var regionDCObj = dc.getDataContainerObject();
            var regionDCObjID = regionDCObj + "";
            regionDCObjID = regionDCObjID.split(":");
            regionDCObjID = regionDCObjID[1];
            var cfas = regionDCObj.getValue("CFAS_CO_Code").getID();
            var state = regionDCObj.getValue("STATE").getID();
            if (regionDCObj.getValue("Regional_Status").getID() == "ACTIVE") {
                if (state)
	            activeDCList.add(cfas + ";" + state);
	          else
	            activeDCList.add(cfas);
            }
			if (regionDCObj.getValue("Regional_Status").getID() == "INACTIVE") {
                if (state)
	            inactiveDCList.add(cfas + ";" + state);
	          else
	            inactiveDCList.add(cfas);
            }
        });
    }    
    return [activeDCList,inactiveDCList]
}

function checkActiveCodes(node,step,refItem, activeDCList, BPAZoomDataLookUP,CFASCodesList,invalidCFASList,regMap,consignRegMap) {
  var err = "";
  var [CIRegDistList, consignOrgList, apprConsignOrgList] = bpaZoomLib.getRegionsList(node,step);
  var CIStatus = node.getValue("BPA_Processed_In_EBS").getID();
  var material = refItem.getValue("Material_Item_Type").getSimpleValue();
  var status = refItem.getValue("Item_Status_WRLN").getID();
  var childOrgs = refItem.getChildren().toArray();
  for (var p = 0; p < activeDCList.size(); p++) {//ZB;NV
    var reg = BPAZoomDataLookUP.getLookupTableValue("LT_BPA_Wireline_Regions_Data", activeDCList.get(p));
    if (reg != null && ((!apprConsignOrgList.contains(reg) && !consignOrgList.contains(reg) && !CIRegDistList.contains(reg)) ||
    (apprConsignOrgList.contains(reg) && !consignOrgList.contains(reg)))) {//WE2
      var consignkey = "";
      var keyCd ="";
      if (material == "Minor Material" || material == "Cable") {
        childOrgs.forEach(function (child) {
          var childOrgCode = child.getValue("Organization_Code").getID();
          var childConsignInd = child.getValue("Consignment").getID();
          var childStatus = child.getValue("Item_Status_WRLN").getID();
          if (reg == childOrgCode && childConsignInd == "1") {
            childConsignInd = 2;
            consignkey = reg + ";" + childStatus+";"+childConsignInd;//WE2;ActiveNS;1
          }
          if (reg == childOrgCode && childConsignInd != "1") {
            keyCd = reg + ";" + childStatus;
          }
        });
      } else {
        keyCd = reg + ";" + status;
      }
      for (var q = 0; q < CFASCodesList.length; q++) {
        for (key in CFASCodesList[q]) {
          if (consignkey == key) {
           cfasDataList = new java.util.ArrayList();
            var cfasList = CFASCodesList[q][key];
            cfasList.forEach(function (code) {            	
              if (activeDCList.get(p) == code){
              	if (consignRegMap.get(reg)) {
		        cfasDataList = consignRegMap.get(reg);
		        if (!cfasDataList.contains(code))
		            cfasDataList.add(code);
		    } else {
		        cfasDataList.add(code);
		        consignRegMap.put(reg, cfasDataList);
		    }
            //  	if(CIStatus == "Y")
              //  err += "\nPlease take action, either add '" + reg + "' to the Region(s) for Zoom Form - ADD ONLY dropdown and click on Set Values Or InActivate the Regional Status of the below CFAS Code(s): \n" + code;
              //if(CIStatus != "Y")
                //err += "\nPlease take action, either add '" + reg + "' to the Region(s) for Zoom Form - ADD ONLY dropdown and click on Set Values Or Delete the CFAS Code(s): \n" + code;
              }
            });
          }
        }
      }

      for (var s = 0; s < invalidCFASList.length; s++) {
        for (key in invalidCFASList[s]) {
          if (keyCd == key) {
           cfasDataList = new java.util.ArrayList();
            var invalidCfasList = invalidCFASList[s][key];
            invalidCfasList.forEach(function (cd) {
              if (activeDCList.get(p) == cd){
		      if (regMap.get(reg)) {
		        cfasDataList = regMap.get(reg);
		        if (!cfasDataList.contains(cd))
		            cfasDataList.add(cd);
		    } else {
		        
		        cfasDataList.add(cd);
		        regMap.put(reg, cfasDataList);
		    }
              //	if(CIStatus == "Y")
                //err += "\nPlease take action, either add '" + reg + "' to the Region(s) for Zoom Form - ADD ONLY dropdown and click on Set Values Or InActivate the Regional Status of the below CFAS Code(s): \n" + cd;
              //if(CIStatus != "Y")
               // err += "\nPlease take action, either add '" + reg + "' to the Region(s) for Zoom Form - ADD ONLY dropdown and click on Set Values Or Delete the CFAS Code(s): \n" + cd;
              }
            });
          }
        }
      }
    }
  }        
  return [regMap,consignRegMap];
}

function validateCFASCodes(node, refItem, curRegDC, consignOrgList, activeDCList, inactiveDCList, CFASCodesList,CIRegDistList){
var keyCode = "";
var errMsg = "";
var childOrgs = refItem.getChildren().toArray();
var material = refItem.getValue("Material_Item_Type").getSimpleValue();
var CIStatus = node.getValue("BPA_Processed_In_EBS").getID();
if (material == "Minor Material" || material == "Cable") {
  childOrgs.forEach(function (child) {
    var childOrgCode = child.getValue("Organization_Code").getID();
    var childConsignInd = child.getValue("Consignment").getID();
    var childStatus = child.getValue("Item_Status_WRLN").getID();
    //Remove the Consigned Org from the list if Consigned CFAS code is deleted or inactivated
    if (curRegDC == childOrgCode && childConsignInd == "1") {
      keyCode = curRegDC + ";" + childStatus + ";" + childConsignInd;
    }
    //Remove the Non Consigned Org from the list if Non Consigned CFAS code is deleted or inactivated for Minor Material
    if (curRegDC == childOrgCode && childConsignInd != "1" && !((curRegDC == "AK1" || curRegDC == "SE2") && childStatus == "Active S")) {
      keyCode = curRegDC + ";" + childStatus + ";" + 2;
    }
  });
} else { //Remove the Non Consigned Org from the list if Non Consigned CFAS code is deleted or inactivated for Non Minor Material
  var status = refItem.getValue("Item_Status_WRLN").getID();
  keyCode = curRegDC + ";" + status + ";" + 2;
}
var consignErrorCode = "";
for (var i = 0; i < CFASCodesList.length; i++) {
  for (key in CFASCodesList[i]) {
    if (keyCode == key) {
      var cfasList = CFASCodesList[i][key];
      cfasList.forEach(function (code) {
        if (!activeDCList.contains(code) && !inactiveDCList.contains(code)) {
          if (consignOrgList.contains(curRegDC))
            errMsg += "\nPlease take action, either remove " + curRegDC + " from the Consigned Organization List and Region(s) for Zoom Form - ADD ONLY dropdowns Or Click on Set Values to generate the appropriate CFAS Code(s).";
        //  if(CIRegDistList.contains(curRegDC) &&!consignOrgList.contains(curRegDC))
          //  errMsg += "\nPlease take action, either remove " + curRegDC + " from Region(s) for Zoom Form - ADD ONLY dropdowns Or Click on Set Values to generate the appropriate CFAS Code(s).";
        }
        if (!activeDCList.contains(code) && inactiveDCList.contains(code) && CIStatus == "Y") {
          if (consignOrgList.contains(curRegDC))
            errMsg += "\nPlease take action, either remove " + curRegDC + " from the Consigned Organization List and Region(s) for Zoom Form - ADD ONLY dropdowns Or Active the Regional Status of the CFAS Code - " + code + ".";
       //   if(CIRegDistList.contains(curRegDC) &&!consignOrgList.contains(curRegDC))
         //   errMsg += "\nPlease take action, either remove " + curRegDC + " from Region(s) for Zoom Form - ADD ONLY dropdowns Or Active the Regional Status of the CFAS Code - " + code + ".";
        }
      });
    }
  }
}
return errMsg;
}


function getContractItemIDsinBPAWkfMove(node) {
  var itemlist = "";
  var bpaNodeChildren = node.getChildren().toArray();
  bpaNodeChildren.forEach(function(nodeCI) {
     var partClnFlag = nodeCI.getValue("Partial_Clone_Flag").getSimpleValue();
    if (partClnFlag == "Yes") {
    if (nodeCI.isInWorkflow("Create_BPA")) {
      var itemNumber = nodeCI.getValue("Oracle_Item_Num").getSimpleValue();
      itemlist = itemlist + nodeCI.getID() + "(" + itemNumber + "), ";
    }
	}
  })
  return itemlist;
}

function getContractItemIDsinBPAWkfCopy(node) {
  var itemlist = "";
  var bpaNodeChildren = node.getChildren().toArray();
  bpaNodeChildren.forEach(function(nodeCI) {
    var regiontoMove = nodeCI.getValue("CI_Region_Distribution_Center_temp").getSimpleValue();
    if (regiontoMove) {
    if (nodeCI.isInWorkflow("Create_BPA")) {
      var itemNumber = nodeCI.getValue("Oracle_Item_Num").getSimpleValue();
      itemlist = itemlist + nodeCI.getID() + "(" + itemNumber + "), ";
    }
	}
  })
  return itemlist;
  
}

function isReferenceInBPAWF(bpaRef) {
  var errRes = ""
  if (bpaRef.isInWorkflow("Create_BPA") || bpaRef.isInWorkflow("BPA_Clone")) {
    errRes = errRes + "The Target Contract is in the BPA or Clone,Copy or Move Workflow, Please finish the Workflow or select different Contract to proceed. \n\n";
  }
  return errRes;
}

function validateStdPackaging(node) {
    var errorMessage = "";
    var stdPackaging = Number(node.getValue("STD_PACKAGING").getSimpleValue());
    if (stdPackaging <= 0) {
        errorMessage = "\n Standard Packaging should be greater than zero.";
    }
    return errorMessage
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.validateMandatoryAttribute = validateMandatoryAttribute
exports.checkDateIfLessthanToday = checkDateIfLessthanToday
exports.getFourteenDate = getFourteenDate
exports.checkBPAHeaderChildren = checkBPAHeaderChildren
exports.validateBPAHeaderEffectiveDate = validateBPAHeaderEffectiveDate
exports.validateBPAContractManager = validateBPAContractManager
exports.validateBPAExpirationDate = validateBPAExpirationDate
exports.validateBPALegacyContractNumber = validateBPALegacyContractNumber
exports.cloneBPASupplierCheck = cloneBPASupplierCheck
exports.validateDuplicateLegacyContractNumber = validateDuplicateLegacyContractNumber
exports.validateCIUniqueness = validateCIUniqueness
exports.validateConsignOrgCodeData = validateConsignOrgCodeData
exports.validateMandatoryAttribute = validateMandatoryAttribute
exports.validateCIOracleItemNumStatus = validateCIOracleItemNumStatus
exports.validateMinMaxOrderQty = validateMinMaxOrderQty
exports.validateSupplierUOM = validateSupplierUOM
exports.validateContractItemLEPercentage = validateContractItemLEPercentage
exports.validateActiveZoomData = validateActiveZoomData
exports.validateInActiveZoomData = validateInActiveZoomData
exports.validateALLTZoomData = validateALLTZoomData
exports.validateWESTTZoomData = validateWESTTZoomData
exports.validateBlankCFASZoomData = validateBlankCFASZoomData
exports.validateMiscChargeDC = validateMiscChargeDC
exports.validateFuturePriceAndDate = validateFuturePriceAndDate
exports.validateReferencedItemType = validateReferencedItemType
exports.validateDuplicateZoomDataAcrossCI = validateDuplicateZoomDataAcrossCI
exports.validateDuplicateZoomData = validateDuplicateZoomData
exports.checkDupInCurrentCI = checkDupInCurrentCI
exports.getRefCICFASCompCodes = getRefCICFASCompCodes
exports.checkDuplicateCFASDataAcrossCI = checkDuplicateCFASDataAcrossCI
exports.prepareCitemMap = prepareCitemMap
exports.generateErrorMessage = generateErrorMessage
exports.validateClosedCIData = validateClosedCIData
exports.validateCILENtwBOMType = validateCILENtwBOMType
exports.validateContractItemLEPrice = validateContractItemLEPrice
exports.bpaClonePostEnrichValHeader = bpaClonePostEnrichValHeader
exports.validateContractItem = validateContractItem
exports.validateInvalidZoomData = validateInvalidZoomData
exports.getRegionDCList = getRegionDCList
exports.checkActiveCodes = checkActiveCodes
exports.validateCFASCodes = validateCFASCodes
exports.getContractItemIDsinBPAWkfMove = getContractItemIDsinBPAWkfMove
exports.getContractItemIDsinBPAWkfCopy = getContractItemIDsinBPAWkfCopy
exports.isReferenceInBPAWF = isReferenceInBPAWF
exports.validateStdPackaging = validateStdPackaging