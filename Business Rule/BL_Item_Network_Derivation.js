/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Item_Network_Derivation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Derivation_Libraries" ],
  "name" : "Item Network Derivation Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "AT&T_Global_Library",
    "libraryAlias" : "LibGlobal"
  }, {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonDerivationLib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessLibrary",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
function setNetworkDerivedAttributes(node, stepManager, networkLookUp) { //tested
    var referenceType = stepManager.getLinkTypeHome().getClassificationProductLinkTypeByID("Network_Derived_Reference");
    var references = node.getClassificationProductLinks().get(referenceType);
    if (references.size() > 0) {
        var classificationObject = stepManager.getClassificationHome().getClassificationByID(references.get(0).getClassification().getID());
        if (classificationObject.getObjectType().getID() == 'Item_Class') {
            var barCode = setLovAndGetParent(node, "Item_Class", classificationObject);
            var externalDownloadCode = setLovAndGetParent(node, "Bar_Code_Receipt_Req", barCode);
            var expenditureType = setLovAndGetParent(node, "Ext_App_Dwnld_Code", externalDownloadCode);
            var purchasingCategorySeg4 = setLovAndGetParent(node, "Expenditure_Type", expenditureType);
            var purchasingCategorySeg3 = purchasingCategorySeg4.getParent();
            var purchasingCategorySeg2 = purchasingCategorySeg3.getParent();
            var purchasingCategorySeg1 = purchasingCategorySeg2.getParent();
            var purchasingCategory = purchasingCategorySeg1.getName().concat("." + purchasingCategorySeg2.getName() + "." + purchasingCategorySeg3.getName() + "." + purchasingCategorySeg4.getName());
            node.getValue("Purchasing_Cat_NTW").setLOVValueByID(purchasingCategory);
            var accountingType = purchasingCategorySeg1.getParent();
            node.getValue("Accounting_Type").setLOVValueByID(accountingType.getName());
            var expenseAccountLovId = accountingType.getName().concat("." + purchasingCategory + "." + expenditureType.getName());
            var expenseAccount = networkLookUp.getLookupTableValue("LT_Network_Expense_Account", expenseAccountLovId);
            var expenseAccountOrg = "X".concat(".", expenseAccount, ".0000.000000.0000.0000");
            node.getValue("Expense_Account_Org").setSimpleValue(expenseAccountOrg);
        }
    }
}

function setLovAndGetParent(node, attributeId, currentObj) { //tested
    node.getValue(attributeId).setLOVValueByID(currentObj.getName());
    return currentObj.getParent();
}

function setDerivedExternalDownloadFlag(node, stepManager) { //tested
    var accountingType = node.getValue("Accounting_Type").getSimpleValue();
    var purchasingCategoryNtw = node.getValue("Purchasing_Cat_NTW").getSimpleValue();
    var expenditureType = node.getValue("Expenditure_Type").getSimpleValue();
    var externalAppDownloadCodeId = node.getValue("Ext_App_Dwnld_Code").getID();
    var derivedExpenditureTypeString = accountingType + "." + purchasingCategoryNtw + "." + expenditureType;
    var derivedExternalDownloadFlagString = derivedExpenditureTypeString + "." + externalAppDownloadCodeId;
    var derivedExpenditureTypeLovValue = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_Derived_ExpType").getListOfValuesValueByID(derivedExpenditureTypeString);
    if (derivedExpenditureTypeLovValue) {
        node.getValue("Derived_ExpType").setSimpleValue(derivedExpenditureTypeString);
    } else {
        node.getValue("Derived_ExpType").setSimpleValue("-Select-");
    }
    var derivedExternalDownloadFlagLovValue = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_Derived_ExtDwnldFlag").getListOfValuesValueByID(derivedExternalDownloadFlagString);
    if (derivedExternalDownloadFlagLovValue) {
        node.getValue("Derived_ExtDwnldFlag").setSimpleValue(derivedExternalDownloadFlagString);
    } else {
        node.getValue("Derived_ExtDwnldFlag").setSimpleValue("-Select-");
    }
}

function setNetworkDefaultAttributes(node) { //tested
    commonDerivationLib.setDefaultValueIfEmpty(node, "Organization_Code", "LOV", "MST");
    commonDerivationLib.setDefaultValueIfEmpty(node, "Build_In_WIP_Flag", "LOV", "Y");
    commonDerivationLib.setDefaultValueIfEmpty(node, "Item_Status_NTW", "LOV", "Active NTW");
    commonDerivationLib.setDefaultValueIfEmpty(node, "MTL_Transactions_Enabled_Flag", "LOV", "N");
    commonDerivationLib.setDefaultValueIfEmpty(node, "Stock_Enabled_Flag", "LOV", "N");
    commonDerivationLib.setDefaultValueIfEmpty(node, "Cat_Group_Name", "LOV", "Asset");
    commonDerivationLib.setDefaultValueIfEmpty(node, "COGS_Account", "LOV", "1001.9899.0000.000000.0000.0000");
    commonDerivationLib.setDefaultValueIfEmpty(node, "Template_Name", "LOV", "ATT Active NTW");
    commonDerivationLib.setDefaultValueIfEmpty(node, "Inventory_Cat_NTW", "LOV", "NETWORK.DEFAULT");
    commonDerivationLib.setDefaultValueIfEmpty(node, "Product_Class", "LOV", "NETWORK MOBILITY");
    commonDerivationLib.setDefaultValueIfEmpty(node, "Product_Sub_Type", "LOV", "NTW_NON_SERIAL");
    commonDerivationLib.setDefaultValueIfEmpty(node, "Sales_Account", "LOV", "1002.9899.0000.000000.0000.0000");
    commonDerivationLib.setDefaultValueIfEmpty(node, "Costing_Enabled", "LOV", "Y");
    commonDerivationLib.setDefaultValueIfEmpty(node, "Customer_Order_Flag", "LOV", "Y");
    commonDerivationLib.setDefaultValueIfEmpty(node, "Include_in_Rollup", "LOV", "Y"); 
    commonDerivationLib.setDefaultValueIfEmpty(node, "Engineered_Item_Flag", "LOV", "N");   
    commonDerivationLib.setDefaultValueIfEmpty(node, "Internal_Order_Flag", "LOV", "Y"); 
    commonDerivationLib.setDefaultValueIfEmpty(node, "Inventory_Asset_Value", "LOV", "Y"); 
    commonDerivationLib.setDefaultValueIfEmpty(node, "Inventory_Item", "LOV", "Y"); 
    commonDerivationLib.setDefaultValueIfEmpty(node, "Inventory_Planning_Code", "LOV", "6"); 
    commonDerivationLib.setDefaultValueIfEmpty(node, "Invoiceable_Item_Flag", "LOV", "Y"); 
    commonDerivationLib.setDefaultValueIfEmpty(node, "Match_Approval_Level", "LOV", "3"); 
    commonDerivationLib.setDefaultValueIfEmpty(node, "Purchasing_Item_Flag", "LOV", "Y"); 
    commonDerivationLib.setDefaultValueIfEmpty(node, "Returnable", "LOV", "Y");
    commonDerivationLib.setDefaultValueIfEmpty(node, "Shippable", "LOV", "Y");
    commonDerivationLib.setDefaultValueIfEmpty(node, "OM_Transaction_Enabled", "LOV", "Y");
    // @author - Anudeep, Rule name - SendItemInfo
    commonDerivationLib.setDefaultValueIfEmpty(node, "Send_Item_Info", "LOV", "N");
    // @author - Pradeep, Rule name - Ext_App_Dwnld_Code
    // commonDerivationLib.setDefaultValueIfEmpty(node, "Ext_App_Dwnld_Code", "LOV", "X");
}

/**
 * @author - Anudeep
 * Rule Name: Assign to Field Orgs for SWIM
 */
function setAssignToFieldOrgsForSWIM(node){
	var purchasingCategory = node.getValue("Purchasing_Cat_NTW").getID();
	if (purchasingCategory && purchasingCategory.contains("SWIM")){
		if(!node.getValue("Assign_To_Field_Orgs").getID()){
			node.getValue("Assign_To_Field_Orgs").setLOVValueByID("C");	
		}
	}
}

/**
 * @author - Anudeep
 * Rule Name: Expenditure Type for EBS
 */
function setExpenditureTypeEBS(node){
	var accountingType = node.getValue("Accounting_Type").getID();
	var expenditureType = node.getValue("Expenditure_Type").getID()
	if ( accountingType == "Capital"){
         	node.getValue("Expenditure_Type_EBS").setSimpleValue(expenditureType);
	}
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.setNetworkDerivedAttributes = setNetworkDerivedAttributes
exports.setLovAndGetParent = setLovAndGetParent
exports.setDerivedExternalDownloadFlag = setDerivedExternalDownloadFlag
exports.setNetworkDefaultAttributes = setNetworkDefaultAttributes
exports.setAssignToFieldOrgsForSWIM = setAssignToFieldOrgsForSWIM
exports.setExpenditureTypeEBS = setExpenditureTypeEBS