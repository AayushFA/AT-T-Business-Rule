/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_Bulk_Email_Send",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "BPA Bulk Email Send",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Contract_Item", "Item" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "lib"
  }, {
    "libraryId" : "AT&T_Audit_Library",
    "libraryAlias" : "libAudit"
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
exports.operation0 = function (node,step,queryHome,mailHome,supplierReference,lib,libAudit) {
log.info("Start of BPA Bulk Eail BR");
var querySpecification;
var query =null;
var itemList_5days = [];
var itemList_9days = [];
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
	var itr = assigneeSet.iterator();
	var numberOfDays = 0;
     var numberOfHours = 0;
	while(itr.hasNext())
	{
		itemList_5days = [];
		itemList_9days = [];
		var assigneeID = itr.next();		
		var itemListPerUser = assigneeMap.get(assigneeID);
		log.info(assigneeID + "  " +itemListPerUser);
		for(var i=0;i<itemListPerUser.size();i++)
		{
			var currentItem = itemListPerUser.get(i);
			var lastChangedDate = currentItem.getValue("Response_Received_DateTime").getSimpleValue();
			if(lastChangedDate)
			{
				lastChangedDate = lastChangedDate.substring(0, lastChangedDate.indexOf(" ")); 				
				numberOfDays = calculateNumberOfDays(lastChangedDate);			
			}				
			if(numberOfDays == 5)
			{
				itemList_5days.push(currentItem);
			}
			 if(numberOfDays == 9)
			{
				itemList_9days.push(currentItem);
			}
			
			if(numberOfDays > 9)
			{
				removeItemFromWorkflow(currentItem);
			}
		}
		log.info("itemList_5days = " + itemList_5days.length + "itemList_9days = " + itemList_9days.length);
		if(itemList_5days.length > 0)
		{    var itemList_Onboarding = [];
		     var itemList_Maintenance =[];		    
			log.info("Into 5 days Email")	
			for(var i=0;i<itemList_5days.length;i++) {
				var item = itemList_5days[i];	
				if(item.isInState("BPA_Action_Pending_WF", "Item_Onboarding"))	
				   itemList_Onboarding.push(item)
				if(item.isInState("BPA_Action_Pending_WF", "Item_Maintenace"))	
				   itemList_Maintenance.push(item)
			}		
			if(itemList_Onboarding.length >0 || itemList_Maintenance.length >0){
				 var message = "Dear User,\nThe following tasks have been in the STEP BPA Action Pending Workflow for 5 Days.  Each will be automatically removed from the workflow if no action is taken 10 Days after initiation.";
				if(itemList_Onboarding.length >0)
				  message+= "\n\nNew Item Onboarding\n"+getEmailMessage(itemList_Onboarding);
				if(itemList_Maintenance.length >0)
				  message+="\n\nItem Maintenance\n"+getEmailMessage(itemList_Maintenance);
				var subject = "STEP BPA Actions Pending for 5 Days";			
				identifyUserOrGroup(assigneeID, message,subject);	
			}		
		}
		if(itemList_9days.length > 0)
		{
			var itemList_Onboarding = [];
		     var itemList_Maintenance =[];
			log.info("Into 9 days Email")			
			for(var i=0;i<itemList_9days.length;i++) {
			     var item = itemList_9days[i];				      
				if(item.isInState("BPA_Action_Pending_WF", "Item_Onboarding"))	
				   itemList_Onboarding.push(item)
				if(item.isInState("BPA_Action_Pending_WF", "Item_Maintenace"))	
				   itemList_Maintenance.push(item)		
			}	
			if(itemList_Onboarding.length >0 || itemList_Maintenance.length >0){
				var message = "Dear User,\n The following tasks have been in the STEP BPA Action Pending Workflow for 9 Days.  Each will be automatically removed from the workflow if no action is taken by tomorrow, 10 Days after initiation.";
				if(itemList_Onboarding.length >0)
				  message+= "\n\nNew Item Onboarding\n\n"+getEmailMessage(itemList_Onboarding);
				if(itemList_Maintenance.length >0)
				 message+="\n\nItem Maintenance\n\n"+getEmailMessage(itemList_Maintenance);	
				log.info("Message for 9 days:" + message)
				var subject = "STEP BPA Actions Pending for 9 Days, Final Notice ";
				identifyUserOrGroup(assigneeID, message,subject);
			}
		}
	}	
}

function calculateNumberOfDays(responseDate)
{	
	var perDay = 1000*3600*24;
	var differenceDays = Math.abs(new Date (lib.getCurrentDate()).getTime() - new Date (responseDate).getTime());
	var numberOfDays = differenceDays/perDay;	
	return numberOfDays;
}

function removeItemFromWorkflow(currentItem)
{   	
	log.info("WFInstance Before removal: "+ currentItem.getID()+currentItem.getWorkflowInstanceByID("BPA_Action_Pending_WF"));
	var wf = currentItem.getWorkflowInstanceByID("BPA_Action_Pending_WF");     
     var OnboardingState = wf.getTaskByID("Item_Onboarding");
     var MaintenanceState = wf.getTaskByID("Item_Maintenace");
     if(OnboardingState)
            OnboardingState.triggerByID("New_toDismiss", "Removed Item from BPA Action Pending Workflow");
     if(MaintenanceState)
             MaintenanceState.triggerByID("Maint_toDismiss", "Removed Item from BPA Action Pending Workflow");  
     log.info("WFInstance After removal: "+ currentItem.getWorkflowInstanceByID("BPA_Action_Pending_WF"));
}

function getEmailMessage(itemList)
{
	var mailMessage = "";
	var itemStatus = ""
	var mfg = ""
	var itemDesc = ""
	for(var i=0;i<itemList.length;i++)
	{	
		var item = itemList[i];			         			
			var itemNum = item.getValue("Item_Num").getSimpleValue();
			var itemStatus = item.getValue("Item_Status").getSimpleValue();
			var mfg = item.getValue("Mfg_Part_No").getSimpleValue();
			var itemDesc = item.getValue("User_Defined_Item_Description").getSimpleValue();
			var orgCode = item.getValue("Organization_Code").getSimpleValue();
		     var orgID = item.getValue("Organization_Code").getID();
		     if(item.getObjectType().getID() =="Item")
		        var itemType = item.getValue("Material_Item_Type").getSimpleValue();
		      if(item.getObjectType().getID() =="Child_Org_Item")
		        var itemType = item.getParent().getValue("Material_Item_Type").getSimpleValue();
			var comments = item.getValue("BPA_Pending_Comments").getSimpleValue();
			 if(comments)
			     comments = comments.replace("<multisep/>", " | ");
			var initiator = item.getValue("Submitted_By").getSimpleValue();
			if(initiator) {
			initiator = step.getUserHome().getUserByID(initiator);	
				var ID = initiator.getID();
				if(ID.contains("@"))
				  ID = ID.substring(0,ID.indexOf("@"));		
			initiator = initiator.getName()+" ("+ID+")"
			}
			var date = item.getValue("Response_Received_DateTime").getSimpleValue();
			   date = date.substring(0,date.indexOf(" "));			    
			mailMessage = mailMessage+ "\n"+
			"Item number: " + itemNum +
			",  Item Status: " + itemStatus+
			",  Org Code: " + orgID+" - "+orgCode + 
			",  Item Type: " + itemType +
			",  Item description: " + itemDesc +
			",  Mfg Part No#: " + mfg +
			",  Initiation Date: "+date+
			",  Initiator Name: "+initiator+
			",  Comments: "+comments+"\n";	     			    		
	}	
	return mailMessage;
}

function identifyUserOrGroup(assigneeID, message,subject)
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
  mail.plainMessage(message);
  mail.send();
}

function getCurrentDateTime() {
	var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
	var dateTimeNow = new Date();
	var formattedDateTime = dateTimeFormatter.format(dateTimeNow);
	return formattedDateTime;
}

}