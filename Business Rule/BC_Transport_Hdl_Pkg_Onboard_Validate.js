/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Transport_Hdl_Pkg_Onboard_Validate",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Transportation_Attribute_Action" ],
  "name" : "BC Transportation Handling Packaging Unit Onboard Validation",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Transportation_Handling_Unit", "Transportation_Package" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Transportation_Validation",
    "libraryAlias" : "transpValLib"
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
    "contract" : "ManagerBindContract",
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "issue",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,issue,transpValLib) {
/*
 * author: aw240u
 */
var orderingUOM = node.getValue("TMS_Ordering_UOM").getID();;
var handlingUnitType = node.getValue("TMS_Handling_Unit_Type").getID();;
var handlingUnitID = node.getValue("TMS_Handling_Unit_ID").getID();
var itemNum = node.getValue("Parent_Item_Number").getSimpleValue();
var productObject = stepManager.getNodeHome().getObjectByKey("Item.Key", itemNum.trim());
log.info("productObject:"+productObject);
if (!productObject || productObject == null) {
  issue.addError("Please provide a valid Parent Item Number");
  return issue;
}
if (node.getObjectType().getID() == "Transportation_Handling_Unit") {
	
  var errorMsgHU = transpValLib.validateHU(productObject, orderingUOM, handlingUnitType, handlingUnitID);
  if (errorMsgHU) {
    issue.addError(errorMsgHU);
    return issue;
  }
  return true;
}
if (node.getObjectType().getID() == "Transportation_Package") {
	var errorMsgPkg = transpValLib.validatePKG(productObject, orderingUOM);
  if (errorMsgPkg) {
    issue.addError(errorMsgPkg);
    return issue;
  }
  return true;
}


}