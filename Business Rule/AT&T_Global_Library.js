/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "AT&T_Global_Library",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "AT&T_Global_Libraries" ],
  "name" : "AT&T Global Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ ]
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
 * @author - John[CTS]
 * Global Library
 */
 
var partialApprList = new java.util.ArrayList();

function rollBackandParitialApprove(node, stepManager, objType) {
	
	var nonApprovedObj = node.getNonApprovedObjects().toArray();		
	if (nonApprovedObj.length > 0) {
		
		for (i = 0; i < nonApprovedObj.length; i++) {
			var nonApprovedType = nonApprovedObj[i] + "";			
			if (nonApprovedType.includes("ValuePartObject")) {

				var nonApprovedAttrID = nonApprovedObj[i].getAttributeID();
				setAttrValuefromApprovedWS(node, stepManager, nonApprovedAttrID, objType);
				partialApprList.add(nonApprovedAttrID);	
						
			} else if (nonApprovedType.includes("ClassificationLinkPartObject")) {

				var nonApprovedRefID = nonApprovedObj[i].getClassificationID();			
				setClassificationReffromApprovedWS(node, stepManager);
				
				partialApprList.add(nonApprovedRefID);
			} else if (nonApprovedType.includes("DataContainerPartObject")) {

				if (nonApprovedObj[i].getDataContainerTypeID() == "DC_MiscCharges") {
					setMiscDCfromApprovedWS(node, stepManager);
				} else if (nonApprovedObj[i].getDataContainerTypeID() == "Region") {
					getRegionDCfromApprovedWS(node, stepManager);
				}
			}else if(nonApprovedType.includes("ProductReferencePartObject")){
				var nonApprovedProductRefID = nonApprovedObj[i].getTargetID();										
				setProductRefValuefromApprovedWS(node, stepManager);		
				partialApprList.add(nonApprovedProductRefID);								
			}			
		}

		if (partialApprList.size() > 0) {			
			partialApprove(node, partialApprList);
		}
	}
}

function setProductRefValuefromApprovedWS(node, stepManager){

	var contItemToItemRefObj = stepManager.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
	
	var approvedManager = stepManager.executeInWorkspace("Approved", function(step) {
		return step;
	});
	var approvedNode = approvedManager.getProductHome().getProductByID(node.getID());
	if (approvedNode) {
		var approvedRevisions = approvedNode.getRevisions().toArray();

		if (approvedRevisions.length > 0) {
			var latestRevision = approvedRevisions[0].getNode().getRevision().getName();
			
			 var contItemToItemRef = approvedRevisions[0].getNode().getReferences(contItemToItemRefObj).toArray();
			
			if(contItemToItemRef.length>0){
				var contItemToItemRefID =contItemToItemRef[0].getTarget();
				if (node.getReferences(contItemToItemRefObj).toArray().length > 0) {
						node.getReferences(contItemToItemRefObj).get(0).delete();
				}						
				 node.createReference(contItemToItemRef[0].getTarget(), contItemToItemRefObj);
			}else{								
				if(node.getReferences(contItemToItemRefObj).toArray().length>0)
				     node.getReferences(contItemToItemRefObj).get(0).delete();
			}			
		}
	}
}

function setMiscDCfromApprovedWS(node, stepManager) {

	var approvedManager = stepManager.executeInWorkspace("Approved", function(step) {
		return step;
	});
	var approvedNode = approvedManager.getProductHome().getProductByID(node.getID());
	if (approvedNode) {
		var approvedRevisions = approvedNode.getRevisions().toArray();

		if (approvedRevisions.length > 0) {
			var latestRevision = approvedRevisions[0].getNode().getRevision().getName();
                node.getDataContainerByTypeID("DC_MiscCharges").deleteLocal();
			if (approvedRevisions[0].getNode().getDataContainerByTypeID("DC_MiscCharges").getDataContainers().size() > 0) {
				
				var approvedRevisionMiscDCItr = approvedRevisions[0].getNode().getDataContainerByTypeID("DC_MiscCharges").getDataContainers().iterator();
				while (approvedRevisionMiscDCItr.hasNext()) {					
					var approvedRevisionMiscDcObj = approvedRevisionMiscDCItr.next().getDataContainerObject();
					var chargeStatus = approvedRevisionMiscDcObj.getValue("Scharge_Status").getSimpleValue();
					var serviceAmount = approvedRevisionMiscDcObj.getValue("Service_Amount").getSimpleValue();
					var serviceChargeCode = approvedRevisionMiscDcObj.getValue("Service_Charge_Code").getSimpleValue();
					var flatChargeFlag = approvedRevisionMiscDcObj.getValue("Flat_Charge_Flag").getSimpleValue();
					var zoomFormDetail = approvedRevisionMiscDcObj.getValue("Zoom_form_detail").getSimpleValue();

					var DCkey = stepManager.getHome(com.stibo.core.domain.datacontainerkey.keyhome.DataContainerKeyHome).getDataContainerKeyBuilder("DC_MiscCharges")
						.withAttributeValue("Service_Charge_Code", serviceChargeCode)
						.build();
					var currentNodeMiscDCobj = node.getDataContainerByTypeID("DC_MiscCharges").addDataContainer().createDataContainerObjectWithKey(DCkey);					

					if (chargeStatus) {
						currentNodeMiscDCobj.getValue("Scharge_Status").setSimpleValue(chargeStatus);
					}
					if (serviceAmount) {
						currentNodeMiscDCobj.getValue("Service_Amount").setSimpleValue(serviceAmount);
					}
					
					if (flatChargeFlag) {
						currentNodeMiscDCobj.getValue("Flat_Charge_Flag").setSimpleValue(flatChargeFlag);
					}
					if (zoomFormDetail) {
						currentNodeMiscDCobj.getValue("Zoom_form_detail").setSimpleValue(zoomFormDetail);
					}
					
					partialApprList.add(currentNodeMiscDCobj);					
				}
			} 
		}
	}
}

function getRegionDCfromApprovedWS(node, stepManager) {

var approvedManager = stepManager.executeInWorkspace("Approved", function(step) {
		return step;
	});
	var approvedNode = approvedManager.getProductHome().getProductByID(node.getID());
	if (approvedNode) {
		var approvedRevisions = approvedNode.getRevisions().toArray();

		if (approvedRevisions.length > 0) {
			var latestRevision = approvedRevisions[0].getNode().getRevision().getName();
               node.getDataContainerByTypeID("Region").deleteLocal();
			if (approvedRevisions[0].getNode().getDataContainerByTypeID("Region").getDataContainers().size() > 0) {
				
				var approvedRevisionRegionDCItr = approvedRevisions[0].getNode().getDataContainerByTypeID("Region").getDataContainers().iterator();
				while (approvedRevisionRegionDCItr.hasNext()) {					
					var approvedRevisionRegionDcObj = approvedRevisionRegionDCItr.next().getDataContainerObject();
					var cfasCoCode = approvedRevisionRegionDcObj.getValue("CFAS_CO_Code").getSimpleValue();
					var regionalStatus = approvedRevisionRegionDcObj.getValue("Regional_Status").getSimpleValue();
					var regionDistributionCenter = approvedRevisionRegionDcObj.getValue("BPA_Region_Distribution_Center").getSimpleValue();
					var zip = approvedRevisionRegionDcObj.getValue("ZIP").getSimpleValue();
					var zipAction = approvedRevisionRegionDcObj.getValue("ZIP_Action").getSimpleValue();					
					var state = approvedRevisionRegionDcObj.getValue("STATE").getSimpleValue();					

					var currentNodeRegionDCobj = node.getDataContainerByTypeID("Region").addDataContainer().createDataContainerObject(null);					
					if (cfasCoCode) {						
						currentNodeRegionDCobj.getValue("CFAS_CO_Code").setSimpleValue(cfasCoCode);
					}
					if (regionalStatus) {
						currentNodeRegionDCobj.getValue("Regional_Status").setSimpleValue(regionalStatus);
					}
					if (regionDistributionCenter) {
						currentNodeRegionDCobj.getValue("BPA_Region_Distribution_Center").setSimpleValue(regionDistributionCenter);
					}
					if (zip) {
						currentNodeRegionDCobj.getValue("ZIP").setSimpleValue(zip);
					}
					if (zipAction) {
						currentNodeRegionDCobj.getValue("ZIP_Action").setSimpleValue(zipAction);
					}
					if (state) {
						currentNodeRegionDCobj.getValue("STATE").setSimpleValue(state);
					}
					
					partialApprList.add(currentNodeRegionDCobj);					
				}
			} 
		}
	}	
}

function setClassificationReffromApprovedWS(node, stepManager) {

	var UNCPSCref = stepManager.getLinkTypeHome().getClassificationProductLinkTypeByID("ATT_UNSPSC_Reference");
	var approvedManager = stepManager.executeInWorkspace("Approved", function(step) {
		return step;
	});
	var approvedNode = approvedManager.getProductHome().getProductByID(node.getID());
	if (approvedNode) {
		var approvedRevisions = approvedNode.getRevisions().toArray();

		if (approvedRevisions.length > 0) {

			var latestRevision = approvedRevisions[0].getNode().getRevision().getName();
			if (approvedRevisions[0].getNode().getClassificationProductLinks().get(UNCPSCref).size() > 0) {
				var apprRevRefValue = approvedRevisions[0].getNode().getClassificationProductLinks().get(UNCPSCref).get(0).getClassification();
				if (apprRevRefValue) {

					if (node.getClassificationProductLinks().get(UNCPSCref).size() > 0) {
						node.getClassificationProductLinks().get(UNCPSCref).get(0).delete();
					}
					node.createClassificationProductLink(apprRevRefValue, UNCPSCref);
				}
			} else {
				node.getClassificationProductLinks().get(UNCPSCref).get(0).delete();
			}
		}
	}
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
			if(apprRevAttrValue){
				node.getValue(nonApprovedAttrID).setSimpleValue(apprRevAttrValue);
			}			
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
		}else if (partObjectStr.indexOf("DataContainerPartObject") != -1) {			
			set.add(partObject);
		}else if (partObjectStr.indexOf("ProductReferencePartObject") != -1) {			
			set.add(partObject);
		}		
	}
	if (set.size() > 0) {
		node.approve(set);
	}
}

function trimWhiteSpacesandNewLines(node, step) {
	var trimGrp = step.getAttributeGroupHome().getAttributeGroupByID("AG_TrimTextAttributes");
	var attrs = trimGrp.getAttributes().toArray();
	var attrID = ""
	for (var i = 0; i < attrs.length; i++) {
		attrID = attrs[i].getID();		
		trimSpacesandNewLines(node, attrID);		
	}
}

// // STIBO- 2178 Support Team(July 20 Release)
function trimSpacesandNewLines(node, attrID){
	// Trim leading and trailing spaces. Trim New or blank lines. Convert to single line.
	var attr = node.getValue(attrID).getSimpleValue();
	if(attr){			
		attr = attr+""
		attr = attr.replace(/\n/g, ' ');	 // Regex for triming new lines
		attr = attr.replace(/\s\s+/g, ' '); // Regex for triming multi lines
		node.getValue(attrID).setSimpleValue(attr.trim());
	}
}
// // STIBO- 2178 Support Team(July 20 Release)


function getEmailId(user) {
    var userID = "";
    if (user.getID().contains('@ATT.COM')) {
        userID = user.getID();
    } else if (user.getEMail()) {
        userID = user.getEMail();
    }
    return userID;
}

// STIBO-3410 Prod Support Team April 12 Release
function roundDecimalValue(number){

	var roundedNumber = "";
	if(number){
		//roundedNumber = (number * 100) / 100;  // Remove the trailing zeroes in the decimal place
		roundedNumber = number * 1; 				
	}	
	return roundedNumber;
}
// STIBO-3410 Prod Support Team April 12 Release

// STIBO- 2874 PDH Support Team June 7th Release
function convertToInches(value, unit){
	
	var result = "";
     var unitval = String(unit).toLowerCase();
 
	switch (unitval) {
        case "millimeters": 
            result = value * 0.0393701;
            break;
        case "centimeters":
            result = value * 0.393701;
            break;
        case "inches":
            result = value;
            break;
        default:
            result = "0";
            throw new Error("Unsupported unit: " + unit);
    }
    
    result = Math.ceil(result);
    return result;
    
}

function convertToPounds(value, unit){
	
	var result = "";
     var unitval = String(unit).toLowerCase();
        
	switch (unitval) {
        case "grams": 
            result = value * 0.00220462;
            break;
        case "kilograms":
            result = value * 2.20462;
            break;
        case "pounds":
            result = value;
            break;
        default:
            result = "0";
            throw new Error("Unsupported unit: " + unit);
    }
    	    
    result = Math.ceil(result);
    return result;    
}
// STIBO- 2874 PDH Support Team June 7th Release

/**Corpfin Suppliers Data Pull Functionality**/

function createSupplier(supNo,step,libAudit){	
	var supplierRoot = step.getClassificationHome().getClassificationByID("BPA_Supplier_Root")				
	supplierObj = supplierRoot.createClassification(null, "BPA_Supplier");
	supplierObj.getValue("Supplier_Number").setValue(supNo);	
	libAudit.setDateTime(supplierObj, "Created_Date");	
	return supplierObj;
}

function  updateSupplierAttrs(stiboAttsArray, log, lookuptable, supplier, Obj,step){
    stiboAttsArray.forEach(function(stiboAtt) {
	  var supplierAtt = lookuptable.getLookupTableValue("LT_SupplierPull_AttributeMapping", stiboAtt);
	  if (supplierAtt) {
	  	   var error = "";	  	   
	        Object.keys(supplier).forEach(function(key) {
		        if(key == supplierAtt && supplier[key]){				        				        				        			        	          	           			        	  		        	   
		        	  var supplierValue = replaceHtmlTags(supplier[key]);	        					        	  
		           if(stiboAtt != "Supplier_Number" && stiboAtt != "Supplier_Site_Code"){
		        	      Obj.getValue(stiboAtt).setSimpleValue(supplierValue);		        	      				     				     		                
		           }
		          }	 
             });
	  }
     });
}
function replaceHtmlTags(value) {
    return value.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&lt;/g, "<lt/>").replace(/&gt;/g, "<gt/>");
}
function getStiboAttsForSupplierMap(lookuptable,key){
 var stiboAtts = lookuptable.getLookupTableValue("LT_SupplierPull_AttributeMapping", key);
  return stiboAtts.split(",");
}
  
function buildSupplierPayload(days) {		
    var payload = 
        {"Client":"STIBO"
		//,"LastUpdateDate":"2025-05-08 01:01:01"
		,"LastUpdateDate":String(getPastDateTime(days))
		,"DataFilter":"AND att_cust_type ='DOM'"
}
    return payload;
}

function getPastDateTime(days) {	
	var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	var date = new Date();
	date = dateTimeFormatter.format(date.setDate(date.getDate() - days));	
	return date;
}
function getCorpfinInstanceName(entityObject) {
	var instanceName ="";
     var hostName = java.net.InetAddress.getLocalHost().getHostName();
     var instanceList = entityObject.getValue("Corpfin_Instance_Name").getValue();
	 if (instanceList) {
			instanceListJson = JSON.parse(instanceList);
			Object.keys(instanceListJson).forEach(function(key){
			        if(hostName.startsWith(key)){
					  instanceName = instanceListJson[key];
					}
			});
	}
     return instanceName;
}


function createSupplierSite(supplierObj,supNo,supSiteCode,libAudit){
    supplierSiteObj = supplierObj.createClassification(null, "Supplier_Site");
    supplierSiteObj.getValue("Supplier_Number").setValue(supNo);
    supplierSiteObj.getValue("Supplier_Site_Code").setValue(supSiteCode);	
    supplierSiteObj.getValue("Supplier_SiteCode_Key").setValue(supNo+"_"+supSiteCode);
    libAudit.setDateTime(supplierSiteObj, "Created_Date");		
    return supplierSiteObj;	   
}

function sendEmailNotif(step, mail, userID, sender, subject, message) {		
		mail.from(sender);
		mail.addTo(userID);
		mail.subject(subject);
		//mail.htmlMessage(message);
		mail.plainMessage(message);
		mail.send();
}
// STIBO- 3771 Prod Support Team June 21th Release
function checkUserRole(node, stepManager,itemTypeLT) {

	var itemClassLookupResult = "";
	var userGrps = stepManager.getCurrentUser().getGroups().toString();
	var itemTypeRTL = node.getValue("RTL_Item_Type").getID()+"";		
	var userRoleError = "";

	//const Acc_ItemsList = ['ACCESSORY_3PP', 'ACCESSORY_APPCESSORY', 'ACCESSORY_AUDIO', 'ACCESSORY_BATTERY', 'ACCESSORY_CARADAPTER', 'ACCESSORY_CASE', 'ACCESSORY_CHARGER', 'ACCESSORY_POWER_DATA', 'ACCESSORY_SCREENPRTCT', 'ACCESSORY_SPECIALTY', 'CONVERSION', 'REFURBISH_BATTERY', 'REPLACEMENT_PARTS', 'SECRTY_DIGITAL_LIFE_ACCESSORY']
	//const Device_ItemsList = ['ACV_EQUIP_NONATT_DEVICE', 'COMPUTER', 'CONVERSION', 'ELECTRONIC_3PP', 'ELECTRONIC_NONSERIALIZED', 'ELECTRONIC_SERIALIZED', 'PHONE', 'PHONE_DISPLAY', 'PHONE_PALLET', 'PHONE_PALLET_PIB', 'PHONE_PALLET_PYG', 'PHONE_PREPAID_IDB', 'PHONE_PREPAID_PIB', 'PHONE_PREPAID_PYG', 'PREPAY_CARD_SERIALIZED', 'SECRTY_DIGITAL_LIFE_DEVICE', 'SIM'];
	//const Misc_ItemsList = ['CONVERSION', 'DF_3PL', 'DF_BILL_ONLY', 'DF_COLLATERAL_GENERAL', 'DF_COLLATERAL_INTANG2', 'DF_COLLATERAL_YOUNG_AMERICA', 'DF_FREIGHT', 'EPIN_PREPAY', 'INTANG1', 'INTANG2', 'INTANG2_3PP', 'INTANG3', 'MSSNONSTCK_COLLATERAL', 'MSSNONSTCK_NONATT_ACCESSORY', 'MSSNONSTCK_NONATT_COMPUTER', 'MSSNONSTCK_NONATT_ELECTRONIC', 'MSSNONSTCK_NONATT_PHONE', 'SECRTY_DIGITAL_LIFE_PACKAGE'];
	//const Auction_ItemsList = ['ACV_EQUIP_NONATT_DEVICE', 'COMPUTER', 'ELECTRONIC_3PP', 'ELECTRONIC_NONSERIALIZED', 'ELECTRONIC_SERIALIZED', 'PHONE', 'PHONE_DISPLAY', 'PHONE_PALLET', 'PHONE_PALLET_PIB', 'PHONE_PALLET_PYG', 'PHONE_PREPAID_IDB', 'PHONE_PREPAID_PIB', 'PHONE_PREPAID_PYG', 'PREPAY_CARD_SERIALIZED', 'SECRTY_DIGITAL_LIFE_DEVICE', 'SIM'];

	if (userGrps.contains("UG_RTL_Accessory_Planner") && itemTypeRTL) {
		itemClassLookupResult = itemTypeLT.getLookupTableValue("LT_Item_Type_List", "RTL_Accessory_ItemType_List");
		if (itemClassLookupResult && !itemClassLookupResult.includes(itemTypeRTL)) {
			userRoleError = "User is not privileged to work on Items other than Accessory Types";
		}
	}

	if (userGrps.contains("UG_RTL_Device_Planner") && itemTypeRTL) {
		itemClassLookupResult = itemTypeLT.getLookupTableValue("LT_Item_Type_List", "RTL_Device_ItemType_List");
		if (itemClassLookupResult && !itemClassLookupResult.includes(itemTypeRTL)) {
			userRoleError = "User is not privileged to work on Items other than Device Types";
		}
	}

	if (userGrps.contains("UG_RTL_Misc_Planner") && itemTypeRTL) {
		itemClassLookupResult = itemTypeLT.getLookupTableValue("LT_Item_Type_List", "RTL_Misc_ItemType_List");
		if (itemClassLookupResult && !itemClassLookupResult.includes(itemTypeRTL)) {
			userRoleError = "User is not privileged to work on Items other than Misc. Types";
		}
	}

	if (userGrps.contains("UG_RTL_Auction") && itemTypeRTL) {
		itemClassLookupResult = itemTypeLT.getLookupTableValue("LT_Item_Type_List", "RTL_Auction_ItemsType_List");
		if (itemClassLookupResult && !itemClassLookupResult.includes(itemTypeRTL)) {
			userRoleError = "User is not privileged to work on the selected Item Type";
		}
	}
	
	return userRoleError;
}
// STIBO- 3771 Prod Support Team June 21th Release
/*===== business library exports - this part will not be imported to STEP =====*/
exports.partialApprList = partialApprList
exports.java = java
exports.util = util
exports.ArrayList = ArrayList
exports.rollBackandParitialApprove = rollBackandParitialApprove
exports.setProductRefValuefromApprovedWS = setProductRefValuefromApprovedWS
exports.setMiscDCfromApprovedWS = setMiscDCfromApprovedWS
exports.getRegionDCfromApprovedWS = getRegionDCfromApprovedWS
exports.setClassificationReffromApprovedWS = setClassificationReffromApprovedWS
exports.setAttrValuefromApprovedWS = setAttrValuefromApprovedWS
exports.partialApprove = partialApprove
exports.trimWhiteSpacesandNewLines = trimWhiteSpacesandNewLines
exports.trimSpacesandNewLines = trimSpacesandNewLines
exports.getEmailId = getEmailId
exports.roundDecimalValue = roundDecimalValue
exports.convertToInches = convertToInches
exports.convertToPounds = convertToPounds
exports.createSupplier = createSupplier
exports.updateSupplierAttrs = updateSupplierAttrs
exports.replaceHtmlTags = replaceHtmlTags
exports.getStiboAttsForSupplierMap = getStiboAttsForSupplierMap
exports.buildSupplierPayload = buildSupplierPayload
exports.getPastDateTime = getPastDateTime
exports.getCorpfinInstanceName = getCorpfinInstanceName
exports.createSupplierSite = createSupplierSite
exports.sendEmailNotif = sendEmailNotif
exports.checkUserRole = checkUserRole