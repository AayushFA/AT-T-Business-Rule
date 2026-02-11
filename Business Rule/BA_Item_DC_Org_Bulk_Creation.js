/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Item_DC_Org_Bulk_Creation",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Smartsheet_Actions" ],
  "name" : "Item DC Org Bulk Creation",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Child_Org_Common_Derivation",
    "libraryAlias" : "commonChildOrgDerivationLib"
  }, {
    "libraryId" : "BL_Child_Org_Common_Validation",
    "libraryAlias" : "commonChildOrgValidationLib"
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
exports.operation0 = function (node,stepManager,lookUpTable,commonChildOrgDerivationLib,commonChildOrgValidationLib) {
/**
 * @author - Madhuri [CTS]
 * RTL DC Bulk Creation
 */

var tempParent = node.getValue("Temp_Parent_Item").getSimpleValue();
parentObject = stepManager.getNodeHome().getObjectByKey("Item.Key", tempParent);
if(parentObject){
	var lob = parentObject.getValue("Line_Of_Business").getID();
	node.getValue("Line_Of_Business").setLOVValueByID(lob)
	var organizationID = node.getValue(lob+"_DC_Org_Code").getID();
	var flag = commonChildOrgValidationLib.validateChildOrgObject(parentObject, stepManager, organizationID);
	if (flag) {
		node.setParent(parentObject);
		commonChildOrgDerivationLib.setChildOrgAttributes(parentObject, node, organizationID,stepManager,lookUpTable);
		var itemStatus = node.getValue("Item_Status_"+lob).getID();
		node.getValue("Item_Status").setLOVValueByID(itemStatus);
		if (!parentObject.isInWorkflow("Item_Maintenance_Workflow")) {
			parentObject.startWorkflowByID("Item_Maintenance_Workflow", "Initiated into Maintenance Workflow on Bulk DCs creation");
			parentObject.getValue("Bulk_Updt_Ind").setSimpleValue("Yes");
		}
	}
} 

}