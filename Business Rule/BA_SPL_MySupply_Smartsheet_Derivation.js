/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SPL_MySupply_Smartsheet_Derivation",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_SPL_Smartsheet_Actions" ],
  "name" : "SPL MySupply Smartsheet Derivation",
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
    "contract" : "QueryHomeBindContract",
    "alias" : "queryHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "splLookup",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,queryHome,splLookup,splLib) {
var appleLob = node.getValue("Apple_LoB").getID();	
splLib.setBatchId(node,stepManager);
splLib.setAppleDefaultAttributes(node,stepManager,queryHome,splLookup);
splLib.deriveProductColor(node,appleLob,splLookup);
splLib.deriveModelNo(node,appleLob,splLookup);
 /**STIBO-3376 Remove transformation Logic as field is editable, hence commented **/
//splLib.deriveMarketingName_Features(node,appleLob,splLookup);
//splLib.deriveIMEIType(node,appleLob);
splLib.deriveUDCParentModel(node,appleLob)
splLib.deriveBandType(node,appleLob,splLookup);
splLib.deriveBandSize(node, appleLob, splLookup);
node.startWorkflowByID("SPI_Onboarding", "Initiated workflow on import");
}