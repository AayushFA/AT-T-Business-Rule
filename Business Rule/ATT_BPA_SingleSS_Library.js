/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "ATT_BPA_SingleSS_Library",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "AT&T_Global_Libraries" ],
  "name" : "AT&T BPA SingleSS Library",
  "description" : "Functions required for Single smartsheet BPA bulk upload - Create and Update scenarios",
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "bpaLib"
  }, {
    "libraryId" : "AT&T_Global_Library",
    "libraryAlias" : "globalLib"
  }, {
    "libraryId" : "ATT_BPA_Zoom_Library",
    "libraryAlias" : "bpaZoomLib"
  }, {
    "libraryId" : "AT&T_Audit_Library",
    "libraryAlias" : "auditLib"
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
/*
 *  Author - Abiraami, John, Madhuri
 * STIBO-1048
 * Functions required for Single smartsheet BPA bulk upload - Create and Update scenarios
 */

/********************************* Fetch an existing CI object under a Header*****************************************/
function existingObjCheck(node, itemNum, attrID) {
	var existingObjs = node.getChildren().toArray();
	var flag = true;
	var obj = "";
	for (var i = 0; i < existingObjs.length; i++) {
		if (existingObjs[i].getValue(attrID).getSimpleValue() == itemNum) {
			flag = false;
			obj = existingObjs[i];
		}
	}
	return obj;
}

/********************************* Check if Header/CI already processed in EBS downstream ******************************/
function bpaProcessedCheck(node) {
	var bpaProcessedFlag = "";
	if (node.getValue("BPA_Processed_In_EBS").getID() == "Y" || node.getValue("BPA_Processed_In_EBS").getID() == "E") {
		bpaProcessedFlag = true;
	}
	return bpaProcessedFlag;
}

/********************************* Update status and values for existing DC ************************************************/
function updateExistingDC(stagingBPA, ciObj, dcID, step) {
	var flag = false;
	if (dcID == "Region") {
		var uniqueID = "CFAS_CO_Code";
		var dcStatus = "Regional_Status";
		
	} else if (dcID == "DC_MiscCharges") {
		var uniqueID = "Service_Charge_Code";
		var dcStatus = "Scharge_Status";
		var dcServiceAmt = "Service_Amount";
		var dcFlatFlag = "Flat_Charge_Flag";
		var toUpdSerAmt = stagingBPA.getValue(dcServiceAmt).getSimpleValue();
		var toUpdFlag = stagingBPA.getValue(dcFlatFlag).getID();
	}
	var toUpdStatus = stagingBPA.getValue(dcStatus).getID();
	var curDCarr = ciObj.getDataContainerByTypeID(dcID).getDataContainers().toArray();
	curDCarr.forEach(function(curDc) {
		var curDCObj = curDc.getDataContainerObject();
		if (curDCObj.getValue(uniqueID)) {
			if(uniqueID == "Service_Charge_Code"){
				var existingCode = curDCObj.getValue(uniqueID).getID();
				var toLoadCode = stagingBPA.getValue(uniqueID).getLOVValue();
				if(toLoadCode)
			       toLoadCode = toLoadCode.getID()
			}
			if(uniqueID == "CFAS_CO_Code"){
				var existingCFASCode = curDCObj.getValue(uniqueID).getID();
				var existingState = curDCObj.getValue("STATE").getID();
				var existingZip = curDCObj.getValue("ZIP").getID();
				var existingCode = existingCFASCode+","+existingState+","+existingZip;
				var stgCFASCode = stagingBPA.getValue(uniqueID).getLOVValue();
				if(stgCFASCode)
				   stgCFASCode = stgCFASCode.getID();
				var stgState = stagingBPA.getValue("STATE").getLOVValue();
				if(stgState)
				   stgState = stgState.getID();
				var stgZip = stagingBPA.getValue("ZIP").getLOVValue();
				if(stgZip)
				    stgZip = stgZip.getID();
				var toLoadCode = stgCFASCode+","+stgState+","+stgZip
			}			
			if (existingCode == toLoadCode) {
				if (toUpdStatus) {
					curDCObj.getValue(dcStatus).setLOVValueByID(toUpdStatus);
				}
				if (dcID = "DC_MiscCharges") {
					if (toUpdSerAmt) {
						curDCObj.getValue(dcServiceAmt).setSimpleValue(toUpdSerAmt);
					}
					if (toUpdFlag) {
						curDCObj.getValue(dcFlatFlag).setLOVValueByID(toUpdFlag);
					}
				}
				flag = true;
			}
		}
	});
	return flag;
}

/********************************* New CI creation ****************************************************************/
function ciCreation(bpaHeaderObj, stagingBPA, pitem, ciGrp, ciSSGrp, dateAttr, step,contractItemReference,aslLib) {

	var existingCIObjs = bpaHeaderObj.getChildren().toArray();

	var itemNum = stagingBPA.getValue("Item_No_Refrenced_To_CI").getSimpleValue();
	var ciObj = "";
	var itemRefErr = "";
	var flag = true;
	// Check for existing CI object under Header
	for (var i = 0; i < existingCIObjs.length; i++) {
		curCIObj = existingCIObjs[i];
		var curCIItemNum = existingCIObjs[i].getValue("Oracle_Item_Num").getSimpleValue()
		var curCIStatus = existingCIObjs[i].getValue("BPA_Processed_In_EBS").getLOVValue();
		if(curCIStatus)
		   curCIStatus = curCIStatus.getID();
		var SSFlag = existingCIObjs[i].getValue("SS_Creation").getSimpleValue();
		var WFFlag = existingCIObjs[i].isInWorkflow("Create_BPA");
		if (curCIItemNum == itemNum && SSFlag != "Yes" && (curCIStatus == "E" || curCIStatus == "Y" || WFFlag)) {
			flag = false;
			itemRefErr = "\n Same MST item is already linked with another Contract item under same Header. Please link different MST Item.";
		}
		if (curCIItemNum == itemNum && SSFlag == "Yes") {
			flag = false;
			ciObj = existingCIObjs[i];
			var regionDCGrp = step.getAttributeGroupHome().getAttributeGroupByID("AG_DC_Region_Attr");
			var miscDCGrp = step.getAttributeGroupHome().getAttributeGroupByID("AG_DC_MisC_Attr");
			
			var ciRegDistCenter = stagingBPA.getValue("CI_Region_Distribution_Center").getValues();
			if (ciRegDistCenter.size() > 0) {
				for (var j = 0; j < ciRegDistCenter.size(); j++) {
					if (ciObj.getValue("CI_Region_Distribution_Center").getValues().size() > 0) {
						if (!ciObj.getValue("CI_Region_Distribution_Center").getSimpleValue().contains(ciRegDistCenter.get(j).getSimpleValue())) {
							var valID = ciRegDistCenter.get(j).getID();
							ciObj.getValue("CI_Region_Distribution_Center").append().addLOVValueByID(valID).apply();
						}
					}
				}
			}
		}

	}
	if (flag) {
		ciObj = bpaHeaderObj.createProduct(null, "Contract_Item");
		ciObj.getValue("SS_Creation").setSimpleValue("Yes");
		aslLib.setConsignOrg(ciObj,step,contractItemReference); //Set CI consign org codes from consigned child orgs
		populateAttributes(stagingBPA, ciObj, ciGrp, step);
		populateAttributes(stagingBPA, ciObj, ciSSGrp, step);
		itemRefErr = executeCI(ciObj, step); // Set item reference 
		auditLib.setDateTime(ciObj, dateAttr);
		if (!itemRefErr) {			
			populateAttributes(stagingBPA, ciObj, ciGrp, step);
		}
	}
	return [ciObj, itemRefErr];

}

/********************************* New CILE creation ***********************************************************/
function cileCreation(ciObj, stagingBPA, cileGrp, cileSSGrp, dateAttr, step) {
	var err = "";
	var keyErr = "";
	var cileObj = ciObj.createProduct(null, "LE_Contract_Item_Child");
	var lob = ciObj.getParent().getValue("Legacy_Source").getID(); 
	auditLib.setDateTime(cileObj, dateAttr);
	populateAttributes(stagingBPA, cileObj, cileGrp, step);
	populateAttributes(stagingBPA, cileObj, cileSSGrp, step);
	bpaLib.setLEDefaultValues(cileObj);	
	
	err += bpaLib.CILEValidations(cileObj, lob, step);
	if(!err){
		keyErr = bpaLib.leKeyGeneration(cileObj, step);
		if (keyErr) {
			cileObj.delete();			
		} else {
			cileObj.getValue("LE_Status").setLOVValueByID("ACTIVE");							
		}	
		return keyErr;	
	}
	else{
		return err;
	}
}

/********************************* Update values for an existing CILE ****************************************/
function cileUpdate(stagingBPA, ciObj, cileGrp, cileSSGrp, dateAttr, step) {
	var errMsg = "";
	var wf = ciObj.getWorkflowInstanceByID("Create_BPA");
	var ciStatus = ciObj.getValue("ContractItem_Status").getSimpleValue();
	if (wf)
		var BPAWFPublishQueueState = wf.getTaskByID("Publish_to_EBSQueue")
	if (BPAWFPublishQueueState) {
		errMsg += "\nCILE cannot be processed as the Contract Item is in Publish Q";
	}
	if (ciStatus == "CLOSED")
		errMsg += "\n LE Child is not processed as Contract Item is Closed";
	if (!errMsg) {
		var leKey = ""
		var bpaNum = stagingBPA.getValue("Oracle_Contract_Num").getSimpleValue();
		var ciNum = stagingBPA.getValue("Item_No_Refrenced_To_CI").getSimpleValue();
		var cileNum = stagingBPA.getValue("Item_No_Referenced_to_CILE").getSimpleValue();
		var cileName = stagingBPA.getValue("LE_Name").getID();
		var cileObj = "";
		if (cileNum) {
			leKey = bpaNum + "_" + ciNum + "_" + cileNum;
		} else if (cileName) {
			leKey = bpaNum + "_" + ciNum + "_" + cileName;
		}
		cileObj = step.getNodeHome().getObjectByKey("BPA.Local.Explosion.Key", leKey);
		if (cileObj) {
			var lob = ciObj.getParent().getValue("Legacy_Source").getID(); 
			errMsg += bpaLib.CILEValidations(cileObj, lob, step);
			if(!errMsg){
				populateAttributes(stagingBPA, cileObj, cileGrp, step);
				auditLib.setDateTime(cileObj, dateAttr);
			}
		} else {
			errMsg += cileCreation(ciObj, stagingBPA, cileGrp, cileSSGrp, dateAttr, step);
		}
	}
	return errMsg;
}

/********************************* Update values for an existing CI *********************************************/
function ciUpdate(node, ciObj, ciGrp, dateAttr, itemLOB, pitem, step) {
	var ciUpdateErr = "";
	var itemStatus = pitem.getValue("Item_Status").getSimpleValue() + "";
	var itemNo = ciObj.getValue("Oracle_Item_Num").getSimpleValue();	

	var wfInstance = ciObj.getWorkflowInstanceByID("Create_BPA");
	if (wfInstance) {
		var BPAWFPublishQueueState = wfInstance.getTaskByID("Publish_to_EBSQueue")
		if (BPAWFPublishQueueState ) {			
			ciUpdateErr += "CI cannot be processed as the Contract Item is in Publish Q";			
		}
	}

	if (itemLOB == "RTL") {
		if (!itemStatus.startsWith("Act") && itemStatus != "Pre Launch" && itemStatus != "No Buy" && itemStatus != "DSL COL") {
			ciUpdateErr += "\nThe chosen item " + itemNo + " is not in Active state";
		}
	} else if (itemLOB == "WRLN") {
		if (!itemStatus.startsWith("Act")) {
			ciUpdateErr += "\nThe chosen item " + itemNo + " is not in Active state";
		}
	} else if (itemLOB == "ENT") {
		if (!itemStatus.startsWith("Act") && itemStatus != "Pre Launch" && itemStatus != "No Buy" && itemStatus != "DSL COL") {
			ciUpdateErr += "\nThe chosen item " + itemNo + " is not in Active state";
		}
	}	
	//Update contract item only if CI is open or eligible to reopen
	if ((ciObj.getValue("BPA_Processed_In_EBS").getID() == "E" && node.getValue("ContractItem_Status").getID() == "OPEN") || ciObj.getValue("BPA_Processed_In_EBS").getID() == "Y") {
		// Update Supplier UOM only if Line is closed and reopened again
		if (ciObj.getValue("BPA_Processed_In_EBS").getID() != "E" && ciObj.getValue("BPA_Onboarding_UOM").getID() != node.getValue("BPA_Onboarding_UOM").getID() && node.getValue("BPA_Onboarding_UOM").getID()) {
			ciUpdateErr += "\n Supplier UOM cannot be updated for Open Line. Please close the line and publish to EBS. After successful update, reopen the line to update Supplier UOM"
		} else {
			if (!ciUpdateErr) {
				if (!ciObj.isInWorkflow("Create_BPA")) {
					ciObj.startWorkflowByID("Create_BPA", "Initiated to workflow- Item update through Singlesmartsheet");
				}				
				ciObj.getValue("SS_Creation").setSimpleValue("Yes");
				populateAttributes(node, ciObj, ciGrp, step);
				if (itemLOB == "RTL") {
					bpaLib.clearRTLAttributes(ciObj); // STIBO-2335 Prod Support July release
				}
				auditLib.setDateTime(ciObj, dateAttr);
			}
		}
	} else {
		ciUpdateErr += "\n Could not process line-item changes as line-item Status is Closed please change line-item status and resubmit or disregard change.";
	}
	return ciUpdateErr;
}

/********************************* Update status and values for existing DC ****************************************/
function headerCheck(node, stagingBPA) {

	var err = "";
	var headerClosed = "";
	var ciClosed = "";
	
		var WFInstance = node.getWorkflowInstanceByID("Create_BPA");	
		if (WFInstance) {
			var task = WFInstance.getTaskByID("Publish_to_EBSQueue");
			if (task){
				err = "\n Could not process line-item changes as BPA Contract Status is in Publish Q State";
			}			
	  }
	// Check Header Status
	var bpaStatus = node.getValue("BPA_Status").getSimpleValue();
	if (bpaStatus) {
		if (bpaStatus != "Open") {
			err = "\n Could not process line-item changes as BPA Contract Status is Closed, please change BPA status and resubmit or disregard change.";
		}
	} else {
		err = "\n Could not process line-item changes as BPA Contract Status is Closed, please change BPA status and resubmit or disregard change.";
	}
	
	var expDate = node.getValue("Expiration_Date").getSimpleValue();
	if (expDate) {
		var isBPAExpired = bpaLib.checkDateIfLessthanToday(expDate);
		if (isBPAExpired) {
			if (stagingBPA.getValue("BPA_Status").getID() == "CLOSED") {
				if (!node.isInWorkflow("Create_BPA")) {
					node.startWorkflowByID("Create_BPA", "Initiated to workflow- Item updated through Singlesmartsheet");
				}
				node.getValue("BPA_Status").setLOVValueByID("CLOSED");
				headerClosed = true;
			} else if (stagingBPA.getValue("ContractItem_Status").getID() == "CLOSED") {
				ciClosed = true;
			} else {
				err += "\n Could not process line-item changes as BPA has Expired, please extend expiration date according to S2C legal agreement then resubmit or disregard change.";
			}
		}else{
			if (stagingBPA.getValue("BPA_Status").getID() == "CLOSED") {
				if (!node.isInWorkflow("Create_BPA")) {
					node.startWorkflowByID("Create_BPA", "Initiated to workflow- Item updated through Singlesmartsheet");
				}
			}
		}
	}
	return [err, headerClosed, ciClosed];
}

//To check if any header attribute value is provided in Smartsheet
function headerUpdateCheck(node) {
	var flag = false;
	var headerAttrs = ["BPA_Description", "BPA_Status", "Expiration_Date", "BPA_Contract_Manager"];
	headerAttrs.forEach(function(attrID) {
		attrValue = node.getValue(attrID).getSimpleValue();
		if (attrValue) {
			flag = true;
		}
	});
	return flag;
}

//To check if any mandatory attribute value is provided in create Smartsheet
function mandatoryCIAttrCheck(node, step) {
	var error = "";
	var headerAttrs = ["Supplier_Item", "Item_Type", "Price", "Lead_Time"];
	headerAttrs.forEach(function(attrID) {
		attrValue = node.getValue(attrID).getSimpleValue();
		attrObj = step.getAttributeHome().getAttributeByID(attrID);
		if (!attrValue) {
			error = error + "\nCould not process line-item changes as " + attrObj.getName() + " is required field please review and resubmit"
		}
	});
	return error;
}

//To check if any CI and CILE attribute value is provided in Smartsheet
function isCIandCILEValueProvided(node, step) {
	var flag = false;
	var ciCILEgrp = step.getAttributeGroupHome().getAttributeGroupByID("AG_BPA_SmartSheet_CI_CILE");
	var attrs = ciCILEgrp.getAttributes().toArray();
	var attrID = "";
	for (var i = 0; i < attrs.length; i++) {
		attrID = attrs[i].getID();
		var attrValue = node.getValue(attrID).getSimpleValue();
		if (attrValue) {
			flag = true;
		}
	}
	return flag;
}

function checkCiCloseStatus(node, step) {
	var flag = false;
	var ciCILEgrp = step.getAttributeGroupHome().getAttributeGroupByID("AG_BPA_SS_Close_Status_Check");
	var attrs = ciCILEgrp.getAttributes().toArray();
	var attrID = "";
	for (var i = 0; i < attrs.length; i++) {
		attrID = attrs[i].getID();
		var attrValue = node.getValue(attrID).getSimpleValue();
		if (attrValue) {
			flag = true;
		}
	}
	return flag;
}

function checkSSCiCloseStatus(node, step) {
	var flag = false;
	var ciCILEgrp = step.getAttributeGroupHome().getAttributeGroupByID("AG_BPA_SS_CIClose_Status_Check");
	var attrs = ciCILEgrp.getAttributes().toArray();
	var attrID = "";
	for (var i = 0; i < attrs.length; i++) {
		attrID = attrs[i].getID();
		var attrValue = node.getValue(attrID).getSimpleValue();
		if (attrValue) {
			flag = true;
		}
	}
	return flag;
}

function trimSpaces(node, step) {
	var trimGrp = step.getAttributeGroupHome().getAttributeGroupByID("AG_TrimTextAttributes");
	var attrs = trimGrp.getAttributes().toArray();
	var attrID = ""
	for (var i = 0; i < attrs.length; i++) {
		attrID = attrs[i].getID();
		logger.info("Trim Attr:" + attrID)
		globalLib.trimSpacesandNewLines(node, attrID);
		logger.info("Trim Attr value:" + node.getValue(attrID).getSimpleValue())
	}
}

function populateAttributes(srcObj, targetObj, attrGrp, step) {
	var attrs = attrGrp.getAttributes().toArray();
	var attrID = "";
	for (var i = 0; i < attrs.length; i++) {
		if (!attrs[i].isDerived()) {
			attrID = attrs[i].getID();
			var attrValue = srcObj.getValue(attrID).getSimpleValue();
			if (attrValue) {
				try {
					targetObj.getValue(attrID).setSimpleValue(attrValue);
				} catch (e) {
					logger.info("Error occurred in setting value for :" + attrID);
				}
			}
		}
	}
}

function createRegionDC(node, ciObj, pitem, step) {
	var CFASCode = node.getValue("CFAS_CO_Code").getSimpleValue();
	var zip = node.getValue("ZIP").getSimpleValue();
	var state = node.getValue("STATE").getSimpleValue();
	var region = node.getValue("BPA_Region_Distribution_Center").getID();
	var bpaProccessed = bpaProcessedCheck(ciObj);
	var errDC = "";
	if (CFASCode) {
		if (bpaProccessed) {
			errDC = bpaZoomLib.addRegionDC(ciObj, step, pitem, CFASCode, zip, state, "INCLUDE", "ACTIVE", region);
		} else {
			bpaZoomLib.addRegionDCNewCI(ciObj, step, CFASCode, zip, state, "INCLUDE", "ACTIVE", region);
		}
	}
	return errDC;
}

function createMiscDC(node, ciObj, miscDCGrp, step) {
	var error = "";
	var serviceChargeCode = node.getValue("Service_Charge_Code").getSimpleValue();
	if (serviceChargeCode) {		
		var DCkey = step.getHome(com.stibo.core.domain.datacontainerkey.keyhome.DataContainerKeyHome).getDataContainerKeyBuilder("DC_MiscCharges")
			.withAttributeValue("Service_Charge_Code", serviceChargeCode)
			.build();
		var miscDCObj = ciObj.getDataContainerByTypeID("DC_MiscCharges").addDataContainer().createDataContainerObjectWithKey(DCkey);
		populateAttributes(node, miscDCObj, miscDCGrp, step);
		miscDCObj.getValue("Scharge_Status").setLOVValueByID("ACTIVE");
	} else {
		var serviceAmount = node.getValue("Service_Amount").getSimpleValue();
		var flatChargeFlag = node.getValue("Flat_Charge_Flag").getSimpleValue();
		if (serviceAmount || flatChargeFlag)
			error = "Could not process line-item changes due to dependency rule, anytime Service Charge/Service Amount/Flat charge is populated all are required, please review, correct, and resubmit.\n"
	}
	return error;
}

//Duplicate check for Miscellaneous DC creation
function miscDCCheck(stagingBPA, ciObj) {
	var dcID = "DC_MiscCharges";
	var flag = false;
	var curDCarr = ciObj.getDataContainerByTypeID(dcID).getDataContainers().toArray();
	curDCarr.forEach(function(curDc) {
		var curDCObj = curDc.getDataContainerObject();
		if (curDCObj.getValue("Service_Charge_Code")) {
			var schargeCode = curDCObj.getValue("Service_Charge_Code").getID();			
			var schargeCodeStg = stagingBPA.getValue("Service_Charge_Code").getLOVValue();
			if(schargeCodeStg)
			   schargeCodeStg = schargeCodeStg.getID();
			if (schargeCode == schargeCodeStg) {
				flag = true;
			}
		}
	});
	return flag;
}

function executeCI(currentNode, step) {
	var wfBPAcreate = step.getWorkflowHome().getWorkflowByID("Create_BPA");
	var objectType = currentNode.getObjectType().getID();
	lob = currentNode.getValue("Legacy_Source").getID();
	var err = "";
	if (objectType == 'Contract_Item') {
		item_No = currentNode.getValue("Item_No_Refrenced_To_CI").getSimpleValue();
		if (item_No)
			var obj = step.getNodeHome().getObjectByKey("Item.Key", item_No);
		if (lob == "RTL") {
			err = smartSheetRTL(currentNode, lob, obj, item_No, step);
		} else {
			err = smartSheetWRLN_ENT(currentNode, lob, obj, item_No, step);
		}
		return err;
	}
	if (objectType == 'LE_Contract_Item_Child') {
		bpaLib.setLEDefaultValues(currentNode);
		if (currentNode.getValue("BPA_Processed_In_EBS").getID() != "Y")
			bpaLib.leKeyGeneration(currentNode, step)
	}
	return err;
}

function smartSheetRTL(currentNode, lob, obj, item_No, step) {
	var Item_status = null;
	var item_LOB = null;
	var itemRef = step.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item")
	if (lob == "RTL") {
		if (obj) {
			item_LOB = obj.getValue("Line_Of_Business").getID();
			Item_status = obj.getValue("Item_Status").getID();
			bpaLib.clearRTLAttributes(currentNode); // STIBO-2335 Prod Support July release
			if (item_LOB == "RTL") {
				if (Item_status.startsWith("Act") || Item_status == "Pre Launch" || Item_status == "No Buy" || Item_status == "DSL COL") {
					currentNode.createReference(obj, itemRef);
					bpaLib.copyAttributes(currentNode, obj, step);
					return "";
				} else {
					return ("The chosen item " + item_No + " is not in Active state");
				}
			} else {
				return ("The chosen item " + item_No + " is not type of Retail MST Item");
			}
		} else {
			return ("The chosen item " + item_No + " is not present");
		}
	}
}
// Check if user is part of WRLN ENGINEERNG user group 
function wrlnUserCheck(step) {
	var curUser = step.getCurrentUser();
	var grps = curUser.getGroups().toArray();
	var wrlnEng = "";
	var wrlnSrc = "";
	var wrlnEngUser = "";
	for (var i = 0; i < grps.length; i++) {
		if (grps[i].getID() == "UG_WRLN_Engineering") {
			wrlnEng = true;
		}
		//STIBO-2529
		if (grps[i].getID() == "UG_WRLN_Sourcing") {
			wrlnSrc = true;
		}
	}
	wrlnEngUser = wrlnEng && !wrlnSrc; //STIBO-2529
	return wrlnEngUser;
}

function smartSheetWRLN_ENT(currentNode, lob, obj, item_No, step) {
	var Parent_Item = step.getAttributeHome().getAttributeByID("Parent_Item");
	var itemRef = step.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
	var item_LOB = null;

	var wrlnEngUser = wrlnUserCheck(step);

	if (obj) {
		item_LOB = obj.getValue("Line_Of_Business").getID();
		Item_status = obj.getValue("Item_Status").getID();
		var itemType = obj.getParent().getID();
		// STIBO-1432 PRod support July release
		if (wrlnEngUser && obj.getValue("NTW_BOM_Type").getID() != "LOCAL EXPLOSION") {
			return "The item you are attempting to add is not defined as a Local Explosion. Please review item set and/or work with the sourcing manger in order to add to BPA (Blanket Purchase Agreement).";
		}
		// STIBO-1432 PRod support July release
		// STIBO-2335 Prod Support July release
		var err = "";
		var flag = true;
		if(lob =="DTV" && itemType != "SATELLITE"){
			err+= "\nIf Business source of the BPA is DTV, Contract Item " + currentNode.getID() + " can be linked with only DTV Entertainment MST items \n";
		     flag = false;
		}
		if (item_LOB == "ENT" || item_LOB == "WRLN") {
			var mandCheckAttrENT = ["Non_Process_Flag", "STD_PACKAGING"];
			for (var i = 0; i < mandCheckAttrENT.length; i++) {
				if (!currentNode.getValue(mandCheckAttrENT[i]).getSimpleValue()) {
					err += "\n" + step.getAttributeHome().getAttributeByID(mandCheckAttrENT[i]).getName() + "  is mandatory for Wireline/Entertainment";
					flag = false;
				}
			}
		}
		if (flag == false) {
			return err;
		}
		if (item_LOB == "WRLN") {
			if (Item_status.startsWith("Act")) {
				currentNode.createReference(obj, itemRef);
				bpaLib.copyAttributes(currentNode, obj, step);
				return "";
			} else {
				return ("The chosen item " + item_No + " is not in Active state");
			}
		} else if (item_LOB == "ENT") {
			if (Item_status.startsWith("Act") || Item_status == "Pre Launch" || Item_status == "No Buy" || Item_status == "DSL COL") {
				currentNode.createReference(obj, itemRef);
				bpaLib.copyAttributes(currentNode, obj, step);
				return "";
			} else {
				return ("The chosen item " + item_No + " is not in Active state");
			}
		} else {
			return ("The chosen item " + item_No + " is not type of Wireline or Entertainment MST Item");
		}
	} else {
		return ("The chosen item " + item_No + " is not present");
	}
}

function zoomDataCheck(node, stagingBPA, refItem, BPAZoomDataLookUP, step, parent) {
	var zoomError = "";
	var zoomInfo = "";
	var flag = false;

	var approvedDC = new java.util.ArrayList();
	var cItemRegDistCenter = node.getValue("CI_Region_Distribution_Center").getValues();

	var CIRegDistList = new java.util.ArrayList();
	for (var i = 0; i < cItemRegDistCenter.size(); i++) {
		CIRegDistList.add(cItemRegDistCenter.get(i).getID());
	}
	var approvedManager = step.executeInWorkspace("Approved", function(stepApr) {
		return stepApr;
	});
	var approvedNode = approvedManager.getProductHome().getProductByID(node.getID()); 
	if (approvedNode) {
		var approvedRevisions = approvedNode.getRevisions().toArray();
		if (approvedRevisions.length > 0) {
			var latestRevision = approvedRevisions[0].getNode().getRevision().getName();
			if (approvedRevisions[0].getNode().getDataContainerByTypeID("Region").getDataContainers().size() > 0) {

				var approvedRevisionRegionDCItr = approvedRevisions[0].getNode().getDataContainerByTypeID("Region").getDataContainers().iterator();
				while (approvedRevisionRegionDCItr.hasNext()) {
					var approvedRevisionRegionDcObj = approvedRevisionRegionDCItr.next().getDataContainerObject();
					var regionDistributionCenter = approvedRevisionRegionDcObj.getValue("BPA_Region_Distribution_Center").getID();
					approvedDC.add(regionDistributionCenter);
				}
			}
		}
	}
	if (node.getDataContainerByTypeID("Region").getDataContainers().toArray().length != 0) {
		var regionDCsItr = node.getDataContainerByTypeID("Region").getDataContainers().iterator();
		while (regionDCsItr.hasNext()) {
			var regDcObj = regionDCsItr.next().getDataContainerObject();
			var regionID = regDcObj.getValue("BPA_Region_Distribution_Center").getID();
			if (!approvedDC.contains(regionID)) {						
				if (CIRegDistList.contains(regionID)) {
					flag = true
					break;
				}
			}
		}
	}
	if (!flag)
		[zoomError,ZoomInfo] = bpaZoomLib.zoomDataPopulate(node, refItem, BPAZoomDataLookUP, step, parent);   
	return [zoomError,ZoomInfo]
}

function checkExpDateGreaterThanToday(node, step) {
	var error = ""
	var approvedExpiriationDate = null
	var mainExpiriationDate = node.getValue("Expiration_Date").getSimpleValue();
	var apprManager = step.executeInWorkspace("Approved", function(step) {
		return step;
	});
	var apprnode = apprManager.getProductHome().getProductByID(node.getID());
	if (apprnode != null) {
		approvedExpiriationDate = apprnode.getValue("Expiration_Date").getSimpleValue();
	}
	if ((node.getValue("BPA_Status").getSimpleValue() == "Open")) {
		if (approvedExpiriationDate != null) {
			if (bpaLib.checkDateIfLessthanToday(approvedExpiriationDate)) {
				error = "Could not process line-item changes as BPA has Expired, please extend expiration date according to S2C legal agreement then resubmit or disregard change.";
			} else if ((approvedExpiriationDate != mainExpiriationDate) && (bpaLib.checkDateIfLessthanToday(mainExpiriationDate))) {
				error = "BPA expiration date can't be less than today's date";
			}
		} else {
			if (bpaLib.checkDateIfLessthanToday(mainExpiriationDate)) {
				error = "BPA expiration date can't be less than today's date";
			}
		}
	}
	return error
}

function updateKeysForCIAndCILEs(contractItem) {
	var contractItemKey = contractItem.getValue("ContractItem_key").getSimpleValue();
	var oracleItemNumber = contractItem.getValue("Oracle_Item_Num").getSimpleValue();
	var oracleContractNumber = contractItem.getValue("Oracle_Contract_Num").getSimpleValue();
	if (contractItemKey == null && oracleContractNumber != null) {
		if (oracleItemNumber) {			
			contractItem.getValue("ContractItem_key").setSimpleValue(oracleContractNumber + "_" + oracleItemNumber);
			log.info("BPA_CI_KG: Updated key for : " + oracleContractNumber + " : " + oracleItemNumber);
		}
	}
	// Changes made for STIBO-1555
	var leChildren = contractItem.getChildren();
	if (leChildren.size() > 0) {
		for (var i = 0; i < leChildren.size(); i++) {
			var childCILE = leChildren.get(i);
			var leObjectType = childCILE.getObjectType().getID();
			if (leObjectType == 'LE_Contract_Item_Child') {
				BPALib.leKeyGeneration(childCILE, step);
			}
		}
	}
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.existingObjCheck = existingObjCheck
exports.bpaProcessedCheck = bpaProcessedCheck
exports.updateExistingDC = updateExistingDC
exports.ciCreation = ciCreation
exports.cileCreation = cileCreation
exports.cileUpdate = cileUpdate
exports.ciUpdate = ciUpdate
exports.headerCheck = headerCheck
exports.headerUpdateCheck = headerUpdateCheck
exports.mandatoryCIAttrCheck = mandatoryCIAttrCheck
exports.isCIandCILEValueProvided = isCIandCILEValueProvided
exports.checkCiCloseStatus = checkCiCloseStatus
exports.checkSSCiCloseStatus = checkSSCiCloseStatus
exports.trimSpaces = trimSpaces
exports.populateAttributes = populateAttributes
exports.createRegionDC = createRegionDC
exports.createMiscDC = createMiscDC
exports.miscDCCheck = miscDCCheck
exports.executeCI = executeCI
exports.smartSheetRTL = smartSheetRTL
exports.wrlnUserCheck = wrlnUserCheck
exports.smartSheetWRLN_ENT = smartSheetWRLN_ENT
exports.zoomDataCheck = zoomDataCheck
exports.checkExpDateGreaterThanToday = checkExpDateGreaterThanToday
exports.updateKeysForCIAndCILEs = updateKeysForCIAndCILEs