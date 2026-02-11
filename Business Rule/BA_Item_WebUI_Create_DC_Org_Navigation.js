/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Item_WebUI_Create_DC_Org_Navigation",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Web_UI_Actions" ],
  "name" : "Item Create DC Org Page Navigation",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item", "Companion_SKU" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ProductBindContract",
    "alias" : "newProductsOnboardingRoot",
    "parameterClass" : "com.stibo.core.domain.impl.FrontProductImpl",
    "value" : "OnboardingProducts",
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,webui,newProductsOnboardingRoot,stepManager) {
/**
 * @author - Madhuri [CTS]
 * Create DC Child Org
 */
var userGroups = stepManager.getCurrentUser().getGroups().toString();
var itemType = node.getValue("RTL_Item_Type").getID();
const accountItemList = ['ACCESSORY_3PP', 'ACCESSORY_APPCESSORY', 'ACCESSORY_AUDIO', 'ACCESSORY_BATTERY', 'ACCESSORY_CARADAPTER', 'ACCESSORY_CASE', 'ACCESSORY_CHARGER', 'ACCESSORY_POWER_DATA', 'ACCESSORY_SCREENPRTCT', 'ACCESSORY_SPECIALTY', 'CONVERSION', 'REFURBISH_BATTERY', 'REPLACEMENT_PARTS', 'SECRTY_DIGITAL_LIFE_ACCESSORY']
const deviceItemList = ['ACV_EQUIP_NONATT_DEVICE', 'COMPUTER', 'CONVERSION', 'ELECTRONIC_3PP', 'ELECTRONIC_NONSERIALIZED', 'ELECTRONIC_SERIALIZED', 'PHONE', 'PHONE_DISPLAY', 'PHONE_PALLET', 'PHONE_PALLET_PIB', 'PHONE_PALLET_PYG', 'PHONE_PREPAID_IDB', 'PHONE_PREPAID_PIB', 'PHONE_PREPAID_PYG', 'PREPAY_CARD_SERIALIZED', 'SECRTY_DIGITAL_LIFE_DEVICE', 'SIM'];
const miscItemTypes = ['CONVERSION', 'DF_3PL', 'DF_BILL_ONLY', 'DF_COLLATERAL_GENERAL', 'DF_COLLATERAL_INTANG2', 'DF_COLLATERAL_YOUNG_AMERICA', 'DF_FREIGHT', 'EPIN_PREPAY', 'INTANG1', 'INTANG2', 'INTANG2_3PP', 'INTANG3', 'MSSNONSTCK_COLLATERAL', 'MSSNONSTCK_NONATT_ACCESSORY', 'MSSNONSTCK_NONATT_COMPUTER', 'MSSNONSTCK_NONATT_ELECTRONIC', 'MSSNONSTCK_NONATT_PHONE', 'SECRTY_DIGITAL_LIFE_PACKAGE'];
const auctionItemTypes = ['ACV_EQUIP_NONATT_DEVICE', 'COMPUTER', 'ELECTRONIC_3PP', 'ELECTRONIC_NONSERIALIZED', 'ELECTRONIC_SERIALIZED', 'PHONE', 'PHONE_DISPLAY', 'PHONE_PALLET', 'PHONE_PALLET_PIB', 'PHONE_PALLET_PYG', 'PHONE_PREPAID_IDB', 'PHONE_PREPAID_PIB', 'PHONE_PREPAID_PYG', 'PREPAY_CARD_SERIALIZED', 'SECRTY_DIGITAL_LIFE_DEVICE', 'SIM'];
if (userGroups.contains("UG_RTL_Accessory_Planner") && !accountItemList.includes(String(itemType))) {
	var errorMessage = "User is not privileged to work on Items other than Accessory Types";
	webui.showAlert("Error", errorMessage);
}
if (userGroups.contains("UG_RTL_Device_Planner") && !deviceItemList.includes(String(itemType))) {
	var errorMessage = "User is not privileged to work on Items other than Device Types";
	webui.showAlert("Error", errorMessage);
}
if (userGroups.contains("UG_RTL_Misc_Planner") && !miscItemTypes.includes(String(itemType))) {
	var errorMessage = "User is not privileged to work on Items other than Misc. Types";
	webui.showAlert("Error", errorMessage);
}
if (userGroups.contains("UG_RTL_Auction") && !auctionItemTypes.includes(String(itemType))) {
	var errorMessage = "User is not privileged to work on the selected Item Type";
	webui.showAlert("Error", errorMessage);
}
var lob = node.getValue("Line_Of_Business").getSimpleValue();
var itemNumber = node.getValue("Item_Num").getSimpleValue();
var nodeChild = node.createProduct(null, "Child_Org_Item");
nodeChild.getValue("Temp_Parent_Item").setSimpleValue(itemNumber);
nodeChild.getValue("Line_Of_Business").setSimpleValue(lob);
nodeChild.setParent(newProductsOnboardingRoot)
if (lob == "Wireline") {
	webui.navigate("Create_DC_Location_WRLN", nodeChild);
}
if (lob == "Retail") {
	webui.navigate("Create_DC_Location_RTL", nodeChild);
}
if (lob == "Entertainment") {
	webui.navigate("Create_DC_Location_ENT", nodeChild);
}
}