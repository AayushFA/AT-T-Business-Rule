/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_ChildOrg_Read_Only",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Web_UI_Conditions" ],
  "name" : "ChildOrg UI Read Only",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
    "contract" : "ReadOnlyContextBind",
    "alias" : "readOnly",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookupTableHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,readOnly,lookupTableHome) {
/**
 * @authors -  John [CTS]
 * Child Orgs Page attributes Read only
 */

var attributeHome = stepManager.getAttributeHome();
var childOrgsAttributesList = new java.util.ArrayList();
var materialItemType = node.getValue("Material_Item_Type_Web").getID();
var orgCode = node.getValue("Organization_Code").getID();
var childOrgsAttributesEntity = stepManager.getEntityHome().getEntityByID("ItemAttributes_Hierarchy");
var lob = node.getValue("Line_Of_Business").getID();

if (lob == "WRLN") {
	childOrgsAttributesEntity = childOrgsAttributesEntity.getValue("ChildOrgs_Rules_Attributes_Wireline").getSimpleValue();
} else if (lob == "RTL" || lob == "ENT") {
	//readOnly.setReadOnly(node, attributeHome.getAttributeByID("List_Price"));
	childOrgsAttributesEntity = childOrgsAttributesEntity.getValue("ChildOrgs_Rules_Attributes_RTL_ENT").getSimpleValue();
}
childOrgsAttributesList = childOrgsAttributesEntity.split(",");

childOrgsAttributesList.forEach(function(attributeID) {
	getLookUpTableValue(attributeID);
});

function getLookUpTableValue(attributeID) {

	var lookUpTableResult = "";
	if (lob == "WRLN") {
		lookUpTableResult = lookupTableHome.getLookupTableValue("LT_ChildOrg_UI_ReadOnly_Attributes", attributeID + "|" + orgCode);
	} else if (lob == "RTL" || lob == "ENT") {		
		lookUpTableResult = lookupTableHome.getLookupTableValue("LT_ChildOrg_UI_ReadOnly_Attributes", attributeID);
	}
	if (lookUpTableResult) {
		setAttributeReadOnly(lookUpTableResult, attributeID);
	}		
}

function setAttributeReadOnly(lookUpTableResult, attributeID) {

	if (lob == "WRLN") {
		if (lookUpTableResult.includes(materialItemType)) {
			readOnly.setReadOnly(node, attributeHome.getAttributeByID(attributeID));
		}
	} else if (lob == "RTL" || lob == "ENT") {		
		if (lookUpTableResult.includes(orgCode)) {
			if (lob == "RTL" && attributeID == "Item_Status") {
				attributeID = "Item_Status_RTL";
			}
			if (lob == "ENT" && attributeID == "Item_Status") {
				attributeID = "Item_Status_ENT";
			}
			readOnly.setReadOnly(node, attributeHome.getAttributeByID(attributeID));
		}
	}
}

return true;
}