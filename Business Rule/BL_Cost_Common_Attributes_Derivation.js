/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Cost_Common_Attributes_Derivation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Derivation_Libraries" ],
  "name" : "Cost Common Attributes Derivation Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonDerivationLib"
  }, {
    "libraryId" : "BL_Item_Common_Validation",
    "libraryAlias" : "commonValidationLib"
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
function setSubmittedDateAndStandardCost(node, stepManager) {
	var itemClass = node.getValue("Item_Class").getID();
	var lob = node.getValue("Line_Of_Business").getID();
	if (lob == "ENT") {
		if (itemClass == "ATT DirecTV") {
			if (node.getValue("Requested_Standard_Cost").getSimpleValue()) {
				node.getValue("Submit_Standard_Cost").setLOVValueByID("N");
				node.getValue("Submitted_Date").setSimpleValue(commonDerivationLib.getCurrentDate());
			} else {
				commonDerivationLib.clearAttributeValue(node, "Submit_Standard_Cost");
			}
		}
	}
	if (lob == "RTL") {
		var isParentBOM = node.getValue("Parent_BOM").getSimpleValue();
		var itemNumber = node.getValue("Item_Num").getSimpleValue();
		var submittedStandardCost = node.getValue("Submit_Standard_Cost").getID();
		if (node.getObjectType().getID() == "Item") {
			if (isParentBOM == "Yes") {
 			     //node.getValue("Submit_Standard_Cost").setLOVValueByID("N"); 
				// Commented out, will ask User to change SSC to N, if its a Parent BOM. Added in Validation: BL_Item_Retail_Validation (validateSubmitStandardCostBOM)
 				node.getValue("Submitted_Date").setSimpleValue("");
			} else {
				if (itemNumber) {
					var requestedStandardCost = node.getValue("Requested_Standard_Cost").getSimpleValue();
					var currentStandardCost = node.getValue("Current_Standard_Cost").getSimpleValue();
					if (requestedStandardCost != currentStandardCost ){
						if(submittedStandardCost == "Y") {
						node.getValue("Submitted_Date").setSimpleValue(commonDerivationLib.getCurrentDate());
					} else {
						node.getValue("Submitted_Date").setSimpleValue("");
					}
				 }
				} else {
					if (node.getValue("Requested_Standard_Cost").getSimpleValue()){
						node.getValue("Submitted_Date").setSimpleValue(commonDerivationLib.getCurrentDate());
				}
			}
		}
	}
	}
}

function compSKUUpdateCostAttributes(node, stepManager) { //IIEP BR
	const compType = ["DEM"];
	var lob = node.getValue("Line_Of_Business").getID();
	var requestedStandardCost = node.getValue("Requested_Standard_Cost").getSimpleValue();
	var noStdCostPropogation = node.getValue("No_Std_Cost_Propagation").getID();
	var companionItemType = "";
	var submitStandardCost = node.getValue("Submit_Standard_Cost").getID();
	log.info("noStdCostPropogation  " + noStdCostPropogation);

	if (lob == "RTL") {
		companionItemType = node.getValue("Companion_Item_Type").getSimpleValue();
		log.info(companionItemType);
	}
	if (lob == "ENT") {
		companionItemType = node.getValue("Companion_Item_Type").getSimpleValue();
	}
	companionItemType = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_Companion_Item_Type_Duplicate").getListOfValuesValueByID(companionItemType).getValue();

	if ((companionItemType && compType.includes(companionItemType)) ||
		companionItemType.substring(0, 2).equals("FG") ||
		companionItemType.substring(0, 3).equals("WIP")) {
		if ((!noStdCostPropogation || noStdCostPropogation == "N") && commonDerivationLib.isAttributeValueChanged(node, stepManager, "Current_Standard_Cost") && submitStandardCost == "Y") {
			//Copy Requested Standard Cost into Current Standard Cost			
				node.getValue("Current_Standard_Cost").setSimpleValue(node.getValue("Requested_Standard_Cost").getSimpleValue());
				node.getValue("Submitted_Date").setSimpleValue(commonDerivationLib.getCurrentDate());	

		}
	}
}

function createUpdateCompSKUCostAttributes(node, stepManager) {
	
	var lob = node.getValue("Line_Of_Business").getID();
	var requestedStandardCost = node.getValue("Requested_Standard_Cost").getSimpleValue();
	var noStdCostPropogation = node.getValue("No_Std_Cost_Propagation").getID();
	var companionItemType = "";
	var submitStandardCost = node.getValue("Submit_Standard_Cost").getID();
	if ((noStdCostPropogation == "Y") && commonDerivationLib.isAttributeValueChanged(node, stepManager, "Current_Standard_Cost") && submitStandardCost == "Y") {
		//Copy Current Standard Cost into Requested Standard Cost
		node.getValue("Requested_Standard_Cost").setSimpleValue(node.getValue("Current_Standard_Cost").getSimpleValue());
		node.getValue("Submitted_Date").setSimpleValue(commonDerivationLib.getCurrentDate());
	}
}

function revertRequestedStandardCostValue(node, stepManager, lookUpTable){
	
     // RSC should be reverted to approved value, if Comp SKU type not in ( A, C, E, T, D, G, FG, WIP) and No STD Cost Propagation = N / Null	
     var noStdCostPropogation = node.getValue("No_Std_Cost_Propagation").getID();
	if(commonDerivationLib.isAttributeValueChanged(node, stepManager, "Requested_Standard_Cost") && noStdCostPropogation != "Y" ){		
		var companionItemType = node.getValue("Companion_Item_Type").getSimpleValue();			
		companionItemType = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_Companion_Item_Type_Duplicate").getListOfValuesValueByID(companionItemType).getValue();	    
	     if(companionItemType.substring(0, 2).equals("FG")){
	     	companionItemType = "FG";
	     }else if(companionItemType.substring(0, 3).equals("WIP")){
	     	companionItemType = "WIP";
	     }	    
	     var lookupResult = lookUpTable.getLookupTableValue("LT_CompanionSKU_UI_ReadOnly_Attributes", "Requested_Standard_Cost");
	     if(lookupResult){	     		     	
	     	if (lookupResult.includes(String(companionItemType))){	     		
	     		var approvedRSC = commonValidationLib.getApprovedWSAttributeValue(node, stepManager, "Requested_Standard_Cost");	     	
	     		node.getValue("Requested_Standard_Cost").setSimpleValue(approvedRSC);
	     	}
	     }
	}
}

function copyCurrentStandardCostToListPrice(node, stepManager){
	var infoMessage = "";
   // Copy CSC to LP for all users(Not for DTV Users)
	if(commonDerivationLib.isAttributeValueChanged(node, stepManager, "List_Price") ){		
		var currentStandardCost = node.getValue("Current_Standard_Cost").getSimpleValue(); 
		node.getValue("List_Price").setSimpleValue(approvedRSC);
		infoMessage = "Approved cost is copied to List Price";
	}

	return infoMessage;
}

/*===== business library exports - this part will not be imported to STEP =====*/
exports.setSubmittedDateAndStandardCost = setSubmittedDateAndStandardCost
exports.compSKUUpdateCostAttributes = compSKUUpdateCostAttributes
exports.createUpdateCompSKUCostAttributes = createUpdateCompSKUCostAttributes
exports.revertRequestedStandardCostValue = revertRequestedStandardCostValue
exports.copyCurrentStandardCostToListPrice = copyCurrentStandardCostToListPrice