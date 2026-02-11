/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_Retail_Conditional_Mandatory",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Web_UI_Conditions" ],
  "name" : "Retail UI Conditional Mandatory",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
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
    "contract" : "MandatoryContextBind",
    "alias" : "mandatory",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (stepManager,node,mandatory) {
/**
 * @author mb916k
 * Set AssortmentPlanning Mandatory for Department, SubDepartment and Operating System if Division is not Null
 */

var attrHome = stepManager.getAttributeHome();
var itemTypeRTL = node.getValue("RTL_Item_Type").getID();
var rtlMobilityItemsList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Retail_Mobility_Items").getSimpleValue();
var rtlATTDeviceList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Retail_Device_Items").getSimpleValue();
var lob = node.getValue("Line_Of_Business").getID();
var apDivision = attrHome.getAttributeByID("AP_Division");
if (!apDivision) {
    return false;
}
if (lob == "RTL" && ((rtlATTDeviceList.includes(itemTypeRTL)) || (rtlMobilityItemsList.includes(itemTypeRTL)) && apDivision) {
        mandatory.setMandatory(node, attrHome.getAttributeByID("AP_Dept"));
        mandatory.setMandatory(node, attrHome.getAttributeByID("AP_Sub_Dept"));
        mandatory.setMandatory(node, attrHome.getAttributeByID("AP_Operating_System"));
        return true;
    }
}