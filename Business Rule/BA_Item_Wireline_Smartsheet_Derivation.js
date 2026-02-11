/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Item_Wireline_Smartsheet_Derivation",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Smartsheet_Actions" ],
  "name" : "Wireline Smartsheet Onboarding Derivations",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Wireline",
    "libraryAlias" : "wirelineDerivationLib"
  }, {
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
  }, {
    "contract" : "BusinessFunctionBindContract",
    "alias" : "bf",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>BF_Item_Wireline_Trim_Special_Chars</BusinessFunction>\n</BusinessFunctionReference>\n",
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "wirelineLookUpTable",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,query,bf,wirelineLookUpTable,wirelineDerivationLib,commonDerivationLib,unspscLib) {
node.getValue("Line_Of_Business").setLOVValueByID("WRLN");
var material = node.getValue("Material_Item_Type_Web").getSimpleValue();
if(material == "Major Material XPID LE" || material == "Toolsets" || material == "Billing Category Item")
    node.getValue("User_Item_Type_WRLN").setLOVValueByID("WLN_NON_INV");
else
    node.getValue("User_Item_Type_WRLN").setLOVValueByID("WLN_INV");
unspscLib.createUNSPSCReference(node, stepManager, query);

commonDerivationLib.trimWhiteSpacesAndNewLines(node, stepManager); // STIBO-2634 Prod Support Team
commonDerivationLib.roundListPrice(node);
wirelineDerivationLib.setTechStaff(node, stepManager); // STIBO-3172 Prod Support Team(22 Feb Release)
wirelineDerivationLib.setMicCoe(node); // set Mic_Coe from MIC_COE_WRLN
wirelineDerivationLib.setRestrictedtoExternalSystem(node); // Set Restricted to External System
wirelineDerivationLib.setPurchasingCat(node, stepManager);
wirelineDerivationLib.setE911Category(node); // STIBO-3172 Prod Support Team(22 Feb Release)
if (material) {
	wirelineDerivationLib.setItemCriticalityIndicator(node); // STIBO-3172 Prod Support Team(22 Feb Release)
	wirelineDerivationLib.setRegionalItemFlag(node); // Set Regional Item Flag
	wirelineDerivationLib.setExpenditureCode(node); // Set Expenditure Code
	wirelineDerivationLib.setPlanningRoute(node); // Set Planning Route
}
wirelineDerivationLib.setExternalAppDownloadCode(node); // Set External App Download Code
wirelineDerivationLib.setProductType(node);
wirelineDerivationLib.clearSafetyIndicatorAndOrmdClass(node); // Clear Safety Indicator and Ormd Class if Material item type = !Minor Material, Item Status ! = Active S,  Region_Distribution_Center  != MW1, SW1, WE2, WE3
wirelineDerivationLib.clearStockItemGroup(node);
wirelineDerivationLib.setOALCTrk(node);
wirelineDerivationLib.clearRecoveryTypeAndHandlingClass(node); // Recovery Type and Handling class are only applicable for Plug In items
wirelineDerivationLib.setCapitalTool(node);
wirelineDerivationLib.setUOMandPatternAccount(node); // set "CA" for UMO and "C7" for Pattern Account if material Item Type is "Billing Category Item"
wirelineDerivationLib.setASEStatus(node);
wirelineDerivationLib.setJDAAttributes(node);
commonDerivationLib.removeSpecialCharsAndToUpperCase(node, stepManager, bf, "User_Defined_Item_Description");
commonDerivationLib.removeSpecialCharsAndToUpperCase(node, stepManager, bf, "Long_Description");
commonDerivationLib.initiateItemIntoWorkflow(node);
}