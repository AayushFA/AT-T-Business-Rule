/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_Create_LocalExplosion_fwd",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "Create Local Explosion(Save & Proceed)",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "BPALib"
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
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "cileItemRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "LocalExplosion_Item_Reference",
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,webui,cileItemRef,step,BPALib) {
/**
 * @author - Aayush and John [CTS]
 * Create LE(Save & Proceed) Button
 */

var errorMsg = "";
var tempParent = node.getValue("Temp_Parent_Item").getSimpleValue();
var product = manager.getProductHome().getProductByID(tempParent);
var Workflow = manager.getWorkflowHome().getWorkflowByID("Create_BPA")
var lob = product.getValue("Legacy_Source").getID();

BPALib.setLEDefaultValues(node);
errorMsg = BPALib.CILEValidations(node, lob, manager);

if (errorMsg == "")
	errorMsg = BPALib.leKeyGeneration(node, manager);
if (errorMsg && errorMsg != "") {
	webui.showAlert("ERROR", "Action Needed: ", errorMsg);
} else {
	node.setParent(product);	
	var leToItem = manager.getReferenceTypeHome().getReferenceTypeByID("LocalExplosion_Item_Reference");
	var item = node.getReferences(leToItem).toArray();
	if (item.length > 0) {
		var itemNum = item[0].getTarget().getValue("Item_Num").getSimpleValue();
		if (itemNum != null) {
			node.getValue("Item_No_Referenced_to_CILE").setValue(itemNum);
		}
	} else
		node.getValue("Item_No_Referenced_to_CILE").setValue("");

	//Info message on CILE screen	
	var statement = node.getID() + "<html><body><b><font color = green> : Local Explosion Created</font></b></body></html>";
	webui.showAlert("ACKNOWLEDGMENT", "Local Explosion created for Contract Item:", statement);

	//UI navigation to CI Details page
	if (product.isInWorkflow("Create_BPA")) {
		var State = Workflow.getStateByID("Enrich_BPA_CI_LE");
		webui.navigate("BPA_WF_Node_Detail_Screen(EBS_Processed_Yes)", product, State); // STIBO- 2619 Aug 24th Release		
	} else {
		webui.navigate("BPA_CI_Create_Screen", product);
	}
}

}