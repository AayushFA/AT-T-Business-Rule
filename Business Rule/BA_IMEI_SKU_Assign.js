/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_IMEI_SKU_Assign",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_IMEI_Actions" ],
  "name" : "IMEI SKU Assign (NNNNN)",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "IMEI_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
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
    "value" : "IMEI_SKU_Base"
  }, {
    "id" : "ValueGeneratorConfiguration",
    "type" : "com.stibo.valuegenerator.domain.configuration.ValueGeneratorConfiguration",
    "value" : "VG_IMEI_SKU_Sequence"
  } ],
  "pluginType" : "Operation"
}
*/
