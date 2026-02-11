/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_ABC_ReadOnly_HeaderAttrs",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ABC_BusinessCondition" ],
  "name" : "ABC Read Only Header Attrs",
  "description" : "Hide start date if agreement number exist",
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
    "contract" : "ReadOnlyContextBind",
    "alias" : "readOnly",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,readOnly) {
/**
 * @authors -  Aman
 * Header Status is read only if Agreement number is null
 */
var attributeHome = step.getAttributeHome();
var agreementNumber = node.getValue("Agreement_Number").getSimpleValue();
/*if (agreementNumber == null || agreementNumber == "") {
    readOnly.setReadOnly(node, attributeHome.getAttributeByID("SI_Header_Status"));
}
*/
if (agreementNumber) {
    readOnly.setReadOnly(node, attributeHome.getAttributeByID("SI_BPA_Start_Date"));
}
return true;
}