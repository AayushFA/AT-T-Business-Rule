/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetBPAHeaderDefaultAttributes",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "Set BPA Default Attributes",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
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
 * @author Aditya Rudragoudar
 * Sets default attributes for BPA header on approval
 */
var contractNum = node.getValue("Oracle_Contract_Num").getSimpleValue();
if(contractNum) {
	node.setName(contractNum);
}

var refHome = step.	getLinkTypeHome().getClassificationProductLinkTypeByID("BPA_To_Supplier");
var siteCodeRefs = node.queryClassificationProductLinks(refHome).asList(1);
if (siteCodeRefs.size() > 0) {
	var suplierSite = siteCodeRefs.get(0).getClassification();	
	var supplierDetails = suplierSite.getName();
	var supplierNumber = suplierSite.getParent().getValue("Supplier_Number").getSimpleValue();
	var supplierName = suplierSite.getParent().getValue("Supplier_Name").getSimpleValue();
	var supplierSite = suplierSite.getValue("Supplier_Site_Code").getSimpleValue();
	node.getValue("BPA_Supplier").setSimpleValue(supplierNumber); // This will resets the calculated attribute
	node.getValue("Supplier_Site").setSimpleValue(supplierSite); // This will resets the calculated attribute
	node.getValue("BPA_Supplier_Name").setSimpleValue(supplierName);
	node.getValue("BPA_Supplier_Details").setSimpleValue(supplierDetails);
}


}