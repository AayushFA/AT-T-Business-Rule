/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_Initiate_CI_Maintenance",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "BPA Initiate CI Maintenance",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Contract_Item", "Item", "Companion_SKU" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ugWrlnEng",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_WRLN_Engineering",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ugWrlnSrc",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_WRLN_Sourcing",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,webui,manager,ugWrlnEng,ugWrlnSrc) {
var bpa = null;
var bpaObjectID = null;
var bpaStatusID = null;
var ciExpDate = null;
var ciExpired = false;
var ciNotExpired = null;
var ciProcessed = null;



var selection=webui.getSelection();

var curUser = manager.getCurrentUser();
var wrlnEngUser = ugWrlnEng.isMember(curUser) && !ugWrlnSrc.isMember(curUser);//STIBO-2529
    	
selection.forEach(function(item) {
	var refCI;
	if(item.getObjectType().getID() == "Child_Org_Item")	{
		refCI = item.getParent().getReferencedByProducts();
		ntwBomType = item.getParent().getValue("NTW_BOM_Type").getID();
	}
	
	if(item.getObjectType().getID() == "Item")	{
		refCI = item.getReferencedByProducts();
		ntwBomType = item.getValue("NTW_BOM_Type").getID();
	}
		
	var itr = refCI.iterator();
	if(itr.hasNext() == false)
		webui.showAlert("INFO","The Item has no referenced Contract Item");
	//STIBO-1432 PRod Support July Release
	if(wrlnEngUser && ntwBomType != "LOCAL EXPLOSION")	{
		webui.showAlert("ERROR","The item you are attempting to add is not defined as a Local Explosion. Please review item set and/or work with the sourcing manger in order to add to BPA (Blanket Purchase Agreement).");
	}
	//STIBO-1432 PRod Support July Release
	while(itr.hasNext())
	{
		var obj = itr.next();
		var citem = obj.getSource();
		var ciStatus = citem.getValue('ContractItem_Status').getID();
		var ciParent = citem.getParent().getID();
		var ciProcessed = citem.getValue('BPA_Processed_In_EBS').getID();
		//log.info("citem = " + citem + " " + citem.getObjectType().getID());
		if((citem.getObjectType().getID() == "Contract_Item") && (ciParent != 'CancelledProducts') && (ciParent != 'BPA_Onboarding'))
		{
			//log.info("1..............");
			bpa = citem.getParent();
			bpaObjectID = bpa.getObjectType().getID();
			bpaStatus = bpa.getValue('BPA_Status').getID();
			ciExpDate = bpa.getValue('Expiration_Date').getSimpleValue();
			if(ciExpDate != null) {
				ciNotExpired = checkDateIfLessthanToday(ciExpDate);
			}
			if(bpaObjectID == 'BPA' && (bpaStatus == 'OPEN') && ((ciExpDate == null) || (ciNotExpired == true))) {
				if(!citem.isInWorkflow("Create_BPA"))
				{
					//log.info("2..............");
					if(ciStatus == 'OPEN') {
						citem.startWorkflowByID("Create_BPA", "Start Workflow");
						webui.showAlert("INFO","Contract Item associated with selected Product initiated into Create BPA Workflow");
					}
					else if((ciStatus == 'CLOSED') && (ciProcessed == 'E')) {
						citem.startWorkflowByID("Create_BPA", "Start Workflow");
						webui.showAlert("INFO","Contract Item associated with selected Product initiated into Create BPA Workflow");
					}
				}
			}		
		}
	}
});


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
}