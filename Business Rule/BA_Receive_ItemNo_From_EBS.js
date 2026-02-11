/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Receive_ItemNo_From_EBS",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "Receive Item No From_EBS",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step) {
/**
 * @author - Piyal [CTS]
 * Receive Item No From EBS
 */

var id = node.getID();
var attItemNo = node.getValue("Item_Num").getSimpleValue();
var referenceType = step.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item")
var refences = node.queryReferencedBy(referenceType).asList(1000);
var contractItemObj = null;
var BPAcreatWFinstance = null;
var wfBPACreate = null;
var bpaCreateWFinstance = null;
for (var i = 0; i < refences.size(); i++) {

	contractItemObj = refences.get(i).getSource();
	wfBPACreate = step.getWorkflowHome().getWorkflowByID("Create_BPA");

	if (contractItemObj.isInState("Create_BPA", "WaitForATTItemNumber"))

		copyAttributes(contractItemObj, node);
	bpaCreateWFinstance = contractItemObj.getWorkflowInstance(wfBPACreate);
	bpaCreateWFinstance.getTaskByID("WaitForATTItemNumber").triggerByID("pdh.success", "ATT number received from EBS");
}

function copyAttributes(currentNode, srcRefTarget) {

	var uom = srcRefTarget.getValue("Primary_UOM").getID();
	if (uom && uom != "") {
		currentNode.getValue("BPA_UOM").setLOVValueByID(uom);
	}
	var oracleItemNumber = srcRefTarget.getValue("Item_Num").getSimpleValue();
	if (oracleItemNumber && oracleItemNumber != "") {
		currentNode.getValue("Oracle_Item_Num").setValue(oracleItemNumber);
		currentNode.getValue("BPA_EBS_Response_Status").setSimpleValue("Oracle Item Number Received from EBS");
	}
	var OEM_Full_Name = srcRefTarget.getValue("OEM_Full_Name").getSimpleValue();
	if (OEM_Full_Name && OEM_Full_Name != "") {
		currentNode.getValue("BPA_OEM_Full_Name").setValue(OEM_Full_Name);
	}
	var OEM_Part_Number = srcRefTarget.getValue("OEM_Part_Num").getSimpleValue();
	if (OEM_Part_Number && OEM_Part_Number != "") {
		currentNode.getValue("BPA_OEM_Part_Number").setValue(OEM_Part_Number);
	}
	var Pack_Quantity = srcRefTarget.getValue("Pack_Quantity").getSimpleValue();
	if (Pack_Quantity && Pack_Quantity != "") {
		currentNode.getValue("BPA_Pack_Quantity").setValue(Pack_Quantity);
	}
	var itemLevelBuyer = srcRefTarget.getValue("Buyer").getSimpleValue();
	if (itemLevelBuyer && itemLevelBuyer != "") {
		currentNode.getValue("BPA_Item_Level_Buyer_Planner").setValue(itemLevelBuyer);
	}
}

}