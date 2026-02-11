/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Child_Org_Entertainment_Derivation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Derivation_Libraries" ],
  "name" : "Child Org Entertainment Library Derivation",
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

function createEntertainmentChildOrgs(node, stepManager, lookUpTableHome) {
	var itemAssignment = node.getValue("Item_Assign_Scope").getID();
	var itemType = node.getValue("ENT_Item_Type").getID();
	var itemClass = node.getValue("Item_Class").getID();
	createENTChildOrgs(node, stepManager, itemAssignment, itemType, itemClass, lookUpTableHome);		
	var children = node.queryChildren();           	    	
	    children.forEach(function(child) {
			//var child = children.next();
			if (child.getObjectType().getID() == "Companion_SKU") {
				createENTChildOrgs(child, stepManager, itemAssignment, itemType, itemClass, lookUpTableHome);  
			}
			return true;
		});
}

function createENTChildOrgs(node, stepManager, itemAssignment, itemType, itemClass, lookUpTableHome) {
    
	var childOrgs = lookUpTableHome.getLookupTableValue("LT_Entertainment_Default_ChildOrgs",itemType+"|"+itemAssignment);	
	if (childOrgs) {
		childOrgs = childOrgs.split("\\|");
		for (i = 0; i < childOrgs.length; i++) {			
			var OrgID = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_ORG_Code").getListOfValuesValueByID(childOrgs[i]);
			if (OrgID) {
				var flag = commonChildOrgValidationLib.validateChildOrgObject(node, stepManager, childOrgs[i]);
				if (flag) {
					childOrgItem = node.createProduct(null, "Child_Org_Item");					
					commonChildOrgDerivationLib.setChildOrgAttributes(node, childOrgItem, childOrgs[i],stepManager, lookUpTableHome);
				}
			}
		}
	}	
}

/*===== business library exports - this part will not be imported to STEP =====*/
exports.createEntertainmentChildOrgs = createEntertainmentChildOrgs
exports.createENTChildOrgs = createENTChildOrgs