/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_BOM_Show_Or_Hide",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_BOM_Web_UI_Conditions" ],
  "name" : "BOM UI Show Or Hide",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BOM_Child", "Bill_Of_Material", "BOM_Child_Substitute" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_BOM_Common_Validation",
    "libraryAlias" : "bomValidationLib"
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
  }, {
    "contract" : "HiddenContextBind",
    "alias" : "hide",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,hide,stepManager,bomValidationLib) {
var attributeHome = stepManager.getAttributeHome();
if(bomValidationLib.isRTLENTBOM(node)|| !bomValidationLib.isPBOMOfType(node, "NON Stock", stepManager)){
	hide.setHidden(node, attributeHome.getAttributeByID("BOM_Deal_ID"));
	hide.setHidden(node, attributeHome.getAttributeByID("BOM_Estimate_ID"));
	hide.setHidden(node, attributeHome.getAttributeByID("BOM_Legacy_Contract_Number"));
	hide.setHidden(node, attributeHome.getAttributeByID("BOM_Supplier_REF"));
	hide.setHidden(node, attributeHome.getAttributeByID("BOM_Vendor_Code"));
	hide.setHidden(node, attributeHome.getAttributeByID("BOM_Vendor_Site"));
}
if(bomValidationLib.isNTWWRLNBOM(node)){
	hide.setHidden(node, attributeHome.getAttributeByID("Publish_Vendor"));
	hide.setHidden(node, attributeHome.getAttributeByID("Attribute_Category"));
}

}