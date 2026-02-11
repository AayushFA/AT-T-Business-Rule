/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Item_Common_Validation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Validation_Libraries" ],
  "name" : "Item Common Validation Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
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
function validateUserRole(node, stepManager, lookUpTable) {
	var itemClassLookupResult = "";
	var userGroups = stepManager.getCurrentUser().getGroups().toString();
	var itemTypeRTL = node.getValue("RTL_Item_Type").getID();
	var itemTypeENT = node.getValue("ENT_Item_Type").getID();
	var errorMessage = "";
	if (userGroups.contains("UG_RTL_Accessory_Planner") && itemTypeRTL) {
		itemClassLookupResult = lookUpTable.getLookupTableValue("LT_Item_Type_List", "RTL_Accessory_ItemType_List");
		if (itemClassLookupResult && !itemClassLookupResult.includes(itemTypeRTL)) {
			errorMessage = "User is not privileged to work on Items other than Accessory Types";
		}
	}
	if (userGroups.contains("UG_RTL_Device_Planner") && itemTypeRTL) {
		itemClassLookupResult = lookUpTable.getLookupTableValue("LT_Item_Type_List", "RTL_Device_ItemType_List");
		if (itemClassLookupResult && !itemClassLookupResult.includes(itemTypeRTL)) {
			errorMessage = "User is not privileged to work on Items other than Device Types";
		}
	}
	if (userGroups.contains("UG_RTL_Misc_Planner") && itemTypeRTL) {
		itemClassLookupResult = lookUpTable.getLookupTableValue("LT_Item_Type_List", "RTL_Misc_ItemType_List");
		if (itemClassLookupResult && !itemClassLookupResult.includes(itemTypeRTL)) {
			errorMessage = "User is not privileged to work on Items other than Misc. Types";
		}
	}
	if (userGroups.contains("UG_RTL_Auction") && itemTypeRTL) {
		itemClassLookupResult = lookUpTable.getLookupTableValue("LT_Item_Type_List", "RTL_Auction_ItemsType_List");
		if (itemClassLookupResult && !itemClassLookupResult.includes(itemTypeRTL)) {
			errorMessage = "User is not privileged to work on the selected Item Type";
		}
	}
	if (userGroups.contains("UG_DTV_Item_Planner") && (itemTypeRTL || itemTypeENT)) {
		itemClassLookupResult = lookUpTable.getLookupTableValue("LT_Item_Type_List", "DTV_ItemsType_List");
		if (itemClassLookupResult && !itemClassLookupResult.includes(itemTypeRTL) && !itemClassLookupResult.includes(itemTypeENT)) {
			errorMessage = "User is not privileged to work on Items other than DTV Item Types";
		}
	}
	return errorMessage;
}

function validateMandatoryAttribute(node, step, attributeId) { //tested
	var errorMessage = "";
	var attributeValue = node.getValue(attributeId).getSimpleValue();
	var attribute = step.getAttributeHome().getAttributeByID(attributeId);
	if (!attributeValue) {
		errorMessage = attribute.getName() + " is mandatory.\n";
	}
	return errorMessage;
}

function validateMandatoryAttibutesFromGroup(node, attributeGroup, stepManager) {
	var errorMessage = "";
	var attributeGroupID = stepManager.getAttributeGroupHome().getAttributeGroupByID(attributeGroup);
	if (attributeGroupID) {
		var attributeList = attributeGroupID.getAttributes().iterator();
		while (attributeList.hasNext()) {
			var attributeID = attributeList.next().getID();
			var attributeValue = node.getValue(attributeID).getSimpleValue();
			if (!attributeValue || attributeValue == "") {
				attribute = stepManager.getAttributeHome().getAttributeByID(attributeID).getName();						
				errorMessage = errorMessage + "\n" + attribute + " is mandatory"				
			}
		}
	}
	return errorMessage;
}

function validateDuplicateUserDefItemNum(node, stepManager, query) {
	var errorMessage = "";
	var currentNodeID = node.getID();
	var userDefItemNumAttrID = stepManager.getAttributeHome().getAttributeByID("User_Defined_Item_Num");
	var userDefinedItemNum = node.getValue("User_Defined_Item_Num").getSimpleValue();
	var isDupilcateItemNumPresent = false;
	if (userDefinedItemNum && userDefinedItemNum != "NA") {
		var condition = com.stibo.query.condition.Conditions;
		var querySpecification = query.queryFor(com.stibo.core.domain.Product).where(condition.valueOf(userDefItemNumAttrID).eq(userDefinedItemNum));
		var queryexe = querySpecification.execute();
		queryexe.forEach(function(result) {
			if (result.getParent().getObjectType().getID() != "CancelledType" && currentNodeID != result.getID()) {
				isDupilcateItemNumPresent = true;
			}
			return true;
		});
		if (isDupilcateItemNumPresent == true) {
			errorMessage = "You have entered duplicate Item Number";
		}
	}
	return errorMessage;
}

function validateCaProp65ChemicalCancer(node, webUIContext) {
	var errorMessage = "";
	var caProp65ToxicityType = node.getValue("CA_Prop_65_Toxicity_Type").getID();
	if (caProp65ToxicityType == "CD" || caProp65ToxicityType == "CR1" || caProp65ToxicityType == "CR2") {
		if (!node.getValue("Ca_Prop_65_Chem_Cancr").getSimpleValue()) {
			if (!node.getValue("Item_Num").getValue()) {
				errorMessage = "CA Prop 65 Chemical - Cancer is mandatory if CA Prop 65 Toxicity Type is CD, CR1 and CR2";
			} else {
				webUIContext.showAlert("Alert", "CA Prop 65 Chemical - Cancer is required if CA Prop 65 Toxicity Type is CD, CR1 and CR2.");
			}
		}
	}
	return errorMessage;
}

function validateCaProp65ChemicalReproductive(node, webUIContext) {
	var errorMessage = "";
	var caProp65ToxicityType = node.getValue("CA_Prop_65_Toxicity_Type").getID();
	var caProp65ChemCancr = node.getValue("Ca_Prop_65_Chem_Cancr").getID();
	var caProp65ChemRepro = node.getValue("Ca_Prop_65_Chem_Repro").getID();
	var itemNum = node.getValue("Item_Num").getValue();
	if (caProp65ToxicityType == "RD" || caProp65ToxicityType == "CR1" || caProp65ToxicityType == "CR2") {
		if (!caProp65ChemRepro) {
			if (!itemNum) {
				errorMessage = "CA Prop 65 Chemical - Reproductive is mandatory if CA Prop 65 Toxicity Type is CR1, CR2 and RD";
			} else {
				webUIContext.showAlert("Alert", "\n Prop 65 Chemical - Reproductive is mandatory if CA Prop 65 Toxicity Type is CR1, CR2 and RD")
			}
		}
	}
	if (caProp65ToxicityType == "CR1") {
		if (caProp65ChemCancr != caProp65ChemRepro) {
			if (!itemNum) errorMessage = "CA Prop 65 Chemical - Cancer and CA Prop 65 Chemical - Reproductive must be same if CA Prop 65 Toxicity Type id CR1";
			else webUIContext.showAlert("Alert", "\n CA Prop 65 Chemical - Cancer and CA Prop 65 Chemical - Reproductive must be same if CA Prop 65 Toxicity Type id CR1")
		}
	}
	if (caProp65ToxicityType == "CR2") {
		if (caProp65ChemCancr == caProp65ChemRepro) {
			if (!itemNum) errorMessage = "CA Prop 65 Chemical - Cancer and CA Prop 65 Chemical - Reproductive must be different if CA Prop 65 Toxicity Type id CR2";
			else webUIContext.showAlert("Alert", "\n CA Prop 65 Chemical - Cancer and CA Prop 65 Chemical - Reproductive must be different if CA Prop 65 Toxicity Type id CR2")
		}
	}
	return errorMessage;
}

function validateSourcingManager(node, stepManager, dtvUserGroup) {
	var errorMessage = "";
	var lob = node.getValue("Line_Of_Business").getID();
	var itemType = node.getParent().getID();
	sourcingManager = node.getValue("Contract_Manager").getID();
	var sourcingManagerID = "";
	if (sourcingManager && !sourcingManager.includes("@ATT.COM")) {
		sourcingManagerID = stepManager.getUserHome().getUserByID(sourcingManager);
		if (!sourcingManagerID) {
			sourcingManager = sourcingManager + "@ATT.COM";
			sourcingManagerID = stepManager.getUserHome().getUserByID(sourcingManager);
		}
	}
	if (sourcingManagerID) {
		if (lob == "WRLN" && dtvUserGroup.isMember(sourcingManagerID)) {
			errorMessage = "Please Select Non DTV Sourcing User";
		} else {
			if ((itemType == "SATELLITE" || itemType == "ENTMOB_ACC" || itemType == "ENTMOB_COL" || itemType == "ENTMOB_ELE") && !dtvUserGroup.isMember(sourcingManagerID)) {
				errorMessage = "Please Select DTV Sourcing User for DTV Item Types";
			}
			if (itemType != "SATELLITE" && itemType != "ENTMOB_ACC" && itemType != "ENTMOB_COL" && itemType != "ENTMOB_ELE" && dtvUserGroup.isMember(sourcingManagerID)) {
				errorMessage = "Please Select Non DTV Sourcing User for Non DTV Item Types";
			}
		}
	}
	return errorMessage;
}

function validateMandatoryAttributeForSerializedItem(node, stepManager, attribute, lob) {
	var errorMessage = "";
	var serializedItemsList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Serialized_Subsidy_Items").getSimpleValue();
	var userItemType = node.getValue("User_Item_Type_" + lob).getID();
	log.info(userItemType);
	var productSubType = node.getValue("Product_Sub_Type").getID();
	if (userItemType && productSubType) {
		productSubType = productSubType.toLowerCase();
		if (serializedItemsList.includes(userItemType) == true && productSubType.contains("serial")) {
			log.info("Loop 1");
			if (!productSubType.contains("non")) {
				if (!node.getValue(attribute).getLOVValue()) {
					errorMessage = stepManager.getAttributeHome().getAttributeByID(attribute).getName() + " is mandatory for serialized items";
				}
			}
		}
	}
	return errorMessage;
}

function validateCaManufacturerPackageWarning(node, lob) {
	var errorMessage = "";
	var itemClass = node.getValue("Item_Class").getID();
	if (itemClass) {
		itemClass = itemClass.toLowerCase();
		if (lob == "ENT" || (lob == "RTL" && !itemClass.contains("non att") && !itemClass.contains("collateral"))) {
			var caProp65ToxicityType = node.getValue("CA_Prop_65_Toxicity_Type").getID();
			const toxicityTypeList = ["CD", "RD", "CR1", "CR2"];
			if (caProp65ToxicityType && toxicityTypeList.includes(String(caProp65ToxicityType))) {
				var caManufacturerPackageWarning = node.getValue("CA_Manufacturer_Package_Warning").getID();
				if (caManufacturerPackageWarning == "NA") {
					errorMessage = "CA Manufacturer Package Warning should not be NA";
				}
			}
		}
	}
	return errorMessage;
}

function validateUNSPSCReference(productNode, stepManager) { //tested
	var unspscReferenceLinkType = stepManager.getLinkTypeHome().getClassificationProductLinkTypeByID("ATT_UNSPSC_Reference");
	var errorMessage = "";
	if (productNode.getClassificationProductLinks(unspscReferenceLinkType).size() == 0) {
		errorMessage = "Please add UNSPSC Reference";
	} else {
		if (productNode.getClassificationProductLinks(unspscReferenceLinkType).get(0).getClassification().getObjectType().getID() == "ATT_UNSPSC_Segment") {
			errorMessage = "UNSPSC selection must be Level 2 or lower";
		}
	}
	return errorMessage;
}

function validateAlternateAssetReferences(node, stepManager) {
	var assetRefType = stepManager.getReferenceTypeHome().getReferenceTypeByID("AlternateAssetReferences");
	var assetRefs = node.getReferences(assetRefType);
	var errorMessage = "";
	if (assetRefs.size() == 0) {
		errorMessage = "Please upload a document";
	} else {
		var isQuotePresent = false;
		for (var i = 0; i < assetRefs.size(); i++) {
			if (assetRefs.get(i).getValue("ALT_AssetType").getSimpleValue() == "Quote") {
				isQuotePresent = true;
				break;
			}
		}
		if (!isQuotePresent) {
			errorMessage = "Please select at least one Quote";
		}
	}
	return errorMessage;
}

function isItemNumberExist(node) {
	var itemNumber = node.getValue("Item_Num").getSimpleValue();
	if (itemNumber) {
		return true;
	} else {
		return false;
	}
}

function getApprovedWSAttributeValue(node, stepManager, attributeID) {
	var approvedWSAttributeValue = "";
	stepManager.executeInWorkspace("Approved", function(approvedManager) {
		var approvedWSObj = approvedManager.getObjectFromOtherManager(node);
		if (approvedWSObj && approvedWSObj.getValue(attributeID)) {
			var attributeObject = stepManager.getAttributeHome().getAttributeByID(attributeID);
			if (attributeObject.hasLOV()) {
				approvedWSAttributeValue = approvedWSObj.getValue(attributeID).getID();
			} else {
				approvedWSAttributeValue = approvedWSObj.getValue(attributeID).getSimpleValue();
			}
		}
	});
	return approvedWSAttributeValue;
}

function validateNTWBOMType(node, stepManager, attributeID) {
	var currentNTWBOMType = node.getValue(attributeID).getID();
	var apprNTWBomType = getApprovedWSAttributeValue(node, stepManager, attributeID);
	var referencedByNodes = node.getReferencedBy();
	var errorMessage = "";
	if (!referencedByNodes || referencedByNodes.size() == 0) {
		return "";
	}
	referencedByNodes.forEach(function(referencedBy) {
		var source = referencedBy.getSource();
		if (source.getObjectType().getID() == "Bill_Of_Material") {
			var pBOMChildren = source.queryChildren().asList(1000);
			if (pBOMChildren.size() > 0) {
				if (currentNTWBOMType != apprNTWBomType) {
					errorMessage = "NTW BOM Type can't be changed as PBOM already exist on this Item. Please revert to " + apprNTWBomType;
				}
			} else {
				if (!currentNTWBOMType) {
					errorMessage = "NTW BOM Type is mandatory. Please revert to " + apprNTWBomType;
				}
			}
		}
	});
	return errorMessage;
}

function validateGenerateNewUpc(node) {
	var errorMessage = "";
	var generateNewUpc = node.getValue("Generate_New_UPC").getID();
	var upc = node.getValue("UPC").getSimpleValue();
	if (!node.getValue("Item_Num").getValue() && generateNewUpc == "Y" && upc) {
		errorMessage = "UPC is not required if Generate New UPC set to Yes";
	}
	return errorMessage;
}
/**
 * @author - AW304F
 * Rule Name: Costing_Enabled_Flag
 * Added to Item Common Validation Library
 */
function validateCostingEnabled(node) {

	var errorMessage = "";
	if (node.getValue("Costing_Enabled").getID() == "N") {
		errorMessage = "Costing Enabled is set to N. Standard Cost cannot be imported.";
	}
	return errorMessage;
}
/**
 * @author - AW304F
 * Rule Name: Customer_Ordered
 * Added to Item Common Validation Library
 */
function validateCustomerOrderFlag(node) {

	var errorMessage = "";
	if (node.getValue("Customer_Order_Flag").getID() == "N") {
		errorMessage = "Customer Order Flag is set to N. Item cannot be sold to external customers.";
	}
	return errorMessage;
}
/**
 * @author - AW304F
 * Rule Name: Inventory_Item_Flag
 * Added to Item Common Validation Library
 */
function validateInventoryItem(node) {

	var errorMessage = "";
	if (node.getValue("Inventory_Item").getID() == "N") {
		errorMessage = "Inventory Item Flag is set to N. This must be set to Y if inventory transactions need to be recorded.";
	}
	return errorMessage;
}
/**
 * @author - AW304F
 * Rule Name: Purchased_Item
 * Added to Item Common Validation Library
 */
function validatePurchasingItemFlag(node) {

	var errorMessage = "";
	if (node.getValue("Purchasing_Item_Flag").getID() == "N") {
		errorMessage = "Purchased Item Flag is set to N. Item cannot be placed on a PO.";
	}
	return errorMessage;
}
/**
 * @author - AW304F
 * Rule Name: Shippable_Item
 * Added to Item Common Validation Library
 */
function validateShippable(node) {

	var errorMessage = "";
	if (node.getValue("Shippable").getID() == "N") {
		errorMessage = "Shippable is set to N. Item cannot be shipped.";
	}
	return errorMessage;
}
/**
 * @author - John
 * Rule Name: Submit Std Cost for BOM_No
 */
function validateSubmitStandardCost(node, stepManager) {

	var errorMessage = "";
	var bomExist = false;
	var itemNumber = node.getValue('Item_Num').getSimpleValue();
	var parentBOM = stepManager.getNodeHome().getObjectByKey("BOM.Parent.Key", itemNumber);
	var childBOM = stepManager.getNodeHome().getObjectByKey("Child.BOM.Key", itemNumber);
	var subsitituteBOM = stepManager.getNodeHome().getObjectByKey("Substitute.BOM.Key", itemNumber);
	var submitStandardCost = node.getValue("Submit_Standard_Cost").getID();
	var referenceTypeIDs = ["BOM_Parent", "BOM_Child", "BOM_Child_Substitute"];
	referenceTypeIDs.forEach(function(refTypeID) {
		var referenceType = stepManager.getReferenceTypeHome().getReferenceTypeByID(refTypeID);		
		node.queryReferencedBy(referenceType).forEach(function(reference) {					
				bomExist = true;
				return true;
			}
		);
	});
	if (itemNumber && bomExist && submitStandardCost == "Y") {
		errorMessage = "You can not submit the cost if bom exists, rollup cost will be calculated from BOM components. Please set the Submit Standard Cost to No before saving the record.";
	}
	return errorMessage;
}

function validateCostAttributes(node, stepManager) { // used only in Maintenance WF
	var errorMessage = "";
	var lob = node.getValue("Line_Of_Business").getID();
	var currentCost = node.getValue("Requested_Standard_Cost").getSimpleValue();
	var changeReason = node.getValue("Change_Reason").getSimpleValue();
	var currentStandardCost = node.getValue("Current_Standard_Cost").getSimpleValue();
	var submitStandardCost = node.getValue("Submit_Standard_Cost").getID();
	var itemNumber = node.getValue("Item_Num").getSimpleValue();
	var approvedCost = "";	
	approvedCost = commonDerivationLib.isAttributeValueChanged(node, stepManager, "Requested_Standard_Cost");		
	if (lob == "RTL" || lob == "ENT") {				
		if (itemNumber && currentCost && approvedCost && !changeReason) {			
			errorMessage = "Please enter the Change Reason for Standard Cost updates";
		}		
		//Syed - Added the rule to display warning message during Item Maintenance
		/*if (itemNumber && approvedCost && (submitStandardCost == "N" || !submitStandardCost)) {
			errorMessage = ("Requested Standard Cost is not same as Current Standard Cost. Please change the Submit Standard Cost flag to Y, for Cost Approval.");
		}*/
	}
	return errorMessage;
}

function cancelReason(node) {
	var returnReason = node.getValue("Item_Cancel_Reason").getSimpleValue();
	var errorMessage = "";
	if (!returnReason) {
		errorMessage = "Please provide the Cancel reason in attribute Item Cancel Reason";
	}
	return errorMessage;
}

/**
 * @author - AW304F
 * Rule Name: Item Level Filter for DaaS (Relex)
 * Relex Retrofitting
 */

function relexDaasItemLevelFilter(node) {

    if (node.getValue("Item_Num").getSimpleValue() && node.getValue("Organization_Code").getSimpleValue()) {
        return true;
    } else {
        return false;
    }
}

/**
 * @author - AW304F
 * Rule Name: Child Org Item Level Filter for DaaS (Relex)
 * Relex Retrofitting
 */


function relexDaasChildOrgItemLevelFilter(node) {

    var parent = node.getParent();

    if (parent.getValue("Item_Num").getSimpleValue() && parent.getValue("Organization_Code").getSimpleValue() &&
        node.getValue("Item_Num").getSimpleValue() && node.getValue("Organization_Code").getSimpleValue()) {
        return true;
    } else {
        return false;
    }

}

function validateUPCLength(node) {
var errorMessage = "";
	var upc = node.getValue("UPC").getSimpleValue();
	if (upc && String(upc).length !== 12) {
        errorMessage = "UPC must be 12 digits.";
	}
	return errorMessage;
}

function validateUPCNumber(node) {
var errorMessage = "";
	var upc = node.getValue("UPC").getSimpleValue();
	const onlyNumber = /^([0-9 -]+)$/;
	if (upc && !onlyNumber.test(upc)) { 
		errorMessage = "Only Numbers are allowed in UPC Field";
	}
	return errorMessage;
}

/*===== business library exports - this part will not be imported to STEP =====*/
exports.validateUserRole = validateUserRole
exports.validateMandatoryAttribute = validateMandatoryAttribute
exports.validateMandatoryAttibutesFromGroup = validateMandatoryAttibutesFromGroup
exports.validateDuplicateUserDefItemNum = validateDuplicateUserDefItemNum
exports.validateCaProp65ChemicalCancer = validateCaProp65ChemicalCancer
exports.validateCaProp65ChemicalReproductive = validateCaProp65ChemicalReproductive
exports.validateSourcingManager = validateSourcingManager
exports.validateMandatoryAttributeForSerializedItem = validateMandatoryAttributeForSerializedItem
exports.validateCaManufacturerPackageWarning = validateCaManufacturerPackageWarning
exports.validateUNSPSCReference = validateUNSPSCReference
exports.validateAlternateAssetReferences = validateAlternateAssetReferences
exports.isItemNumberExist = isItemNumberExist
exports.getApprovedWSAttributeValue = getApprovedWSAttributeValue
exports.validateNTWBOMType = validateNTWBOMType
exports.validateGenerateNewUpc = validateGenerateNewUpc
exports.validateCostingEnabled = validateCostingEnabled
exports.validateCustomerOrderFlag = validateCustomerOrderFlag
exports.validateInventoryItem = validateInventoryItem
exports.validatePurchasingItemFlag = validatePurchasingItemFlag
exports.validateShippable = validateShippable
exports.validateSubmitStandardCost = validateSubmitStandardCost
exports.validateCostAttributes = validateCostAttributes
exports.cancelReason = cancelReason
exports.relexDaasItemLevelFilter = relexDaasItemLevelFilter
exports.relexDaasChildOrgItemLevelFilter = relexDaasChildOrgItemLevelFilter
exports.validateUPCLength = validateUPCLength
exports.validateUPCNumber = validateUPCNumber