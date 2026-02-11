/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Item_Retail_Derivation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Derivation_Libraries" ],
  "name" : "Item Retail Derivation Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Companion_SKU_Common_Derivation",
    "libraryAlias" : "companionDerivationLib"
  }, {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonLib"
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
function setRetailDefaultAttributes(node) {
	commonLib.setDefaultValueIfEmpty(node, "Item_Status_RTL", "LOV", "Pre Launch");
	commonLib.setDefaultValueIfEmpty(node, "Primary_UOM", "LOV", "EA - Each");
	commonLib.setDefaultValueIfEmpty(node, "Ext_App_Dwnld_Code", "LOV", "R");
	commonLib.setDefaultValueIfEmpty(node, "Bar_Code_Receipt_Req", "LOV", "N");
	commonLib.setDefaultValueIfEmpty(node, "CA_Manufacturer_Package_Warning", "LOV", "NA");
	commonLib.setDefaultValueIfEmpty(node, "CA_Prop_65_Toxicity_Type", "LOV", "ND");
	commonLib.setDefaultValueIfEmpty(node, "Item_Assign_Scope", "LOV", "Retail All DCs");
	commonLib.setDefaultValueIfEmpty(node, "Linking_Code", "LOV", "ALLZ");
}

function clearUserDefinedItemDescription(node, stepManager) {
	var itemClass = node.getValue("Item_Class").getID();
	var itemClassList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("User_Defined_Description_Item_Class").getSimpleValue();
	if (itemClassList.includes(itemClass) == false) {
		node.getValue("User_Defined_Item_Description").setSimpleValue(null);
	}
}

function clearChemicalCancerAndReproductive(node) {
	var caProp65ToxicityType = node.getValue("CA_Prop_65_Toxicity_Type").getID();
	if (caProp65ToxicityType == "ND") {
		node.getValue("Ca_Prop_65_Chem_Cancr").setSimpleValue(null);
		node.getValue("Ca_Prop_65_Chem_Repro").setSimpleValue(null);
	}
}

function setFieldOrgsAndAssignScope(node) {
	var marketLinking = node.getValue("Market_Linking").getID();
	if (marketLinking == "GSM") {
		node.getValue("Assign_To_Field_Orgs").setLOVValueByID("C");
		node.getValue("Item_Assign_Scope").setLOVValueByID("Retail All DCs");
	}
}

//Submitted Standard Cost attribute should be editable by user hence remove the rule of Submit Standard Cost attribute derivation
//To be reviewed
function setSubmittedDateAndStandardCost(node, stepManager) {
	var isParentBOM = node.getValue("Parent_BOM").getSimpleValue();
	var itemNumber = node.getValue("Item_Num").getSimpleValue();
	var submittedStandardCost = node.getValue("Submit_Standard_Cost").getID();

	if (node.getObjectType().getID() == "Item") {
		if (isParentBOM == "Yes") {
			//node.getValue("Submit_Standard_Cost").setLOVValueByID("N"); 
			// Commented out, will ask User to change SSC to N, if its a Parent BOM. Added in Validation: BL_Item_Common_Validation (validateSubmitStandardCostBOM)
			node.getValue("Submitted_Date").setSimpleValue("");
		} else {
			if (itemNumber) {
				var currentCost = node.getValue("Requested_Standard_Cost").getSimpleValue();
				var approvedManager = stepManager.executeInWorkspace("Approved", function(step) {
					return step;
				});
				var approvedNode = approvedManager.getProductHome().getProductByID(node.getID());
				if (approvedNode) {
					var approvedCost = approvedNode.getValue("Requested_Standard_Cost").getSimpleValue();
				}
				if (approvedCost != currentCost && submittedStandardCost == "Y") {
					node.getValue("Submitted_Date").setSimpleValue(commonLib.getCurrentDate());
				} else if (approvedCost != currentCost && submittedStandardCost == "N") {
					node.getValue("Submitted_Date").setSimpleValue("");
				}
			} else {
				if (node.getValue("Requested_Standard_Cost").getSimpleValue())
					node.getValue("Submitted_Date").setSimpleValue(commonLib.getCurrentDate());
			}
		}
	}
}

function clearCaProp65ChemicalCancer(node) {
	var caProp65ToxicityType = node.getValue("CA_Prop_65_Toxicity_Type").getID();
	if (caProp65ToxicityType == "ND") {
		node.getValue("Ca_Prop_65_Chem_Cancr").setLOVValueByID(null);
	}
}

function clearUniversalItem(node) {
	var oemFullName = node.getValue("OEM_Full_Name").getID();
	if (oemFullName != "Apple") {
		node.getValue("UNIVERSAL_ITEM").setLOVValueByID(null);
	}
}

function setLineOfBusinessCat(node, stepManager) {
	var retailItemType = node.getValue("RTL_Item_Type").getID();
	var mobilityItemsList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Retail_Mobility_Items").getSimpleValue();
	if (retailItemType == "ENTMOB ACC" || retailItemType == "ENTMOB ELE") {
		node.getValue("Line_Of_Business_Cat").setLOVValueByID("DTV.DEFAULT");
	} else if (mobilityItemsList.includes(retailItemType) == true) {
		node.getValue("Line_Of_Business_Cat").setLOVValueByID("MOBILITY.DEFAULT");
	} else {
		var productSubType = node.getValue("Product_Sub_Type").getID().toUpperCase();
		if (productSubType.contains("SECURITY"))
			node.getValue("Line_Of_Business_Cat").setLOVValueByID("SECURITY.DEFAULT");
	}
}

function setDimensionAttributes(node) {
	var mcLength = node.getValue("Master_Carton_Length_Temp").getSimpleValue();
	var mcWidth = node.getValue("Master_Carton_Width_Temp").getSimpleValue();
	var mcHeight = node.getValue("Master_Carton_Height_Temp").getSimpleValue();
	var mcWeight = node.getValue("Master_Carton_Weight_Temp").getSimpleValue();
	var mcDimsUnits = node.getValue("MC_Dimension_Unit_Temp").getID();
	var mcWghtUnits = node.getValue("MC_Weight_Unit_Temp").getID();

	if (mcDimsUnits) {
		node.getValue("MC_Dimension_Unit").setLOVValueByID("Inches");
	} else {
		node.getValue("MC_Dimension_Unit").setLOVValueByID("");
	}

	if (mcWghtUnits) {
		node.getValue("MC_Weight_Unit").setLOVValueByID("Pounds");
	} else {
		node.getValue("MC_Weight_Unit").setLOVValueByID("");
	}

	if (mcLength && mcDimsUnits) {
		var lenInches = convertToInches(mcLength, mcDimsUnits);
		node.getValue("Master_Carton_Length").setSimpleValue(lenInches);
	} else {
		node.getValue("Master_Carton_Length").setSimpleValue("");
	}

	if (mcWidth && mcDimsUnits) {
		var widInches = convertToInches(mcWidth, mcDimsUnits);
		node.getValue("Master_Carton_Width").setSimpleValue(widInches);
	} else {
		node.getValue("Master_Carton_Width").setSimpleValue("");
	}

	if (mcHeight && mcDimsUnits) {
		var heightInches = convertToInches(mcHeight, mcDimsUnits);
		node.getValue("Master_Carton_Height").setSimpleValue(heightInches);
	} else {
		node.getValue("Master_Carton_Height").setSimpleValue("");
	}

	if (mcWeight && mcWghtUnits) {
		var weightPounds = convertToPounds(mcWeight, mcWghtUnits);
		node.getValue("Master_Carton_Weight").setSimpleValue(weightPounds);
	} else {
		node.getValue("Master_Carton_Weight").setSimpleValue("");
	}
}

function convertToInches(value, unit) {
	var result = "";
	var unitval = String(unit).toLowerCase();
	switch (unitval) {
		case "millimeters":
			result = value * 0.0393701;
			break;
		case "centimeters":
			result = value * 0.393701;
			break;
		case "inches":
			result = value;
			break;
		default:
			result = "0";
			throw new Error("Unsupported unit: " + unit);
	}
	result = Math.ceil(result);
	return result;
}

function convertToPounds(value, unit) {
	var result = "";
	var unitval = String(unit).toLowerCase();
	switch (unitval) {
		case "grams":
			result = value * 0.00220462;
			break;
		case "kilograms":
			result = value * 2.20462;
			break;
		case "pounds":
			result = value;
			break;
		default:
			result = "0";
			throw new Error("Unsupported unit: " + unit);
	}
	result = Math.ceil(result);
	return result;
}

function convertToUpperCaseMfgPartNoAndItemDesc(node) {
	var mfgPartNo = node.getValue("Mfg_Part_No").getSimpleValue();
	var userDefItemDesc = node.getValue("User_Defined_Item_Description").getSimpleValue();
	if (mfgPartNo) {
		node.getValue("Mfg_Part_No").setSimpleValue(commonLib.convertToUpperCaseAndExcludeHTMLTags(mfgPartNo));
	}
	if (userDefItemDesc) {
		node.getValue("User_Defined_Item_Description").setSimpleValue(commonLib.convertToUpperCaseAndExcludeHTMLTags(userDefItemDesc));
	}
}

// Added by mb916k to set AP_Category
function setAPCategory(node, stepManager) {
	var itemTypeRTL = node.getValue("RTL_Item_Type").getID();
	var rtlAccessoryList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Retail_Accessory_Items").getSimpleValue();
	var rtlDeviceList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Retail_Device_Items").getSimpleValue();
	var apSubDepartment = node.getValue("AP_Sub_Dept").getSimpleValue();
	var apDepartment = node.getValue("AP_Dept").getSimpleValue();
	var apOperatingSystem = node.getValue("AP_Operating_System").getSimpleValue();
	if (!apOperatingSystem) {
		apOperatingSystem = "";
	}
	if (!apDepartment) {
		apDepartment = "";
	}
	if (!apSubDepartment) {
		apSubDepartment = "";
	}
	var apCategory = "";
	if (rtlDeviceList.includes(String(itemTypeRTL)) || rtlAccessoryList.includes(String(itemTypeRTL))) {
		if (apSubDepartment != "Other") {
			apCategory = apOperatingSystem + "_" + apSubDepartment;
		} else if (apSubDepartment == "Other") {
			apCategory = apOperatingSystem + "_" + apSubDepartment + "_" + apDepartment;
		}
	}
	if (apCategory) {
		node.getValue("AP_Category").setSimpleValue(apCategory);
	}
}

// Added by mb916k to set AP_SubCategory
function setAPSubCategory(node, stepManager) {
	var itemTypeRTL = node.getValue("RTL_Item_Type").getID() + "";
	var rtlAccessoryList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Retail_Accessory_Items").getSimpleValue();
	var rtlDeviceList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Retail_Device_Items").getSimpleValue();
	var apSubDepartment = node.getValue("AP_Sub_Dept").getSimpleValue();
	var apDepartment = node.getValue("AP_Dept").getSimpleValue();
	var apOperatingSystem = node.getValue("AP_Operating_System").getSimpleValue();
	var apDivision = node.getValue("AP_Division").getSimpleValue();
	if (!apOperatingSystem) {
		apOperatingSystem = "";
	}
	if (!apDepartment) {
		apDepartment = "";
	}
	if (!apSubDepartment) {
		apSubDepartment = "";
	}
	if (!apDivision) {
		apDivision = "";
	}
	var apSubCategory = "";
	if (rtlDeviceList.includes(String(itemTypeRTL)) || rtlAccessoryList.includes(String(itemTypeRTL))) {
		if (apDivision == "Device") {
			apSubCategory = apSubDepartment;
		} else if (apDivision == "Accessory") {
			apSubCategory = apOperatingSystem + "_" + apSubDepartment + "_" + apSubDepartment;
		}
	}
	if (apSubCategory) {
		node.getValue("AP_Sub_Category").setSimpleValue(apSubCategory);
	}
}

function setShippable(node) {
	var internalOrderflag = node.getValue("Internal_Order_Flag").getID();
	if (internalOrderflag == "Y") {
		node.getValue("Shippable").setLOVValueByID("Y");
	}
}

// RTL- Automatically update child item status to No Buy based on if Parent item status is Obsolete/inactive/Phase Out/No Buy/RTN Stock
function setRetailChildOrgStatus(node, stepManager) {
	var ObjType = node.getObjectType().getID();
	if (ObjType == "Item") {
		var itemNumber = node.getValue("Item_Num").getValue();
		var itemStatus = node.getValue("Item_Status_RTL").getSimpleValue();
		if (itemStatus == "Obsolete" || itemStatus == "Inactive" || itemStatus == "Phase Out" || itemStatus == "No Buy" || itemStatus == "RTN Stock") {
			children = node.queryChildren();
			children.forEach(function(child) {
				if (child.getObjectType().getID() == "Child_Org_Item") {
					var orgCode = child.getValue("Organization_Code").getID();
					if (orgCode == "RLO" || orgCode == "RL1" || orgCode == "RL2" || orgCode == "RL3") {
						if (!itemNumber) {
							child.getValue("Item_Status_RTL").setSimpleValue("No Buy");
							child.getValue("Item_Status").setSimpleValue("No Buy");
						} else {
							var approvedManager = stepManager.executeInWorkspace("Approved", function(step) {
								return step;
							});
							var approvedNode = approvedManager.getProductHome().getProductByID(child.getID());
							if (approvedNode) {
								var approvedItemStatusRetail = approvedNode.getValue("Item_Status_RTL").getSimpleValue();
								var approvedItemStatus = approvedNode.getValue("Item_Status").getSimpleValue();
								var currentItemStatusRetail = child.getValue("Item_Status_RTL").getSimpleValue();
								var currentItemStatus = child.getValue("Item_Status").getSimpleValue();
								var statusChanged = false;
							}
							if (currentItemStatusRetail != "No Buy" || approvedItemStatusRetail != "No Buy") {
								child.getValue("Item_Status_RTL").setSimpleValue("No Buy");
								statusChanged = true;
							}
							if (currentItemStatus != "No Buy" || approvedItemStatus != "No Buy") {
								child.getValue("Item_Status").setSimpleValue("No Buy");
								statusChanged = true;
							}
							if (statusChanged) {
								var attributeList = ['Item_Status', 'Item_Status_RTL'];
								commonLib.partialApproveFields(child, attributeList);
							}
						}
					}
				}
				return true;
			});
		}
	}
}


/**
 * @author - AW304F
 * Rule Name: CPO_Indicator_N_Parent_Items
 * Added to Item Retail Derivation Library
 */

function setCPOIndicator(node) {

	var retailItemType = node.getValue('RTL_Item_Type').getID();
	const retailItemTypeList = ['COMPUTER', 'ELECTRONIC_3PP', 'ELECTRONIC_NONSERIALIZED', 'ELECTRONIC_SERIALIZED',
		'PHONE', 'PHONE_DISPLAY', 'PHONE_PREPAID_IDB', 'PHONE_PREPAID_PIB', 'PHONE_PREPAID_PYG', 'SIM'
	];
	if (retailItemTypeList.includes(String(retailItemType))) {
		node.getValue('CPO_Indicator').setSimpleValue('N');
	}
}


/**
 * @author - AW304F
 * Rule Name: SIM_No_ThirdPartyEligible
 */

function setThirdPartyEligible(node) {
	var retailItemType = node.getValue("RTL_Item_Type").getID();
	if (retailItemType && retailItemType == "SIM") {
		node.getValue("Third_Party_Eligible").setLOVValueByID("N");
	}
}

function setIMEIitemID(node, step) { //CTXSCM-17234
	var imeiRef = step.getReferenceTypeHome().getReferenceTypeByID("Item_To_IMEI_Item_Reference");
	var imeiRefList = node.queryReferences(imeiRef).asList(1);
	if (imeiRefList && imeiRefList.size() > 0) {
		var imeiRefTargetItem = imeiRefList.get(0).getTarget();
		var imeiItem_SKU = imeiRefTargetItem.getValue("IMEI_SKU").getSimpleValue();
		node.getValue("IMEI_Item_ID").setSimpleValue(imeiItem_SKU);
	}
}

/**
 * @author - AW304F
 * Rule Name: Set Air Shipment Allowed for Retail LOB
 * Relex Retrofitting
 */
 
function setAirShipmentAllowed(node){
	
	var batteryPackaging = node.getValue("Battery_Packaging").getSimpleValue();
	var batteryTechnology = node.getValue("Battery_Technology").getSimpleValue();

	if(batteryPackaging){
		if (batteryTechnology) {
			if(batteryPackaging == "STAND-ALONE" && batteryTechnology == "LI-ION"){
				node.getValue("Air_Shipment_Allowed").setLOVValueByID("S");
			} else if (batteryPackaging == "NONE" && batteryTechnology == "NONE") {
				node.getValue("Air_Shipment_Allowed").setLOVValueByID("A");
			} else if (batteryPackaging != "STAND-ALONE" && batteryTechnology != "LI-ION") {
				node.getValue("Air_Shipment_Allowed").setLOVValueByID("Y");
		    }
	    }	
    }
}

/**
 * @author - John 
 * set set ETF_Cat1 Values
 */

function setETFCat1(node, stepManager, queryHome) {

	var itemTypeRTL = node.getValue("RTL_Item_Type").getID();
	var retailDeviceList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Retail_Device_Items").getSimpleValue();
	var IMEIItemID = node.getValue("IMEI_Item_ID").getSimpleValue();
	var IMEIItemStiboID = "";
	if (retailDeviceList.includes(itemTypeRTL) && IMEIItemID) {
		var IMEISKUattrID = stepManager.getAttributeHome().getAttributeByID("IMEI_SKU");
		var condition = com.stibo.query.condition.Conditions;
		var querySpecification = queryHome.queryFor(com.stibo.core.domain.Product).where(condition.valueOf(IMEISKUattrID).eq(IMEIItemID)).execute();
		querySpecification.forEach(
			function(queryResult) {
				if (queryResult.getParent().getObjectType().getID() != "IMEI_Canceled" &&
					queryResult.getParent().getObjectType().getID() != "IMEI_Onboarding") {
					IMEIItemStiboID = queryResult;
				}
				return true;
			});
		if (IMEIItemStiboID) {
			var IMEIDeviceCategory = IMEIItemStiboID.getValue("IMEI_Device_Category").getID();
			if (IMEIDeviceCategory) {
				node.getValue("ETF_Cat1").setLOVValueByID(IMEIDeviceCategory);
			}
		}
	}
}


/**
 * @author - AW304F
 * Rule Name: Set Retail Planning Parent Model
 * Relex Retrofitting
 */
 
function hasMultisep(str) {
  if (typeof str !== 'string') {
    return false;
  }
  return str.toLowerCase().includes('multisep');
}

function setRetailPlanningParentModel(node,stepManager) {
    
	var objType = node.getObjectType().getID();
	const companionItemTypeList = ['DEP', 'DEM', 'KIT', 'LDU','ARDEMO','DISPLAY'];
	
	if(objType == "Item") {
		
		var parentModel = node.getValue("Planning_Parent_Model").getSimpleValue();
		
		if(parentModel){
			
			var children = node.getChildren().iterator();
			var childArray = node.getChildren().toArray();
			var childCount = childArray.length;
			
			if(childCount > 0){
				
				while (children.hasNext()) {

					var child = children.next();
					
					if(child.getObjectType().getID() == "Companion_SKU"){
					
						var companionItemType = child.getValue("Companion_Item_Type").getSimpleValue();	
						companionItemType = String(companionItemType);
						
						if(!(hasMultisep(companionItemType))){
							
							companionItemType = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_Companion_Item_Type_Duplicate").getListOfValuesValueByID(companionItemType).getValue();
							companionItemType = String(companionItemType);
							
							if (!companionItemTypeList.includes(companionItemType)){
								
								var capacity = child.getValue("Capacity").getSimpleValue();
								if(parentModel && capacity){
									var planningParentModel = parentModel + "_" + capacity;
									child.getValue("Planning_Parent_Model").setSimpleValue(planningParentModel);
								}
							}
						}
					}
				}
			}
		}
	}
	
	
	if(objType == "Companion_SKU") {
		var itemParent = node.getParent();
		var companionItemType = node.getValue("Companion_Item_Type").getSimpleValue();	
		companionItemType = String(companionItemType);
		
		if(!(hasMultisep(companionItemType))){
			
			companionItemType = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_Companion_Item_Type_Duplicate").getListOfValuesValueByID(companionItemType).getValue();
			companionItemType = String(companionItemType);
			
			if (!companionItemTypeList.includes(companionItemType)){
				
				var parentModel = itemParent.getValue("Planning_Parent_Model").getSimpleValue();
				var capacity = node.getValue("Capacity").getSimpleValue();
				
				if(parentModel && capacity){
					var planningParentModel = parentModel + "_" + capacity;
					node.getValue("Planning_Parent_Model").setSimpleValue(planningParentModel);			
				}
			}
		}
	}
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.setRetailDefaultAttributes = setRetailDefaultAttributes
exports.clearUserDefinedItemDescription = clearUserDefinedItemDescription
exports.clearChemicalCancerAndReproductive = clearChemicalCancerAndReproductive
exports.setFieldOrgsAndAssignScope = setFieldOrgsAndAssignScope
exports.setSubmittedDateAndStandardCost = setSubmittedDateAndStandardCost
exports.clearCaProp65ChemicalCancer = clearCaProp65ChemicalCancer
exports.clearUniversalItem = clearUniversalItem
exports.setLineOfBusinessCat = setLineOfBusinessCat
exports.setDimensionAttributes = setDimensionAttributes
exports.convertToInches = convertToInches
exports.convertToPounds = convertToPounds
exports.convertToUpperCaseMfgPartNoAndItemDesc = convertToUpperCaseMfgPartNoAndItemDesc
exports.setAPCategory = setAPCategory
exports.setAPSubCategory = setAPSubCategory
exports.setShippable = setShippable
exports.setRetailChildOrgStatus = setRetailChildOrgStatus
exports.setCPOIndicator = setCPOIndicator
exports.setThirdPartyEligible = setThirdPartyEligible
exports.setIMEIitemID = setIMEIitemID
exports.setAirShipmentAllowed = setAirShipmentAllowed
exports.setETFCat1 = setETFCat1
exports.hasMultisep = hasMultisep
exports.setRetailPlanningParentModel = setRetailPlanningParentModel