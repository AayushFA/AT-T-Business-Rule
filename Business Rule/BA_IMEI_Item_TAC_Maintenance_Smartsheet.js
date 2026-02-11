/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_IMEI_Item_TAC_Maintenance_Smartsheet",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_IMEI_Smartsheet_Actions" ],
  "name" : "IMEI Item & TAC Maintenance Smartsheet Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "IMEI_Item", "IMEI_Tac_Range" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
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
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "oiep",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=Telegence_OIEP",
    "description" : null
  }, {
    "contract" : "EventQueueBinding",
    "alias" : "itemSOAoiep",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=SOA_Item_OIEP",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,lookupTableHome,oiep,itemSOAoiep,lib,imeiDerivationLib) {
lib.addToMaintenanceTracker(step, node);
lib.setIMEIItemParent(node, step);
imeiDerivationLib.generateImeiSku(node,step);
lib.setIMEIItemName(node);
imeiDerivationLib.setCompatibilityIndicator(node);
imeiDerivationLib.setDiscoveryServer(node,lookupTableHome);
imeiDerivationLib.setImeiSkuNumbers(node,step);
imeiDerivationLib.setTac(node); //CTXSCM-21538 //rj5341 //Change may be required
imeiDerivationLib.setImeiItemBandAttributes(node, lookupTableHome);
imeiDerivationLib.setDeviceTypeAttributes(node, lookupTableHome);
imeiDerivationLib.setLteNsetDeviceCapableAttributes(node, lookupTableHome);
imeiDerivationLib.updateRetailAttributesForImei(step, node); //CTXSCM-24248 //rj5341 //12-7-25
lib.approveIMEIItem(node);
imeiDerivationLib.republishItemsForIMEI(node, itemSOAoiep);
lib.updateChildTeleganceFlag(node, oiep);
lib.tacRangeDerivation(step, node);
//lib.initiateIMEIItemIntoOnboardingWorkflow(node); //CTXSCM-21495 //rj5341
lib.initiateIMEIItemIntoMaintenanceWorkflow(node);
lib.initiateParentImeiItemIntoMainentanceWorkflow(step, node);
}