/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_WebUI_Initiate_Into_TransMain",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Transportation_Attribute_Action" ],
  "name" : "Initiate Transportation Maintenance Workflow Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Companion_SKU", "Item" ],
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
    "contract" : "WebUiContextBind",
    "alias" : "webui",
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
    "contract" : "ProductBindContract",
    "alias" : "cancelled",
    "parameterClass" : "com.stibo.core.domain.impl.FrontProductImpl",
    "value" : "CancelledProducts",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,webui,manager,cancelled) {
/**
 * @author - aw240u (Cognizant)
 * desc:
 */
if (node) {
    execute(node);
} else if (!node) {
    var selection = webui.getSelection();
    var errorMsg = "";
    selection.forEach(function(item) {
        execute(item);
        var nodeInWflw = item.isInWorkflow("WF_Transportation_Workflow");
        if (nodeInWflw) {
            errorMsg += "\n" + item.getID() + "<html><body><b><font color=red>  :Item already in Transportation Maintenance Workflow, hence cannot Initiate</font></b></body></html>";
        } else if (item.getID() == cancelled.getID()) {
            errorMsg += "\n" + item.getID() + "<html><body><b><font color=red>  :Item is under Cancelled folder, hence cannot Initiate</font></b></body></html>";
        } else {
            item.startWorkflowByID("WF_Transportation_Workflow", "Item Moved into Transportation Workflow");
            var Workflow = manager.getWorkflowHome().getWorkflowByID("WF_Transportation_Workflow");
            var State = Workflow.getStateByID("Enrichment");
            webui.navigate("Transportation_Maintenance_Enrichment_TaskList", null, State);
            errorMsg += "\n" + item.getID() + "<html><body><b><font color=green>  :Item Moved Successfully into the Transportation Maintenance Workflow </font></b></body></html>";
        }
    });
    if (errorMsg) {
        webui.showAlert("Warning", "Result Details: ", errorMsg);
    } else {
        return null;
    }
}

function execute(node) {
    var errorMsg = "";
    var nodeInWflw = node.isInWorkflow("WF_Transportation_Workflow");

    if (nodeInWflw) {
        errorMsg += "\n" + node.getID() + "<html><body><b><font color=red>  :Item already in Transportation Maintenance Workflow, hence cannot Initiate</font></b></body></html>";
    } else if (node.getParent().getID() == cancelled.getID()) {
        errorMsg += "\n" + node.getID() + "<html><body><b><font color=red>  :Item is under Cancelled folder, hence cannot Initiate</font></b></body></html>";
    } else {
        node.startWorkflowByID("WF_Transportation_Workflow", "Item Moved into Transportation Workflow");
        var Workflow = manager.getWorkflowHome().getWorkflowByID("WF_Transportation_Workflow");
        var State = Workflow.getStateByID("Enrichment");
        webui.navigate("Transportation_Maintaenance_Item_WF_Node_Detail", node, State);
        errorMsg = node.getID() + "<html><body><b><font color=green>  :Item Moved Successfully into the Transportation Maintenance Workflow </font></b></body></html>";
    }
    if (errorMsg) {
        webui.showAlert("Warning", "Result Details: ", errorMsg);
    } else {
        return null;
    }
}
}