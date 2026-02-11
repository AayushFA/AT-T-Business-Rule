/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_Clone_CI_Bulk_Delete",
  "type" : "BusinessAction",
  "setupGroups" : [ "BA_BPAClone" ],
  "name" : "BPA Clone Bulk CI Delete",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Clone_Library",
    "libraryAlias" : "cloneLib"
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
exports.operation0 = function (node,manager,webui,cloneLib) {
var bpaChildren = node.getChildren().toArray();
var cancelFolder = manager.getProductHome().getProductByID("CancelledProducts");
if (bpaChildren.length > 0) {
    if (cloneLib.isPartialClone(bpaChildren)) {
        bpaChildren.forEach(function(item) {
            if (item.getValue("Partial_Clone_Flag").getSimpleValue() != "Yes") {
                item.setParent(cancelFolder);
                item.approve();
            }
        });      
    } 
    //webui.showAlert("ACKNOWLEDGMENT", "Clone Submitted: ", "Please note that Contract Items with Clone Flag is not equal to Yes have been deleted");
}
}