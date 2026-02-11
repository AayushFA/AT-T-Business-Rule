/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Initiate_Item_Maintenance_Workflow",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Web_UI_Actions" ],
  "name" : "Initiate Item Maintenance Workflow",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Item", "Companion_SKU" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Common_Validation",
    "libraryAlias" : "commonLib"
  }, {
    "libraryId" : "BL_SPL_Derivation",
    "libraryAlias" : "splLib"
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
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "dataIssues",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUpTable",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,webui,dataIssues,lookUpTable,commonLib,splLib) {
var selection = webui.getSelection();
var errorMessage = splLib.populateSPLWarningMessage(stepManager) + "\n" + "";
var initialErrorMessageLength = errorMessage.length;
selection.forEach(function(item) {
	var itemID = item.getID();
	var objectTypeList = ["Companion_SKU", "Child_Org_Item"];
	var isMaintenanceWorkflow = item.isInWorkflow("Item_Maintenance_Workflow");
	var errorReason = null;
	var userRoleError = commonLib.validateUserRole(item, stepManager, lookUpTable);
	if (userRoleError) {
		dataIssues.addError(userRoleError);
	}
	if (!userRoleError) {
		if (isMaintenanceWorkflow) {
			errorReason = "  :Item already in Maintenance Workflow ";
		}
		if (!errorReason) {
			var childOrgCode = item.getValue("Organization_Code").getID();
			if (childOrgCode == "ASE") {
				errorReason = "  :Item cannot be moved into the Maintenance Workflow as the Organization Name is ASE ";
			}
		}
		if (!errorReason) {
			var objectType = item.getObjectType().getID();
			var itemNumber = item.getValue("Item_Num").getSimpleValue();
     			if (objectTypeList.includes(String(objectType))) {
				if (!itemNumber) {
					errorReason = " Item cannot be moved into Maintenance. It is still in the creation process ";
				}
			}
			if (objectType == "Item" && item.isInWorkflow("Item_Creation_Workflow")) {
				var creationWorkflowInstance = item.getWorkflowInstanceByID("Item_Creation_Workflow");
				if (creationWorkflowInstance && !creationWorkflowInstance.getTaskByID("Finish")) {
					errorReason = " Item cannot be moved into Maintenance. It is still in the creation process  ";
				}
			}
			if (item.getObjectType().getID() == "Child_Org_Item" && item.getValue("Line_Of_Business").getID() == "NTW") {
				errorReason = " NTW Org cannot be initiated into Maintenance WorkFlow ";	
			}
		}
		if (errorReason) {
			errorMessage += "\n" + itemID + "<html><body><b><font color = red>" + errorReason + "</font></b></body></html>";
		} else {
			item.startWorkflowByID("Item_Maintenance_Workflow", "Item Moved into Maintenance Workflow");
			errorMessage += "\n" + itemID + "<html><body><b><font color = green>  :Item Moved Successfully into the Maintenance Workflow </font></b></body></html>";
		}
	}
});
if (errorMessage.length > initialErrorMessageLength) {
	webui.showAlert("Warning", "Result Details: ", errorMessage);
} else {
	return null;
}
}