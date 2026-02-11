/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "ATT_BPA_ASL_Library",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "AT&T_Global_Libraries" ],
  "name" : "AT&T BPA ASL Library",
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
 * @author - Mahee
 * STIBO-2011 Prod Support August release
 * WRLN/RTL/ENT_WebUI_STIBO integration with EBS for Automated Supplier List (ASL)
 */

function setConsignOrg(node,manager,refContractItem) {
	log.info("Into setConsignOrg: "+node.getID());
	if(node.getObjectType().getID()=='Contract_Item') {
		var item = returnItem(node, refContractItem);
		var consignOrgCodes = node.getValue('Consign_Org_Code').getValues();
		validCI = validCICheck(node);
		if(validCI == 'Y')
		{
			if(item) {
				var consignChildItems = returnConsignChildItems(item, manager);
					if(consignChildItems) {
						consignChildOrgCodes = returnConsignOrgCodes(consignChildItems, manager);
						if(consignChildOrgCodes) {
							setCIConsignOrgCodes(node,consignChildOrgCodes);
						}
						else if((!consignChildOrgCodes)&&(consignOrgCodes)) {
							setCIBlankConsignOrgCodes(node);
						}
					}
					else if(!consignChildItems && (consignOrgCodes)) {
						setCIBlankConsignOrgCodes(node);
					}
			}
			else if((!item)&&(consignOrgCodes)) {
				setCIBlankConsignOrgCodes(node);
			}
		}
		else {
			//Skip
		}
	}
}

//STIBO-2011 UseCase1
function returnItem(obj, refTypeObj) {
	var itemObjSize = obj.queryReferences(refTypeObj).asList(1).size();
	logger.info(itemObjSize);
	if(itemObjSize>0) {
		var item = obj.queryReferences(refTypeObj).asList(1).get(0).getTarget().getID();
		return item;
	}
	return '';
}

function returnConsignChildItems(objID, step) {
	var obj= step.getProductHome().getProductByID(objID);
	var objChilds = new java.util.ArrayList();
	var objConsignChildIDs = new java.util.ArrayList();
	objChilds = obj.getChildren();
	if(objChilds.size()>0) {
		objChilds.forEach(function(objChild) {
			var objChildID = objChild.getObjectType().getID();
			var objChildConsign = objChild.getValue("Consignment").getSimpleValue();
			var objChildItemStatus = objChild.getValue("Item_Status").getSimpleValue();
			var objChildItemStatus_WRLN = objChild.getValue("Item_Status_WRLN").getID();
			var objChildItemStatus_RTL = objChild.getValue("Item_Status_RTL").getID();
			var objChildItemStatus_ENT = objChild.getValue("Item_Status_ENT").getID();
			var objChildItem_LOB = objChild.getValue("Line_Of_Business").getID();
			if((objChildItem_LOB == 'WRLN') && (objChildID=='Child_Org_Item') && (objChildConsign=='Yes') && (objChildItemStatus_WRLN=='Active S')) {
				objConsignChildIDs.add(objChild.getID());
			}
			else if((objChildItem_LOB == 'RTL') && (objChildID=='Child_Org_Item') && (objChildConsign=='Yes') && ((objChildItemStatus_RTL.startsWith('Act') || objChildItemStatus_RTL == 'Pre Launch' || objChildItemStatus_RTL == 'No Buy' || objChildItemStatus_RTL == 'DSL COL'))) {
				objConsignChildIDs.add(objChild.getID());
			}
			else if((objChildItem_LOB == 'ENT') && (objChildID=='Child_Org_Item') && (objChildConsign=='Yes') && ((objChildItemStatus_ENT.startsWith('Act') || objChildItemStatus_ENT == 'Pre Launch' || objChildItemStatus_ENT == 'No Buy' || objChildItemStatus_ENT == 'DSL COL'))) {
				objConsignChildIDs.add(objChild.getID());
			}
		});
		return objConsignChildIDs;
	}
	return '';
}


function returnConsignOrgCodes(objIDArray, step) {
	var orgCodeArrList = new java.util.ArrayList();	
		objIDArray.forEach(function(objID) {
			var obj = step.getProductHome().getProductByID(objID);
			var orgCode = obj.getValue('Organization_Code').getSimpleValue();
			if(orgCode!=null) {
				orgCodeArrList.add(obj.getValue('Organization_Code').getID()+"");
			}
			
		});	
	return orgCodeArrList;
}

function setCIConsignOrgCodes(obj, orgCodes) {
	var objVal = obj.getValue('Consign_Org_Code').setSimpleValue('');
	orgCodes.forEach(function(orgCode) {
		objVal = obj.getValue('Consign_Org_Code').addValue(orgCode);
	});
	return objVal;
}

function setCIBlankConsignOrgCodes(obj) {
	var objVal = obj.getValue('Consign_Org_Code').setSimpleValue('');
	return objVal;
}

function getConsignFlag(obj, step, WS) {
	var consignFlag = null;
	step.executeInWorkspace(WS, function(WSManager) {
		var WSObj = WSManager.getObjectFromOtherManager(obj);
		if(WSObj) {
			consignFlag = WSObj.getValue('Consignment').getSimpleValue();
		}
	});
	return consignFlag;
}

function getChildOrgParent(obj, step) {
	if(obj != null) {
		var Item = step.getProductHome().getProductByID(obj).getParent();
		if(Item.getObjectType().getID()=='Item') {
			return Item;
		}
	}
}

function validCICheck(obj) {
	var validCI = 'N';
	var ciStatus = obj.getValue('ContractItem_Status').getID();
	var ciProcessed = obj.getValue('BPA_Processed_In_EBS').getID();
	if(ciStatus == 'OPEN'|| (!ciStatus || !ciProcessed)) {
		validCI = 'Y';
	}
	else if((ciStatus == 'CLOSED') && (ciProcessed == 'E')) {
		validCI = 'Y';
	}
	log.info("validCI for "+ obj.getID() + ciStatus+" : "+validCI)
	return validCI;
}

//STIBO-2011 New UseCase2

function validCIRefCheck(obj, step) {
	var ciRefObj = step.getReferenceTypeHome().getReferenceTypeByID('ContractItem_Item');
	var ciList = new java.util.ArrayList();
	var validCIRefInd = 'N';
	var ciNotExpired = null;
	var ciStatus = null;
	var ciParent = null;
	var bpaParent = null;
	var ciProcessed = null;
	var ciExpDate = null;
	var ciExpired = false;
	var bpa = null;
	var bpaObjectID = null;
	var bpaStatusID = null;
	if(obj.getObjectType().getID() == "Child_Org_Item") {
		ciList = obj.getParent().queryReferencedBy(ciRefObj).asList(1000);
		if(ciList) {
			ciList.forEach(function(ci) {
				ciStatus = ci.getSource().getValue('ContractItem_Status').getID();
				ciParent = ci.getSource().getParent().getID();
				bpaParent = ci.getSource().getParent().getParent().getID();
				ciProcessed = ci.getSource().getValue('BPA_Processed_In_EBS').getID();
				if((ciParent != 'CancelledProducts') && (bpaParent != 'CancelledProducts') && (ciParent != 'BPA_Onboarding')) {
					bpa = ci.getSource().getParent();
					bpaObjectID = bpa.getObjectType().getID();
					bpaStatus = bpa.getValue('BPA_Status').getID();
					ciExpDate = bpa.getValue('Expiration_Date').getSimpleValue();
					if(ciExpDate != null) {
						ciNotExpired = checkDateIfLessthanToday(ciExpDate);
					}
					if(bpaObjectID == 'BPA' && (bpaStatus == 'OPEN') && ((ciExpDate == null) || (ciNotExpired == true))) {
						if(ciStatus == 'OPEN') {
							validCIRefInd = 'Y';
						}
						else if((ciStatus == 'CLOSED') && (ciProcessed == 'E')) {
							validCIRefInd = 'Y';
						}
					}
				}
			});
		}
	}
	else if(obj.getObjectType().getID() == "Item") {
		ciList = obj.queryReferencedBy(ciRefObj).asList(1000);
		if(ciList) {
			ciList.forEach(function(ci) {
				ciStatus = ci.getSource().getValue('ContractItem_Status').getID();
				ciParent = ci.getSource().getParent().getID();
				bpaParent = ci.getSource().getParent().getParent().getID();
				ciProcessed = ci.getSource().getValue('BPA_Processed_In_EBS').getID();
				if((ciParent != 'CancelledProducts') && (bpaParent != 'CancelledProducts') && (ciParent != 'BPA_Onboarding')) {
					bpa = ci.getSource().getParent();
					bpaObjectID = bpa.getObjectType().getID();
					bpaStatus = bpa.getValue('BPA_Status').getID();
					ciExpDate = bpa.getValue('Expiration_Date').getSimpleValue();
					if(ciExpDate != null) {
						ciNotExpired = checkDateIfLessthanToday(ciExpDate);
					}
					if(bpaObjectID == 'BPA' && (bpaStatus == 'OPEN') && ((ciExpDate == null) || (ciNotExpired == true))) {
						if(ciStatus == 'OPEN') {
							validCIRefInd = 'Y';
						}
						else if((ciStatus == 'CLOSED') && (ciProcessed == 'E')) {
							validCIRefInd = 'Y';
						}
					}
				}
			});
		}
	}
	logger.info('validCIRefInd '+validCIRefInd);
	return validCIRefInd;
}

function checkDateIfLessthanToday(date) {
	var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd"); //For ISO date format
	var dateNow = new Date();
	var formattedDateTime = dateTimeFormatter.format(dateNow);
	if(date < formattedDateTime) {
		return false;
	}
	else if((date == formattedDateTime) || (date > formattedDateTime)) {
		return true;
	}
}

function validConsgnUpdCheck(obj, step) {
	var ciList = new java.util.ArrayList();
	var validConsgnUpd = 'N';
	if((obj.getObjectType().getID()=='Item')||(obj.getObjectType().getID()=='Child_Org_Item')) {
		var apprConsignFlag = getConsignFlag(obj, step, 'Approved');
		var mainConsignFlag = getConsignFlag(obj, step, 'Main');
		if((apprConsignFlag == null) && (mainConsignFlag == 'Yes')) {
			validConsgnUpd = 'Y';
		}
		else if((apprConsignFlag == 'No') && (mainConsignFlag == 'Yes')) {
			validConsgnUpd = 'Y';
		}
		else if((apprConsignFlag == 'Yes') && (mainConsignFlag == 'No')) {
			validConsgnUpd = 'Y';
		}
	}
	return validConsgnUpd;
}

//Send Email to Sourcing Manager
function getContractMgr(item) {
	if(item.getObjectType().getID() == "Child_Org_Item") {
		if(item.getParent().getValue('Contract_Manager').getLOVValue() != null) {
			var userID = item.getParent().getValue('Contract_Manager').getLOVValue().getID().toLowerCase();
			userID = userID + '@att.com';
			return userID;
		}
	}
	else if(item.getValue('Contract_Manager').getLOVValue() != null) {
		var userID = item.getValue('Contract_Manager').getLOVValue().getID().toLowerCase();
		userID = userID + '@att.com';
		return userID;
	}
	return '';
}

function sendOrgConsgnEmail(item, step, userID, mailHome, instanceName) {
	var message = "";
	var emailBody = "";
	var header1 = "The below Items are associated with the Contract Items listed so the Consignment Organization Code may need to change.<br><br>";									
	var stiboLink = "<!DOCTYPE html><html><body><a href= 'https://att-prod.mdm.stibosystems.com'>STEP</a></body></html>";			
	var guideLink = "<!DOCTYPE html><html><body><a href= 'https://att.sharepoint.com/sites/STIBOSTEPforDataGovernance/SitePages/STEP-by-STIBO.aspx'>BPA User Guide</a></body></html>";				
	var header2 = "STEP Quick Links :"+stiboLink+guideLink+"<br>-----------------------------------------------------------";
	var itemNum = item.getValue("Item_Num").getSimpleValue();	
	message = getEmailNotifMessage(item, step);
	var emailBody = header1+header2+message;
	var subject = itemNum + " Org Consign change was successfully processed";		
	sendEmailNotif(userID, subject, emailBody, mailHome, instanceName);
}

function getEmailNotifMessage(item, step)
{
	var mailMessage="";
	mailMessage = mailMessage + getItemMessage(item, step) + "<br>---------------------------------------------------------";
	return mailMessage;
}

function getItemMessage(item, step) {
	//Email Part1
	var msg = ""
	var itemNum = item.getValue("Item_Num").getSimpleValue();
	var itemStatus = item.getValue("Item_Status").getSimpleValue();
	var newConsign = getConsignFlag(item, step, 'Main');
	var oldConsign = getConsignFlag(item, step, 'Approved');
	var mfg = item.getValue("Mfg_Part_No").getSimpleValue();
	var itemDesc = item.getValue("User_Defined_Item_Description").getSimpleValue();
	var refTypeObj = step.getReferenceTypeHome().getReferenceTypeByID('ContractItem_Item');
	//Email Part2
	var initiator = item.getValue("Submitted_By").getSimpleValue();
	var orgCodeStr = null;
	if((initiator !="")&&(initiator !=null)) {
		initiator = step.getUserHome().getUserByID(initiator);	
		var ID = initiator.getID();
		if(ID.contains("@"))
		  ID = ID.substring(0,ID.indexOf("@"));		
		initiator = initiator.getName()+" ("+ID+")"
	}
	else {
		initiator = ""
	}
	var comments = item.getValue("BPA_Pending_Comments").getSimpleValue();
	if(comments)
	    comments = comments.replace("<multisep/>", " | ");
	var mgr = item.getParent().getValue("Contract_Manager").getSimpleValue();
	var revision = item.getRevision().getName() + " Created By "+ item.getRevision().getUserID() +" on "+  item.getRevision().getEditedDate();
	//Email Part3	
	//if(item.getObjectType().getID() == "Item")
	//	 ContractItems = item.queryReferencedBy(refTypeObj).asList(10000);
	//	 orgCodeStr = null;
	if(item.getObjectType().getID() == "Child_Org_Item") {
		  var pitemStatus = item.getParent().getValue("Item_Status").getSimpleValue();
		  var orgCode = item.getValue("Organization_Code").getSimpleValue();
		  var orgID = item.getValue("Organization_Code").getID();
		  if(orgCode) {
		  	orgCodeStr = orgID+" - "+orgCode;
		  }
		  ContractItems = item.getParent().queryReferencedBy(refTypeObj).asList(10000);
		  logger.info(ContractItems.size());
	}
	//Email consolidation logic	
	msg=msg+ "<br>REVISION DATE: "+revision+"<br><br>ITEM/OIN:     "+itemNum+"<br>MFG PART:     " + mfg +"<br>ITEM STATUS:  "+itemStatus+"<br>DESCRIPTION:  " + itemDesc + 
	"<br><br>AFFECTED ORG: "+orgCodeStr+"<br>PREVIOUS CONSIGNMENT FLAG:   "+oldConsign+"<br>NEW CONSIGNMENT FLAG:   "+newConsign+
	"<br><br>INITIATOR:    " +initiator+"<br>COMMENTS:     "+comments;
	//Email Part4
	msg=msg+"<br><br>CONTRACT ITEMS AFFECTED<br>"
	if(ContractItems.size()>0) {
		ContractItems.forEach(function(ref) {
			var ContractItem = ref.getSource();
			logger.info(ContractItem);
				if((ContractItem.getObjectType().getID()=="Contract_Item")&&(ContractItem.getParent().getID()!="CancelledProducts")&&(ContractItem.getParent().getID()!="BPA_Onboarding")&&(ContractItem.getParent().getParent().getID()!="CancelledProducts")) {
					var ciStatus = ref.getSource().getValue('ContractItem_Status').getID();
					var bpa = ContractItem.getParent();
					var bpaObjectID = bpa.getObjectType().getID();
					var bpaStatus = bpa.getValue('BPA_Status').getID();
					var ciExpDate = bpa.getValue('Expiration_Date').getSimpleValue();
					var ciNotExpired = null;
					var ciProcessed = ref.getSource().getValue('BPA_Processed_In_EBS').getID();
					var ContractItemID = ContractItem.getID();
					var ContractItemName = ContractItem.getName();
					var ContractItemStatus = ContractItem.getValue('BPA_Processed_In_EBS').getSimpleValue();
					var expiryDate = ContractItem.getValue('Expiration_Date').getSimpleValue();
					var legacyContractNumber = ContractItem.getValue('BPA_Legacy_Contract_No').getSimpleValue();
					var BPAgreementNo = ContractItem.getValue('Oracle_Contract_Num').getSimpleValue();
					var bpaSupplierType = step.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID('BPA_To_Supplier');
					var bpaSupplierObj = ContractItem.getParent().queryClassificationProductLinks(bpaSupplierType).asList(1);
					if(bpaSupplierObj.size()>0) {
						var supplier = bpaSupplierObj.get(0).getClassification();
						var supplierName = supplier.getName();
						logger.info(supplierName);
					}
					if(ciExpDate != null) {
						ciNotExpired = checkDateIfLessthanToday(ciExpDate);
					}
					if(bpaObjectID == 'BPA' && (bpaStatus == 'OPEN') && ((ciExpDate == null) || (ciNotExpired == true))) {
						if(ciStatus == 'OPEN') {
							msg = msg + "<br>ContractItem STEP ID: "+ContractItemID+" | NAME: "+ContractItemName+" | BPA Processed In EBS: "+ContractItemStatus+" | Expiry Date: "+ciExpDate+" | Legacy Contract Number: "+legacyContractNumber+" | BPA#: "+BPAgreementNo+" | Supplier: "+supplierName+"<br>";
						}
						else if((ciStatus == 'CLOSED') && (ciProcessed == 'E')) {
							msg = msg + "<br>ContractItem STEP ID: "+ContractItemID+" | NAME: "+ContractItemName+" | BPA Processed In EBS: "+ContractItemStatus+" | Expiry Date: "+ciExpDate+" | Legacy Contract Number: "+legacyContractNumber+" | BPA#: "+BPAgreementNo+" | Supplier: "+supplierName+"<br>";
						}
					}
				}
		});
	}
	logger.info("msg "+msg);
	return msg;
}



function sendEmailNotif(userID, subject, message, mailHome, instanceName) {
  var mail = mailHome.mail();
  //var instanceName = libAudit.getHostEnvironment(); //STIBO-1862
  var sender = instanceName + "-noreply@cloudmail.stibo.com";
  mail.from(sender);
  mail.addTo(userID);
  mail.subject(subject);
  mail.htmlMessage(message);
  mail.send();
}

function validateRegionData(node,refItem,step){
  var error = "";
  var lob = refItem.getValue("Line_Of_Business").getID();
  var material = refItem.getValue("Material_Item_Type_Web").getID();
  if(lob == "WRLN" && (material == "Minor Material" || material == "Cable")){
  var CIRegDistList = new java.util.ArrayList();
  var consignOrgList = new java.util.ArrayList();
  var apprConsignOrgList = new java.util.ArrayList();

  //Get the Region(s) for Zoom Form List
  cItemRegDistCenter = node.getValue("CI_Region_Distribution_Center").getValues();
  for (var i = 0; i < cItemRegDistCenter.size(); i++) {
    CIRegDistList.add(cItemRegDistCenter.get(i).getID());
  }
  log.info("CIRegDistList:" + CIRegDistList);

  //Get the Consigned Orgs List
  var consignOrgs = node.getValue("Consign_Org_Code").getValues();
  for (var j = 0; j < consignOrgs.size(); j++) {    
    consignOrgList.add(consignOrgs.get(j).getValue());
  }
  log.info("consignOrgList:" + consignOrgList);

  //Get the Approved Consigned Orgs List
  var status = node.getValue("BPA_Processed_In_EBS").getID();
  if (status == "Y") {
    var approvedManager = step.executeInWorkspace("Approved", function(stepApr) {
      return stepApr;
    });
    var approvedNode = approvedManager.getProductHome().getProductByID(node.getID());
    if (approvedNode) {
      var apprConsignOrgs = approvedNode.getValue("Consign_Org_Code").getValues();
      for (var k = 0; k < apprConsignOrgs.size(); k++) {        
        apprConsignOrgList.add(apprConsignOrgs.get(k).getValue());
      }
    }
  }
  log.info("apprConsignOrgList:"+apprConsignOrgList)

  var consignChildItems = returnConsignChildItems(refItem.getID(), step);
  if(consignChildItems)
    var consignOrgCodes = returnConsignOrgCodes(consignChildItems,step);  
  if(consignOrgCodes.size() >0){
	  if(CIRegDistList.size() >0){
	  	for(var p=0;p<CIRegDistList.size();p++){
	  		reg = CIRegDistList.get(p);
	  		/*if(status =="Y" && consignOrgCodes.contains(reg) && !consignOrgList.contains(reg) && !CIRegDistList.contains("All Regions")) && !apprConsignOrgList.contains(reg))
	  		   error += "Please take action, either add "+reg+" to the Consignment Organization Code list Or remove from Region(s) for Zoom Form - ADD ONLY dropdown and then click on Set Values."; */
	  		if(consignOrgCodes.contains(reg) && !consignOrgList.contains(reg) && !CIRegDistList.contains("All Regions"))
	  		   error += "\nPlease take action, either add "+reg+" to the Consignment Organization Code list Or remove from Region(s) for Zoom Form - ADD ONLY dropdown and then click on Set Values."; 
	  	}
	  }
	 /* if(consignOrgList.size() >0){
	  	for(var q=0;q<consignOrgList.size();q++){
	  		consignOrg = consignOrgList.get(q);
	  		if(consignOrgCodes.contains(consignOrg) && !apprConsignOrgList.contains(consignOrg) 
	  		   && !CIRegDistList.contains(consignOrg) && !CIRegDistList.contains("All Regions") )
	  		   error += "\nPlease take action, either select "+consignOrg+" from Region(s) for Zoom Form - ADD ONLY dropdown or remove from Consignment Organization Code list and then click on Set Values.";  		  
	  		/*if(status != "Y" && consignOrgCodes.contains(consignOrg) && !CIRegDistList.contains(consignOrg) && !CIRegDistList.contains("All Regions"))
	  		   error += "Please add "+consignOrg+" in the Region add only dropdown or remove from consignment org code list."; 	*/	   
	  	//}
	  //}
  }
  }
  return error;
}

function populateConsignOrgs_WRLN(node,refItem,manager){
  node.getValue("Consign_Org_Code").setSimpleValue("");
	log.info("Into populateConsignOrgs_WRLN");
  var errMsg ="";
  var CIRegDistList = new java.util.ArrayList();
  var consignList = new java.util.ArrayList();
  var childDefaultOrgs = new java.util.ArrayList();  
  var consignOrgCodes = new java.util.ArrayList(); 
  
  var entityObj = manager.getEntityHome().getEntityByID("ItemAttributes_Hierarchy");
  var entityValue = entityObj.getValue("WRLN_Default_Child_Orgs").getSimpleValue();
  entityValue = entityValue.split(",");
  for (s=0;s<entityValue.length;s++){
  	childDefaultOrgs.add(s)
  }
  
  cItemRegDistCenter = node.getValue("CI_Region_Distribution_Center").getValues();
  for (var i = 0; i < cItemRegDistCenter.size(); i++) {
	    CIRegDistList.add(cItemRegDistCenter.get(i).getID());
	  }	
  consignOrgsList = node.getValue("Consign_Org_Code").getValues();
  for (var j = 0; j < consignOrgsList.size(); j++) {
	    consignList.add(consignOrgsList.get(j).getValue());
	  }	  		
  log.info("CIRegDistList:" + CIRegDistList+CIRegDistList.size());
  var consignChildItems = returnConsignChildItems(refItem.getID(), manager);
  if(consignChildItems){
     consignOrgCodes = returnConsignOrgCodes(consignChildItems,manager);
  }
  //log.info("consignOrgCodes:" + consignOrgCodes+consignOrgCodes.size());
	  if(CIRegDistList.size() >0){    
	  	if(!CIRegDistList.contains("All Regions"))	{
	  	 if(consignOrgCodes.size() >0){
		  	for(var p=0;p<CIRegDistList.size();p++){
		  		log.info("reg:" +CIRegDistList.get(p))		  		
			  		if(consignOrgCodes.contains(CIRegDistList.get(p))){
			  		   if(!consignList.contains(CIRegDistList.get(p)))
			  		       node.getValue("Consign_Org_Code").addValue(CIRegDistList.get(p));
			  		}	
		  		}  
	  	  }		
	  	}
	  	else	{    log.info("All Regions Loop");
	  		     var materialItemType = refItem.getValue("Material_Item_Type").getID();	
	  		     var itemNum = 	refItem.getValue("Item_Num").getValue();
	  			 var childOrgList = new java.util.ArrayList();
			  	 var childOrgs = refItem.getChildren().toArray();
				 childOrgs.forEach(function(child) {
				   var childObjID = child.getObjectType().getID();//post transportation/handling unit creation
                      if(childObjID=="Child_Org_Item"){    
				   var childOrgCode = child.getValue("Organization_Code").getID();    
				   var childItemStatus = child.getValue("Item_Status_WRLN").getID(); 
				   if(childOrgCode != "ASE" && childOrgCode != "WE4" && childItemStatus.startsWith("Act"))
				      childOrgList.add(childOrgCode)     
                      }  
				 });	
				 log.info("materialItemType: "+materialItemType);
				 log.info(childDefaultOrgs.size() == childOrgList.size())
				 
				 if(	 materialItemType == "Cable"){
				 	errMsg += "\n All regions is not applicable for Cable. Please choose a region.";
				 }
				 if (materialItemType == "Minor Material" && childDefaultOrgs.size() != childOrgList.size()) {
					 errMsg += "\n Could not process region selection as " + itemNum + " is not assigned to all child orgs or are not in Active* status. Please work with Technical SME to change item status or review and resubmit.";
				 } 		
				 if( (materialItemType == "Minor Material" && childDefaultOrgs.size() == childOrgList.size()) || 
				        (materialItemType != "Minor Material" && materialItemType != "Cable")){		  				  				  		
		  	        if(consignOrgCodes.size() >0){
		  	         for (var q = 0; q < consignOrgCodes.size(); q++) {	
		  	       	log.info("Child: "+consignOrgCodes.get(q))	  					  		
			  		   if(!consignList.contains(consignOrgCodes.get(q)))
			  		       node.getValue("Consign_Org_Code").addValue(consignOrgCodes.get(q));			  			
		  		    }  
		  	        }			  		  
				 }		  	         
	      }
        }      
      return  errMsg;
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.setConsignOrg = setConsignOrg
exports.returnItem = returnItem
exports.returnConsignChildItems = returnConsignChildItems
exports.returnConsignOrgCodes = returnConsignOrgCodes
exports.setCIConsignOrgCodes = setCIConsignOrgCodes
exports.setCIBlankConsignOrgCodes = setCIBlankConsignOrgCodes
exports.getConsignFlag = getConsignFlag
exports.getChildOrgParent = getChildOrgParent
exports.validCICheck = validCICheck
exports.validCIRefCheck = validCIRefCheck
exports.checkDateIfLessthanToday = checkDateIfLessthanToday
exports.validConsgnUpdCheck = validConsgnUpdCheck
exports.getContractMgr = getContractMgr
exports.sendOrgConsgnEmail = sendOrgConsgnEmail
exports.getEmailNotifMessage = getEmailNotifMessage
exports.getItemMessage = getItemMessage
exports.sendEmailNotif = sendEmailNotif
exports.validateRegionData = validateRegionData
exports.populateConsignOrgs_WRLN = populateConsignOrgs_WRLN