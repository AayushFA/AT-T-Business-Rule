/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CITEM_Bulk_Email_Send",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "CITEM Bulk Email Send",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Item" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_Audit_Library",
    "libraryAlias" : "libAudit"
  }, {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "lib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
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
    "contract" : "MailHomeBindContract",
    "alias" : "mailHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ClassificationProductLinkTypeBindContract",
    "alias" : "supplierReference",
    "parameterClass" : "com.stibo.core.domain.impl.ClassificationProductLinkTypeImpl",
    "value" : "BPA_To_Supplier",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,queryHome,mailHome,supplierReference,libAudit,lib) {
log.info("Start of BPA Bulk Eail BR");
var querySpecification;
var query =null;
var itemList_1hr = [];
var mailMessage;
var assignee;
var assigneeMap = new java.util.HashMap();
var itemList;

// Setup Query for items in a specific workflow state.
var condition = com.stibo.query.condition.Conditions;
var workflowID = step.getWorkflowHome().getWorkflowByID("BPA_Action_Pending_WF");
var itemOnboardingState = workflowID.getStateByID("Item_Onboarding");
var itemMaintenanceState = workflowID.getStateByID("Item_Maintenace");

//Items in BPA Pending Action WF	
querySpecification = queryHome.queryWorkflowTasks().where (condition.workflow().eq(workflowID));
query= querySpecification.execute();
executeQuery(query);
//Trigger Email Notifications on Items List per User 
getItemDetailsPerAssignee();
log.info("End of BPA Bulk Email BR");

function executeQuery(query){
if(query){
query.forEach(function(aTask) {	
	var currentNode = aTask.getNode();
	var objID = aTask.getNode().getID();	
	if(currentNode.isInState("BPA_Action_Pending_WF", "Item_Onboarding"))
	{
		assignee = currentNode.getWorkflowInstanceByID("BPA_Action_Pending_WF").getTaskByID("Item_Onboarding").getAssignee().getID();
	}
	if(currentNode.isInState("BPA_Action_Pending_WF", "Item_Maintenace"))
	{
		assignee = currentNode.getWorkflowInstanceByID("BPA_Action_Pending_WF").getTaskByID("Item_Maintenace").getAssignee().getID();
	}		
	if(assigneeMap.get(assignee))
	{
		itemList = assigneeMap.get(assignee);
		itemList.add(currentNode);
	}
	else{
		itemList = new java.util.ArrayList();
		itemList.add(currentNode);
		assigneeMap.put(assignee, itemList);
	}	
	return true;
});
}
}

function getItemDetailsPerAssignee()
{
	var assigneeSet = assigneeMap.keySet();
	var itr = assigneeSet.iterator()
     var numberOfHours = 0;
	while(itr.hasNext())
	{
		itemList_1hr  = [];
		var assigneeID = itr.next();		
		var itemListPerUser = assigneeMap.get(assigneeID);
		log.info(assigneeID + "  " +itemListPerUser);
		for(var i=0;i<itemListPerUser.size();i++)
		{
			var currentItem = itemListPerUser.get(i);		
			if(currentItem.getObjectType().getID() == "Child_Org_Item"){
				var WFInstance = currentItem.getWorkflowInstanceByID("BPA_Action_Pending_WF");				
				var updateDateTime = currentItem.getValue("Status_Updated_DateTime").getSimpleValue();				
				var currentdateTime = getCurrentDateTime();				
				var minsDiff = Math.abs(new Date(currentdateTime) - new Date(updateDateTime));
				minsDiff = Math.round(parseInt(minsDiff) / 60000);								
				if (minsDiff <= 60) {
				 itemList_1hr.push(currentItem);
				}
			}										
		}
		log.info("itemList_1Hr = " + itemList_1hr.length + itemList_1hr);		
		if(itemList_1hr.length > 0)
		{   			
			log.info("Into 1 HR Eail")		
			var message = "";
			var emailBody ="";
			var header1 = "The below Items are associated with the BPA's listed so the Region Data may need to change.<br><br>"									
			var stiboLink = "<!DOCTYPE html><html><body><a href= 'https://att-prod.mdm.stibosystems.com'>STEP</a></body></html>"			
			var guideLink = "<!DOCTYPE html><html><body><a href= 'https://att.sharepoint.com/sites/STIBOSTEPforDataGovernance/SitePages/STEP-by-STIBO.aspx'>BPA User Guide</a></body></html>"				
			var header2 = "STEP Quick Links :"+stiboLink+guideLink+"<br>-----------------------------------------------------------"
			//var emailBody = "STEP Quick Links: "+stiboLink+" & "guideLink+						
			//"\n-----------------------------------------------------------"+message;			
			message = getEmailNotifMessage(itemList_1hr)
			var emailBody = header1+header2+message;
			var subject = "The Org Status Change was successfully processed in PDH";
			log.info("Returned mail message: "+emailBody)			
			identifyUserOrGroup(assigneeID,emailBody,subject);
		}
	}	
}

function calculateNumberOfHours(responseTime)
{		
	var differenceHours = Math.abs(new Date (lib.getCurrentDate()).getTime() - new Date (responseTime).getTime());
	var numberOfDays = differenceDays/perDay;
	log.info("differenceHours = " + differenceHours);	
	return differenceHours;
}


function identifyUserOrGroup(assigneeID,message,subject)
{	
	var users = step.getUserHome().getUserById(assigneeID);
	if(users == null)
	{/*
		log.info("1...............");
		var Users = step.getGroupHome().getGroupByID(assigneeID).getUsers().toArray();
		Users.forEach(function (user) {
		var userID = checkUserID(user);			
		if (userID)
		sendEmailNotif(userID, subject, message);
		});*/
	}
	else
	{		
		var userID = checkUserID(users);			
		sendEmailNotif(userID, subject, message);
	}
}

function checkUserID(user) {
  var userID;
  if (user.getID().contains('@ATT.COM'))
     userID = user.getID();
  else if (user.getEMail()) {
    //Add validation to check the Email standards
    userID = user.getEMail();
  }
  return userID;
}

function sendEmailNotif(userID, subject, message) {
  var mail = mailHome.mail();
  var instanceName = libAudit.getHostEnvironment();
  var sender = instanceName + "-noreply@cloudmail.stibo.com";
  mail.from(sender);
  mail.addTo(userID);
  //mail.addTo("td8457@att.com");
  mail.subject(subject);
  mail.htmlMessage(message);
  //mail.plainMessage(message);
  mail.send();
}

function getCurrentDateTime() {
	var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
	var dateTimeNow = new Date();
	var formattedDateTime = dateTimeFormatter.format(dateTimeNow);
	return formattedDateTime;
}

function getEmailNotifMessage(itemList)
{    
      var mailMessage="";
	for(var i=0;i<itemList.length;i++)
	{   
	    log.info("Send EmailNotif Loop for "+ itemList[i].getID())
	    var item = itemList[i];
	    mailMessage = mailMessage +getItemMessage(item)+"<br>---------------------------------------------------------"
	    }	
	return mailMessage;
}
function getItemMessage(item){
	     var msg=""
		var itemNum = item.getValue("Item_Num").getSimpleValue();
		var itemStatus = item.getValue("Item_Status").getSimpleValue();
		var previtemStatus = item.getValue("Prev_Item_Status").getSimpleValue();
		var mfg = item.getValue("Mfg_Part_No").getSimpleValue();
		var itemDesc = item.getValue("User_Defined_Item_Description").getSimpleValue();
		var initiator = item.getValue("Submitted_By").getSimpleValue();
		if(initiator) {
		initiator = step.getUserHome().getUserByID(initiator);	
		var ID = initiator.getID();
		if(ID.contains("@"))
		  ID = ID.substring(0,ID.indexOf("@"));		
		initiator = initiator.getName()+" ("+ID+")"
		}
		var comments = item.getValue("BPA_Pending_Comments").getSimpleValue();
		if(comments)
		    comments = comments.replace("<multisep/>", " | ");
		var mgr = item.getParent().getValue("Contract_Manager").getSimpleValue();
		var revision = item.getRevision().getName() + " Created By "+ item.getRevision().getUserID() +" on "+  item.getRevision().getEditedDate()
		if(item.getObjectType().getID() == "Item")
		  var BPALines = item.getReferencedByProducts();
		if(item.getObjectType().getID() == "Child_Org_Item"){
		  var pitemStatus = item.getParent().getValue("Item_Status").getSimpleValue();
		  var orgCode = item.getValue("Organization_Code").getSimpleValue();
		  var orgID = item.getValue("Organization_Code").getID();
		  var BPALines = item.getParent().getReferencedByProducts();
		}		
		//msg=msg+"<!DOCTYPE html><html><body><p1><br>REVISION DATE:&nbsp;+revision+<br><br>ITEM/OIN:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+itemNum+<br>MFG PART:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+mfg+<br>ITEM STATUS:&nbsp;&nbsp;+pitemStatus+<br>DESCRIPTION:&nbsp;&nbsp;+itemDesc+<br><br>AFFECTED ORG:&nbsp;+orgID+&nbsp;-&nbsp;+orgCode+<br>nPREVIOUS STATUS:&nbsp;&nbsp;&nbsp;+previtemStatus+<br>NEW STATUS:&nbsp;&nbsp;&nbsp;+itemStatus+<br><br>INITIATOR:&nbsp;&nbsp;&nbsp;&nbsp;+initiator+<br>COMMENTS:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+comments</p1></body></html>"
		msg=msg+ "<br>REVISION DATE: "+revision+"<br><br>ITEM/OIN:     "+itemNum+"<br>MFG PART:     " + mfg +"<br>ITEM STATUS:  "+pitemStatus+"<br>DESCRIPTION:  " + itemDesc + 
						"<br><br>AFFECTED ORG: "+orgID+" - "+orgCode+"<br>PREVIOUS STATUS:   "+previtemStatus+"<br>NEW STATUS:   "+itemStatus+
						"<br><br>INITIATOR:    " +initiator+"<br>COMMENTS:     "+comments
		if(BPALines.size()>0){
		//msg = msg +"<!DOCTYPE html><html><body><h1><br><br>BPAs AFFECTED<br></h1></body></html>"		
		msg = msg +"<br><br>BPAs AFFECTED<br>"	
		BPALines.forEach(function (ref) {
			var BPALine = ref.getSource();			
			  if (ref.getSource().getObjectType().getID() == "Contract_Item" && BPALine.getParent().getID() !="CancelledProducts" && BPALine.getParent().getID() !="BPA_Onboarding") {
				var BPAID = BPALine.getParent().getID();
				var BPANum = BPALine.getParent().getValue("Oracle_Contract_Num").getSimpleValue();
				var BPAStatus = BPALine.getParent().getValue("BPA_Status").getSimpleValue();   
				var BPAExpDate =  BPALine.getParent().getValue("Expiration_Date").getSimpleValue();   					
				var BPAContractNum = BPALine.getParent().getValue("BPA_Legacy_Contract_No").getSimpleValue();
			     var refSupplier = BPALine.getParent().getClassificationProductLinks().get(supplierReference);		
				if (refSupplier && refSupplier.size() > 0) {
					var supplier = refSupplier.get(0).getClassification();
					var supplierName = supplier.getName();
				}				  		  
			 // msg = msg +"<!DOCTYPE html><html><body><p2><br>BPA STEP ID:&nbsp;+BPAID+&nbsp;|&nbsp;BPA#:&nbsp;+BPANum+&nbsp;|&nbsp;Status:&nbsp;+BPAStatus+&nbsp;|&nbsp;BPA Expiry Date:&nbsp;+BPAExpDate+&nbsp;|&nbsp;Legacy Contract Number:&nbsp;+BPAContractNum+&nbsp;|&nbsp;Supplier:&nbsp;+supplierName</p2></body><html>"
			 msg = msg +"<br>BPA STEP ID: "+BPAID+" | BPA#: "+BPANum+" | Status: "+BPAStatus+" | BPA Expiry Date: "+BPAExpDate+" | Legacy Contract Number: "+BPAContractNum+" | Supplier: "+supplierName;
			  }
			  });    
		}
		else
		//msg = msg +"<!DOCTYPE html><html><body><p2><br><br>NO BPAs AFFECTED</p2></body></html>"
         msg = msg +"<br><br>NO BPAs AFFECTED"
          item.getValue("Contractor_Email_Revision_Date").setSimpleValue(revision)
          item.getValue("Contract_Mgr").setSimpleValue(mgr);
          var IDArray_CI = new java.util.ArrayList();
		IDArray_CI = ['Contractor_Email_Revision_Date','Contract_Mgr'];		
		     lib.partialApproveFields(node, IDArray_CI);        
		return msg;
}

}