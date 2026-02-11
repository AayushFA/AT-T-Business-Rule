/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Item_Retail_Validation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Validation_Libraries" ],
  "name" : "Item Retail Validation Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_SPL_Validation_Library",
    "libraryAlias" : "splValidationLib"
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
function validateMarketingNameCharLimit(node) {
	var errorMessage = "";
	var marketingName = node.getValue("Marketing_Name").getSimpleValue();
	var productClass = node.getValue("Product_Class").getID();
	if (productClass != "DEVICE" && marketingName && marketingName.length() > 10) {		
		errorMessage = "Marketing Name should not exceed 10 characters";		
	}
	return errorMessage;
}

function validateModelCharLimit(node) {
	var errorMessage = "";
	var model = node.getValue("Model").getSimpleValue();
	var productClass = node.getValue("Product_Class").getID();
	if (productClass != "DEVICE" && model && model.length() > 8) {		
		errorMessage = "Model should not exceed 8 characters";		
	}
	return errorMessage;
}

function validateMarketingNameAndModelCharLimit(node) {
	var errorMessage = "";
	var marketingName = node.getValue("Marketing_Name").getSimpleValue();
	var model = node.getValue("Model").getSimpleValue();
	var productClass = node.getValue("Product_Class").getID();
	if (productClass != "DEVICE" && marketingName && model && parseInt(marketingName.length()) + parseInt(model.length()) > 18) { // Jul 20 Release, PROD Issue Fix		
		errorMessage = "Total number of characters in Marketing Name and Model should not exceed 18";		
	}
	return errorMessage;
}

function validateCustomMarketLinking(node) {
	var errorMessage = "";
	var marketLinking = node.getValue("Market_Linking").getID();
	if (marketLinking == "CUS") {
		if (!node.getValue("Custom_Mkt_Link").getSimpleValue()) {
			errorMessage = "Custom Market Linking is mandatory if Market Linking is CUS";
		}
	}
	return errorMessage;
}

function validateFirstNetCapable(node) {
	var errorMessage = "";
	var productType = node.getValue("Product_Type").getID();
	if (productType == "ELECTRONIC" || productType == "PHONE" || productType == "SIM") {
		if (!node.getValue("FirstNet_Capable").getSimpleValue()) {
			errorMessage = "FirstNet Capable is mandatory for ELECTRONIC, Phone and SIM Product Types";
		}
	}
	return errorMessage;
}

function validateUserDefinedItemNumber(node) {
	var errorMessage = "";
	if (node.getValue("User_Defined_Item_Num").getSimpleValue()) {
		if (node.getValue("User_Defined_Item_Num").getSimpleValue().length() != 5) {
			errorMessage = "User Defined Item number should be 5 digits.";
		}
	}

	var itemType = node.getValue("RTL_Item_Type").getID();
	if (itemType == "DF_COLLATERAL_YOUNG_AMERICA" ) {//|| itemType == "DF_3PL"
		if (!node.getValue("User_Defined_Item_Num").getSimpleValue()) {
			errorMessage = "User Defined Item Number is mandatory for the selected Item Type";
		}
	}
	return errorMessage;
}

function validateSubsidyEligible(node, stepManager) {
	var errorMessage = "";
	var subsidyList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Serialized_Subsidy_Items").getSimpleValue();
	var userItemType = node.getValue("User_Item_Type_RTL").getID();
	if (subsidyList.includes(userItemType) == true) {
		if (!node.getValue("Subsidy_Eligible").getSimpleValue()) {
			errorMessage = "Subsidy Eligible is mandatory for the selected Item Type";
		}
	}
	return errorMessage;
}

function validateUserDefItemDesc(node, stepManager) {
	var errorMessage = "";
	var itemClass = node.getValue("Item_Class").getID();
	var itemClassList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("User_Defined_Description_Item_Class").getSimpleValue();
	if (itemClassList.includes(itemClass) == true && !node.getValue("User_Defined_Item_Description").getSimpleValue()) {
		errorMessage = "User Defined Item Description is mandatory for the Item Class";
	}
	return errorMessage;
}

function validateWip1CompSku(node) {
	var errorMessage = "";
	var itemNum = node.getValue("Item_Num").getValue();
	var companions = node.getValue("Companion_Item_Type").getSimpleValue();
	if (itemNum) {
		if (companions && companions.includes("WIP1XX - Default WIP Grade1 SKU")) {
			errorMessage = "WIP1XX is no longer a valid companion item type. Please remove the value.";
		}
	} else {
		var wip1ChildFound = false;
		var children = node.queryChildren();
		children.forEach(function (child) {
			if (child.getObjectType().getID() == "Companion_SKU") {
				var childCompType = child.getValue("Companion_Item_Type").getSimpleValue();
				if (childCompType && childCompType.trim() == "WIP1XX - Default WIP Grade1 SKU") {
					wip1ChildFound = true;
				}
			}
			return true;
		});
		if (!wip1ChildFound) {
			if (companions && companions.includes("WIP1XX - Default WIP Grade1 SKU")) {
				errorMessage = "WIP1XX is no longer a valid companion item type. Please remove the value.";
			}
		}
	}
	return errorMessage;
}

function validateMcDimensionUnit(node) {
	var errorMessage = "";
	var mcDimsUnits = node.getValue("MC_Dimension_Unit_Temp").getID();
	var mcLength = node.getValue("Master_Carton_Length_Temp").getSimpleValue();
	var mcWidth = node.getValue("Master_Carton_Width_Temp").getSimpleValue();
	var mcHeight = node.getValue("Master_Carton_Height_Temp").getSimpleValue();

	// When either Length, Width or Height is provided Dimension-Unit is Mandatory
	if ((mcLength || mcWidth || mcHeight) && !mcDimsUnits) {
		errorMessage = "MC Dimension Unit must be provided when Length/Width/Height is entered";
	}
	// If Neither is provided and DimUnits is entered
	else if (!mcLength && !mcWidth && !mcHeight && mcDimsUnits) {
		errorMessage = "MC Dimension Unit should be entered only when either Length/MC Width/MC Height is populated";
	}
	return errorMessage;
}

function validateMcWeightUnit(node) {
	var errorMessage = "";
	var mcWeight = node.getValue("Master_Carton_Weight_Temp").getSimpleValue();
	var mcWghtUnits = node.getValue("MC_Weight_Unit_Temp").getID();
	// When Weight is Provided then Weight Unit is Mandatory
	if (mcWeight && !mcWghtUnits) {
		errorMessage = "MC Weight Unit must be provided when Weight is entered";
	}
	if (!mcWeight && mcWghtUnits) {
		errorMessage = "MC Weight Unit should be provided only when Weight is populated";
	}
	return errorMessage;
}

function validateCostChangeReason(node,stepManager) {
    var errorMessage = "";
	var currentCost = node.getValue("Requested_Standard_Cost").getSimpleValue();
	var approvedManager = stepManager.executeInWorkspace("Approved", function(step) {
		return step;
	});
	var approvedNode = approvedManager.getProductHome().getProductByID(node.getID());
	if (approvedNode) {
		var approvedCost = approvedNode.getValue("Requested_Standard_Cost").getSimpleValue();
	}
	if (approvedCost != currentCost) {
		if (!node.getValue("Change_Reason").getSimpleValue()) {			
			errorMessage =  "Please enter the Change Reason for Requested Standard Cost updates";
		}
	}
    return errorMessage;
}

function validateCostAttributes(node, stepManager) { // used only in Maintenance WF
	var errorMessage = "";
	var currentCost = node.getValue("Requested_Standard_Cost").getSimpleValue();
	var changeReason = node.getValue("Change_Reason").getSimpleValue();
	var currentStandardCost = node.getValue("Current_Standard_Cost").getSimpleValue();
	var submitStandardCost = node.getValue("Submit_Standard_Cost").getID();
	var itemNumber=node.getValue("Item_Num").getSimpleValue();
	var approvedCost="";
	approvedCost=commonDerivationLib.isAttributeValueChanged(node, stepManager, "Requested_Standard_Cost");
	
	if (itemNumber && approvedCost && !changeReason) {
		errorMessage = "Please enter the Change Reason for Standard Cost updates";
	}
	 //Syed - Added the rule to display warning message during Item Maintenance
	/*if (itemNumber && approvedCost && submitStandardCost == "N") {
		errorMessage = ("Requested Standard Cost is not same as Current Standard Cost. Please change the Submit Standard Cost flag to Y, for Cost Approval.");
	}*/
		
	return errorMessage;
}

function validateCarrierMPN(node, splLib, stepManager, query) {
	var mfgPartNum = node.getValue("Mfg_Part_No").getSimpleValue();
	var errorMessage = "";
	if (node.isInState("SPI_Onboarding", "SPI_Enrichment") || node.isInState("Item_Maintenance_Workflow", "Retail") 
	|| node.isInState("Item_Maintenance_Workflow", "Entertainment") || node.isInState("Item_Maintenance_Workflow", "DTV")) {
		var itemMap = new java.util.HashMap();
		var dupMap = new java.util.HashMap();
		var currentCarrierList = splLib.getCurrentCarrierDCData(node);
		itemMap = splLib.getAllCarrierDCData(node, stepManager, query, itemMap);
		for (var i = 0; i < currentCarrierList.length; i++) {
			dupMap = splLib.validateDuplicateCarrierDCAcrossSystem(itemMap, currentCarrierList[i], dupMap);
			errorMessage = errorMessage + splLib.validateDuplicateCarrierMPNAcrossSKUs(node, currentCarrierList[i], query, stepManager);
		}
		errorMessage = errorMessage + splValidationLib.generateErrorMessage(dupMap);
		if (errorMessage) {
			errorMessage = mfgPartNum + " Validations: \n" + errorMessage;
		}
	} else {
		errorMessage = mfgPartNum + " Validations: \n Item is not in the Enrich state of the Workflow";
	}
	return errorMessage;
}


/**
 * @author - AW304F
 * Rule Name: Config_code_apple_device
 * Added to Item Retail Validation Library
 */
 
function validateConfigCode(node,stepManager){
	
	var errorMessage="";
	var retailDeviceList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Retail_Device_Items").getSimpleValue();
	var OEM = node.getValue("OEM").getID();
	var OEMFullName = node.getValue("OEM_Full_Name").getID();
	var retailItemType = node.getValue("RTL_Item_Type").getID();
	var configCode = node.getValue("Config_Code").getSimpleValue();		
	if (retailDeviceList && retailDeviceList.includes(String(retailItemType)) && configCode && ((OEM && OEM != "APL") || (OEMFullName && OEMFullName != "Apple"))){				
		errorMessage = "Config code is only valid for Apple devices. Please remove the entered value and submit";
	}
	if(retailDeviceList && retailDeviceList.includes(String(retailItemType)) && !configCode && (OEM == "APL" || OEMFullName == "Apple")){
		errorMessage="Config code is mandatory for Apple items";
	}
	return errorMessage;		
}

/**
 * @author - John
 * Rule Name: ICCID_Prefix_Mandatory
 */
 
function validateICCIDPrefix(node) {

	var errorMessage = "";
	var ICCIDPrefix = node.getValue("ICCID_Prefix").getID();
	var productClass = node.getValue("Product_Class").getID();
	var productType = node.getValue("Product_Type").getID();
	var firstNetCapable = node.getValue("FirstNet_Capable").getID();
	if (!ICCIDPrefix && productClass == "DEVICE" && productType == "SIM" && firstNetCapable == "Y") {
		errorMessage = "ICCID Prefix is mandatory for FirstNet SIM SKUs";
	}
	return errorMessage;
}

/**
 * @author - John
 * Rule Name: AP_Mandatory
 */
function validateAPDept(node) {

	var errorMessage = "";
	var apDivision = node.getValue("AP_Division").getSimpleValue();
	var apDepartment = node.getValue("AP_Dept").getSimpleValue();
	if (apDivision && !apDepartment) {
		errorMessage = "AP Department is mandatory, if AP Division is entered";
	}
	return errorMessage;
}

/**
 * @author - John
 * Rule Name: AP_Mandatory
 */
function validateAPSubDept(node) {

	var errorMessage = "";
	var apDivision = node.getValue("AP_Division").getSimpleValue();
	var apSubDepartment = node.getValue("AP_Sub_Dept").getSimpleValue();
	if (apDivision && !apSubDepartment) {
		errorMessage = "AP Sub Department is mandatory, if AP Division is entered";
	}
	return errorMessage;
}

/**
 * @author - John
 * Rule Name: AP_Mandatory
 */
function validateAPOperatingSystem(node) {

	var errorMessage = "";
	var apDivision = node.getValue("AP_Division").getSimpleValue();
	var apOperatingSystem = node.getValue("AP_Operating_System").getSimpleValue();
	if (apDivision && !apOperatingSystem) {
		errorMessage = "AP Operating System is mandatory, if AP Division is entered";
	}
	return errorMessage;
}

/**
 * @author - Aman
 * Rule Name: VMI_Supplier_Site_1
 */
function validateVMISupplierSite(node) {
    var vmiEnabled = node.getValue("VMI_Enabled").getID();
    var supplierSite = node.getValue("VMI_Supplier_Site").getSimpleValue();
    var errorMessage = "";
        if (vmiEnabled == "Y" && !supplierSite) {
            errorMessage = "Supplier Site info must be entered if VMI flag is Y";
        }
        return errorMessage;
}


function validateSerialGeneration(node) { 
		var productSubType = node.getValue('Product_Sub_Type').getID().toLowerCase();
		var serialGeneration= node.getValue('Serial_Generation').getID();
		var errorMessage="";
		if (productSubType) {
			if (productSubType.contains('serial') && !productSubType.contains('non') && serialGeneration == "1") {
					errorMessage="Product Sub Type indicates this item is serialized. Serial Generation must be set to something other than No Serial Control";
			}
				return errorMessage;
		}
}

function validateIMEIReference(node, step) {
	var imeiRef = step.getReferenceTypeHome().getReferenceTypeByID("Item_To_IMEI_Item_Reference");
	var imeiRefList = node.queryReferences(imeiRef).asList(1);
	var error = "";
	if (imeiRefList && imeiRefList.size() == 0) {
		error = "Please add IMEI Reference";		
	} else {
		if (imeiRefList.get(0).getTarget().getObjectType().getID() != "IMEI_Item") {
			error = "IMEI Reference must be IMEI_Item ObjectType Only";			
		}
	}
  return error;
}

function validateBatteryTechnology(node){
	var batteryTechnology=node.getValue("Battery_Technology").getID();
	var batteryPackaging=node.getValue("Battery_Packaging").getID();
	var errorMessage="";
	if(batteryPackaging && batteryPackaging !="NONE" && (!batteryTechnology || batteryTechnology == "NONE")){
		errorMessage ="Battery Technology can't be NONE or Blank, when Battery Packaging is set to anything other than 'NONE.";
	}
	return errorMessage;
}

function validateSubmitStandardCostBOM(node) {
	var errorMessage = "";
    if (node.getValue("Submit_Standard_Cost").getID() == "Y" && node.getValue("Parent_BOM").getID() == "Y"){
		errorMessage = "Standard Cost cannot be submitted for a Parent BOM. Please change Submit Standard Cost to N before saving the record." 
	}
	return errorMessage;
}

/*===== business library exports - this part will not be imported to STEP =====*/
exports.validateMarketingNameCharLimit = validateMarketingNameCharLimit
exports.validateModelCharLimit = validateModelCharLimit
exports.validateMarketingNameAndModelCharLimit = validateMarketingNameAndModelCharLimit
exports.validateCustomMarketLinking = validateCustomMarketLinking
exports.validateFirstNetCapable = validateFirstNetCapable
exports.validateUserDefinedItemNumber = validateUserDefinedItemNumber
exports.validateSubsidyEligible = validateSubsidyEligible
exports.validateUserDefItemDesc = validateUserDefItemDesc
exports.validateWip1CompSku = validateWip1CompSku
exports.validateMcDimensionUnit = validateMcDimensionUnit
exports.validateMcWeightUnit = validateMcWeightUnit
exports.validateCostChangeReason = validateCostChangeReason
exports.validateCostAttributes = validateCostAttributes
exports.validateCarrierMPN = validateCarrierMPN
exports.validateConfigCode = validateConfigCode
exports.validateICCIDPrefix = validateICCIDPrefix
exports.validateAPDept = validateAPDept
exports.validateAPSubDept = validateAPSubDept
exports.validateAPOperatingSystem = validateAPOperatingSystem
exports.validateVMISupplierSite = validateVMISupplierSite
exports.validateSerialGeneration = validateSerialGeneration
exports.validateIMEIReference = validateIMEIReference
exports.validateBatteryTechnology = validateBatteryTechnology
exports.validateSubmitStandardCostBOM = validateSubmitStandardCostBOM