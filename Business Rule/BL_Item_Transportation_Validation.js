/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Item_Transportation_Validation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Validation_Libraries" ],
  "name" : "Item Transportation Validation Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ ]
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
/*
============================================================================================================
 Business Condition : BC_Transportation_Workflow_Start
 Author        : AS388G (Aditya Sreepad)
 Description   : Item Transportation Attribute Maintenance Workflow Start Pre-condition

REVISION HISTORY
=======
VERSION  DATE        AUTHOR(S)               DESCRIPTION
-------- ----------- ----------------------- ---------------------------------------------------------------
1.0      17-SEP-2025 AS388G (Aditya Sreepad)  PDH - STIBO Transition (CTXSCM-4769 TRANSPORTATION)
============================================================================================================
*/

function workflowPreValidation(node) {
	var errorFlag = false;
	var errorMessage = "";

/*
var userRoleError = commonValidationLib.validateUserRole(node, stepManager, lookUpTable);
if (userRoleError) {
	dataIssues.addError(userRoleError);
	errorFlag = true;
}
*/

if (node.getParent().getObjectType().getID() == "CancelledType") {
	errorMessage = "Cancelled Object cannot be initiated into WorkFlow";
	errorFlag = true;
}

if (node.isInWorkflow("WF_Transportation_Workflow")) {
    errorMessage = "ERROR: Item is already in Transportation Workflow.";
    errorFlag = true;
}

var itemNum = node.getValue("Item_Num").getSimpleValue();
if( !itemNum ) {
    errorMessage="Item Number is mandatory to initiate Maintenance WorkFlow";
    errorFlag = true;
}


	if (errorFlag) {
		return errorMessage;
	} else {
		return null;
	}
}



function validatePKG(node, orderingUOM){
	var errorMessage;
	//TMS_Ordering_UOM - is Mandatory & unique 
	if (!orderingUOM){
			errorMessage = "Ordering UOM is mandatory to create PKG Attributes"; 
		}
	else {
			var pItemChildren = node.getChildren().toArray();
			pItemChildren.forEach(function(pItemChildPKG) {
				 	if (pItemChildPKG.getObjectType().getID() == "Transportation_Package"){
				 		 var pkgOrderingUOM = pItemChildPKG.getValue("TMS_Ordering_UOM").getID();
						 log.info("pkgOrderingUOM :"+pkgOrderingUOM);
				 		 if  (pkgOrderingUOM ==  orderingUOM){
				 		 	 log.info('Duplicate UOM Code');
				 		 	 errorMessage= "Cannot Create PKG Attributes with duplicate Ordering UOM Code.";
							 return; // Use return to exit the forEach loop early
				 		 }
				 	}
				 });
		}	
	return errorMessage;
}


function validateHU(node, orderingUOM, handlingUnitType, handlingUnitID){
	var errorMessage;
	var pkgfound =false;
	//OrderingUOM ,HandlingUnitType & HandlingUnitID   - all three are mandatory and combination should be unique
	if (!orderingUOM || !handlingUnitType || !handlingUnitID){
			errorMessage = "Ordering UOM, Handling Unit Type and Handling Unit ID are mandatory to create PKG Attributes"; 
			log.info(errorMessage);
		}
	else {
		var pItemChildren = node.getChildren().toArray();
		pItemChildren.forEach(function(pItemChildHU) {
			//Validation to ensure PKG exists for the HU being created. 
			if (pItemChildHU.getObjectType().getID() == "Transportation_Package" 
			    && pItemChildHU.getValue("TMS_Ordering_UOM").getID() == orderingUOM
			    && !pkgfound
			    ){
				pkgfound = true;
				}
			
			if (pItemChildHU.getObjectType().getID() == "Transportation_Handling_Unit"){
				var huOrderingUOM = pItemChildHU.getValue("TMS_Ordering_UOM").getID();
				var huType = pItemChildHU.getValue("TMS_Handling_Unit_Type").getID();
				var huId = pItemChildHU.getValue("TMS_Handling_Unit_ID").getID();
				
				log.info("huOrderingUOM :"+huOrderingUOM);
				if  ( orderingUOM ==  huOrderingUOM && handlingUnitType == huType  && handlingUnitID == huId ){
					log.info('Ordering UOM ,Handling Unit Type & Handling Unit ID must be Unique for the item');
					errorMessage= "Cannot Create HU Attributes with duplicate Ordering UOM/HU Type and HU ID Combination.";
					 return errorMessage; // Use return to exit the forEach loop early
				}
			}
		});

		if (!pkgfound){
			errorMessage="Cannot Create HU item without the correspodning PKG Item for the Ordering UOM:"+orderingUOM;
			return errorMessage;
			}
	}
	
	return errorMessage;	
}


/*===== business library exports - this part will not be imported to STEP =====*/
exports.workflowPreValidation = workflowPreValidation
exports.validatePKG = validatePKG
exports.validateHU = validateHU