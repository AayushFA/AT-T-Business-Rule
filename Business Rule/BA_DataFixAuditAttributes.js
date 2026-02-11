/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DataFixAuditAttributes",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Data_Fix_Actions" ],
  "name" : "Data Fix for Audit Attributes SOX",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
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
 * @author - Abiraami [CTS]
 * Data fix for audit attributes
 */
 
var revision = node.getRevisions().toArray();
//var createDate = node.getValue("Creation_Date").getSimpleValue();
var successRev;
var objType = node.getObjectType().getID();
var itemName = null;
//logger.info("Object type:" + objType)

//Revision history from approved workspace
var apprManager = step.executeInWorkspace("Approved", function(step) {
	return step;
});

var apprNode = apprManager.getProductHome().getProductByID(node.getID());
if (objType.contains("BOM") || objType.contains("Bill")) {
	var apprNode = apprManager.getEntityHome().getEntityByID(node.getID());
}
//logger.info("approve node:" +apprNode )
if (apprNode) {
	var apprRev = apprNode.getRevisions().toArray();
	//logger.info("App rev: " + apprRev[apprRev.length - 1]);

	if (objType == "Item" || objType == "Companion_SKU" || objType == "Child_Org_Item") {
		for (i = revision.length - 1; i > 0; i--) {
			itemName = revision[i].getNode().getName();
			//logger.info("itemName:[" + i + "]" + itemName);
			if (itemName) {
				var user = revision[i].getUserID();
				if (user != "STEPSYS") {
					successRev = i;
					break;
				}
			}
		}
	} else {
		successRev = revision.length - 1
	}
	
	var lastUpdatedBy = null;
	for (i = 0; i < revision.length - 1; i++) {
		updUser = revision[i].getUserID();
		if (updUser != "STEPSYS") {
			lastUpdatedBy = updUser;
			break;
		}
	}
if (successRev) {
		var createdBy = revision[successRev].getUserID();
		var createdDate = setDateTime(revision[successRev].getCreatedDate());
		node.getValue("Created_By").setSimpleValue(createdBy);
		node.getValue("Created_Date").setSimpleValue(createdDate);
		//logger.info("Created date: " + createdDate)
	}
	
	var lastUpdatedDate = setDateTime(apprNode.getRevision().getCreatedDate());
	if (createdDate != lastUpdatedDate && createdDate) {
		node.getValue("Last_Updated_By").setSimpleValue(lastUpdatedBy);
		node.getValue("Last_Updated_DateTime").setSimpleValue(lastUpdatedDate);
	}
}

function setDateTime(date) {
	var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	var formattedDateTime = dateTimeFormatter.format(date);
	return formattedDateTime;
}

// Fix for doing partial Approving
var IDArray = new java.util.ArrayList();		
IDArray = ['Created_By','Created_Date','Last_Updated_By','Last_Updated_DateTime'];	
BPALib.partialApproveFields(node, IDArray);

//logger.info("Approved revision:" + apprRev[0])
//logger.info("Approved revision:" + apprRev[apprRev.length - 1])
}