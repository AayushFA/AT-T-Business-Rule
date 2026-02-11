/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetSupplierSiteName",
  "type" : "BusinessAction",
  "setupGroups" : [ "Supplier_BA" ],
  "name" : "Set Supplier Site Name",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Supplier_Site" ],
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
var supplierNumber = supplier.getValue("Supplier_Number").getSimpleValue();
var supplierName = node.getValue("Supplier_Name").getSimpleValue();
var siteCode = node.getValue("Supplier_Site_Code").getSimpleValue();
var addressLine1 = node.getValue("Supplier_Address_Line1").getSimpleValue();
var addressLine2 = node.getValue("Supplier_Address_Line2").getSimpleValue();
var city = node.getValue("Supplier_City").getSimpleValue();
var state = node.getValue("Supplier_State").getSimpleValue();
var zip = node.getValue("Supplier_Zip").getSimpleValue();
var address = "";
if(addressLine1) {
	address += addressLine1;
}

if(addressLine2) {
	address += ", "+addressLine2;
}

if(city) {
	address += ", "+city;
}

if(state) {
	address += ", "+state;
}

if(zip) {
	address += ", "+zip;
}

if(supplierName && address){
var a = [supplierName, 
     supplierNumber, 
     siteCode, 
     address].join (' | ').replace (/(, ){2,}/g, '| ');
}
else if(!supplierName && !address){
var a = [ 
     supplierNumber, 
     siteCode
   ].join (' | ').replace (/(, ){2,}/g, '| ');
}
else	if(!supplierName && address){
		var a = [ 
	     supplierNumber, 
	     siteCode, 
	     address].join (' | ').replace (/(, ){2,}/g, '| ');
	}
else if(supplierName && !address){
		var a = [ supplierName,
	     supplierNumber, 
	     siteCode 
	     ].join (' | ').replace (/(, ){2,}/g, '| ');
}
else{
	//do Nothing
}
try{
node.setName(a.trim())
}
catch(e){
	throw e;
}

}