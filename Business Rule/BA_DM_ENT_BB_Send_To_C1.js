/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DM_ENT_BB_Send_To_C1",
  "type" : "BusinessAction",
  "setupGroups" : [ "BR_DataFix" ],
  "name" : "Data Conversion Catalog One BB Items",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonLib"
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
exports.operation0 = function (node,step,commonLib) {
/**
 * @author - John /Pradeep
 * Data Conversion for BB items to be sent to Catalog One
 * One time data conversion for this attribute
 */
 

var partialApprList = new java.util.ArrayList();

	
	node.getValue("BB_Send_To_C1").setLOVValueByID("Y");	
     parAppr();





function parAppr() {	
	partialApprList.add("BB_Send_To_C1");
	commonLib.partialApproveFields(node, partialApprList);
}

}