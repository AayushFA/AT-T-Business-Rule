/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "Basic_Approve",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_GlobalBusinessAction" ],
  "name" : "Basic Approve",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Purch_Category (Segment 2)", "Purch_Category (Segment 4)", "UNSPSC_Root", "Bill_Of_Material", "Purch_Category (Segment 3)", "Supplier_Site", "Companion_SKU", "Products", "BPA_Supplier", "BPA", "ATT_UNSPSC_Family", "BOM_Child", "BOM_Child_Substitute", "Level2", "Level1", "BPA_SupplierHierarchyRoot", "LE_Contract_Item_Child", "ATT_UNSPSC_Segment", "ATT_UNSPSC_Root", "Item", "Item_Class", "UNSPSC_Family", "Purch_Category (Segment 1)", "IMEI_Tac_Range", "UNSPSC_Segment", "NTW_Attrs_Root", "ATT_UNSPSC_Commodity", "UNSPSC_Commodity", "IMEI_Override", "IMEI_Item", "CancelledType", "Barcode_Flag", "Accounting_Type", "External_System_Download_Flag", "Child_Org_Item", "Contract_Item", "UNSPSC_Class", "Expenditure_Type", "ATT_UNSPSC_Class" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
/**
 * @author - Aditya [CTS]
 * Approve the current object
 */
 
node.approve();
}