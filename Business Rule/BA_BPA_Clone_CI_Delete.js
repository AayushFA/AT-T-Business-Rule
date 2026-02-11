/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_Clone_CI_Delete",
  "type" : "BusinessAction",
  "setupGroups" : [ "BA_BPAClone" ],
  "name" : "BPA Clone CI Delete",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item", "BPA" ],
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
/** 
 *  @Author: AAYUSH MAHATO (COGNIZANT)
 */
var selection = webui.getSelection();
var size = selection.size();
var itemlist = ""
var errorMsg = ""
var childCount = childrenLength()

if (childCount > size && childCount != size) {
    selection.forEach(function(item) {
        var cancelFolder = manager.getProductHome().getProductByID("CancelledProducts");
        item.setParent(cancelFolder);
        itemlist = itemlist + item.getID() + " :"
    })
    errorMsg = "\n" + itemlist + "<html><body><b><font color = green>  Selected Item deleted and moved to Cancelled folder </font></b></body></html>";
    
    if (itemlist) {
    	   var Workflow = manager.getWorkflowHome().getWorkflowByID("BPA_Clone")
        var State = Workflow.getStateByID("Enrich_ClonedBPA");
    	   webui.navigate("BPA_Clone_WF_Node_Detail_Screen",node,State);
        webui.showAlert("INFO", "Result: ", errorMsg);
    }
} else {
    webui.showAlert("ERROR", "Delete cannot be performed, BPA Header must have atleast 1 Contract Item");
}

function childrenLength() {
    if (selection) {
        for (var i = 0; i < selection.size(); i++) {
            selectedObj = selection.get(0);
            if (selectedObj.getID()) {
                var parent = selectedObj.getParent();
                var child = parent.getChildren().toArray();
                var childlength = child.length;
                return childlength;
            }
        }
    }
}
}