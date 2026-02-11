/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetUpdateType_For_CI",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "Set UpdateType For ContractItem",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item" ],
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
/**
 * @author - Piyal [CTS]
 * Set Update Type
 */

var approveVal = null;
var objectType = node.getObjectType().getID();

if (objectType == 'Contract_Item') {
	var bpaNo = node.getParent().getValue("Oracle_Contract_Num").getSimpleValue();
	if (bpaNo) {
		var zipMain = node.getValue("ZIP_Details").getSimpleValue();
		var schrgMain = node.getValue("Servicharge_Details").getSimpleValue();
		getValueFromApprovedWS(node, "ZIP_Details");
		var zipApprove = approveVal;
		getValueFromApprovedWS(node, "Servicharge_Details");
		var schrgApprove = approveVal;
		var result = "";
		var scflag = false;
		var zipFlag = false;

		if ((zipApprove || zipMain) && !(zipMain.equals(zipApprove))) {
			result = "LINE*ZIP*";
			zipFlag = true;
		}
		if ((schrgMain || schrgApprove) && !(schrgMain.equals(schrgApprove))) {
			result = "LINE**SC";
			scflag = true;
		}
		if (zipFlag && scflag) {
			result = "LINE*ZIP*SC";
		}
		if (!zipFlag && !scflag) {
			result = "LINE**";
		}
		node.getValue("Contract_Item_ Update_Type").setLOVValueByID(result)
	}
}

function getValueFromApprovedWS(node, atrr) {

	var approveWSOBJ = null;
	appNode = step.executeInWorkspace("Approved", function(approvedManager) {
		approveWSOBJ = approvedManager.getObjectFromOtherManager(node);		
		if (approveWSOBJ) {		
			approveVal = approveWSOBJ.getValue(atrr).getSimpleValue();			
			if (approveVal) {		
				return approveVal;
			}
			return null;
		}
	});
}

}