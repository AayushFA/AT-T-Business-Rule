/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Relex_Filter",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Daas_Actions" ],
  "name" : "Relex Filter",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BOM_Child", "BOM_Child_Substitute", "Bill_Of_Material", "Companion_SKU", "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "TriggerAndApproveNewParts",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "itemCommonDerivationLib"
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,itemCommonDerivationLib) {
itemCommonDerivationLib.relexFilter(node);
}