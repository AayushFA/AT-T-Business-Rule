/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Item_Retail_Smartsheet_Derivation",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Smartsheet_Actions" ],
  "name" : "Retail Smartsheet Onboarding Derivations",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Cost_Common_Attributes_Derivation",
    "libraryAlias" : "commonCostDerivationLib"
  }, {
    "libraryId" : "BL_Item_Retail_Derivation",
    "libraryAlias" : "retailDerivationLib"
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
exports.operation0 = function (node,stepManager,query,bfRemoveJunkChar,lookUpTable,commonCostDerivationLib,retailDerivationLib,commonDerivationLib,unspscLib) {
node.getValue("Line_Of_Business").setLOVValueByID("RTL");
commonDerivationLib.removeJunkChars(node,stepManager,"Long_Description",bfRemoveJunkChar); // Removing Junk chars. Allow ASCII 32-126
retailDerivationLib.clearUserDefinedItemDescription(node,stepManager); // Clear off the values other than Intang or DF item types
retailDerivationLib.setIMEIitemID(node, stepManager);//CTXSCM-17234
retailDerivationLib.clearChemicalCancerAndReproductive(node); // If Toxicity = ND, Clear the value for "CA Prop 65 Chemical - Cancer" & "CA Prop 65 Chemical - Reproductive"	
retailDerivationLib.setFieldOrgsAndAssignScope(node); // If Market Linking is "GSM", default to "C" & "Retail All DCs"
commonCostDerivationLib.setSubmittedDateAndStandardCost(node,stepManager); // Set current date;
commonDerivationLib.setSerialGeneration(node,"RTL",stepManager); // Serial Generation is "6" for Serailized Item, Else "1"
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Item_Class", "RTL_Item_Class", "LOV"); // Derived Item Class based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Product_Class", "RTL_Product_Class", "LOV"); // Derived Product Class based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Product_Type", "RTL_Product_Type", "LOV"); // Derived Product Type based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Product_Sub_Type", "RTL_Product_Sub_Type", "LOV"); // Derived Product Sub Type based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","COGS_Account", "RTL_COGS_Account", "Text"); // Derived COGS Account Type based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Sales_Account", "RTL_Sales_Account", "LOV"); // Derived Sales Account based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Purchasing_Cat_RTL", "RTL_Purchasing_Cat", "LOV"); // Derived Purchasing Cat based on Item Type
//commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Returnable", "RTL_Returnable_Flag", "LOV"); // Derived Returnable based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Reservable", "RTL_Reservable_Flag", "LOV"); // Derived Reservable based on Item Type
//commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Inventory_Asset_Value", "RTL_Inventory_Asset_Flag", "LOV"); // Derived Inventory Asset Value based on Item Type
//commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Inventory_Item", "RTL_Inventory_Item_Flag", "LOV"); // Derived Inventory Item based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","User_Item_Type_RTL", "RTL_User_Item_Type", "LOV"); // Derived User Item Type based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Send_Item_Info", "RTL_Send_Item_Info", "LOV"); // Derived Send Item Info based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Intangible_Nonship", "RTL_Intangible_Nonshippable_Item", "LOV"); // Derived Send Item Info based on Item Type	
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Cat_Group_Name", "RTL_Catalog_Group_Name", "LOV"); // Derived Catalog Group Name based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Description_Prefix", "RTL_Description_Prefix", "LOV"); // Derived Description Prefix based on Item Type
commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","No_Commit_Fee_Eligible", "RTL_No_Commitment_Fee_Eligible", "LOV"); // Derived No Commitment Fee Eligible based on Item Type
commonDerivationLib.setHazmatUnNumber(node,lookUpTable); // set Hazmat UN Number based on BatteryTechnology & BatteryPackaging attributes
retailDerivationLib.clearCaProp65ChemicalCancer(node); //Clear CA Prop 65 Chemical - Cancer id if CA Prop 65 Toxicity Type is ND
retailDerivationLib.clearUniversalItem(node); //Clear Universal Item for non Apple items
retailDerivationLib.setLineOfBusinessCat(node,stepManager); // set Line Of Business Category from Source Sheet
commonDerivationLib.convertToUpperCase(node,"Marketing_Name");
commonDerivationLib.convertToUpperCase(node,"Model");
commonDerivationLib.setItemRequestor(node,stepManager); // STIBO-2586 Set Current User when blank. Must be in lower case. 
commonDerivationLib.trimWhiteSpacesAndNewLines(node, stepManager); // STIBO-2634 Prod Support Team
retailDerivationLib.setDimensionAttributes(node); // STIBO- 2874 PDH Support Team June 7th Release
unspscLib.createUNSPSCReference(node, stepManager, query); // Create UNSPSC reference, if its not provided by user STIBO-1431	
commonDerivationLib.setDefaultValueIfEmpty(node, "Sourcing_Notify", "LOV", "Y");
commonDerivationLib.copyAttributeValue(node,"COGS_Account_Org","COGS_Account","LOV");
commonDerivationLib.copyAttributeValue(node,"Sales_Account_Org","Sales_Account","LOV");
commonDerivationLib.initiateItemIntoWorkflow(node);
}