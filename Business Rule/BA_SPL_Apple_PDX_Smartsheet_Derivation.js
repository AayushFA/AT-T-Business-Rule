/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SPL_Apple_PDX_Smartsheet_Derivation",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_SPL_Smartsheet_Actions" ],
  "name" : "SPL Apple PDX Smartsheet Derivation",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_SPL_Derivation",
    "libraryAlias" : "splLib"
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
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "log",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "GatewayBinding",
    "alias" : "giep",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.gateway.FrontGatewayIntegrationEndpointImpl",
    "value" : "Apple_Catalog_GIEP",
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "splLookup",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "QueryHomeBindContract",
    "alias" : "queryHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "EntityBindContract",
    "alias" : "retailItemType",
    "parameterClass" : "com.stibo.core.domain.impl.entity.FrontEntityImpl$$Generated$$10",
    "value" : "RTL_Item_Type",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,log,giep,splLookup,queryHome,retailItemType,splLib) {
var appleLob = node.getValue("Apple_LoB").getID();	
splLib.setApplePDXAttributes(node,stepManager,log,splLookup,giep,retailItemType)
splLib.setBatchId(node,stepManager);
splLib.setAppleDefaultAttributes(node,stepManager,queryHome,splLookup);
splLib.deriveUDCParentModel(node,appleLob)
splLib.deriveWatchModel(node,appleLob)
node.startWorkflowByID("SPI_Onboarding", "Initiated workflow on import");
}