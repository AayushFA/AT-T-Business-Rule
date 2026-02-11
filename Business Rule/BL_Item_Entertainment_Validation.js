/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Item_Entertainment_Validation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Validation_Libraries" ],
  "name" : "Item Entertainment Validation Library",
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
function validateDescriptionPrefix(node,userItemType,itemClass) {
var errorMessage = "";
//if (userItemType == "UVERSE" && itemClass == "BAU Wireline") { // removed item class filter for other item classes ex: ATT Uverse -- 01/05/2026
	if (userItemType == "UVERSE") { 
			if (!node.getValue("Description_Prefix").getID()) {
				errorMessage = "Description Prefix is mandatory for Uverse Item Types";
			}
		}		
	return errorMessage;
}
function validateUserDefItemNumber(node) {
var errorMessage = "";
	var userDefItemNumber = node.getValue("User_Defined_Item_Num").getSimpleValue();
	if (userDefItemNumber) {
		const onlyAlphaNumericDashRegExp = /^([a-zA-Z0-9 -]+)$/;
		if (!onlyAlphaNumericDashRegExp.test(userDefItemNumber)) {
			errorMessage = "Alpha Numeric characters and Dash are only accepted in User Defined Item Number";
		}
	}
	return errorMessage;
}
function validateLinkingCode(node,userItemType,itemClass) {
var errorMessage = "";
//if (userItemType == "UVERSE" && itemClass == "BAU Wireline") { // removed item class filter for other item classes ex: ATT Uverse -- 01/05/2026
		if (userItemType == "UVERSE")  {
			if (!node.getValue("Linking_Code").getLOVValue()) {
				errorMessage = "Linking Code is mandatory for Uverse Item Types";				
			}
		}
	return errorMessage;
}
function validateDTVAttributes(node, stepManager,attribute,itemClass) {
	var errorMessage ="";
    var attributeValue = node.getValue(attribute).getSimpleValue();
    var attributeName = stepManager.getAttributeHome().getAttributeByID(attribute).getName();
    if (!attributeValue && itemClass == "ATT DirecTV") {
        errorMessage =  attributeName + " is required for any items in ATT DirecTV item class.";
    }
    return errorMessage;
}
//MfgPartNo is required if OEM or OEM Name is entered
function validateMfgPartNo(node,itemClass) {
	var errorMessage = "";
    if (itemClass == "ATT DirecTV") {
        var mfgPartNo = node.getValue("Mfg_Part_No").getSimpleValue();
        var oem = node.getValue("OEM").getSimpleValue();
        var oemFullName = node.getValue("OEM_Full_Name").getSimpleValue();
        if (!mfgPartNo && (oem || oemFullName)) {
            return "Mfg Part No is required if OEM or OEM_Full_Name is entered.";
        }
    }
    return errorMessage;
}
// Brand Name is not required for Non-Serialized Items
function validateBrandName(node,itemClass) {
	var errorMessage= "";
    var brandName = node.getValue("Brand_Name").getSimpleValue();
    var itemType = node.getValue("ENT_Item_Type").getID();
    var productSubType = node.getValue("Product_Sub_Type").getID();
    if (itemClass == "ATT DirecTV") {
        if (itemType == "Access Card" && !brandName) {
            errorMessage =  "Access Card should have Brand Name populated.";
        }
        if (itemType != "Access Card" && productSubType.includes("Non Serial") && brandName) {
            errorMessage = "Non Serialized Item should not have Brand Name populated.";
        }
    }
    if (itemClass == "ATT Entertainment Make Model" && !brandName) {
        errorMessage =  "Brand Name is required for Make Model Items.";
    }
    return errorMessage;
}
function validateIhsCode(node,stepManager,query) {	
            var errorMessage = "";	
			var ihsCode = node.getValue("IHS_Code").getSimpleValue();
			if (ihsCode) {
				var itemNumberAttribute = stepManager.getAttributeHome().getAttributeByID("Item_Num");
				var querySpecification = query.queryFor(com.stibo.core.domain.Product).where(com.stibo.query.condition.Conditions.valueOf(itemNumberAttribute).eq(ihsCode));
				var queryResult = querySpecification.execute().asList(10);
				if (queryResult.size() == 0) {					
					errorMessage = "Item Number is not existing";
				} else {
					var newItemProductFamily = node.getValue("Product_Family").getID();
					var newItemSubFamily = node.getValue("Sub_Family").getID();
					var existingItemProductFamily = queryResult.get(0).getValue("Product_Family").getID();
					var existingItemSubFamily = queryResult.get(0).getValue("Sub_Family").getID();17819826
					if (newItemProductFamily  && existingItemProductFamily && !newItemProductFamily.match(existingItemProductFamily)) {																								
						errorMessage = "Product Family is not matching with the existing item's Product Family\n";						
					}
					if (newItemSubFamily && existingItemSubFamily && !newItemSubFamily.match(existingItemSubFamily)) {													
							errorMessage +="Product Sub Family is not matching with the existing item's Product Sub Family";						
					}
				}
			}
			return errorMessage;
}
// OMS Item Number id required for Generic Group Items
function validateOmsItemNumber(node,itemType) {
    var errorMessage = "";
    var omsItemNumber = node.getValue("OMS_Item_Number").getSimpleValue();
    if (itemType == "Generic Group" && !omsItemNumber) {
        errorMessage =  "OMS Item Number must be populated for Generic Group.";
    }
    return errorMessage;
}
//Non Asset cannot be Tracked to Home
function validateAssetTrackingScope(node,itemClass) {
	var errorMessage = "";
    var barCodeReceiptReq = node.getValue("Bar_Code_Receipt_Req").getID();
    var assetTrackingScope = node.getValue("Asset_Tracking_Scope").getID();
    if (itemClass =="ATT DirecTV" && barCodeReceiptReq == "Z" && assetTrackingScope == "A") {
        errorMessage =  "Non Asset cannot be tracked to home.";
    }
    return errorMessage;
}
//Required for Access Card Items
function validateTariffCode(node,itemType) {
    var errorMessage = "";
    var accessCardTarrifCode = node.getValue("Access_Card_Tariff_Code").getSimpleValue();
    if (itemType== "Access Card" && !accessCardTarrifCode) {
        errorMessage= "Access Card Tariff Code is required for Access Card Items.";
    }
    if (itemType != "Access Card" && accessCardTarrifCode) {
        node.getValue("Access_Card_Tariff_Code").setSimpleValue(null);
    }
    return errorMessage;
}
// User Defined Item Number is mandatory for Uverse, DSL and BB Items
function validateMandateUserDefItemNumber(node,itemClass,productType,userItemType) {
    var errorMessage = "";
    var userDefinedItemNumber = node.getValue("User_Defined_Item_Num").getSimpleValue();
    if (!userDefinedItemNumber){
    	    /*if (userItemType == "UVERSE" && itemClass == "BAU Wireline") { 
	         errorMessage= "User Defined Item Number is mandatory for Uverse item type"
	     }*/
	    	if(productType == "DSL" && userItemType !="UVERSE") {
	    	    errorMessage = "User Defined Item Number is mandatory for DSL items.";
	    	}
	     /*if(itemClass == "BAU Broadband" && userItemType !="UVERSE"){
	         errorMessage = "User Defined Item Number is mandatory for BB item type.";  
	     }*/    
    }
    return errorMessage;
}
//LE Ite & Expenditure code are required for BVOIP Items
function validateBvoipAttributes(node,stepManager,itemType,attribute) {
    var errorMessage = "";
    var attributeValue = node.getValue(attribute).getSimpleValue();
    var attributeName = stepManager.getAttributeHome().getAttributeByID(attribute).getName();
    if (itemType == "BVOIP" && !attributeValue) {       
        errorMessage = attributeName+ " is required for BVOIP item type.";               
    }
    return errorMessage;
}
//Product Line is required for Make Model & Product Line Item types
function validateProductLine(node,itemType) {   	 
	var errorMessage = "";
    var productLine = node.getValue("Product_Line").getID();
    if (["DTV MAKEMODEL", "UVR BB MAKEMODEL", "PRODUCTLINE"].includes(String(itemType)) && !productLine) {
    	 errorMessage =  "Product Line is mandatory for Product Line and Make Model Items.";
    }
    return errorMessage;
}
//If the Item Type = Field Inventory Aggregation Code, the Field Inventory Aggregation Code (existing attribute) cannot be used
function validateFieldInventoryIhsCode(node,itemType) {
    var errorMessage = "";
    var ihsCode = node.getValue("IHS_Code").getID();
    if (itemType == "Field Inventory Aggregation Code" && ihsCode) {
        errorMessage =  "Field Inventory Aggregation Code cannot be used for this item.";
    }
    return errorMessage;
}
//STIBO-3259 (Apr 12 Release)
function validateDTVMandatoryAttributes(node, stepManager,attribute,itemClass) {
	var errorMessage ="";
    var attributeValue = node.getValue(attribute).getSimpleValue();
    var attributeName = stepManager.getAttributeHome().getAttributeByID(attribute).getName();
    if (!attributeValue && itemClass == "ATT DirecTV") {
        errorMessage =  attributeName + " is required for any items in ATT DirecTV item class.";
    }
    return errorMessage;
}
function validateMakeModelMandatoryAttributes(node,stepManager,attribute,itemType) {
    var errorMessage = "";
    var attributeValue = node.getValue(attribute).getSimpleValue();
    var attributeName = stepManager.getAttributeHome().getAttributeByID(attribute).getName();
    if (itemType != "DTV MAKEMODEL" && !attributeValue) {
        errorMessage = attributeName+" is mandatory";
    }
    return errorMessage;
}
// New Validations Item Processing- Aman
//PP588a updated the BrandName rule to run only for DirecTV items
function validateBrandNameForSerialized(node, stepManager) {
	var brandName = node.getValue("Brand_Name").getSimpleValue();
	var attEntertainmentItemTypeList = stepManager.getEntityHome().getEntityByID("ENT_Item_Type").getValue("Entertainment_Item_Types").getSimpleValue();
	var errorMessage="";
	var itemType = node.getValue("ENT_Item_Type").getID();
	 if (node.getValue("Item_Class").getID() != "ATT Field Inv Aggregation Codes"
		  && node.getValue("Product_Class").getID() != "Entertainment"
		  && node.getValue("Bar_Code_Receipt_Req").getID() == "Y"
		  && (!brandName)
		  && attEntertainmentItemTypeList.includes(String(itemType))
	  ) {
		errorMessage= "Brand Name cannot be NULL.";
	  }
	  return errorMessage;
}

function validateUserDefinedItemDescription(node, stepManager,query) {
     var currentNodeID = node.getID(); 
     var errorMessage="";
	var attrValue = stepManager.getAttributeHome().getAttributeByID("User_Defined_Item_Description");
	var currAttrValue = node.getValue("User_Defined_Item_Description").getSimpleValue();
	var lob= stepManager.getAttributeHome().getAttributeByID("Line_Of_Business");
	var currLob=node.getValue("Line_Of_Business").getID();
		if (currAttrValue&&currLob) {
		var condition = com.stibo.query.condition.Conditions;
		var querySpecification = query.queryFor(com.stibo.core.domain.Product).where(condition.valueOf(attrValue).eq(currAttrValue).and(condition.valueOf(lob).eq("Entertainment")));
		var query = querySpecification.execute();
		var duplicateValueList = new java.util.ArrayList();
		var isDuplicateValue = false;
		query.forEach(
			function(result) {
				duplicateValueList.add(result);
				return true;
			});
		if (duplicateValueList.size() > 0) {
			for (var i = 0; i < duplicateValueList.size(); i++) {
				if (currentNodeID != duplicateValueList.get(i).getID()) {		
					dupItem = duplicateValueList.get(i).getID()				
					isDuplicateValue = true;
					break;
				}
			}
		}
		if(isDuplicateValue == true){		
				errorMessage=" Duplicate value present for User Defined Item Description on item " + dupItem;
		}
		return errorMessage;
	}
}

function validateSendAssetTxnToFinance(node) {
var errorMessage="";
  var itemClass = node.getValue("Item_Class").getID();
  var sendAsset = node.getValue("Send_Asset_Txn_To_Finance").getSimpleValue();
  if ((itemClass == "ATT DirecTV" || itemClass == "ATT Field Inv Aggregation Codes"|| itemClass == "ATT Entertainment Generic")
      && (!sendAsset)
  ) {
  errorMessage="Please populate a value for Send Asset Txn to Finance (Y-Capital, N-Expense)";
  }
  return errorMessage;
}



//
/*===== business library exports - this part will not be imported to STEP =====*/
exports.validateDescriptionPrefix = validateDescriptionPrefix
exports.validateUserDefItemNumber = validateUserDefItemNumber
exports.validateLinkingCode = validateLinkingCode
exports.validateDTVAttributes = validateDTVAttributes
exports.validateMfgPartNo = validateMfgPartNo
exports.validateBrandName = validateBrandName
exports.validateIhsCode = validateIhsCode
exports.validateOmsItemNumber = validateOmsItemNumber
exports.validateAssetTrackingScope = validateAssetTrackingScope
exports.validateTariffCode = validateTariffCode
exports.validateMandateUserDefItemNumber = validateMandateUserDefItemNumber
exports.validateBvoipAttributes = validateBvoipAttributes
exports.validateProductLine = validateProductLine
exports.validateFieldInventoryIhsCode = validateFieldInventoryIhsCode
exports.validateDTVMandatoryAttributes = validateDTVMandatoryAttributes
exports.validateMakeModelMandatoryAttributes = validateMakeModelMandatoryAttributes
exports.validateBrandNameForSerialized = validateBrandNameForSerialized
exports.validateUserDefinedItemDescription = validateUserDefinedItemDescription
exports.validateSendAssetTxnToFinance = validateSendAssetTxnToFinance