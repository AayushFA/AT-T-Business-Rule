/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DM_BPA_CI_Actions",
  "type" : "BusinessAction",
  "setupGroups" : [ "BG_BA_DataMigration_BA's" ],
  "name" : "DM BPA CI Import Actions",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item" ],
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
 * @author - Piyal [CTS]
 * BPA CI Import Action
 */
 
var parent= node.getParent();
var id=parent.getID();
node.getValue("Parent_ID").setSimpleValue(id);
var no_Children=parent.getChildren().size();
node.getValue("ContractItem_Seq_Num").setSimpleValue(no_Children);

}