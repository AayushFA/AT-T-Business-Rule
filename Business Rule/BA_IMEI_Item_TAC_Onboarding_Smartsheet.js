/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_IMEI_Item_TAC_Onboarding_Smartsheet",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_IMEI_Smartsheet_Actions" ],
  "name" : "IMEI Item & TAC Onboarding Smartsheet Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "IMEI_Item", "IMEI_Tac_Range" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_IMEI_Common_Derivation",
    "libraryAlias" : "lib"
  }, {
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
    "contract" : "ManagerBindContract",
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookupTableHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,lookupTableHome,lib,imeiDerivationLib) {
lib.setIMEIItemParent(node, step);
lib.moveTacBasedOnTemporaryParentID(step, node);
imeiDerivationLib.generateImeiSku(node,step);
lib.setIMEIItemName(node);
imeiDerivationLib.setCompatibilityIndicator(node);
imeiDerivationLib.setDiscoveryServer(node,lookupTableHome);
imeiDerivationLib.setImeiSkuNumbers(node,step);
imeiDerivationLib.setTac(node);
imeiDerivationLib.setImeiItemBandAttributes(node, lookupTableHome);
imeiDerivationLib.setDeviceTypeAttributes(node, lookupTableHome);
imeiDerivationLib.setLteNsetDeviceCapableAttributes(node, lookupTableHome);
lib.approveIMEIItem(node);
lib.tacRangeDerivation(step, node);
lib.initiateIMEIItemIntoOnboardingWorkflow(node);
lib.initiateParentImeiItemIntoMainentanceWorkflow(step, node);
}