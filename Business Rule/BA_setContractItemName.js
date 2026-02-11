/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_setContractItemName",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "Set ContractItem Name",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "CreateAssetFromURLOperation",
  "parameters" : [ {
    "id" : "AssetObjectType",
    "type" : "com.stibo.core.domain.ObjectType",
    "value" : null
  }, {
    "id" : "AssetReferenceType",
    "type" : "com.stibo.core.domain.ReferenceType",
    "value" : null
  }, {
    "id" : "AutoApprove",
    "type" : "java.lang.Boolean",
    "value" : "false"
  }, {
    "id" : "NodeURLAttribute",
    "type" : "com.stibo.core.domain.Attribute",
    "value" : null
  } ],
  "pluginType" : "Operation"
}
*/
