/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Data_Fix_OALCTrack_TemplateName",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Data_Fix_Actions" ],
  "name" : "Data Fix OALC Track and Template Name",
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
    "contract" : "LookupTableHomeBindContract",
    "alias" : "wrlnLookUPTable",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,wrlnLookUPTable,stepManager) {
/**
 * @author - John [CTS]
 * Data fix for OALC Track and Template Name
 */

var partialApprList = new java.util.ArrayList();
var materialItemType = node.getValue("Material_Item_Type").getSimpleValue();
var BOMType = node.getValue("NTW_BOM_Type_WRLN").getSimpleValue();
var wttOALCTrack = node.getValue("WTT_OALC_Track").getSimpleValue();
var HECI = node.getValue("HECI").getSimpleValue();
var price = node.getValue("List_Price").getSimpleValue();
var itemStatus = node.getValue("Item_Status").getSimpleValue();

//setOALCTrack();
setTemplateName();

function setOALCTrack() {

	if (BOMType == "PIE KIT") {
		node.getValue("WTT_OALC_Track").setLOVValueByID("Y");
	} else if (materialItemType == "Plug-In" || (materialItemType == "Hardwired" && HECI != null) || (materialItemType == "Hardwired" && HECI == null && price > 2000)) {
		node.getValue("WTT_OALC_Track").setLOVValueByID("Y");
	} else {
		node.getValue("WTT_OALC_Track").setLOVValueByID("N");
	}
	partialApprList.add("WTT_OALC_Track");
	partialApprove(node, partialApprList);
}

function setTemplateName() {

	if (materialItemType && itemStatus && wttOALCTrack) {
		var wrlnLookupResult = wrlnLookUPTable.getLookupTableValue("LT_Wireline_ItemClass", materialItemType + "|" + itemStatus + "|" + wttOALCTrack);
		if (wrlnLookupResult) {
			wrlnLookupResult = wrlnLookupResult.split("\\|");
			node.getValue("Template_Name").setLOVValueByID(wrlnLookupResult[0]);
		}
	}
	partialApprList.add("Template_Name");
	partialApprove(node, partialApprList);
}


function partialApprove(node, IDArray) {

	var set = new java.util.HashSet();
	var setUnapproved = node.getNonApprovedObjects();
	var unapprovedIterator = setUnapproved.iterator();
	while (unapprovedIterator.hasNext()) {
		var partObject = unapprovedIterator.next();
		var partObjectStr = partObject.toString();
		if (partObjectStr.indexOf("ValuePartObject") != -1 && IDArray.indexOf(String(partObject.getAttributeID())) != -1) {
			set.add(partObject);
		}
	}
	if (set.size() > 0) {
		node.approve(set);
	}
}


}