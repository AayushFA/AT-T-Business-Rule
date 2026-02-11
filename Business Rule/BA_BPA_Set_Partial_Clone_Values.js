/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_Set_Partial_Clone_Values",
  "type" : "BusinessAction",
  "setupGroups" : [ "BA_BPAClone" ],
  "name" : "BPA Set Clone Flag Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
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
var bpaChildren = node.getChildren().toArray();
var userList = node.getValue("BPA_Partial_Clone_Item_Num_List").getSimpleValue();
var mfg_Part_No = manager.getAttributeHome().getAttributeByID("Mfg_Part_No");
var OINs = [];
var splitList = [];
var trimSplitList = [];
var validInfo = "";
var errorMsg = "";
if (userList) {
    splitList = userList.split("\n");
    trimSplitList = splitList.filter(entry => entry.trim() !== '');
}

//Collect the CI OIN List
bpaChildren.forEach(function(item) {
    var oin = item.getValue("Oracle_Item_Num").getSimpleValue();
    OINs.push(oin)
});

//Loop thru trimSplitList for validations
trimSplitList.forEach(function(l) {
    if (!OINs.includes(l.trim())) {
        validInfo = validInfo + l.trim() + " :Entered OIN is not in the CI's List , hence flag not set. \n"
        webui.showAlert("INFO", validInfo);
    }
});


bpaChildren.forEach(function(item) {
    var isFound = false;
    var oin = item.getValue("Oracle_Item_Num").getSimpleValue();
    trimSplitList.forEach(function(l) {
        if (l.trim().equals(oin)) {
            isFound = true;
            item.getValue("Partial_Clone_Flag").setSimpleValue("Yes");
        }
    });
    if (!isFound) {
        item.getValue("Partial_Clone_Flag").setSimpleValue(null);
    }
});
}