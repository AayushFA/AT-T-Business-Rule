/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SPL_Maintenance_Attributes_Derivation",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_SPL_Smartsheet_Actions" ],
  "name" : "SPL Maintenance Attributes Derivation",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Retail_Derivation",
    "libraryAlias" : "retailDerivationLib"
  }, {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonDerivationLib"
  }, {
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
    "contract" : "LookupTableHomeBindContract",
    "alias" : "splLookup",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,splLookup,stepManager,retailDerivationLib,commonDerivationLib,splLib) {
log.info("Start Of SPL Attribute Derivation for "+node.getID());
var appleLob = node.getValue("Apple_LoB").getSimpleValue();
splLib.deriveProductColor(node,appleLob,splLookup);
splLib.deriveModelNo(node,appleLob,splLookup);
 /**STIBO-3376 Remove transformation Logic as field is editable, hence commented **/
//splLib.deriveMarketingName_Features(node,appleLob,splLookup);
//splLib.deriveIMEIType(node,appleLob);
splLib.setAttributeValue(node,appleLob,splLookup,"Tier");
splLib.deriveUDCParentModel(node,appleLob);
splLib.deriveMarketPrice(node, appleLob,splLookup,"Market_Price");
splLib.deriveBandType(node,appleLob,splLookup);
splLib.deriveBandSize(node, appleLob, splLookup);
splLib.derivePalletQty(node);
commonDerivationLib.setItemDescription(node,stepManager,"RTL");
retailDerivationLib.setIMEIitemID(node, stepManager);//CTXSCM-17234
log.info("End Of SPL Attribute Derivation for "+node.getID())


}