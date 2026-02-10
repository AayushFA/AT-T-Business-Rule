/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ABC_Create_BPA",
  "type" : "BusinessAction",
  "setupGroups" : [ "ABC_BusinessAction" ],
  "name" : "ABC Create BPA Button",
  "description" : "Usage: Used in the abc portal. For the abc workflow. Screen: ALM_Enrichment_State_Task_List",
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
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
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,webui) {
/**
 * author: aw240u(cognizant)
 * desc: create bpa 
 */
 
var onboard=manager.getProductHome().getProductByID("ABC_Onboarding");
var nodeObj=onboard.createProduct(null,"BPA");
nodeObj.getValue("Consumer_Type").setSimpleValue("HUB");
webui.navigate("ABC_BPA_Create_Screen",nodeObj);



}