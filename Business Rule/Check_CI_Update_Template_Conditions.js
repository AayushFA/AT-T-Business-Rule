/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "Check_CI_Update_Template_Conditions",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "Check CI-Update Template Conditions",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item", "BPA" ],
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
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
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
    "contract" : "DataIssuesContextBind",
    "alias" : "issue",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "QueryHomeBindContract",
    "alias" : "query",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "item",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "Item",
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
exports.operation0 = function (node,step,issue,query,item,ugWrlnEng,ugWrlnSrc,lib) {
log.info("Check CI Update Validations:" + node.getID())
var objectType = node.getObjectType().getID();
var itemNum = node.getValue("Oracle_Item_Num").getSimpleValue();
var itemObj = step.getNodeHome().getObjectByKey("Item.Key", itemNum);
var curUser = step.getCurrentUser();
var wrlnEngUser = ugWrlnEng.isMember(curUser) && !ugWrlnSrc.isMember(curUser); //STIBO-2529

// contract item attributes.

var errmsgFinal = "";
var parent = node.getParent();
var ContractItem_Status = node.getValue("ContractItem_Status").getID();
errmsgFinal = errmsgFinal + CIValidations();

if (wrlnEngUser && itemObj.getValue("NTW_BOM_Type").getID() != "LOCAL EXPLOSION"){
	errmsgFinal = errmsgFinal + "The item linked to this contract item" + itemNum +" is not defined as a Local Explosion. Please review item set and/or work with the sourcing manger in order to add to BPA (Blanket Purchase Agreement).";
}
if(errmsgFinal)
  return errmsgFinal;
else
  return true;

function CIValidations() {
	 var errmsg = "";
	if(ContractItem_Status != "CLOSED"){
	    //Checking the WF status	   
	    var wf = node.getWorkflowInstanceByID("Create_BPA");
	    if (wf)
	        var BPAWFPublishQueueState = wf.getTaskByID("Publish_to_EBSQueue")
	    if (BPAWFPublishQueueState) {
	        errmsg = errmsg + "\nContract Item is in Publish Q.";
	    }
		var greatParent = node.getParent().getParent();
		// STIBO-2335 Prod Support July release   
		if (greatParent.getID() == "BPA_RTL") {
			lib.clearRTLAttributes(node);			
		}
		// STIBO-2335 Prod Support July release			
	}
	 return errmsg;
}
}