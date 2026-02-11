/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SPL_Data_Enrichment_Approve",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_SPL_Web_UI_Actions" ],
  "name" : "SPL Data Enrichment Web UI Approve Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Companion_SKU_Retail",
    "libraryAlias" : "retailCompanionSkuLib"
  }, {
    "libraryId" : "BL_Item_Transportation_Derivation",
    "libraryAlias" : "transportationDerivationLib"
  }, {
    "libraryId" : "BL_Item_UNSPSC_Derivation",
    "libraryAlias" : "unspscLib"
  }, {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonDerivationLib"
  }, {
    "libraryId" : "BL_Item_Retail_Derivation",
    "libraryAlias" : "retailDerivationLib"
  }, {
    "libraryId" : "BL_SPL_Derivation",
    "libraryAlias" : "splLib"
  }, {
    "libraryId" : "BL_Item_Retail_Validation",
    "libraryAlias" : "retailValidationLib"
  }, {
    "libraryId" : "BL_Item_Common_Validation",
    "libraryAlias" : "commonValidationLib"
  }, {
    "libraryId" : "BL_Child_Org_Retail_Derivation",
    "libraryAlias" : "retailChildOrgLib"
  }, {
    "libraryId" : "BL_Cost_Common_Attributes_Derivation",
    "libraryAlias" : "commonCostDerivationLib"
  }, {
    "libraryId" : "BL_Generate_UPC_GTIN",
    "libraryAlias" : "upcGTINLib"
  }, {
    "libraryId" : "BL_SPL_Validation_Library",
    "libraryAlias" : "splValidationLib"
  }, {
    "libraryId" : "BL_Generate_Item_Number",
    "libraryAlias" : "itmGenLib"
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
    "contract" : "WebUiContextBind",
    "alias" : "webUi",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "dataIssues",
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
    "contract" : "BusinessFunctionBindContract",
    "alias" : "bfRemoveJunkCharDevice",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>BF_Item_Retail_Device_Trim_Special_Char</BusinessFunction>\n</BusinessFunctionReference>\n",
    "description" : null
  }, {
    "contract" : "AttributeGroupBindContract",
    "alias" : "attributeGroup",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "AG_Apple_Mandatory",
    "description" : null
  }, {
    "contract" : "QueryHomeBindContract",
    "alias" : "queryHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,webUi,dataIssues,bfRemoveJunkChar,bfRemoveJunkCharDevice,attributeGroup,queryHome,retailCompanionSkuLib,transportationDerivationLib,unspscLib,commonDerivationLib,retailDerivationLib,splLib,retailValidationLib,commonValidationLib,retailChildOrgLib,commonCostDerivationLib,upcGTINLib,splValidationLib,itmGenLib) {
/**
 * @author - Aditya, Madhuri
 * Approves the current batch from enrirchment state
 */

log.severe("Inside SPL Data Enrichment Approve Action");

var condition = com.stibo.query.condition.Conditions;
var lookUpTableHome = stepManager.getHome(com.stibo.lookuptable.domain.LookupTableHome);
var query = splLib.getAllSPLWorkflowTasks(stepManager, queryHome, condition);
var batchErrors = false;
var enrirchmentStateItems = [];

if (query) {
    query.forEach(function(task) {
        var currentNode = task.getNode();
        if (currentNode.isInState("SPI_Onboarding", "SPI_Enrichment")) {
            var errors = "";   
			var error="";        
            currentNode.getValue("SPI_Errors").setSimpleValue(null);
            errors += splValidationLib.validateMandatoryAttribute(currentNode, "Apple_LoB", stepManager); 
            if(!errors){
	            splLib.setSPLMySupplyAttributes(currentNode, stepManager, bfRemoveJunkChar, bfRemoveJunkCharDevice,lookUpTableHome);
	            commonDerivationLib.setItemDescription(currentNode,stepManager,"RTL");
	            //errors += splValidationLib.validateDuplicateAttributeValue(currentNode, "UPC", stepManager, queryHome);
	            errors += splValidationLib.validateMandatoryAttributeGroup(currentNode, stepManager,attributeGroup);
	            errors += unspscLib.validateUNSPSCReference(currentNode,stepManager);
	            //errors += retailValidationLib.validateIMEIReference(currentNode, stepManager);//CTXSCM-17234
	            errors += splValidationLib.validateCarrierDC(currentNode, stepManager, queryHome);
			   //upc validations 
			   error  = commonValidationLib.validateUPCLength(currentNode);
			   if (error){
				errors += "\n"+error;
			   }
			   error = commonValidationLib.validateUPCNumber(currentNode);
			   if (error){
				errors += "\n"+error;
			   }
			   error = commonDerivationLib.setUPC(currentNode,stepManager);
			   if (error){
				errors += "\n"+error;
			   }

	            commonDerivationLib.setUPC(currentNode,stepManager);// STIBO-3370 Prod Support Mar 15 Release, Copy UPC (Text) value to UPC(GTIN)
                 retailDerivationLib.setIMEIitemID(currentNode, stepManager);//CTXSCM-17234
                 retailDerivationLib.setRetailDefaultAttributes(currentNode); //Set Default Attribute Values
				// PP588A: 11/18/2025 Added below derivation rules for Retail items
				retailDerivationLib.setFieldOrgsAndAssignScope(currentNode); // If Market Linking is "GSM", default to "C" & "Retail All DCs"
				commonCostDerivationLib.setSubmittedDateAndStandardCost(currentNode,stepManager); // Set current date;
				commonDerivationLib.setDefaultValueIfEmpty(currentNode, "Submit_Standard_Cost", "LOV", "Y");//set Submit Standard Cost "N" by default
				currentNode.getValue("Cost_Change_Effective_As_Of").setSimpleValue(commonDerivationLib.getCurrentDate());
				
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Auto_Lot_Alpha_Prefix", "ESI_Auto_Lot_Alpha_Prefix", "Text"); // Derived Auto Lot Alpha Prefix based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Costing_Enabled", "ESI_Costing_Enabled", "LOV"); // Derived Costing Enabled based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Customer_Order_Flag", "ESI_Customer_Order_Flag", "LOV"); // Derived Customer Order Flag based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Include_in_Rollup", "ESI_Include_In_Rollup", "LOV"); // Derived Include in Rollup based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Engineered_Item_Flag", "ESI_Engineered_Item_Flag", "LOV"); // Derived Engineered Item Flag based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Internal_Order_Flag", "ESI_Internal_Order_Flag", "LOV"); // Derived Internal Order Flag based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Inventory_Asset_Value", "ESI_Inventory_Asset_Value", "LOV"); // Derived Inventory Asset Value based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Inventory_Item", "ESI_Inventory_Item", "LOV"); // Derived Inventory Item based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Inventory_Planning_Code", "ESI_Inventory_Planning_Code", "LOV"); // Derived Inventory Planning Code based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Invoiceable_Item_Flag", "ESI_Invoiceable_Item_Flag", "LOV"); // Derived Invoiceable Item Flag based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","List_Price", "ESI_List_Price", "Text"); // Derived List Price based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Lot_Control_Code", "ESI_Lot_Control_Code", "LOV"); // Derived Lot Control Code based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Match_Approval_Level", "ESI_Match_Approval_Level", "LOV"); // Derived Match Approval Level based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","MPS_MRP_Planning_Method", "ESI_MPS_MRP_Planning_Method", "LOV"); // Derived MPS MRP Planning Method based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","MRP_Safety_Stock_Code", "ESI_MRP_Safety_Stock_Code", "LOV"); // Derived MRP Safety Stock Code based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Orderable_On_Web_Flag", "ESI_Orderable_On_Web_Flag", "LOV"); // Derived Orderable On Web Flag based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Purchasing_Item_Flag", "ESI_Purchasing_Item_Flag", "LOV"); // Derived  Purchasing Item Flag based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Returnable", "ESI_Returnable_Flag", "LOV"); // Derived Returnable based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Serial_Generation", "ESI_Serial_Generation", "LOV"); // Derived Serial Generation based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Shippable", "ESI_Shippable", "LOV"); // Derived Shippable based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","OM_Transaction_Enabled", "ESI_OM_Transaction_Enabled", "LOV"); // Derived OM Transaction Enabled based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Start_Auto_Lot_Number", "ESI_Start_Auto_Lot_Number", "Text"); // Derived  based on Item Type
				
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","ATO_Forecast_Control", "ESI_ATO_Forecast_Control", "LOV"); // Derived ATO_Forecast_Control based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","ATP_Components_Flag", "ESI_ATP_Components_Flag", "LOV"); // Derived ATP_Components_Flag based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","ATP_Flag", "ESI_ATP_Flag", "LOV"); // Derived ATP_Flag based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Build_In_WIP_Flag", "ESI_Build_In_Wip_Flag", "LOV"); // Derived Build_In_WIP_Flag based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Create_Supply_Flag", "ESI_Create_Supply_Flag", "LOV"); // Derived Create_Supply_Flag based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Customer_Order_Enabled_Flag", "ESI_Customer_Order_Enabled_Flag", "LOV"); // Derived Customer_Order_Enabled_Flag based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Internal_Order_Enabled_Flag", "ESI_Internal_Order_Enabled_Flag", "LOV"); // Derived Internal_Order_Enabled_Flag based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Invoice_Enabled_Flag", "ESI_Invoice_Enabled_Flag", "LOV"); // Derived Invoice_Enabled_Flag based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","MRP_Planning_Code", "ESI_MRP_Planning_Code", "LOV"); // Derived MRP_Planning_Code on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","MTL_Transactions_Enabled_Flag", "ESI_MTL_Transactions_Enabled_Flag", "LOV"); // Derived MTL_Transactions_Enabled_Flag based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Planning_Make_Buy_Code", "ESI_Planning_Make_Buy_Code", "LOV"); // Derived ESI_Planning_Make_Buy_Code based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Preprocessing_Lead_Time", "ESI_Preprocessing_Lead_Time", "Text"); // Derived Preprocessing_Lead_Time based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Purchasing_Enabled_Flag", "ESI_Purchasing_Enabled_Flag", "LOV"); // Derived Purchasing_Enabled_Flag based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Recipe_Enabled_Flag", "ESI_Recipe_Enabled_Flag", "LOV"); // Derived Recipe_Enabled_Flag based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Rounding_Control_Type", "ESI_Rounding_Control_Type", "LOV"); // Derived Rounding_Control_Type based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Stock_Enabled_Flag", "ESI_Stock_Enabled_Flag", "LOV"); // Derived Stock_Enabled_Flag based on Item Type
				commonDerivationLib.deriveBasedOnItemType(currentNode,stepManager,"RTL","Template_Name", "RTL_Template_Name", "LOV"); // Derived Template_Name based on Item Type
				
				
				retailDerivationLib.setLineOfBusinessCat(currentNode,stepManager); // set Line Of Business Category from Source Sheet
				commonDerivationLib.setItemRequestor(currentNode,stepManager); // STIBO-2586 Set Current User when blank. Must be in lower case. 
				commonDerivationLib.setDefaultValueIfEmpty(currentNode, "Sourcing_Notify", "LOV", "Y");
				commonDerivationLib.setDefaultValueIfEmpty(currentNode, "Pack_Quantity", "Simple", "1");
				commonDerivationLib.setDefaultValueIfEmpty(currentNode, "FirstNet_Capable", "LOV", "N");
				commonDerivationLib.copyAttributeValue(currentNode,"Sales_Account_Org","Sales_Account","LOV");
				commonDerivationLib.copyAttributeValue(currentNode,"COGS_Account_Org","COGS_Account","LOV");
				commonDerivationLib.setPlanningBusinessGroup(currentNode,stepManager); //Relex Retrofit
				
				commonDerivationLib.setBatteryTechnology(currentNode, stepManager);
				retailDerivationLib.setAPCategory(currentNode, stepManager); // set AP Category for Accessory items
				retailDerivationLib.setAPSubCategory(currentNode, stepManager); // set AP SubCategory for Accessory items
				retailDerivationLib.setCPOIndicator(currentNode);
				retailDerivationLib.setThirdPartyEligible(currentNode);
				retailDerivationLib.setETFCat1(currentNode, stepManager, queryHome);
				//commonDerivationLib.setUPC(currentNode,stepManager);
				commonDerivationLib.setStatusControlledAttributesValues(currentNode,lookUpTableHome);
				commonDerivationLib.copyAttributeValue(currentNode, "Current_Standard_Cost","Requested_Standard_Cost","Simple");
				commonDerivationLib.setListPrice(currentNode);
				commonDerivationLib.setIMEIType(currentNode);
				commonDerivationLib.setIntangibleNonShippable(currentNode, stepManager);
				commonDerivationLib.setOrderableOnWebFlag(currentNode);
				commonDerivationLib.setCAManufacturerPackageWarning(currentNode);
				commonDerivationLib.setDefaultValueIfEmpty(currentNode, "Serial_Generation", "LOV", "1");
				transportationDerivationLib.setTMSItemType(currentNode);
				transportationDerivationLib.setTMSProductType(currentNode);
				transportationDerivationLib.setSerializedProduct(currentNode);
				retailDerivationLib.setAirShipmentAllowed(currentNode); // Relex Retrofit
				commonDerivationLib.setPrimaryUomCode(currentNode); // Relex Retrofit
				
				commonDerivationLib.copyAttributeValue(currentNode, "Item_Status", "Item_Status_RTL", "LOV");
				
				commonDerivationLib.setItemDescription(currentNode,stepManager,"RTL");
				commonDerivationLib.setPublishItemDescription(currentNode, stepManager);
				commonDerivationLib.setCustomerOrderFlag(currentNode);				
				retailCompanionSkuLib.createRetailCompanionSKUs(currentNode,stepManager,lookUpTableHome,query);
				itmGenLib.retailCompanionSKUitemNumberGeneration(currentNode, stepManager); //seperate function for compSKU and placed it in the library
				retailChildOrgLib.createRetailChildOrgs(currentNode, stepManager, lookUpTableHome);
				itmGenLib.childOrgItemNumberGeneration(currentNode, stepManager);//seperate function for childOrg and placed it in the library
				
				itmGenLib.setCompanionCrossReference(currentNode, stepManager);

				//UPC Generation
				if(!errors){
					try { // UPC GTIN Generation
						upcGTINLib.generateUpcGtin(currentNode, stepManager);
						} catch (e) {
							errors += itmGenLib.getMessageBetweenWords(e.toString(), "javax.script.ScriptException:", "in Library");
							//throw e.toString();
						}	
				}

			}          
            if (errors) {
				batchErrors = true;
				currentNode.getValue("SPI_Errors").setSimpleValue(errors);
			}    
			enrirchmentStateItems.push(task);     
        }
        return true;
    });
}

if(batchErrors) {
	webUi.showAlert("ERROR", "Batch is not submitted due to one or more Items are errored out. Clear the errors and resubmit.")
} else {
	enrirchmentStateItems.forEach(function(task){
		task.triggerByID("Review", "Move to Approval Pending"); // Line Number 17, makes sure that the item is in Enrichment state
	});
}

}