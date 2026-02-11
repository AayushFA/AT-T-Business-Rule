/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_CompanionSKU_Read_Only",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Web_UI_Conditions" ],
  "name" : "CompanionSKU UI Read Only",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Companion_SKU" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonDerivationLib"
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
    "contract" : "ReadOnlyContextBind",
    "alias" : "readOnly",
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
    "alias" : "lookUpTableHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webUI",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,readOnly,stepManager,lookUpTableHome,webUI,commonDerivationLib) {
var attributeHome = stepManager.getAttributeHome();
var lob = node.getValue("Line_Of_Business").getID();
var approvedCost = "";
approvedCost = commonDerivationLib.isAttributeValueChanged(node, stepManager, "Requested_Standard_Cost");
if (!approvedCost) {
	readOnly.setReadOnly(node, attributeHome.getAttributeByID("Change_Reason"));
}
if (node.getValue("No_Std_Cost_Propagation").getID() != "Y") {
	readOnly.setReadOnly(node, attributeHome.getAttributeByID("Current_Standard_Cost"));
}

var companionItemType = "";
if (lob == "RTL") {
	companionItemType = node.getValue("Companion_Item_Type").getSimpleValue();
}
if (lob == "ENT") {
	companionItemType = node.getValue("ENT_Companion_Item_Type").getSimpleValue();
}
companionItemType = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_Companion_Item_Type_Duplicate").getListOfValuesValueByID(companionItemType).getValue();
var readOnlyAttributes = lookUpTableHome.getLookupTableValue("LT_CompanionSKU_UI_ReadOnly_Attributes", "Create_Update_Attributes");
if (readOnlyAttributes) {
	readOnlyAttributesList = readOnlyAttributes.split(",");
	readOnlyAttributesList.forEach(function(attributeId) {

		var companionItemTypesList = lookUpTableHome.getLookupTableValue("LT_CompanionSKU_UI_ReadOnly_Attributes", attributeId);
		if (companionItemTypesList) {
			if (companionItemTypesList.includes(companionItemType) || companionItemType.substring(0, 2).equals("FG") || companionItemType.substring(0, 3).equals("WIP")) {
				readOnly.setReadOnly(node, attributeHome.getAttributeByID(attributeId));
			}
		}
	});
}
return true;

}