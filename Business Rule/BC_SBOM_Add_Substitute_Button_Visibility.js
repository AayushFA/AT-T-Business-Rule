/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_SBOM_Add_Substitute_Button_Visibility",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_BOM_Web_UI_Conditions" ],
  "name" : "SBOM Add Substitute Button Visibility",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BOM_Child", "BOM_Onboarding", "BOM_Child_Substitute", "Bill_Of_Material" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_BOM_Common_Validation",
    "libraryAlias" : "commonBomValidationLib"
  } ]
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,commonBomValidationLib) {
var objectType = node.getObjectType().getID();
if (objectType == "BOM_Child") {
    return commonBomValidationLib.isRTLENTBOM(node);
} else {
    return false;
}

}