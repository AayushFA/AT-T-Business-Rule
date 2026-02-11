/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Check_CILE_Upadate_Approve",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "Check If CILE Aprove Update",
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
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "issue",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,issue) {
var bpaParent = null;
var BPA_no = null;
var ciParent = null;
var noIssue = true;
var objectType = node.getObjectType().getID();

if (objectType == 'LE_Contract_Item_Child') {
    BPA_no = node.getValue("Oracle_Contract_Num").getSimpleValue();
    ciParent = node.getParent();
    if (ciParent.getApproveStatus() == "Not Approved" && BPA_no) {
        issue.addWarning("Please approve Parent Contract Item: " + ciParent.getName() + " then approve Local Explosion");
        return issue;
    } else {
        return true;
    }
} else {
    return true;
}
}