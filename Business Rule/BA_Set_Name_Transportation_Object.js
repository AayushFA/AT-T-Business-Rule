/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Set_Name_Transportation_Object",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_OnApproval_Actions" ],
  "name" : "Set Transportation Objects Name",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Transportation_Handling_Unit", "Transportation_Package" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
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
//Populate Name field
/**
 * Populates the 'Name' field for each child node based on item number, ordering UOM, handling unit type, and handling unit ID.
 * @param {Object} node - The parent node containing child nodes to update.
 * @returns {void}
 */
	//var itemNum=node.getValue("Parent_Item_Number") ? node.getValue("Parent_Item_Number").getSimpleValue() : "";
	var itemNum= node.getParent().getValue("Item_Num").getSimpleValue();
	var objectType=node.getObjectType().getID();
	var name;

	if (objectType == "Transportation_Package") {
		var orderingUOM = node.getValue("TMS_Ordering_UOM") ? node.getValue("TMS_Ordering_UOM").getSimpleValue() : "";
		if (orderingUOM){
			name = itemNum + "-" + orderingUOM;
		}
	} else if (objectType == "Transportation_Handling_Unit") {
			var huOrderingUOM = node.getValue("TMS_Ordering_UOM") ? node.getValue("TMS_Ordering_UOM").getSimpleValue() : "";
			var handlingUnitType = node.getValue("TMS_Handling_Unit_Type") ? node.getValue("TMS_Handling_Unit_Type").getSimpleValue() : "";
			var tmsHandlingUnitId = node.getValue("TMS_Handling_Unit_ID") ? node.getValue("TMS_Handling_Unit_ID").getSimpleValue() : "";
			name = itemNum + "-" + huOrderingUOM + "-" + handlingUnitType + "-" + tmsHandlingUnitId;
	}

	log.info("Name :" + name);
	node.setName(name);	
}