/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ABC_Dismiss_Button",
  "type" : "BusinessAction",
  "setupGroups" : [ "ABC_BusinessAction" ],
  "name" : "ABC Dismiss Button",
  "description" : "Usage: used for the dismiss button on the ABC_Multi_Revision_Screen_CI screen",
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item", "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_ABC_Common",
    "libraryAlias" : "abcLibCommon"
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
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "ctx",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,ctx,abcLibCommon) {
/**
 * @author - Aman [CTS]
 * Roll Back and Partial Approve
 */

var objType = node.getObjectType().getName();
var partialApprList = new java.util.ArrayList();

if (objType == "Contract") {
    //BPA Rollback and Partial Approve
    if (abcLibCommon.isProcessedInOracle(node)) {
        abcLibCommon.rollBackandParitialApprove(node, stepManager, "Product");
        //CI Rollback and Partial Approve
        var childCI = node.getChildren().toArray();
        childCI.forEach(function(ci) {
           // if (abcLibCommon.isProcessedInOracle(ci)) {
                abcLibCommon.rollBackandParitialApprove(ci, stepManager, "Product");
                //PB Rollback and Partial Approve
                var childPB = ci.getChildren().toArray();
                childPB.forEach(function(pb) {
                   // if (abcLibCommon.isProcessedInOracle(pb)) {
                        abcLibCommon.rollBackandParitialApprove(pb, stepManager, "Product");
                    //}
                });

            //}
        });
    }
}
ctx.navigate("ABC_Home_Page", null)
}
/*===== business rule plugin definition =====
{
  "pluginId" : "RemoveObjectFromWorkflowAction",
  "parameters" : [ {
    "id" : "Workflow",
    "type" : "com.stibo.core.domain.state.Workflow",
    "value" : null
  }, {
    "id" : "Message",
    "type" : "java.lang.String",
    "value" : "Removed From Workflow."
  } ],
  "pluginType" : "Operation"
}
*/
