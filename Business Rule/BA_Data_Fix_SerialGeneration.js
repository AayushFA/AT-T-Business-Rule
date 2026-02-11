/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Data_Fix_SerialGeneration",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Data_Fix_Actions" ],
  "name" : "Data Fix SerialGeneration",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Companion_SKU" ],
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

const serializedList = ['COMPUTER', 'DEMO PHONE', 'DSL', 'ELECTRONIC', 'ENTMOB ELE', 'FEMTOCELL', 'HSIA', 'MSSNONSTCK',
	'PHONE', 'PREPAY', 'PREPAY SER', 'SECURITY', 'SIM', 'UVERSE', 'SATELLITE', 'ENTCPE', 'ENTTOOLS', '3PP ELECTR'
];

function setSerialGenerationVal(obj) {
	var userItemTypeRTL = obj.getValue('User_Item_Type_RTL').getLOVValue();
	var productSubType = obj.getValue('Product_Sub_Type').getLOVValue();
	if(userItemTypeRTL != null && productSubType != null) {
		userItemTypeRTL = userItemTypeRTL.getID() + "";
		productSubType = productSubType.getID().toLowerCase();
		if((serializedList.includes(userItemTypeRTL) == true) && (productSubType.contains('serial'))) {
			if(!productSubType.contains('non')) {
				obj.getValue('Serial_Generation').setLOVValueByID('6');
			}
			else {
				obj.getValue('Serial_Generation').setLOVValueByID('1');
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
}




init();
}