/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Item_Common_Derivation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Derivation_Libraries" ],
  "name" : "Item Common Derivation Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Item_Retail_Derivation",
    "libraryAlias" : "retailDerivationLib"
  }, {
    "libraryId" : "AT&T_Global_Library",
    "libraryAlias" : "LibGlobal"
  }, {
    "libraryId" : "BL_Generate_UPC_GTIN",
    "libraryAlias" : "upcGtinLib"
  }, {
    "libraryId" : "BL_Item_Common_Validation",
    "libraryAlias" : "commonValidationLib"
  }, {
    "libraryId" : "AT&T_Audit_Library",
    "libraryAlias" : "auditLib"
  }, {
    "libraryId" : "ATT_BPA_ASL_Library",
    "libraryAlias" : "aslLib"
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
//Function to approve all Objects in ICWF & Partial Approve during Maintenance

function recursiveApproval(node,stepManager,lob,lookupTable){
	var objectType = node.getObjectType().getID();
	//PITEM Full Approval during Creation
	//PITEM or Child Org or Comp SKU Approval during Maintenance
	   node.approve();	   
			
	//1. Full Approval of Child Orgs & CompSKU during PITEM Creation
	//2. Chid Orgs & Comp SKU Partial Approval during PITEM Maintenance
	//3. Full Approval of any new Child Orgs & CompSKU during PITEM Maintenance
	//4. Chid Orgs Partial Approval during Comp SKU Maintenance
	//5. Full Approval of any new Chid Orgs during Comp SKU Maintenance
	if(objectType == "Item" || objectType == "Companion_SKU"){ // Approve CITEM, Comp SKU Creation or Partial Approve Updates during PITEM or Comp SKU Maintenance
	  approveChildren (node, stepManager,lob,lookupTable);
	}
}

function approveChildren(node, stepManager,lob,lookupTable) {    
  var children = node.queryChildren(); 	
  children.forEach(function(child) {  
         var approvalStatus =  child.getApprovalStatus();
		var childObjectType = child.getObjectType().getID();
		log.info(child.getID() +" - " + approvalStatus +" "+childObjectType)
		 //Approves All New Objects created during ICWF & IMWF
        if(approvalStatus == "Not in Approved workspace" && (childObjectType == "Child_Org_Item" || childObjectType =="Companion_SKU")){
		    child.approve();
		}
		//Approves Only the updated attributes during Child/ Companion Propagation rules
		if(approvalStatus == "Partly approved" && (childObjectType == "Child_Org_Item" || childObjectType =="Companion_SKU")){		    
			var set = new java.util.HashSet();
			var unapprovedObjects = child.getNonApprovedObjects().iterator();
			log.info("unapprovedObjects: "+unapprovedObjects)
			 while(unapprovedObjects.hasNext()){				 		    
				var partObject = unapprovedObjects.next();
				var partObjectString = partObject.toString();				
				if(childObjectType == "Child_Org_Item" && partObjectString.indexOf("ValuePartObject") != -1){	
                    var orgCode = child.getValue("Organization_Code").getID();				
                    var attributeId = String(partObject.getAttributeID());	                    
					var orgCodesList = lookupTable.getLookupTableValue("LT_Item_Partial_Approve_Attributes", "childOrg|"+attributeId+"|"+lob);					
					if(orgCodesList && orgCodesList.includes(orgCode)){				
					  set.add(partObject);				
					}
				 }
				 if(childObjectType == "Companion_SKU" && partObjectString.indexOf("ValuePartObject") != -1){					   
				    var companionType = "";
                       var companionTypeValues = child.getValue("Companion_Item_Type").getSimpleValue();
					var companionTypeId = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_Companion_Item_Type_Duplicate").getListOfValuesValueByID(companionTypeValues);	  
					 if(companionTypeId){
						companionType = companionTypeId.getValue();
					 }							 		
                       var attributeId = String(partObject.getAttributeID());
					var companionTypeList = lookupTable.getLookupTableValue("LT_Item_Partial_Approve_Attributes", "companionSKU|"+attributeId);					
					if(companionTypeList && companionType && companionTypeList.includes(companionType))	{				
					  set.add(partObject);				
					}
				 }				 
			}
			log.info("Child Set: "+set)
			if (set.size() > 0) {
				child.approve(set);
			}
		}
		if(childObjectType == "Companion_SKU"){
			approveChildren (child, stepManager,lob,lookupTable);
		}
		return true;
  });
}
//Function to send Item Creation Successfull Email to 
//1. Item Initiator & Contract Manager for all LOBs
//2. Wireline Planners for WRLN LOB
//3. DG Users for OMS Items
function sendItemCreationEmail(node,stepManager,lookupTable,mailHome){
	var subject = "";
	var emailBody ="";	
	var omsSubject = "";
	var omsEmailBody ="";	
	var lob = node.getValue("Line_Of_Business").getID();
	var omsItemNumber = node.getValue("OMS_Item_Number").getValue();
	var lookupResult = lookupTable.getLookupTableValue("LT_Item_Email_Configurations","itemCreation"+lob);
	if(lookupResult){
		var [subject,emailBody] = getSubjectEmailBody(node,stepManager,lookupResult);	
	}
	var emailUsers = [];
	emailUsers = getEmailUsersList(node,stepManager,lookupTable,emailUsers,"usersList");
	if(lob == "WRLN"){
		var material = node.getValue("Material_Item_Type").getID();
		emailUsers = getEmailUsersList(node,stepManager,lookupTable,emailUsers,"WRLN"+material+"UsersList");
	}
	var instanceName = auditLib.getHostEnvironment();
	var mail = mailHome.mail();
	var sender = instanceName + "-noreply@cloudmail.stibo.com";
	emailUsers.forEach(function(userID) {
		log.severe("getEmailUsersList: "+userID)
	sendEmailNotification(stepManager, mail, userID, sender, subject, emailBody);
	});
	if(lob=="ENT" && omsItemNumber == "DUMMY"){
		var lookupResult = lookupTable.getLookupTableValue("LT_Item_Email_Configurations","itemCreationOMS");
		var [omsSubject,omsEmailBody] = getSubjectEmailBody(node,stepManager,lookupResult);  
	     omsEmailUsers = getEmailUsersList(node,stepManager,lookupTable,emailUsers,"DGUsersList");
	     omsEmailUsers.forEach(function(userID) {
			log.severe("getEmailUsersList: "+userID)
	     	sendEmailNotification(stepManager, mail, userID, sender, omsSubject, omsEmailBody);
	     });
	}
}
function getSubjectEmailBody(node,stepManager,lookupResult){
	var subject = "";
	var emailBody ="";
		
	if (lookupResult) {
		lookupResultJson = JSON.parse(lookupResult);
		Object.keys(lookupResultJson).forEach(function(key){
				lookupResultJson[key].forEach(function(value) {				
					var attributeValue = "";				
					var attribute = stepManager.getAttributeHome().getAttributeByID(value);
					if(attribute){
					   if(attribute.hasLOV()){
					    attributeValue = node.getValue(value).getID();
					   }
					   else{		
					   	if(!attribute.isMultiValued())   	
					       attributeValue = node.getValue(value).getValue();
					     else{
					        attributeValue = node.getValue(value).getSimpleValue();
					        if(attributeValue)
					          attributeValue = attributeValue.replace("<multisep/>", " | ");
					     }
					   }
					   if(key == "subject" && attributeValue){
					      subject +=attributeValue+" ";
					   }
					   if(key == "emailBody" && attributeValue){
					      emailBody +=attributeValue;
					   }
					}
					else{
					   if(key == "subject"){
					      subject +=value+" ";
					   }
					   if(key == "emailBody"){
					      emailBody +=value;
					   }
					}
				});		
		});		
	}  
	return [subject,emailBody]  
}

function getEmailUsersList(node,stepManager,lookupTable,emailUsers,searchUser){
	var usersList =lookupTable.getLookupTableValue("LT_Item_Email_Configurations",searchUser);
	if(usersList){	
		usersList = JSON.parse(usersList);
	usersList.forEach(function(user){				
		var attribute = stepManager.getAttributeHome().getAttributeByID(user);
		if(attribute){	
			if(attribute.hasLOV())
			   var userID = node.getValue(user).getID();
			 else
			    var userID = node.getValue(user).getValue();
			if(userID){
				 userID =userID.toLowerCase();
				if(!userID.contains("@att.com")){
					userID = userID + "@att.com";						
				}		
				if(!emailUsers.includes(userID))
					emailUsers.push(userID);		
			}			
		}
		else{
		   var Users = stepManager.getGroupHome().getGroupByID(user).getUsers().toArray();
			Users.forEach(function(currentUser) {
				var userID = getEmailId(currentUser);
				if (userID && !emailUsers.includes(userID))
				  emailUsers.push(userID);
		     });
	     }
     });
	}
	return emailUsers;
}
function getEmailId(user) {
    var userID = "";
    if (user.getID().contains('@ATT.COM')) {
        userID = user.getID();
    } else if (user.getEMail()) {
        userID = user.getEMail();
    }
    return userID;
}
function sendEmailNotification(step, mail, userID, sender, subject, message) {		
		mail.from(sender);
		mail.addTo(userID);
		mail.subject(subject);
		//mail.htmlMessage(message);
		mail.plainMessage(message);
		mail.send();
}
function deleteKey(node, step, objectType) {
  if (objectType == "Child_Org_Item") {
    var childOrgkey = node.getValue("DM_Child_Org_Key").getSimpleValue();
    var childOrgIdentity = node.getValue("Child_Org_Identity").getSimpleValue();
    if (childOrgkey) {
      step.getKeyHome().updateUniqueKeyValues2({
        "DM_Child_Org_Key": String("")
      }, node);
    }
    if (childOrgIdentity) {
      step.getKeyHome().updateUniqueKeyValues2({
        "Child_Org_Identity": String("")
      }, node);
    }
  } else if (objectType == "Companion_SKU") { 
    var companionSkuIdentity = node.getValue("Comp_SKU_Identity").getSimpleValue();
    if (companionSkuIdentity) {
      step.getKeyHome().updateUniqueKeyValues2({
        "Comp_SKU_Identity": String("")
      }, node);
    }
  }
   else if (objectType == "Transportation_Package") {
    var transportationPKG = node.getValue("Transportation_Package_Key").getSimpleValue();
    if (transportationPKG) {
      step.getKeyHome().updateUniqueKeyValues2({
        "Transportation_Package_Key": String("")
      }, node);
    }
  }
 else if (objectType == "Transportation_Handling_Unit") { 
    var transportationHU = node.getValue("Transportation_Handling_Unit_Key").getSimpleValue();
    if (transportationHU) {
      step.getKeyHome().updateUniqueKeyValues2({
        "Transportation_Handling_Unit_Key": String("")
      }, node);
    }
  }
}
//Function to set LOB for all Items in ICWF Start State
function setLOBAndUserItemType(node,stepManager){
	var userItemTypeNTW = node.getValue("User_Item_Type_NTW").getID();
	var userItemTypeWRLN = node.getValue("User_Item_Type_WRLN").getID();
	var userItemTypeRTL = node.getValue("User_Item_Type_RTL").getID();
	var userItemTypeENT = node.getValue("User_Item_Type_ENT").getID();
	var material = node.getValue("Material_Item_Type_Web").getID();
	var itemTypeRTL = node.getValue("RTL_Item_Type").getSimpleValue();
	var itemTypeENT = node.getValue("ENT_Item_Type").getSimpleValue();

	if (!userItemTypeNTW && !material  && !itemTypeRTL  && !itemTypeENT) {
		node.getValue("Line_Of_Business").setLOVValueByID("NTW");	
        setUserItemType(node,stepManager,"NTW");		
	} else if (!userItemTypeWRLN && material  && !itemTypeRTL  && !itemTypeENT ) {
		node.getValue("Line_Of_Business").setLOVValueByID("WRLN");
		setUserItemType(node,stepManager,"WRLN");
	} else if (!userItemTypeRTL  && !material  && itemTypeRTL  && !itemTypeENT) {
		node.getValue("Line_Of_Business").setLOVValueByID("RTL");
		setUserItemType(node,stepManager,"RTL");
	} else if (!userItemTypeENT  && !material  && !itemTypeRTL  && itemTypeENT ) {
		node.getValue("Line_Of_Business").setLOVValueByID("ENT");
		setUserItemType(node,stepManager,"ENT");
	}
}
//Function to set User Item Type for all Items in ICWF Start State
function setUserItemType(node,stepManager,lob) {
   if(lob == "NTW"){
      node.getValue("User_Item_Type_NTW").setLOVValueByID("NETWORK");
   }
   if(lob== "WRLN"){
    var material = node.getValue("Material_Item_Type_Web").getID();
	if (material == "Major Material XPID LE" || material == "Toolsets" || material == "Billing Category Item"){
		node.getValue("User_Item_Type_WRLN").setLOVValueByID("WLN_NON_INV");
	}
	else {
		node.getValue("User_Item_Type_WRLN").setLOVValueByID("WLN_INV");
   }
  }
  if(lob== "RTL" || lob== "ENT"){
     var itemType = node.getValue(lob+"_Item_Type").getID();
	 if(itemType){
	    var itemTypeEntity = stepManager.getEntityHome().getEntityByID(itemType);
		if(itemTypeEntity){
		   if(lob == "RTL"){
			  var userItemType = itemTypeEntity.getValue("RTL_User_Item_Type").getSimpleValue();
		   }
		   if(lob == "ENT"){
			  var userItemType = itemTypeEntity.getValue("Ent_User_Item_Type").getSimpleValue();
		   }
		   if(userItemType){
		      node.getValue("User_Item_Type_"+lob).setLOVValueByID(userItemType);		   
		   }		
		}	 
	 } 
  }
}
//Function to Redirect the Item to the respective LOB's Enrich state in Item Creation & Maintenance Workflows
function redirectWorkflowEnrichState(node,stepManager){
	if(node.getObjectType().getID() == "Item"){
		node.getValue("Organization_Code").setLOVValueByID("MST"); //Defaulting the Org Code to MST for all the master items
	}
	// Auto Proceed to next state based on value of Line_Of_Business 
	var lob = node.getValue("Line_Of_Business").getID();	
	var workflowInstance = node.getWorkflowInstanceByID("Item_Creation_Workflow");
	if (workflowInstance) {
		var icwfFinishTask = workflowInstance.getTaskByID("Finish");
		if (icwfFinishTask) {
			workflowInstance = node.getWorkflowInstanceByID("Item_Maintenance_Workflow");
		}
	}
	else {
	   workflowInstance = node.getWorkflowInstanceByID("Item_Maintenance_Workflow");   
    }
	var assignee = workflowInstance.getSimpleVariable("Assignee");
	var currentUser = stepManager.getUserHome().getUserByID(assignee);
	var userGroups = currentUser.getGroups().toString();
	if (lob == "NTW") {
		workflowInstance.getTaskByID("Start").triggerLaterByID("ToNetworkMobility", null);
	} else if (lob == "WRLN") {
		workflowInstance.getTaskByID("Start").triggerLaterByID("ToWireline", null);
	} else if (lob == "ENT") {
		if (userGroups.contains("UG_DTV_Item_Planner")) {
			workflowInstance.getTaskByID("Start").triggerLaterByID("ToDTV", null);
		} else {
			workflowInstance.getTaskByID("Start").triggerLaterByID("ToEntertainment", null);
		}
	} else if (lob == "RTL") {
		if (userGroups.contains("UG_DTV_Item_Planner")) {
			workflowInstance.getTaskByID("Start").triggerLaterByID("ToDTV", null);
		} else {
			workflowInstance.getTaskByID("Start").triggerLaterByID("ToRetail", null);
		}
	}
}
//Function to return Workflow State
function getWorkflowState(node, workflowId, stateId) {
	var workFlowInstance = node.getWorkflowInstanceByID(workflowId);
	if (workFlowInstance) {
		return workFlowInstance.getTaskByID(stateId);
	}
	else {
	    return null;
}
}

//Function to reassign the item to the Initiator in every state of both the Item Workflows
function setAssignee(step, task, userId) { 
	if (userId) {
		var user = step.getUserHome().getUserById(userId);
		if (user) {
			task.reassign(user);
		}
	}
}
//Function to Initiate Item Creation Workflow or Item Maintenance Workflow
function initiateItemIntoWorkflow(node){
	var objectType = node.getObjectType().getID();
	var itemNumber = node.getValue("Item_Num").getSimpleValue();
	if (objectType == "Item" && !itemNumber && !node.isInWorkflow("Item_Creation_Workflow"))  {
		node.startWorkflowByID("Item_Creation_Workflow", "New Item creation from Smart sheet");
	}
	if ((objectType == "Item" || objectType == "Child_Org_Item" || objectType == "Companion_SKU") && itemNumber && !node.isInWorkflow("Item_Maintenance_Workflow")) {
		node.startWorkflowByID("Item_Maintenance_Workflow", "Item Maintenance Initiated from Smart sheet");
     }
}

function setItemDescription(node,stepManager,lob){
    var attributes = [];
    if(lob == "NTW"){
	     attributes = ["OEM_Full_Name", "Mfg_Part_No", "Reason_Code", "Replacement_Item", "User_Defined_Item_Description"];
	}	 
	else if(lob == "RTL"){
         attributes = ["Description_Prefix","OEM","Marketing_Name","Model","COLOR"];
    }
	else if(lob == "ENT"){
	     attributes = ["Description_Prefix","OEM","User_Defined_Item_Description","Model","COLOR"];
    }
	const attributeValues = [];
    attributes.forEach(function(attribute) {
	    var attributeObject = stepManager.getAttributeHome().getAttributeByID(attribute);
	    if(attributeObject.hasLOV()){
            var attributeValue = node.getValue(attribute).getID();
			}
		else{
		    var attributeValue = node.getValue(attribute).getSimpleValue();
		}
        var convertedValue = convertToUpperCaseAndExcludeHTMLTags(attributeValue);
        attributeValues.push(convertedValue);
    });
	if(lob == "ENT" || lob == "RTL"){
		var derivedDescription = attributeValues.join(" ");
	}
	else if(lob == "NTW"){
	    var derivedDescription = attributeValues.join(",");
    }
    node.getValue("Item_Description").setSimpleValue(derivedDescription);
}


function removeSpecialCharsAndToUpperCase(node, stepManager, bf, attributeId) {
    var attributeValue = node.getValue(attributeId).getSimpleValue();
    var attributeID = stepManager.getAttributeHome().getAttributeByID(attributeId);
    if (attributeValue) {
        var attributeValue = bf.evaluate({
            node: node,
            attr: attributeID
        });
        attributeValue = convertToUpperCaseAndExcludeHTMLTags(attributeValue);
        node.getValue(attributeId).setSimpleValue(attributeValue);
    }
}

function convertToUpperCaseAndExcludeHTMLTags(attributeValue) { //tested 
   if(attributeValue){
    attributeValue = attributeValue.toUpperCase();
    if (attributeValue.includes("<LT/>")) {
        attributeValue = attributeValue.replace("<LT/>", "<lt/>");
    }
    if (attributeValue.includes("<GT/>")) {
        attributeValue = attributeValue.replace("<GT/>", "<gt/>");
    }
   }
    return attributeValue;
}

function convertToUpperCase(node,attributeId){ 
    var attributeValue = node.getValue(attributeId).getSimpleValue();
    if (attributeValue){  
      attributeValue = attributeValue.toUpperCase();
      node.getValue(attributeId).setSimpleValue(attributeValue);
    }
}

//Used to remove junk chars for RTL & ENT LOBs
function removeJunkChars(node,stepManager,attribute,bf) {
	var attributeValue = node.getValue(attribute).getSimpleValue();
	var attributeID = stepManager.getAttributeHome().getAttributeByID(attribute);
	if (attributeValue) {
         var formattedValue = bf.evaluate({      
            node:node,
            attr:attributeID
         });       
        node.getValue(attribute).setSimpleValue(formattedValue);
    }
}

function roundDecimalValue(number) {
    var roundedNumber = "";
    if (number) {
        roundedNumber = number * 1;
    }
    return roundedNumber;
}
// Need to combine roundListPrice & roundDecimalValue
function roundListPrice(node) {
    var listPriceValue = node.getValue("List_Price").getSimpleValue();
    if (listPriceValue) {
        var roundedValue = roundDecimalValue(listPriceValue);
        node.getValue("List_Price").setSimpleValue(roundedValue);
    }
}

function getCurrentDate() { //tested
    var date = new Date();
    var dateFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd");
    var formattedDate = dateFormatter.format(date);
    return formattedDate;
}

function trimWhiteSpacesAndNewLines(node, stepManager) { //tested
    var trimGroup = stepManager.getAttributeGroupHome().getAttributeGroupByID("AG_TrimTextAttributes");
    var attributes = trimGroup.getAttributes().toArray();
    attributes.forEach(function(attribute) {
        var attrId = attribute.getID();
        var value = node.getValue(attrId).getSimpleValue();
        if (value) {
            var trimmed = String(value).replace(/\n/g, ' ').replace(/\s\s+/g, ' ').trim();
            node.getValue(attrId).setSimpleValue(trimmed);
        }
    });
}

function copyAttributeValue(node, targetAttr, sourceAttr, valueType) { 
	var sourceAttributeValue = "";
	if (valueType == "LOV") {
		sourceAttributeValue = node.getValue(sourceAttr).getID();
		if (sourceAttributeValue) {
			node.getValue(targetAttr).setLOVValueByID(sourceAttributeValue);
		}
	} else if (valueType == "Simple") {
		sourceAttributeValue = node.getValue(sourceAttr).getSimpleValue();
		if (sourceAttributeValue) {			             
			node.getValue(targetAttr).setSimpleValue(sourceAttributeValue);
		}
	}
}
function copyAttributeValueIfEmpty(node, targetAttr, sourceAttr, valueType) { 
	var sourceAttributeValue = "";
	if (valueType == "LOV") {
		sourceAttributeValue = node.getValue(sourceAttr).getID();
			node.getValue(targetAttr).setLOVValueByID(sourceAttributeValue);
	} else if (valueType == "Simple") {
		sourceAttributeValue = node.getValue(sourceAttr).getSimpleValue();
			node.getValue(targetAttr).setSimpleValue(sourceAttributeValue);
	}
}

function setDefaultValueIfEmpty(node, attributeId, valueType, defaultValue) { //tested
      if (valueType == "LOV") {
        if (!node.getValue(attributeId).getID()) {
            node.getValue(attributeId).setLOVValueByID(defaultValue);
        }
    } else if (valueType == "Simple") {
        if (!node.getValue(attributeId).getValue()) {
            node.getValue(attributeId).setSimpleValue(defaultValue);
        }
    }
}

function deriveBasedOnItemType(node, stepManager, lob, itemAttribute, entityAttribute, attrType) {
    try {
        if (!node.getValue(itemAttribute).getSimpleValue()) {
            var itemType = node.getValue(lob + "_Item_Type").getID();
            if (itemType) {
                var itemTypeEntityId = stepManager.getEntityHome().getEntityByID(itemType);
                if (itemTypeEntityId) {
                    var derivedAttributeValue = itemTypeEntityId.getValue(entityAttribute).getSimpleValue();
                    if (derivedAttributeValue) {
                        if (attrType == "LOV") {
                            node.getValue(itemAttribute).setLOVValueByID(derivedAttributeValue);
                        } else if (attrType == "Text") {
                            node.getValue(itemAttribute).setSimpleValue(derivedAttributeValue);
                        }
                    }
                }
            }
        }
    } catch (exception) {
        throw (exception);
    }
}

function setConsignmentVariable(node,stepManager){
var wfInstance = node.getWorkflowInstanceByID("Item_Maintenance_Workflow");
var consignment = node.getValue("Consignment").getSimpleValue();
	   if(wfInstance){
	   	var approvedManager = stepManager.executeInWorkspace("Approved", function (step) {
	            return step;
	        });
	     var approvedNode = approvedManager.getProductHome().getProductByID(node.getID());
	     if (approvedNode){
	     	var approvedConsignment = approvedNode.getValue("Consignment").getSimpleValue();
	     }
	   	 if( approvedConsignment != consignment) {
	   	  wfInstance.setSimpleVariable("ConsignUpdt", "Yes");
	   }
	   }
}
/**
 * @author - John, mb916k
 * Rule: Set_Orderable_On_Web_Flag
 */
function setOrderableOnWebFlag(node) {
	
	const itemStatusList = ['ActCOI-NS', 'Active', 'Active D2C', 'ActiveC', 'ActiveCOI', 'Actv DC', 'Actv DEMO', 'Actv NoStk', 'Actv NoWMS', 'ActvNONATT', 'DL Actv DC', 'DSL COL', 'No Buy', 'NonTanS PO', 'NonTanStk', 'Obsolete', 'Phase Out'];
	var customerOrderEnabledFlag = node.getValue("Customer_Order_Enabled_Flag").getID();
	var lob = node.getValue("Line_Of_Business").getID();
	var itemStatus = node.getValue("Item_Status_"+lob).getID();	
	if (customerOrderEnabledFlag == 'Y' && itemStatusList.includes(String(itemStatus))) {
		node.getValue("Orderable_On_Web_Flag").setLOVValueByID('Y');
	} else if (customerOrderEnabledFlag == 'N') {
		node.getValue("Orderable_On_Web_Flag").setLOVValueByID('N');
	}
}

// Added by mb916k - PartialApproveFields
function partialApproveFields(node, idArray) {
	var set = new java.util.HashSet();
	var setUnapproved = node.getNonApprovedObjects();
	var unapprovedIterator = setUnapproved.iterator();	
	while (unapprovedIterator.hasNext()) {
		var partObject = unapprovedIterator.next();
		var partObjectStr = partObject.toString();
		if (partObjectStr.indexOf("ValuePartObject") != -1 && idArray.indexOf(String(partObject.getAttributeID())) != -1) {
			set.add(partObject);
		}
	}	
	if (set.size() > 0) {
		node.approve(set);
	}
}

// Added by mb916k - get AttributeGroup List
function getAttributeGroupList(node, step, attrubteGroupId) {
	var attributeGroup = step.getAttributeGroupHome().getAttributeGroupByID(attrubteGroupId);
	var attributeList = attributeGroup.getAttributes().toArray();
	var attributeID = "";
	var partialApproveList = new java.util.ArrayList();
	attributeList.forEach(function(attr) {
		attributeID = attr.getID();     	
		partialApproveList.add(attributeID);	    
	 });
	return partialApproveList;  
}

function setItemRequestor(node, stepManager) {
	var itemRequestor = node.getValue("Requestor").getSimpleValue();
	if (!itemRequestor) {
		var userID = stepManager.getCurrentUser().getID();
		if (userID && userID.contains('@'))
			userID = userID.substring(0, userID.indexOf('@'));
		node.getValue('Requestor').setSimpleValue(userID);
	}
}

function setHazmatUnNumber(node, lookUpTable) {
    var batteryTechnology = node.getValue("Battery_Technology").getID();
    var batteryPackaging = node.getValue("Battery_Packaging").getID();
    if (batteryTechnology && batteryPackaging) {
        var lookUpResult = lookUpTable.getLookupTableValue("LT_Retail_Hazmat_Un_Number", batteryTechnology + "|" + batteryPackaging);
        if (lookUpResult) {
            node.getValue("Hazmat_Un_Num").setLOVValueByID(lookUpResult);
        }
    }
}

function setSerialGeneration(node,LOB,stepManager) {
    var serializedItemsList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Serialized_Subsidy_Items").getSimpleValue();
    var userItemType = node.getValue("User_Item_Type_"+LOB).getID();
    var productSubType = node.getValue("Product_Sub_Type").getID();
    if (userItemType && productSubType) {
        productSubType = productSubType.toLowerCase();
        if (serializedItemsList.includes(String(userItemType))  && productSubType.contains("serial")) {
            if (!productSubType.contains("non")) {
                node.getValue("Serial_Generation").setLOVValueByID("6");
            }
            else {
                node.getValue("Serial_Generation").setLOVValueByID("1");
        }
    }
    }
}

/**
 * author: Syed
 * Rule  : Set IMEI Type value based on Serial Type attribute. 
 */
function setIMEIType(node) {	
	var serialTypeObj = node.getValue("Serial_Type");
   	 if (serialTypeObj && serialTypeObj.getID()) {
      var serialType = serialTypeObj.getID().toString();
        if (serialType.startsWith("IMEI")) {
            node.getValue("IMEI_Type").setLOVValueByID(serialType);
        }
    }
}
	

/**
 * author: Syed
 * Rule  : Set Intangible_Nonship attribute value based on Stock_Enabled_Flag attrbute value
 */
function setIntangibleNonShippable(node, stepManager) {
	var entATTBVOIPList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("BVoIP_Item").getSimpleValue();
	var entATTWirelineList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Wireline_Item_Types").getSimpleValue();
 	var lob=node.getValue("Line_Of_Business").getID();
	var stockEnabled=node.getValue("Stock_Enabled_Flag").getID();
	var entItemType =node.getValue("ENT_Item_Type").getID();
    if ((lob=="RTL" && stockEnabled == "Y") || (lob =="ENT" && (entATTWirelineList.includes(entItemType) || entATTBVOIPList.includes(entItemType) ) && stockEnabled == "Y")) {
            node.getValue("Intangible_Nonship").setLOVValueByID("N");        
    }
    else {
            node.getValue("Intangible_Nonship").setLOVValueByID("Y"); 
    }                       
}

function clearAttributeValue(node, attribute){
	node.getValue(attribute).setSimpleValue("");
}
function setSourcingNotify(node, stepManager) { //call during Maintenance WF of all LOBs
	var attributesList = stepManager.getEntityHome().getEntityByID("ItemAttributes_Hierarchy").getValue("Notify_SourcingUser_Attributes").getSimpleValue();
	var counter = 0;
	var objectType = node.getObjectType().getID();
	var set = new java.util.HashSet();
	var setUnapproved = node.getNonApprovedObjects();
	var unapprovedIterator = setUnapproved.iterator();
	while (unapprovedIterator.hasNext()) {
		var partObject = unapprovedIterator.next();
		var partObjectStr = partObject.toString();
		if (partObjectStr.indexOf("ValuePartObject") != -1 && attributesList.indexOf(String(partObject.getAttributeID())) != -1) {
			counter++;
		}
	}
	if (counter > 0) {
		node.getValue("Sourcing_Notify").setLOVValueByID("Y");
	}
	//set the variables to initiate the email to Sourcing User
	var approvedManager = stepManager.executeInWorkspace("Approved", function(step) {
		return step;
	});
	var approvedNode = approvedManager.getProductHome().getProductByID(node.getID());
	if (approvedNode) {
		if (objectType == "Item") {
			approvedStatus = approvedNode.getValue("Item_Status_WRLN").getID();
			currentStatus = node.getValue("Item_Status_WRLN").getID();
			if (approvedStatus != currentStatus) {
				node.getValue("Notify_Sourcing_Type").setSimpleValue("Status Change");
			}
		}
		if (objectType == "Child_Org_Item") {
			var lob = node.getValue("Line_Of_Business").getID();
			var materialItemType = node.getValue("Material_Item_Type_Web").getSimpleValue();
			approvedStatus = approvedNode.getValue("Item_Status_WRLN").getID();
			currentStatus = node.getValue("Item_Status_WRLN").getID();
			if (approvedStatus != currentStatus) {
				node.getValue("Prev_Item_Status").setSimpleValue(approvedStatus);
			}
			if (lob == "WRLN" && materialItemType) {
				if (materialItemType == "Minor Material" || materialItemType == "Cable") {
					if ((approvedStatus == "Active S" && currentStatus == "Active NS") || (approvedStatus == "Active NS" && currentStatus == "Active S")) {
						node.getValue("Notify_Change_Type").setSimpleValue("Status Change");
					}
				}
			}
		}
	}
}

/**
 * author : Syed
 * rule	: Derive the Battery Technology Value from Battery Packaging attribute
 */
function setBatteryTechnology(node, stepManager) {
	var lob = node.getValue("Line_Of_Business").getID();
	var entAttWirelineList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Wireline_Item_Types").getSimpleValue();
	var itemTypeENT = node.getValue("ENT_Item_Type").getID();
	var batteryPackaging = node.getValue("Battery_Packaging").getID() + "";
	var retailAccessoryList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Retail_Accessory_Items").getSimpleValue();
	var retailDeviceList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Retail_Device_Items").getSimpleValue();
	var retailDigitalList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Retail_ATT_Digital_Life_Items").getSimpleValue();
	var retailNonAccessoryList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Retail_Non ATT_ Accessory_Items").getSimpleValue();
	var retailNonCollateralList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Retail_Non ATT_ Collateral_Items").getSimpleValue();
	var itemTypeRTL = node.getValue("RTL_Item_Type").getID();

	if (lob == "ENT" && itemTypeENT && entAttWirelineList.includes(itemTypeENT)) {
		if (batteryPackaging == "NONE") {
			node.getValue("Battery_Technology").setLOVValueByID("NONE");
		}
	} 
	else if (lob == "RTL" && itemTypeRTL &&
		(retailAccessoryList.includes(itemTypeRTL) ||
			retailDeviceList.includes(itemTypeRTL) ||
			retailDigitalList.includes(itemTypeRTL) ||
			retailNonAccessoryList.includes(itemTypeRTL) ||
			retailNonCollateralList.includes(itemTypeRTL))) {
		if (batteryPackaging == "NONE") {
			node.getValue("Battery_Technology").setLOVValueByID("NONE");
		}
	}
}

function setItemParent(node, stepManager) {
	var lob = node.getValue("Line_Of_Business").getID();
	var userItemType = '';
	if (lob == "NTW") {
		userItemType = node.getValue("User_Item_Type_NTW").getID();
	} else if (lob == "WRLN") {
		userItemType = node.getValue("User_Item_Type_WRLN").getID();
	} else if (lob == "RTL") {
		userItemType = node.getValue("User_Item_Type_RTL").getID();
	} else if (lob == "ENT") {
		userItemType = node.getValue("User_Item_Type_ENT").getID();
	}
	if (userItemType) {
		userItemType = userItemType.replace(' ', '_');
		var itemCategory = stepManager.getProductHome().getProductByID(userItemType);
		if (itemCategory) {
			node.setParent(itemCategory);
		}
	}
}


function clearAttributeValue(node, attribute){
	node.getValue(attribute).setSimpleValue("");
}

function setSerialGenerationVal(obj,parent,stepManager) {
	const orgCodeList = ['RLO', 'RL1', 'RL2', 'DSW', 'FLC', 'SAM', 'RL3'];
	var productSubType = parent.getValue('Product_Sub_Type').getID();
	if(productSubType) {
	   productSubType = productSubType.toLowerCase();
	}
	if (obj.getObjectType().getID() == "Child_Org_Item") {
		var orgCode = obj.getValue('Organization_Code').getID();		
		if (orgCode && productSubType) {
			if (orgCodeList.includes(String(orgCode)) && productSubType.contains('serial')) {
				if (!productSubType.contains('non')) {
					obj.getValue('Serial_Generation').setLOVValueByID('5');
				}
			}
		}
	}
	if (obj.getObjectType().getID() == "Companion_SKU") {
		var userItemType = parent.getValue('User_Item_Type_RTL').getID();		
		if (userItemType && productSubType) {
		    var serializedItemsList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Serialized_Subsidy_Items").getSimpleValue();
			if (serializedItemsList.includes(userItemType) && productSubType.contains('serial')) {
				if (!productSubType.contains('non')) {
					obj.getValue('Serial_Generation').setLOVValueByID('6');
				} else {
					obj.getValue('Serial_Generation').setLOVValueByID('1');
				}
			}
		}
	}
}

function setUPC(node,stepManager){
   var errorMessage = "";
   var objectType = node.getObjectType().getID();
   var generateNewUPC = node.getValue("Generate_New_UPC").getID();
   var UPC = node.getValue("UPC").getSimpleValue();
   if(!node.getValue("Item_Num").getValue()){
      if(generateNewUPC != "Y" && UPC) {
        errorMessage = setGtinUPC(node,stepManager,UPC);
   	 }
   }
   else{
      if((objectType == "Item" || objectType == "Companion_SKU") && UPC){
	     var approvedUPC = "";
		var approvedManager = stepManager.executeInWorkspace("Approved", function(step) {
			return step;
		});
		var approvedNode = approvedManager.getProductHome().getProductByID(node.getID());
		if (approvedNode) {
			approvedUPC = approvedNode.getValue("UPC").getSimpleValue();
		}
	    if(!approvedUPC ||(approvedUPC != UPC)) {
		    errorMessage = setGtinUPC(node,stepManager,UPC);
	  }
      }
   }
   log.info("inside common derivation setUPC.:"+errorMessage);   
   return errorMessage;   
}

function setGtinUPC(node,stepManager, UPC) {
	var errorMessage = "";
	if (UPC) {
		try {
			oldUpc = node.getValue("UPC_GTIN").getSimpleValue();
			if (oldUpc){
				stepManager.getKeyHome().updateUniqueKeyValues2({"UPC_GTIN": String("")}, node);
			}
			node.getValue("UPC_GTIN").setSimpleValue(UPC);
			log.info("UPC_GTIN Assignment Success");
		} catch (error) {
			//errorMessage = "Please enter valid UPC number or clear off the value for System Generated UPC";
			//throw ("Please enter valid UPC number or clear off the value for System Generated UPC");
			var errormsg = error.toString();
			log.info(errormsg);
			var startIndex1 = errormsg.indexOf("UniqueKeyViolation");
			var startIndex2 = errormsg.indexOf("GTINCheckDigitValidator");  
			var startIndex3 = errormsg.indexOf("GTINUnallowedChar");  
			//log.info("UPC_GTIN Assignment Error: "+error);

			if (startIndex1 > -1) {
                log.info("Error1");    
				errorMessage = "This UPC "+UPC+" exists on another Item. Retry with a new UPC";
            }
            
			if (startIndex2 > -1){
                log.info("Error2");
				errorMessage = "UPC "+UPC+" is invalid as per GTIN Check Digit validation. Please enter valid UPC.";
            }
			
			if (startIndex3 > -1){
                log.info("Error3");
				errorMessage = "UPC "+UPC+" has invalid characters. Please enter valid UPC and retry.";
            }
		}		
	}
	log.info("setGtinUPC errorMessage :"+errorMessage);
	return errorMessage;
}


/*
function setGtinUPC(node,UPC) {
	//var errorMessage = "";
	if (UPC) {
		try {
			node.getValue("UPC_GTIN").setSimpleValue(UPC);
		} catch (error) {
			//errorMessage = "Please enter valid UPC number or clear off the value for System Generated UPC";
			throw ("Please enter valid UPC number or clear off the value for System Generated UPC");
		}		
	}
	//return errorMessage;
}
*/

/**
 * Author: John
 * Rule  : Set Status Controlled Attrbutes values for all LOB
 */
function setStatusControlledAttributesValues(node, statusControlledLookupTable) {

	var lob = node.getValue("Line_Of_Business").getID();
	var itemStatus = "";
	if (lob == "NTW") {
		itemStatus = node.getValue("Item_Status_NTW").getID();
	} else if (lob == "WRLN") {
		itemStatus = node.getValue("Item_Status_WRLN").getID();
	} else if (lob == "RTL") {
		itemStatus = node.getValue("Item_Status_RTL").getID();
	} else if (lob == "ENT") {
		itemStatus = node.getValue("Item_Status_ENT").getID();
	}

	const StatusControlledAttributesList = [
    "Build_In_WIP_Flag",
    "Recipe_Enabled_Flag",
    "Process_Execution_Enabled_Flag",
    "BOM_Enabled_Flag",
    "Invoice_Enabled_Flag",
    "MTL_Transactions_Enabled_Flag",
    "Stock_Enabled_Flag",
    "Customer_Order_Enabled_Flag",
    "Internal_Order_Enabled_Flag",
    "Purchasing_Enabled_Flag"];

  StatusControlledAttributesList.forEach(AttributeID => setStatusControlledAttributeValue(node, statusControlledLookupTable, AttributeID, itemStatus));
}

function setStatusControlledAttributeValue(node, statusControlledLookupTable, statusControlledAttributeID, itemStatus) {

	if (itemStatus) {
		var statusControlledLookupResult = statusControlledLookupTable.getLookupTableValue("LT_Item_Status_Controlled_Attributes", statusControlledAttributeID + "|" + itemStatus);
		if (statusControlledLookupResult) {	
			if(statusControlledAttributeID == "Build_In_WIP_Flag" && !node.getValue(statusControlledAttributeID).getID()){				
				node.getValue(statusControlledAttributeID).setLOVValueByID(statusControlledLookupResult);
			}else if (statusControlledAttributeID != "Build_In_WIP_Flag") {
				node.getValue(statusControlledAttributeID).setLOVValueByID(statusControlledLookupResult);
			}			
		}
	}
}

/**
 * author : Aman, Syed
 * Rule   : List Price value population for Wirline , Retail and Entertainment LOB items
 */
function setListPrice(node) {
   var materialType = node.getValue("Material_Item_Type_Web").getID();
   var listPriceField = node.getValue("List_Price");
   var listPrice = listPriceField.getValue();
   var requestedStandardCost = node.getValue("Requested_Standard_Cost").getSimpleValue();
   var currentStandardCost = node.getValue("Current_Standard_Cost").getSimpleValue();
   var itemType = node.getValue("ENT_Item_Type").getID();
   var lob = node.getValue("Line_Of_Business").getID();
   var mwfInstance = node.getWorkflowInstanceByID("Item_Maintenance_Workflow");
   if (!listPrice) {
      if (lob == "WRLN") {
         if (materialType == "OSP Assembly" || materialType == "OSP Install" || materialType == "OSP Misc Material") {
            listPriceField.setSimpleValue("1");
         } else if (materialType == "Cable" || materialType == "Minor Material") {
            listPriceField.setSimpleValue("0.01");
         }
      }
      if (lob == "RTL" || (lob == "ENT" && itemType != "BVoIP")) {
         if (requestedStandardCost) {
            node.getValue("List_Price").setSimpleValue(requestedStandardCost);
         }
      } else if (mwfInstance) {
         if (lob == "RTL" || (lob == "ENT" && itemType != "BVoIP")) {
         	 if (currentStandardCost) {
         	 	node.getValue("List_Price").setSimpleValue(currentStandardCost);
         	 }            
         }
      }
   }
}

/**
 * author : John
 * Rule   : check whether the attribute is updated from approved workspace
 */
function isAttributeValueChanged(node, stepManager, attributeID) {

	var attributeValueChanged = false;
	var mainWSAttributeValue = "";
	
	mainWSAttributeValue = node.getValue(attributeID).getSimpleValue();	
	if (mainWSAttributeValue) {
		var approvedManager = stepManager.executeInWorkspace("Approved", function(step) {
			return step;
		});
		var approvedNode = approvedManager.getProductHome().getProductByID(node.getID());
		var approvedWSAttributeValue = "";
		if (approvedNode) {			
				approvedWSAttributeValue = approvedNode.getValue(attributeID).getSimpleValue();			
		}
		if (mainWSAttributeValue != approvedWSAttributeValue) {
			attributeValueChanged = true;
			
		}
	}	
	return attributeValueChanged;
}

function setReceiveCloseTolerance(node, stepManager) {
	var itemTypeENT = node.getValue("ENT_Item_Type").getID();
	var entATTBusinessClass = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("BVoIP_Item").getSimpleValue();
	var aTTEntertainmentItemType = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Item_Types").getSimpleValue();
	var matchApprovalLevel = node.getValue("Match_Approval_Level").getID();
	var receiptRequiredFlag = node.getValue("Receipt_Required_Flag").getID();
	var lob = node.getValue("Line_Of_Business").getID();
	if (lob == "ENT") {
		if (itemTypeENT && entATTBusinessClass.includes(itemTypeENT)) {
			if (matchApprovalLevel == "3" || matchApprovalLevel == "4") {
				node.getValue("Receive_Close_Tolerance").setSimpleValue("0");
			} else if (matchApprovalLevel == null || matchApprovalLevel == "2") {
				node.getValue("Receive_Close_Tolerance").setSimpleValue("100");
			}
		}
		if (itemTypeENT && aTTEntertainmentItemType.includes(String(itemTypeENT))) {
			if (receiptRequiredFlag == "Y") {
				node.getValue("Receive_Close_Tolerance").setSimpleValue("0");
			} else if (receiptRequiredFlag == "N") {
				node.getValue("Receive_Close_Tolerance").setSimpleValue("100");
			}
		}
	}
	if (lob == "WRLN") {
		var materialType = node.getValue("Material_Item_Type_Web").getID();
		var objectType = node.getObjectType().getID();
		var itemStatus = node.getValue("Item_Status_WRLN").getID();
		var patternAccount = node.getValue("Pattern_Account_WRLN").getID();
		var itemNumber = node.getValue("Item_Num").getSimpleValue();
		var heci = node.getValue("HECI").getSimpleValue();
		var listPrice = node.getValue("List_Price").getSimpleValue();
		var miccoe = node.getValue("MIC_COE_WRLN").getID();
		var receiveCloseTolerance = node.getValue("Receive_Close_Tolerance");
		var receiptRequiredFlag = node.getValue("Receipt_Required_Flag");
		var matchApprovalLevel = node.getValue("Match_Approval_Level");
		const itemStatusList = ["Phase NS", "Active NS", "Phase NI", "Active NI"];
		const itemStatusListForPlugIn = ["Phase NS", "Active S", "Active NS", "Phase NI", "Active NI"];
		const patternAccountListForMinorMaterial = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "T1", "T2", "T3", "T6"];
		const patternAccountList = ["C7", "C8", "C9"];
		  
		if (objectType == "Item") {
			if (materialType == "Plug-In" && itemNumber == "ATT." + heci) {
				if (itemStatus && patternAccount && itemStatusListForPlugIn.includes(String(itemStatus)) && patternAccountList.includes(String(patternAccount))) {
					receiveCloseTolerance.setSimpleValue("0");
					receiptRequiredFlag.setLOVValueByID("Y");
					matchApprovalLevel.setLOVValueByID("3");
				}
			}
			if (materialType == "Hardwired") {
				if (itemStatus && patternAccount && itemStatusList.includes(String(itemStatus)) && patternAccountList.includes(String(patternAccount))) {
					if (listPrice < 2000 && itemNumber && itemNumber.indexOf("ATT.1") == 0 &&
						(!miccoe || miccoe.indexOf("SAT") != 0)) {
						receiveCloseTolerance.setSimpleValue("100");
						receiptRequiredFlag.setLOVValueByID("N");
						matchApprovalLevel.setLOVValueByID("2");
					} else if ((listPrice >= 2000 && ! heci &&
							(!miccoe || miccoe.indexOf("SAT") != 0)) || itemNumber == "ATT." + heci) {

						receiveCloseTolerance.setSimpleValue("0");
						receiptRequiredFlag.setLOVValueByID("Y");
						matchApprovalLevel.setLOVValueByID("3");
					}
				}
			}
			if (materialType == "Minor Material") {
								
				if (itemStatus && patternAccount && itemStatusList.includes(String(itemStatus)) && patternAccountListForMinorMaterial.includes(String(patternAccount))) {
				
					receiveCloseTolerance.setSimpleValue("100");
					receiptRequiredFlag.setLOVValueByID("N");
					matchApprovalLevel.setLOVValueByID("2");
				}
				if (patternAccount == "T4" && itemStatusList.includes(String(itemStatus))) {
					receiveCloseTolerance.setSimpleValue("0");
					receiptRequiredFlag.setLOVValueByID("Y");
					matchApprovalLevel.setLOVValueByID("3");

				}
			}
			if (materialType == "RTU Expense" || (materialType == "RTU Capital" && (!miccoe || miccoe.indexOf("SAT") !== 0))) {
				if (itemStatus && patternAccount && itemStatusList.includes(String(itemStatus)) && patternAccountList.includes(String(patternAccount))) {
					receiveCloseTolerance.setSimpleValue("100");
					receiptRequiredFlag.setLOVValueByID("N");
					matchApprovalLevel.setLOVValueByID("2");

				}
			}
		}
		if (objectType == "Child_Org_Item" && materialType == "Minor Material") {
			if (itemStatus == "Active S" && patternAccount && patternAccountListForMinorMaterial.includes(String(patternAccount))) {
				receiveCloseTolerance.setSimpleValue("0");
				receiptRequiredFlag.setLOVValueByID("Y");
				matchApprovalLevel.setLOVValueByID("3");
			}
		}
	}
}

function setReceiptRequiredFlag(node, stepManager) {
	var lob = node.getValue("Line_Of_Business").getID();
	var itemTypeENT = node.getValue("ENT_Item_Type").getID();
	var aTTEntertainmentItemType = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Item_Types").getSimpleValue();
	var matchApprovalLevel = node.getValue("Match_Approval_Level").getID();
	if (lob == "ENT" && itemTypeENT) {
		if (itemTypeENT == "BVoIP" || aTTEntertainmentItemType.includes(itemTypeENT)) {
			if (matchApprovalLevel == "3" || matchApprovalLevel == "4") {
				node.getValue("Receipt_Required_Flag").setLOVValueByID("Y");
			} else if (!matchApprovalLevel || matchApprovalLevel == "2") {
				node.getValue("Receipt_Required_Flag").setLOVValueByID("N");
			}
		}
	}
}

function replaceHtmlTags(value) {
    return value.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&lt;/g, "<lt/>").replace(/&gt;/g, "<gt/>");
}


/**
 * author : John
 * Rule  : If "CA Prop 65 Toxicity Type" is None (ND), then set "NA"
 */
function setCAManufacturerPackageWarning(node) {

	var lob = node.getValue("Line_Of_Business").getID();
	var caProp65ToxicityType = node.getValue("CA_Prop_65_Toxicity_Type").getID();
	if (lob == "RTL" && caProp65ToxicityType == "ND") {		
		node.getValue("CA_Manufacturer_Package_Warning").setLOVValueByID("NA");
	} else if (lob == "ENT" && caProp65ToxicityType == "ND") {
		var itemTypeENT = node.getValue("ENT_Item_Type").getID()+"";
		const itemTypeList = ["DTV MAKEMODEL", "UVR BB MAKEMODEL", "Field Inventory Aggregation Code"];			
		if (!itemTypeList.includes(itemTypeENT)) {						
			node.getValue("CA_Manufacturer_Package_Warning").setLOVValueByID("NA");
		}
	}
}

function initiateBPAPendingWorkflow_ICWF(node,stepManager,ciRef){
    var lob = node.getValue("Line_Of_Business").getID();
	var notifySourcing = node.getValue("Sourcing_Notify").getID();
	var objectType = node.getObjectType().getID();
	if((objectType == "Item" || objectType == "Child_Org_Item") && lob == "WRLN"){
	   var bomType = node.getValue("NTW_BOM_Type_WRLN").getID();
	   var businessGrp = node.getValue("Business_Group").getSimpleValue();
	}
	if ((lob == "WRLN" && bomType != "NON Stock" && businessGrp != "DTV" && notifySourcing == "Y") ||
		((lob == "RTL" || lob == "ENT") && notifySourcing == "Y") || ((lob == "WRLN" || lob == "RTL" || lob == "ENT") && ciRef == 'Y')) //STIBO-2011 changes
		{
			if (!node.isInWorkflow("BPA_Action_Pending_WF")) {
				node.startWorkflowByID("BPA_Action_Pending_WF", "Start Workflow");
				var pendingWFInstance = node.getWorkflowInstanceByID("BPA_Action_Pending_WF");
				var task = pendingWFInstance.getTaskByID("Start");
				setBPAPendingWorkflowAssignee(node,stepManager,task);
				if (task) {
					task.triggerByID("ToOnboarding", "Item moved ToOnboarding state of Action Pending Workflow");					
				}
			}
			node.getValue("Sourcing_Comments").setSimpleValue(null);
			node.getValue("Sourcing_Notify").setSimpleValue(null);
		}
}
		
function setBPAPendingWorkflowAssignee(node,stepManager,task) {
    var lob = node.getValue("Line_Of_Business").getID();
    var notifySourcing = node.getValue("Sourcing_Notify").getID();
	var sourcingMgr = node.getValue("Contract_Manager").getID();
	if (sourcingMgr){
	   sourcingMgr = sourcingMgr.toUpperCase();
	   if(!sourcingMgr.includes("@ATT.COM")) {
		sourcingMgr = sourcingMgr + "@ATT.COM";
	   }
	}

	if (!sourcingMgr || !stepManager.getUserHome().getUserByID(sourcingMgr)) {
		if (lob == "WRLN") {
			var Users = stepManager.getGroupHome().getGroupByID("UG_WRLN_Sourcing");
			task.reassign(Users);
			node.getWorkflowInstanceByID("BPA_Action_Pending_WF").setSimpleVariable("currentUser", Users.getID());

		} else if (lob == "ENT" && node.getParent().getID() != "SATELLITE") {
			var Users = stepManager.getGroupHome().getGroupByID("UG_ENT_Buyer")
			task.reassign(Users);
			node.getWorkflowInstanceByID("BPA_Action_Pending_WF").setSimpleVariable("currentUser", Users.getID());

		}else if (lob == "ENT" && node.getParent().getID() == "SATELLITE") {
			var Users = stepManager.getGroupHome().getGroupByID("UG_DTV_Sourcing")
			task.reassign(Users);
			node.getWorkflowInstanceByID("BPA_Action_Pending_WF").setSimpleVariable("currentUser", Users.getID());

		} else if (lob == "RTL") {
			var Users = stepManager.getGroupHome().getGroupByID("UG_RTL_Planner")
			task.reassign(Users);
			node.getWorkflowInstanceByID("BPA_Action_Pending_WF").setSimpleVariable("currentUser", Users.getID());

		}
	} else {
		var userID = stepManager.getUserHome().getUserByID(sourcingMgr);
		task.reassign(userID);
		node.getWorkflowInstanceByID("BPA_Action_Pending_WF").setSimpleVariable("currentUser", userID.getID());
	}
	var sourcingComments = node.getValue("Sourcing_Comments").getSimpleValue();
	if (sourcingComments) {
		node.getValue("BPA_Pending_Comments").addValue(getCurrentDate() + " " + sourcingComments);
	}
	if ((node.getObjectType().getID() == "Child_Org_Item") && (notifySourcing == "Y"))
		node.getValue("Status_Updated_DateTime").setSimpleValue(getCurrentDate());
}		
		
function sendConsignEmailNotification(node,stepManager,mailHome,ciRef,consignUpdate){
        var objectType = node.getObjectType().getID();
		if (ciRef == "Y" && consignUpdate == "Y") {
			node.getValue("BPA_Pending_Comments").addValue(getCurrentDate() + " " + 'New item referenced by Contract Item');
			var createdUserID = node.getValue("Created_By").getValue(); // STIBO-3192 Prod Support Jan Release
			var updatedUserID = node.getValue("Last_Updated_By").getValue(); // STIBO-3192 Prod Support Jan Release			
			if (!updatedUserID) {
				aslLib.sendOrgConsgnEmail(node, stepManager, createdUserID, mailHome, auditLib.getHostEnvironment());
			}
			else {
				log.severe("Initiated Consign Email to Updated User")
				aslLib.sendOrgConsgnEmail(node, stepManager, updatedUserID, mailHome, auditLib.getHostEnvironment());
			}
			if (aslLib.getContractMgr(node) != '') {
				var userID = aslLib.getContractMgr(node);
				aslLib.sendOrgConsgnEmail(node, stepManager, userID, mailHome, auditLib.getHostEnvironment());
			}
		}
}	

function initiateBPAPendingWorkflow_IMWF(node,stepManager,ciRef,consignUpdate){
    var lob = node.getValue("Line_Of_Business").getID();
	var ciRef = aslLib.validCIRefCheck(node, stepManager);
	var consignUpdate = aslLib.validConsgnUpdCheck(node, stepManager);
	var notifySourcing = node.getValue("Sourcing_Notify").getID();
	var objectType = node.getObjectType().getID();
	if((objectType == "Item" || objectType == "Child_Org_Item") && lob == "WRLN"){
	   var bomType = node.getValue("NTW_BOM_Type_WRLN").getID();
	   var businessGrp = node.getValue("Business_Group").getSimpleValue();
	}
	if ((lob == "WRLN" && bomType != "NON Stock" && businessGrp != "DTV" && notifySourcing == "Y") ||
		((lob == "RTL" || lob == "ENT") && notifySourcing == "Y") || ((lob == "WRLN" || lob == "RTL" || lob == "ENT") && ciRef == "Y" && consignUpdate == "Y")) //STIBO-2011 changes
		{
			if (!node.isInWorkflow("BPA_Action_Pending_WF")) {
			log.info("Initiated into Pending WF")
				node.startWorkflowByID("BPA_Action_Pending_WF", "Start Workflow");
				var pendingWFInstance = node.getWorkflowInstanceByID("BPA_Action_Pending_WF");
				var task = pendingWFInstance.getTaskByID("Start");
				setBPAPendingWorkflowAssignee(node,stepManager,task);
				if (task) {
					task.triggerByID("ToMaintenance", "Item moved ToMaintenance state of Action Pending Workflow");					
				}
			}
			else {
					var task;
					var pendingWFInstance = node.getWorkflowInstanceByID("BPA_Action_Pending_WF");
					if (node.isInState("BPA_Action_Pending_WF", "Item_Maintenace")) {
						task = pendingWFInstance.getTaskByID("Item_Maintenace");
					}
					if (node.isInState("BPA_Action_Pending_WF", "Item_Onboarding")) {
						task = pendingWFInstance.getTaskByID("Item_Onboarding");
					}
					setBPAPendingWorkflowAssignee(node,stepManager,task);
				}
			node.getValue("Sourcing_Comments").setSimpleValue(null);
			node.getValue("Sourcing_Notify").setSimpleValue(null);
		}
}

/**
 * @author - AW304F
 * Rule Name: Set Primary UOM Code
 * Relex Retrofitting
 */
 
function setPrimaryUomCode(node) {
	var primaryuom = node.getValue("Primary_UOM").getSimpleValue();
	if(primaryuom){
		var tempuomcode = primaryuom.split(' ')[0];
		tempuomcode = tempuomcode.trim();
		node.getValue("Primary_UOM_Code").setSimpleValue(tempuomcode);
	}
}	


/**
 * @author - AW304F
 * Rule Name: Set DaaS Consumer Type
 * Relex Retrofitting
 */
 
function relexFilter(node) {

    var objectTypeId = node.getObjectType().getID();
	var lovId = "Relex";

    if (objectTypeId == "Item" || objectTypeId == "Companion_SKU") {
        var planningBusinessGroup = node.getValue("Planning_Business_Group").getID();
        var planningSystem = node.getValue("Planning_System").getSimpleValue();

        if (objectTypeId == "Item") {
            if (planningSystem == "JDA" || planningSystem == "RELEX") {
                if (planningBusinessGroup == "WIRELINE") {
                    node.getValue("Daas_Consumer_Type").replace().addLOVValueByID(lovId).apply();
                }
            }
        }

        if (planningBusinessGroup == "BROADBAND" || planningBusinessGroup == "MOBILITY" || planningBusinessGroup == "MOBILITY RL") {
			lovId = "RelexItems";
            node.getValue("Daas_Consumer_Type").replace().addLOVValueByID(lovId).apply();
        }
    }
}

/**
 * @author - AW304F
 * Rule Name: Set Planning Business Group
 * Relex Retrofitting
 */


function setPlanningBusinessGroup(node,stepManager) {
	
	var objectType = node.getObjectType().getID();
	var lob = node.getValue("Line_Of_Business").getID();
	var planningBusinessGroup = node.getValue("Planning_Business_Group").getSimpleValue();
    var materialItemType = node.getValue("Material_Item_Type").getID();
    var planningSystem = node.getValue("Planning_System").getSimpleValue();
    var rtlItemType = node.getValue("RTL_Item_Type").getID();
	var entItemType = node.getValue("ENT_Item_Type").getID();	
	var entATTWirelineList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Wireline_Item_Types").getSimpleValue();

    if (lob == "WRLN" && materialItemType == "Minor Material" && (planningBusinessGroup!='WIRELINE') && planningSystem!=null) {
        node.getValue("Planning_Business_Group").setLOVValueByID("WIRELINE");
    }
	
    if (lob == "NTW" && (planningBusinessGroup!='NETWORK')) {
        node.getValue("Planning_Business_Group").setLOVValueByID("NETWORK");
    }

    if (rtlItemType && (planningBusinessGroup!='MOBILITY') && objectType == "Item") {
        node.getValue("Planning_Business_Group").setLOVValueByID("MOBILITY");
    }
	
	if(entItemType && entATTWirelineList.includes(entItemType) && (planningBusinessGroup!='BROADBAND') && (objectType == "Item" || objectType == "Companion_SKU")){
		node.getValue("Planning_Business_Group").setLOVValueByID("BROADBAND");	
	}
}

/**
 * @author - PP588A
 * Rule Name: Set Customer Order Flag =Y if Customer Orders Enabled Flag is Y
 */

function setCustomerOrderFlag(node) {
	var customerOrderEnabled = node.getValue("Customer_Order_Enabled_Flag").getID();
	var customerOrder = node.getValue("Customer_Order_Flag").getID();
    
	if (customerOrderEnabled == "Y" && customerOrder == "N") {
        node.getValue("Customer_Order_Flag").setLOVValueByID("Y");
    }
}

/**
 * @author - John
 * Rule Name: Set setSubmitStandardCost = Y, if RSC and CSC are not same in maintenance of PITEM and CompSKU
 */

function setSubmitStandardCost(node) {

	var itemNumber = node.getValue("Item_Num").getSimpleValue();
	var requestedStandardCost = node.getValue("Requested_Standard_Cost").getSimpleValue();
	var currentStandardCost = node.getValue("Current_Standard_Cost").getSimpleValue(); 	
	if (itemNumber && requestedStandardCost && currentStandardCost && requestedStandardCost != currentStandardCost) {		
        node.getValue("Submit_Standard_Cost").setLOVValueByID("Y");
    }
}


/**
 * @author - Pradeep 
 * set Publish Item Description for RTL and ENT items
 */

function setPublishItemDescription(node, stepManager) {
	// Define item_type groups based on PDH Item Desc calculation
	var itemTypes1 = [
		"ACCESSORY_3PP", "ACCESSORY_APPCESSORY", "ACCESSORY_AUDIO", "ACCESSORY_CASE", "ACCESSORY_BATTERY",
		"ACCESSORY_CARADAPTER", "ACCESSORY_POWER_DATA", "REFURBISH_BATTERY", "ACCESSORY_SCREENPRTCT", "ACCESSORY_CHARGER",
		"ACCESSORY_SPECIALTY", "REPLACEMENT_PARTS", "ENTERTAINMENT_MOBILITY_DEVICE", "ENTERTAINMENT_MOBILITY_ACCESSORY",
		"ENTERTAINMENT_MOBILITY_COLLATERAL", "COMPUTER", "ELECTRONIC_3PP", "ELECTRONIC_NONSERIALIZED",
		"ELECTRONIC_SERIALIZED", "PHONE", "PHONE_DISPLAY", "PHONE_PREPAID_IDB", "PHONE_PREPAID_PIB", "PHONE_PREPAID_PYG",
		"SIM", "MSSNONSTCK_NONATT_ACCESSORY", "ACV_EQUIP_NONATT_DEVICE", "MSSNONSTCK_NONATT_COMPUTER",
		"MSSNONSTCK_NONATT_ELECTRONIC", "MSSNONSTCK_NONATT_PHONE"
	];
	var itemTypes2 = [
		"PHONE_PALLET", "PHONE_PALLET_PIB", "PHONE_PALLET_PYG", "DF_COLLATERAL_INTANG2", "DF_FREIGHT", "INTANG1",
		"INTANG2", "INTANG2_3PP", "INTANG3", "PREPAY_CARD_SERIALIZED", "EPIN_PREPAY", "DF_BILL_ONLY", "DF_3PL",
		"MSSNONSTCK_COLLATERAL"
	];
	var itemTypes3 = [
		"DF_COLLATERAL_YOUNG_AMERICA", "DF_COLLATERAL_GENERAL", "SECRTY_DIGITAL_LIFE_ACCESSORY",
		"SECRTY_DIGITAL_LIFE_DEVICE", "SECRTY_DIGITAL_LIFE_PACKAGE"
	];

	var lob = node.getValue("Line_Of_Business").getID();
	var pdhDesc = "";
	
	if (lob == "RTL") {
		var itemType = node.getValue("RTL_Item_Type").getID();
		var itemStatus = node.getValue("Item_Status_RTL").getSimpleValue();

		if (itemTypes1.includes(String(itemType))) {
			// Group 1 logic
			if (itemStatus && itemStatus.toUpperCase() == "PRE LAUNCH") {
				pdhDesc = "NEW PRODUCT";
			} else {
				var descriptionPrefix = node.getValue("Description_Prefix").getID();
				var oem = node.getValue("OEM").getID();
				var marketingName = node.getValue("Marketing_Name").getSimpleValue();
				var model = node.getValue("Model").getSimpleValue();
				var color = node.getValue("COLOR").getID();

				if (color == "OOO") {
					pdhDesc = [descriptionPrefix, oem, marketingName, model].filter(Boolean).join(" ");
				} else {
					pdhDesc = [descriptionPrefix, oem, marketingName, model, color].filter(Boolean).join(" ");
				}
			}
		} else if (itemTypes2.includes(String(itemType))) {
			// Group 2 logic
			var userDefinedDesc = node.getValue("User_Defined_Item_Description").getSimpleValue();
			if (!userDefinedDesc) {
				pdhDesc = "NOT AVAILABLE";
			} else {
				pdhDesc = userDefinedDesc;
			}
		} else if (itemTypes3.includes(String(itemType))) {
			// Group 3 logic
			var descriptionPrefix = node.getValue("Description_Prefix").getID();
			var userDefinedDesc = node.getValue("User_Defined_Item_Description").getSimpleValue();
			pdhDesc = [descriptionPrefix, userDefinedDesc].filter(Boolean).join(" ");
		} else {
			pdhDesc = node.getValue("Item_Description").getSimpleValue();
		}
	} else if (lob == "ENT") {
		var entItemType = node.getValue("ENT_Item_Type").getID();
		var entItemStatus = node.getValue("Item_Status_ENT").getSimpleValue();

		var entATTWirelineList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Wireline_Item_Types").getSimpleValue();
		var entATTDTVList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Item_Types").getSimpleValue();

		if (entItemType && entATTWirelineList && entATTWirelineList.includes(entItemType)) {
			if (entItemStatus && entItemStatus.toUpperCase() == "PRE LAUNCH") {
				pdhDesc = "NEW PRODUCT";
			} else {
				var entDescriptionPrefix = node.getValue("Description_Prefix").getID();
				var entOem = node.getValue("OEM").getID();
				if (!entOem){
					entOem = "";
					}
				var entUserDesc = node.getValue("User_Defined_Item_Description").getSimpleValue();
				var parts = [];
				var prefixSegment = safeSubstring(String(entDescriptionPrefix), 3);
				if (prefixSegment) {
					parts.push(prefixSegment);
				}
				var oemSegment = safeSubstring(String(entOem), 3);
				if (oemSegment) {
					parts.push(oemSegment);
				}
				var userDescSegment = safeSubstring(String(entUserDesc), 22);
				if (userDescSegment) {
					parts.push(userDescSegment);
				}
				pdhDesc = parts.join(" ");
			}
		} else if (entItemType && entATTDTVList && entATTDTVList.includes(entItemType)) {
			var entUserDefinedDesc = node.getValue("User_Defined_Item_Description").getSimpleValue();
			pdhDesc = safeSubstring(String(entUserDefinedDesc), 30);
		} else {
			pdhDesc = node.getValue("Item_Description").getSimpleValue();
		}
	} else {
		pdhDesc = node.getValue("Item_Description").getSimpleValue();
	}

	if (pdhDesc) {
		pdhDesc = removeSpecialChars(pdhDesc);
		node.getValue('PDH_Item_Description').setSimpleValue(pdhDesc.substring(0, Math.min(pdhDesc.length, 30)));
	}
}

function safeSubstring(value, length) {
   if (typeof value == "string") {
        return value.substring(0, Math.min(value.length, length));
    } else {
        return "";
    }
}

function removeSpecialChars(attrValue) {
    if (attrValue == null) {
        return attrValue;
    }

    return String(attrValue)
        .replace(/[^A-Za-z0-9$ ]+/g, " ")   // replace everything else with space
        .replace(/\s{2,}/g, " ")            // collapse runs of whitespace
        .trim();
}

/**
 * @author - John  
 * Revert to Generate_New_UPC to approved Value
 */
function revertGenerateNewUPC(compSku, stepManager){
	log.info("compSku--> "+compSku.getName())
	//Function to approve all Objects in ICWF & Partial Approve during Maintenance

function recursiveApproval(node,stepManager,lob,lookupTable){
	var objectType = node.getObjectType().getID();
	//PITEM Full Approval during Creation
	//PITEM or Child Org or Comp SKU Approval during Maintenance
	   node.approve();	   
			
	//1. Full Approval of Child Orgs & CompSKU during PITEM Creation
	//2. Chid Orgs & Comp SKU Partial Approval during PITEM Maintenance
	//3. Full Approval of any new Child Orgs & CompSKU during PITEM Maintenance
	//4. Chid Orgs Partial Approval during Comp SKU Maintenance
	//5. Full Approval of any new Chid Orgs during Comp SKU Maintenance
	if(objectType == "Item" || objectType == "Companion_SKU"){ // Approve CITEM, Comp SKU Creation or Partial Approve Updates during PITEM or Comp SKU Maintenance
	  approveChildren (node, stepManager,lob,lookupTable);
	}
}

function approveChildren(node, stepManager,lob,lookupTable) {    
  var children = node.queryChildren(); 	
  children.forEach(function(child) {  
         var approvalStatus =  child.getApprovalStatus();
		var childObjectType = child.getObjectType().getID();
		log.info(child.getID() +" - " + approvalStatus +" "+childObjectType)
		 //Approves All New Objects created during ICWF & IMWF
        if(approvalStatus == "Not in Approved workspace" && (childObjectType == "Child_Org_Item" || childObjectType =="Companion_SKU")){
		    child.approve();
		}
		//Approves Only the updated attributes during Child/ Companion Propagation rules
		if(approvalStatus == "Partly approved" && (childObjectType == "Child_Org_Item" || childObjectType =="Companion_SKU")){		    
			var set = new java.util.HashSet();
			var unapprovedObjects = child.getNonApprovedObjects().iterator();
			log.info("unapprovedObjects: "+unapprovedObjects)
			 while(unapprovedObjects.hasNext()){				 		    
				var partObject = unapprovedObjects.next();
				var partObjectString = partObject.toString();				
				if(childObjectType == "Child_Org_Item" && partObjectString.indexOf("ValuePartObject") != -1){	
                    var orgCode = child.getValue("Organization_Code").getID();				
                    var attributeId = String(partObject.getAttributeID());	                    
					var orgCodesList = lookupTable.getLookupTableValue("LT_Item_Partial_Approve_Attributes", "childOrg|"+attributeId+"|"+lob);					
					if(orgCodesList && orgCodesList.includes(orgCode)){				
					  set.add(partObject);				
					}
				 }
				 if(childObjectType == "Companion_SKU" && partObjectString.indexOf("ValuePartObject") != -1){					   
				    var companionType = "";
                       var companionTypeValues = child.getValue("Companion_Item_Type").getSimpleValue();
					var companionTypeId = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_Companion_Item_Type_Duplicate").getListOfValuesValueByID(companionTypeValues);	  
					 if(companionTypeId){
						companionType = companionTypeId.getValue();
					 }							 		
                       var attributeId = String(partObject.getAttributeID());
					var companionTypeList = lookupTable.getLookupTableValue("LT_Item_Partial_Approve_Attributes", "companionSKU|"+attributeId);					
					if(companionTypeList && companionType && companionTypeList.includes(companionType))	{				
					  set.add(partObject);				
					}
				 }				 
			}
			log.info("Child Set: "+set)
			if (set.size() > 0) {
				child.approve(set);
			}
		}
		if(childObjectType == "Companion_SKU"){
			approveChildren (child, stepManager,lob,lookupTable);
		}
		return true;
  });
}
//Function to send Item Creation Successfull Email to 
//1. Item Initiator & Contract Manager for all LOBs
//2. Wireline Planners for WRLN LOB
//3. DG Users for OMS Items
function sendItemCreationEmail(node,stepManager,lookupTable,mailHome){
	var subject = "";
	var emailBody ="";	
	var omsSubject = "";
	var omsEmailBody ="";	
	var lob = node.getValue("Line_Of_Business").getID();
	var omsItemNumber = node.getValue("OMS_Item_Number").getValue();
	var lookupResult = lookupTable.getLookupTableValue("LT_Item_Email_Configurations","itemCreation"+lob);
	if(lookupResult){
		var [subject,emailBody] = getSubjectEmailBody(node,stepManager,lookupResult);	
	}
	var emailUsers = [];
	emailUsers = getEmailUsersList(node,stepManager,lookupTable,emailUsers,"usersList");
	if(lob == "WRLN"){
		var material = node.getValue("Material_Item_Type").getID();
		emailUsers = getEmailUsersList(node,stepManager,lookupTable,emailUsers,"WRLN"+material+"UsersList");
	}
	var instanceName = auditLib.getHostEnvironment();
	var mail = mailHome.mail();
	var sender = instanceName + "-noreply@cloudmail.stibo.com";
	emailUsers.forEach(function(userID) {
		log.severe("getEmailUsersList: "+userID)
	sendEmailNotification(stepManager, mail, userID, sender, subject, emailBody);
	});
	if(lob=="ENT" && omsItemNumber == "DUMMY"){
		var lookupResult = lookupTable.getLookupTableValue("LT_Item_Email_Configurations","itemCreationOMS");
		var [omsSubject,omsEmailBody] = getSubjectEmailBody(node,stepManager,lookupResult);  
	     omsEmailUsers = getEmailUsersList(node,stepManager,lookupTable,emailUsers,"DGUsersList");
	     omsEmailUsers.forEach(function(userID) {
			log.severe("getEmailUsersList: "+userID)
	     	sendEmailNotification(stepManager, mail, userID, sender, omsSubject, omsEmailBody);
	     });
	}
}
function getSubjectEmailBody(node,stepManager,lookupResult){
	var subject = "";
	var emailBody ="";
		
	if (lookupResult) {
		lookupResultJson = JSON.parse(lookupResult);
		Object.keys(lookupResultJson).forEach(function(key){
				lookupResultJson[key].forEach(function(value) {				
					var attributeValue = "";				
					var attribute = stepManager.getAttributeHome().getAttributeByID(value);
					if(attribute){
					   if(attribute.hasLOV()){
					    attributeValue = node.getValue(value).getID();
					   }
					   else{		
					   	if(!attribute.isMultiValued())   	
					       attributeValue = node.getValue(value).getValue();
					     else{
					        attributeValue = node.getValue(value).getSimpleValue();
					        if(attributeValue)
					          attributeValue = attributeValue.replace("<multisep/>", " | ");
					     }
					   }
					   if(key == "subject" && attributeValue){
					      subject +=attributeValue+" ";
					   }
					   if(key == "emailBody" && attributeValue){
					      emailBody +=attributeValue;
					   }
					}
					else{
					   if(key == "subject"){
					      subject +=value+" ";
					   }
					   if(key == "emailBody"){
					      emailBody +=value;
					   }
					}
				});		
		});		
	}  
	return [subject,emailBody]  
}

function getEmailUsersList(node,stepManager,lookupTable,emailUsers,searchUser){
	var usersList =lookupTable.getLookupTableValue("LT_Item_Email_Configurations",searchUser);
	if(usersList){	
		usersList = JSON.parse(usersList);
	usersList.forEach(function(user){				
		var attribute = stepManager.getAttributeHome().getAttributeByID(user);
		if(attribute){	
			if(attribute.hasLOV())
			   var userID = node.getValue(user).getID();
			 else
			    var userID = node.getValue(user).getValue();
			if(userID){
				 userID =userID.toLowerCase();
				if(!userID.contains("@att.com")){
					userID = userID + "@att.com";						
				}		
				if(!emailUsers.includes(userID))
					emailUsers.push(userID);		
			}			
		}
		else{
		   var Users = stepManager.getGroupHome().getGroupByID(user).getUsers().toArray();
			Users.forEach(function(currentUser) {
				var userID = getEmailId(currentUser);
				if (userID && !emailUsers.includes(userID))
				  emailUsers.push(userID);
		     });
	     }
     });
	}
	return emailUsers;
}
function getEmailId(user) {
    var userID = "";
    if (user.getID().contains('@ATT.COM')) {
        userID = user.getID();
    } else if (user.getEMail()) {
        userID = user.getEMail();
    }
    return userID;
}
function sendEmailNotification(step, mail, userID, sender, subject, message) {		
		mail.from(sender);
		mail.addTo(userID);
		mail.subject(subject);
		//mail.htmlMessage(message);
		mail.plainMessage(message);
		mail.send();
}
function deleteKey(node, step, objectType) {
  if (objectType == "Child_Org_Item") {
    var childOrgkey = node.getValue("DM_Child_Org_Key").getSimpleValue();
    var childOrgIdentity = node.getValue("Child_Org_Identity").getSimpleValue();
    if (childOrgkey) {
      step.getKeyHome().updateUniqueKeyValues2({
        "DM_Child_Org_Key": String("")
      }, node);
    }
    if (childOrgIdentity) {
      step.getKeyHome().updateUniqueKeyValues2({
        "Child_Org_Identity": String("")
      }, node);
    }
  } else if (objectType == "Companion_SKU") { 
    var companionSkuIdentity = node.getValue("Comp_SKU_Identity").getSimpleValue();
    if (companionSkuIdentity) {
      step.getKeyHome().updateUniqueKeyValues2({
        "Comp_SKU_Identity": String("")
      }, node);
    }
  }
   else if (objectType == "Transportation_Package") {
    var transportationPKG = node.getValue("Transportation_Package_Key").getSimpleValue();
    if (transportationPKG) {
      step.getKeyHome().updateUniqueKeyValues2({
        "Transportation_Package_Key": String("")
      }, node);
    }
  }
 else if (objectType == "Transportation_Handling_Unit") { 
    var transportationHU = node.getValue("Transportation_Handling_Unit_Key").getSimpleValue();
    if (transportationHU) {
      step.getKeyHome().updateUniqueKeyValues2({
        "Transportation_Handling_Unit_Key": String("")
      }, node);
    }
  }
}
//Function to set LOB for all Items in ICWF Start State
function setLOBAndUserItemType(node,stepManager){
	var userItemTypeNTW = node.getValue("User_Item_Type_NTW").getID();
	var userItemTypeWRLN = node.getValue("User_Item_Type_WRLN").getID();
	var userItemTypeRTL = node.getValue("User_Item_Type_RTL").getID();
	var userItemTypeENT = node.getValue("User_Item_Type_ENT").getID();
	var material = node.getValue("Material_Item_Type_Web").getID();
	var itemTypeRTL = node.getValue("RTL_Item_Type").getSimpleValue();
	var itemTypeENT = node.getValue("ENT_Item_Type").getSimpleValue();

	if (!userItemTypeNTW && !material  && !itemTypeRTL  && !itemTypeENT) {
		node.getValue("Line_Of_Business").setLOVValueByID("NTW");	
        setUserItemType(node,stepManager,"NTW");		
	} else if (!userItemTypeWRLN && material  && !itemTypeRTL  && !itemTypeENT ) {
		node.getValue("Line_Of_Business").setLOVValueByID("WRLN");
		setUserItemType(node,stepManager,"WRLN");
	} else if (!userItemTypeRTL  && !material  && itemTypeRTL  && !itemTypeENT) {
		node.getValue("Line_Of_Business").setLOVValueByID("RTL");
		setUserItemType(node,stepManager,"RTL");
	} else if (!userItemTypeENT  && !material  && !itemTypeRTL  && itemTypeENT ) {
		node.getValue("Line_Of_Business").setLOVValueByID("ENT");
		setUserItemType(node,stepManager,"ENT");
	}
}
//Function to set User Item Type for all Items in ICWF Start State
function setUserItemType(node,stepManager,lob) {
   if(lob == "NTW"){
      node.getValue("User_Item_Type_NTW").setLOVValueByID("NETWORK");
   }
   if(lob== "WRLN"){
    var material = node.getValue("Material_Item_Type_Web").getID();
	if (material == "Major Material XPID LE" || material == "Toolsets" || material == "Billing Category Item"){
		node.getValue("User_Item_Type_WRLN").setLOVValueByID("WLN_NON_INV");
	}
	else {
		node.getValue("User_Item_Type_WRLN").setLOVValueByID("WLN_INV");
   }
  }
  if(lob== "RTL" || lob== "ENT"){
     var itemType = node.getValue(lob+"_Item_Type").getID();
	 if(itemType){
	    var itemTypeEntity = stepManager.getEntityHome().getEntityByID(itemType);
		if(itemTypeEntity){
		   if(lob == "RTL"){
			  var userItemType = itemTypeEntity.getValue("RTL_User_Item_Type").getSimpleValue();
		   }
		   if(lob == "ENT"){
			  var userItemType = itemTypeEntity.getValue("Ent_User_Item_Type").getSimpleValue();
		   }
		   if(userItemType){
		      node.getValue("User_Item_Type_"+lob).setLOVValueByID(userItemType);		   
		   }		
		}	 
	 } 
  }
}
//Function to Redirect the Item to the respective LOB's Enrich state in Item Creation & Maintenance Workflows
function redirectWorkflowEnrichState(node,stepManager){
	if(node.getObjectType().getID() == "Item"){
		node.getValue("Organization_Code").setLOVValueByID("MST"); //Defaulting the Org Code to MST for all the master items
	}
	// Auto Proceed to next state based on value of Line_Of_Business 
	var lob = node.getValue("Line_Of_Business").getID();	
	var workflowInstance = node.getWorkflowInstanceByID("Item_Creation_Workflow");
	if (workflowInstance) {
		var icwfFinishTask = workflowInstance.getTaskByID("Finish");
		if (icwfFinishTask) {
			workflowInstance = node.getWorkflowInstanceByID("Item_Maintenance_Workflow");
		}
	}
	else {
	   workflowInstance = node.getWorkflowInstanceByID("Item_Maintenance_Workflow");   
    }
	var assignee = workflowInstance.getSimpleVariable("Assignee");
	var currentUser = stepManager.getUserHome().getUserByID(assignee);
	var userGroups = currentUser.getGroups().toString();
	if (lob == "NTW") {
		workflowInstance.getTaskByID("Start").triggerLaterByID("ToNetworkMobility", null);
	} else if (lob == "WRLN") {
		workflowInstance.getTaskByID("Start").triggerLaterByID("ToWireline", null);
	} else if (lob == "ENT") {
		if (userGroups.contains("UG_DTV_Item_Planner")) {
			workflowInstance.getTaskByID("Start").triggerLaterByID("ToDTV", null);
		} else {
			workflowInstance.getTaskByID("Start").triggerLaterByID("ToEntertainment", null);
		}
	} else if (lob == "RTL") {
		if (userGroups.contains("UG_DTV_Item_Planner")) {
			workflowInstance.getTaskByID("Start").triggerLaterByID("ToDTV", null);
		} else {
			workflowInstance.getTaskByID("Start").triggerLaterByID("ToRetail", null);
		}
	}
}
//Function to return Workflow State
function getWorkflowState(node, workflowId, stateId) {
	var workFlowInstance = node.getWorkflowInstanceByID(workflowId);
	if (workFlowInstance) {
		return workFlowInstance.getTaskByID(stateId);
	}
	else {
	    return null;
}
}

//Function to reassign the item to the Initiator in every state of both the Item Workflows
function setAssignee(step, task, userId) { 
	if (userId) {
		var user = step.getUserHome().getUserById(userId);
		if (user) {
			task.reassign(user);
		}
	}
}
//Function to Initiate Item Creation Workflow or Item Maintenance Workflow
function initiateItemIntoWorkflow(node){
	var objectType = node.getObjectType().getID();
	var itemNumber = node.getValue("Item_Num").getSimpleValue();
	if (objectType == "Item" && !itemNumber && !node.isInWorkflow("Item_Creation_Workflow"))  {
		node.startWorkflowByID("Item_Creation_Workflow", "New Item creation from Smart sheet");
	}
	if ((objectType == "Item" || objectType == "Child_Org_Item" || objectType == "Companion_SKU") && itemNumber && !node.isInWorkflow("Item_Maintenance_Workflow")) {
		node.startWorkflowByID("Item_Maintenance_Workflow", "Item Maintenance Initiated from Smart sheet");
     }
}

function setItemDescription(node,stepManager,lob){
    var attributes = [];
    if(lob == "NTW"){
	     attributes = ["OEM_Full_Name", "Mfg_Part_No", "Reason_Code", "Replacement_Item", "User_Defined_Item_Description"];
	}	 
	else if(lob == "RTL"){
         attributes = ["Description_Prefix","OEM","Marketing_Name","Model","COLOR"];
    }
	else if(lob == "ENT"){
	     attributes = ["Description_Prefix","OEM","User_Defined_Item_Description","Model","COLOR"];
    }
	const attributeValues = [];
    attributes.forEach(function(attribute) {
	    var attributeObject = stepManager.getAttributeHome().getAttributeByID(attribute);
	    if(attributeObject.hasLOV()){
            var attributeValue = node.getValue(attribute).getID();
			}
		else{
		    var attributeValue = node.getValue(attribute).getSimpleValue();
		}
        var convertedValue = convertToUpperCaseAndExcludeHTMLTags(attributeValue);
        attributeValues.push(convertedValue);
    });
	if(lob == "ENT" || lob == "RTL"){
		var derivedDescription = attributeValues.join(" ");
	}
	else if(lob == "NTW"){
	    var derivedDescription = attributeValues.join(",");
    }
    node.getValue("Item_Description").setSimpleValue(derivedDescription);
}


function removeSpecialCharsAndToUpperCase(node, stepManager, bf, attributeId) {
    var attributeValue = node.getValue(attributeId).getSimpleValue();
    var attributeID = stepManager.getAttributeHome().getAttributeByID(attributeId);
    if (attributeValue) {
        var attributeValue = bf.evaluate({
            node: node,
            attr: attributeID
        });
        attributeValue = convertToUpperCaseAndExcludeHTMLTags(attributeValue);
        node.getValue(attributeId).setSimpleValue(attributeValue);
    }
}

function convertToUpperCaseAndExcludeHTMLTags(attributeValue) { //tested 
   if(attributeValue){
    attributeValue = attributeValue.toUpperCase();
    if (attributeValue.includes("<LT/>")) {
        attributeValue = attributeValue.replace("<LT/>", "<lt/>");
    }
    if (attributeValue.includes("<GT/>")) {
        attributeValue = attributeValue.replace("<GT/>", "<gt/>");
    }
   }
    return attributeValue;
}

function convertToUpperCase(node,attributeId){ 
    var attributeValue = node.getValue(attributeId).getSimpleValue();
    if (attributeValue){  
      attributeValue = attributeValue.toUpperCase();
      node.getValue(attributeId).setSimpleValue(attributeValue);
    }
}

//Used to remove junk chars for RTL & ENT LOBs
function removeJunkChars(node,stepManager,attribute,bf) {
	var attributeValue = node.getValue(attribute).getSimpleValue();
	var attributeID = stepManager.getAttributeHome().getAttributeByID(attribute);
	if (attributeValue) {
         var formattedValue = bf.evaluate({      
            node:node,
            attr:attributeID
         });       
        node.getValue(attribute).setSimpleValue(formattedValue);
    }
}

function roundDecimalValue(number) {
    var roundedNumber = "";
    if (number) {
        roundedNumber = number * 1;
    }
    return roundedNumber;
}
// Need to combine roundListPrice & roundDecimalValue
function roundListPrice(node) {
    var listPriceValue = node.getValue("List_Price").getSimpleValue();
    if (listPriceValue) {
        var roundedValue = roundDecimalValue(listPriceValue);
        node.getValue("List_Price").setSimpleValue(roundedValue);
    }
}

function getCurrentDate() { //tested
    var date = new Date();
    var dateFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd");
    var formattedDate = dateFormatter.format(date);
    return formattedDate;
}

function trimWhiteSpacesAndNewLines(node, stepManager) { //tested
    var trimGroup = stepManager.getAttributeGroupHome().getAttributeGroupByID("AG_TrimTextAttributes");
    var attributes = trimGroup.getAttributes().toArray();
    attributes.forEach(function(attribute) {
        var attrId = attribute.getID();
        var value = node.getValue(attrId).getSimpleValue();
        if (value) {
            var trimmed = String(value).replace(/\n/g, ' ').replace(/\s\s+/g, ' ').trim();
            node.getValue(attrId).setSimpleValue(trimmed);
        }
    });
}

function copyAttributeValue(node, targetAttr, sourceAttr, valueType) { 
	var sourceAttributeValue = "";
	if (valueType == "LOV") {
		sourceAttributeValue = node.getValue(sourceAttr).getID();
		if (sourceAttributeValue) {
			node.getValue(targetAttr).setLOVValueByID(sourceAttributeValue);
		}
	} else if (valueType == "Simple") {
		sourceAttributeValue = node.getValue(sourceAttr).getSimpleValue();
		if (sourceAttributeValue) {			             
			node.getValue(targetAttr).setSimpleValue(sourceAttributeValue);
		}
	}
}
function copyAttributeValueIfEmpty(node, targetAttr, sourceAttr, valueType) { 
	var sourceAttributeValue = "";
	if (valueType == "LOV") {
		sourceAttributeValue = node.getValue(sourceAttr).getID();
			node.getValue(targetAttr).setLOVValueByID(sourceAttributeValue);
	} else if (valueType == "Simple") {
		sourceAttributeValue = node.getValue(sourceAttr).getSimpleValue();
			node.getValue(targetAttr).setSimpleValue(sourceAttributeValue);
	}
}

function setDefaultValueIfEmpty(node, attributeId, valueType, defaultValue) { //tested
      if (valueType == "LOV") {
        if (!node.getValue(attributeId).getID()) {
            node.getValue(attributeId).setLOVValueByID(defaultValue);
        }
    } else if (valueType == "Simple") {
        if (!node.getValue(attributeId).getValue()) {
            node.getValue(attributeId).setSimpleValue(defaultValue);
        }
    }
}

function deriveBasedOnItemType(node, stepManager, lob, itemAttribute, entityAttribute, attrType) {
    try {
        if (!node.getValue(itemAttribute).getSimpleValue()) {
            var itemType = node.getValue(lob + "_Item_Type").getID();
            if (itemType) {
                var itemTypeEntityId = stepManager.getEntityHome().getEntityByID(itemType);
                if (itemTypeEntityId) {
                    var derivedAttributeValue = itemTypeEntityId.getValue(entityAttribute).getSimpleValue();
                    if (derivedAttributeValue) {
                        if (attrType == "LOV") {
                            node.getValue(itemAttribute).setLOVValueByID(derivedAttributeValue);
                        } else if (attrType == "Text") {
                            node.getValue(itemAttribute).setSimpleValue(derivedAttributeValue);
                        }
                    }
                }
            }
        }
    } catch (exception) {
        throw (exception);
    }
}

function setConsignmentVariable(node,stepManager){
var wfInstance = node.getWorkflowInstanceByID("Item_Maintenance_Workflow");
var consignment = node.getValue("Consignment").getSimpleValue();
	   if(wfInstance){
	   	var approvedManager = stepManager.executeInWorkspace("Approved", function (step) {
	            return step;
	        });
	     var approvedNode = approvedManager.getProductHome().getProductByID(node.getID());
	     if (approvedNode){
	     	var approvedConsignment = approvedNode.getValue("Consignment").getSimpleValue();
	     }
	   	 if( approvedConsignment != consignment) {
	   	  wfInstance.setSimpleVariable("ConsignUpdt", "Yes");
	   }
	   }
}
/**
 * @author - John, mb916k
 * Rule: Set_Orderable_On_Web_Flag
 */
function setOrderableOnWebFlag(node) {
	
	const itemStatusList = ['ActCOI-NS', 'Active', 'Active D2C', 'ActiveC', 'ActiveCOI', 'Actv DC', 'Actv DEMO', 'Actv NoStk', 'Actv NoWMS', 'ActvNONATT', 'DL Actv DC', 'DSL COL', 'No Buy', 'NonTanS PO', 'NonTanStk', 'Obsolete', 'Phase Out'];
	var customerOrderEnabledFlag = node.getValue("Customer_Order_Enabled_Flag").getID();
	var lob = node.getValue("Line_Of_Business").getID();
	var itemStatus = node.getValue("Item_Status_"+lob).getID();	
	if (customerOrderEnabledFlag == 'Y' && itemStatusList.includes(String(itemStatus))) {
		node.getValue("Orderable_On_Web_Flag").setLOVValueByID('Y');
	} else if (customerOrderEnabledFlag == 'N') {
		node.getValue("Orderable_On_Web_Flag").setLOVValueByID('N');
	}
}

// Added by mb916k - PartialApproveFields
function partialApproveFields(node, idArray) {
	var set = new java.util.HashSet();
	var setUnapproved = node.getNonApprovedObjects();
	var unapprovedIterator = setUnapproved.iterator();	
	while (unapprovedIterator.hasNext()) {
		var partObject = unapprovedIterator.next();
		var partObjectStr = partObject.toString();
		if (partObjectStr.indexOf("ValuePartObject") != -1 && idArray.indexOf(String(partObject.getAttributeID())) != -1) {
			set.add(partObject);
		}
	}	
	if (set.size() > 0) {
		node.approve(set);
	}
}

// Added by mb916k - get AttributeGroup List
function getAttributeGroupList(node, step, attrubteGroupId) {
	var attributeGroup = step.getAttributeGroupHome().getAttributeGroupByID(attrubteGroupId);
	var attributeList = attributeGroup.getAttributes().toArray();
	var attributeID = "";
	var partialApproveList = new java.util.ArrayList();
	attributeList.forEach(function(attr) {
		attributeID = attr.getID();     	
		partialApproveList.add(attributeID);	    
	 });
	return partialApproveList;  
}

function setItemRequestor(node, stepManager) {
	var itemRequestor = node.getValue("Requestor").getSimpleValue();
	if (!itemRequestor) {
		var userID = stepManager.getCurrentUser().getID();
		if (userID && userID.contains('@'))
			userID = userID.substring(0, userID.indexOf('@'));
		node.getValue('Requestor').setSimpleValue(userID);
	}
}

function setHazmatUnNumber(node, lookUpTable) {
    var batteryTechnology = node.getValue("Battery_Technology").getID();
    var batteryPackaging = node.getValue("Battery_Packaging").getID();
    if (batteryTechnology && batteryPackaging) {
        var lookUpResult = lookUpTable.getLookupTableValue("LT_Retail_Hazmat_Un_Number", batteryTechnology + "|" + batteryPackaging);
        if (lookUpResult) {
            node.getValue("Hazmat_Un_Num").setLOVValueByID(lookUpResult);
        }
    }
}

function setSerialGeneration(node,LOB,stepManager) {
    var serializedItemsList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Serialized_Subsidy_Items").getSimpleValue();
    var userItemType = node.getValue("User_Item_Type_"+LOB).getID();
    var productSubType = node.getValue("Product_Sub_Type").getID();
    if (userItemType && productSubType) {
        productSubType = productSubType.toLowerCase();
        if (serializedItemsList.includes(String(userItemType))  && productSubType.contains("serial")) {
            if (!productSubType.contains("non")) {
                node.getValue("Serial_Generation").setLOVValueByID("6");
            }
            else {
                node.getValue("Serial_Generation").setLOVValueByID("1");
        }
    }
    }
}

/**
 * author: Syed
 * Rule  : Set IMEI Type value based on Serial Type attribute. 
 */
function setIMEIType(node) {	
	var serialTypeObj = node.getValue("Serial_Type");
   	 if (serialTypeObj && serialTypeObj.getID()) {
      var serialType = serialTypeObj.getID().toString();
        if (serialType.startsWith("IMEI")) {
            node.getValue("IMEI_Type").setLOVValueByID(serialType);
        }
    }
}
	

/**
 * author: Syed
 * Rule  : Set Intangible_Nonship attribute value based on Stock_Enabled_Flag attrbute value
 */
function setIntangibleNonShippable(node, stepManager) {
	var entATTBVOIPList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("BVoIP_Item").getSimpleValue();
	var entATTWirelineList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Wireline_Item_Types").getSimpleValue();
 	var lob=node.getValue("Line_Of_Business").getID();
	var stockEnabled=node.getValue("Stock_Enabled_Flag").getID();
	var entItemType =node.getValue("ENT_Item_Type").getID();
    if ((lob=="RTL" && stockEnabled == "Y") || (lob =="ENT" && (entATTWirelineList.includes(entItemType) || entATTBVOIPList.includes(entItemType) ) && stockEnabled == "Y")) {
            node.getValue("Intangible_Nonship").setLOVValueByID("N");        
    }
    else {
            node.getValue("Intangible_Nonship").setLOVValueByID("Y"); 
    }                       
}

function clearAttributeValue(node, attribute){
	node.getValue(attribute).setSimpleValue("");
}
function setSourcingNotify(node, stepManager) { //call during Maintenance WF of all LOBs
	var attributesList = stepManager.getEntityHome().getEntityByID("ItemAttributes_Hierarchy").getValue("Notify_SourcingUser_Attributes").getSimpleValue();
	var counter = 0;
	var objectType = node.getObjectType().getID();
	var set = new java.util.HashSet();
	var setUnapproved = node.getNonApprovedObjects();
	var unapprovedIterator = setUnapproved.iterator();
	while (unapprovedIterator.hasNext()) {
		var partObject = unapprovedIterator.next();
		var partObjectStr = partObject.toString();
		if (partObjectStr.indexOf("ValuePartObject") != -1 && attributesList.indexOf(String(partObject.getAttributeID())) != -1) {
			counter++;
		}
	}
	if (counter > 0) {
		node.getValue("Sourcing_Notify").setLOVValueByID("Y");
	}
	//set the variables to initiate the email to Sourcing User
	var approvedManager = stepManager.executeInWorkspace("Approved", function(step) {
		return step;
	});
	var approvedNode = approvedManager.getProductHome().getProductByID(node.getID());
	if (approvedNode) {
		if (objectType == "Item") {
			approvedStatus = approvedNode.getValue("Item_Status_WRLN").getID();
			currentStatus = node.getValue("Item_Status_WRLN").getID();
			if (approvedStatus != currentStatus) {
				node.getValue("Notify_Sourcing_Type").setSimpleValue("Status Change");
			}
		}
		if (objectType == "Child_Org_Item") {
			var lob = node.getValue("Line_Of_Business").getID();
			var materialItemType = node.getValue("Material_Item_Type_Web").getSimpleValue();
			approvedStatus = approvedNode.getValue("Item_Status_WRLN").getID();
			currentStatus = node.getValue("Item_Status_WRLN").getID();
			if (approvedStatus != currentStatus) {
				node.getValue("Prev_Item_Status").setSimpleValue(approvedStatus);
			}
			if (lob == "WRLN" && materialItemType) {
				if (materialItemType == "Minor Material" || materialItemType == "Cable") {
					if ((approvedStatus == "Active S" && currentStatus == "Active NS") || (approvedStatus == "Active NS" && currentStatus == "Active S")) {
						node.getValue("Notify_Change_Type").setSimpleValue("Status Change");
					}
				}
			}
		}
	}
}

/**
 * author : Syed
 * rule	: Derive the Battery Technology Value from Battery Packaging attribute
 */
function setBatteryTechnology(node, stepManager) {
	var lob = node.getValue("Line_Of_Business").getID();
	var entAttWirelineList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Wireline_Item_Types").getSimpleValue();
	var itemTypeENT = node.getValue("ENT_Item_Type").getID();
	var batteryPackaging = node.getValue("Battery_Packaging").getID() + "";
	var retailAccessoryList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Retail_Accessory_Items").getSimpleValue();
	var retailDeviceList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Retail_Device_Items").getSimpleValue();
	var retailDigitalList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Retail_ATT_Digital_Life_Items").getSimpleValue();
	var retailNonAccessoryList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Retail_Non ATT_ Accessory_Items").getSimpleValue();
	var retailNonCollateralList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Retail_Non ATT_ Collateral_Items").getSimpleValue();
	var itemTypeRTL = node.getValue("RTL_Item_Type").getID();

	if (lob == "ENT" && itemTypeENT && entAttWirelineList.includes(itemTypeENT)) {
		if (batteryPackaging == "NONE") {
			node.getValue("Battery_Technology").setLOVValueByID("NONE");
		}
	} 
	else if (lob == "RTL" && itemTypeRTL &&
		(retailAccessoryList.includes(itemTypeRTL) ||
			retailDeviceList.includes(itemTypeRTL) ||
			retailDigitalList.includes(itemTypeRTL) ||
			retailNonAccessoryList.includes(itemTypeRTL) ||
			retailNonCollateralList.includes(itemTypeRTL))) {
		if (batteryPackaging == "NONE") {
			node.getValue("Battery_Technology").setLOVValueByID("NONE");
		}
	}
}

function setItemParent(node, stepManager) {
	var lob = node.getValue("Line_Of_Business").getID();
	var userItemType = '';
	if (lob == "NTW") {
		userItemType = node.getValue("User_Item_Type_NTW").getID();
	} else if (lob == "WRLN") {
		userItemType = node.getValue("User_Item_Type_WRLN").getID();
	} else if (lob == "RTL") {
		userItemType = node.getValue("User_Item_Type_RTL").getID();
	} else if (lob == "ENT") {
		userItemType = node.getValue("User_Item_Type_ENT").getID();
	}
	if (userItemType) {
		userItemType = userItemType.replace(' ', '_');
		var itemCategory = stepManager.getProductHome().getProductByID(userItemType);
		if (itemCategory) {
			node.setParent(itemCategory);
		}
	}
}


function clearAttributeValue(node, attribute){
	node.getValue(attribute).setSimpleValue("");
}

function setSerialGenerationVal(obj,parent,stepManager) {
	const orgCodeList = ['RLO', 'RL1', 'RL2', 'DSW', 'FLC', 'SAM', 'RL3'];
	var productSubType = parent.getValue('Product_Sub_Type').getID();
	if(productSubType) {
	   productSubType = productSubType.toLowerCase();
	}
	if (obj.getObjectType().getID() == "Child_Org_Item") {
		var orgCode = obj.getValue('Organization_Code').getID();		
		if (orgCode && productSubType) {
			if (orgCodeList.includes(String(orgCode)) && productSubType.contains('serial')) {
				if (!productSubType.contains('non')) {
					obj.getValue('Serial_Generation').setLOVValueByID('5');
				}
			}
		}
	}
	if (obj.getObjectType().getID() == "Companion_SKU") {
		var userItemType = parent.getValue('User_Item_Type_RTL').getID();		
		if (userItemType && productSubType) {
		    var serializedItemsList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Serialized_Subsidy_Items").getSimpleValue();
			if (serializedItemsList.includes(userItemType) && productSubType.contains('serial')) {
				if (!productSubType.contains('non')) {
					obj.getValue('Serial_Generation').setLOVValueByID('6');
				} else {
					obj.getValue('Serial_Generation').setLOVValueByID('1');
				}
			}
		}
	}
}

function setUPC(node,stepManager){
   var errorMessage = "";
   var objectType = node.getObjectType().getID();
   var generateNewUPC = node.getValue("Generate_New_UPC").getID();
   var UPC = node.getValue("UPC").getSimpleValue();
   if(!node.getValue("Item_Num").getValue()){
      if(generateNewUPC != "Y" && UPC) {
        errorMessage = setGtinUPC(node,stepManager,UPC);
   	 }
   }
   else{
      if((objectType == "Item" || objectType == "Companion_SKU") && UPC){
	     var approvedUPC = "";
		var approvedManager = stepManager.executeInWorkspace("Approved", function(step) {
			return step;
		});
		var approvedNode = approvedManager.getProductHome().getProductByID(node.getID());
		if (approvedNode) {
			approvedUPC = approvedNode.getValue("UPC").getSimpleValue();
		}
	    if(!approvedUPC ||(approvedUPC != UPC)) {
		    errorMessage = setGtinUPC(node,stepManager,UPC);
	  }
      }
   }
   log.info("inside common derivation setUPC.:"+errorMessage);   
   return errorMessage;   
}

function setGtinUPC(node,stepManager, UPC) {
	var errorMessage = "";
	if (UPC) {
		try {
			oldUpc = node.getValue("UPC_GTIN").getSimpleValue();
			if (oldUpc){
				stepManager.getKeyHome().updateUniqueKeyValues2({"UPC_GTIN": String("")}, node);
			}
			node.getValue("UPC_GTIN").setSimpleValue(UPC);
			log.info("UPC_GTIN Assignment Success");
		} catch (error) {
			//errorMessage = "Please enter valid UPC number or clear off the value for System Generated UPC";
			//throw ("Please enter valid UPC number or clear off the value for System Generated UPC");
			var errormsg = error.toString();
			log.info(errormsg);
			var startIndex1 = errormsg.indexOf("UniqueKeyViolation");
			var startIndex2 = errormsg.indexOf("GTINCheckDigitValidator");  
			var startIndex3 = errormsg.indexOf("GTINUnallowedChar");  
			//log.info("UPC_GTIN Assignment Error: "+error);

			if (startIndex1 > -1) {
                log.info("Error1");    
				errorMessage = "This UPC "+UPC+" exists on another Item. Retry with a new UPC";
            }
            
			if (startIndex2 > -1){
                log.info("Error2");
				errorMessage = "UPC "+UPC+" is invalid as per GTIN Check Digit validation. Please enter valid UPC.";
            }
			
			if (startIndex3 > -1){
                log.info("Error3");
				errorMessage = "UPC "+UPC+" has invalid characters. Please enter valid UPC and retry.";
            }
		}		
	}
	log.info("setGtinUPC errorMessage :"+errorMessage);
	return errorMessage;
}


/*
function setGtinUPC(node,UPC) {
	//var errorMessage = "";
	if (UPC) {
		try {
			node.getValue("UPC_GTIN").setSimpleValue(UPC);
		} catch (error) {
			//errorMessage = "Please enter valid UPC number or clear off the value for System Generated UPC";
			throw ("Please enter valid UPC number or clear off the value for System Generated UPC");
		}		
	}
	//return errorMessage;
}
*/

/**
 * Author: John
 * Rule  : Set Status Controlled Attrbutes values for all LOB
 */
function setStatusControlledAttributesValues(node, statusControlledLookupTable) {

	var lob = node.getValue("Line_Of_Business").getID();
	var itemStatus = "";
	if (lob == "NTW") {
		itemStatus = node.getValue("Item_Status_NTW").getID();
	} else if (lob == "WRLN") {
		itemStatus = node.getValue("Item_Status_WRLN").getID();
	} else if (lob == "RTL") {
		itemStatus = node.getValue("Item_Status_RTL").getID();
	} else if (lob == "ENT") {
		itemStatus = node.getValue("Item_Status_ENT").getID();
	}

	const StatusControlledAttributesList = [
    "Build_In_WIP_Flag",
    "Recipe_Enabled_Flag",
    "Process_Execution_Enabled_Flag",
    "BOM_Enabled_Flag",
    "Invoice_Enabled_Flag",
    "MTL_Transactions_Enabled_Flag",
    "Stock_Enabled_Flag",
    "Customer_Order_Enabled_Flag",
    "Internal_Order_Enabled_Flag",
    "Purchasing_Enabled_Flag"];

  StatusControlledAttributesList.forEach(AttributeID => setStatusControlledAttributeValue(node, statusControlledLookupTable, AttributeID, itemStatus));
}

function setStatusControlledAttributeValue(node, statusControlledLookupTable, statusControlledAttributeID, itemStatus) {

	if (itemStatus) {
		var statusControlledLookupResult = statusControlledLookupTable.getLookupTableValue("LT_Item_Status_Controlled_Attributes", statusControlledAttributeID + "|" + itemStatus);
		if (statusControlledLookupResult) {	
			if(statusControlledAttributeID == "Build_In_WIP_Flag" && !node.getValue(statusControlledAttributeID).getID()){				
				node.getValue(statusControlledAttributeID).setLOVValueByID(statusControlledLookupResult);
			}else if (statusControlledAttributeID != "Build_In_WIP_Flag") {
				node.getValue(statusControlledAttributeID).setLOVValueByID(statusControlledLookupResult);
			}			
		}
	}
}

/**
 * author : Aman, Syed
 * Rule   : List Price value population for Wirline , Retail and Entertainment LOB items
 */
function setListPrice(node) {
   var materialType = node.getValue("Material_Item_Type_Web").getID();
   var listPriceField = node.getValue("List_Price");
   var listPrice = listPriceField.getValue();
   var requestedStandardCost = node.getValue("Requested_Standard_Cost").getSimpleValue();
   var currentStandardCost = node.getValue("Current_Standard_Cost").getSimpleValue();
   var itemType = node.getValue("ENT_Item_Type").getID();
   var lob = node.getValue("Line_Of_Business").getID();
   var mwfInstance = node.getWorkflowInstanceByID("Item_Maintenance_Workflow");
   if (!listPrice) {
      if (lob == "WRLN") {
         if (materialType == "OSP Assembly" || materialType == "OSP Install" || materialType == "OSP Misc Material") {
            listPriceField.setSimpleValue("1");
         } else if (materialType == "Cable" || materialType == "Minor Material") {
            listPriceField.setSimpleValue("0.01");
         }
      }
      if (lob == "RTL" || (lob == "ENT" && itemType != "BVoIP")) {
         if (requestedStandardCost) {
            node.getValue("List_Price").setSimpleValue(requestedStandardCost);
         }
      } else if (mwfInstance) {
         if (lob == "RTL" || (lob == "ENT" && itemType != "BVoIP")) {
         	 if (currentStandardCost) {
         	 	node.getValue("List_Price").setSimpleValue(currentStandardCost);
         	 }            
         }
      }
   }
}

/**
 * author : John
 * Rule   : check whether the attribute is updated from approved workspace
 */
function isAttributeValueChanged(node, stepManager, attributeID) {

	var attributeValueChanged = false;
	var mainWSAttributeValue = "";
	
	mainWSAttributeValue = node.getValue(attributeID).getSimpleValue();	
	if (mainWSAttributeValue) {
		var approvedManager = stepManager.executeInWorkspace("Approved", function(step) {
			return step;
		});
		var approvedNode = approvedManager.getProductHome().getProductByID(node.getID());
		var approvedWSAttributeValue = "";
		if (approvedNode) {			
				approvedWSAttributeValue = approvedNode.getValue(attributeID).getSimpleValue();			
		}
		if (mainWSAttributeValue != approvedWSAttributeValue) {
			attributeValueChanged = true;
			
		}
	}	
	return attributeValueChanged;
}

function setReceiveCloseTolerance(node, stepManager) {
	var itemTypeENT = node.getValue("ENT_Item_Type").getID();
	var entATTBusinessClass = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("BVoIP_Item").getSimpleValue();
	var aTTEntertainmentItemType = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Item_Types").getSimpleValue();
	var matchApprovalLevel = node.getValue("Match_Approval_Level").getID();
	var receiptRequiredFlag = node.getValue("Receipt_Required_Flag").getID();
	var lob = node.getValue("Line_Of_Business").getID();
	if (lob == "ENT") {
		if (itemTypeENT && entATTBusinessClass.includes(itemTypeENT)) {
			if (matchApprovalLevel == "3" || matchApprovalLevel == "4") {
				node.getValue("Receive_Close_Tolerance").setSimpleValue("0");
			} else if (matchApprovalLevel == null || matchApprovalLevel == "2") {
				node.getValue("Receive_Close_Tolerance").setSimpleValue("100");
			}
		}
		if (itemTypeENT && aTTEntertainmentItemType.includes(String(itemTypeENT))) {
			if (receiptRequiredFlag == "Y") {
				node.getValue("Receive_Close_Tolerance").setSimpleValue("0");
			} else if (receiptRequiredFlag == "N") {
				node.getValue("Receive_Close_Tolerance").setSimpleValue("100");
			}
		}
	}
	if (lob == "WRLN") {
		var materialType = node.getValue("Material_Item_Type_Web").getID();
		var objectType = node.getObjectType().getID();
		var itemStatus = node.getValue("Item_Status_WRLN").getID();
		var patternAccount = node.getValue("Pattern_Account_WRLN").getID();
		var itemNumber = node.getValue("Item_Num").getSimpleValue();
		var heci = node.getValue("HECI").getSimpleValue();
		var listPrice = node.getValue("List_Price").getSimpleValue();
		var miccoe = node.getValue("MIC_COE_WRLN").getID();
		var receiveCloseTolerance = node.getValue("Receive_Close_Tolerance");
		var receiptRequiredFlag = node.getValue("Receipt_Required_Flag");
		var matchApprovalLevel = node.getValue("Match_Approval_Level");
		const itemStatusList = ["Phase NS", "Active NS", "Phase NI", "Active NI"];
		const itemStatusListForPlugIn = ["Phase NS", "Active S", "Active NS", "Phase NI", "Active NI"];
		const patternAccountListForMinorMaterial = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "T1", "T2", "T3", "T6"];
		const patternAccountList = ["C7", "C8", "C9"];
		  
		if (objectType == "Item") {
			if (materialType == "Plug-In" && itemNumber == "ATT." + heci) {
				if (itemStatus && patternAccount && itemStatusListForPlugIn.includes(String(itemStatus)) && patternAccountList.includes(String(patternAccount))) {
					receiveCloseTolerance.setSimpleValue("0");
					receiptRequiredFlag.setLOVValueByID("Y");
					matchApprovalLevel.setLOVValueByID("3");
				}
			}
			if (materialType == "Hardwired") {
				if (itemStatus && patternAccount && itemStatusList.includes(String(itemStatus)) && patternAccountList.includes(String(patternAccount))) {
					if (listPrice < 2000 && itemNumber && itemNumber.indexOf("ATT.1") == 0 &&
						(!miccoe || miccoe.indexOf("SAT") != 0)) {
						receiveCloseTolerance.setSimpleValue("100");
						receiptRequiredFlag.setLOVValueByID("N");
						matchApprovalLevel.setLOVValueByID("2");
					} else if ((listPrice >= 2000 && ! heci &&
							(!miccoe || miccoe.indexOf("SAT") != 0)) || itemNumber == "ATT." + heci) {

						receiveCloseTolerance.setSimpleValue("0");
						receiptRequiredFlag.setLOVValueByID("Y");
						matchApprovalLevel.setLOVValueByID("3");
					}
				}
			}
			if (materialType == "Minor Material") {
								
				if (itemStatus && patternAccount && itemStatusList.includes(String(itemStatus)) && patternAccountListForMinorMaterial.includes(String(patternAccount))) {
				
					receiveCloseTolerance.setSimpleValue("100");
					receiptRequiredFlag.setLOVValueByID("N");
					matchApprovalLevel.setLOVValueByID("2");
				}
				if (patternAccount == "T4" && itemStatusList.includes(String(itemStatus))) {
					receiveCloseTolerance.setSimpleValue("0");
					receiptRequiredFlag.setLOVValueByID("Y");
					matchApprovalLevel.setLOVValueByID("3");

				}
			}
			if (materialType == "RTU Expense" || (materialType == "RTU Capital" && (!miccoe || miccoe.indexOf("SAT") !== 0))) {
				if (itemStatus && patternAccount && itemStatusList.includes(String(itemStatus)) && patternAccountList.includes(String(patternAccount))) {
					receiveCloseTolerance.setSimpleValue("100");
					receiptRequiredFlag.setLOVValueByID("N");
					matchApprovalLevel.setLOVValueByID("2");

				}
			}
		}
		if (objectType == "Child_Org_Item" && materialType == "Minor Material") {
			if (itemStatus == "Active S" && patternAccount && patternAccountListForMinorMaterial.includes(String(patternAccount))) {
				receiveCloseTolerance.setSimpleValue("0");
				receiptRequiredFlag.setLOVValueByID("Y");
				matchApprovalLevel.setLOVValueByID("3");
			}
		}
	}
}

function setReceiptRequiredFlag(node, stepManager) {
	var lob = node.getValue("Line_Of_Business").getID();
	var itemTypeENT = node.getValue("ENT_Item_Type").getID();
	var aTTEntertainmentItemType = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Item_Types").getSimpleValue();
	var matchApprovalLevel = node.getValue("Match_Approval_Level").getID();
	if (lob == "ENT" && itemTypeENT) {
		if (itemTypeENT == "BVoIP" || aTTEntertainmentItemType.includes(itemTypeENT)) {
			if (matchApprovalLevel == "3" || matchApprovalLevel == "4") {
				node.getValue("Receipt_Required_Flag").setLOVValueByID("Y");
			} else if (!matchApprovalLevel || matchApprovalLevel == "2") {
				node.getValue("Receipt_Required_Flag").setLOVValueByID("N");
			}
		}
	}
}

function replaceHtmlTags(value) {
    return value.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&lt;/g, "<lt/>").replace(/&gt;/g, "<gt/>");
}


/**
 * author : John
 * Rule  : If "CA Prop 65 Toxicity Type" is None (ND), then set "NA"
 */
function setCAManufacturerPackageWarning(node) {

	var lob = node.getValue("Line_Of_Business").getID();
	var caProp65ToxicityType = node.getValue("CA_Prop_65_Toxicity_Type").getID();
	if (lob == "RTL" && caProp65ToxicityType == "ND") {		
		node.getValue("CA_Manufacturer_Package_Warning").setLOVValueByID("NA");
	} else if (lob == "ENT" && caProp65ToxicityType == "ND") {
		var itemTypeENT = node.getValue("ENT_Item_Type").getID()+"";
		const itemTypeList = ["DTV MAKEMODEL", "UVR BB MAKEMODEL", "Field Inventory Aggregation Code"];			
		if (!itemTypeList.includes(itemTypeENT)) {						
			node.getValue("CA_Manufacturer_Package_Warning").setLOVValueByID("NA");
		}
	}
}

function initiateBPAPendingWorkflow_ICWF(node,stepManager,ciRef){
    var lob = node.getValue("Line_Of_Business").getID();
	var notifySourcing = node.getValue("Sourcing_Notify").getID();
	var objectType = node.getObjectType().getID();
	if((objectType == "Item" || objectType == "Child_Org_Item") && lob == "WRLN"){
	   var bomType = node.getValue("NTW_BOM_Type_WRLN").getID();
	   var businessGrp = node.getValue("Business_Group").getSimpleValue();
	}
	if ((lob == "WRLN" && bomType != "NON Stock" && businessGrp != "DTV" && notifySourcing == "Y") ||
		((lob == "RTL" || lob == "ENT") && notifySourcing == "Y") || ((lob == "WRLN" || lob == "RTL" || lob == "ENT") && ciRef == 'Y')) //STIBO-2011 changes
		{
			if (!node.isInWorkflow("BPA_Action_Pending_WF")) {
				node.startWorkflowByID("BPA_Action_Pending_WF", "Start Workflow");
				var pendingWFInstance = node.getWorkflowInstanceByID("BPA_Action_Pending_WF");
				var task = pendingWFInstance.getTaskByID("Start");
				setBPAPendingWorkflowAssignee(node,stepManager,task);
				if (task) {
					task.triggerByID("ToOnboarding", "Item moved ToOnboarding state of Action Pending Workflow");					
				}
			}
			node.getValue("Sourcing_Comments").setSimpleValue(null);
			node.getValue("Sourcing_Notify").setSimpleValue(null);
		}
}
		
function setBPAPendingWorkflowAssignee(node,stepManager,task) {
    var lob = node.getValue("Line_Of_Business").getID();
    var notifySourcing = node.getValue("Sourcing_Notify").getID();
	var sourcingMgr = node.getValue("Contract_Manager").getID();
	if (sourcingMgr){
	   sourcingMgr = sourcingMgr.toUpperCase();
	   if(!sourcingMgr.includes("@ATT.COM")) {
		sourcingMgr = sourcingMgr + "@ATT.COM";
	   }
	}

	if (!sourcingMgr || !stepManager.getUserHome().getUserByID(sourcingMgr)) {
		if (lob == "WRLN") {
			var Users = stepManager.getGroupHome().getGroupByID("UG_WRLN_Sourcing");
			task.reassign(Users);
			node.getWorkflowInstanceByID("BPA_Action_Pending_WF").setSimpleVariable("currentUser", Users.getID());

		} else if (lob == "ENT" && node.getParent().getID() != "SATELLITE") {
			var Users = stepManager.getGroupHome().getGroupByID("UG_ENT_Buyer")
			task.reassign(Users);
			node.getWorkflowInstanceByID("BPA_Action_Pending_WF").setSimpleVariable("currentUser", Users.getID());

		}else if (lob == "ENT" && node.getParent().getID() == "SATELLITE") {
			var Users = stepManager.getGroupHome().getGroupByID("UG_DTV_Sourcing")
			task.reassign(Users);
			node.getWorkflowInstanceByID("BPA_Action_Pending_WF").setSimpleVariable("currentUser", Users.getID());

		} else if (lob == "RTL") {
			var Users = stepManager.getGroupHome().getGroupByID("UG_RTL_Planner")
			task.reassign(Users);
			node.getWorkflowInstanceByID("BPA_Action_Pending_WF").setSimpleVariable("currentUser", Users.getID());

		}
	} else {
		var userID = stepManager.getUserHome().getUserByID(sourcingMgr);
		task.reassign(userID);
		node.getWorkflowInstanceByID("BPA_Action_Pending_WF").setSimpleVariable("currentUser", userID.getID());
	}
	var sourcingComments = node.getValue("Sourcing_Comments").getSimpleValue();
	if (sourcingComments) {
		node.getValue("BPA_Pending_Comments").addValue(getCurrentDate() + " " + sourcingComments);
	}
	if ((node.getObjectType().getID() == "Child_Org_Item") && (notifySourcing == "Y"))
		node.getValue("Status_Updated_DateTime").setSimpleValue(getCurrentDate());
}		
		
function sendConsignEmailNotification(node,stepManager,mailHome,ciRef,consignUpdate){
        var objectType = node.getObjectType().getID();
		if (ciRef == "Y" && consignUpdate == "Y") {
			node.getValue("BPA_Pending_Comments").addValue(getCurrentDate() + " " + 'New item referenced by Contract Item');
			var createdUserID = node.getValue("Created_By").getValue(); // STIBO-3192 Prod Support Jan Release
			var updatedUserID = node.getValue("Last_Updated_By").getValue(); // STIBO-3192 Prod Support Jan Release			
			if (!updatedUserID) {
				aslLib.sendOrgConsgnEmail(node, stepManager, createdUserID, mailHome, auditLib.getHostEnvironment());
			}
			else {
				log.severe("Initiated Consign Email to Updated User")
				aslLib.sendOrgConsgnEmail(node, stepManager, updatedUserID, mailHome, auditLib.getHostEnvironment());
			}
			if (aslLib.getContractMgr(node) != '') {
				var userID = aslLib.getContractMgr(node);
				aslLib.sendOrgConsgnEmail(node, stepManager, userID, mailHome, auditLib.getHostEnvironment());
			}
		}
}	

function initiateBPAPendingWorkflow_IMWF(node,stepManager,ciRef,consignUpdate){
    var lob = node.getValue("Line_Of_Business").getID();
	var ciRef = aslLib.validCIRefCheck(node, stepManager);
	var consignUpdate = aslLib.validConsgnUpdCheck(node, stepManager);
	var notifySourcing = node.getValue("Sourcing_Notify").getID();
	var objectType = node.getObjectType().getID();
	if((objectType == "Item" || objectType == "Child_Org_Item") && lob == "WRLN"){
	   var bomType = node.getValue("NTW_BOM_Type_WRLN").getID();
	   var businessGrp = node.getValue("Business_Group").getSimpleValue();
	}
	if ((lob == "WRLN" && bomType != "NON Stock" && businessGrp != "DTV" && notifySourcing == "Y") ||
		((lob == "RTL" || lob == "ENT") && notifySourcing == "Y") || ((lob == "WRLN" || lob == "RTL" || lob == "ENT") && ciRef == "Y" && consignUpdate == "Y")) //STIBO-2011 changes
		{
			if (!node.isInWorkflow("BPA_Action_Pending_WF")) {
			log.info("Initiated into Pending WF")
				node.startWorkflowByID("BPA_Action_Pending_WF", "Start Workflow");
				var pendingWFInstance = node.getWorkflowInstanceByID("BPA_Action_Pending_WF");
				var task = pendingWFInstance.getTaskByID("Start");
				setBPAPendingWorkflowAssignee(node,stepManager,task);
				if (task) {
					task.triggerByID("ToMaintenance", "Item moved ToMaintenance state of Action Pending Workflow");					
				}
			}
			else {
					var task;
					var pendingWFInstance = node.getWorkflowInstanceByID("BPA_Action_Pending_WF");
					if (node.isInState("BPA_Action_Pending_WF", "Item_Maintenace")) {
						task = pendingWFInstance.getTaskByID("Item_Maintenace");
					}
					if (node.isInState("BPA_Action_Pending_WF", "Item_Onboarding")) {
						task = pendingWFInstance.getTaskByID("Item_Onboarding");
					}
					setBPAPendingWorkflowAssignee(node,stepManager,task);
				}
			node.getValue("Sourcing_Comments").setSimpleValue(null);
			node.getValue("Sourcing_Notify").setSimpleValue(null);
		}
}

/**
 * @author - AW304F
 * Rule Name: Set Primary UOM Code
 * Relex Retrofitting
 */
 
function setPrimaryUomCode(node) {
	var primaryuom = node.getValue("Primary_UOM").getSimpleValue();
	if(primaryuom){
		var tempuomcode = primaryuom.split(' ')[0];
		tempuomcode = tempuomcode.trim();
		node.getValue("Primary_UOM_Code").setSimpleValue(tempuomcode);
	}
}	


/**
 * @author - AW304F
 * Rule Name: Set DaaS Consumer Type
 * Relex Retrofitting
 */
 
function relexFilter(node) {

    var objectTypeId = node.getObjectType().getID();
	var approvalStatus = node.getApprovalStatus();

	if(approvalStatus == "Completely Approved"){

		if (objectTypeId == "Item" || objectTypeId == "Companion_SKU") {
			var planningBusinessGroup = node.getValue("Planning_Business_Group").getID();
			var planningSystem = node.getValue("Planning_System").getSimpleValue();
			var lovId = "Relex";

			if (objectTypeId == "Item") {
				if (planningSystem == "JDA" || planningSystem == "RELEX") {
					if (planningBusinessGroup == "WIRELINE") {
						lovId = "Relex";
						node.getValue("Daas_Consumer_Type").replace().addLOVValueByID(lovId).apply();
					}
				}
			}
			
			if (planningBusinessGroup == "BROADBAND" || planningBusinessGroup == "MOBILITY" || planningBusinessGroup == "MOBILITY RL") {
				lovId = "RelexItems";
				node.getValue("Daas_Consumer_Type").replace().addLOVValueByID(lovId).apply();
			}
		}

		if (objectTypeId == "Bill_Of_Material" )
		{
			var lob = node.getValue("BOM_Line_Of_Business").getID();
			if (lob == "ENT" || lob == "RTL") {
				node.getValue("BOM_DaaS_Consumer_Type").setSimpleValue("RelexBOM");
			}
		}
			
		if ( objectTypeId == "BOM_Child" )  {
			var parentItemNumber = node.getValue("Parent_Item").getSimpleValue();
			if (parentItemNumber) {
				var lob = node.getParent().getValue("BOM_Line_Of_Business").getID();
				if (lob == "ENT" || lob == "RTL") {
					node.getValue("BOM_DaaS_Consumer_Type").setSimpleValue("RelexBOM");
				}
			}
		}

		if (objectTypeId == "BOM_Child_Substitute"){
			var parentItemNumber = node.getValue("Parent_Item").getSimpleValue();
			if (parentItemNumber) {
				var checkBOMConsumerType = node.getParent().getValue("BOM_DaaS_Consumer_Type").getSimpleValue();
				if (checkBOMConsumerType == "RelexBOM") {
					node.getValue("BOM_DaaS_Consumer_Type").setSimpleValue("RelexBOM");
				}
			}
		}
	}
}

/**
 * @author - AW304F
 * Rule Name: Set Planning Business Group
 * Relex Retrofitting
 */


function setPlanningBusinessGroup(node,stepManager) {
	
	var objectType = node.getObjectType().getID();
	var lob = node.getValue("Line_Of_Business").getID();
	var planningBusinessGroup = node.getValue("Planning_Business_Group").getSimpleValue();
    var materialItemType = node.getValue("Material_Item_Type").getID();
    var planningSystem = node.getValue("Planning_System").getSimpleValue();
    var rtlItemType = node.getValue("RTL_Item_Type").getID();
	var entItemType = node.getValue("ENT_Item_Type").getID();	
	var entATTWirelineList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Wireline_Item_Types").getSimpleValue();

    if (lob == "WRLN" && materialItemType == "Minor Material" && (planningBusinessGroup!='WIRELINE') && planningSystem!=null) {
        node.getValue("Planning_Business_Group").setLOVValueByID("WIRELINE");
    }
	
    if (lob == "NTW" && (planningBusinessGroup!='NETWORK')) {
        node.getValue("Planning_Business_Group").setLOVValueByID("NETWORK");
    }

    if (rtlItemType && (planningBusinessGroup!='MOBILITY') && objectType == "Item") {
        node.getValue("Planning_Business_Group").setLOVValueByID("MOBILITY");
    }
	
	if(entItemType && entATTWirelineList.includes(entItemType) && (planningBusinessGroup!='BROADBAND') && (objectType == "Item" || objectType == "Companion_SKU")){
		node.getValue("Planning_Business_Group").setLOVValueByID("BROADBAND");	
	}
}

/**
 * @author - PP588A
 * Rule Name: Set Customer Order Flag =Y if Customer Orders Enabled Flag is Y
 */

function setCustomerOrderFlag(node) {
	var customerOrderEnabled = node.getValue("Customer_Order_Enabled_Flag").getID();
	var customerOrder = node.getValue("Customer_Order_Flag").getID();
    
	if (customerOrderEnabled == "Y" && customerOrder == "N") {
        node.getValue("Customer_Order_Flag").setLOVValueByID("Y");
    }
}

/**
 * @author - John
 * Rule Name: Set setSubmitStandardCost = Y, if RSC and CSC are not same in maintenance of PITEM and CompSKU
 */

function setSubmitStandardCost(node) {

	var itemNumber = node.getValue("Item_Num").getSimpleValue();
	var requestedStandardCost = node.getValue("Requested_Standard_Cost").getSimpleValue();
	var currentStandardCost = node.getValue("Current_Standard_Cost").getSimpleValue(); 	
	if (itemNumber && requestedStandardCost && currentStandardCost && requestedStandardCost != currentStandardCost) {		
        node.getValue("Submit_Standard_Cost").setLOVValueByID("Y");
    }
}


/**
 * @author - Pradeep 
 * set Publish Item Description for RTL and ENT items
 */

function setPublishItemDescription(node, stepManager) {
	// Define item_type groups based on PDH Item Desc calculation
	var itemTypes1 = [
		"ACCESSORY_3PP", "ACCESSORY_APPCESSORY", "ACCESSORY_AUDIO", "ACCESSORY_CASE", "ACCESSORY_BATTERY",
		"ACCESSORY_CARADAPTER", "ACCESSORY_POWER_DATA", "REFURBISH_BATTERY", "ACCESSORY_SCREENPRTCT", "ACCESSORY_CHARGER",
		"ACCESSORY_SPECIALTY", "REPLACEMENT_PARTS", "ENTERTAINMENT_MOBILITY_DEVICE", "ENTERTAINMENT_MOBILITY_ACCESSORY",
		"ENTERTAINMENT_MOBILITY_COLLATERAL", "COMPUTER", "ELECTRONIC_3PP", "ELECTRONIC_NONSERIALIZED",
		"ELECTRONIC_SERIALIZED", "PHONE", "PHONE_DISPLAY", "PHONE_PREPAID_IDB", "PHONE_PREPAID_PIB", "PHONE_PREPAID_PYG",
		"SIM", "MSSNONSTCK_NONATT_ACCESSORY", "ACV_EQUIP_NONATT_DEVICE", "MSSNONSTCK_NONATT_COMPUTER",
		"MSSNONSTCK_NONATT_ELECTRONIC", "MSSNONSTCK_NONATT_PHONE"
	];
	var itemTypes2 = [
		"PHONE_PALLET", "PHONE_PALLET_PIB", "PHONE_PALLET_PYG", "DF_COLLATERAL_INTANG2", "DF_FREIGHT", "INTANG1",
		"INTANG2", "INTANG2_3PP", "INTANG3", "PREPAY_CARD_SERIALIZED", "EPIN_PREPAY", "DF_BILL_ONLY", "DF_3PL",
		"MSSNONSTCK_COLLATERAL"
	];
	var itemTypes3 = [
		"DF_COLLATERAL_YOUNG_AMERICA", "DF_COLLATERAL_GENERAL", "SECRTY_DIGITAL_LIFE_ACCESSORY",
		"SECRTY_DIGITAL_LIFE_DEVICE", "SECRTY_DIGITAL_LIFE_PACKAGE"
	];

	var lob = node.getValue("Line_Of_Business").getID();
	var pdhDesc = "";
	
	if (lob == "RTL") {
		var itemType = node.getValue("RTL_Item_Type").getID();
		var itemStatus = node.getValue("Item_Status_RTL").getSimpleValue();

		if (itemTypes1.includes(String(itemType))) {
			// Group 1 logic
			if (itemStatus && itemStatus.toUpperCase() == "PRE LAUNCH") {
				pdhDesc = "NEW PRODUCT";
			} else {
				var descriptionPrefix = node.getValue("Description_Prefix").getID();
				var oem = node.getValue("OEM").getID();
				var marketingName = node.getValue("Marketing_Name").getSimpleValue();
				var model = node.getValue("Model").getSimpleValue();
				var color = node.getValue("COLOR").getID();

				if (color == "OOO") {
					pdhDesc = [descriptionPrefix, oem, marketingName, model].filter(Boolean).join(" ");
				} else {
					pdhDesc = [descriptionPrefix, oem, marketingName, model, color].filter(Boolean).join(" ");
				}
			}
		} else if (itemTypes2.includes(String(itemType))) {
			// Group 2 logic
			var userDefinedDesc = node.getValue("User_Defined_Item_Description").getSimpleValue();
			if (!userDefinedDesc) {
				pdhDesc = "NOT AVAILABLE";
			} else {
				pdhDesc = userDefinedDesc;
			}
		} else if (itemTypes3.includes(String(itemType))) {
			// Group 3 logic
			var descriptionPrefix = node.getValue("Description_Prefix").getID();
			var userDefinedDesc = node.getValue("User_Defined_Item_Description").getSimpleValue();
			pdhDesc = [descriptionPrefix, userDefinedDesc].filter(Boolean).join(" ");
		} else {
			pdhDesc = node.getValue("Item_Description").getSimpleValue();
		}
	} else if (lob == "ENT") {
		var entItemType = node.getValue("ENT_Item_Type").getID();
		var entItemStatus = node.getValue("Item_Status_ENT").getSimpleValue();

		var entATTWirelineList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Wireline_Item_Types").getSimpleValue();
		var entATTDTVList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Item_Types").getSimpleValue();

		if (entItemType && entATTWirelineList && entATTWirelineList.includes(entItemType)) {
			if (entItemStatus && entItemStatus.toUpperCase() == "PRE LAUNCH") {
				pdhDesc = "NEW PRODUCT";
			} else {
				var entDescriptionPrefix = node.getValue("Description_Prefix").getID();
				var entOem = node.getValue("OEM").getID();
				if (!entOem){
					entOem = "";
					}
				var entUserDesc = node.getValue("User_Defined_Item_Description").getSimpleValue();
				var parts = [];
				var prefixSegment = safeSubstring(String(entDescriptionPrefix), 3);
				if (prefixSegment) {
					parts.push(prefixSegment);
				}
				var oemSegment = safeSubstring(String(entOem), 3);
				if (oemSegment) {
					parts.push(oemSegment);
				}
				var userDescSegment = safeSubstring(String(entUserDesc), 22);
				if (userDescSegment) {
					parts.push(userDescSegment);
				}
				pdhDesc = parts.join(" ");
			}
		} else if (entItemType && entATTDTVList && entATTDTVList.includes(entItemType)) {
			var entUserDefinedDesc = node.getValue("User_Defined_Item_Description").getSimpleValue();
			pdhDesc = safeSubstring(String(entUserDefinedDesc), 30);
		} else {
			pdhDesc = node.getValue("Item_Description").getSimpleValue();
		}
	} else {
		pdhDesc = node.getValue("Item_Description").getSimpleValue();
	}

	if (pdhDesc) {
		pdhDesc = removeSpecialChars(pdhDesc);
		node.getValue('PDH_Item_Description').setSimpleValue(pdhDesc.substring(0, Math.min(pdhDesc.length, 30)));
	}
}

function safeSubstring(value, length) {
   if (typeof value == "string") {
        return value.substring(0, Math.min(value.length, length));
    } else {
        return "";
    }
}

function removeSpecialChars(attrValue) {
    if (attrValue == null) {
        return attrValue;
    }

    return String(attrValue)
        .replace(/[^A-Za-z0-9$ ]+/g, " ")   // replace everything else with space
        .replace(/\s{2,}/g, " ")            // collapse runs of whitespace
        .trim();
}
}

/**
 * @author - John  
 * Revert to Generate_New_UPC to approved Value
 */
function revertGenerateNewUPC(compSKU, stepManager){	
		
	if(isAttributeValueChanged(compSKU, stepManager, "Generate_New_UPC")){			
		var approvedGenerateNewUPC = commonValidationLib.getApprovedWSAttributeValue(compSKU, stepManager, "Generate_New_UPC");		
		if(approvedGenerateNewUPC){
			 compSKU.getValue("Generate_New_UPC").setLOVValueByID(approvedGenerateNewUPC);
		}
	}
}

/*===== business library exports - this part will not be imported to STEP =====*/
exports.recursiveApproval = recursiveApproval
exports.approveChildren = approveChildren
exports.sendItemCreationEmail = sendItemCreationEmail
exports.getSubjectEmailBody = getSubjectEmailBody
exports.getEmailUsersList = getEmailUsersList
exports.getEmailId = getEmailId
exports.sendEmailNotification = sendEmailNotification
exports.deleteKey = deleteKey
exports.setLOBAndUserItemType = setLOBAndUserItemType
exports.setUserItemType = setUserItemType
exports.redirectWorkflowEnrichState = redirectWorkflowEnrichState
exports.getWorkflowState = getWorkflowState
exports.setAssignee = setAssignee
exports.initiateItemIntoWorkflow = initiateItemIntoWorkflow
exports.setItemDescription = setItemDescription
exports.removeSpecialCharsAndToUpperCase = removeSpecialCharsAndToUpperCase
exports.convertToUpperCaseAndExcludeHTMLTags = convertToUpperCaseAndExcludeHTMLTags
exports.convertToUpperCase = convertToUpperCase
exports.removeJunkChars = removeJunkChars
exports.roundDecimalValue = roundDecimalValue
exports.roundListPrice = roundListPrice
exports.getCurrentDate = getCurrentDate
exports.trimWhiteSpacesAndNewLines = trimWhiteSpacesAndNewLines
exports.copyAttributeValue = copyAttributeValue
exports.copyAttributeValueIfEmpty = copyAttributeValueIfEmpty
exports.setDefaultValueIfEmpty = setDefaultValueIfEmpty
exports.deriveBasedOnItemType = deriveBasedOnItemType
exports.setConsignmentVariable = setConsignmentVariable
exports.setOrderableOnWebFlag = setOrderableOnWebFlag
exports.partialApproveFields = partialApproveFields
exports.getAttributeGroupList = getAttributeGroupList
exports.setItemRequestor = setItemRequestor
exports.setHazmatUnNumber = setHazmatUnNumber
exports.setSerialGeneration = setSerialGeneration
exports.setIMEIType = setIMEIType
exports.setIntangibleNonShippable = setIntangibleNonShippable
exports.clearAttributeValue = clearAttributeValue
exports.setSourcingNotify = setSourcingNotify
exports.setBatteryTechnology = setBatteryTechnology
exports.setItemParent = setItemParent
exports.clearAttributeValue = clearAttributeValue
exports.setSerialGenerationVal = setSerialGenerationVal
exports.setUPC = setUPC
exports.setGtinUPC = setGtinUPC
exports.setStatusControlledAttributesValues = setStatusControlledAttributesValues
exports.setStatusControlledAttributeValue = setStatusControlledAttributeValue
exports.setListPrice = setListPrice
exports.isAttributeValueChanged = isAttributeValueChanged
exports.setReceiveCloseTolerance = setReceiveCloseTolerance
exports.setReceiptRequiredFlag = setReceiptRequiredFlag
exports.replaceHtmlTags = replaceHtmlTags
exports.setCAManufacturerPackageWarning = setCAManufacturerPackageWarning
exports.initiateBPAPendingWorkflow_ICWF = initiateBPAPendingWorkflow_ICWF
exports.setBPAPendingWorkflowAssignee = setBPAPendingWorkflowAssignee
exports.sendConsignEmailNotification = sendConsignEmailNotification
exports.initiateBPAPendingWorkflow_IMWF = initiateBPAPendingWorkflow_IMWF
exports.setPrimaryUomCode = setPrimaryUomCode
exports.relexFilter = relexFilter
exports.setPlanningBusinessGroup = setPlanningBusinessGroup
exports.setCustomerOrderFlag = setCustomerOrderFlag
exports.setSubmitStandardCost = setSubmitStandardCost
exports.setPublishItemDescription = setPublishItemDescription
exports.safeSubstring = safeSubstring
exports.removeSpecialChars = removeSpecialChars
exports.revertGenerateNewUPC = revertGenerateNewUPC
exports.revertGenerateNewUPC = revertGenerateNewUPC