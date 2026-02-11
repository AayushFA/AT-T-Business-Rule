/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_CI_CANCEL",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "Cancel CI Creation",
  "description" : " ",
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
var tempPar = node.getValue("Temp_Parent_Item").getSimpleValue();
var objPar= manager.getProductHome().getProductByID(tempPar);
var Workflow = manager.getWorkflowHome().getWorkflowByID("Create_BPA");
var State = Workflow.getStateByID("Enrich_BPA_CI_LE");
var cancelFolder = manager.getProductHome().getProductByID("CancelledProducts");
if (tempPar != null) {
    referDelete(node, manager);
    resetDataContainer();
    deleteKey();
    node.setParent(cancelFolder);
    node.getValue("Temp_Parent_Item").setValue("");
    webui.showAlert("ACKNOWLEDGMENT", "Deleted: ", "Contract Item Deleted");
    //webui.navigate("BPA_Home_Page", null);
    if(objPar.getValue("BPA_Processed_In_EBS").getSimpleValue()!="Yes"){
    	  webui.navigate("BPA_WF_Node_Detail_Screen",objPar,State);
    }else{
    	  webui.navigate("BPA_WF_Node_Detail_Screen(EBS_Processed_Yes)",objPar,State);
    }
    
} else {
    referDelete(node, manager);
    resetDataContainer();
    deleteKey();
    node.setParent(cancelFolder);
    webui.showAlert("ACKNOWLEDGMENT", "Deleted: ", "Contract Item Deleted");
    //webui.navigate("BPA_Home_Page",null);
    returnTasklist();
}

function returnTasklist() {
    var Workflow = manager.getWorkflowHome().getWorkflowByID("BPA_Action_Pending_WF")
    var State = Workflow.getStateByID("Item_Onboarding")
    webui.navigate("BPA_Action_Pending_WF_Onboarding_Tasklist", null, State);
}

function referDelete(node, manager) {
    var ReferType = manager.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
    var PIType = node.getReferences(ReferType).toArray();
    if (PIType.length > 0) {
        PIType.forEach(function(ref) {
            ref.delete();
        });
    }
}




function resetDataContainer() {
    node.getDataContainerByTypeID("Region").deleteLocal();
    node.getDataContainerByTypeID("DC_MiscCharges").deleteLocal();
}

function deleteKey() {
    var ciKey = node.getValue("ContractItem_key").getSimpleValue();
    if (ciKey) {
        manager.getKeyHome().updateUniqueKeyValues2({
            "ContractItem_key": String("")
        }, node);
    }
}
}