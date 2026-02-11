/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_Validate_Primary_Image_Exist",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Web_UI_Conditions" ],
  "name" : "Validate Primary Image Exist",
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
exports.operation0 = function (node,stepManager) {
var primaryProductImageRefType = stepManager.getReferenceTypeHome().getReferenceTypeByID("PrimaryProductImage");
var primaryProductImages = node.getReferences(primaryProductImageRefType).toArray();
if(primaryProductImages.length>0){
	return primaryProductImages.length>0;
}
return false;
}