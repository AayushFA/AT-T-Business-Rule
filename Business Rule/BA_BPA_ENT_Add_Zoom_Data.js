/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_ENT_Add_Zoom_Data",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "BPA ENT Add Zoom Data",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item", "Item", "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "lib"
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
    "contract" : "ReferenceTypeBindContract",
    "alias" : "refContractItem",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ContractItem_Item",
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "BPAZoomDataENTLookUP",
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
    "contract" : "WebUiContextBind",
    "alias" : "webUIContext",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,refContractItem,BPAZoomDataENTLookUP,stepManager,webUIContext,lib) {
/**
 * @author - John [CTS]
 * * Add Zoom Data for ENT & WRLN from ENT pItem
 */

/* 
log.info("Start of BR Adding Zoom data for ENT LOB during Creation: " + node.getID());
var CFASCodeDefault = "ZB";
var zipDefault = "";
var regionalStatusDefault = "ACTIVE";
var zipActionDefault = "INCLUDE";
var stateDefault = "";
var region = null;

var regionDCobj;

if (node.getValue("BPA_Processed_In_EBS").getSimpleValue() != "Yes") {

	var businessSource = node.getValue("Legacy_Source").getSimpleValue();
	if (businessSource != "Retail Consumer") {		
		getRefContractItem()
	}
}

function getRefContractItem() {

	var refContractItemID = node.getReferences(refContractItem);
	if (refContractItemID.size() > 0) {

		var refItem = refContractItemID.get(0).getTarget();
		var inventoryCat = refItem.getValue("Inventory_Cat_ENT").getSimpleValue();
		var pItemNum = refItem.getValue("Item_Num").getSimpleValue();
		var refItemLOB = refItem.getValue("Line_Of_Business").getSimpleValue();
		if (refItemLOB == "Entertainment") {
			setCFASCode(CFASCodeDefault);
			if (inventoryCat && pItemNum) {
				if (pItemNum.startsWith("RTL.") && inventoryCat.includes("COLLATERAL") == true) {
					setCFASCode("SS00");
				}
				if (pItemNum.startsWith("ATT.") && inventoryCat.includes("LITERATURE") == true) {
					setCFASCode("SS00");
				}
			}
			var supplierNum = node.getParent().getValue("BPA_Supplier").getSimpleValue()
			if (inventoryCat && supplierNum) {
				getCFASCodefromLT(inventoryCat, supplierNum)
			}
		}
	}
}

function setCFASCode(CFASCode) {

	lib.addRegionDC(node, stepManager, CFASCode, zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region);
}

function getCFASCodefromLT(inventoryCat, supplierNum) {
	var combined = inventoryCat + "|" + supplierNum;
	var bpaLookUpResult = BPAZoomDataENTLookUP.getLookupTableValue("LT_BPA_ENT_Zoom_Data", combined);
	if (bpaLookUpResult) {
		bpaLookUpResult = bpaLookUpResult.split("\\|");
		for (var i = 0; i < bpaLookUpResult.length; i++) {
			setCFASCode(bpaLookUpResult[i]);
		}
	}
}
*/
}