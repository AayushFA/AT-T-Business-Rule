/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Item_Network_Smartsheet_Derivation",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Smartsheet_Actions" ],
  "name" : "Network Smartsheet Onboarding Derivations",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonDerivationLib"
  }, {
    "libraryId" : "BL_Item_UNSPSC_Derivation",
    "libraryAlias" : "unspscLib"
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
    "alias" : "query",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,query,commonDerivationLib,unspscLib) {
node.getValue("Line_Of_Business").setLOVValueByID("NTW");
node.getValue("User_Item_Type_NTW").setLOVValueByID("NETWORK");
commonDerivationLib.trimWhiteSpacesAndNewLines(node, stepManager); // STIBO-2634 Prod Support Team
commonDerivationLib.roundListPrice(node);
unspscLib.createUNSPSCReference(node, stepManager, query);
commonDerivationLib.initiateItemIntoWorkflow(node);
}