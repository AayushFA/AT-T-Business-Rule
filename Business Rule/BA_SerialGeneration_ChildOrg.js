/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SerialGeneration_ChildOrg",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Data_Fix_Actions" ],
  "name" : "Data Fix SerialGeneration",
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,logger) {
/*
 * @author - Mahee
 * Data fix for serialGeneration
 */

function setSerialGenerationVal(obj) {
	const orgCodeList = ['RLO', 'RL1', 'RL2', 'DSW', 'FLC', 'SAM'];
	if(obj.getObjectType().getID() == "Child_Org_Item") {
		var orgCode = obj.getValue('Organization_Code').getLOVValue();
		var productSubType = obj.getValue('Product_Sub_Type').getLOVValue();
		if(orgCode != null && productSubType != null) {
			orgCode = orgCode.getID() + "";
			productSubType = productSubType.getID().toLowerCase();
			if((orgCodeList.includes(orgCode) == true) && (productSubType.contains('serial'))) {
				if(!productSubType.contains('non')) {
					obj.getValue('Serial_Generation').setLOVValueByID('5');
				}
			}
		}
	}
	return true;
}

function partialApprove(node, IDArray) {
	var set = new java.util.HashSet();
	var setUnapproved = node.getNonApprovedObjects();
	var unApprovedItr = setUnapproved.iterator();
	while(unApprovedItr.hasNext()) {
		var partObject = unApprovedItr.next();
		var partObjectStr = partObject.toString();
		if((partObjectStr.indexOf('ValuePartObject') != -1) && (IDArray.indexOf(String(partObject.getAttributeID())) != -1)) {
			set.add(partObject);
		}
	}
	if(set.size()>0) {
		node.approve(set);
	}
}

function init() {
	var partialApprList = new java.util.ArrayList();
	var serialGenValUpd = setSerialGenerationVal(node);
	if(serialGenValUpd) {
		partialApprList.add('Serial_Generation');
		partialApprove(node, partialApprList);
	}
	logger.info(node.getValue('Serial_Generation').getSimpleValue());
}




init();
}