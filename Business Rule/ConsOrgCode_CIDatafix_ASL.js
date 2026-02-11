/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "ConsOrgCode_CIDatafix_ASL",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Data_Fix_Actions" ],
  "name" : "Data fix CI ConsOrgCode for ASL",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item" ],
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
var childOrgs = null;
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
var objChildID = null;
var objChildItemStatus = null;
var objChildItemStatus_WRLN = null;
var objChildItemStatus_RTL = null;
var objChildItemStatus_ENT = null;
var objChildItem_LOB = null;
var isConsigned = null;
var validChildOrg = null;
var validCI = null;
var isValidCI = null;
var ciProcessed = null;
var bpa = null;
var bpaStatus = null;
var ciExpDate = null;
var ciNotExpired = null;

//Validate CIExpirationDate

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

//Validate if the CI ChildOrg in EBS also exists in STIBO & ChildOrg is Valid

function checkValidItem(obj, Temp_Child_Org_Key) {
	isConsigned = 'No';
	ciRefObj = step.getReferenceTypeHome().getReferenceTypeByID('ContractItem_Item');
	itemCIRef = obj.queryReferences(ciRefObj).asList(1000);
	var tempChildOrgKey = node.getValue('Temp_Child_Org_Key').getSimpleValue();
	if(itemCIRef.size()>0) {
		itemObj = itemCIRef.get(0).getTarget();
		if(itemObj) {
			childOrgs = itemObj.getChildren().toArray();
			childOrgs.forEach(function(childOrg) {
				var dmKey = childOrg.getValue('DM_Child_Org_Key').getSimpleValue();
				if(tempChildOrgKey == dmKey) {
					var objChildID = childOrg.getObjectType().getID();
					var objChildItemStatus = childOrg.getValue("Item_Status").getSimpleValue();
					var objChildItemStatus_WRLN = childOrg.getValue("Item_Status_WRLN").getID();
					var objChildItemStatus_RTL = childOrg.getValue("Item_Status_RTL").getID();
					var objChildItemStatus_ENT = childOrg.getValue("Item_Status_ENT").getID();
					var objChildItem_LOB = childOrg.getValue("Line_Of_Business").getID();
					if((objChildItem_LOB == 'WRLN') && (objChildID=='Child_Org_Item') && (objChildItemStatus_WRLN.startsWith('Act'))) {
						isConsigned = 'Yes';
					}
					else if((objChildItem_LOB == 'RTL') && (objChildID=='Child_Org_Item') && ((objChildItemStatus_RTL.startsWith('Act') || objChildItemStatus_RTL == 'Pre Launch' || objChildItemStatus_RTL == 'No Buy' || objChildItemStatus_RTL == 'DSL COL'))) {
						isConsigned = 'Yes';
					}
					else if((objChildItem_LOB == 'ENT') && (objChildID=='Child_Org_Item') && ((objChildItemStatus_ENT.startsWith('Act') || objChildItemStatus_ENT == 'Pre Launch' || objChildItemStatus_ENT == 'No Buy' || objChildItemStatus_ENT == 'DSL COL'))) {
						isConsigned = 'Yes';
					}
				}
			});
		}
	}
	return isConsigned;
}

//Update Consign Org Code

function updateCIConsignOrgCode(obj, attr) {
	var attrVal = obj.getValue(attr).getSimpleValue();
	if(attrVal) {
		var consOrgCodes = obj.getValue('Consign_Org_Code').getSimpleValue();
		if (consOrgCodes) {
			if(!consOrgCodes.contains(attrVal)) {
				obj.getValue('Consign_Org_Code').addValue(attrVal);
			}
		}
		else {
			obj.getValue('Consign_Org_Code').addValue(attrVal);
		}
	}
}

//Blank out the temp IDL attribute values

function setBlankTempValues() {
	node.getValue('Temp_Child_Org_Key').deleteCurrent();
	node.getValue('Temp_Consign_Org_Code').deleteCurrent();
}

//Validate if the CI itself is valid 

function checkValidCI(ci) {
	isValidCI = 'No';
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
				isValidCI = 'Yes';
			}
			else if((ciStatus == 'CLOSED') && (ciProcessed == 'E')) {
				isValidCI = 'Yes';
			}
		}
	}
	return isValidCI;
}

//Partially approve CI Consng Org Code

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

//Main function

function init() {
	validChildOrg = checkValidItem(node, 'Temp_Child_Org_Key');
	validCI = checkValidCI(node);
	if((validChildOrg == 'Yes') && (validCI == 'Yes'))
	{
		updateCIConsignOrgCode(node, 'Temp_Consign_Org_Code');
	}
	partialApprove(node, 'Consign_Org_Code');
	setBlankTempValues();
}


//function call

init();
}