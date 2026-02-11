/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_Default_Page_Visibility",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Web_UI_Conditions" ],
  "name" : "Item Default Page Visibility",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
var splCompleteStateTask = "";
splWFInstance=node.getWorkflowInstanceByID("SPI_Onboarding");
if(splWFInstance){
   var splCompleteStateTask = node.isInState("SPI_Onboarding","Finish");
}	   
if(node.getObjectType().getID() == "Item" && (!node.isInWorkflow("SPI_Onboarding") ||splCompleteStateTask))
   return true;
else
   return false;





}