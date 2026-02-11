/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Trim_Primary_UOM_Code",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_GlobalBusinessAction" ],
  "name" : "Trim Primary UOM Code",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "TriggerAndApproveNewParts",
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
// Global BA for trimming UOM Code

setTempUomCode()

function setTempUomCode() {
	var primaryuom = node.getValue("Primary_UOM").getSimpleValue();
	if(primaryuom){
		var tempuomcode = primaryuom.split(' ')[0];
		tempuomcode = tempuomcode.trim();
		node.getValue("Primary_UOM_Code").setSimpleValue(tempuomcode);
	}
 }	
}