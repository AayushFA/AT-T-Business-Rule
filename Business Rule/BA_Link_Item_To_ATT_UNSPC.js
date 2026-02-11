/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Link_Item_To_ATT_UNSPC",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_OnApproval_Actions" ],
  "name" : "Link Item To ATT UNSPC Hierarchy",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "TriggerAndApproveNewParts",
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
    "contract" : "ClassificationProductLinkTypeBindContract",
    "alias" : "refAttUnspsc",
    "parameterClass" : "com.stibo.core.domain.impl.ClassificationProductLinkTypeImpl",
    "value" : "ATT_UNSPSC_Reference",
    "description" : null
  }, {
    "contract" : "ClassificationProductLinkTypeBindContract",
    "alias" : "refUnspsc",
    "parameterClass" : "com.stibo.core.domain.impl.ClassificationProductLinkTypeImpl",
    "value" : "UNSPSC_Reference",
    "description" : null
  }, {
    "contract" : "QueryHomeBindContract",
    "alias" : "query",
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
exports.operation0 = function (node,refAttUnspsc,refUnspsc,query,step) {
/**
 * @author - Piyal and Aditya [CTS]
 * Link Item To ATT UNSPSC Hierarchy
 */

var refUnspscList = node.queryClassificationProductLinks(refUnspsc).asList(1);
var refAttUnspscList = node.queryClassificationProductLinks(refAttUnspsc).asList(1);
var refATTUnspscObj = null;
var refUnspscObj = null;
var targetATTOBJ = null;
var attUNSPSCCode = null;
var targetOBJ = null;
var attUNSPSCCode = null;

if (refAttUnspscList && refAttUnspscList.size() > 0) {
	refATTUnspscObj = refAttUnspscList.get(0);
	targetATTOBJ = refATTUnspscObj.getClassification();
	ATTUNSPSCCode = targetATTOBJ.getValue("UNSPSC_Code").getSimpleValue();
	if (refUnspscList && refUnspscList.size() > 0) {
		refUnspscObj = refUnspscList.get(0);
		targetOBJ = refUnspscObj.getClassification();
		UNSPSCCode = targetOBJ.getValue("UNSPSC_Code").getSimpleValue();		
		if (UNSPSCCode != ATTUNSPSCCode) {
			refUnspscObj.delete();
			unspscObj = getUNSPSCClassification(UNSPSCCode);
			if (unspscObj) {
				node.createClassificationProductLink(unspscObj, refUnspsc);
			}
		}		
	}else{
		unspscObj = getUNSPSCClassification(ATTUNSPSCCode);				
		if (unspscObj) {
			node.createClassificationProductLink(unspscObj, refUnspsc);
		}
	}
}

function getUNSPSCClassification(UNSPSC) {
	var attUnspsc = step.getClassificationHome().getObjectByKey("UNSPSC.Key", UNSPSC);
	if (attUnspsc) {
		return attUnspsc;
	} else {
		return null;
	}
}


}