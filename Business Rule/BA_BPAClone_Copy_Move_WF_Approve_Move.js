/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPAClone_Copy_Move_WF_Approve_Move",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_CT_BusinessAction" ],
  "name" : "Move Approve",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Clone_Library",
    "libraryAlias" : "clnLib"
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
    "contract" : "QueryHomeBindContract",
    "alias" : "queryHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,webui,queryHome,clnLib) {
/**
 Action : move
check condition:copy - if error show error or else execute
---check the oin entered by  user search for those oin in the child list 
--take that oin's ci duplicate it and reparent it and deactivate it.
--bring the target bpa in publish with new ci and
--navigate to publish state -tasklist
//author @aw240u@att.com(Aayush Kumar Mahato)
 */
//Aprrove and submit Routing happening using this Business rule
var bpaChildren = node.getChildren().toArray();
var userList = node.getValue("BPA_Partial_Clone_Item_Num_List").getSimpleValue();
var mfg_Part_No = manager.getAttributeHome().getAttributeByID("Mfg_Part_No");
var currOINs = [];
var splitList = [];
var trimSplitList = [];
var toCreateCI = [];
var workFlowInstance = node.getWorkflowInstanceByID("BPA_Clone");
if (workFlowInstance) {
  var stateID = "Move_Enrichment";
  var task = workFlowInstance.getTaskByID(stateID);
}
if (task != null) {
  var event = task.triggerByID("MoveSubmit", "approving");
  var message = event.getScriptMessage();
  if (message == null) {
    var bpaRef = getBPARef(node);
    if (bpaRef != null) {
      bpaRef.getValue("BPA_Clone_WF_UserAction").setLOVValueByID("Move");
      bpaRef.getValue("BPA_Cloned_From").setSimpleValue(node.getID());
      bpaChildren.forEach(function(item) {
        var partClnFlag = item.getValue("Partial_Clone_Flag").getSimpleValue();
        if (partClnFlag == "Yes") {
          var clonedCI = clnLib.cloneSrcContractItem(item, bpaRef, manager);
          // item.getValue("ContractItem_Status").setLOVValueByID("CLOSED");
          var allCile = item.getChildren().toArray();
          allCile.forEach(function(cile) {
            if (cile.getValue("LE_Status").getID() == "ACTIVE") {
              clnLib.cloneSrcContractLEChild(cile, clonedCI, manager)
            }
          })
          /* //Inactive all the CFAS Codes on Source CI
	      var nodeCiDcs = item.getDataContainerByTypeID("Region").getDataContainers().toArray(); //AK,SE,SW
		 nodeCiDcs.forEach(function(nodeDc) {
			 var curDcObj = nodeDc.getDataContainerObject();
			curDcObj.getValue("Regional_Status").setLOVValueByID("INACTIVE");
		});*/
        }
      });
      //TRIGGER THE TRANSITION TO PUBLISH STATE
      bpaRef.startWorkflowByID("BPA_Clone", "Start Workflow");
      var workFlowInstance = bpaRef.getWorkflowInstanceByID("BPA_Clone");
      var stateID = "Start";
      var task = workFlowInstance.getTaskByID(stateID);
      if (task != null) {
        task.triggerByID("TarBpaRef", "Direct Routing to Publish State");
      }
      var Workflow = manager.getWorkflowHome().getWorkflowByID("BPA_Clone")
      var State = Workflow.getStateByID("Publish_to_EBS");
      //navigating to the publish state
      webui.navigate("BPA_Clone_WF_EBSResponse_TaskList", null, State);
    }
  } else {
    webui.showAlert("ERROR", message);
  }
}
//function to grab the reference(bpa to bpa)- make specific for copy/transfer activity
function getBPARef(node) {
  var bpaRef = ""
  var bpaTobpa = manager.getReferenceTypeHome().getReferenceTypeByID("BPACopyTrans_ContractToContract");
  var bpaOwn = node.getReferences(bpaTobpa).toArray();
  if (bpaOwn.length > 0) {
    bpaRef = bpaOwn[0].getTarget();
  }
  return bpaRef
}
}