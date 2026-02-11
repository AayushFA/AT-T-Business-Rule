/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetItemSpecificAttribute_SmartSheet",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "Set Item Specific Attribute Through SmartSheet",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item", "Bill_Of_Material", "BPA", "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "ATT_BPA_SingleSS_Library",
    "libraryAlias" : "bpaSSLib"
  }, {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "BPALib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "currentNode",
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
    "alias" : "itemRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ContractItem_Item",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "pbomRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "LEContractItem_BOM_Parent",
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "ctx",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "QueryHomeBindContract",
    "alias" : "query",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "item",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "Item",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "pbom",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "Bill_Of_Material",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "cileItemRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "LocalExplosion_Item_Reference",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (currentNode,step,itemRef,pbomRef,ctx,query,item,pbom,cileItemRef,bpaSSLib,BPALib) {
/**
 * @author - Piyal [CTS]
 * Setting the item specific attributes From Item/PBOM to Contract item imported through smartsheet
 */

log.info("Set Item Specific Attribute For Contract Item  from Smartsheet");

var lob = null;
var std_pack = null;
var minimumQty = null;
var item_No = null;

var mstItem = null;
var c = com.stibo.query.condition.Conditions;
execute(currentNode)
BPALib.executeCI(currentNode, step, itemRef)

function execute(currentNode) {
	var wfBPAcreate = step.getWorkflowHome().getWorkflowByID("Create_BPA");
	var objectType = currentNode.getObjectType().getID();
	lob = currentNode.getValue("Legacy_Source").getID();
	if (objectType == 'Contract_Item') {
		item_No = currentNode.getValue("Item_No_Refrenced_To_CI").getSimpleValue();
		if (item_No)
			var obj = step.getNodeHome().getObjectByKey("Item.Key", item_No);
		if (lob == "RTL") {
			bpaSSLib.smartSheetRTL(currentNode, lob, obj, item_No,step);
		} else {
			bpaSSLib.smartSheetWRLN_ENT(currentNode, lob, obj, item_No,step);
		}
	}
	if (objectType == 'LE_Contract_Item_Child') {
		BPALib.setLEDefaultValues(currentNode);
		if (currentNode.getValue("BPA_Processed_In_EBS").getID() != "Y")
			BPALib.leKeyGeneration(currentNode, step)
	}
}
}