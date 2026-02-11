/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_Sup_site_Create",
  "type" : "BusinessAction",
  "setupGroups" : [ "BG_BA_DataMigration_BA's" ],
  "name" : "DM BPA Supplier Sitecode Create",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA_Supplier", "Supplier_Site" ],
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
 * @author - Piyal, Aditya, and Madhuri [CTS]
 * Create BPS Supplier Site Code
 */

var VENDOR_NUM=node.getParent().getValue("sup_no").getSimpleValue();
var VENDOR_SITE_CODE=node.getValue("Supplier_Site_Code").getSimpleValue();
var Suppid_steCode=VENDOR_NUM+"_"+VENDOR_SITE_CODE;
if(node.getValue("Suppid_steCode").getSimpleValue()==null)
   node.getValue("Suppid_steCode").setSimpleValue(Suppid_steCode);
/*
var SupParent_name=node.getParent().getName();
var name=SupParent_name+"("+VENDOR_SITE_CODE+")";
node.setName(name);
*/
}