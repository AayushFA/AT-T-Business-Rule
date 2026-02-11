/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Item_ENT_Smartsheet_Derivation",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Smartsheet_Actions" ],
  "name" : "Entertainment Smartsheet Onboarding Derivations",
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
  }, {
    "libraryId" : "BL_Item_Entertainment_Derivation",
    "libraryAlias" : "entertainmentDerivationLib"
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
    "alias" : "bfRemoveJunkChar",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>BF_Item_RTL_ENT_Trim_Special_Chars</BusinessFunction>\n</BusinessFunctionReference>\n",
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUpTable",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,query,bfRemoveJunkChar,lookUpTable,commonDerivationLib,unspscLib,entertainmentDerivationLib) {
node.getValue("Line_Of_Business").setLOVValueByID("ENT");
var itemType = node.getValue("ENT_Item_Type").getID();
var userItemType = node.getValue("User_Item_Type_ENT").getID();
var itemClass = node.getValue("Item_Class").getID();

entertainmentDerivationLib.setMaterialItemType(node);
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"ENT","Asset_Tracking_Scope", "Ent_Asset_Tracking_Scope", "LOV"); // Derived Item Class based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"ENT","Bar_Code_Receipt_Req", "Ent_Bar_Code_Receipt_Required", "LOV"); // Derived Product Class based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"ENT","Product_Type", "Ent_Product_Type", "LOV"); // Derived Product Type based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"ENT","Product_Sub_Type", "Ent_Product_SubType", "LOV"); // Derived Product Sub Type based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"ENT","Description_Prefix", "Ent_Description_Prefix", "LOV"); // Derived Description Prefix based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"ENT","Purchasing_Cat_ENT", "Ent_Purchasing_Category", "LOV"); // Derived Purchasing Cat based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"ENT","Regional_Item_Flag", "Ent_Regional_Item_Flag", "LOV"); // Derived Purchasing Cat based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"ENT","Sales_Account", "Ent_Sales_Account", "LOV"); // Derived Sales Account based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"ENT","Send_Asset_Txn_To_Finance", "Ent_Send_Asset_Txn_To_Finance", "LOV"); // Derived Sales Account based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"ENT","Send_Item_Info", "Ent_Send_Item_Info", "LOV"); // Derived Send Item Info based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"ENT","Technology", "Ent_Technology", "LOV"); // Derived Send Item Info based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"ENT","User_Item_Type_ENT", "Ent_User_Item_Type", "LOV"); // Derived User Item Type based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"ENT","Item_Class", "Ent_Item_Class", "LOV");
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"ENT","Item_Assign_Scope", "Ent_Item_Assignment_Scope", "LOV");
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"ENT","COGS_Account", "Ent_COGS_Account", "LOV"); // Derived COGS Account Type based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"ENT","Cat_Group_Name", "Ent_Cat_Group_Name", "LOV"); // Derived Catalog Group Name based on Item Type
// **Set ESI Attributes Values**//
commonDerivationLib.removeJunkChars(node,stepManager,"Long_Description",bfRemoveJunkChar); // Removing Junk chars. Allow ASCII 32-126
commonDerivationLib.removeSpecialCharsAndToUpperCase(node, stepManager, bfRemoveJunkChar, "Model");
commonDerivationLib.removeSpecialCharsAndToUpperCase(node, stepManager, bfRemoveJunkChar, "Mfg_Part_No");
commonDerivationLib.removeSpecialCharsAndToUpperCase(node, stepManager, bfRemoveJunkChar, "User_Defined_Item_Description");
entertainmentDerivationLib.setExtAppDownloadCode(node);
entertainmentDerivationLib.setProductClass(node);
node.getValue("Submitted_Date").setSimpleValue(commonDerivationLib.getCurrentDate());
entertainmentDerivationLib.setSubmitStandardCost(node,stepManager);
commonDerivationLib.setItemRequestor(node, stepManager);
entertainmentDerivationLib.setMatchApprovalLevel(node);
entertainmentDerivationLib.deriveIrdDesignator(node,lookUpTable);
entertainmentDerivationLib.setLineOfBusinessCat(node,stepManager);
entertainmentDerivationLib.setProductName(node);
commonDerivationLib.trimWhiteSpacesAndNewLines(node,stepManager);
commonDerivationLib.roundListPrice(node);
commonDerivationLib.setSerialGeneration(node,"ENT",stepManager); // Serial Generation is "6" for Serailized Item, Else "1"
commonDerivationLib.setBatteryTechnology(node,stepManager);
commonDerivationLib.setHazmatUnNumber(node, lookUpTable);
commonDerivationLib.setListPrice(node);
if (userItemType == "SATELLITE") {
	commonDerivationLib.clearAttributeValue(node,"User_Defined_Item_Num");
	commonDerivationLib.clearAttributeValue(node,"Requested_Standard_Cost");
}
if(itemClass == "ATT Entertainment Make Model"){
    commonDerivationLib.clearAttributeValue(node,"Make");
}
commonDerivationLib.removeJunkChars(node,stepManager,"User_Defined_Item_Description",bfRemoveJunkChar); // Removing Junk chars. Allow ASCII 32-126
commonDerivationLib.convertToUpperCase(node,"User_Defined_Item_Description");
commonDerivationLib.removeJunkChars(node,stepManager,"Mfg_Part_No",bfRemoveJunkChar); // Removing Junk chars. Allow ASCII 32-126
commonDerivationLib.convertToUpperCase(node,"Mfg_Part_No");
unspscLib.createUNSPSCReference(node, stepManager, query); // Create UNSPSC reference, if its not provided by user STIBO-1431	
commonDerivationLib.setDefaultValueIfEmpty(node, "Sourcing_Notify", "LOV", "Y");
commonDerivationLib.copyAttributeValue(node,"Sales_Account_Org","Sales_Account","LOV");
commonDerivationLib.copyAttributeValue(node,"COGS_Account_Org","COGS_Account","LOV");

commonDerivationLib.initiateItemIntoWorkflow(node);

}