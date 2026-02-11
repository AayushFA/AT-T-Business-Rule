/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_Initiate_Clone_WF",
  "type" : "BusinessAction",
  "setupGroups" : [ "BA_BPAClone" ],
  "name" : "Initiate BPA Clone workflow",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "lib"
  }, {
    "libraryId" : "AT&T_BPA_Clone_Library",
    "libraryAlias" : "clonelib"
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,webui,lib,clonelib) {
/**
  @Author AAYUSH MAHATO(COGNIZANT)
 */
var Expiration_Date = node.getValue("Expiration_Date").getSimpleValue();
var bpaStatus = node.getValue("BPA_Status").getSimpleValue();
var bpaNumber = node.getValue("Oracle_Contract_Num").getSimpleValue();
var nodeInWF = node.isInWorkflow("Create_BPA");
var childCount = node.getChildren().toArray().length
var itemlist = "";
var error = "";
if (Expiration_Date) {
  var expiry = lib.checkDateIfLessthanToday(Expiration_Date);
  if (expiry) {
    error = error + "\n BPA is expired & can not be cloned. \n"
  }
}
if (bpaStatus != "Open") {
  error = error + "\n BPA Item Status is not Open, BPA Header can't be initiated into BPA Clone Copy Move workflow \n"
}
if (bpaNumber == null || bpaNumber == "") {
  error = error + "\n Blanket Purchase Agreement Number is null. The souce must have Blanket Purchase Agreement Number. \n"
}
if (nodeInWF == true) {
  error = error + "\n Header is in BPA Workflow. Please finish the BPA workflow to initiate BPA Clone Copy Move workflow. \n"
}
if (childCount == 0) {
  error = error + "\n Atleast 1 Contract Item children must exist, BPA Header can't be initiated into BPA Clone Copy Move workflow \n"
}
if (areChildrenInBPAWorkflow(node)) {
  error = error + "\n The following Children Contract Items: " + getContractItemIDs(node) + " are in BPA Workflow. Please finish BPA workflow for Contract Items.  \n"
}
if (error) {
  webui.showAlert("Error", "BPA Clone failed to initiate due to following reasons:", error);
} else {
  node.getValue("BPA_Clone_WF_UserAction").setLOVValueByID("Clone");
  var wfBPAClone = manager.getWorkflowHome().getWorkflowByID("BPA_Clone");
  //var clonedBPA = createClone(node, manager, log);
  var clonedBPA = clonelib.createClone(node, manager, log);
  clonedBPA.getValue("BPA_Clone_WF_UserAction").setLOVValueByID("Clone");
  wfBPAClone.start(node, null);
  wfBPAClone.start(clonedBPA, null);
  webui.showAlert("ACKNOWLEDGMENT", "Result: ", "BPA Clone created and Initiated into Clone Clone Move Workflow");
}

function areChildrenInBPAWorkflow(node) {
  var count = 0;
  var childList = node.getChildren().toArray();
  childList.forEach(function(item) {
    if (item.isInWorkflow("Create_BPA")) {
      count = count + 1
    }
  })
  if (count > 0) {
    return true
  } else {
    return false
  }
}

function getContractItemIDs(node) {
  var itemlist = "";
  var childList = node.getChildren().toArray();
  childList.forEach(function(item) {
    if (item.isInWorkflow("Create_BPA")) {
      var itemNumber = item.getValue("Oracle_Item_Num").getSimpleValue();
      itemlist = itemlist + item.getID() + "(" + itemNumber + "), "; // (STEP ID : Oracle Item Num | STEP ID : Oracle Item Num | STEP ID : Oracle Item Num)
    }
  })
  return itemlist;
}
}