/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Item_Set_Name_Key_Audit_Attributes",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_OnApproval_Actions" ],
  "name" : "Item Set Name Key Audit Attributes",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Companion_SKU", "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "TriggerAndApproveNewParts",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonLib"
  }, {
    "libraryId" : "AT&T_Audit_Library",
    "libraryAlias" : "auditLib"
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
exports.operation0 = function (node,stepManager,commonLib,auditLib) {
/**
 * @author - Madhuri [CTS],John
 * 1. set Name for all Item Objects (Item, Child Org & Companion SKU)
 * 2. set DMChildOrgKey for all Item Objects (Item, Child Org & Companion SKU)
 * 3. Set Created_By & Created_Date Audit Attributes during creation of all Item Objects
 * 4. Set Last_Updated_By & Last_Updated_Date Audit Attributes during maintenance of all Item Objects
 */

var objectType = node.getObjectType().getID();
var itemNumber = node.getValue("Item_Num").getValue();
var organizationCode = node.getValue("Organization_Code").getID();

setName(node, objectType, itemNumber, organizationCode);
setDMChildOrgKey(node, itemNumber, organizationCode);
setAuditAttributes(node, itemNumber);

function setName(node, objectType, itemNumber, organizationCode) {
	if (objectType == "Child_Org_Item" || objectType == "Item") {		
		node.setName(itemNumber + "(" + organizationCode + ")");
	}
	if (objectType == "Companion_SKU") {
		var companionType = "";
		var lob = node.getValue("Line_Of_Business").getID();
		if (lob == "RTL") {
			var companionTypeValues = node.getValue("Companion_Item_Type").getSimpleValue();
			var companionTypeId = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_Companion_Item_Type_Duplicate").getListOfValuesValueByID(companionTypeValues);
			if (companionTypeId) {
				companionType = companionTypeId.getValue();
			}
		}
		if (lob == "ENT") {
			companionType = "REFURB";
		}
		if (companionType && itemNumber) {
			node.setName(itemNumber + "(" + companionType + ")");
		}
	}
}

function setDMChildOrgKey(node, itemNumber, organizationCode) {	
	if (organizationCode && itemNumber) {		
		var currentKey = node.getValue("DM_Child_Org_Key").getSimpleValue();
		var key = itemNumber + "." + organizationCode;
		if (!currentKey) {
			node.getValue("DM_Child_Org_Key").setSimpleValue(key);
		} else if (currentKey != key) { // Update the key  
			stepManager.getKeyHome().updateUniqueKeyValues2({
				"DM_Child_Org_Key": String(key)
			}, node);
		}
	}
}

function setAuditAttributes(node, itemNumber) {	
	var approvalStatus = node.getApprovalStatus();
	var currentUser = stepManager.getCurrentUser().getID();
	if (itemNumber && approvalStatus == "Not in Approved workspace") {
		auditLib.setUser(node, currentUser, "Created_By");
		auditLib.setDateTime(node, "Created_Date");
	}
	if (itemNumber && approvalStatus == "Partly approved") {
		auditLib.setUser(node, currentUser, "Last_Updated_By");
		auditLib.setDateTime(node, "Last_Updated_DateTime");
	}
}

}