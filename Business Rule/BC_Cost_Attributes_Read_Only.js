/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Cost_Attributes_Read_Only",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Web_UI_Conditions" ],
  "name" : "Cost Attributes UI Read Only",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
  "binds" : [ {
    "contract" : "ManagerBindContract",
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ReadOnlyContextBind",
    "alias" : "readOnly",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUpTableHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (stepManager,node,readOnly,lookUpTableHome) {
/*    @author - John
 *   List Price to be Read-Only, Except DirecTV Type.
 *   RSC should be read-only for DirecTV Type.
 *   ENT DTV Item Type List - Access Card|Accessory Antenna|Accessory Cable|Accessory Part|Accessory Power|Accessory Remote|
 *   AIM Meter|DECA Broadband|DECA Receiver|DECA Wireless|DVR To Go|External Hard Drive|Field Inventory Aggregation Code|
 *   Generic Group|IRD CLIENT|IRD STB|IRD STB DVR|Literature|LNB NON SWM|LNB SWM|MDU Server|Minor Material Field Only|
 *   MultiSwitch Non SWM|MultiSwitch SWM|Off Air Tuner|Recovery Kit|WildBlue Internet|Wireless Video Bridge
 */

var attributeHome = stepManager.getAttributeHome();
var lob = node.getValue("Line_Of_Business").getID();
var lookupResult = "";

if (node.getValue("Line_Of_Business").getID() == "ENT") {

   var itemTypeENT = node.getValue("ENT_Item_Type").getID();
   lookupResult = lookUpTableHome.getLookupTableValue("LT_Item_Type_List", "DTV_ENT_ItemsType_List");  
   if (lookupResult && lookupResult.includes(itemTypeENT)) {   	
      readOnly.setReadOnly(node, attributeHome.getAttributeByID("Requested_Standard_Cost"));
   } else {   		
      readOnly.setReadOnly(node, attributeHome.getAttributeByID("List_Price"));
   }
}

return true;
}