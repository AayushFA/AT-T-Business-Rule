/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Daas_Child_Org_Item_Level_Filter",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Daas_Conditions" ],
  "name" : "Daas Child Org Item Level Filter",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Common_Validation",
    "libraryAlias" : "itemCommonValidationLib"
  } ]
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,itemCommonValidationLib) {
itemCommonValidationLib.relexDaasChildOrgItemLevelFilter(node);
}