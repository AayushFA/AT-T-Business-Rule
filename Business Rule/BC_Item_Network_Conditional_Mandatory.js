/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_Network_Conditional_Mandatory",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Web_UI_Conditions" ],
  "name" : "Network UI Conditional Mandatory",
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
    "contract" : "MandatoryContextBind",
    "alias" : "mandatory",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (stepManager,mandatory,node) {
/**
 * @author mb916k
 * set Mandatory for ACVoltage,ACCurrent,DCVoltage,DCCurrent and BTUPerHour for PMT Network Attributes
 */
var attrHome = stepManager.getAttributeHome();
var acPower = attrHome.getAttributeByID("AC_Power");
var dcPower = attrHome.getAttributeByID("DC_Power");

if (!acPower && !dcPower) {
    return false;
}

if (acPower) {
    mandatory.setMandatory(node, attrHome.getAttributeByID("AC_Voltage"));
    mandatory.setMandatory(node, attrHome.getAttributeByID("AC_Current"));
   
}

if (dcPower) {
    mandatory.setMandatory(node, attrHome.getAttributeByID("DC_Voltage"));
    mandatory.setMandatory(node, attrHome.getAttributeByID("DC_Current"));
}

mandatory.setMandatory(node, attrHome.getAttributeByID("BTU_Per_Hour"));
return true;
}