/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_CI_APPROVE",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "Approve CI Creation",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "BPALib"
  }, {
    "libraryId" : "AT&T_BPA_Validation_Library",
    "libraryAlias" : "validationLib"
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
    "alias" : "query",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "dataIssue",
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
    "contract" : "ReferenceTypeBindContract",
    "alias" : "contractItemReference",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ContractItem_Item",
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
exports.operation0 = function (node,manager,webui,query,dataIssue,ugWrlnEng,contractItemReference,ugWrlnSrc,BPALib,validationLib) {
//author : Aayush(Cognizant)
var tempPar = node.getValue("Temp_Parent_Item").getSimpleValue();
var OnboardFolder = manager.getProductHome().getProductByID("BPA_Onboarding");
if (tempPar != null) {
  var bpaObject = manager.getProductHome().getProductByID(tempPar);
  if (validForWkflow(node) == true) {
    var bpaObject = manager.getProductHome().getProductByID(tempPar);
    setName(node, manager)
    node.setParent(bpaObject);
    if (node.isInWorkflow("Create_BPA")) {
      trigger(node);
    } else {
      node.startWorkflowByID("Create_BPA", "Start Workflow");
      trigger(node);
    }
  } else {
    var errorMsg = validForWkflow(node);
    webui.showAlert("ERROR", "Cannot proceed: ", errorMsg);
  }
} else {
  var BPAno = node.getValue("Oracle_Contract_Num").getSimpleValue();
  if (BPAno == null) {
    webui.showAlert("ERROR", "BPA Number is Blank", "Please Provide the BPA Number to proceed");
  } else if (BPAno != null) {
    var BPAnoPen = node.getValue("Oracle_Contract_Num").getSimpleValue().trim();
    var magBPAno = manager.getAttributeHome().getAttributeByID("Oracle_Contract_Num");
    var bpaObject = manager.getNodeHome().getObjectByKey("BPANumber.Key", BPAno);
    if (bpaObject == null) {
      webui.showAlert("ERROR", "BPA Number is Invalid", "Entered BPA number does not exist in the system,Please Provide valid BPA Number to proceed");
    } else {
      if (validForWkflow(node) == true) {
        setName(node, manager)
        node.setParent(bpaObject);
        // node.startWorkflowByID("Create_BPA", "Start Workflow");
        if (node.isInWorkflow("Create_BPA")) {
          trigger(node);
        } else {
          node.startWorkflowByID("Create_BPA", "Start Workflow");
          trigger(node);
        }
      } else {
        var errorMsg = validForWkflow(node);
        webui.showAlert("ERROR", "Cannot proceed: ", errorMsg);
      }
    }
  }
}

function returnTasklist() {
  var Workflow = manager.getWorkflowHome().getWorkflowByID("BPA_Action_Pending_WF")
  var State = Workflow.getStateByID("Item_Onboarding")
  webui.navigate("BPA_Action_Pending_WF_Onboarding_Tasklist", null, State);
}

function validForWkflow(node) {
  if (node.getObjectType().getID() == "Contract_Item") {
    var curUser = manager.getCurrentUser();
    var wrlnEngUser = ugWrlnEng.isMember(curUser) && !ugWrlnSrc.isMember(curUser); //STIBO-2529
    var error = "";
    var tempPar = node.getValue("Temp_Parent_Item").getSimpleValue();
    // STIBO-2335 Prod Support July release
    var mandCheckAttrENT = ["Max_Order_Qty", "Min_Order_Qty", "Non_Process_Flag", "STD_PACKAGING"];
    // STIBO-2335 Prod Support July release
    if (tempPar != null) {
      var bpaObject = manager.getProductHome().getProductByID(tempPar);
    } else {
      var BPAno = node.getValue("Oracle_Contract_Num").getSimpleValue();
      var bpaObject = manager.getNodeHome().getObjectByKey("BPANumber.Key", BPAno);
    }
    if (bpaObject.getID() == "CancelledProducts" || bpaObject.getParent().getID() == "CancelledProducts") {
      error = error + "\n This Item has been cancelled before and can not be initiated in Workflow."
    }
    if (bpaObject.isInWorkflow("BPA_Clone")) {
      error = error + "\n This Item's Parent is present in BPA Clone Workflow,hence can not be initiated in Workflow."
    }
    // STIBO-2335 Prod Support July release
    if (bpaObject.getParent().getID() == "BPA_WRLN_ENT") {
      mandCheckAttrENT.forEach(function(attrID) {
        if (!node.getValue(attrID).getSimpleValue()) {
          dataIssue.addWarning("This field is mandatory for Wireline/Entertainment",
            node, manager.getAttributeHome().getAttributeByID(attrID));
          error = error + "\n Please fill the Mandatory attribute " + manager.getAttributeHome().getAttributeByID(attrID).getName();
        }
      });
    }
    if (bpaObject.getParent().getID() == "BPA_RTL") {
      BPALib.clearRTLAttributes(node);
    }
    // STIBO-2335 Prod Support July release
    var temperr = "";
    temperr = validationLib.validateReferencedItemType(node, contractItemReference, bpaObject, wrlnEngUser); //STIBO-1432 Prod support july release
    if (temperr) {
      error = error + "\n" + temperr;
    }
    if (error) {
      return error
    } else {
      return true;
    }
  }
}

function trigger(node) {
  var workFlowInstance = node.getWorkflowInstanceByID("Create_BPA");
  var stateID = "Enrich_BPA_CI_LE";
  var task = workFlowInstance.getTaskByID(stateID);
  if (task != null) {
    var event = task.triggerByID("Review", "Routing to approval State");
    var message = event.getScriptMessage();
    if (message == null) {
      var tempPar = node.getValue("Temp_Parent_Item").getSimpleValue();
      if (tempPar != null) {
        var Workflow = manager.getWorkflowHome().getWorkflowByID("Create_BPA")
        var State = Workflow.getStateByID("Enrich_BPA_CI_LE");
        webui.navigate("BPA_WF_Node_Detail_Screen", bpaObject, State);
      } else {
        returnTasklist()
      }
    } else {
      deleteKey();
      node.setParent(OnboardFolder);
      var currentWFinstance = node.getWorkflowInstanceByID("Create_BPA");
      if (currentWFinstance) {
        currentWFinstance.delete("removed");
      }
      webui.showAlert("ERROR", "Error Message: ", message);
    }
  }
}

function deleteKey() {
  var ciKey = node.getValue("ContractItem_key").getSimpleValue();
  if (ciKey) {
    manager.getKeyHome().updateUniqueKeyValues2({
      "ContractItem_key": String("")
    }, node);
  }
}

function setName(node, manager) {
  var itemRef = manager.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
  var srcRefTargetItemList = node.queryReferences(itemRef).asList(1);
  if (srcRefTargetItemList && srcRefTargetItemList.size() > 0) {
    var srcRefTargetItem = srcRefTargetItemList.get(0).getTarget();
    var srcItem_Num = srcRefTargetItem.getValue("Item_Num").getSimpleValue();
    node.setName(srcItem_Num);
  }
}
}