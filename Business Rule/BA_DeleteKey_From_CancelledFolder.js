/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DeleteKey_From_CancelledFolder",
  "type" : "BusinessAction",
  "setupGroups" : [ "BR_DataFix" ],
  "name" : "Delete Key on Items from Cancelled Folder",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Item", "Companion_SKU" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step) {
var objectType = node.getObjectType().getID();
deleteKey(node, step, objectType);
function deleteKey(node, step, objectType) {
  if (objectType == "Child_Org_Item") {
    var childorgkey = node.getValue("DM_Child_Org_Key").getSimpleValue();
    var childOrgIdentity = node.getValue("Child_Org_Identity").getSimpleValue();
    if (childorgkey) {
      step.getKeyHome().updateUniqueKeyValues2({
        "DM_Child_Org_Key": String("")
      }, node);
    }
    if (childOrgIdentity) {
      step.getKeyHome().updateUniqueKeyValues2({
        "Child_Org_Identity": String("")
      }, node);
    }
  } else if (objectType == "Companion_SKU") { 
    var companionskuIdentity = node.getValue("Comp_SKU_Identity").getSimpleValue();
    if (companionskuIdentity) {
      step.getKeyHome().updateUniqueKeyValues2({
        "Comp_SKU_Identity": String("")
      }, node);
    }
  }
}
}