/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BPA_SetDefault_Attributes",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "Set Default Attributes(BPA.CI,CILE)",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item", "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "BPALib"
  }, {
    "libraryId" : "AT&T_Global_Library",
    "libraryAlias" : "GlobalLib"
  } ]
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
    "contract" : "ReferenceTypeBindContract",
    "alias" : "contractItemReference",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ContractItem_Item",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,contractItemReference,BPALib,GlobalLib) {
/**
 * @author - Aayush and John [CTS]
 * Checking object type and than populating Contract Name and also populating the name of CI item
 * Trimming trailing Spaces/New Lines 
 */

var ObjType = node.getObjectType().getID();
if (ObjType == "BPA") {
	
	// STIBO-1972 Support Team
    GlobalLib.trimSpacesandNewLines(node,"BPA_Description");
    GlobalLib.trimSpacesandNewLines(node,"BPA_Legacy_Contract_No");  
     // STIBO-1972 Support Team
	var headDesc = node.getValue("BPA_Description").getSimpleValue();
	node.getValue("Parent_Name").setValue(headDesc);
} else if (ObjType == "Contract_Item") {
	
	GlobalLib.trimSpacesandNewLines(node,"Supplier_Item");    // STIBO-1972 Support Team
	var parent = node.getParent();
	var headDesc = parent.getValue("BPA_Description").getSimpleValue();
	node.getValue("Parent_Name").setValue(headDesc);
	var itemRef = manager.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
	var refNode = node.getReferences(itemRef).toArray();
	var refTarget = refNode[0].getTarget();
	var itemDesc = refTarget.getValue("Item_Description").getSimpleValue();
	//node.setName(itemDesc);
	//STIBO-1691
	var supplierUOM = node.getValue("BPA_Onboarding_UOM").getID();
	var processedInEBS = node.getValue("BPA_Processed_In_EBS").getID();
	if (processedInEBS != "Y") {
		node.getValue("BPA_UOM").setLOVValueByID(supplierUOM);
	}
	// Changes made for STIBO-1555
	var leChildren = node.getChildren();
	if (leChildren.size() > 0) {
		for (var i = 0; i < leChildren.size(); i++) {
			var childCILE = leChildren.get(i);
			log.info("childCILE " + childCILE.getID());
			var leObjectType = childCILE.getObjectType().getID();
			if (leObjectType == 'LE_Contract_Item_Child') {
				setParent(childCILE);
			}
		}
	}

	// STIBO-2335 Prod Support July release
    var greatParent = node.getParent().getParent();
    if (greatParent.getID() == "BPA_RTL"){
    		BPALib.clearRTLAttributes(node);
    }
    // STIBO-2335 Prod Support July release
    // STIBO-3318 Prod Support Team Mar 15 Release
	var itemref = node.queryReferences(contractItemReference).asList(1);
	if (itemref.size() > 0) {
		BPALib.setItemLevelBuyerPlanner(node, itemref.get(0).getTarget(), manager);
	}
	// STIBO-3318 Prod Support Team Mar 15 Release
}

function setParent(node) {
	var parent = node.getParent().getParent();
	var headDesc = parent.getValue("BPA_Description").getSimpleValue();
	node.getValue("Parent_Name").setValue(headDesc);
}


}