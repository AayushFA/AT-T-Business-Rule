/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DataFix_Network_NTWOrgCreation",
  "type" : "BusinessAction",
  "setupGroups" : [ "BR_DataFix" ],
  "name" : "DataFix Network Org Creation",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
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
    "alias" : "stepManager",
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
exports.operation0 = function (node,stepManager,query) {
/**
 * @author - Pradeep 
 * Child Org Creation for Network org - NTW
 */ 

//networkChildOrgCreationLib.createNetworkChildOrg(node, stepManager, query, "NTW");
createNetworkChildOrg(node, stepManager, "NTW");

function createNetworkChildOrg(node, stepManager, orgCode) {
	
	var orgID = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_ORG_Code").getListOfValuesValueByID(orgCode);
	if (orgID) {		
			childOrgItem = node.createProduct(null, "Child_Org_Item");
			setNetworkChildOrgAttributes(node, childOrgItem, orgCode);		
	}
}

function setNetworkChildOrgAttributes(parentNode, childOrgItem, orgCode) {
	
	childOrgItem.getValue("Organization_Code").setLOVValueByID(orgCode);
	var itemNum = parentNode.getValue("Item_Num").getSimpleValue();
	if (itemNum) {
		childOrgItem.getValue("Child_Org_Identity").setSimpleValue(parentNode.getID() + "." + orgCode);
		childOrgItem.setName(itemNum + "(" + orgCode+")");	
	}
	childOrgItem.getValue("Send_Item_Info").setLOVValueByID("Y");
}

childOrgItem.approve();

}