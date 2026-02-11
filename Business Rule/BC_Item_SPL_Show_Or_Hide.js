/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_SPL_Show_Or_Hide",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Web_UI_Conditions" ],
  "name" : "SPL UI Show Or Hide",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
exports.operation0 = function (node,stepManager,hide) {
/*
 author: aw240u
 desc: to hide watch specific attribute on ui
 */

var appleLob = node.getValue("Apple_LoB").getID();
if(appleLob == "iPad" || appleLob=="iPhone"){
		hide.setHidden(node,stepManager.getAttributeHome().getAttributeByID ("Band_Color"));
		hide.setHidden(node,stepManager.getAttributeHome().getAttributeByID ("Band_Material"));
		hide.setHidden(node,stepManager.getAttributeHome().getAttributeByID ("Band_Size"));
		hide.setHidden(node,stepManager.getAttributeHome().getAttributeByID ("Band_Type"));
		hide.setHidden(node,stepManager.getAttributeHome().getAttributeByID ("Widget_Color"));
		hide.setHidden(node,stepManager.getAttributeHome().getAttributeByID ("Widget_Material"));
		hide.setHidden(node,stepManager.getAttributeHome().getAttributeByID ("Widget_Size"));
}
}