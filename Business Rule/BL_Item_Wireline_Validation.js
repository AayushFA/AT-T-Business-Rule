/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Item_Wireline_Validation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Validation_Libraries" ],
  "name" : "Item Wireline Validation Library",
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
function validateMaterialItemTypeAndBusinessGroup(node) {
	var errorMessage = "";
	if (!node.getValue("Material_Item_Type_Web").getID() || !node.getValue("Business_Group").getID()) {
		errorMessage = "Material Item Type and Business Group is mandatory for Item Creation.";
	}
	return errorMessage;
}

function validateWirelineContractManager(node, stepManager, ug_dtv) {
	var lineOfBusiness = node.getValue("Line_Of_Business").getID();
	var itemType = node.getParent().getID();
	var contractManagerId = node.getValue("Contract_Manager").getID();
	var resolvedManagerId = "";
	var errorMessage = "";
	if (contractManagerId && !contractManagerId.includes("@ATT.COM")) {
		resolvedManagerId = stepManager.getUserHome().getUserByID(contractManagerId);
		if (!resolvedManagerId) {
			contractManagerId += "@ATT.COM";
			resolvedManagerId = stepManager.getUserHome().getUserByID(contractManagerId);
		}
	}
	if (resolvedManagerId) {
		log.info(itemType + ug_dtv.isMember(resolvedManagerId))
		var isDtvMember = ug_dtv.isMember(resolvedManagerId);
		const dtvTypes = ["SATELLITE", "ENTMOB_ACC", "ENTMOB_COL", "ENTMOB_ELE"];
		var contractManagerAttr = stepManager.getAttributeHome().getAttributeByID("Contract_Manager");
		if (lineOfBusiness == "WRLN" && isDtvMember) {
			errorMessage = "Please Select Non DTV Sourcing User";
		} else if (dtvTypes.includes(String(itemType)) && !isDtvMember) {
			errorMessage = "Please Select DTV Sourcing User for DTV Item Types";
		} else if (!dtvTypes.includes(String(itemType)) && isDtvMember) {
			errorMessage = "Please Select Non DTV Sourcing User for Non DTV Item Types";
		}
	}
	return errorMessage;
}

function validateNonCatsMicCode(node) {
	var errorMessage = '';
	var nonCatsMicCode = node.getValue("Non_CATS_MIC_Code").getID();
	var patternAccount = node.getValue("Pattern_Account_WRLN").getID();
	const patternAccountList = ["P3", "P4", "P5", "P9", "T4"];
	// Only check if patternAccount is defined and is in the required list
	if (patternAccount && patternAccountList.includes(String(patternAccount))&& !nonCatsMicCode) {
		errorMessage += "Non Cats MIC Code is mandatory if Pattern Account is "+ patternAccount+ ".\n";
	}
	// @author - Anudeep, Rule Name: Validate_NonCATSMICCode
	var capitalTool = node.getValue("Capital_Tool").getID();
	if (capitalTool == "Y" && !nonCatsMicCode) {
		errorMessage += "Non CATS MIC Code cannot be NULL if Capical Tool is Y.";
	}
	return errorMessage;
}

function validateORMDClass(node) {
	var errorMessage = '';
	var safetyIndicatorId = node.getValue("Safety_Indicator").getID();
	var ormdClass = node.getValue("ORMD_Class").getID();
	if (safetyIndicatorId && safetyIndicatorId == "O") {
		if (!ormdClass) {
			errorMessage = "ORMD Class is Mandatory if Safety Indicator is ORMD";
		}
	}
	return errorMessage;
}

function validateRegions(node) {
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	var regions = node.getValue("Region_Distribution_Center").getSimpleValue();
	var errorMessage = '';
	const exemptTypes = ['Minor Material', 'Cable'];
	if (!commonValidationLib.isItemNumberExist(node)) {
		if ((!regions) && !exemptTypes.includes(String(materialItemType))) {
			errorMessage = "Please enter the Region Distribution Centers";
		}
	}
	return errorMessage;
}

function validateContractManager(node) {
	var errorMessage = '';
	var contractManager = node.getValue("Contract_Manager").getID();
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	if (!commonValidationLib.isItemNumberExist(node) && !contractManager && materialItemType == "Plug-In") {
		errorMessage = "Please enter the Contract Manager";
	}
	return errorMessage;
}

function validateMICCOE(node) {
	// Safely grab the IDs (avoid exceptions if getValue returns null/undefined)
	var businessGroupID = node.getValue("Business_Group").getID();
	var micCoeID = node.getValue("MIC_COE_WRLN").getID();
	var errorMessage = '';
	// If DBOSS items don’t have a MIC COE selected, return the error
	if (businessGroupID == "DBOSS" && !micCoeID) {
		errorMessage = "Please select MIC COE for DTV Items";
	}
	return errorMessage;
}

function validateDbossTrackingQuantity(node) {
	var businessGroup = node.getValue("Business_Group").getID();
	var errorMessage = "";
	var businessGroup = node.getValue("Business_Group").getID();
	var micCoeWrlCode = node.getValue("MIC_COE_WRLN").getID();
	var dbossTrackValue = node.getValue("Dboss_Track_by_Qty").getID();
	if ((micCoeWrlCode && micCoeWrlCode.startsWith("SAT")) || businessGroup == "DBOSS") {
		if (!dbossTrackValue) {
			errorMessage = "Dboss Track by Qty is required for DTV Items";
		}
	}
	return errorMessage;
}

function validateWttFinancialTrackable(node) {
	var errorMessage = '';
	var businessGrp = node.getValue("Business_Group").getID();
	var wttFinancialTrackable = node.getValue("WTT_Financially_Trackable").getID();
	if (businessGrp == "DBOSS" && !wttFinancialTrackable) {
		errorMessage = "DBOSS WTT Financially Trackable is required for DTV Items";
	}
	return errorMessage;
}

function validateWirelineItemStatus(node) {
	var errorMessage = "";
	var materialItemType = node.getValue("Material_Item_Type_Web").getSimpleValue();
	var restrictedTypes = ["Major Material XPID LE", "RTU Capital", "RTU Expense", "Catalog Expense", "Hardwired", "Toolsets"];
	if (materialItemType && restrictedTypes.includes(String(materialItemType))) {
		var itemStatus = node.getValue("Item_Status_WRLN").getID();
		var itemStatusList = ["Active S", "Phase S", "Obs S"];
		if (itemStatus && itemStatusList.includes(String(itemStatus))) {
			errorMessage = "Item Status cannot be Stocked for the selected Material Item Type";
		}
	}
	return errorMessage;
}

function validatePlannerATTUID(node) {
	var warningMessage = '';
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	var plannerAttUID = node.getValue("PLANNER_ATTUID").getID();
	if ((materialItemType == "Cable" || materialItemType =="Plug-In") &&(!plannerAttUID)) {
		warningMessage = "Planner ATTUID is Mandatory if Material Item Type is Plug-In or Cable";
	}
	return warningMessage;
}

function validateMinMaxPack(node) {
	var errorMessage = '';
	if (parseInt(node.getValue("Min_Max_Qty_Maximum").getSimpleValue()) < parseInt(node.getValue("Stock_STD_Pack").getSimpleValue())) {
		errorMessage = "Min Max Quantity should be greater than STD Pack";
	}
	return errorMessage;
}

function validateStockPackRequirements(node) {
	// Fetch IDs and values
	var itemType = node.getValue("Material_Item_Type_Web").getID();
	var itemStatus = node.getValue("Item_Status_WRLN").getID();
	var organization = node.getValue("Organization_Code").getID();
	var maxQty = node.getValue("Min_Max_Qty_Maximum").getSimpleValue();
	var stdPackQty = node.getValue("Stock_STD_Pack").getSimpleValue();
	// Only validate stocked minor materials or cables in Active S status
	var validTypes = ["Minor Material", "Cable"];
	var validOrgs = ["MW1", "SW1", "WE2", "WE3"];
	var errorMessage = [];
	if (itemType && itemStatus) {
		itemType = itemType + "";
		if (validTypes.includes(itemType) || itemStatus == "Active S") {
			organization = organization + "";
			// Only for specific organizations
			if (validOrgs.includes(organization)) {
				if (!maxQty || maxQty == "0") {
					errorMessage.push("Min Max Qty Maximum is required for stocked Minor Material or Cable items.");
				}
				if (!stdPackQty || stdPackQty == "0") {
					errorMessage.push("Stock STD Pack is required for stocked Minor Material or Cable items.");
				}
			}
			// Join multiple errors, or return empty string if none
			return errorMessage.join('\n').toString();
		}
	}
}

function validateMinMaxComparison(node) {
	var errorMessage = '';
	if (parseInt(node.getValue("Min_Max_Qty_Maximum").getSimpleValue()) > 0) {
		if (parseInt(node.getValue("Min_Max_Qty_Maximum").getSimpleValue()) < parseInt(node.getValue("Min_Max_Qty_Minimum").getSimpleValue())) {
			errorMessage = "Min Max Qty Maximum should not be less than Min Max Qty Minimum";
		}
	}
	return errorMessage;
}

function validateConsignInd(node) {
	var errorMessages = [];
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	var consignmentIndicator = node.getValue("Consignment").getID();
	var itemStatus = node.getValue("Item_Status_WRLN").getID();
	if (materialItemType && consignmentIndicator && materialItemType == "Plug-In" && consignmentIndicator == "1") {
		errorMessages.push("Plug-In Item cannot be Consigned.");
	}
	if (materialItemType !== "Plug-In" && itemStatus != "Active S" && consignmentIndicator == "1") {
		errorMessages.push("Only Active Stocked Item can be Consigned.");
	}
	return errorMessages.join('\n').toString();
}

function validateDuplicateManufacturingPartNumber(node, stepManager, query) {
	var errorMessage = "";
	var currentNodeID = node.getID();
	var mfgPartNoAttribute = stepManager.getAttributeHome().getAttributeByID("Mfg_Part_No");
	var businessGroupAttribute = stepManager.getAttributeHome().getAttributeByID("Business_Group");
	var mfgPartNumber = node.getValue("Mfg_Part_No").getSimpleValue();
	var currentBusinessGroup = node.getValue("Business_Group").getID();
	var heciValue = node.getValue("HECI").getSimpleValue();
	if (mfgPartNumber && currentBusinessGroup == "NONE" && !heciValue) {
		var Conditions = com.stibo.query.condition.Conditions;
		var querySpec = query.queryFor(com.stibo.core.domain.Product).where(Conditions.valueOf(mfgPartNoAttribute).eq(mfgPartNumber).and(Conditions.valueOf(businessGroupAttribute).eq("Wireline")));
		var resultSet = querySpec.execute();
		var matchingProducts = new java.util.ArrayList();
		var hasDuplicate = false;
		resultSet.forEach(function(result) {
			matchingProducts.add(result);
			return true;
		});
		for (var i = 0; i < matchingProducts.size(); i++) {
			var product = matchingProducts.get(i);
			var productObjectType = product.getParent().getObjectType().getID();
			var productID = product.getID();
			if (productObjectType != "CancelledType" && productID != currentNodeID) {
				hasDuplicate = true;
				break;
			}
		}
		if (hasDuplicate) {
			var duplicateDetails = node.getValue("Duplicate_MPN_Details").getSimpleValue();
			var duplicateReason = node.getValue("Duplicate_MPN_Reason").getSimpleValue();
			if (!duplicateDetails || !duplicateReason) {
				errorMessage = "Duplicate MSN Details and Duplicate Reason are mandatory when Mfg Part No is duplicate.";
			}
		}
	}
	return errorMessage;
}

function validateUOM(node) {
	var errorMessage = '';
	var primaryUomId = node.getValue("Primary_UOM_ValidList").getID();
	if (!primaryUomId) {
		errorMessage = "Primary UOM is Mandatory";
	}
	return errorMessage;
}

// Refactored for CTXSCM-13607 -- mb916k & mr952y
function validateBOMType(node, stepManager) {
    var errorMessage = "";
    var materialItemType = node.getValue("Material_Item_Type_Web").getID();
    var bomType = node.getValue("NTW_BOM_Type_WRLN").getID();
    var entityObject = stepManager.getEntityHome().getEntityByID("ItemAttributes_Hierarchy");
    var bomMappingJson = entityObject.getValue("Active_BOM_Type_Mapping").getSimpleValue();
    var bomRules = JSON.parse(bomMappingJson);
    if (materialItemType == "Major Material XPID LE" && !bomType) {
        errorMessage = "NTW BOM Type is mandatory if Material Item Type is Major Material XPID LE";
    }
    if (bomType && bomRules[bomType] && !bomRules[bomType].includes(String(materialItemType))) {
        errorMessage = "BOM of type " + bomType + " is applicable only for " + bomRules[bomType].join(", ")+".";
    }

    return errorMessage;
}

function validateMSTItemStatus(node) {
	var errorMessage = "";
	if (node.getObjectType().getID() == "Item") {
		var itemStatus = String(node.getValue("Item_Status_WRLN").getSimpleValue());
		var restrictedStatuses = ["Obs NS", "Replaced"];
		var activeChildStatuses = ["Active S", "Active NS", "Phase NS"];
		if (restrictedStatuses.includes(itemStatus)) {
			var children = node.queryChildren();
			var hasActiveChild = false;
			children.forEach(function(child) {
				if (child.getObjectType().getID() == "Child_Org_Item") {
					var childStatus = String(child.getValue("Item_Status_WRLN").getSimpleValue());
					if (activeChildStatuses.includes(childStatus)) {
						hasActiveChild = true;
					}
				}
				return true;
			});
			if (hasActiveChild) {
				errorMessage = "Item status can't change to Obs NS or Replaced if any child org is in Active S or Active NS, Phase NS";
			}
		}
	}
	return errorMessage;
}

function validateOEMFullName(node) {
	var errorMessage = "";
	var heciList = node.getDataContainerByTypeID("DC_HECI").getDataContainers().toArray();
	heciList.forEach(function(dc) {
		var heciObj = dc.getDataContainerObject();
		if (heciObj.getValue("HECI_User_Selection").getSimpleValue() == "Yes") {
			var heciOEM = heciObj.getValue("HECI_Manufacturer_Name").getSimpleValue();
			var oemFullName = node.getValue("OEM_Full_Name").getSimpleValue();
			if (oemFullName != heciOEM) {
				errorMessage = "OEM Full Name cannot be changed for HECI Items.";
			}
		}
	});
	return errorMessage;
}

function validateMfgPartNumber(node) {
	var errorMessage = "";
	var heciList = node.getDataContainerByTypeID("DC_HECI").getDataContainers().toArray();
	heciList.forEach(function(dc) {
		var heciObj = dc.getDataContainerObject();
		if (heciObj.getValue("HECI_User_Selection").getSimpleValue() == "Yes") {
			var heciMFG = heciObj.getValue("HECI_Manufacturer_Part").getSimpleValue();
			var mfgPartNo = node.getValue("Mfg_Part_No").getSimpleValue();
			if (mfgPartNo != heciMFG) {
				errorMessage ="MFG Part No cannot be changed for HECI Items.";
			}
		}
	});
	return errorMessage;
}

function validateChildBOMItemStatus(node, bomParentRef) {
	//Not allow to set Child BOM Item Status to “Obs NS” or “Replaced” status when the parent BOM is in an “Active” status
	var errorMessage = '';
	var itemStatus = node.getValue("Item_Status_WRLN").getID();
	var itemStatusList = ["Obs NS", "Replaced"];
	var pBOMItemStatusList = ["Obs NS", "Replaced"];
	if (itemStatus) {
		if (itemStatusList.includes(String(itemStatus))) {
			var getReferencedBy = node.getReferencedBy();
			if (getReferencedBy.size() > 0) {
				getReferencedBy.forEach(function(referencedBy) {
					if (referencedBy.getSource().getObjectType().getID() == "BOM_Child") {
						var pBOM = referencedBy.getSource().getParent()
						var pBOMRef = pBOM.getReferences(bomParentRef)
						if (pBOMRef.size() > 0) {
							var pBOMItem = pBOMRef.get(0).getTarget();
							var pBOMItemStatus = pBOMItem.getValue("Item_Status_WRLN").getID();
							if (pBOMItemStatusList.includes(String(pBOMItemStatus))) {
								errorMessage = "Cannot change BOM component status. The parent BOM is currently active";
							}
						}
					}
				});
			}
		}
	}
	return errorMessage;
}

function getRegionStatusConfigs() {
	return [{
		region: "Alascom",
		statusField: "AK1_Item_Status",
		message: "Please select Alascom (AK1) Item Status"
	}, {
		region: "Midwest",
		statusField: "MW1_Item_Status",
		message: "Please select Midwest (MW1) Item Status"
	}, {
		region: "Reno - West",
		statusField: "WE2_Item_Status",
		message: "Please select Reno – West (WE2) Item Status"
	}, {
		region: "SanLeandro - West",
		statusField: "WE3_Item_Status",
		message: "Please select SanLeandro – West (WE3) Item Status"
	}, {
		region: "Southeast",
		statusField: "SE2_Item_Status",
		message: "Please select Southeast (SE2) Item Status"
	}, {
		region: "Southwest",
		statusField: "SW1_Item_Status",
		message: "Please select Southwest (SW1) Item Status"
	}];
}

function validateRegionStatus(node, region, statusField, message) {
	var materialItemType = node.getValue("Material_Item_Type_Web").getSimpleValue();
	var regions = node.getValue("Region_Distribution_Center").getSimpleValue();
	var errorMessage = "";
	if (regions && materialItemType) {
		if ((materialItemType == "Minor Material" || materialItemType == "Cable") && (regions.includes(String(region)) || regions.includes(String("All Regions")) || regions.includes(String("Zoom Form Only - Services"))) && !node.getValue(statusField).getSimpleValue()) {
			errorMessage = message;
		}
	}
	return errorMessage;
}
/**
 * @author - Anudeep
 * Rule Name: Customer_Ordered_Must_Be_Y , Internal_Ordered_Must_Be_Y
 */
function validateOrderFlag(node, attributeId, stepManager) {
	var attributeValue = node.getValue(attributeId).getID();
	var itemStatus = node.getValue("Item_Status_WRLN").getID();
	var attribute = stepManager.getAttributeHome().getAttributeByID(attributeId);
	var errorMessage = "";
	if ((itemStatus == "Active NS" || itemStatus == "Active S") && attributeValue != "Y") {
		errorMessage = attribute.getName() + " should be Y, if Item Status is Active S or Active NS.";
	}
	return errorMessage;
}
/**
 * @author - Anudeep
 * Rule Name: Validate_Planning_Route
 */
function validatePlanningRoute(node){
	var planningRoute = node.getValue("Planning_Route").getSimpleValue();
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	var itemStatus = node.getValue("Item_Status_WRLN").getID();
	const itemTypeList = ["Cable","Minor Material","Plug-In"];
	var errorMessage ="";
	if (itemTypeList.includes(String(materialItemType)) && itemStatus == "Active S" && !planningRoute){
		errorMessage = "Planning Route cannot be NULL for Stocked Items.";
	}
	return errorMessage;
}

/**
 * @author - John
 * Rule Name: Show error message when invalid item status is selected
 */
function validateESIAttributesValues(node, wirelineESILookupTable){
	
	var errorMessage ="";
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	var itemStatus = node.getValue("Item_Status_WRLN").getID();		
	if (materialItemType && itemStatus) {
		var wrlnLookupResult = wirelineESILookupTable.getLookupTableValue("LT_Wireline_ESI_Attributes", materialItemType + "|" + itemStatus);		
		if (!wrlnLookupResult) {
			errorMessage = "Please select the right Item status for the Material Item Type " + materialItemType + " to derive ESI Attributes"
		}
	}else if(!itemStatus){
		errorMessage = "Item Status is Mandatory.";
	}else if(!materialItemType){
		errorMessage = "Material Item Type is Mandatory.";
	}
		
	return errorMessage;
}


/*===== business library exports - this part will not be imported to STEP =====*/
exports.validateMaterialItemTypeAndBusinessGroup = validateMaterialItemTypeAndBusinessGroup
exports.validateWirelineContractManager = validateWirelineContractManager
exports.validateNonCatsMicCode = validateNonCatsMicCode
exports.validateORMDClass = validateORMDClass
exports.validateRegions = validateRegions
exports.validateContractManager = validateContractManager
exports.validateMICCOE = validateMICCOE
exports.validateDbossTrackingQuantity = validateDbossTrackingQuantity
exports.validateWttFinancialTrackable = validateWttFinancialTrackable
exports.validateWirelineItemStatus = validateWirelineItemStatus
exports.validatePlannerATTUID = validatePlannerATTUID
exports.validateMinMaxPack = validateMinMaxPack
exports.validateStockPackRequirements = validateStockPackRequirements
exports.validateMinMaxComparison = validateMinMaxComparison
exports.validateConsignInd = validateConsignInd
exports.validateDuplicateManufacturingPartNumber = validateDuplicateManufacturingPartNumber
exports.validateUOM = validateUOM
exports.validateBOMType = validateBOMType
exports.validateMSTItemStatus = validateMSTItemStatus
exports.validateOEMFullName = validateOEMFullName
exports.validateMfgPartNumber = validateMfgPartNumber
exports.validateChildBOMItemStatus = validateChildBOMItemStatus
exports.getRegionStatusConfigs = getRegionStatusConfigs
exports.validateRegionStatus = validateRegionStatus
exports.validateOrderFlag = validateOrderFlag
exports.validatePlanningRoute = validatePlanningRoute
exports.validateESIAttributesValues = validateESIAttributesValues