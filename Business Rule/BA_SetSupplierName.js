/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetSupplierName",
  "type" : "BusinessAction",
  "setupGroups" : [ "Supplier_BA" ],
  "name" : "Set Supplier Name",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA_Supplier" ],
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
/**
 * @author Aditya Rudragoudar
 * Sets the supplier site name. Runs on approval of site code
 */

var supplier = node.getParent();
var supplierNumber = node.getValue("Supplier_Number").getSimpleValue();
var supplierName = node.getValue("Supplier_Name").getSimpleValue();

if(!supplierName) { // If Name is null
	supplierName = "";
}

if(supplierNumber && supplierName) {
    supplierName += "|"+supplierNumber;
} else {
    supplierName = supplierNumber; // If supplier number is blank then default to number
}
try{
node.setName(supplierName.trim());
}
catch(e){
	throw e;
}

}