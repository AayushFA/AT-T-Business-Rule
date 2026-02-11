/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_Validate_Asset_Exist",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Web_UI_Conditions" ],
  "name" : "Validate Asset Exist",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Item", "Companion_SKU" ],
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
    "contract" : "ManagerBindContract",
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (stepManager,node) {
var primaryProductImageRefType = stepManager.getReferenceTypeHome().getReferenceTypeByID("PrimaryProductImage");
var alternateAssetRefType = stepManager.getReferenceTypeHome().getReferenceTypeByID("AlternateAssetReferences");
var primaryProductImages = node.getReferences(primaryProductImageRefType).toArray();
var alternateAssetReferences = node.getReferences(alternateAssetRefType).toArray();
var totalReferencesCount = primaryProductImages.length + alternateAssetReferences.length;
if (totalReferencesCount > 0) {
	return totalReferencesCount > 0;
}
return false;
}