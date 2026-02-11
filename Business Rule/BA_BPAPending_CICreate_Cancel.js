/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPAPending_CICreate_Cancel",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_BA_BPA_Pending" ],
  "name" : "BPA pending CI creation(Cancel)",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
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
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,webui) {
//author : Aayush(Cognizant)

referDelete(node,manager);
	var cancelFolder = manager.getProductHome().getProductByID("CancelledProducts");
	node.setParent(cancelFolder);
	webui.showAlert("ACKNOWLEDGMENT", "Deleted: ","Contract Item Deleted");
	//webui.navigate("BPA_Home_Page",null);
	returnTasklist()
	
	function referDelete(node,manager){
	var ReferType = manager.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
    var PIType = node.getReferences(ReferType).toArray();
   if (PIType.length > 0) { 
	PIType.forEach (function (ref){
		ref.delete();
		
	});
}
	}


	function returnTasklist(){
	var Workflow=manager.getWorkflowHome().getWorkflowByID("BPA_Action_Pending_WF")
    var State =Workflow.getStateByID("Item_Onboarding")
    webui.navigate("BPA_Action_Pending_WF_Onboarding_Tasklist", null,State );
	}
}