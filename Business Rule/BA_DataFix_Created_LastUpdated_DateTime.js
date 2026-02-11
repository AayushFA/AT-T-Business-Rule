/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DataFix_Created_LastUpdated_DateTime",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Data_Fix_Actions" ],
  "name" : "Data Fix Created & Last Updated DateTime",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item" ],
  "allObjectTypesValid" : true,
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
exports.operation0 = function (node,step,BPALib) {
/**
 * @author - John [CTS]
 * Data fix for CI Created and Last Updated by  attributes
 */

var IDArray = new java.util.ArrayList();
IDArray = ['Created_Date', 'Last_Updated_DateTime'];

var apprManager = step.executeInWorkspace("Approved", function(step) {
	return step;
});
var apprNode = apprManager.getProductHome().getProductByID(node.getID());

if (apprNode) {

	var apprRev = apprNode.getRevisions().toArray();
	if (apprRev.length > 0) {
		var createdDate = setDateTime(apprRev[apprRev.length - 1].getCreatedDate());
		if (createdDate) {
			node.getValue("Created_Date").setSimpleValue(createdDate);
			BPALib.partialApproveFields(node, IDArray);
		}
		var lastUpdatedDate = setDateTime(apprNode.getRevision().getCreatedDate());
		if (createdDate && createdDate != lastUpdatedDate) {
			node.getValue("Last_Updated_DateTime").setSimpleValue(lastUpdatedDate);
			BPALib.partialApproveFields(node, IDArray);
		}
	}
}

function setDateTime(date) {
	var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	var formattedDateTime = dateTimeFormatter.format(date);
	return formattedDateTime;
}
}