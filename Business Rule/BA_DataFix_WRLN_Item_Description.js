/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DataFix_WRLN_Item_Description",
  "type" : "BusinessAction",
  "setupGroups" : [ "BR_DataFix" ],
  "name" : "DataFix WRLN Item Description",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T Item Library",
    "libraryAlias" : "Lib"
  }, {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "LibBPA"
  } ]
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
    "contract" : "ManagerBindContract",
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,Lib,LibBPA) {
/**
 * @author - John 
 * Data Fix for WRLN Item Description
 * Copy User Defined Item Description to Item Description and convert to Upper Case
 */
 

var partialApprList = new java.util.ArrayList();
var lob = node.getValue("Line_Of_Business").getSimpleValue();
var businessGroup = node.getValue("Business_Group").getID();
var userDefItemDesc = node.getValue("User_Defined_Item_Description").getSimpleValue();

if (lob == "Wireline" && businessGroup && businessGroup == "NONE" && userDefItemDesc) { // Business_Group --> Wireline	
	
	node.getValue("Item_Description").setSimpleValue(Lib.convertToUpperCase(userDefItemDesc));	
     parAppr();
}





function parAppr() {	
	partialApprList.add("Item_Description");
	LibBPA.partialApproveFields(node, partialApprList);
}

}