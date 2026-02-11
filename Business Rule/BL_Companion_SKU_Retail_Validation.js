/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Companion_SKU_Retail_Validation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Validation_Libraries" ],
  "name" : "Companion SKU Retail Validation Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessLibrary",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
function validateExistingCompanionSkus(node) {
    var errorMessage = "";
	var companionItemTypeTemp = node.getValue("Companion_Item_Type_Temp").getSimpleValue();
	if (companionItemTypeTemp) {
		var companionItemTypes = node.getValue("Companion_Item_Type").getSimpleValue() + "";
		companionItemTypeTemp = companionItemTypeTemp.split("<multisep/>");
		companionItemTypeTemp.forEach(function(companion) {			
			if (companionItemTypes.includes(companion)) {
				errorMessage += "Selected Companion Sku " + companion + " is already added";				
			}
		});
	}
	return errorMessage;
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.validateExistingCompanionSkus = validateExistingCompanionSkus