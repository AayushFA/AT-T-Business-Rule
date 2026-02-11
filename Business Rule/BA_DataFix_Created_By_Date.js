/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DataFix_Created_By_Date",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Data_Fix_Actions" ],
  "name" : "Data Fix for Created By and Date",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Item" ],
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
 * Data fix for Created By and Created Date Audit Attributes.
 */

var revision = node.getRevisions().toArray();
var successRev = "";
var objType = node.getObjectType().getID();

var apprManager = step.executeInWorkspace("Approved", function(step) {
	return step;
});

var apprNode = apprManager.getProductHome().getProductByID(node.getID());

if (apprNode) {

	var apprRev = apprNode.getRevisions().toArray();	
	var successRev = fetchFinalRev(apprNode, apprRev, node);
	if (successRev) {
		
		var createdBy = successRev.getUserID();
		var createdDate = setDateTime(successRev.getCreatedDate());
		node.getValue("Created_By").setSimpleValue(createdBy);
		node.getValue("Created_Date").setSimpleValue(createdDate);		
	}
}

function setDateTime(date) {
	var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	var formattedDateTime = dateTimeFormatter.format(date);
	return formattedDateTime;
}

// partial Approve
var IDArray = new java.util.ArrayList();
IDArray = ["Created_By", "Created_Date"];
BPALib.partialApproveFields(node, IDArray);

//Fetch final revision
function fetchFinalRev(apprNode, apprRev, obj) {
	var successRev = "";
	if (apprNode) {

		for (var i = apprRev.length - 1; i >= 0; i--) {
			var nodeItemName = apprRev[i].getNode().getName();
			var revDate = apprRev[i].getCreatedDate();
			var revUser = apprRev[i].getUserID();
			var revNo = apprRev[i].getName();
			if (revUser != 'STEPSYS') {
				successRev = apprRev[i];
				break;
			}
		}
	}
	return successRev;
}
}