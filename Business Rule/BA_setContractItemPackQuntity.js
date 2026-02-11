/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_setContractItemPackQuntity",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "Set Contract Item PackQuntity",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item", "BPA" ],
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
    "contract" : "DataIssuesContextBind",
    "alias" : "issue",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "ctx",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (currentNode,step,issue,ctx) {
/**
 * @author - Piyal [CTS]
 * Setting the value for Pack quantity comparing the Primary UOM at Item and Contract item
 */

var Item_UOM = null;
var BPA_UOM = null;
var error = false;
var itemBase = null;
var bpaBase = null;
var itemClass = null;
var bpaClass = null;
var lob = null;
var std_pack = null;
var minimumQty = null;
var packQty = null;
var selectedNode = null;
var selection = null;
var objectType = null;

if (currentNode) {
	execute(currentNode)
} else if (!currentNode) {
	selection = ctx.getSelection();
	selection.forEach(function(item) {
		if (item.getObjectType().getID() == 'Contract_Item') {
			selectedNode = item;
			execute(selectedNode);
		}
	});
}

function execute(node) {
	
	objectType = node.getObjectType().getID();
	log.info(objectType);
	lob = node.getValue("Legacy_Source").getID();

	if (objectType == "Contract_Item" && lob != "RTL") {

		Item_UOM = node.getValue("UOM_Copied_From_Item").getSimpleValue();
		BPA_UOM = node.getValue("BPA_UOM").getSimpleValue();
		if (Item_UOM == BPA_UOM) {
			node.getValue("BPA_Pack_Quantity").setValue("1");
		} else if (Item_UOM != BPA_UOM) {
			itemBase = getBaseUnit(Item_UOM);
			bpaBase = getBaseUnit(BPA_UOM);
			itemClass = getClass(Item_UOM);
			bpaClass = getClass(BPA_UOM);

			if ((itemClass && bpaClass) && itemClass == bpaClass) {
				if (bpaBase && !itemBase) {
					node.getValue("BPA_Pack_Quantity").setValue("1");
					std_pack = node.getValue("STD_PACKAGING").getSimpleValue();
					minimumQty = node.getValue("Min_Order_Qty").getSimpleValue();
					if (!std_pack || !minimumQty) {
						issue.addWarning("Please provide STD PACKAGING and Minimum Order Quantity")
						error = true;
					}
				} else if (!bpaBase && itemBase) {
					packQty = node.getValue("BPA_Pack_Quantity").getSimpleValue();
					if (!packQty) {
						issue.addWarning("Please provide Pack Quantity")
						error = true;
					}
				} else if (!bpaBase && !itemBase) {
					var bpaWFInstance = getWorkflowState(node, "Create_BPA", "Enrich_BPA_CI_LE");
					if (bpaWFInstance) {

					}
				}
			}
		}
	}
	if (error)
		return issue;
}

function getBaseUnit(UOM) {
	var BaseUnitArr = ["FT - Foot", "EA - Each", "HR - Hour", "GAL - Gallon", "LB - Pound"];
	if (BaseUnitArr.includes(UOM)) {
		return UOM;
	}
	return null;
}

function getClass(UOM) {
	
	var classLengthArr = ["CX - COIL", "FT - Foot", "IN - INCH", "RL - ROLL", "RLL - Roll", "RE - REEL", "SO - SPOOL", "YD - YardL"];
	var classTimeArr = ["DAY - Day", "HR - Hour", "YR - Annual", "WK - Week", "MTH - Month"];
	var classVolumeArr = ["CN - CAN", "DR - DRUM", "GAL - Gallon", "PA - PAIL", "PT - PINT", "QT - QUART"];
	var classWeightArr = ["TB - TUBE", "LB - Pound"];
	var classQtyArr = ["BG - BAG", "AA - BALL", "BI - BAR", "BK - BOOK", "BO - BOTTLE", "BX - BOX", "BD - BUNDLE", "BS - BUSHEL", "BAG - Bag", "BOX - Box", "CT - CARTON", "CA - CASE", "CRT - Carton", "CAS - Case", "DZ - Dozen", "EA - Each", "GS - GROSS", "HDR - HUNDRED", "JR - JAR", "KT - KIT", "LOT - Lot", "PK - PACK", "PD - PAD", "PR - PAIR", "PL - PALLET", "PC - PIECE", "PKG - Package", "QTR - Quarter", "RM - Ream", "RLL - Roll", "ST - SET", "SH - SHEET", "SQY - Square Yard", "THO - Thousand", "TU - Tube"];

	if (classLengthArr.includes(UOM)) {
		return "Length";
	} else if (classTimeArr.includes(UOM)) {
		return "Time";
	} else if (classVolumeArr.includes(UOM)) {
		return "Volume";
	} else if (classWeightArr.includes(UOM)) {
		return "Weight";
	} else if (classQtyArr.includes(UOM)) {
		return "Quantity";
	}
	return null;
}

function getWorkflowState(node, workflowId, stateId) {
	var wf = node.getWorkflowInstanceByID(workflowId);
	if (wf != null) {
		return wf.getTaskByID(stateId);
	}
	return null
}
}
/*===== business rule plugin definition =====
{
  "pluginId" : "ReferenceOtherBABusinessAction",
  "parameters" : [ {
    "id" : "ReferencedBA",
    "type" : "com.stibo.core.domain.businessrule.BusinessAction",
    "value" : "BA_Refresh"
  } ],
  "pluginType" : "Operation"
}
*/
