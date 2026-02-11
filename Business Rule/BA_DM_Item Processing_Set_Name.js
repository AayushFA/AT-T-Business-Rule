/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DM_Item Processing_Set_Name",
  "type" : "BusinessAction",
  "setupGroups" : [ "BG_BA_DataMigration_BA's" ],
  "name" : "DM Item Processing & Set Name",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "QueryHomeBindContract",
    "alias" : "query",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,query) {
/**
 * @author - John and Madhuri [CTS]
 * Set Name for Item, Child_Org_Item and Companion_SKU
 */
var orgCode = node.getValue("Organization_Code").getLOVValue();
var itemNum = node.getValue("Item_Num").getSimpleValue();
var obj = node.getObjectType().getID();
var c = com.stibo.query.condition.Conditions;

if (node.getObjectType().getID() == "Item") {
	if (node.getName() == null) {
		if (orgCode != null && itemNum != null)
			node.setName(itemNum + "(" + orgCode.getID() + ")");
	}
}

if (node.getObjectType().getID() == "Child_Org_Item") {
	if (node.getParent().getObjectType().getID() == "Item" || node.getParent().getObjectType().getID() == "Companion_SKU") {
		if (node.getName() == null) {
			if (orgCode != null && itemNum != null)
				node.setName(itemNum + "(" + orgCode.getID() + ")")
			if (orgCode != null && itemNum == null)
				node.setName(orgCode.getID());
		}
	}
}

if (node.getObjectType().getID() == "Companion_SKU") {
   if(node.getValue("Line_Of_Business").getSimpleValue() == "Retail")
	var compType = node.getValue("Companion_Item_Type").getSimpleValue();
    if(node.getValue("Line_Of_Business").getSimpleValue() == "Entertainment")
	var compType = node.getValue("ENT_Companion_Item_Type").getSimpleValue();
	if (node.getName() == null) {
		if (compType != null && itemNum != null)
			node.setName(itemNum + "(" + compType + ")");
		if (compType != null && itemNum == null)
			node.setName(compType);
	}
}
}
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
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
exports.operation1 = function (node) {
/**
 * @author - John and Madhuri [CTS]
 * Approve the Current Node
 */
 
node.approve();
}