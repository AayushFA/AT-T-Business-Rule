/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_WRLN_UI_Oracle_Tab_Visibility",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Web_UI_Conditions" ],
  "name" : "Wireline UI Oracle Attributes Tab Visibility",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Companion_SKU", "Item" ],
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
    "contract" : "ManagerBindContract",
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "dgUserGroup",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_DG",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "stiboUserGroup",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "Stibo",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "superUserGroup",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "Super user",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,dgUserGroup,stiboUserGroup,superUserGroup) {
var curUser = stepManager.getCurrentUser();
var lob = node.getValue("Line_Of_Business").getID();
if ((dgUserGroup.isMember(curUser)||stiboUserGroup.isMember(curUser)||superUserGroup.isMember(curUser)) && lob == "WRLN") {
    return true;
} else {
    return false;
}

}