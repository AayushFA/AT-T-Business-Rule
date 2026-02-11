/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Retail_Assign_4NNNC",
  "type" : "BusinessAction",
  "setupGroups" : [ "Retail_Item_Number_Generation" ],
  "name" : "Retail Assign 4NNNC",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Companion_SKU", "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "AssignGeneratedValueAction",
  "parameters" : [ {
    "id" : "Attribute",
    "type" : "com.stibo.core.domain.Attribute",
    "value" : "Item_Num_Base"
  }, {
    "id" : "ValueGeneratorConfiguration",
    "type" : "com.stibo.valuegenerator.domain.configuration.ValueGeneratorConfiguration",
    "value" : "VG_Retail_List_4NNNC"
  } ],
  "pluginType" : "Operation"
}
*/
