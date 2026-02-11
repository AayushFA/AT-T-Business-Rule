/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_Retail_Show_Or_Hide",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Web_UI_Conditions" ],
  "name" : "Retail UI Show Or Hide",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Generate_Item_Number",
    "libraryAlias" : "itmGenLib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
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
    "contract" : "HiddenContextBind",
    "alias" : "hide",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,hide,itmGenLib) {
/**
 * @authors -  John [CTS]
 * Prevent warranty field should be shown in webui only for product class --> Accessory
 */
var attributeHome = stepManager.getAttributeHome();
var lob = node.getValue("Line_Of_Business").getID();
var productClass = node.getValue("Product_Class").getID();
// STIBO-2766 Prod Support Team Jan 25 Release
if (lob == "RTL" && productClass != "ACCESSORY") {
    hide.setHidden(node, attributeHome.getAttributeByID("Prevent_Warranty"));
}
/**
 * author : Syed
 * Rule : Hide the Companion Item Type attribute in WebUI Item Onboarding and Item Maintenance Page if item Class not in 
 * Device Items such as BAU Device Computer, BAU Device Electronic, BAU Device Phone, BAU Device PrePaid, BAU Device Demo
 */
	
var itemClass=node.getValue("Item_Class").getID();
var rtlDeviceList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Device_Item_Class").getSimpleValue();
	if(lob=="RTL" && !rtlDeviceList.includes(itemClass)){
		hide.setHidden(node, attributeHome.getAttributeByID("Companion_Item_Type"));
}

/*
 author: aw240u(cognizant)
 */

 var parLob = node.getValue("Line_Of_Business").getID();
  var itemClassId = node.getValue("Item_Class").getID();
  itemClassId = itmGenLib.replaceSpaceWithUnderscores(String(itemClassId));
  var attrHome = stepManager.getAttributeHome();
  var userEnteredItemValue = node.getValue("User_Defined_Item_Num").getSimpleValue();
  if ((parLob == "RTL")&& (itemClassId!="BAU_Wireline")) {
     var result = itmGenLib.getPrfixBasedOnItemClass(stepManager, itemClassId);
      var sequenceId = result.sequenceName;
      if (sequenceId.trim() == "User Defined") {
      	//do nothing
      }else{
      	  hide.setHidden(node,attrHome.getAttributeByID ("User_Defined_Item_Num"));
           
	  }	
  }
}