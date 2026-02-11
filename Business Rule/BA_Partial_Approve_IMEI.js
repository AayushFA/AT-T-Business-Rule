/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Partial_Approve_IMEI",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_IMEI_Data_Migration_Actions" ],
  "name" : "Partial Approve IMEI Items",
  "description" : "Business Action used to partial approve IMEI Items",
  "scope" : "Global",
  "validObjectTypes" : [ "IMEI_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "bpaLib"
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
exports.operation0 = function (node,bpaLib) {
var attributeList =['IMEI_Device_Category'];
//var attributeList =['IMEI_TAC', 'IMEI_Compatibility_Indicator', 'IMEI_Discovery_Server', 'IMEI_SKU_Numbers', 'IMEI_Manufacturer_Name', 'IMEI_Item_Band_Attributes', 'IMEI_Device_Type_Attributes', 'IMEI_LTE_NSET_DCAP_Attributes','IMEI_Device_Category'];
bpaLib.partialApproveFields(node, attributeList);
}