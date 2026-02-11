/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CollectionNavigation",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATTReportBusinessRules" ],
  "name" : "Collection navigation screen",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
  "allObjectTypesValid" : true,
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
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "colLkUp",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,webui,colLkUp) {
//author : @aw240u( cognizant)

var selection = webui.getSelection();
var count = 0;
if (selection) {
    selection.forEach(function(select) {
        count = count + 1
    });
}

if (count == 1) {
    selection.forEach(function(select) {
        var id = select.getID();
        var lookUpResult = colLkUp.getLookupTableValue("LT_UI_Collection_List_Screens", id);
        if (lookUpResult == "Item") {

            webui.navigate("Item_Collection_Content_Screen", select);
        }
        if (lookUpResult == "Contract") {

            webui.navigate("BPA_Collection_Content_Screen", select);
        }
        if (lookUpResult == "BOM") {

            webui.navigate("BOM_Collection_Content_Screen", select);
        }
        if (lookUpResult == "Asset") {

            webui.navigate("Asset_Collection_Content_Screen", select);
        }


    });
} else {
    webui.showAlert("ERROR", "Wrong Selection: ", "Please select only one collection");
}
}