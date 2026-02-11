/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Child_Org_Retail_Derivation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Derivation_Libraries" ],
  "name" : "Child Org Retail Library Derivation",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Child_Org_Common_Derivation",
    "libraryAlias" : "commonChildOrgDerivationLib"
  }, {
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
function createRetailChildOrgs(node, stepManager, lookUpTableHome){
	var itemAssignScope = node.getValue("Item_Assign_Scope").getSimpleValue();
	var itemType = node.getValue("RTL_Item_Type").getID();
	if(itemAssignScope && itemType){		
		createDefaultItemChildOrgs(node, stepManager, itemAssignScope, itemType, lookUpTableHome);
	}	
	var children = node.queryChildren().asList(1000);           	    	
	    children.forEach(function(child) {
			if (child.getObjectType().getID() == "Companion_SKU") {			
				createDefaultItemChildOrgs(child,stepManager,itemAssignScope, itemType,lookUpTableHome);
				createDefaultCompSkuChildOrgs(child,stepManager,lookUpTableHome);
			}
			return true;
	    });
}

function createDefaultCompSkuChildOrgs(node,stepManager,lookUpTableHome) {
	var compSku = node.getValue("Companion_Item_Type").getSimpleValue();
	var childOrgs = lookUpTableHome.getLookupTableValue("LT_Retail_Default_ChildOrgs", compSku);
	if (childOrgs) {
		createChildOrgs(node,stepManager,childOrgs,lookUpTableHome);
	}
}

function createDefaultItemChildOrgs(node,stepManager,itemAssignScope,itemType,lookUpTableHome) { //create Child Orgs based on Item Types & Item Assignment Scope	
	var childOrgs = lookUpTableHome.getLookupTableValue("LT_Retail_Default_ChildOrgs", itemType + "|" + itemAssignScope);
	if (childOrgs) {
		createChildOrgs(node,stepManager,childOrgs,lookUpTableHome);
	}
}

function createChildOrgs(node, stepManager, childOrgs, lookUpTableHome) {
	childOrgs = childOrgs.split("\\|");
	for (i = 0; i < childOrgs.length; i++) {
		var OrgID = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_ORG_Code").getListOfValuesValueByID(childOrgs[i]);
		if (OrgID) {
			var flag = commonChildOrgValidationLib.validateChildOrgObject(node, stepManager, childOrgs[i]);
			if (flag) {
				childOrgItem = node.createProduct(null, "Child_Org_Item");							
				commonChildOrgDerivationLib.setChildOrgAttributes(node, childOrgItem, childOrgs[i], stepManager, lookUpTableHome);
			     //childOrgItem.approve();
			}
		}
	}
}




/*===== business library exports - this part will not be imported to STEP =====*/
exports.createRetailChildOrgs = createRetailChildOrgs
exports.createDefaultCompSkuChildOrgs = createDefaultCompSkuChildOrgs
exports.createDefaultItemChildOrgs = createDefaultItemChildOrgs
exports.createChildOrgs = createChildOrgs