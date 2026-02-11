/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ASL_DataFix",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Data_Fix_Actions" ],
  "name" : "Consignment CITEM Data fix for ASL",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item" ],
  "allObjectTypesValid" : false,
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
    "contract" : "LoggerBindContract",
    "alias" : "logger",
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
exports.operation0 = function (node,logger,step) {
//STIBO-2011 Data Fix
var ciRefObj = null;
var itemCIRef = null;
var childOrg = null;
var item = null;
var itemObj = null;
var itemCI = null;
var ciList = new java.util.ArrayList();
var ciArrList = new java.util.ArrayList();
var updCIList = new java.util.ArrayList();
var updCIArrList = new java.util.ArrayList();
var consignment = null;
var ci = null;
var ciStatus = null;
var ciParent = null;
var consgOrgCode = null;
var ciItr = null;
var ciObj = null;
var ciKey = null;
var validCI = 'N';

function getValidCI(childOrg, tempCI) {
	var bpa = null;
	var bpaObjectID = null;
	var bpaStatusID = null;
	var ciExpDate = null;
	var ciExpired = false;
	var ciNotExpired = null;
	var ciProcessed = null;
	childOrgObjType = childOrg.getObjectType().getID();
	if(childOrgObjType == 'Child_Org_Item') {
		itemObj = childOrg.getParent();
		itemObjType = itemObj.getObjectType().getID();
		if(itemObjType == 'Item') {
			ciRefObj = step.getReferenceTypeHome().getReferenceTypeByID('ContractItem_Item');
			itemCIRef = itemObj.queryReferencedBy(ciRefObj).asList(1000);
				for(var i=0; i<itemCIRef.size(); i++) {
					ci = itemCIRef.get(i).getSource();
					ciKey = ci.getValue('ContractItem_key').getSimpleValue();
					if(ciKey == tempCI) {
						ciStatus = ci.getValue('ContractItem_Status').getID();
						ciParent = ci.getParent().getID();
						ciProcessed = ci.getValue('BPA_Processed_In_EBS').getID();
						if((ciParent != 'CancelledProducts') && (ciParent != 'BPA_Onboarding')) {
							bpa = ci.getParent();
							bpaObjectID = bpa.getObjectType().getID();
							bpaStatus = bpa.getValue('BPA_Status').getID();
							ciExpDate = bpa.getValue('Expiration_Date').getSimpleValue();
							if(ciExpDate != null) {
								ciNotExpired = checkDateIfLessthanToday(ciExpDate);
							}
							if(bpaObjectID == 'BPA' && (bpaStatus == 'OPEN') && ((ciExpDate == null) || (ciNotExpired == true))) {
								if(ciStatus == 'OPEN') {
									validCI = 'Y';
								}
								else if((ciStatus == 'CLOSED') && (ciProcessed == 'E')) {
									validCI = 'Y';
								}
							}
						}
					}
				}
		}
	}
	return validCI;
}


function checkDateIfLessthanToday(date) {
	var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd"); //For ISO date format
	var dateNow = new Date();
	var formattedDateTime = dateTimeFormatter.format(dateNow);
	if(date < formattedDateTime) {
		return false;
	}
	else if((date == formattedDateTime) || (date > formattedDateTime)) {
		return true;
	}
}

function init() {
	
	var objChildID = node.getObjectType().getID();
	var objChildItemStatus = node.getValue("Item_Status").getSimpleValue();
	var objChildItemStatus_WRLN = node.getValue("Item_Status_WRLN").getID();
	var objChildItemStatus_RTL = node.getValue("Item_Status_RTL").getID();
	var objChildItemStatus_ENT = node.getValue("Item_Status_ENT").getID();
	var objChildItem_LOB = node.getValue("Line_Of_Business").getID();
	var tempCI = node.getValue("Temp_CI").getSimpleValue();
	validCI = getValidCI(node, tempCI);
	if((objChildItem_LOB == 'WRLN') && (objChildID=='Child_Org_Item') && (objChildItemStatus_WRLN.startsWith('Act')) && (validCI == 'Y')) {
		node.getValue('Consignment').setSimpleValue('Yes');
	}
	else if((objChildItem_LOB == 'RTL') && (objChildID=='Child_Org_Item') && ((objChildItemStatus_RTL.startsWith('Act') || objChildItemStatus_RTL == 'Pre Launch' || objChildItemStatus_RTL == 'No Buy' || objChildItemStatus_RTL == 'DSL COL')) && (validCI == 'Y')) {
		node.getValue('Consignment').setSimpleValue('Yes');
	}
	else if((objChildItem_LOB == 'ENT') && (objChildID=='Child_Org_Item') && ((objChildItemStatus_ENT.startsWith('Act') || objChildItemStatus_ENT == 'Pre Launch' || objChildItemStatus_ENT == 'No Buy' || objChildItemStatus_ENT == 'DSL COL')) && (validCI == 'Y')) {
		node.getValue('Consignment').setSimpleValue('Yes');
	}
	
	consignment = node.getValue('Consignment').getSimpleValue();
	if(consignment == 'Yes') {
		partialApprove(node, 'Consignment');
	}
	setBlankTempValues();
}


function partialApprove(node, IDArray) {
	var set = new java.util.HashSet();
	var setUnappr = node.getNonApprovedObjects();
	var unApprItr = setUnappr.iterator();
	while(unApprItr.hasNext()) {
		var partObj = unApprItr.next();
		var partObjStr = partObj.toString();
		if((partObjStr.indexOf("ValuePartObject") != -1) && (IDArray.indexOf(String(partObj.getAttributeID())) != -1)) {
			set.add(partObj);
		}
	}
	if(set.size()>0) {
		var objApproveSet = node.approve(set);
	}
}


//Blank out the temp IDL attribute values

function setBlankTempValues() {
	node.getValue('Temp_CI').deleteCurrent();
}

init();
}