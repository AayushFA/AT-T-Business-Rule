/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Child_Org_Network_Derivation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Derivation_Libraries" ],
  "name" : "Child Org Network Library Derivation",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Child_Org_Common_Validation",
    "libraryAlias" : "commonChildOrgValidationLib"
  } ]
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
/**
 * @author - Syed
 * create Network Child Org
 */

function createNetworkChildOrg(node, stepManager, orgCode) {	
	var orgId = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_ORG_Code").getListOfValuesValueByID(orgCode);
	if (orgId) {
		var flag = commonChildOrgValidationLib.validateChildOrgObject(node, stepManager, orgCode);
		if (flag) {
			childOrgItem = node.createProduct(null, "Child_Org_Item");
			setNetworkChildOrgAttributes(node, childOrgItem, orgCode);
		}
	}
}

function setNetworkChildOrgAttributes(itemNode, childOrgItem, orgCode) {	
	childOrgItem.getValue("Organization_Code").setLOVValueByID(orgCode);
	childOrgItem.getValue("Child_Org_Identity").setSimpleValue(itemNode.getID() + "." + orgCode);									
	childOrgItem.getValue("Send_Item_Info").setLOVValueByID("Y");
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.createNetworkChildOrg = createNetworkChildOrg
exports.setNetworkChildOrgAttributes = setNetworkChildOrgAttributes