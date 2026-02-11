/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_DeleteProcessedStagingObj",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "Delete Processed Staging BPA Object",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "StagingBPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
exports.operation0 = function (node,step) {
/*
 * Author- Abiraami
 * STIBO-1048
 * Delete the processed Staging BPA objects
 */
var dateNow=new Date();
var importedTS = node.getValue("Imported_TS").getSimpleValue();
var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
var curTS = dateTimeFormatter.format(dateNow);
if(importedTS){
	//Fetch the date from ISO date time attribute value
	var dateDiff = curTS.split("-")[2].split(" ")[0] - importedTS.split("-")[2].split(" ")[0];
	if(dateDiff > 1){
		node.delete();
	}
}

}