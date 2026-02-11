/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_LEPrice_Bulk_Updt",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_GlobalBusinessAction" ],
  "name" : "LEPrice Bulk Updt",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "BPALib"
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
    "contract" : "DataIssuesContextBind",
    "alias" : "dataIssues",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,dataIssues,BPALib) {
var EBSProcessed = node.getValue("BPA_Processed_In_EBS").getID();
var CIPrice = node.getParent().getValue("Price").getSimpleValue();
var errMsg =""

if(CIPrice && CIPrice != 0){
      BPALib.LEPriceCalc(node,CIPrice); 
 }
 else
      errMsg = errMsg + "\nPlease provide Price on the Parent Line Item: "+node.getParent().getID(); 
  if(errMsg !="")
	dataIssues.addWarning(errMsg);	
}