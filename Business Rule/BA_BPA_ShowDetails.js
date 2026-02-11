/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_ShowDetails",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "BPA ShowDetails",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
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
    "contract" : "WebUiContextBind",
    "alias" : "ctx",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "issue",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,ctx,issue,lib) {
var selection = ctx.getSelection();
var Workflow = step.getWorkflowHome().getWorkflowByID("Create_BPA")
var State = Workflow.getStateByID("Enrich_BPA_CI_LE");
var error = false;

selection.forEach(function(item) {

    if (item.isInState("Create_BPA", State.getID())) {
        log.info("Show details" + item.getID());
        if (item.getObjectType().getID() == 'Contract_Item') {
         var ebsStatus = item.getValue("BPA_Processed_In_EBS").getSimpleValue();
                if (ebsStatus != "Yes") {
                    ctx.navigate("BPA_WF_Node_Detail_Screen", item, State);
                } else {
                    ctx.navigate("BPA_WF_Node_Detail_Screen(EBS_Processed_Yes)", item, State);
                }
            
        }
 } else if (!item.isInState("Create_BPA", State.getID())) {

        issue.addWarning("The selected Item  is not in Enrichment state");
        error = true;
    }
    else{
    	//do nothing
    }
});

if (error) {
    return issue;
}

/*
//aayush-aw240u(cognizant)
function DCReadOnly(node, manager) {
var objctType = node.getObjectType().getID();
var Expiration_Date = node.getParent().getValue("Expiration_Date").getSimpleValue();
if (Expiration_Date != null) {
    var expiry = lib.checkDateIfLessthanToday(Expiration_Date); 

} else {
    var expiry = false
}
var bpaStatus = node.getParent().getValue("BPA_Status").getSimpleValue(); 
log.info("bpaStatus: " + bpaStatus);
var ciStatus = node.getValue("ContractItem_Status").getSimpleValue(); //=="Closed"
log.info("ciStatus: " + ciStatus);
var lob = node.getParent().getValue("Legacy_Source").getID();
log.info("lob: " + lob);
var ciToItem = manager.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
var item = node.getReferences(ciToItem).toArray();
log.info("item.length: " + item.length);

if (item.length > 0) {
	var itemTarget = item[0].getTarget();
	log.info("2 in");
    
    //if (lob == "WRLN_NON" || lob == "WRLN" || lob == "QTE" || lob == "DTV_NTW") {
    if(lob != "Retail Consumer"){
	    	log.info("2");
	        //WRLN LOB
	        if(itemTarget.getValue("Line_Of_Business").getID() == "WRLN"){
	        var itemStatus = itemTarget.getValue("Item_Status_WRLN").getSimpleValue();
	        log.info("itemStatusWRLN: " + itemStatus);
	        var materialItemType = itemTarget.getValue("Material_Item_Type_Web").getSimpleValue();
	        log.info("materialItemType:"+materialItemType)
	        if ((itemStatus != "Active S" && itemStatus != "Active NS") || expiry == true || bpaStatus == "Closed" || ciStatus == "Closed") {
	               //log.info("Failed")
	                return true;
	            } 
				 else
	        	  {
	        	  	return false;
	        	  }
	            }
	        
    //ENT LOB
   // if (lob != "WRLN_NON" && lob != "WRLN" && lob != "QTE" && lob != "DTV_NTW" && lob != "RTL") {
     else if(itemTarget.getValue("Line_Of_Business").getID() == "ENT"){
    	log.info("inn");
        var itemTarget = item[0].getTarget();
        var itemStatus = itemTarget.getValue("Item_Status_ENT").getSimpleValue();
        log.info("itemStatusENT: " + itemStatus);
        if (itemStatus == "Obsolete" || itemStatus == "Inactive" || expiry == true || bpaStatus == "Closed" || ciStatus == "Closed") {
            return true;
        } else {
            return false;
        }
     }
    else {
        return false;
    }
     }
     else{
     	return true;
     }
} else {
    return false;
}
}
*/
}