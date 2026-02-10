/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ABC_InitiateInABCWorkflw",
  "type" : "BusinessAction",
  "setupGroups" : [ "ABC_BusinessAction" ],
  "name" : "Initiate In ABC Workflw",
  "description" : "Usage: Used to initate abc workflow on several abc portal screens",
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_ABC_Common",
    "libraryAlias" : "abcLib"
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
    "contract" : "ProductBindContract",
    "alias" : "cancelled",
    "parameterClass" : "com.stibo.core.domain.impl.FrontProductImpl",
    "value" : "ABC_Cancelled",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "dg_UserGrp",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_DG",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "contMang_UserGrp",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_ABC",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "superUser",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "Super user",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "stiboUser",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "Stibo",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,webui,cancelled,dg_UserGrp,contMang_UserGrp,superUser,stiboUser,abcLib) {
/**
 * @author -aw240u(Cognizant)
 *desc: 
 */

var curUser = manager.getCurrentUser();
if(checkUser(curUser)){
//ATT_ABC_Root
if (node) {
  execute(node);
} else if (!node) {
  var selection = webui.getSelection();
  var errorMsg = "";
  selection.forEach(function(contract) {
  	 execute(contract)
  	var parent = contract.getParent();
    var graParID = parent.getParent().getID();
    //var contStatus = contract.getValue("SI_Header_Status").getSimpleValue();
    var supplExpDate = contract.getValue("SI_BPA_End_Date").getSimpleValue();
    var nodeInWflw = contract.isInWorkflow("ABC_Workflow");
    if (graParID != "ATT_ABC_Root") {
      errorMsg = errorMsg + "\n" + contract.getID() + "<html><body><b><font color = red>  :Contract is not eligible for ABC Workflow </font></b></body></html>";
    }
    else if (graParID == "ATT_ABC_Root" && nodeInWflw) {
      errorMsg = errorMsg + "\n" + contract.getID() + "<html><body><b><font color = red>  :Contract already in ABC Workflow,hence cannot Initiate</font></b></body></html>";
    } //else if (graParID == "ATT_ABC_Root" && contStatus == "Closed") {
      //errorMsg = errorMsg + "\n" + contract.getID() + "<html><body><b><font color = red>  :Contract's Status is closed,hence cannot Initiate</font></b></body></html>";
    //} 
    else if (graParID == "ATT_ABC_Root" && abcLib.checkDateIfLessthanToday(supplExpDate)) {
      errorMsg = errorMsg + "\n" + contract.getID() + "<html><body><b><font color = red>  :Contract is Ended,hence cannot Initiate</font></b></body></html>";
    } 
    
     else if (contract.getParent().getID() == cancelled.getID()) {
      errorMsg = errorMsg + "\n" + contract.getID() + "<html><body><b><font color = red>  :Contract is under Cancelled folder,hence cannot Initiate</font></b></body></html>";
    }
  
    
    else {
      contract.startWorkflowByID("ABC_Workflow", "Contract Moved into ABC Workflow");
      var Workflow = manager.getWorkflowHome().getWorkflowByID("ABC_Workflow")
      var State = Workflow.getStateByID("ALM_Enrichment_State");
      webui.navigate("ALM_Enrichment_State_Task_List",null,State);
      errorMsg = errorMsg + "\n" + contract.getID() + "<html><body><b><font color = green>  :Contract Moved Successfully into the ABC Workflow </font></b></body></html>";
    };
  });
  if (errorMsg) {
    webui.showAlert("Warning", "Result Details: ", errorMsg);
  } else {
    return null;
  }
}
}else{
	webui.showAlert("Error", "Privilege Issue: ", "User is not privileged to start the ABC Workflow.");
}

function execute(node) {
  var errorMsg = "";
  var parent = node.getParent();
  var graParID = parent.getParent().getID();
  //var contStatus = node.getValue("SI_Header_Status").getSimpleValue();
  var supplExpDate = node.getValue("SI_BPA_End_Date").getSimpleValue();
  var nodeInWflw = node.isInWorkflow("ABC_Workflow");
  if (graParID != "ATT_ABC_Root") {
    errorMsg = node.getID() + "<html><body><b><font color = red>  :Contract is not eligible for ABC Workflow </font></b></body></html>";
  }
  
  else if (graParID == "ATT_ABC_Root" && nodeInWflw) {
    errorMsg = errorMsg + "\n" + node.getID() + "<html><body><b><font color = red>  :Contract already in ABC Workflow,hence cannot Initiate</font></b></body></html>";
  } else if (graParID == "ATT_ABC_Root" && node.isInWorkflow("Create_BPA")) {
    errorMsg = node.getID() + "<html><body><b><font color = red>  :Contract is in BPA Workflow,hence cannot Initiate</font></b></body></html>";
  } /*else if (graParID == "ATT_ABC_Root" && contStatus == "Closed") {
    errorMsg = node.getID() + "<html><body><b><font color = red>  :Contract's Status is closed,hence cannot Initiate</font></b></body></html>";
  }*/ else if (graParID == "ATT_ABC_Root" && abcLib.checkDateIfLessthanToday(supplExpDate)) {
    errorMsg = node.getID() + "<html><body><b><font color = red>  :Contract is Ended,hence cannot Initiate</font></b></body></html>";
  } 
  
  else if (node.getParent().getID() == cancelled.getID()) {
      errorMsg = errorMsg + "\n" + node.getID() + "<html><body><b><font color = red>  :Contract is under Cancelled folder,hence cannot Initiate</font></b></body></html>";
    }
  else {
    node.startWorkflowByID("ABC_Workflow", "Contract Moved into ABC Workflow");
    var Workflow = manager.getWorkflowHome().getWorkflowByID("ABC_Workflow")
    var State = Workflow.getStateByID("ALM_Enrichment_State");
    webui.navigate("ALM_Enrichment_Failed_State_Node_Detail_Page",node,State);
    errorMsg = node.getID() + "<html><body><b><font color = green>  :Contract Moved Successfully into the ABC Workflow </font></b></body></html>";
  };
  if (errorMsg) {
    webui.showAlert("Warning", "Result Details: ", errorMsg);
  } else {
    return null;
  }
}





function checkUser(curUser) {
    if (dg_UserGrp.isMember(curUser)  || contMang_UserGrp.isMember(curUser) || superUser.isMember(curUser) || stiboUser.isMember(curUser)) {
        return true;
    } else {
        return false
    }
}


}