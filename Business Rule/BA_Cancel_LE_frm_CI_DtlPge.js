/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Cancel_LE_frm_CI_DtlPge",
  "type" : "BusinessAction",
  "setupGroups" : [ "BA_Web" ],
  "name" : "Cancel LE from CI Detail Page",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child" ],
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
//author: aw240u(Aayush Kumar Mahato)(cognizant)

var selection = webui.getSelection();
var errorMsg = ""
selection.forEach(function (le) {
  var status = le.getValue("BPA_Processed_In_EBS").getSimpleValue();
  if (status != "Yes") {

    var cileKey = le.getValue("Local_Explosion_Key").getSimpleValue();
    if (cileKey) {
      manager.getKeyHome().updateUniqueKeyValues2({
        "Local_Explosion_Key": String("")
      }, le);
    }
    cancelFolder = manager.getProductHome().getProductByID("CancelledProducts");
    le.setParent(cancelFolder);
    le.approve();
    errorMsg = errorMsg + "\n" + le.getID() + "<html><body><b><font color = green>  :Object Cancelled successfully </font></b></body></html>";

  } else {
    errorMsg = errorMsg + "\n" + le.getID() + "<html><body><b><font color = red>  :Object cannot be Cancelled as its EBS Processed .</font></b></body></html>";
  }
});
if (errorMsg) {
  webui.showAlert("Warning", "Result Details: ", errorMsg);
} else {
  return null
}
}