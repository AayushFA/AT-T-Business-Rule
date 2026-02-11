/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_Retail_Visually_Mandatory",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Web_UI_Conditions" ],
  "name" : "Retail UI Visually Mandatory",
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
    "alias" : "manager",
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
exports.operation0 = function (node,manager,mandatory,itmGenLib) {
/*
 * athor: aw240u(cognizant)
 */
var parLob = node.getValue("Line_Of_Business").getID();
  var itemClassId = node.getValue("Item_Class").getID();
  itemClassId = itmGenLib.replaceSpaceWithUnderscores(String(itemClassId));
  var attrHome = manager.getAttributeHome();
  var userEnteredItemValue = node.getValue("User_Defined_Item_Num").getSimpleValue();
  if ((parLob == "RTL")&& (itemClassId!="BAU_Wireline")) {
     var result = itmGenLib.getPrfixBasedOnItemClass(manager, itemClassId);
      var sequenceId = result.sequenceName;
      if (sequenceId.trim() == "User Defined") {
      	mandatory.setMandatory(node, attrHome.getAttributeByID("User_Defined_Item_Num"));
        //return true;
      }
  }
}