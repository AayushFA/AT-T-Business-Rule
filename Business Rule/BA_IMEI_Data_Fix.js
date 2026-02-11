/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_IMEI_Data_Fix",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_IMEI_Data_Migration_Actions" ],
  "name" : "IMEI Data Conversion",
  "description" : "Business Action which calls functions from IMEI Derivation Library (Needed for One Time Data Conversion)",
  "scope" : "Global",
  "validObjectTypes" : [ "IMEI_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_IMEI_Item_Derivation",
    "libraryAlias" : "imeiDerivationLib"
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
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookupTableHome",
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
exports.operation0 = function (node,lookupTableHome,step,imeiDerivationLib) {
imeiDerivationLib.setTac(node);
/*
imeiDerivationLib.setManufacturerName(node);
imeiDerivationLib.setDiscoveryServer(node,lookupTableHome);
imeiDerivationLib.setCompatibilityIndicator(node);
imeiDerivationLib.setImeiSkuNumbers(node,step);
imeiDerivationLib.setTac(node);
imeiDerivationLib.setImeiItemBandAttributes(node, lookupTableHome);
imeiDerivationLib.setDeviceTypeAttributes(node, lookupTableHome);
imeiDerivationLib.setLteNsetDeviceCapableAttributes(node, lookupTableHome);
imeiDerivationLib.setImeiDeviceCategory(node);
*/

}