/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_DC_Org_Bulk_Creation_Validations",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Smartsheet_Conditions" ],
  "name" : "Item DC Org Creation Validations",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonDerivationLib"
  }, {
    "libraryId" : "BL_Child_Org_Common_Validation",
    "libraryAlias" : "commonChildOrgValidationLib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
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
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUpTable",
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
exports.operation0 = function (node,stepManager,lookUpTable,dataIssues,commonDerivationLib,commonChildOrgValidationLib) {
/**
 * @author - Madhuri, John[CTS]
 * Bulk Update Validation
 */

var tempParent = node.getValue("Temp_Parent_Item").getSimpleValue();
parentObject = stepManager.getNodeHome().getObjectByKey("Item.Key", tempParent);
var errorMessage = "";
var errorFlag = false;

if (tempParent) {
	if (parentObject) {
		var lob = parentObject.getValue("Line_Of_Business").getID();
		var itemClass = parentObject.getValue("Item_Class").getID();
	     var organizationID = node.getValue(lob+"_DC_Org_Code").getID();
		 var itemType = parentObject.getValue(lob+"_Item_Type").getID();
		var maintWFPublishState = commonDerivationLib.getWorkflowState(parentObject, "Item_Maintenance_Workflow", "Publish_Queue");
		if (maintWFPublishState) {
			errorMessage = "Parent Item is in Publish Queue of Maintenance WF, DCs cannot be added.";
			errorFlag = true;
		} else {
			if (organizationID) {
				var flag = commonChildOrgValidationLib.validateChildOrgObject(parentObject, stepManager,organizationID);
				if (flag) {
					var childOrgLookupResult = lookUpTable.getLookupTableValue("LT_Additional_DC_Child_Orgs", itemClass);
					if (childOrgLookupResult) {
						if (!childOrgLookupResult.contains(organizationID)) {
							childOrgLookupResult = childOrgLookupResult + "";
							childOrgLookupResult = childOrgLookupResult.replace(/\|/g, ",");
							errorMessage = "Please select valid Child Org. \n Valid Child Orgs are " + childOrgLookupResult;
							errorFlag = true;
							}
					}
					 else {
						errorMessage = "Unable to get valid child Orgs";	
						errorFlag = true;						
					}
				} else {
					errorMessage = "Child Org for the selected DC already exists.";
					errorFlag = true;
				  }
			} else {
				errorMessage = "Please select Org Code.";
				errorFlag = true;
				}
		}
	} else {
		errorMessage ="Invalid Parent Item";
		errorFlag = true;
	}
} else {
	errorMessage ="Parent Item is Mandatory.";
	errorFlag = true;
}
log.info(errorMessage)
if (errorFlag){
	 dataIssues.addWarning(errorMessage);
	 return dataIssues;
}
else
	return true;
}