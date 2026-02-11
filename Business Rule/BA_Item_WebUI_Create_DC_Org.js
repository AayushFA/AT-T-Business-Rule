/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Item_WebUI_Create_DC_Org",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Web_UI_Actions" ],
  "name" : "Item Create DC Org",
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
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webUiContext",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,lookUpTable,webUiContext,commonChildOrgDerivationLib,commonChildOrgValidationLib) {
/**
 * @author -  Madhuri, John [CTS]
 * DC Child Org Creation from Web UI
 */

var tempParent = node.getValue("Temp_Parent_Item").getSimpleValue();
if (tempParent) {
	var parentObject = stepManager.getNodeHome().getObjectByKey("Item.Key", tempParent);
	if (parentObject) {
		var lob = parentObject.getValue("Line_Of_Business").getID();
		var itemClass = parentObject.getValue("Item_Class").getID();	
		var itemType = parentObject.getValue(lob + "_Item_Type").getID();
		var organizationID = node.getValue(lob + "_DC_Org_Code").getLOVValue().getID();
		if (organizationID) {
			var flag = commonChildOrgValidationLib.validateChildOrgObject(parentObject, stepManager, organizationID);
			if (flag) {
				var childOrgLookupResult = lookUpTable.getLookupTableValue("LT_Additional_DC_Child_Orgs", itemClass);
				if (childOrgLookupResult) {
					if (!childOrgLookupResult.contains(organizationID)) {
						childOrgLookupResult = childOrgLookupResult+"";
						childOrgLookupResult = childOrgLookupResult.replace(/\|/g, ",");
						webUiContext.showAlert("ERROR", "Child org is not valid for the Item type( " + itemType + " ) selected.", "Valid child orgs are " + childOrgLookupResult);
					} else {
						node.setParent(parentObject);
						commonChildOrgDerivationLib.setChildOrgAttributes(parentObject, node, organizationID, stepManager, lookUpTable);
						var itemStatus = node.getValue("Item_Status_" + lob).getID();
						node.getValue("Item_Status").setLOVValueByID(itemStatus);
						commonChildOrgDerivationLib.dcChildOrgUiNavigation(parentObject, webUiContext, stepManager);
					}
				} else {
					webUiContext.showAlert("ERROR", "Failure", "Unable to get valid child orgs ");
				}
			} else {
				webUiContext.showAlert("ERROR", "Failure", "Child Org for the selected DC already exists");
			}
		}
	}
}

}