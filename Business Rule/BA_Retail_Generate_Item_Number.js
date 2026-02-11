/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Retail_Generate_Item_Number",
  "type" : "BusinessAction",
  "setupGroups" : [ "Retail_Item_Number_Generation" ],
  "name" : "Retail Generate Item Number",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Companion_SKU", "Item" ],
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
exports.operation0 = function (node,step,itmGenLib) {
try { //item number generation
	itmGenLib.retailEntertainmentItemNumberGeneration(node, step);
	 //itmGenLib.generateItemNumberWithRetry(node, step)
}
catch (e) {
	//throw e.toString()
	throw itmGenLib.getMessageBetweenWords(e.toString(), "javax.script.ScriptException:", "in Library");
}
}