/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_RollBackandPartialApprove",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_GlobalBusinessAction" ],
  "name" : "Roll Back and Partial Approve",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Bill_Of_Material", "Item", "BPA", "Child_Org_Item", "BOM_Child", "Contract_Item", "BOM_Child_Substitute", "Companion_SKU" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_Global_Library",
    "libraryAlias" : "globalLib"
  }, {
    "libraryId" : "BL_BOM_Common_Derivation",
    "libraryAlias" : "bomDerivationLib"
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
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,globalLib,bomDerivationLib) {
/**
 * @author - John[CTS]
 * Roll Back and Partial Approve
 */

var objectType = node.getObjectType().getID();
var partialApprList = new java.util.ArrayList();

if (objectType == "Bill_Of_Material") {
    var cancelledFolder = stepManager.getEntityHome().getEntityByID("BOM_Cancelled");
	 var pBOMApprovalStatus = node.getApprovalStatus();
	 if(pBOMApprovalStatus == "Not in Approved workspace"){
			node.setParent(cancelledFolder);
			bomDerivationLib.recursiveApproval(node);
		}else{
			globalLib.rollBackandParitialApprove(node, stepManager, "Entity");
			var pBOMChild = node.queryChildren();
			pBOMChild.forEach(function(cBOM) {
				var cBOMApprovalStatus = cBOM.getApprovalStatus();
				if(cBOMApprovalStatus == "Not in Approved workspace"){
					cBOM.setParent(cancelledFolder);
					bomDerivationLib.recursiveApproval(cBOM);
				}else{
					globalLib.rollBackandParitialApprove(cBOM, stepManager, "Entity");
					var cBOMChild = cBOM.queryChildren();
					cBOMChild.forEach(function(sBOM) {
						var sBOMApprovalStatus = sBOM.getApprovalStatus();
						if(sBOMApprovalStatus == "Not in Approved workspace"){
							sBOM.setParent(cancelledFolder);
							sBOM.approve();
						}else{
							globalLib.rollBackandParitialApprove(sBOM, stepManager, "Entity");
						}
						return true;
					});
				}
				return true;
			});
		}
} else if (objectType == "Item" || objectType == "Child Org Item" || objectType == "Companion SKU") {

	globalLib.rollBackandParitialApprove(node, stepManager, "Product");
} else if (objectType == "Contract") {

	if (isProcessedInEBS(node)) {
		globalLib.rollBackandParitialApprove(node, stepManager, "Product");
	}
} else if (objectType == "Contract Item") {

	if (isProcessedInEBS(node)) {		
		globalLib.rollBackandParitialApprove(node, stepManager, "Product");
		var childCI = node.getChildren().toArray();
		childCI.forEach(function(leChild) {
			if (isProcessedInEBS(leChild)) {
				globalLib.rollBackandParitialApprove(leChild, stepManager, "Product");
			}
		});
	}
}

function isProcessedInEBS(node) {

	var  bpaProcessesedStatus = node.getValue("BPA_Processed_In_EBS").getSimpleValue();	
	if(bpaProcessesedStatus == "Yes" || bpaProcessesedStatus == "Eligible to Reopen"){
		return true;
	}	
}
}