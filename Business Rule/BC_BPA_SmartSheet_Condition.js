/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_BPA_SmartSheet_Condition",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "BPA SmartSheet Condition",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item", "BPA" ],
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
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
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
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "issue",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,issue,lib) {
/**
 * @author - Piyal & Megha [CTS]
 * BPA CI SmartSheet Condition
 */

var effectDate = null;
var expDate = null;
var error = true;

checkDateformat(); // Date format sholud be in ISO 
checkCharLimit(); //  Supplier Part Number should not exceed 25 characters
 
function checkDateformat() {
	effectDate = node.getValue("Effect_Date").getSimpleValue();
	var result = lib.checkDateIfinISOformat(effectDate);
	if (!result) {
		issue.addError("Date should be in  yyyy-mm-dd  format", node, step.getAttributeHome().getAttributeByID("Effect_Date"));
		error = false;
	}
}

function checkCharLimit() {
	var supplierPartNum = node.getValue("Supplier_Item").getSimpleValue();
	logger.info("Supplier part num:" + supplierPartNum);
	if (supplierPartNum) {
		if (parseInt(supplierPartNum.length()) > 25) {
			issue.addError("Supplier Part Number should not exceed 25 characters", node, step.getAttributeHome().getAttributeByID("Supplier_Item"));
			error = false;
		}
	}else{
		issue.addError("Please check the Supplier Part Number (Char count exceeds the limit of 25)", node, step.getAttributeHome().getAttributeByID("Supplier_Item"));
		error = false;
	}
}

if (error == false) {
	return issue;
} else {
	return true;
}
}