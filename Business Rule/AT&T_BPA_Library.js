/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "AT&T_BPA_Library",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "AT&T_Global_Libraries" ],
  "name" : "AT&T BPA Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Validation_Library",
    "libraryAlias" : "validationLib"
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
/**
 * @author - Piyal [CTS], Madhuri [CTS], John [CTS]
 * BPA Library
 */

function removeFromworkflow(node, step) {
	var wfBPACreate = step.getWorkflowHome().getWorkflowByID("Create_BPA");
	var BPAcreatWFinstance = node.getWorkflowInstance(wfBPACreate);
	if (BPAcreatWFinstance) {
		BPAcreatWFinstance.delete("Created through Cloned BPA process .Hence removed from BPA Creation workflow");
	}
}

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

function isUOMConversionRequired(node, sb, itemRef, pbomRef, query, step, log) {
	var objectType = node.getObjectType().getID();
	var conversionRate = null;
	var itemRefItem = null;
	var ciItem = null;
	var item = null;
	var pbomRefItem = null;
	var attNo = null;
	var querySpecification = null;
	var c = com.stibo.query.condition.Conditions;
	var queryResult = null;
	var conversionRequired = false;
	var otherConversionRate = null;
	var toUOM = null;
	var othertoUOM = null;
	var queryResult;
	var oracleItemNo = null;
	var error = false;
	var objectSB = new java.lang.StringBuffer();

	if (objectType == 'Contract_Item') {
		conversionRate = node.getValue("conversion_rate").getSimpleValue();
		toUOM = node.getValue("to_uom").getSimpleValue();
		itemRefItem = getItemReferenceTarget(node, itemRef);
		pbomRefItem = getPbomReferenceTarget(node, pbomRef);
		oracleItemNo = node.getValue("Oracle_Item_Num").getSimpleValue
		if (itemRefItem) {

			item = itemRefItem;
			attNo = item.getValue("Item_Num").getSimpleValue();
			if (attNo != null) {
				querySpecification = query.queryFor(com.stibo.core.domain.Product).where(
					c.valueOf(step.getAttributeHome().getAttributeByID("Oracle_Item_Num")).eq(attNo).and(c.objectType(node.getObjectType()))
				);
				queryResult = querySpecification.execute().asList(1000);
			}

			if (queryResult != null && queryResult.size() > 0) {

				for (var i = 0; i < queryResult.size(); i++) {

					var obj = queryResult.get(i);
					if (obj.getID() != node.getID()) {
						otherConversionRate = obj.getValue("conversion_rate").getSimpleValue();
						othertoUOM = obj.getValue("to_uom").getSimpleValue();
						if ((otherConversionRate && conversionRate) && (othertoUOM && toUOM) && (otherConversionRate == conversionRate && othertoUOM == toUOM)) {
							node.getValue("conversion_Status").setLOVValueByID("Required");
							if (validateMandatoryAttr(node, sb) != true) {
								if (objectSB.length() > 1) {
									objectSB.append(" ,");
								}
								objectSB.append(obj.getName())
							}
							error = true;
						}
					}
				}
				if (error == true) {
					sb.append("Same item " + item.getName() + " referenced with " + objectSB.toString() + "\n with same Conversion Rate and TO_UOM value. Please change the Conversion Rate or TO_UOM value.");
				}

			}
		} else if (pbomRefItem) {
			item = pbomRefItem;
			attNo = item.getValue("Item_Num").getSimpleValue();
			if (attNo != null) {
				querySpecification = query.queryFor(com.stibo.core.domain.Product).where(
					c.valueOf(step.getAttributeHome().getAttributeByID("Oracle_Item_Num")).eq(attNo).and(c.objectType(node.getObjectType()))
				);
				queryResult = querySpecification.execute().asList(1000);
			}
			if (queryResult != null && queryResult.size() > 0) {
				for (var i = 0; i < queryResult.size(); i++) {
					var obj = queryResult.get(i);
					otherConversionRate = obj.getValue("conversion_rate").getSimpleValue();
					othertoUOM = obj.getValue("to_uom").getSimpleValue();
					if ((otherConversionRate && conversionRate) && (othertoUOM && toUOM) && (otherConversionRate == conversionRate && othertoUOM == toUOM)) {
						node.getValue("conversion_Status").setLOVValueByID("Required");
						if (validateMandatoryAttr(node, sb) != true) {
							if (sb.length() > 1) {
								sb.append(" ,");
							}
							sb.append(node.getName())
						}
					}
					error = true;
				}
				if (error == true) {
					sb.append("Same item " + item.getName() + " referenced with " + node.getName() + ", " + obj.getName() + "\n with same Conversion Rate and TO_UOM value. Please change the Conversion Rate or TO_UOM value.");
				}
			}
		}
		if (sb.length() > 0) {
			return sb.toString();
		}
		return true;
	}
}

function getItemReferenceTarget(node, itemRef) {
	var srcRefTarget = null;
	var itemrefData = node.queryReferences(itemRef).asList(1);
	if (itemrefData.size() > 0) {
		srcRefTarget = itemrefData.get(0).getTarget();
		return srcRefTarget;
	} else {
		return null;
	}
}

function getPbomReferenceTarget(node, pbomRef) {
	var srcRefTarget = null;
	var attItemNo = null;
	var itemrefData = node.queryReferences(pbomRef).asList(1);

	if (itemrefData.size() > 0) {
		srcRefTarget = itemrefData.get(0).getTarget();
		attItemNo = srcRefTarget.getValue("Parent_Item").getSimpleValue();
		var attItemObj = step.getProductHome().getProductByID(attItemNo);
		if (attItemObj) {
			return attItemObj;
		} else {
			return null;
		}
	} else {
		return null;
	}
}

function validateMandatoryAttr(node, sb) {
	var conversion_type = (node.getValue("conversion_type").getSimpleValue()) ? true : false;
	var conversion_rate = (node.getValue("conversion_rate").getSimpleValue()) ? true : false;
	var quantity_class = (node.getValue("quantity_class").getSimpleValue()) ? true : false;
	var to_uom = (node.getValue("to_uom").getSimpleValue()) ? true : false;
	if (conversion_type == true && conversion_rate == true && quantity_class == true && to_uom == true) {
		return true;
	}
}

function checkDateIfinISOformat(date) {

	var sdf = new java.text.SimpleDateFormat("yyyy-MM-dd"); // For ISO Date Format	
	sdf.setLenient(false);
	try {
		sdf.parse(date);
	} catch (e) {
		return false;
	}
	return true
}

function getDCAttribute(attrName, DCid, node, step) {
	var existingDCs = node.getDataContainerByTypeID(DCid).getDataContainers();
	var existingDCsItr = existingDCs.iterator();
	var curDC = null;
	var isLOV = false;
	if (existingDCsItr.hasNext()) {
		isLOV = step.getAttributeHome().getAttributeByID(attrName).hasLOV();
		curDC = existingDCsItr.next().getDataContainerObject();
		if (curDC.getValue(attrName)) {
			if (isLOV) {
				return curDC.getValue(attrName).getID();
			} else {
				return curDC.getValue(attrName).getSimpleValue();
			}
		} else {
			return null;
		}
	}
}

function setAssignee(step, task, userId) { //Function to reassign the item to the Initiator in every state of both the Item Workflows
	if (userId) {
		var user = step.getUserHome().getUserById(userId);
		if(!user)
		   user = step.getGroupHome().getGroupByID(userId);
		if (user) {
			task.reassign(user);
		}
	}
}

function getValueFromApprovedWS(step, node, regDC, approveList, atr) {
	var existFlag = false;
	var appNode = step.executeInWorkspace("Approved", function(approvedManager) {
		var approveWSOBJ = approvedManager.getObjectFromOtherManager(node);
		if (approveWSOBJ) {
			var regionDCsItr = approveWSOBJ.getDataContainerByTypeID(atr).getDataContainers().iterator();
			while (regionDCsItr.hasNext()) {
				var regDcObj = regionDCsItr.next().getDataContainerObject();
				var cfasCodeApprove = regDcObj.getValue("CFAS_CO_Code").getSimpleValue();
				var zipApprove = regDcObj.getValue("ZIP").getSimpleValue();
				var stateApprove = regDcObj.getValue("STATE").getSimpleValue();
				var regionApprove = regDcObj.getValue("Regional_Status").getSimpleValue();
				var approveVal = cfasCodeApprove + zipApprove + stateApprove;
				if (approveVal && regDC.equals(approveVal)) {
					if (!approveList.includes(approveVal))
						approveList.push(approveVal);
					existFlag = true;
				}
			}
		}
	});
	return existFlag;
}

function resetDataContainer(node, region) {
	node.getDataContainerByTypeID(region).deleteLocal();
}

function getCurrentDate() {
	var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd");
	var dateTimeNow = new Date();
	var formattedDateTime = dateTimeFormatter.format(dateTimeNow);
	return formattedDateTime;
}

function checkItemStatus(node, refContractItem) {
	var status = true;
	var refItem;
	var itemStatus;
	var error = "";
	var refContractItemID = node.getReferences(refContractItem);
	if (refContractItemID.size() > 0) {

		refItem = refContractItemID.get(0).getTarget();
	}
	var itemNum = refItem.getValue("Item_Num").getSimpleValue();
	var refItemLOB = refItem.getValue("Line_Of_Business").getSimpleValue();
	log.info("refItemLOB data = " + refItemLOB);
	if (refItemLOB == "Wireline") {
		itemStatus = refItem.getValue("Item_Status_WRLN").getSimpleValue();
	}
	if (refItemLOB == "Entertainment") {
		itemStatus = refItem.getValue("Item_Status_ENT").getSimpleValue();
	}
	if (refItemLOB == "Retail") {
		itemStatus = refItem.getValue("Item_Status_RTL").getSimpleValue();
	}
	log.info("itemStatus = " + itemStatus + "itemNum = " + itemNum);
	//if(itemStatus != "Active S" && itemStatus != "Active NS")
	if (!itemStatus.startsWith("Act")) {
		status = false;
		log.info("Could not process region selection as " + itemNum + " is not in Active S or Active NS status, please work with Technical SME to change item status and then resubmit or disregard change.");
		error = error + "\nCould not process region selection as " + itemNum + " is not in Active S or Active NS status, please work with Technical SME to change item status and then resubmit or disregard change.";
	} else {
		var expiry;
		var bpaStatus = node.getParent().getValue("BPA_Status").getSimpleValue();
		var ciStatus = node.getValue("ContractItem_Status").getSimpleValue();
		log.info("bpaStatus = " + bpaStatus + "ciStatus = " + ciStatus);
		var Expiration_Date = node.getParent().getValue("Expiration_Date").getSimpleValue();
		if (Expiration_Date != null) {
			expiry = checkDateIfLessthanToday(Expiration_Date);

		} else {
			expiry = false;
		}
		log.info("expiry: " + expiry + "bpaStatus: " + bpaStatus + "ciStatus: " + ciStatus);
		if (bpaStatus == "Closed") {
			status = false;
			error = error + "\nCould not process line-item changes as BPA Contract Status is Closed, please change BPA status and resubmit or disregard change.";
		} else if (expiry == true) {
			status = false;
			error = error + "\nCould not process line-item changes as BPA has Expired, please extend expiration date according to S2C legal agreement then resubmit or disregard change.";
		} else if (ciStatus == "Closed") {
			status = false;
			error = error + "\nCould not process line-item changes as line-item Status is Closed please change line-item status and resubmit or disregard change.";
		} else {
			status = true;
		}
	}
	if (error != "") {
		log.info("error :" + error);
		return error;
		//webui.showAlert("ERROR", error);
	} else {
		log.info("nothing");
		return status;
	}
}

// Changes made for STIBO-1555
function setLEDefaultValues(node) {

	// the below code is added to set BPA no at CI obj to localize the value	    

	BPAno = node.getParent().getParent().getValue("Oracle_Contract_Num").getSimpleValue();
	if (BPAno) {
		if (node.getValue("Oracle_Contract_Num").getSimpleValue() != null && !node.getValue("Oracle_Contract_Num").isLocal()) {
			node.getValue("Oracle_Contract_Num").setSimpleValue(BPAno);
		}
	}
	cile_status = node.getValue("LE_Status").getID();
	if (!cile_status || cile_status == "") {
		node.getValue("LE_Status").setLOVValueByID("ACTIVE");
	}

	details = node.getValue("Detail").getID();
	if (!details) {
		node.getValue("Detail").setLOVValueByID("LEXPLOSION");
	}

	leType = node.getValue("LE_TYPE").getID();
	if (leType == "NON-EXPENSE") {
		node.getValue("Quantity_2").setSimpleValue("1");
	}

	parent = node.getParent().getParent().getName();
	if (parent) {
		node.setName(parent + "(" + node.getID() + ")");
	}

	// This value will be set to LINE** as per the requirement of EBS
	if (node.getValue("Contract_Item_ Update_Type").getSimpleValue() == null) {
		node.getValue("Contract_Item_ Update_Type").setLOVValueByID("LINE**");
	}
}

function checkNewLEOnCIFuturePrice(ciObj, cileObj) {
	var err = "";
	var futurePrice = ciObj.getValue("Price_2").getValue();
	if (futurePrice && cileObj.getValue("BPA_Processed_In_EBS").getID() != "Y")
		err = "\nNew LE cannot be created if Contract Line Future Price is entered";
	return err;
}

function CILEValidations(node, lob, step) {
	var errMsg = "";
	var leStatus = node.getValue("LE_Status").getID();
	var CIFuturePrice = node.getParent().getValue("Price_2").getSimpleValue();
	if (!node.getParent().getValue("Current_Price").getValue()) {
		var CIPrice = node.getParent().getValue("Price").getSimpleValue();
		var attr = "Price";
	} else {
		var CIPrice = node.getParent().getValue("Current_Price").getSimpleValue();
		var attr = "Current_Price";
	}
	if (leStatus != "INACTIVE") {
		errMsg += checkNewLEOnCIFuturePrice(node.getParent(), node); //STIBO-2735, Do not allow new LE on a CI if future price is entered
		if (!errMsg) {
			errMsg += CILEReqValidations(node, step);
			errMsg += CILETypeValidations(node, lob, step);
			errMsg += CILEPriceValidations(node, step);
			//if (!errMsg){
			setCILEPercentage(node, step);
			//	setCILEPrice(node,CIPrice,attr);
			if (CIFuturePrice && CIFuturePrice > 0)
				setCILEPrice(node, CIFuturePrice, "Price_2");
		}
	}
	if (errMsg)
		errMsg = "\n" + node.getID() + " Validations: " + errMsg;
	return errMsg;
}

function CILEReqValidations(node, step) {
	var errMsg = "";
	errMsg += validationLib.validateMandatoryAttribute(node, "LE_Status", step);
	errMsg += validationLib.validateMandatoryAttribute(node, "LE_TYPE", step);
	errMsg += validationLib.validateMandatoryAttribute(node, "LE_Price", step);
	var leType = node.getValue("LE_TYPE").getID();
	if (leType && (leType == "MATERIAL" || leType == "EXPENSE")) {
		if (!node.getValue("Quantity_2").getSimpleValue()) {
			errMsg += "\nPlease Provide : Quantity when Local Explosion Type is selected as MATERIAL or EXPENSE."
		}
		if (node.getValue("Quantity_2").getSimpleValue() == 0) {
			errMsg += "\nLE Quantity should be greater than 0."
		}
	}
	return errMsg;
}

function CILETypeValidations(node, lob, step) {
	var errMsg = "";
	var leType = node.getValue("LE_TYPE").getID();
	if (leType == "MATERIAL") {
		if (node.getValue("LE_Name").getID()) {
			errMsg += "\nLE Name - Non PID is not required when Local Explosion Type is selected as MATERIAL.";
		}
		if (!node.getValue("Le_Name_PID").getSimpleValue()) {
			errMsg += "\nItem Number/Reference should be provided when Local Explosion Type is selected as MATERIAL.";
		} else {
			errMsg += CILEItemRefValidations(node, lob, step);
		}
	}
	if (leType != "MATERIAL") {
		var leName = node.getValue("LE_Name").getID();
		if (node.getValue("Item_No_Referenced_to_CILE").getSimpleValue() || node.getValue("Le_Name_PID").getSimpleValue()) {
			var leToItem = step.getReferenceTypeHome().getReferenceTypeByID("LocalExplosion_Item_Reference");
			var itemsList = node.getReferences(leToItem).toArray();
			if (itemsList.length > 0) {
				itemsList[0].delete();
				node.getValue("Item_No_Referenced_to_CILE").setValue("")
			}
		}
		if (!leName) {
			errMsg += "\nLE Name - Non PID is mandatory for Local Explosion Child when Local Explosion Type is not MATERIAL";
		}
		if (leType == "EXPENSE" && leName) {
			if (leName != "OTHER EXPENSE" && leName != "WARRANTY") {
				errMsg += "\nLE Name - Non PID should be selected as OTHER EXPENSE or WARRANTY,\n When Local Explosion Type is selected as EXPENSE.";
			}
		}
		if (leType == "NON-EXPENSE" && leName) {
			if (leName != "RTU" && leName != "LABOR" && leName != "KITTING EXPENSE") {
				errMsg += "\nLE Name - Non PID should be selected as RTU or LABOR or KITTING EXPENSE,\n When Local Explosion Type is selected as NON EXPENSE.";
			}
		}
	}
	return errMsg;
}

function CILEItemRefValidations(node, lob, step) {
	var errMsg = "";
	var le_PID = node.getValue("Le_Name_PID").getSimpleValue();
	if (!le_PID || le_PID == "" || le_PID == null)
		le_PID = node.getValue("Item_No_Referenced_to_CILE").getSimpleValue();
	var EBSProcessed = node.getValue("BPA_Processed_In_EBS").getID();
	var obj = step.getNodeHome().getObjectByKey("Item.Key", le_PID);
	if (obj) { //Check the Status & LOB of the Referenced Item
		item_LOB = obj.getValue("Line_Of_Business").getID();
		Item_status = obj.getValue("Item_Status").getID();
		if (lob != "RTL") {
			if (item_LOB == "ENT" || item_LOB == "WRLN") {
				var leToItem = step.getReferenceTypeHome().getReferenceTypeByID("LocalExplosion_Item_Reference");
				if (!node.getReferences(leToItem).toArray().length > 0)
					node.createReference(obj, leToItem);
			} else {
				errMsg += "\nThe chosen item " + le_PID + " is not type of Wireline MST Item";
			}
		}
		if (!Item_status.startsWith("Act") && Item_status != "Phase NS") {
			errMsg += "\nThe MST Item " + le_PID + " Status is not *Active or Phase NS. Please change the Item Status at the MST or take appropriate action on the LE line.";
		}
	} else {
		errMsg += "\nThe chosen item " + le_PID + " is not present";
	}
	return errMsg;
}

function CILEPriceValidations(node, step) {
	var errMsg = "";
	var lePrice = node.getValue("LE_Price").getSimpleValue();
	var leType = node.getValue("LE_TYPE").getID();
	var quan2 = node.getValue("Quantity_2").getSimpleValue();
	var processedStatus = node.getParent().getValue("BPA_Processed_In_EBS").getID();
	if (lePrice == null) {
		errMsg += "\nPlease Provide : Price atribute.";
	}
	if (lePrice == 0) {
		errMsg += "\nPrice should be greater than 0";
	}
	if (lePrice && lePrice != 0) {
		if (processedStatus != "Y") {
			if (node.getParent().getObjectType().getID() == "Contract_Item")
				CIPrice = node.getParent().getValue("Price").getSimpleValue();
			else {
				var tempParent = node.getValue("Temp_Parent_Item").getSimpleValue();
				var product = step.getProductHome().getProductByID(tempParent);
				CIPrice = product.getValue("Price").getSimpleValue();
			}
		} else {
			CIPrice = node.getParent().getValue("Current_Price").getSimpleValue();
		}
		log.info("CI Price: " + parseFloat(CIPrice));
		if (CIPrice && CIPrice != 0) {
			if (leType == "MATERIAL" || leType == "EXPENSE") {
				if (parseFloat(lePrice * quan2) > parseFloat(CIPrice)) {
					errMsg += "\nPrice cannot be greater than Contract Item Price Amount.Please adjust the Price or Quantity";
				}
			}
			if (leType == "NON-EXPENSE") {
				if (parseFloat(lePrice) * 1 > parseFloat(CIPrice)) {
					errMsg += "\nPrice cannot be greater than Contract Item Price Amount.";
				}
			}
		} else {
			errMsg += "\nPlease Provide : Price for Contract Item";
		}
	}
	return errMsg;
}
//STIBO-2735, Auto calculate CILE Percentage based on CI Price or Current Price
function setCILEPercentage(node, step) {
	var lePrice = node.getValue("LE_Price").getSimpleValue();
	var leType = node.getValue("LE_TYPE").getID();
	var quan2 = node.getValue("Quantity_2").getSimpleValue();
	if (node.getParent().getObjectType().getID() == "Contract_Item") {
		if (node.getParent().getValue("BPA_Processed_In_EBS").getID() == "Y")
			var CIPrice = node.getParent().getValue("Current_Price").getSimpleValue();
		if (node.getParent().getValue("BPA_Processed_In_EBS").getID() != "Y")
			var CIPrice = node.getParent().getValue("Price").getSimpleValue();
	} else {
		var tempParent = node.getValue("Temp_Parent_Item").getSimpleValue();
		var product = step.getProductHome().getProductByID(tempParent);
		var CIPrice = product.getValue("Price").getSimpleValue();
	}
	if (lePrice) { //&& lePrice != 0) {		
		log.info("CI Price: " + parseFloat(CIPrice));
		if (leType == "MATERIAL" || leType == "EXPENSE") {
			var perct = parseFloat((lePrice * quan2) / CIPrice) * 100;
			perct = perct.toFixed(2);
			node.getValue("LE_Percentage").setSimpleValue(perct);
		}
		if (leType == "NON-EXPENSE") {
			var perct = parseFloat(lePrice / CIPrice) * 100;
			perct = perct.toFixed(2);
			node.getValue("LE_Percentage").setSimpleValue(perct);
		}
		log.info("LE Perct: " + node.getValue("LE_Percentage").getSimpleValue());
	}
}

function leKeyGeneration(node, step) {
	var errMsg = "";
	var Local_Explosion_Key = node.getValue("Local_Explosion_Key").getSimpleValue();
	var Le_Name_PID = node.getValue("Le_Name_PID").getSimpleValue();
	var LE_Name = node.getValue("LE_Name").getSimpleValue();
	var oracleContractNumber = node.getValue("Oracle_Contract_Num").getSimpleValue();
	var Parentkey = "";
	if (node.getParent().getObjectType().getID() == "Contract_Item") {
		CIItem = node.getParent().getValue("Oracle_Item_Num").getSimpleValue();
		if (node.getParent().getParent().getValue("BPA_Processed_In_EBS").getID() == "Y")
			BPAID = node.getParent().getParent().getValue("Oracle_Contract_Num").getSimpleValue();
		else
			BPAID = node.getParent().getParent().getID();
		Parentkey = node.getParent().getValue("ContractItem_key").getSimpleValue();
	} else {
		var tempParent = node.getValue("Temp_Parent_Item").getSimpleValue();
		parent = step.getProductHome().getProductByID(tempParent);
		CIItem = parent.getValue("Oracle_Item_Num").getSimpleValue();
		if (parent.getParent().getValue("BPA_Processed_In_EBS").getID() == "Y")
			BPAID = parent.getParent().getValue("Oracle_Contract_Num").getSimpleValue();
		else
			BPAID = parent.getParent().getID();
	}
	if (Parentkey) {
		if (Le_Name_PID != "") {
			keyValue = Parentkey + "_" + Le_Name_PID;
			errMsg = setKey(node, keyValue, step);
		}
		if (LE_Name) {
			keyValue = Parentkey + "_" + LE_Name;
			errMsg = setKey(node, keyValue, step);
		}
	} else {
		var CIID = node.getValue("Temp_Parent_Item").getSimpleValue(); //Phase 2 July 20 Relaese ,STIBO-2513
		if (!CIID) {
			CIID = node.getParent().getValue("Oracle_Item_Num").getSimpleValue();
		}
		if (Le_Name_PID != "") {
			keyValue = BPAID + "_" + CIID + "_" + Le_Name_PID;
			errMsg = setKey(node, keyValue, step);
		}
		if (LE_Name) {
			keyValue = BPAID + "_" + CIID + "_" + LE_Name;
			errMsg = setKey(node, keyValue, step);
		}
	}
	return errMsg;
}

function setKey(node, keyValue, step) {
	var errMsg = ""
	obj = step.getNodeHome().getObjectByKey("BPA.Local.Explosion.Key", keyValue)
	if (!obj)
		step.getKeyHome().updateUniqueKeyValues2({
			"Local_Explosion_Key": String(keyValue)
		}, node);
	else
		errMsg = errMsg + "\nAn LE Child of this type is already existing : " + obj.getID();
	return errMsg;
}

function executeCI(currentNode, step, itemRef) {
	var error = ""
	var objectType = currentNode.getObjectType().getID();
	var itemrefData = null;
	var pbomRefData = null;
	var attItemObj = null;
	var Item_status = null;
	var query = step.getHome(com.stibo.query.home.QueryHome);
	var item_No = null;

	if (objectType == 'Contract_Item') {
		resetValue(currentNode);
		itemrefData = currentNode.queryReferences(itemRef).asList(1);

		if (itemrefData.size() > 0) {
			var srcRefTarget = itemrefData.get(0).getTarget();
			item_No = srcRefTarget.getValue("Item_Num").getSimpleValue()
			Item_status_WRLN = srcRefTarget.getValue("Item_Status_WRLN").getID();
			Item_status_RTL = srcRefTarget.getValue("Item_Status_RTL").getID();
			Item_status_ENT = srcRefTarget.getValue("Item_Status_ENT").getID();
			Item_LOB = srcRefTarget.getValue("Line_Of_Business").getID();
			if (Item_LOB == "WRLN" && Item_status_WRLN.startsWith("Act")) {
				copyAttributes(currentNode, srcRefTarget, step);
			} else if (Item_LOB == "RTL" && (Item_status_RTL.startsWith("Act") || Item_status_RTL == "Pre Launch" || Item_status_RTL == "No Buy" || Item_status_RTL == "DSL COL")) {
				copyAttributes(currentNode, srcRefTarget, step);
			} else if (Item_LOB == "ENT" && (Item_status_ENT.startsWith("Act") || Item_status_ENT == "Pre Launch" || Item_status_ENT == "No Buy" || Item_status_ENT == "DSL COL")) {
				copyAttributes(currentNode, srcRefTarget, step);
			} else {
				var temp = (!item_No) ? "" : item_No;
				error = error + "The chosen item " + temp + " is not in Active state.Please add Active MST Item"

			}
		} else {

			error = error + "Contract Item should have MST Item  reference."

		}
	}
	return error
}

function copyAttributes(currentNode, srcRefTarget, step) {
	//log.info("objectType1134 "+srcRefTarget.getID());
	var uom = srcRefTarget.getValue("Primary_UOM").getID();
	var prevRefItem = currentNode.getValue("Prev_Item_Ref").getSimpleValue();
	lob = currentNode.getValue("Legacy_Source").getID();
	if (uom && uom != "") {
		//STIBO-1691
		var processedInEBS = currentNode.getValue("BPA_Processed_In_EBS").getID();
		if (processedInEBS != "Y") {
			if (prevRefItem != srcRefTarget.getID()) {
				//	if(currentNode.getValue("BPA_UOM").getSimpleValue()==null)
				currentNode.getValue("BPA_UOM").setLOVValueByID(uom);
				var onboardingUomLov = step.getListOfValuesHome().getListOfValuesByID("LOV_BPA_Oboarding_UOM");
				var validLovList = onboardingUomLov.getListOfValuesValueByID(uom);
				if (validLovList) {
					//  if(currentNode.getValue("BPA_Onboarding_UOM").getSimpleValue()==null)	
					currentNode.getValue("BPA_Onboarding_UOM").setLOVValueByID(uom);
				}
				currentNode.getValue("Prev_Item_Ref").setSimpleValue(srcRefTarget.getID());
			}
			if (prevRefItem == srcRefTarget.getID()) {
				if (currentNode.getValue("BPA_UOM").getSimpleValue() == null)
					currentNode.getValue("BPA_UOM").setLOVValueByID(uom);
				var onboardingUomLov = step.getListOfValuesHome().getListOfValuesByID("LOV_BPA_Oboarding_UOM");
				var validLovList = onboardingUomLov.getListOfValuesValueByID(uom);
				if (validLovList) {
					if (currentNode.getValue("BPA_Onboarding_UOM").getSimpleValue() == null)
						currentNode.getValue("BPA_Onboarding_UOM").setLOVValueByID(uom);
				}
			}
		}
		//if(currentNode.getValue("UOM_Copied_From_Item").getSimpleValue()==null)
		currentNode.getValue("UOM_Copied_From_Item").setValue(uom);
	}

	var oracleItemNumber = srcRefTarget.getValue("Item_Num").getSimpleValue();
	//log.info("objectType11345 "+oracleItemNumber);
	if (oracleItemNumber && oracleItemNumber != "") {
		currentNode.getValue("Oracle_Item_Num").setValue(oracleItemNumber);
	}
	var OEM_Full_Name = srcRefTarget.getValue("OEM_Full_Name").getSimpleValue();
	if (OEM_Full_Name && OEM_Full_Name != "") {
		if (currentNode.getValue("BPA_OEM_Full_Name").getLOVValue() == null) {
			currentNode.getValue("BPA_OEM_Full_Name").setValue(OEM_Full_Name);
		}
	}
	var OEM_Part_Number = srcRefTarget.getValue("Mfg_Part_No").getSimpleValue();
	if (OEM_Part_Number && OEM_Part_Number != "") {
		if (currentNode.getValue("BPA_OEM_Part_Number").getSimpleValue() == null) {
			currentNode.getValue("BPA_OEM_Part_Number").setValue(OEM_Part_Number);
		}
	}
	var Pack_Quantity = srcRefTarget.getValue("Pack_Qty").getSimpleValue();
	var refLob = srcRefTarget.getValue("Line_Of_Business").getID();
	if (refLob != "RTL") { // STIBO-2335 Prod Support July release
		if (Pack_Quantity && Pack_Quantity != "") {
			if (currentNode.getValue("BPA_Pack_Quantity").getSimpleValue() == null)
				currentNode.getValue("BPA_Pack_Quantity").setValue(Pack_Quantity);
		} else if (Pack_Quantity == null) {
			currentNode.getValue("BPA_Pack_Quantity").setValue("1");
		}
	}

	// STIBO-2624 Prod Support Team Jan 25 Release
	// STIBO-3318 Prod Support Team Mar 15 Release
	setItemLevelBuyerPlanner(currentNode, srcRefTarget, step);
			
	//STIBO-1157, Copy the ST Region DC data to CI Region DC attribute on click on "Set Values" button on UI, reenable the code for Jun 8th ,2024 Release

	var materialItemType = srcRefTarget.getValue("Material_Item_Type_Web").getSimpleValue();
	var itemStatus = srcRefTarget.getValue("Item_Status_WRLN").getSimpleValue();
	if (materialItemType != "Minor Material" && materialItemType != "Cable" && materialItemType != "Plug-In") {
		currentNode.getValue("BPA_RefItem_Region_Distribution_Center").setSimpleValue("");
		var regionDistCenter = srcRefTarget.getValue("Region_Distribution_Center").getValues();
		if (regionDistCenter.size() > 0) {
			log.info("regionDistCenter = " + regionDistCenter + "|" + itemStatus);
			for (var i = 0; i < regionDistCenter.size(); i++) {
				log.info("2........ = " + regionDistCenter.get(i).getValue());
				currentNode.getValue("BPA_RefItem_Region_Distribution_Center").addValue(regionDistCenter.get(i).getValue() + " | " + regionDistCenter.get(i).getID() + " | " + itemStatus);

			}
			log.info("3................" + currentNode.getValue("BPA_RefItem_Region_Distribution_Center").getValues());
		} else
			currentNode.getValue("BPA_RefItem_Region_Distribution_Center").setSimpleValue(itemStatus);
	}
	if (materialItemType == "Minor Material" || materialItemType == "Cable" || materialItemType == "Plug-In") {
		var childOrgs = srcRefTarget.getChildren().toArray();
		log.info("childOrgs size = " + childOrgs.length);
		if (childOrgs.length == 1 && childOrgs[0].getValue("Organization_Code").getID() == "ASE") {
	    currentNode.getValue("BPA_RefItem_Region_Distribution_Center").setSimpleValue(itemStatus);
		}
		if ((childOrgs.length == 1 && childOrgs[0].getValue("Organization_Code").getID() != "ASE") || childOrgs.length > 1) {
			childOrgs.forEach(function(child) {
				var childObjTypeID = child.getObjectType().getID();
                   if(childObjTypeID=="Child_Org_Item"){
				var childId = child.getID();
				var childOrgCodes = child.getValue("Organization_Code").getID();
				var childOrgValues = child.getValue("Organization_Code").getValue();
				var childItemStatus = child.getValue("Item_Status").getSimpleValue();
				var childItemConsignment = child.getValue("Consignment").getSimpleValue();
				if (childOrgCodes != "ASE") {
					currentNode.getValue("BPA_RefItem_Region_Distribution_Center").addValue(childOrgValues + " | " + childOrgCodes + " | " + childItemStatus + " | Consignment - " + childItemConsignment);
				}
				}
			});
		} else
			currentNode.getValue("BPA_RefItem_Region_Distribution_Center").setSimpleValue(itemStatus);
	}
	var refLob = srcRefTarget.getValue("Line_Of_Business").getID(); // STIBO-2011 Prod Support July release
	if ((refLob == "RTL") || (refLob == "ENT")) {
		var childOrgs = srcRefTarget.getChildren().toArray();
		childOrgs.forEach(function(child) {
			var childObjectTypeID = child.getObjectType().getID();
			if (childObjectTypeID == 'Child_Org_Item') {
				var childOrgCodes = child.getValue("Organization_Code").getID();
				var childOrgValues = child.getValue("Organization_Code").getValue();
				var childItemStatus = child.getValue("Item_Status").getSimpleValue();
				var childItemConsignment = child.getValue("Consignment").getSimpleValue();
				currentNode.getValue("BPA_RefItem_Region_Distribution_Center").addValue(childOrgValues + " | " + childOrgCodes + " | " + childItemStatus + " | Consignment - " + childItemConsignment);
			}
		});
	}
}

// STIBO-3318 Prod Support Team Mar 15 Release
function setItemLevelBuyerPlanner(currentNode, srcRefTarget, step){

	var itemLevelBuyer = "";
	var refLob = srcRefTarget.getValue("Line_Of_Business").getID();
	if (refLob == "WRLN") {
		itemLevelBuyer = srcRefTarget.getValue("PLANNER_ATTUID").getID();
		if (!itemLevelBuyer) {
			currentNode.getValue("BPA_Item_Level_Buyer_Planner").setValue("Wireline Buyer");
		} else {
			var isStockedCodePresent = checkStockedCode(currentNode);
			if (isStockedCodePresent) {
				currentNode.getValue("BPA_Item_Level_Buyer_Planner").setValue(itemLevelBuyer);
			} else {
				currentNode.getValue("BPA_Item_Level_Buyer_Planner").setValue("Wireline Buyer");
			}
		}
	} else {
		itemLevelBuyer = srcRefTarget.getValue("Buyer").getID();
		if (itemLevelBuyer) {
			currentNode.getValue("BPA_Item_Level_Buyer_Planner").setValue(itemLevelBuyer);
		}
	}	
}

function checkStockedCode(currentNode) {

	var regionDCarr = currentNode.getDataContainerByTypeID("Region").getDataContainers().toArray();
	var isZBpresent = false;
	regionDCarr.forEach(function(regionDC) {
		var regionDCobj = regionDC.getDataContainerObject();
		if (regionDCobj) {					
			if (regionDCobj.getValue("CFAS_CO_Code").getID() == "ZB"
			&& regionDCobj.getValue("Regional_Status").getID() == "ACTIVE" ) {
				isZBpresent = true;
			}
		}
	});

	if (isZBpresent) {
		return true;
	}
	return false;
}
// STIBO-3318 Prod Support Team Mar 15 Release

function resetValue(currentNode) {
	//currentNode.getValue("BPA_UOM").setValue(null);
	currentNode.getValue("BPA_Pack_Quantity").setValue(null);
	currentNode.getValue("BPA_OEM_Part_Number").setValue(null);
	currentNode.getValue("BPA_OEM_Full_Name").setValue(null);
	currentNode.getValue("Oracle_Item_Num").setValue(null);
	currentNode.getValue("BPA_Item_Level_Buyer_Planner").setValue(null);
	currentNode.getValue("UOM_Copied_From_Item").setValue(null);
	currentNode.getValue("BPA_RefItem_Region_Distribution_Center").setSimpleValue(null);
}
//STIBO-2735, Auto populate CILE Future price once Contarct Line Future price is entered
function setCILEPrice(child, Price, attr) {
	var quan2 = child.getValue("Quantity_2").getSimpleValue();
	var lePercent = child.getValue("LE_Percentage").getSimpleValue();
	var leType = child.getValue("LE_TYPE").getID();
	if (lePercent != 0) {
		if (leType == "MATERIAL" || leType == "EXPENSE") {
			if (quan2 != 0) {
				price = parseFloat((lePercent * Price) / (quan2 * 100));
			}
		}
		if (leType == "NON-EXPENSE") {
			price = parseFloat((lePercent * Price) / 100);
		}
		price = price.toFixed(2);
		if (attr == "Price" || attr == "Current_Price")
			child.getValue("LE_Price").setSimpleValue(price);
		if (attr == "Price_2")
			if (!child.getValue("LE_Future_Price").getValue()) {
				child.getValue("LE_Future_Price").setSimpleValue(price);
			}
	}
}

function partialApproveFields(node, IDArray) {
	var set = new java.util.HashSet();
	var setUnapproved = node.getNonApprovedObjects();
	var unapprovedIterator = setUnapproved.iterator();
	log.info("Node in function is : " + node);
	log.info("setUnapproved:" + setUnapproved);
	while (unapprovedIterator.hasNext()) {
		var partObject = unapprovedIterator.next();
		var partObjectStr = partObject.toString();
		if (partObjectStr.indexOf("ValuePartObject") != -1 && IDArray.indexOf(String(partObject.getAttributeID())) != -1) {
			set.add(partObject);
		}
	}
	log.info("partsToApprove:" + set);
	if (set.size() > 0) {
		node.approve(set);
	}
}


function globalError(node, step, parent) {
	//aayush-aw240u(cognizant)

	var objctType = node.getObjectType().getID();
	var Expiration_Date = parent.getValue("Expiration_Date").getSimpleValue();


	var bpaStatus = parent.getValue("BPA_Status").getSimpleValue(); //=="Closed"
	log.info("bpaStatus: " + bpaStatus);
	var ciStatus = node.getValue("ContractItem_Status").getSimpleValue(); //=="Closed"
	log.info("ciStatus: " + ciStatus);
	var apprCIStatus = "";

	var ciToItem = step.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
	var item = node.getReferences(ciToItem).toArray();
	log.info("item.length: " + item.length);
	var Expiration_Date = parent.getValue("Expiration_Date").getSimpleValue();
	if (Expiration_Date != null) {
		var expiry = checkDateIfLessthanToday(Expiration_Date);

	} else {

		var expiry = false;
	}
	var error = "";

	if (bpaStatus == "Closed") {
		error = error + "\nCould not process line-item changes as BPA Contract Status is Closed, please change BPA status and resubmit or disregard change.";
	}
	/* if (ciStatus == "Closed") {
	     error = error + "\n Could not process line-item changes as Contract Item Status is Closed, please change Contract Item status and resubmit or disregard change. \n";
	 }*/

	if (expiry == true) {
		error = error + "\nCould not process line-item changes as BPA has Expired, please extend expiration date according to S2C legal agreement then resubmit or disregard change.";

	}
	if (item.length > 0) {
		// var parent = node.getParent();
		var legacySrc = parent.getValue("Legacy_Source").getID();
		var itemTarget = item[0].getTarget();
		var itemNum = itemTarget.getValue("Item_Num").getSimpleValue();
		var itemLOB = itemTarget.getValue("Line_Of_Business").getID();
		var itemType = itemTarget.getParent().getID();
		if (legacySrc && legacySrc != "RTL" && (itemLOB == "RTL" || itemLOB == "NTW")) {
			error = error + "\nIf Business source of the BPA is non Retail, Contract Item " + node.getID() + " can be linked with only Entertainment or Wire line  MST items";
		}
		/*
		if (legacySrc && legacySrc != "RTL" && legacySrc != "DTV" && itemType =="SATELLITE") {
			error = error + "\nIf Business source of the BPA is  non DTV, Contract Item " + node.getID() + " cannot be linked with DTV item";
		}*/
		if (legacySrc && legacySrc == "DTV" && itemType != "SATELLITE") {
			error = error + "\nBusiness Source for Contract Item " + node.getID() + " is DTV .\n It can be linked with only DTV Entertainment MST Item";
		}
		if (legacySrc && legacySrc == "RTL" && itemLOB != "RTL") {
			error = error + "\nBusiness Source for Contract Item " + node.getID() + " is Retail Consumer .\n It can be linked with only Retail MST Item";
		}
		/*
		if (legacySrc && legacySrc == "RTL" && (itemType == "ENTMOB_ELE" || itemType =="ENTMOB_COL"|| itemType =="ENTMOB_ACC")) {
			error = error + "\nBusiness Source for Contract Item " + node.getID() + " is Retail Consumer .\n It cannot be linked with DTV Item";
		}*/
		if (itemTarget.getValue("Line_Of_Business").getID() == "ENT") {
			var itemStatus = itemTarget.getValue("Item_Status_ENT").getSimpleValue();
			if (itemStatus) {
				if (itemStatus != "Pre Launch" && itemStatus != "No Buy" && !itemStatus.startsWith("Act") && itemStatus != "DSL COL") {
					error = error + "\nCould not process line-item changes as " + itemNum + " is not in Active* status, please work with Technical SME to change item status and then resubmit or disregard change.";
				}
			} else {
				error = error + "\nCould not process line-item changes as " + itemNum + " status is blank, please work with Technical SME to change item status and then resubmit or disregard change.";
			}
		} else if (itemTarget.getValue("Line_Of_Business").getID() == "WRLN") {
			var itemStatus = itemTarget.getValue("Item_Status_WRLN").getSimpleValue();
			if (itemStatus) {
				if (itemStatus != "Active S" && itemStatus != "Active NS") {
					error = error + "\nCould not process line-item changes as " + itemNum + " is not in Active* status, please work with Technical SME to change item status and then resubmit or disregard change."
				}
			} else {
				error = error + "\nCould not process line-item changes as " + itemNum + " status is blank, please work with Technical SME to change item status and then resubmit or disregard change.";
			}
		} else if (itemTarget.getValue("Line_Of_Business").getID() == "RTL") {
			var itemStatus = itemTarget.getValue("Item_Status_RTL").getSimpleValue();
			if (itemStatus) {
				if (!itemStatus.startsWith("Act") && itemStatus != "No Buy" && itemStatus != "Pre Launch" && itemStatus != "DSL COL") {
					error = error + "\nCould not process line-item changes as " + itemNum + " is not in Active* status, please work with Technical SME to change item status and then resubmit or disregard change."
				}
			} else {
				error = error + "\nCould not process line-item changes as " + itemNum + " status is blank, please work with Technical SME to change item status and then resubmit or disregard change.";
			}
		} else {
			var itemStatus = null;
		}
	}
	if (error && error != "") {
		//log.info("error :" + error);

		return error
	} else {
		log.info("nothing");
		//nothing
		return "";
	}
}

function setDefaultCICILE(node, parent, refContractItem) {
	var BPAno = parent.getValue("Oracle_Contract_Num").getSimpleValue();
	if (BPAno) {
		if (node.getValue("Oracle_Contract_Num").getSimpleValue() != null && !node.getValue("Oracle_Contract_Num").isLocal()) {
			node.getValue("Oracle_Contract_Num").setSimpleValue(BPAno);
		}
	}
	var Legacy_Source = node.getParent().getValue("Legacy_Source").getID();
	var Price_Break_Qty = node.getValue("Price_Break_Qty").getSimpleValue();
	if (!Price_Break_Qty || Price_Break_Qty != "") {
		node.getValue("Price_Break_Qty").setSimpleValue("0");
	}
	var ci_status = node.getValue("ContractItem_Status").getID();
	if (!ci_status || ci_status == "") {
		node.getValue("ContractItem_Status").setLOVValueByID("OPEN");
	}
	var details = node.getValue("Detail").getID();
	if (!details) {
		log.info("Exiting BPA Set Default Values details " + details);
		node.getValue("Detail").setLOVValueByID("PBREAK");
	}
	// STIBO-2335 Prod Support July release - Following defaulting logic should not run for Retail Contract items
	refContractItemID = node.getReferences(refContractItem);
	if (refContractItemID.size() > 0) {
		refItem = refContractItemID.get(0).getTarget();
		var refItemLOB = refItem.getValue("Line_Of_Business").getSimpleValue();
		if (refItemLOB != "Retail") {
			var maxOrderQty = node.getValue("Max_Order_Qty").getSimpleValue();
			if (!maxOrderQty || maxOrderQty == "") {
				node.getValue("Max_Order_Qty").setSimpleValue("999999");

			}

			var minOrderQty = node.getValue("Min_Order_Qty").getSimpleValue();
			if (!minOrderQty || minOrderQty == "") {
				node.getValue("Min_Order_Qty").setSimpleValue("1");

			}
			var nonProcessflag = node.getValue("Non_Process_Flag").getSimpleValue();
			if (!nonProcessflag || nonProcessflag == "") {
				node.getValue("Non_Process_Flag").setLOVValueByID("N");

			}

			var standPack = node.getValue("STD_PACKAGING").getSimpleValue();
			if (!standPack || standPack == "") {
				node.getValue("STD_PACKAGING").setSimpleValue("1");

			}
		}
	}
	// STIBO-2335 Prod Support July release
	var leadTime = node.getValue("Lead_Time").getSimpleValue();
	if (Legacy_Source != "RTL" || Legacy_Source != "WRLN" || Legacy_Source != "WRLN_NON" || Legacy_Source != "QTE") {
		if (node.getValue("Lead_Time").getSimpleValue() == null || node.getValue("Lead_Time").getSimpleValue() == "") {
			node.getValue("Lead_Time").setSimpleValue("14");
		}
	}

	// Changes made for STIBO-1555
	var leChildren = node.getChildren();
	if (leChildren.size() > 0) {
		for (var i = 0; i < leChildren.size(); i++) {
			var childCILE = leChildren.get(i);
			log.info("childCILE " + childCILE.getID());
			var leObjectType = childCILE.getObjectType().getID();
			if (leObjectType == 'LE_Contract_Item_Child') {
				setLEDefaultValues(childCILE);
			}
		}
	}
}

// STIBO-2335 Prod Support July release
function clearRTLAttributes(node) {

	var attrNotReqRTL = ["Max_Order_Qty", "Min_Order_Qty", "Non_Process_Flag", "STD_PACKAGING", "BPA_Pack_Quantity"];
	attrNotReqRTL.forEach(function(attrID) {
		if (node.getValue(attrID).getSimpleValue()) {
			node.getValue(attrID).setSimpleValue("");
		}
	});
}
// STIBO-2335 Prod Support July release
/*===== business library exports - this part will not be imported to STEP =====*/
exports.removeFromworkflow = removeFromworkflow
exports.checkDateIfLessthanToday = checkDateIfLessthanToday
exports.isUOMConversionRequired = isUOMConversionRequired
exports.getItemReferenceTarget = getItemReferenceTarget
exports.getPbomReferenceTarget = getPbomReferenceTarget
exports.validateMandatoryAttr = validateMandatoryAttr
exports.checkDateIfinISOformat = checkDateIfinISOformat
exports.getDCAttribute = getDCAttribute
exports.setAssignee = setAssignee
exports.getValueFromApprovedWS = getValueFromApprovedWS
exports.resetDataContainer = resetDataContainer
exports.getCurrentDate = getCurrentDate
exports.checkItemStatus = checkItemStatus
exports.setLEDefaultValues = setLEDefaultValues
exports.checkNewLEOnCIFuturePrice = checkNewLEOnCIFuturePrice
exports.CILEValidations = CILEValidations
exports.CILEReqValidations = CILEReqValidations
exports.CILETypeValidations = CILETypeValidations
exports.CILEItemRefValidations = CILEItemRefValidations
exports.CILEPriceValidations = CILEPriceValidations
exports.setCILEPercentage = setCILEPercentage
exports.leKeyGeneration = leKeyGeneration
exports.setKey = setKey
exports.executeCI = executeCI
exports.copyAttributes = copyAttributes
exports.setItemLevelBuyerPlanner = setItemLevelBuyerPlanner
exports.checkStockedCode = checkStockedCode
exports.resetValue = resetValue
exports.setCILEPrice = setCILEPrice
exports.partialApproveFields = partialApproveFields
exports.globalError = globalError
exports.setDefaultCICILE = setDefaultCICILE
exports.clearRTLAttributes = clearRTLAttributes