/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Add&RemoveAttrFromAG",
  "type" : "BusinessAction",
  "setupGroups" : [ "BR_DataFix" ],
  "name" : "Adding and Removing attribute from AG",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
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
    "contract" : "AttributeGroupBindContract",
    "alias" : "attrgrp",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "AG_IMEI_Override_Outbound_Attributes",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,attrgrp) {
node.addAttributeGroup(attrgrp);
//node.removeAttributeGroup(attrgrp);
}