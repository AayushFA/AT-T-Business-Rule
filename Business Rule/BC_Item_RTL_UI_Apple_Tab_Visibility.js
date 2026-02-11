/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_RTL_UI_Apple_Tab_Visibility",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Web_UI_Conditions" ],
  "name" : "Retail UI Apple Specifications Tab Visibility",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Companion_SKU", "Item" ],
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
var objectType= node.getObjectType().getID();
if(objectType=="Item"){	
	if(node.getValue("Apple_LoB").getID()){
		return true;
	}
	else {
		return false;
	}
}
else if(objectType=="Companion_SKU"){
	var parent = node.getParent().getObjectType().getID();
	if (parent == "Item"){
		if(node.getParent().getValue("Apple_LoB").getID()){
			return true;
		}
		else {
			return false;
		}
	}
	else
	  return false;
}
else{
	return false;
}
}