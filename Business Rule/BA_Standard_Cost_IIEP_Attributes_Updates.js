/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Standard_Cost_IIEP_Attributes_Updates",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Integration_Actions" ],
  "name" : "Oracle Standard Cost IIEP Attributes Updates",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Companion_SKU", "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonLib"
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,log,commonLib) {
/**
 * @author - John
 *  Update Cost Attributes in IIEP
 */ 

updateCostAttributes(node); 
updateCompSkUsCostAttributes(node, stepManager); 

/////////////// Functions ///////////////////////

function updateCompSkUsCostAttributes(node, stepManager) {

	if (node.getObjectType().getID() == "Item") {
		var item = node.queryChildren();
		var lob = node.getValue("Line_Of_Business").getID();
		item.forEach(function(Child) {
			if (Child.getObjectType().getID() == "Companion_SKU") {	
				var companionItemType = "";
				if(lob == "RTL"){
					companionItemType = Child.getValue("Companion_Item_Type").getSimpleValue();
				}else if(lob == "ENT"){
					companionItemType = Child.getValue("ENT_Companion_Item_Type").getSimpleValue();
				}							
				companionItemType = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_Companion_Item_Type_Duplicate").getListOfValuesValueByID(companionItemType).getValue();				
				var compEntity = "";				
				if (companionItemType.substring(0, 2).equals("FG")) {
					compEntity = stepManager.getEntityHome().getEntityByID("FG");
				} else if (companionItemType.substring(0, 3).equals("WIP")) {
					compEntity = stepManager.getEntityHome().getEntityByID("WIP");
				} else {
					compEntity = stepManager.getEntityHome().getEntityByID(companionItemType);
				}					
				setCompSkuCostAttributes(node, stepManager, Child, compEntity);			
			}
			return true;
		});
	}
}

function setCompSkuCostAttributes(node, stepManager, compSKU, compEntity) {

	var compEntityStandardCost = compEntity.getValue("CompSKU_StandardCost").getSimpleValue();
	var compEntityListPrice = compEntity.getValue("CompSKU_ListPrice").getSimpleValue();
	var compEntityRuleType = compEntity.getValue("CompSKU_Create_Update_Rule").getSimpleValue();
	var noStdCostPropagation = compSKU.getValue("No_Std_Cost_Propagation").getID();
	var pItemRequestedStandardCost = node.getValue("Requested_Standard_Cost").getSimpleValue();
	var pItemListPrice = node.getValue("List_Price").getSimpleValue();	
	if (compEntityRuleType == "CREATE_UPDATE" && noStdCostPropagation != "Y") {		
		var requestedStandardCost = pItemRequestedStandardCost * ((compEntityStandardCost) / 100);
		requestedStandardCost = requestedStandardCost.toFixed(4) * 1;		
		compSKU.getValue("Requested_Standard_Cost").setSimpleValue(requestedStandardCost);
          compSKU.getValue("Current_Standard_Cost").setSimpleValue(requestedStandardCost);
          compSKU.getValue("Submit_Standard_Cost").setLOVValueByID("Y");
	}
	var listPrice = pItemListPrice * ((compEntityListPrice) / 100);
	listPrice = listPrice.toFixed(4) * 1;
	compSKU.getValue("List_Price").setSimpleValue(listPrice);
	var attributeList = ['List_Price', 'Requested_Standard_Cost', 'Current_Standard_Cost', 'Submit_Standard_Cost'];
     commonLib.partialApproveFields(compSKU, attributeList);
}


function updateCostAttributes(node) {

	// If Oracle_Authorization_Status = "APPROVED" or NULL, then copy Current_Standard_Cost into List_Price.
	// If Oracle_Authorization_Status = "REJECTED", then copy Current_Standard_Cost into Requested_Standard_Cost, if RSC != CSC. 
	var oracleAuthorizationStatus = node.getValue("Oracle_Authorization_Status").getSimpleValue();
	var currentStandardCost = node.getValue("Current_Standard_Cost").getSimpleValue();
	var requestedStandardCost = node.getValue("Requested_Standard_Cost").getSimpleValue();	
	if (!oracleAuthorizationStatus || oracleAuthorizationStatus == "APPROVED") {		
		node.getValue("List_Price").setSimpleValue(currentStandardCost);
		// Looping throgh ChilgOrgs for Parent Node
		updateChildOrgAttributes(node, "List_Price", currentStandardCost); 
		updateChildOrgAttributes(node, "Current_Standard_Cost", currentStandardCost); 
		updateChildOrgAttributes(node, "Requested_Standard_Cost", currentStandardCost); 
		// Looping throgh CompSKUs
		updateCompSKUAttributes(node,oracleAuthorizationStatus);		
	} else if (oracleAuthorizationStatus == "REJECTED" && currentStandardCost != requestedStandardCost) {
		node.getValue("Requested_Standard_Cost").setSimpleValue(currentStandardCost);
		// Looping throgh ChilgOrgs for Parent Node
		updateChildOrgAttributes(node, "Requested_Standard_Cost", currentStandardCost);
	}else if(oracleAuthorizationStatus == "REJECTED"){
		// Looping throgh CompSKUs
		updateCompSKUAttributes(node,oracleAuthorizationStatus);
	}
	// If Comp item is a buyback item, set MarketPrice to be same as marketPriceFromEBS
	if (node.getObjectType().getID() == "Companion_SKU") {
		const companionBuyBackItemsList = ["A - Buy Back Best Grade", "C - Buy Back Better Grade", "E - Buy Back Good Grade"];
		var companionItemType = node.getValue("Companion_Item_Type").getSimpleValue();		
		if (companionBuyBackItemsList.includes(String(companionItemType))){
			var marketPriceFromEBS = node.getValue("Market_Price_From_Oracle").getSimpleValue();  
			if(marketPriceFromEBS){
				node.getValue("Market_Price").setSimpleValue(marketPriceFromEBS);				
			}
		}		
	}
}

function updateChildOrgAttributes(node, attributeID, attributeValue){

	var objectType = node.getObjectType().getID();
	if(objectType == "Item" || objectType == "Companion_SKU"){		
		node.queryChildren().forEach(function(childOrg) {
			if (childOrg.getObjectType().getID() == "Child_Org_Item") {					
				childOrg.getValue(attributeID).setSimpleValue(attributeValue);				
				var attributeIDList = [attributeID];
                   commonLib.partialApproveFields(childOrg, attributeIDList);						
			}
			return true;
		});		
	}	
}

function updateCompSKUAttributes(node, oracleAuthorizationStatus) {
  
   var objectType = node.getObjectType().getID();
   if (objectType == "Item") {
      node.queryChildren().forEach(function (compSKU) {
         if (compSKU.getObjectType().getID() == "Companion_SKU") {
         var compSkuCSC = compSKU.getValue("Current_Standard_Cost").getSimpleValue();
            if (oracleAuthorizationStatus == "APPROVED" && compSKU.getValue("No_Std_Cost_Propagation").getID() != "Y") {            	
               var compSkuRSC = compSKU.getValue("Requested_Standard_Cost").getSimpleValue();
               compSKU.getValue("Current_Standard_Cost").setSimpleValue(compSkuRSC);
               compSKU.getValue("List_Price").setSimpleValue(compSkuRSC);
               var attributeIDList = ["Current_Standard_Cost", "List_Price"];
               commonLib.partialApproveFields(compSKU, attributeIDList);
               updateChildOrgAttributes(compSKU, "List_Price", compSkuRSC);
               updateChildOrgAttributes(compSKU, "Requested_Standard_Cost", compSkuRSC);
               updateChildOrgAttributes(compSKU, "Current_Standard_Cost", compSkuRSC);
            } else if (oracleAuthorizationStatus == "REJECTED" && compSKU.getValue("No_Std_Cost_Propagation").getID() != "Y") {                		    	             
               compSKU.getValue("Requested_Standard_Cost").setSimpleValue(compSkuCSC);
               var attributeIDList = ["Requested_Standard_Cost"];
               commonLib.partialApproveFields(compSKU, attributeIDList);               
               updateChildOrgAttributes(compSKU, "Requested_Standard_Cost", compSkuCSC);
            }
         }
         return true;
      });
   }
}

}