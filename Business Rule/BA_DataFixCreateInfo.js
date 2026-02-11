/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DataFixCreateInfo",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_SupportBusinessActions" ],
  "name" : "One time DataFix for CreateInfo",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Item", "Companion_SKU" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
var revisions = node.getRevisions().toArray();
var createdBy = revisions[revisions.length-1].getUserID();
node.getValue("Created_By").setSimpleValue(createdBy);

for(i=revisions.length-1;i>=0;i--){
	if(revisions[i].getNode().getName() != null){
		createdTS = revisions[i].getCreatedDate();
		var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		var formattedDateTime = dateTimeFormatter.format(createdTS);
		break;
	}
}

node.getValue("Created_Date").setSimpleValue(formattedDateTime);
}