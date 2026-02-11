/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Child_Org_Wireline_Derivation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Derivation_Libraries" ],
  "name" : "Child Org Wireline Library Derivation",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Item_Wireline",
    "libraryAlias" : "wirelineDerivationLib"
  }, {
    "libraryId" : "BL_Child_Org_Common_Derivation",
    "libraryAlias" : "commonChildOrgDerivationLib"
  }, {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonDerivationLib"
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
function createWirelineChildOrgs(node, stepManager,lookUpTableHome) {
	var materialType = node.getValue("Material_Item_Type_Web").getID();
	var status = node.getValue("Item_Status").getID();

	// Create ASE Child Orgs 
	var ASEOrgID = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_ORG_Code").getListOfValuesValueByID("ASE");
	if (ASEOrgID && commonChildOrgValidationLib.validateChildOrgObject(node, stepManager, "ASE")) {
		var ASEOrgID = node.createProduct(null, "Child_Org_Item");		
		commonChildOrgDerivationLib.setChildOrgAttributes(node, ASEOrgID, "ASE",stepManager, lookUpTableHome);		
	}
	
	// Create Child Orgs for Plug-In Material Type
	if (materialType == "Plug-In") {
		var plugInOrgs = ["AK1", "MW1", "SE2", "SW1", "WE1", "WE2"];
		plugInOrgs.forEach(function(orgCode) {
			var orgID = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_ORG_Code").getListOfValuesValueByID(orgCode);
			if (orgID && commonChildOrgValidationLib.validateChildOrgObject(node, stepManager, orgCode)) {
				var childOrgItem = node.createProduct(null, "Child_Org_Item");
				commonChildOrgDerivationLib.setChildOrgAttributes(node, childOrgItem, orgCode,stepManager, lookUpTableHome);
			}
		});
	}
	// Create Child Orgs for Minor Material or Cable
	if (materialType == "Minor Material" || materialType == "Cable") {
		var mmcOrgs = ["AK1", "MW1", "SE2", "SW1", "WE2", "WE3"];
		mmcOrgs.forEach(function(orgCode) {
			var orgID = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_ORG_Code").getListOfValuesValueByID(orgCode);
			var orgStatus = node.getValue(orgCode + "_Item_Status").getID();
			if (orgID && orgStatus && commonChildOrgValidationLib.validateChildOrgObject(node, stepManager, orgCode)) {
				var childOrgItem = node.createProduct(null, "Child_Org_Item");
				childOrgItem.getValue("Item_Status_WRLN").setLOVValueByID(orgStatus);
				childOrgItem.getValue("Item_Status").setLOVValueByID(orgStatus);						
				commonChildOrgDerivationLib.setChildOrgAttributes(node, childOrgItem, orgCode, stepManager, lookUpTableHome);				
				wirelineDerivationLib.setESIAttributesValues(childOrgItem, lookUpTableHome); 
                   commonDerivationLib.setStatusControlledAttributesValues(childOrgItem, lookUpTableHome);
				if (node.getValue("Item_Num").getValue()) {
					childOrgItem.getValue("Sourcing_Notify").setLOVValueByID("Y");
					childOrgItem.getValue("Sourcing_Comments").setSimpleValue(node.getValue("Sourcing_Comments").getSimpleValue());
					childOrgItem.getValue("Contract_Mgr").setSimpleValue(node.getValue("Contract_Manager").getSimpleValue());
				}
			}
		}); 
	} 
}

function clearMaxOnReelLength(node) {
	var materialItemType = node.getValue("Material_Item_Type_Web").getID();
	var itemStatus = node.getValue("Item_Status_WRLN").getID();
	var organizationCode = node.getValue("Organization_Code").getID();
	if (materialItemType && itemStatus && organizationCode) {
		if (materialItemType != "Cable" && itemStatus != "Active S" && organizationCode != 'SW1' && organizationCode != 'MW1') {
			node.getValue("Max_on_Reel_Length").setSimpleValue(0);
		}
	}
}
    
/*===== business library exports - this part will not be imported to STEP =====*/
exports.createWirelineChildOrgs = createWirelineChildOrgs
exports.clearMaxOnReelLength = clearMaxOnReelLength