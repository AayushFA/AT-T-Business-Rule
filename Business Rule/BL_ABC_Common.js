/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_ABC_Common",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ABC_Library" ],
  "name" : "ABC Common Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "AT&T_Audit_Library",
    "libraryAlias" : "libAudit"
  }, {
    "libraryId" : "BL_ABC_Validation",
    "libraryAlias" : "abcValidationLib"
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
function isProcessedInOracle(node) {
	ebsFlag = node.getValue("SI_BPA_Processed_In_Cloud").getID(); // SI_BPA_Processed_In_Cloud
	if (ebsFlag == "Y" || ebsFlag == "E") {
		return true;
	} else {
		return false;
	}
}

function setDate(node, attID) {
	var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd");
	var dateNow = new Date();
	var formattedDateTime = dateTimeFormatter.format(dateNow);
	node.getValue(attID).setSimpleValue(formattedDateTime);
}
// Rollback and Partial approve
function rollBackandParitialApprove(node, stepManager, objType) {
	var partialApprList = new java.util.ArrayList();
	var nonApprovedObj = node.getNonApprovedObjects().toArray();	
	if (nonApprovedObj.length > 0) {
		for (i = 0; i < nonApprovedObj.length; i++) {
			var nonApprovedType = nonApprovedObj[i] + "";
			if (nonApprovedType.includes("ValuePartObject")) {
				var nonApprovedAttrID = nonApprovedObj[i].getAttributeID();
				setAttrValuefromApprovedWS(node, stepManager, nonApprovedAttrID, objType);
				partialApprList.add(nonApprovedAttrID);
			}
		}
		if (partialApprList.size() > 0) {
			partialApprove(node, partialApprList);
		}
	}
}
// Rollback and Partial approve
function rollBackandParitialApprove_ABC(node, stepManager, objType) {
	var partialApprList = new java.util.ArrayList();
	var nonApprovedObj = node.getNonApprovedObjects().toArray();	
	if (nonApprovedObj.length > 0) {
		for (i = 0; i < nonApprovedObj.length; i++) {
			var nonApprovedType = nonApprovedObj[i] + "";
			if (nonApprovedType.includes("ValuePartObject")) {
				var nonApprovedAttrID = nonApprovedObj[i].getAttributeID();
				if (nonApprovedAttrID != "SI_Supplier_Catalog_Status" && nonApprovedAttrID != "SI_Supplier_Catalog_Reject_Reason" && nonApprovedAttrID != "SI_Record_ID") {
					setAttrValuefromApprovedWS(node, stepManager, nonApprovedAttrID, objType);
					partialApprList.add(nonApprovedAttrID);
				}
			}
		}
		if (partialApprList.size() > 0) {
			partialApprove(node, partialApprList);
		}
	}
}

function unApprovedAttributes(node) {
	var counter = 0;
	var nonApprovedObj = node.getNonApprovedObjects().toArray();
	if (nonApprovedObj.length > 0) {
		for (i = 0; i < nonApprovedObj.length; i++) {
			var nonApprovedType = nonApprovedObj[i] + "";
			if (nonApprovedType.includes("ValuePartObject")) counter++;
		}
	}
	if (counter > 0) return true;
	else return false;
}

function setAttrValuefromApprovedWS(node, stepManager, nonApprovedAttrID, objType) {
	var approvedManager = stepManager.executeInWorkspace("Approved", function(step) {
		return step;
	});
	var approvedNode = null;
	if (objType == "Entity") {
		approvedNode = approvedManager.getEntityHome().getEntityByID(node.getID());
	} else if (objType == "Product") {
		approvedNode = approvedManager.getProductHome().getProductByID(node.getID());
	}
	if (approvedNode) {
		var approvedRevisions = approvedNode.getRevisions().toArray();
		if (approvedRevisions.length > 0) {
			var latestRevision = approvedRevisions[0].getNode().getRevision().getName();
			var apprRevAttrValue = approvedRevisions[0].getNode().getValue(nonApprovedAttrID).getSimpleValue();
			node.getValue(nonApprovedAttrID).setSimpleValue(apprRevAttrValue);
		}
	}
}

function partialApprove(node, IDArray) {
	var set = new java.util.HashSet();
	var setUnapproved = node.getNonApprovedObjects();
	var unapprovedIterator = setUnapproved.iterator();
	while (unapprovedIterator.hasNext()) {
		var partObject = unapprovedIterator.next();
		var partObjectStr = partObject.toString();
		if (partObjectStr.indexOf("ValuePartObject") != -1 && IDArray.indexOf(String(partObject.getAttributeID())) != -1) {
			set.add(partObject);
		} else if (partObjectStr.indexOf("ClassificationLinkPartObject") != -1) {
			set.add(partObject);
		} else if (partObjectStr.indexOf("DataContainerPartObject") != -1) {
			set.add(partObject);
		} else if (partObjectStr.indexOf("ProductReferencePartObject") != -1) {
			set.add(partObject);
		}
	}
	if (set.size() > 0) {
		node.approve(set);
	}
}

function partialApproveFields(node, IDArray) {
	var set = new java.util.HashSet();
	var setUnapproved = node.getNonApprovedObjects();
	var unapprovedIterator = setUnapproved.iterator();	
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

function calculateBodyForGscPush(data) {	
	if (Object.keys(data).length > 0) {
		payloads = [];
		data.forEach(function(d) {
			const mssge = {
				"ContractNumber": d.mastcontnum + "",
				"DocumentNumber": d.docnum + "",
				"DocumentLineNumber": d.doclnnum + "",
				"Description": d.desc + "",
				"Carrier": d.car + "",
				"Buyer": d.buyr + "",
				"FOB": d.fob + "",
				"FreightTerms": d.frigtterm + "",
				"PayTerms": d.payterm + "",
				"Amount": d.amnt + "",
				"SourcingManager": d.sourcmangr + "",
				"StartDate": d.startdate + "",
				"EndDate": d.enddate + "",
				"ItemDescription": d.itemdesc + "",
				"PurchasableFlag": d.purchflag + "",
				"LineEndDate": d.lineenddt + "",
				"Status": d.hstatus + "",
				"ErrorResponse": d.errres + "",
				"QuoteNumber": d.quote + "",
				"SupplierNumber": d.suppnum + "",
				"SupplierSiteCode": d.site + "",
				"ATTItemNumber": d.attnum + "",
				"StgtblRecid": d.stgrecid + "",
				"SupplierPartNumber": d.suppartnum + "",
				"StepParentId": d.parentid + "",
				"StepID": d.stepid + "",
				"StepPBId": d.steppbid + ""
			};
			payloads.push(mssge);
		});
		const message = {
			"ATTCatalogStatusMessage": {
				"RequestData": payloads
			}
		};
		return JSON.stringify(message);
	} else {
		return false;
	}
}

function cleanVal(val) {
	return val == null ? "" : val;
}

function convertSpecialCharOutbound(val) {
	return val.split("<lt/>").join("<").split("<gt/>").join(">");
}

function pushObject(pyl, mastcontnum, suppartnum, docnum, doclnnum, desc, car, buyr, fob, frigtterm, payterm, amnt, sourcmangr, startdate, enddate, itemdesc, purchflag, lineenddt, hstatus, errres, contractnum, quote, suppnum, site, attnum, stgrecid, parentid, stepid, steppbid) {
	var obj = {
		mastcontnum: convertSpecialCharOutbound(cleanVal(mastcontnum)),
		suppartnum: convertSpecialCharOutbound(cleanVal(suppartnum)),
		docnum: convertSpecialCharOutbound(cleanVal(docnum)),
		doclnnum: convertSpecialCharOutbound(cleanVal(doclnnum)),
		desc: convertSpecialCharOutbound(cleanVal(desc)),
		car: convertSpecialCharOutbound(cleanVal(car)),
		buyr: convertSpecialCharOutbound(cleanVal(buyr)),
		fob: convertSpecialCharOutbound(cleanVal(fob)),
		frigtterm: convertSpecialCharOutbound(cleanVal(frigtterm)),
		payterm: convertSpecialCharOutbound(cleanVal(payterm)),
		amnt: convertSpecialCharOutbound(cleanVal(amnt)),
		sourcmangr: convertSpecialCharOutbound(cleanVal(sourcmangr)),
		startdate: convertSpecialCharOutbound(cleanVal(startdate)),
		enddate: convertSpecialCharOutbound(cleanVal(enddate)),
		itemdesc: convertSpecialCharOutbound(cleanVal(itemdesc)),
		purchflag: convertSpecialCharOutbound(cleanVal(purchflag)),
		lineenddt: convertSpecialCharOutbound(cleanVal(lineenddt)),
		hstatus: convertSpecialCharOutbound(cleanVal(hstatus)),
		errres: convertSpecialCharOutbound(cleanVal(errres)),
		contractnum: convertSpecialCharOutbound(cleanVal(contractnum)),
		quote: convertSpecialCharOutbound(cleanVal(quote)),
		suppnum: convertSpecialCharOutbound(cleanVal(suppnum)),
		site: convertSpecialCharOutbound(cleanVal(site)),
		attnum: convertSpecialCharOutbound(cleanVal(attnum)),
		stgrecid: convertSpecialCharOutbound(cleanVal(stgrecid)),
		parentid: convertSpecialCharOutbound(cleanVal(parentid)),
		stepid: convertSpecialCharOutbound(cleanVal(stepid)),
		steppbid: convertSpecialCharOutbound(cleanVal(steppbid))
	};
	pyl.push(obj);
}

function transformRejectReason(res) {
	if (res != null && res.includes('<multisep/>')) {
		return res.replace(/<multisep\/>/g, ',');
	} else {
		return res;
	}
}

function buildPayloadForGscPush(obj, chunk, pyl, flagExpec, siSuppCatStat, buildPureHeader) {	
	const payload = {};
	var objCnt = 0;
	payload.suppnum = obj.getValue("SI_Supplier_Number").getSimpleValue();
	payload.site = obj.getValue("SI_Supplier_Site").getSimpleValue();
	payload.parentid = obj.getID().toString();
	payload.mastcontnum = obj.getValue("SI_Master_Contract_Number").getSimpleValue();
	payload.docnum = obj.getValue("Agreement_Number").getSimpleValue();
	payload.desc = obj.getValue("SI_BPA_Description").getSimpleValue();
	payload.car = obj.getValue("SI_Carrier").getSimpleValue();
	payload.buyr = obj.getValue("SI_Buyer").getID();
	payload.fob = obj.getValue("SI_FOB_Zip").getSimpleValue();
	payload.frigtterm = obj.getValue("SI_Freight_Terms").getSimpleValue();
	payload.payterm = obj.getValue("SI_Payment_Terms").getSimpleValue();
	payload.amnt = obj.getValue("SI_Agreement_Amount").getSimpleValue();
	payload.sourcmangr = obj.getValue("SI_Contract_Manager").getID();
	payload.startdate = obj.getValue("SI_BPA_Start_Date").getSimpleValue();
	payload.enddate = obj.getValue("SI_BPA_End_Date").getSimpleValue();
	if (buildPureHeader && payload.docnum) {
		pushObject(pyl, payload.mastcontnum, '', payload.docnum, '', payload.desc, payload.car, payload.buyr, payload.fob, payload.frigtterm, payload.payterm, payload.amnt, payload.sourcmangr, payload.startdate, payload.enddate, '', '', '', '', '', payload.contractnum, '', payload.suppnum, payload.site, '', '', payload.parentid, '', '');
	} else if (!buildPureHeader) {
		chunk.forEach(function(objChild) {
			var objectType = objChild.getObjectType().getID();			
			if (objectType == "Contract_Item") {				
				if ((objChild.getValue("SI_GSC_Flag").getSimpleValue() == flagExpec || objChild.getValue("ABC_Update_Flag").getSimpleValue() == flagExpec) && objChild.getValue("SI_Supplier_Catalog_Status").getSimpleValue() == siSuppCatStat) {					
					payload.hstatus = objChild.getValue("SI_Supplier_Catalog_Status").getID();
					payload.errres = transformRejectReason(objChild.getValue("SI_Supplier_Catalog_Reject_Reason").getSimpleValue());
					//					payload.quote = objChild.getValue("SI_Quote_Number").getSimpleValue();
					payload.quote = "";
					payload.attnum = objChild.getValue("ATT_Item_Number").getSimpleValue();
					payload.stgrecid = objChild.getValue("SI_Record_ID").getSimpleValue();
					payload.suppartnum = objChild.getValue("SI_Part_Number").getSimpleValue();
					payload.stepid = objChild.getID();
					payload.doclnnum = objChild.getValue("SI_Document_Line_Number").getSimpleValue();
					payload.itemdesc = objChild.getValue("SI_ATT_Item_Description").getSimpleValue();
					payload.purchflag = objChild.getValue("SI_Purchasable_Flag").getID();
					payload.lineenddt = objChild.getValue("SI_Line_End_Date").getSimpleValue();
					objCnt++;
				} else {
					payload.hstatus = "";
					payload.errres = "";
					payload.quote = "";
					payload.attnum = "";
					payload.stgrecid = "";
					payload.suppartnum = "";
					payload.stepid = "";
					payload.doclnnum = "";
					payload.itemdesc = "";
					payload.purchflag = "";
					payload.lineenddt = "";
					return;
				}
				itemChilds = objChild.getChildren();				
				if (itemChilds.size() > 0) {
					var pbValCnt = 0;
					itemChilds.forEach(function(itemChild) {
						var itemObjType = itemChild.getObjectType().getID();
						if (itemChild.getValue("SI_GSC_Flag").getSimpleValue() == flagExpec || itemChild.getValue("ABC_Update_Flag").getSimpleValue() == flagExpec) {
							payload.steppbid = itemChild.getID();
							payload.stgrecid = itemChild.getValue("SI_Record_ID").getSimpleValue();
							pushObject(pyl, payload.mastcontnum, payload.suppartnum, payload.docnum, payload.doclnnum, payload.desc, payload.car, payload.buyr, payload.fob, payload.frigtterm, payload.payterm, payload.amnt, payload.sourcmangr, payload.startdate, payload.enddate, payload.itemdesc, payload.purchflag, payload.lineenddt, payload.hstatus, payload.errres, payload.contractnum, payload.quote, payload.suppnum, payload.site, payload.attnum, payload.stgrecid, payload.parentid, payload.stepid, payload.steppbid);							
							pbValCnt++;
						} else {
							payload.steppbid = "";
						}
					});
					if (pbValCnt < 1) {						
						pushObject(pyl, payload.mastcontnum, payload.suppartnum, payload.docnum, payload.doclnnum, payload.desc, payload.car, payload.buyr, payload.fob, payload.frigtterm, payload.payterm, payload.amnt, payload.sourcmangr, payload.startdate, payload.enddate, payload.itemdesc, payload.purchflag, payload.lineenddt, payload.hstatus, payload.errres, payload.contractnum, payload.quote, payload.suppnum, payload.site, payload.attnum, payload.stgrecid, payload.parentid, payload.stepid, payload.steppbid);
					}
				} else {
					payload.steppbid = "";
					pushObject(pyl, payload.mastcontnum, payload.suppartnum, payload.docnum, payload.doclnnum, payload.desc, payload.car, payload.buyr, payload.fob, payload.frigtterm, payload.payterm, payload.amnt, payload.sourcmangr, payload.startdate, payload.enddate, payload.itemdesc, payload.purchflag, payload.lineenddt, payload.hstatus, payload.errres, payload.contractnum, payload.quote, payload.suppnum, payload.site, payload.attnum, payload.stgrecid, payload.parentid, payload.stepid, payload.steppbid);
				}
			}
		});
	}	
	return [pyl, objCnt];
}

function checkUserID(user) {
	var userID = "";
	if (user.getID().toUpperCase().contains('@ATT.COM')) userID = user.getID();
	else if (user.getEMail()) {
		if (user.getEMail().toUpperCase().contains('@ATT.COM'))
			//Add validation to check the Email standards
			userID = user.getEMail();
	}
	return userID.toUpperCase();
}
// To Do -- Added by mb916k for attaching CI Report
//function sendEmailNotif(mail, userID, sender, subject, message, instanceName, logger)
function sendEmailNotif(step, node, mail, userID, sender, subject, message, instanceName, logger, assetId) {	
	try {		
		mail.from(sender);
		mail.addTo(userID);
		mail.subject(subject);
		mail.htmlMessage(message);
		// To Do -- Added by mb916k for generating fileName
		var file = generateCIReportFile(node, step);

		var fileInputStream = new java.io.FileInputStream(file);

		// asset and upload file
		var asset = step.getAssetHome().getAssetByID(assetId);

		asset.upload(fileInputStream, assetId);

		var fileName = generateCIReportFileName();

		//mail.plainMessage(message);  
		// To Do -- Added by mb916k for attaching CI Report
		if (asset) {
			mail.attachment().fromAsset(asset).name(fileName).attach();
		}
		// End By mb916k 
		mail.send();

	} catch (e) {
		if (logger) {
			throw(e);
		}
	}
}

function sendTechFailureEmail(step, mail, instanceName, obj) {	
	var sender = instanceName + "-noreply@cloudmail.stibo.com";
	var subject = instanceName + ": GSC Push Issue";
	var body = "Please check the ABC workflow final state id: " + obj.getID().toString() + " for GSC push failures";
	//Send Email to tech users
	var Users = step.getGroupHome().getGroupByID("UG_DG").getUsers().toArray();
	Users.forEach(function(user) {
		var userID = checkUserID(user);
		if (userID) {
			sendEmailNotif(mail, userID, sender, subject, body, instanceName);
		}
	});
}

function supplierAttrfromRef(node, step) {
	var refHome = step.getLinkTypeHome().getClassificationProductLinkTypeByID("BPA_To_Supplier");
	var siteCodeRefs = node.queryClassificationProductLinks(refHome).asList(1);	
	if (siteCodeRefs.size() > 0) {
		var suplierSite = siteCodeRefs.get(0).getClassification();		
		var supplierNumber = suplierSite.getParent().getValue("Supplier_Number").getSimpleValue();		
		var supplierSite = suplierSite.getValue("Supplier_Site_Code").getSimpleValue();		
		node.getValue("SI_Supplier_Number").setSimpleValue(supplierNumber); // This will resets the calculated attribute
		node.getValue("SI_Supplier_Site").setSimpleValue(supplierSite); // This will resets the calculated attribute
	}
}
//Function to generate BPA key
function generateBpaKey(supplierNumber, supplierSiteCode, contractNumber) {
	return supplierNumber + "_" + supplierSiteCode + "_" + contractNumber;
}
//Function to generate CI Supplier Item Key
function generateCiItemKey(supplierNumber, supplierSiteCode, contractNumber, attItemNumber) {
	// return supplierNumber + "_" + supplierSiteCode + "_" + contractNumber + "_" + attItemNumber;
	return (supplierNumber ? supplierNumber.trim() : "") + "_" + (supplierSiteCode ? supplierSiteCode.trim() : "") + "_" + (contractNumber ? contractNumber.trim() : "") + "_" + (attItemNumber ? attItemNumber.trim() : "");
}
//Function to generate CI Supplier PartNum Key
function generateCiPartNumKey(supplierNumber, supplierSiteCode, contractNumber, supplierPartNumber) {
	// return supplierNumber + "_" + supplierSiteCode + "_" + contractNumber + "_" + supplierPartNumber;
	return (supplierNumber ? supplierNumber.trim() : "") + "_" + (supplierSiteCode ? supplierSiteCode.trim() : "") + "_" + (contractNumber ? contractNumber.trim() : "") + "_" + (supplierPartNumber ? supplierPartNumber.trim() : "");
}
//Function to generate pb supplier item key
function generatepbItemKey(supplierNumber, supplierSiteCode, contractNumber, attItemNumber, priceBreakQty) {
	//return supplierNumber + "_" + supplierSiteCode + "_" + contractNumber + "_" + attItemNumber + "_" + priceBreakQty;
	return (supplierNumber ? supplierNumber.trim() : "") + "_" + (supplierSiteCode ? supplierSiteCode.trim() : "") + "_" + (contractNumber ? contractNumber.trim() : "") + "_" + (attItemNumber ? attItemNumber.trim() : "") + "_" + (priceBreakQty ? priceBreakQty.trim() : "");
}
//Function to generate pb supplier partnum key
function generatepbPartNumKey(supplierNumber, supplierSiteCode, contractNumber, supplierPartNumber, priceBreakQty) {
	// return supplierNumber + "_" + supplierSiteCode + "_" + contractNumber + "_" + supplierPartNumber + "_" + priceBreakQty;
	return (supplierNumber ? supplierNumber.trim() : "") + "_" + (supplierSiteCode ? supplierSiteCode.trim() : "") + "_" + (contractNumber ? contractNumber.trim() : "") + "_" + (supplierPartNumber ? supplierPartNumber.trim() : "") + "_" + (priceBreakQty ? priceBreakQty.trim() : "");
}

function isAgreementNumberPresent(node) {
	agreementNumber = node.getValue("Agreement_Number").getSimpleValue(); // SI_BPA_Processed_In_Cloud
	if (agreementNumber) {
		return true;
	} else {
		return false;
	}
}

function setNodeName(node) {
	try {
		if (node.getObjectType().getID() == "BPA") {
			var contractNo = node.getValue("SI_Master_Contract_Number").getSimpleValue();
			var name = node.getName();
			if (!name) {
				node.setName(contractNo);
			}
		} else if (node.getObjectType().getID() == "Contract_Item") {
			var partNum = node.getValue("SI_Part_Number").getSimpleValue();
			var itemNum = node.getValue("ATT_Item_Number").getSimpleValue();
			if (itemNum) {
				node.setName(itemNum);
			} else if (partNum) {
				node.setName(partNum);
			}
		} else if (node.getObjectType().getID() == "Price_Break") {
			var partNum = node.getValue("SI_Part_Number").getSimpleValue();
			var itemNum = node.getValue("ATT_Item_Number").getSimpleValue();
			var pbQty = node.getValue("SI_Price_Break_Quantity").getSimpleValue();
			if (itemNum && pbQty) {
				node.setName(itemNum + "_" + pbQty);
			} else if (partNum && pbQty) {
				node.setName(partNum + "_" + pbQty);
			}
		}
	} catch (e) {
		throw(e);
	}
}

function checkDateIfLessthanToday(date) {
	if (date) {
		var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd"); //For ISO date format
		var dateNow = new Date();
		var formattedDateTime = dateTimeFormatter.format(dateNow);
		if (date < formattedDateTime) {
			return true;
		} else if ((date == formattedDateTime) || (date > formattedDateTime)) {
			return false;
		}
	}
}
//checkdate less than today for date format - 22-NOV-24 12.00.00.000000 AM
function isDateInPast(dateStr) {
	var hour = 0;
	var minute = 0;
	var second = 0;
	var milliseconds = 0;
	var [datePart, timePart, meridian] = dateStr.split(' ');
	var [day, monthStr, yearShort] = datePart.split('-');
	var year = parseInt(yearShort) < 50 ? 2000 + parseInt(yearShort) : 1900 + parseInt(yearShort);
	var monthMap = {
		JAN: 0,
		FEB: 1,
		MAR: 2,
		APR: 3,
		MAY: 4,
		JUN: 5,
		JUL: 6,
		AUG: 7,
		SEP: 8,
		OCT: 9,
		NOV: 10,
		DEC: 11
	};
	var month = monthMap[monthStr];
	if (timePart) {
		var timeParts = timePart.split('.');
		hour = parseInt(timeParts[0]);
		minute = parseInt(timeParts[1]);
		// second = parseInt(timeParts[2].substring(0,2)) || 0;
		//var microStr = timeParts[2].substring(2)|| "000000";
		second = parseInt(timeParts[2]);
		milliseconds = parseInt(timeParts[3]);
	}
	if (meridian) {
		if (meridian === "PM" && hour !== 12) hour += 12;
		if (meridian === "AM" && hour === 12) hour = 0;
	}
	var dateObj = new Date(year, month, parseInt(day), hour, minute, second, milliseconds);
	var now = new Date();
	return dateObj < now;
}

function microToMilli(micro) {
	var padded = micro;
	while (padded.length < 6) padded += '0';
	return parseInt(padded.substring(0, 3));
}

function cancelNode(node, step) {	
	cancelFolder = step.getProductHome().getProductByID("ABC_Cancelled");
	deleteKeys(node, step);
	if (node.getObjectType().getID() == "BPA") {
		var children = node.getChildren().toArray();
		children.forEach(function(child) {
			deleteKeys(child, step);
			var pbs = child.getChildren().toArray();
			pbs.forEach(function(pb) {
				deleteKeys(pb, step);
			});
		});
	}
	if (node.getObjectType().getID() == "Contract_Item") {
		var children = node.getChildren().toArray();
		children.forEach(function(child) {
			deleteKeys(child, step);
		});
	}
	node.setParent(cancelFolder);
	node.approve();
}

function deleteKeys(node, step) {
	itemNumKey = node.getValue("SI_Item_Key").getSimpleValue();
	partNumKey = node.getValue("SI_PartNum_Key").getSimpleValue();
	if (itemNumKey) {
		step.getKeyHome().updateUniqueKeyValues2({
			"SI_Item_Key": String("")
		}, node);
	}
	if (partNumKey) {
		step.getKeyHome().updateUniqueKeyValues2({
			"SI_PartNum_Key": String("")
		}, node);
	}
}

function rollBackChanges(node, step) {
	var bpaChild = node.getChildren().toArray();
	if (bpaChild.length > 0) {
		bpaChild.forEach(function(ci) {
			var apprvCI = "";
			var appNode = step.executeInWorkspace("Approved", function(approvedManager) {
				return approvedManager;
			});
			apprvCI = appNode.getProductHome().getProductByID(ci.getID());
			var catalogStatus = ci.getValue("SI_Supplier_Catalog_Status").getID();
			var gscFlag = ci.getValue("SI_GSC_Flag").getID();
			if (!isProcessedInOracle(ci) && catalogStatus == "Rejected" && !apprvCI) {
				cancelNode(ci, step);
			}
			if (gscFlag && catalogStatus == "Rejected" && apprvCI) {
				rollBackandParitialApprove_ABC(ci, step, "Product");
			}
			if (catalogStatus == "Rejected" && apprvCI) {
				var childPB = ci.getChildren().toArray();
				childPB.forEach(function(pb) {
					var apprvPB = "";
					apprvPB = appNode.getProductHome().getProductByID(pb.getID());
					if (apprvPB) rollBackandParitialApprove(pb, step, "Product");
					else cancelNode(pb, step);
				});
			}
		});
	}
}

function publishGSCData(step, node, giep, mailHome, siSuppCatStat) {	
	var pushErrored = false;
	var post = giep.post();
	post.header("InstanceName", "scm-oic-01-idfykvb66dwb-px");
	var pyl = [];
	var objChilds = new java.util.ArrayList();
	objChilds = node.getChildren();
	var messages = null;
	var abcConfigs = step.getEntityHome().getEntityByID("ABC_Attributes_Configurations");
	const chunkSize = Number(abcConfigs.getValue("ABC_GSC_Batch_Limit").getSimpleValue());
	var sendCount = 0;
	if (objChilds.size() > 0) {
		for (var i = 0; i < objChilds.size(); i += chunkSize) {
			pyl = [];
			var chunk = objChilds.subList(i, Math.min(objChilds.size(), i + chunkSize));
			combo = buildPayloadForGscPush(node, chunk, pyl, 'Yes', siSuppCatStat, false);
			messages = combo[0];			
			if (messages) {
				body = calculateBodyForGscPush(messages);
				if (body) {
					sendCount += combo[1];					
					var error = null;
					var invokeReturn = gscInvoke(post, i, objChilds.size(), body, sendCount, pushErrored, mailHome, step, node, error);
					pushErrored = invokeReturn[0];
					sendCount = invokeReturn[1];					
				}
			}
		}
	}
	if (sendCount < 1) {
		if (node.isInState("ABC_Workflow", "Finish")) {
			combo = buildPayloadForGscPush(node, [], [], 'Yes', '', true);
			messages = combo[0];
			if (messages) {
				body = calculateBodyForGscPush(messages);
				if (body) {
					var error = null;
					var invokeReturn = gscInvoke(post, 1, 1, body, sendCount, pushErrored, mailHome, step, node, error);
					pushErrored = invokeReturn[0];
					sendCount = invokeReturn[1];					
				}
			}
		}
	}
	return [pushErrored, sendCount];
}

function gscInvoke(post, i, objChilds, body, sendCount, pushErrored, mailHome, step, node, error) {	
	try {
		var resp = post.path("/").body(body).invoke();
	} catch (e) {
		pushErrored = true;
		var mail = mailHome.mail();
		var instanceName = libAudit.getHostEnvironment();
		sendTechFailureEmail(step, mail, instanceName, node);
		error = e;		
		return [pushErrored, sendCount];
	} finally {
		if (error && error.javaException instanceof com.stibo.gateway.rest.RESTGatewayException) {
			throw "Error GSC push: " + error.javaException.getMessage();
		} else if (error) {
			throw (error);
		}
	}
	//Temp Email Test to verify the GSC Push PayLoad generated by STIBO
	//Delete the code while PROD Deployment
	testUsers = ['mp4057@att.com', 'db415r@att.com', 'ar653x@att.com', 'lz9007@att.com']
	for (z = 0; z < testUsers.length; z++) {
		var sender = instanceName + "-noreply@cloudmail.stibo.com";
		var mail = mailHome.mail();
		var subject = "GSC Push Body Message Num: " + i + " of " + objChilds;
		var instanceName = libAudit.getHostEnvironment();
		sendEmailNotif(mail, testUsers[z], sender, subject, body, instanceName);
	}
	return [pushErrored, sendCount];
}

function setGSCFlagToY(node) {
	node.getValue("SI_GSC_Flag").setLOVValueByID("Y");
}

function setDefaultBuyer(node) {
	node.getValue("SI_Buyer").setLOVValueByID("ATTDOMBUYER");
}

function setDefaultImportSource(node) {
	node.getValue("SI_Import_Source").setSimpleValue("STIBO");
}

function copyItemDescription(node) {
	var desc = node.getValue("SI_ATT_Item_Description").getSimpleValue();
	var itemDesc = node.getValue("SI_Item_Description").getSimpleValue();
	if (!desc) {
		node.getValue("SI_ATT_Item_Description").setSimpleValue(itemDesc);
	}
}

function unApprovedABCAttributes(node, step) {
	var counter = 0;
	if (node.getObjectType().getID() == "BPA") {
		var AttrGrp = step.getAttributeGroupHome().getAttributeGroupByID("AG_ABC_Header_Updatable_Attributes").getAllAttributes();
	}
	if (node.getObjectType().getID() == "Contract_Item") {
		var AttrGrp = step.getAttributeGroupHome().getAttributeGroupByID("AG_ABC_CI_Updatable_Attributes").getAllAttributes();
	}
	var attrList = new java.util.ArrayList();
	AttrGrp.forEach(function(attr) {
		attrList.add(attr.getID())
	});
	var set = new java.util.HashSet();
	var setUnapproved = node.getNonApprovedObjects();
	var unapprovedIterator = setUnapproved.iterator();	
	while (unapprovedIterator.hasNext()) {
		var partObject = unapprovedIterator.next();
		var partObjectStr = partObject.toString();
		if (partObjectStr.indexOf("ValuePartObject") != -1 && attrList.contains(String(partObject.getAttributeID()))) {
			counter++;
		}
	}
	if (counter > 0) return true;
	else return false;
}

function getAcceptedLinesCount(node, step) {	
	var ciCounter = 0;
	var pbCounter = 0;
	if (node.getObjectType().getID() == "BPA") {
		var contractItems = node.getChildren();
		contractItems.forEach(function(contractItem) {
			if (abcValidationLib.isEligibleForPublish(contractItem, step)) ciCounter++;
		});
	}
	if (node.getObjectType().getID() == "Contract_Item") {
		if (abcValidationLib.isEligibleForPublish(node, step)) pbCounter = node.getChildren().toArray().length;
	}	
	return [ciCounter, pbCounter];
}

function buildEmailBody(lines) {
	return lines.join('\n');
}

function addRec(rec, recievers) {
	if (rec !== null) {
		recievers.push(rec);
	}
	return recievers;
}

function stripTags(str) {
	return str.replace(/<\/?[^>]+(>|$)/g, "");
}
// To Do Added by mb916k for attaching CI Report
//function sendRejectMail(node, log, mailHome, step, conManLov, libAudit, lineCount, headerOnly) {
function sendRejectMail(assetId, node, log, mailHome, step, conManLov, libAudit, lineCount, headerOnly) {	
	var testUsers = [];
	//	var curUser = step.getCurrentUser();
	var assignee = node.getWorkflowInstanceByID("ABC_Workflow").getSimpleVariable("Assignee");
	assignee = step.getUserHome().getUserByID(assignee);
	curUserId = checkUserID(assignee);
	if (curUserId) {
		testUsers = addRec(curUserId, testUsers);
	}
	var contAttMangerId = node.getValue("SI_ATT_Contact_Manager").getSimpleValue();
	if (contAttMangerId) {
		contAttMangerId = contAttMangerId.toUpperCase();
		if (contAttMangerId.contains("@ATT.COM") && !testUsers.toString().includes(contAttMangerId))
			//      enable before promoting
			testUsers = addRec(contAttMangerId, testUsers);
	}
	var contMangerName = node.getValue("SI_Contract_Manager").getSimpleValue();
	var suppName = stripTags(String(getSuppName(step, node)));
	if (contMangerName) {
		var contManagerId = findLovIdByValueSimple(conManLov, contMangerName);
	}
	if (contManagerId) {
		contManagerId = contManagerId.toUpperCase() + "@ATT.COM";
		if (!testUsers.toString().includes(contManagerId))
			//      enable before promoting
			testUsers = addRec(contManagerId, testUsers);
	}
	var instanceName = libAudit.getHostEnvironment();
	var subject = "";
	var body = buildBody(curUserId, suppName, node.getValue("SI_Supplier_Number").getSimpleValue(), node.getValue("SI_Supplier_Site").getSimpleValue(), node.getValue("SI_Master_Contract_Number").getSimpleValue(), contAttMangerId, lineCount, "Rejected", headerOnly);
	var sender = instanceName + "-noreply@cloudmail.stibo.com";
	var mail = mailHome.mail();
	if (headerOnly) {		
		subject = "Supplier Catalog Header for " + suppName + " is successfully processed";
		var bpaAgreeNum = node.getValue("Agreement_Number").getSimpleValue();
		var startDate = node.getValue("SI_BPA_Start_Date").getSimpleValue();
		var endDate = node.getValue("SI_BPA_End_Date").getSimpleValue();
		body += headerBodyAdd(contMangerName, bpaAgreeNum, node.getID(), startDate, endDate);
	} else {
		subject = "Supplier Catalog Items for " + suppName + " have been Rejected";
	}
	for (z = 0; z < testUsers.length; z++) {
		sendEmailNotif(step, node, mail, testUsers[z], sender, subject, body, instanceName, log, assetId);
	}
}
//function sendPullMail(node, log, mailHome, step, conManLov, libAudit, lineCount) {
function sendPullMail(assetId, node, log, mailHome, step, conManLov, libAudit, lineCount) {

	var testUsers = [];
	var curUser = step.getCurrentUser();

	curUserId = checkUserID(curUser);

	if (curUserId) {
		testUsers = addRec(curUserId, testUsers);

	}
	var contAttMangerId = node.getValue("SI_ATT_Contact_Manager").getSimpleValue();

	if (contAttMangerId) {
		contAttMangerId = contAttMangerId.toUpperCase();

		if (contAttMangerId.contains("@ATT.COM") && !testUsers.toString().includes(contAttMangerId))
			//      enable before promoting
			testUsers = addRec(contAttMangerId, testUsers);

	}
	var suppName = stripTags(String(getSuppName(step, node)));
	var instanceName = libAudit.getHostEnvironment();
	for (z = 0; z < testUsers.length; z++) {

		var sender = instanceName + "-noreply@cloudmail.stibo.com";
		var mail = mailHome.mail();

		var subject = "Supplier Catalog Items for " + suppName + " have been Pulled from Supplier Portal for Stibo Enrichment";

		var instanceName = libAudit.getHostEnvironment();

		var body = buildBody(curUserId, suppName, node.getValue("SI_Supplier_Number").getSimpleValue(), node.getValue("SI_Supplier_Site").getSimpleValue(), node.getValue("SI_Master_Contract_Number").getSimpleValue(), contAttMangerId, lineCount, "Pulled", false);

		// sendEmailNotif(mail, testUsers[z], sender, subject, body, instanceName, log);
		sendEmailNotif(step, node, mail, testUsers[z], sender, subject, body, instanceName, log, assetId);

	}
}

function headerBodyAdd(contManager, bpaAgreeNum, bpaStepId, startDate, endDate) {
	var body = "Contract Manager: " + contManager + "<br>" + "BPA Agreement Number: " + bpaAgreeNum + "<br>" + "BPA STEP ID: " + bpaStepId + "<br>" + "Start Date: " + startDate + "<br>" + "End Date: " + endDate + "<br>" + "Supplier BPA Cloud Response Status: Successful";
	return body;
}

function buildBody(curUserId, suppName, suppNum, suppSiteCode, masterAgreNum, contAttMangerId, lineCount, type, headerOnly) {
	var body = "Initiated by: " + curUserId + "<br><br>" + "Supplier Name: " + suppName + "<br>" + "Supplier Number: " + suppNum + "<br>" + "Supplier Site Code: " + suppSiteCode + "<br>" + "Master Number: " + masterAgreNum + "<br>" + "Supplier ATT Contact Person: " + contAttMangerId + "<br><br>";
	if (!headerOnly) {
		body += type + " Supplier Item Count: " + lineCount;
	}
	return body;
}

function getSuppName(step, node) {
	var supplierName = "";
	var bpaSupplierType = step.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID('BPA_To_Supplier');
	var bpaSupplierObj = node.queryClassificationProductLinks(bpaSupplierType).asList(1);
	if (bpaSupplierObj.size() > 0) {
		var supplier = bpaSupplierObj.get(0).getClassification();
		supplierName = supplier.getValue("Supplier_Name").getSimpleValue();		
		return supplierName;
	}
}

function findLovIdByValueSimple(lov, seekValue) {
	var foundId = false;
	const validVals = lov.queryValidValues();
	validVals.forEach(function(lval) {
		if (seekValue.toLowerCase() == lval.getValue().toLowerCase()) {
			foundId = lval.getID();
			return false;
		}
		return true;
	});
	return foundId;
}

function clearOffValues(node) {
	node.getValue("SI_GSC_Flag").setSimpleValue(null);
	if (node.getObjectType().getID() == "BPA" || node.getObjectType().getID() == "Contract_Item") node.getValue("ABC_Update_Flag").setSimpleValue(null);
	if (node.getObjectType().getID() == "Contract_Item") node.getValue("ABC_Publish_Oracle").setSimpleValue(null);
}
// To Do Added by mb916k for attaching CI Report
function sendPOStatusEmail(assetId, node, step, conManLov, mailHome, log) {
	log.severe("Into sendPOStatusEmail Function")
	var failCounter = 0;
	var successCounter = 0;
	var failedCIList = new java.util.ArrayList();
	var ciChldrn = node.getChildren().toArray();
	ciChldrn.forEach(function(child) {
		if (child.getValue("ABC_Publish_Oracle").getID() == "Y" && child.getValue("SI_BPA_Cloud_Response_Status").getID() == "F") {
			failCounter++;
			failedCIList.add(child);
		}
		if (child.getValue("ABC_Publish_Oracle").getID() == "Y" && child.getValue("SI_BPA_Cloud_Response_Status").getID() == "S") {
			successCounter++;
		}
	});		
		var [subject, body] = createEmailBody(node, step, failCounter, successCounter, failedCIList);
		var testUsers = [];
		var assignee = node.getWorkflowInstanceByID("ABC_Workflow").getSimpleVariable("Assignee");
		assignee = step.getUserHome().getUserByID(assignee);
		curUserId = checkUserID(assignee);
		if (curUserId) {
			testUsers = addRec(curUserId, testUsers);
		}
		var contAttMangerId = node.getValue("SI_ATT_Contact_Manager").getSimpleValue();
		if (contAttMangerId) {
			contAttMangerId = contAttMangerId.toUpperCase();
			if (contAttMangerId.contains("@ATT.COM") && !testUsers.toString().includes(contAttMangerId))
				//      enable before promoting
				testUsers = addRec(contAttMangerId, testUsers);
		}
		var contMangerName = node.getValue("SI_Contract_Manager").getSimpleValue();
		var suppName = stripTags(String(getSuppName(step, node)));
		if (contMangerName) {
			var contManagerId = findLovIdByValueSimple(conManLov, contMangerName);
		}
		if (contManagerId) {
			contManagerId = contManagerId.toUpperCase() + "@ATT.COM";
			if (!testUsers.toString().includes(contManagerId))
				//      enable before promoting
				testUsers = addRec(contManagerId, testUsers);
		}
		try {
			if (subject && body) {
				var instanceName = libAudit.getHostEnvironment();
				var mail = mailHome.mail();
				var sender = instanceName + "-noreply@cloudmail.stibo.com";
				for (z = 0; z < testUsers.length; z++) {
					//TO DO -- Added by mb916k for mail attachment					
					sendEmailNotif(step, node, mail, testUsers[z], sender, subject, body, instanceName, log, assetId);
				}
			}
		} catch (e) {
			if (e) throw (e)
		}
	}
function createEmailBody(node, step, failCounter, successCounter, failedCIList) {
	var commonEmailBody = createCommonEmailBody(node, step);
	var body = "";
	var subject = "";
	var suppName = stripTags(String(getSuppName(step, node)));
	if (failCounter > 0 || node.getValue("SI_BPA_Cloud_Response_Status").getID() == "F") {
		subject = "Catalog BPA for " + suppName + " | Oracle Processing Complete with Errors | Action Required";
		body = "Stibo has received feedback from Oracle PO for the Catalog BPA below.  One or more Supplier Items completed with errors.<br>Please return to the Catalog Management Workflow, Submission Failed state in Stibo STEP to review the failure reasons and take appropriate actions.<br><br>" + commonEmailBody;
		if (node.getValue("SI_BPA_Cloud_Response_Status").getID() == "S") {
			body += "<br>BPA Oracle Cloud Process Status: Successful<br>";
		}
		if (node.getValue("SI_BPA_Cloud_Response_Status").getID() == "F") {
			body += "<br>BPA Oracle Cloud Process Status: Failed<br>";
		}
		if (successCounter > 0) {
			body += "<br>Successfully Processed Supplier Item Count: " + successCounter + "<br>";
		}
		if (failCounter > 0) {
			body += "<br>Failed Supplier Item Count: " + failCounter + " - Action Required<br>";
		}
	} else {
		if (successCounter > 0 && successCounter == node.getValue("SI_Children_Count").getValue()) {
			subject = "Catalog BPA for " + suppName + " | Oracle Processing Complete | No Action Required";
			body = commonEmailBody;
			if (node.getValue("SI_BPA_Cloud_Response_Status").getID() == "S") {
				body += "<br>BPA Oracle Cloud Process Status: Successful<br>";
			}
			body += "<br>Successfully Processed Supplier Item Count: " + successCounter + "<br>";
		}
		if (successCounter == 0 && failCounter == 0 && node.getValue("SI_BPA_Cloud_Response_Status").getID() == "S") {
			subject = "Catalog BPA for " + suppName + " | Oracle Processing Complete | No Action Required";
			body = commonEmailBody;
			if (node.getValue("SI_BPA_Cloud_Response_Status").getID() == "S") {
				body += "<br>BPA Oracle Cloud Process Status: Successful<br>";
			}
		}
	}
	return [subject, body];
}

function createCommonEmailBody(node, step) {
	var commonBody = "";
	var suppName = stripTags(String(getSuppName(step, node)));
	var curUserId = node.getWorkflowInstanceByID("ABC_Workflow").getSimpleVariable("Assignee");
	commonBody = commonBody + "Initiated by: " + curUserId + "<br>" + "Supplier Name: " + suppName + "<br>" + "Supplier Number: " + node.getValue("SI_Supplier_Number").getValue() + "<br>" + "Supplier Site Code: " + node.getValue("SI_Supplier_Site").getValue() + "<br>" + "Master Contract Number: " + node.getValue("SI_Master_Contract_Number").getValue() + "<br>" + "Supplier ATT Contact Person: " + node.getValue("SI_ATT_Contact_Manager").getValue() + "<br><br>" + "Contract Manager: " + node.getValue("SI_Contract_Manager").getValue() + "<br>" + "BPA Agreement Number: " + node.getValue("Agreement_Number").getValue() + "<br>" + "BPA STEP ID: " + node.getID() + "<br>" + "Start Date: " + node.getValue("SI_BPA_Start_Date").getValue() + "<br>" + "End Date: " + node.getValue("SI_BPA_End_Date").getValue()
	return commonBody;
}
//reparent based on the consumer type attribute value
function reparentNodeOnConsType(node, step) {
	var consType = node.getValue("Consumer_Type").getSimpleValue();
	var consType = consType.split("<multisep/>");
	if (consType) {
		var folderID = "ABC_" + consType[0]
		var parentFolder = step.getProductHome().getProductByID(folderID);
		node.setParent(parentFolder);
	}
}

function getCurrentDate() {
	var date = new Date();
	var dateFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd");
	var formattedDate = dateFormatter.format(date);
	return formattedDate;
}

function checkUser(curUser, manager) {
	var dg_UserGrp = manager.getGroupHome().getGroupByID("UG_DG");
	var catLogMang_UserGrp = manager.getGroupHome().getGroupByID("UG_ABC");
	// var catLogMang_UserGrp = manager.getGroupHome().getGroupByID("UG_ABC_Catalog_Manager");
	var superUser = manager.getGroupHome().getGroupByID("Super user");
	var stiboUser = manager.getGroupHome().getGroupByID("Stibo");
	if (dg_UserGrp.isMember(curUser) || catLogMang_UserGrp.isMember(curUser) || superUser.isMember(curUser) || stiboUser.isMember(curUser)) {
		return true;
	} else {
		return false
	}
}

function deleteKey(node, step, objectType) {
	var supplierItemKey = node.getValue("SI_Item_Key").getSimpleValue();
	var supplierPartNumKey = node.getValue("SI_PartNum_Key").getSimpleValue();
	if (objectType == "BPA" || objectType == "Contract_Item" || objectType == "Price_Break") {
		if (supplierItemKey) {
			step.getKeyHome().updateUniqueKeyValues2({
				"SI_Item_Key": String("")
			}, node);
		}
		if (supplierPartNumKey) {
			step.getKeyHome().updateUniqueKeyValues2({
				"SI_PartNum_Key": String("")
			}, node);
		}
	}
}

function replaceHtml(value) {
    return value.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&lt;/g, "<lt/>").replace(/&gt;/g, "<gt/>");
}

function abcEmailReciever(node, step, conManLov) {
	var abcUsers = [];
	var assignee = node.getWorkflowInstanceByID("ABC_Workflow").getSimpleVariable("Assignee");
	assignee = step.getUserHome().getUserByID(assignee);
	curUserId = checkUserID(assignee);
	if (curUserId) {
		abcUsers = addRec(curUserId, abcUsers);
	}
	var contAttMangerId = node.getValue("SI_ATT_Contact_Manager").getSimpleValue();
	if (contAttMangerId) {
		contAttMangerId = contAttMangerId.toUpperCase();
		if (contAttMangerId.contains("@ATT.COM") && !abcUsers.toString().includes(contAttMangerId))
			//      enable before promoting
			abcUsers = addRec(contAttMangerId, abcUsers);
	}
	var contMangerName = node.getValue("SI_Contract_Manager").getSimpleValue();
	var suppName = stripTags(String(getSuppName(step, node)));
	if (contMangerName) {
		var contManagerId = findLovIdByValueSimple(conManLov, contMangerName);
	}
	if (contManagerId) {
		contManagerId = contManagerId.toUpperCase() + "@ATT.COM";
		if (!abcUsers.toString().includes(contManagerId)) abcUsers = addRec(contManagerId, abcUsers);
	}
	return abcUsers
}

function sendEmailNotif5dayEscalate(mail, userID, sender, subject, message, instanceName, logger) {
	try {
		mail.from(sender);
		mail.addTo(userID);
		mail.subject(subject);
		mail.htmlMessage(message);
		//mail.plainMessage(message);  
		mail.send();
	} catch (e) {
		if (logger) {
			logger.info("common library mail could not be sent, subject: " + subject);
			throw(e);
		}
	}
}

// To Do -- Added by mb916k for replacing commas
function convertCommaChar(val) {
	//return val.replace(',',' ');
	return (val || '').replace(',',' ');
}
// To DO -- Added by mb916k for generting and uploading File
function generateCIReportFile(node, step) {	
	// Build the report content with pipe delimiter
	//var report = "Stibo ID|Supplier Part Number|Validation Errors|Processing Error|Processing Status|Processed|Stibo Parent ID|BPA Number|Master Contract Number|Supplier Number|Site Code|ATT Item Number|Pull Timestamp|Purchasable Flag|Catalog Status|Catalog Reject Reason|Line End Date|ATT Item Description|Supplier Manufacturer Name|Supplier URL|Supplier Manufacturer URL|Supplier Manufacturer Part Number|Supplier Line Type|Supplier ATT Unit Price|Supplier Market List Price|Supplier Item Description|Supplier Long Description|UNSPSC Code|Supplier Image URL|Supplier UOM|Supplier Unit Weight|Supplier Max Order Qty|Supplier Min Order Qty|Supplier Lead Time|Supplier Hazardous|Supplier Hazard Type|Supplier Cosign Flag|Supplier Punch Out Enabled|Supplier BPA Processed In Cloud\n";
	
	var report = "Stibo ID,Supplier Part Number,Validation Errors,Processing Error,Processing Status,Processed,Stibo Parent ID,BPA Number,Master Contract Number,Supplier Number,Site Code,ATT Item Number,Pull Timestamp,Purchasable Flag,Catalog Status,Catalog Reject Reason,Line End Date,ATT Item Description,Supplier Manufacturer Name,Supplier URL,Supplier Manufacturer URL,Supplier Manufacturer Part Number,Supplier Line Type,Supplier ATT Unit Price,Supplier Market List Price,Supplier Item Description,Supplier Long Description,UNSPSC Code,Supplier Image URL,Supplier UOM,Supplier Unit Weight,Supplier Max Order Qty,Supplier Min Order Qty,Supplier Lead Time,Supplier Hazardous,Supplier Hazard Type,Supplier Cosign Flag,Supplier Punch Out Enabled,Supplier BPA Processed In Cloud\n";
	var children = node.getChildren().toArray();
	var rows = "";
	children.forEach(function(contractItem) {
		var status = contractItem.getValue("SI_Supplier_Catalog_Status").getSimpleValue();		
		var vals = [
			contractItem.getID(),
			convertSpecialCharOutbound(convertCommaChar(cleanVal(contractItem.getValue("SI_Part_Number").getSimpleValue()))),
			convertSpecialCharOutbound(convertCommaChar(cleanVal(contractItem.getValue("ABC_Validation_Errors").getSimpleValue()))),
			convertSpecialCharOutbound(convertCommaChar(cleanVal(contractItem.getValue("SI_BPA_Cloud_Error_Reason").getSimpleValue()))),
			contractItem.getValue("SI_BPA_Cloud_Response_Status").getSimpleValue(),
			contractItem.getValue("SI_BPA_Processed_In_Cloud").getSimpleValue(),			
			contractItem.getParent().getID(),
			convertSpecialCharOutbound(convertCommaChar(cleanVal(contractItem.getValue("Agreement_Number").getSimpleValue()))),
			convertSpecialCharOutbound(convertCommaChar(cleanVal(contractItem.getValue("SI_Master_Contract_Number").getSimpleValue()))),
			convertSpecialCharOutbound(convertCommaChar(cleanVal(contractItem.getValue("SI_Supplier_Number").getSimpleValue()))),
			convertSpecialCharOutbound(convertCommaChar(cleanVal(contractItem.getValue("SI_Supplier_Site").getSimpleValue()))),
			convertSpecialCharOutbound(convertCommaChar(cleanVal(contractItem.getValue("ATT_Item_Number").getSimpleValue()))),
			contractItem.getValue("SI_Pull_TimeStamp").getSimpleValue(),
			contractItem.getValue("SI_Purchasable_Flag").getSimpleValue(),
			contractItem.getValue("SI_Supplier_Catalog_Status").getSimpleValue(),			
			convertSpecialCharOutbound(convertCommaChar(cleanVal(contractItem.getValue("SI_Supplier_Catalog_Reject_Reason").getSimpleValue()))),
			contractItem.getValue("SI_Line_End_Date").getSimpleValue(),
			convertSpecialCharOutbound(convertCommaChar(contractItem.getValue("SI_ATT_Item_Description").getSimpleValue())),
			convertSpecialCharOutbound(convertCommaChar(cleanVal(contractItem.getValue("SI_Manufacturer_Name").getSimpleValue()))),
			convertSpecialCharOutbound(convertCommaChar(cleanVal(contractItem.getValue("SI_Supplier_URL").getSimpleValue()))),
			convertSpecialCharOutbound(convertCommaChar(cleanVal(contractItem.getValue("SI_Manufacturer_URL").getSimpleValue()))),
			convertSpecialCharOutbound(convertCommaChar(cleanVal(contractItem.getValue("SI_Manufacturer_Part_Number").getSimpleValue()))),
			contractItem.getValue("SI_Line_Type").getSimpleValue(),
			contractItem.getValue("SI_ATT_Unit_Price").getSimpleValue(),
			contractItem.getValue("SI_Market_List_Price").getSimpleValue(),
			convertSpecialCharOutbound(convertCommaChar(contractItem.getValue("SI_Item_Description").getSimpleValue())),
			convertSpecialCharOutbound(convertCommaChar(contractItem.getValue("SI_Long_Description").getSimpleValue())),
			contractItem.getValue("UNSPSC_Code").getSimpleValue(),
			convertSpecialCharOutbound(convertCommaChar(cleanVal(contractItem.getValue("SI_Image_URL").getSimpleValue()))),
			contractItem.getValue("SI_UOM").getSimpleValue(),
			contractItem.getValue("SI_Unit_Weight").getSimpleValue(),
			contractItem.getValue("SI_Max_Order_Qty").getSimpleValue(),
			contractItem.getValue("SI_Min_Order_Qty").getSimpleValue(),
			contractItem.getValue("SI_Lead_Time").getSimpleValue(),
			contractItem.getValue("SI_Hazardous").getSimpleValue(),
			convertSpecialCharOutbound(convertCommaChar(cleanVal(contractItem.getValue("SI_Hazard_Type").getSimpleValue()))),
			contractItem.getValue("Consign_Flag").getSimpleValue(),
			contractItem.getValue("SI_Punch_Out_Enabled").getSimpleValue(),
			contractItem.getValue("SI_BPA_Processed_In_Cloud").getSimpleValue()
		];
		rows += vals.join(",") + "\n";
	});
	report += rows;
	// Create timestamped file name
	var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd_HH.mm.ss");
	var formattedDateTimeFile = dateTimeFormatter.format(new Date());
	var filePath = "/opt/stibo/ABC_CIReport_" + formattedDateTimeFile + ".csv";
	var file = new java.io.File(filePath);
	if (!file.exists()) {
		file.createNewFile();
	}
	var fw = new java.io.FileWriter(file, false);
	fw.write(report);
	fw.flush();
	fw.close();
	return file;
}

function generateCIReportFileName() {
	// Create timestamped file name
	var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd_HH.mm.ss");
	var dateNow = new Date();
	var formattedDateTimeFile = dateTimeFormatter.format(dateNow);
	// Includes timestamp with File name
	var fileName = "ABC_CIReport_" + formattedDateTimeFile + ".csv";
	return fileName;
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.isProcessedInOracle = isProcessedInOracle
exports.setDate = setDate
exports.rollBackandParitialApprove = rollBackandParitialApprove
exports.rollBackandParitialApprove_ABC = rollBackandParitialApprove_ABC
exports.unApprovedAttributes = unApprovedAttributes
exports.setAttrValuefromApprovedWS = setAttrValuefromApprovedWS
exports.partialApprove = partialApprove
exports.partialApproveFields = partialApproveFields
exports.calculateBodyForGscPush = calculateBodyForGscPush
exports.cleanVal = cleanVal
exports.convertSpecialCharOutbound = convertSpecialCharOutbound
exports.pushObject = pushObject
exports.transformRejectReason = transformRejectReason
exports.buildPayloadForGscPush = buildPayloadForGscPush
exports.checkUserID = checkUserID
exports.sendEmailNotif = sendEmailNotif
exports.sendTechFailureEmail = sendTechFailureEmail
exports.supplierAttrfromRef = supplierAttrfromRef
exports.generateBpaKey = generateBpaKey
exports.generateCiItemKey = generateCiItemKey
exports.generateCiPartNumKey = generateCiPartNumKey
exports.generatepbItemKey = generatepbItemKey
exports.generatepbPartNumKey = generatepbPartNumKey
exports.isAgreementNumberPresent = isAgreementNumberPresent
exports.setNodeName = setNodeName
exports.checkDateIfLessthanToday = checkDateIfLessthanToday
exports.isDateInPast = isDateInPast
exports.microToMilli = microToMilli
exports.cancelNode = cancelNode
exports.deleteKeys = deleteKeys
exports.rollBackChanges = rollBackChanges
exports.publishGSCData = publishGSCData
exports.gscInvoke = gscInvoke
exports.setGSCFlagToY = setGSCFlagToY
exports.setDefaultBuyer = setDefaultBuyer
exports.setDefaultImportSource = setDefaultImportSource
exports.copyItemDescription = copyItemDescription
exports.unApprovedABCAttributes = unApprovedABCAttributes
exports.getAcceptedLinesCount = getAcceptedLinesCount
exports.buildEmailBody = buildEmailBody
exports.addRec = addRec
exports.stripTags = stripTags
exports.sendRejectMail = sendRejectMail
exports.sendPullMail = sendPullMail
exports.headerBodyAdd = headerBodyAdd
exports.buildBody = buildBody
exports.getSuppName = getSuppName
exports.findLovIdByValueSimple = findLovIdByValueSimple
exports.clearOffValues = clearOffValues
exports.sendPOStatusEmail = sendPOStatusEmail
exports.createEmailBody = createEmailBody
exports.createCommonEmailBody = createCommonEmailBody
exports.reparentNodeOnConsType = reparentNodeOnConsType
exports.getCurrentDate = getCurrentDate
exports.checkUser = checkUser
exports.deleteKey = deleteKey
exports.replaceHtml = replaceHtml
exports.abcEmailReciever = abcEmailReciever
exports.sendEmailNotif5dayEscalate = sendEmailNotif5dayEscalate
exports.convertCommaChar = convertCommaChar
exports.generateCIReportFile = generateCIReportFile
exports.generateCIReportFileName = generateCIReportFileName