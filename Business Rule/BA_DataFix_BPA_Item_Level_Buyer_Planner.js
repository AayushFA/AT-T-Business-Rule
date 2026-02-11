/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DataFix_BPA_Item_Level_Buyer_Planner",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_SupportBusinessActions" ],
  "name" : "DataFix BPA_Item_Level_Buyer_Planner",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "Lib"
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
    "alias" : "step",
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
exports.operation0 = function (node,step,contractItemReference,Lib) {
/**
 * @author - John 
 * Data Fix for BPA_Item_Level_Buyer_Planner
 */
 
var ObjType = node.getObjectType().getID();
var partialApprList = new java.util.ArrayList();
var itemRef = step.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
var refNode = node.getReferences(itemRef).toArray();

if (ObjType == "Contract_Item") {	

	var itemref = node.queryReferences(contractItemReference).asList(1);
	if (itemref.size() > 0) {
		setItemLevelBuyerPlanner(node, itemref.get(0).getTarget())	
	}	
}

function setItemLevelBuyerPlanner(node, srcRefTarget){
	var itemLevelBuyer = "";
	var refLob = srcRefTarget.getValue("Line_Of_Business").getID();
	var ciStatus = node.getValue("ContractItem_Status").getID();
	if (refLob == "WRLN" && ciStatus == "OPEN") {
		
		itemLevelBuyer = srcRefTarget.getValue("PLANNER_ATTUID").getID();
		if (!itemLevelBuyer) {
			
			node.getValue("BPA_Item_Level_Buyer_Planner").setValue("Wireline Buyer");
			parAppr();
		} else {
			
			var isStockedCodePresent = checkStockedCode(node);
			if (isStockedCodePresent) {				
				node.getValue("BPA_Item_Level_Buyer_Planner").setValue(itemLevelBuyer);
				parAppr();
			} else {				
				node.getValue("BPA_Item_Level_Buyer_Planner").setValue("Wireline Buyer");
				parAppr();
			}
		}
	}
}

function checkStockedCode(node) {

	var regionDCarr = node.getDataContainerByTypeID("Region").getDataContainers().toArray();
	var isZBpresent = false;
	regionDCarr.forEach(function(regionDC) {
		var regionDCobj = regionDC.getDataContainerObject();
		if (regionDCobj) {					
			if (regionDCobj.getValue("CFAS_CO_Code").getID() == "ZB"
			&& regionDCobj.getValue("Regional_Status").getID() == "ACTIVE" ) {
				isZBpresent = true;
			}
		}
	});

	if (isZBpresent) {
		return true;
	}
	return false;
}

function parAppr() {
	
	partialApprList.add("BPA_Item_Level_Buyer_Planner");
	Lib.partialApproveFields(node, partialApprList);
}


}