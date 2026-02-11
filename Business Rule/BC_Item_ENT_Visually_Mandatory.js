/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_ENT_Visually_Mandatory",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Web_UI_Conditions" ],
  "name" : "Entertainment UI Visually Mandatory",
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
exports.operation0 = function (node,stepManager,mandatory,itmGenLib) {
var attrHome = stepManager.getAttributeHome();
var itemType = node.getValue("ENT_Item_Type").getID();
var lob = node.getValue("Line_Of_Business").getID();
var objectType = node.getObjectType().getID();
var mandatoryAttributes = ["OEM_Full_Name", "Mfg_Part_No", "CPE_Type"];
if (objectType == "Item" && lob == "ENT" && itemType != "DTV MAKEMODEL") {
    mandatoryAttributes.forEach(function(attr) {
        mandatory.setMandatory(node, attrHome.getAttributeByID(attr));
    });
   // return true;
}
//return false;

 var parLob = node.getValue("Line_Of_Business").getID();
  var itemClassId = node.getValue("Item_Class").getID();
  itemClassId = itmGenLib.replaceSpaceWithUnderscores(String(itemClassId));
  var attrHome = stepManager.getAttributeHome();
  var userEnteredItemValue = node.getValue("User_Defined_Item_Num").getSimpleValue();
  if ((parLob == "RTL" || parLob == "ENT")&& (itemClassId!="BAU_Wireline")) {
     var result = itmGenLib.getPrfixBasedOnItemClass(stepManager, itemClassId);
      var sequenceId = result.sequenceName;
      if (sequenceId.trim() == "User Defined") {
      	mandatory.setMandatory(node, attrHome.getAttributeByID("User_Defined_Item_Num"));
        }
  }
}