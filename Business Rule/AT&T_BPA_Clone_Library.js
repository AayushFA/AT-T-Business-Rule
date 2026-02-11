/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "AT&T_BPA_Clone_Library",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "AT&T_Global_Libraries" ],
  "name" : "AT&T BPA Clone Library",
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
    "libraryId" : "AT&T_Global_Library",
    "libraryAlias" : "globalLib"
  }, {
    "libraryId" : "AT&T_BPA_Validation_Library",
    "libraryAlias" : "bpaValidLib"
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
function createClone(node, manager, log) {
    try {     
        var sourceBPAStatus = node.getValue("BPA_Status").getID();
        if (sourceBPAStatus == "OPEN") {
            var clonedBPAObj = cloneSrcBpa(node, manager);
            var srcBPAChildren = node.getChildren();
            srcBPAChildren.forEach(function(sourceCI){
                var ciStatus = sourceCI.getValue("ContractItem_Status").getID();
                if (ciStatus && ciStatus == "OPEN") {
                    var clonedCI = cloneSrcContractItem(sourceCI, clonedBPAObj, manager);
                    var sourceCIChildren = sourceCI.getChildren();
                    sourceCIChildren.forEach(function(sourceCILE){
                        var cileObjStatus = sourceCILE.getValue("LE_Status");
                        if (cileObjStatus && cileObjStatus.getID() == "ACTIVE") {
                            cloneSrcContractLEChild(sourceCILE, clonedCI, manager); 
                        }
                    });
                }
            });
        }
    } catch (e) {
        log.info(e);
        throw (e);
    }
    return clonedBPAObj;
}

function cloneSrcContractLEChild(sourceCILE, clonedCI, manager) {
    try {
        clonedCILEObj = clonedCI.createProduct(null, "LE_Contract_Item_Child");
        if (clonedCILEObj) {
            var cileItemRef = manager.getReferenceTypeHome().getReferenceTypeByID("LocalExplosion_Item_Reference");
            var srcRefTargetItemList = sourceCILE.queryReferences(cileItemRef).asList(1);
            if (srcRefTargetItemList.size() > 0) {
                var srcRefTargetItem = srcRefTargetItemList.get(0).getTarget();
                clonedCILEObj.createReference(srcRefTargetItem, "LocalExplosion_Item_Reference")
                clonedCILEObj.setName(srcRefTargetItem.getName());            
            }
            clonedCILEObj.getValue("Detail").setLOVValueByID("LEXPLOSION");
            copyAttributeValue(sourceCILE, clonedCILEObj, manager)
        }
    } catch (e) {
        log.info(e);
        throw (e);
    }
    return clonedCILEObj;
}


function cloneSrcBpa(node, manager) {
    try {
       var srcBPAName = node.getName();
       var srcBPANum = node.getValue("Oracle_Contract_Num").getSimpleValue();  
       var  BPARoot = manager.getProductHome().getProductByID(node.getParent().getID());
        if (BPARoot) {
            var clonedBPA = BPARoot.createProduct(null, "BPA");
            if (clonedBPA) {
                clonedBPA.getValue("BPA_Cloned_From").setValue(node.getID());
                node.getValue("BPA_Cloned_Of").addValue(clonedBPA.getID());
                clonedBPA.createReference(node, "BPA_Clone_Reference");
                clonedBPA.getValue("BPA_Status").setValue("Open");
                clonedBPA.setName(srcBPAName);
                node.setName(srcBPANum);             
                copyAttributeValue(node, clonedBPA, manager);
            }
        }
    } catch (e) {
        log.info(e);
        throw (e);
    }
    return clonedBPA;
}

function cloneSrcContractItem(contractItem, parentBPA, manager) { 
    var clonedCI = null;
    var srcRefTargetItemList = null;
    try {
        srcCIId = contractItem.getID();
        srcCIName = contractItem.getName();     
        parentBPAId = parentBPA.getID();
        clonedCI = parentBPA.createProduct(null, "Contract_Item");
        if (clonedCI) {
            var itemRef = manager.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
            srcRefTargetItemList = contractItem.queryReferences(itemRef).asList(1);
            if (srcRefTargetItemList && srcRefTargetItemList.size() > 0) {
                var srcRefTargetItem = srcRefTargetItemList.get(0).getTarget();
                clonedCI.createReference(srcRefTargetItem, "ContractItem_Item")
			  var srcItem_Num=srcRefTargetItem.getValue("Item_Num").getSimpleValue();
                clonedCI.setName(srcItem_Num);
                var supplierUOM = contractItem.getValue("BPA_UOM").getID();                
                clonedCI.getValue("BPA_UOM").setLOVValueByID(supplierUOM);
                var onboardingUomLov = manager.getListOfValuesHome().getListOfValuesByID("LOV_BPA_Oboarding_UOM");
	           var validLovList = onboardingUomLov.getListOfValuesValueByID(supplierUOM);
	           if (validLovList) {
                   clonedCI.getValue("BPA_Onboarding_UOM").setLOVValueByID(supplierUOM);    
	           }
                clonedCI.getValue("Detail").setLOVValueByID("PBREAK");            
            }
           copyDCs(contractItem, clonedCI, manager);
            copyAttributeValue(contractItem, clonedCI, manager);
        }
    } catch (e) {
        log.info(e);
        throw (e);
    }
    return clonedCI;
}

function copyAttributeValue(src, dest, manager) {
    var attrGroup = null;
    var srcObjType = null;
    var destObjType = null;
    var singleValID = null;
    var singleVal = null;
    var mulVal = null;
    const exclude = ["BPA_Status", "Oracle_Contract_Num", "BPA_Supplier", "Supplier_Site", "EBS_BPA_Error_Reason", "EBS_ResponseStatus_BPA", "BPA_Legacy_Contract_No", "FOB_Terms", "Effect_Date", "Contract_Manager", "Freight_Terms", "Payment_Terms", "Expiration_Date", "ContractItem_key", "BPA_Cloned_From", "Local_Explosion_Key", "ZIP_Details", "Servicharge_Detail", "parent_BPA","Price_2","Future_Effective_Date","Parent_Name"];
    try {
        srcObjType = src.getObjectType().getID();
        destObjType = dest.getObjectType().getID();
        if (srcObjType == "Contract_Item" && destObjType == "Contract_Item") {
            attrGroup = manager.getAttributeGroupHome().getAttributeGroupByID("AG_CotractItemAttributes");
        } else if (srcObjType == "BPA" && destObjType == "BPA") {
            attrGroup = manager.getAttributeGroupHome().getAttributeGroupByID("AG_BPA_Header_Attributes");
        } else if (srcObjType == "LE_Contract_Item_Child" && destObjType == "LE_Contract_Item_Child") {
            attrGroup = manager.getAttributeGroupHome().getAttributeGroupByID("AG_LE_Attr");
        }
        if (attrGroup) {
            var Attrs = attrGroup.getAttributes();
            var attrItr = Attrs.iterator();
            while (attrItr.hasNext()) {
                var attr = attrItr.next();
                var attrID = attr.getID();
                if (!exclude.includes(attrID + "")) {
                    if (attr.hasLOV()) {
                        if (attr.isMultiValued()) {
                            mulVal = src.getValue(attrID).getValues();
                            if (mulVal.size() > 0) {
                                for (var i = 0; i < mulVal.size(); i++) {
                                    var valID = mulVal.get(i).getID();
                                    dest.getValue(attrID).append().addLOVValueByID(valID).apply();
                                }
                            }
                        } else {
                            singleValID = src.getValue(attrID).getID();
                            if (singleValID) {
                                dest.getValue(attrID).setLOVValueByID(singleValID);
                            }
                        }
                    } else {
                        if (!attr.isMultiValued()) {
                            singleVal = src.getValue(attrID).getSimpleValue();
                            if (singleVal) {
                                dest.getValue(attrID).setValue(singleVal);
                            }
                        } else {
                            mulVal = src.getValue(attrID).getValues();
                            if (mulVal.size() > 0) {
                                for (var i = 0; i < mulVal.size(); i++) {
                                    singleVal = mulVal.get(i).getSimpleValue();
                                    dest.getValue(attrID).append().addValue(singleVal).apply();
                                }
                            }
                        }

                    }
                }
            }
        }
    } catch (e) {
        log.info(e);
        throw (e);
    }
}

function copyDCs(node, contractItem,step) {
    var existingDCs = node.getDataContainers();
    var existingDCsItr = existingDCs.iterator();
    var dataCon = null;
    var dcID = null;
    while (existingDCsItr.hasNext()) {
        dataCon = existingDCsItr.next();
        dcID = dataCon.getDataContainerType().getID();
        if (dcID == "DC_MiscCharges") {
            var curDCarr = node.getDataContainerByTypeID(dcID).getDataContainers().toArray();
            curDCarr.forEach(function(curDc) {               
                var curDCObj = curDc.getDataContainerObject();
                if (curDCObj.getValue("Scharge_Status")) {
                  
                    var schargeStatus = curDCObj.getValue("Scharge_Status").getID();
                    if(schargeStatus == "ACTIVE") {
                       // var clonedDc = contractItem.getDataContainerByTypeID(dcID).addDataContainer().createDataContainerObject(null);
						//STIBO-1048
						//Creating Misc DC with key
						
						var serviceChargeCode = curDCObj.getValue("Service_Charge_Code").getSimpleValue();
						var DCkey = step.getHome(com.stibo.core.domain.datacontainerkey.keyhome.DataContainerKeyHome).getDataContainerKeyBuilder(dcID)
							.withAttributeValue("Service_Charge_Code", serviceChargeCode)
							.build();
						var clonedDc = contractItem.getDataContainerByTypeID(dcID).addDataContainer().createDataContainerObjectWithKey(DCkey);
                       
                        clonedDc.getValue("Scharge_Status").setLOVValueByID(schargeStatus);

                        if (curDCObj.getValue("Service_Amount")) {
                            var serviceAmount = curDCObj.getValue("Service_Amount").getSimpleValue();
                            clonedDc.getValue("Service_Amount").setSimpleValue(serviceAmount);
                        }
      
                        if (curDCObj.getValue("Flat_Charge_Flag")) {
                            var flatChargeFlag = curDCObj.getValue("Flat_Charge_Flag").getID();
                            clonedDc.getValue("Flat_Charge_Flag").setLOVValueByID(flatChargeFlag);
                        }
        /*
                        if (curDCObj.getValue("Service_Charge_Code")) {
                            var serviceChargeCode = curDCObj.getValue("Service_Charge_Code").getID();
                            clonedDc.getValue("Service_Charge_Code").setLOVValueByID(serviceChargeCode);
                        }*/
                    }                   
                }             
            });
        } else if (dcID == "Region") {
        	var parent = node.getParent();
		var userAction = parent.getValue("BPA_Clone_WF_UserAction").getID();
		log.info("inncheck33");
        	if(userAction=="Clone" || userAction=="Move"){
        		log.info("inncheck34");
        	     var curDCarr = node.getDataContainerByTypeID(dcID).getDataContainers().toArray();
            curDCarr.forEach(function(curDc) {             
                var curDCObj = curDc.getDataContainerObject();
                
                if (curDCObj.getValue("Regional_Status")) {
                    var regionalStatus = curDCObj.getValue("Regional_Status").getID();
                    var CFASCode = curDCObj.getValue("CFAS_CO_Code").getID();
                    if(regionalStatus == "ACTIVE" && CFASCode && CFASCode != "ALLT") {
                        var clonedDc = contractItem.getDataContainerByTypeID(dcID).addDataContainer().createDataContainerObject(null);
                        clonedDc.getValue("Regional_Status").setLOVValueByID(regionalStatus);

                        if (curDCObj.getValue("BPA_Region_Distribution_Center")) {
                            var regionDC = curDCObj.getValue("BPA_Region_Distribution_Center").getID();
                            clonedDc.getValue("BPA_Region_Distribution_Center").setLOVValueByID(regionDC);
                        }

                        if (curDCObj.getValue("STATE")) {
                            var state = curDCObj.getValue("STATE").getID();
                            clonedDc.getValue("STATE").setLOVValueByID(state);
                        }
        
                        if (curDCObj.getValue("ZIP")) {
                            var zip = curDCObj.getValue("ZIP").getID();
                            clonedDc.getValue("ZIP").setLOVValueByID(zip);
                        }
        
                        if (curDCObj.getValue("ZIP_Action")) {
                            var zipAction = curDCObj.getValue("ZIP_Action").getID();
                            clonedDc.getValue("ZIP_Action").setLOVValueByID(zipAction);
                        }

                        if (curDCObj.getValue("CFAS_CO_Code")) {
                            var cfasCode = curDCObj.getValue("CFAS_CO_Code").getID();
                            clonedDc.getValue("CFAS_CO_Code").setLOVValueByID(cfasCode);
                        }
                    }                  
                } 
            });
        	     }
    }
	}
}

function isPartialClone(bpaChildren) {
    var partialFlag = false;
    bpaChildren.forEach(function(item) {
        if (item.getValue("Partial_Clone_Flag").getSimpleValue() == "Yes") {
            partialFlag = true;
        }
    })
    return partialFlag;
}


function clearOffFields(node,bpaRefType){
	node.getValue("BPA_Clone_WF_UserAction").setSimpleValue("");
	node.getValue("BPA_Cloned_From").setSimpleValue("");
	node.getValue("BPA_Partial_Clone_Item_Num_List").setSimpleValue("");
	IDArray_BPA = ['BPA_Clone_WF_UserAction', 'BPA_Cloned_From', 'BPA_Partial_Clone_Item_Num_List'];
	var bpaRefs = node.getReferences(bpaRefType).toArray();
	  if (bpaRefs.length > 0) {
	    bpaRefs.forEach(function (ref) {
	      ref.delete();
	    });
	  }
     lib.partialApproveFields(node, IDArray_BPA);
	var contractItems = node.getChildren().toArray();
	contractItems.forEach(function (child) {
		child.getValue("Partial_Clone_Flag").setSimpleValue("");
		child.getValue("CI_Region_Distribution_Center_temp").setSimpleValue("");
		IDArray_CI = ['Partial_Clone_Flag','CI_Region_Distribution_Center_temp'];
		lib.partialApproveFields(child, IDArray_CI);		
	});			
}

//******************************************COMMON VALIDATION FOR COPY & MOVE *********************************
function checkIfbpaRefInCreateWkflw(node) {
   var errRes = ""
   var bpaTobpa = manager.getReferenceTypeHome().getReferenceTypeByID("BPACopyTrans_ContractToContract");
   var bpaOwn = node.getReferences(bpaTobpa).toArray();
   if (bpaOwn.length > 0) {
      var bpaRef = bpaOwn[0].getTarget();
      if (bpaRef.isInWorkflow("Create_BPA")) {
         errRes = errRes + "Added BPA-Reference is already in the Workflow, please select different Contract to proceed \n"
      }
      var bpaRefChild = bpaRef.getChildren().toArray();
      bpaRefChild.forEach(function(ci) {
         if (ci.isInWorkflow("Create_BPA")) {
            errRes = errRes + "Added BPA-Reference's " + ci.getID() + " is already in the BPA Worklfow, please select different Contract to proceed \n"
         }
      })
   }
   return errRes;
}

function bpaStatusCheck(node) {
   var errorRes = "";
   var bpaStatus = node.getValue("BPA_Status").getSimpleValue();
   if (bpaStatus == "Closed") {
      errorRes = "Added Reference " + bpaRef.getID() + ": " + "status is Closed \n";
   }
   return errorRes;
}

function checkIfSameRefAdded(node) {
   var errRes = ""
   var bpaTobpa = manager.getReferenceTypeHome().getReferenceTypeByID("BPACopyTrans_ContractToContract");
   var bpaOwn = node.getReferences(bpaTobpa).toArray();
   if (bpaOwn.length > 0) {
      var bpaRef = bpaOwn[0].getTarget();
      var bpaRefID = bpaRef.getID();
      var bpaOwnID = node.getID();
      if (bpaRefID == bpaOwnID) {
         errRes = "Added BPA Ref is same as the existing BPA "
      }
   }
   return errRes;
}

 function checkCancelledBPA(node){
	var folderError =""
	if(node.getParent().getID()=="CancelledFolder"){
		folderError = node.getID()+" :Target BPA added is a cancelled BPA , Please make proper selection.\n "
	}
	return folderError 
}


/*COPY VALIDATION TO CHECK IF INVALID REGION IS SELECTED BY USER*/
//Entered region by user is valid or not 
function enterRegion(node,manager) {
  var error = "";
  var activeError = "";
  var child = node.getChildren().toArray();
  child.forEach(function(item) {
    var regionToMove = item.getValue("CI_Region_Distribution_Center_temp").getValues();
    if (regionToMove.size() > 0) {
      log.info("CI: " + item.getID())
      var regionDCList = new java.util.ArrayList();
      var calcCFASDupList = new java.util.ArrayList();
      var childOrgList = new java.util.ArrayList();
      var calcCFASCodes = new java.util.ArrayList();
      var consignOrgsList = new java.util.ArrayList();
      //Get CI's existing Region CFAS Codes List
      var itemNum = item.getValue("Oracle_Item_Num").getValue();
      var refItem = manager.getNodeHome().getObjectByKey("Item.Key", itemNum);
      var refItemStatus = refItem.getValue("Item_Status_WRLN").getID();
      var regionDC = item.getDataContainerByTypeID("Region").getDataContainers().toArray();
      regionDC.forEach(function(dc) {
        var regionDCObj = dc.getDataContainerObject();
        var regionDCObjID = regionDCObj + "";
        regionDCObjID = regionDCObjID.split(":");
        regionDCObjID = regionDCObjID[1];
        if (regionDCObj.getValue("Regional_Status").getID() == "ACTIVE") {
          var cfas = regionDCObj.getValue("CFAS_CO_Code").getID();
          var state = regionDCObj.getValue("STATE").getID();
          var zip = regionDCObj.getValue("ZIP").getID();
          if (state)
            regionDCList.add(cfas + ";" + state);
          else
            regionDCList.add(cfas);
          //regionDupList.add(cfas +zip+ state);
        }
      });
      //Get Child Orgs List on the Item
      var childOrgs = refItem.getChildren().toArray();
      childOrgs.forEach(function(child) {
         var childObjID = child.getObjectType().getID();
        if(childObjID=="Child_Org_Item"){
        var childOrgStatus = child.getValue("Item_Status_WRLN").getID();
        var childOrgCode = child.getValue("Organization_Code").getID();
        if (childOrgStatus == "Active S" || childOrgStatus == "Active NS")
          childOrgList.add(childOrgCode);
        }
      });
      //Get consign Orgs List on the Item
      var consignOrgs = item.getValue("Consign_Org_Code").getValues();
      if (consignOrgs) {
        for (var i = 0; i < consignOrgs.size(); i++) {
          consignOrgsList.add(consignOrgs.get(i).getValue())
        }
      }
      //Check whether the Child Org against entered Region to Move is existing on Item	
      for (var i = 0; i < regionToMove.size(); i++) {
        var activeCounter = 0;
        var regionName = regionToMove.get(i).getID();
        var material = refItem.getValue("Material_Item_Type").getID();
        if ((material == "Minor Material" || material == "Cable") && !childOrgList.contains(regionName) ||
            ((material != "Minor Material" && material != "Cable") && !refItemStatus.startsWith("Act"))) {
          error = error + "The Region to Copy " + regionToMove.get(i).getValue() + " for the Contract Line " + item.getID() + " is incorrect ,please select appropriate  region. \n";
        } else if (((material == "Minor Material" || material == "Cable") && childOrgList.contains(regionName)) ||
          (material != "Minor Material" && material != "Cable")) {
          [calcCFASCodes, calcCFASDupList] = getTargetCFASZoomData(regionName, refItem, childOrgs, consignOrgsList, calcCFASCodes, calcCFASDupList,manager);
          for (var k = 0; k < regionDCList.size(); k++) {
            if (!calcCFASCodes.contains(regionDCList.get(k)))
              activeCounter++;
          }
          if (activeCounter == 0) {
            activeError = "\nAt least one Active Region / CFAS Company code will not be present on the Contract Line - " + item.getID() + " after copying the selected regions.\n";
          }
          error += validateDupZoom(calcCFASDupList, refItem, item, manager);        
        } else {
          //nothing
        }
      }
    }
  });
  return activeError + error;
}

function getTargetCFASZoomData(regionToMove, refItem, childOrgs, consignOrgsList, calcCFASCodes, calcCFASDupList,manager) {
  var material = refItem.getValue("Material_Item_Type").getID();
  var entityObj = manager.getEntityHome().getEntityByID("BPA_Region_DC_Hierarchy");
  var CFASList = entityObj.getValue("BPA_DC_Region_CFAS_Code").getSimpleValue();
  var CFASList = JSON.parse(CFASList);
  var reg = "";
  var zip = null;
  var state = null;
  log.info("material:" + material)
  if (material == "Minor Material" || material == "Cable") {
    childOrgs.forEach(function(child) {
    	 var childObjID = child.getObjectType().getID();
      if(childObjID=="Child_Org_Item"){
      var childOrgStatus = child.getValue("Item_Status_WRLN").getID();
      var childOrgCode = child.getValue("Organization_Code").getID();
      var childConsignInd = child.getValue("Consignment").getID();
      if (childOrgCode == regionToMove) {
        if (childOrgStatus == "Active S" && consignOrgsList.contains(regionToMove))
          reg = regionToMove + ";" + childOrgStatus + ";" + childConsignInd;
        else if (childOrgStatus == "Active S" && !consignOrgsList.contains(regionToMove)) {
          childConsignInd = 2;
          reg = regionToMove + ";" + childOrgStatus + ";" + childConsignInd;
        } else(childOrgStatus == "Active NS")
        reg = regionToMove + ";" + childOrgStatus + ";" + childConsignInd;
      }
      }
    });
  } else {
    var consignInd = 2;
    var status = refItem.getValue("Item_Status_WRLN").getID();
    reg = regionToMove + ";" + status + ";" + consignInd;
  }
  for (var j = 0; j < CFASList.length; j++) {
    for (key in CFASList[j]) {
      if (reg == key) {
        var cfasList = CFASList[j][key];
        cfasList.forEach(function(code) {
          log.info("code: " + code)
          calcCFASCodes.add(code);
          if (code.includes(";")) {
            var codeSplit = code.split(";");
            calcCFASDupList.add(codeSplit[0] + zip + codeSplit[1]);
          } else
            calcCFASDupList.add(code + zip + state);
        });
      }
    }
  }
  return [calcCFASCodes, calcCFASDupList];
}

function validateDupZoom(calcCFASList, refItem, node, step) {
  var citemMap = new java.util.HashMap();
  var dupMap = new java.util.HashMap();
  var errorMsg = "";
  citemMap = bpaValidLib.getRefCICFASCompCodes(node, refItem);
  for (var s = 0; s < calcCFASList.size(); s++) {
    bpaValidLib.checkDuplicateCFASDataAcrossCI(citemMap, dupMap, calcCFASList.get(s)); // Check duplicate CFAS throughout the system							
  }
  var ebsFlag = node.getValue("BPA_Processed_In_EBS").getID();
  if (bpaValidLib.generateErrorMessage(dupMap, ebsFlag, step))
    errorMsg = node.getID() + " Validations: " + errorMsg + bpaValidLib.generateErrorMessage(dupMap, ebsFlag, step);
  return errorMsg;
}


// Check if user is part of WRLN ENGINEERNG or WRLN Sourcing user group 
function wrlnUserCheck(step) {
	var curUser = step.getCurrentUser();
	var grps = curUser.getGroups().toArray();
	var wrlnEngSrcUser = false;
	for (var i = 0; i < grps.length; i++) {
		var userGroup = grps[i].getID();
         log.info("userGroup:"+userGroup);
		if (userGroup == "UG_WRLN_Engineering" || userGroup == "UG_WRLN_Sourcing" || userGroup == "UG_DG" || userGroup == "Super user" || userGroup =="Stibo") {
			wrlnEngSrcUser = true;
		}
	}
	return wrlnEngSrcUser;
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.createClone = createClone
exports.cloneSrcContractLEChild = cloneSrcContractLEChild
exports.cloneSrcBpa = cloneSrcBpa
exports.cloneSrcContractItem = cloneSrcContractItem
exports.copyAttributeValue = copyAttributeValue
exports.copyDCs = copyDCs
exports.isPartialClone = isPartialClone
exports.clearOffFields = clearOffFields
exports.checkIfbpaRefInCreateWkflw = checkIfbpaRefInCreateWkflw
exports.bpaStatusCheck = bpaStatusCheck
exports.checkIfSameRefAdded = checkIfSameRefAdded
exports.checkCancelledBPA = checkCancelledBPA
exports.enterRegion = enterRegion
exports.getTargetCFASZoomData = getTargetCFASZoomData
exports.validateDupZoom = validateDupZoom
exports.wrlnUserCheck = wrlnUserCheck