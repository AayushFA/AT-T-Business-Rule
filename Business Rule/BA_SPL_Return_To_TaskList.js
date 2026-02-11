/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SPL_Return_To_TaskList",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_SPL_Web_UI_Actions" ],
  "name" : "SPL Return To TaskList Web UI Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
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
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webUi",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,webUi) {
/**
 * @author - aw240u(Aayush Kumar Mahato)
 * 
 */
var workflow=stepManager.getWorkflowHome().getWorkflowByID("SPI_Onboarding")

if(node.isInWorkflow("SPI_Onboarding")){
	if(node.isInState("SPI_Onboarding","SPI_Enrichment")){
		var state =workflow.getStateByID("SPI_Enrichment")
		webUi.navigate("SPI_Enrichment_TaskList", null,state);
	}else if(node.isInState("SPI_Onboarding","SPI_Review")){
		var state =workflow.getStateByID("SPI_Review")
		webUi.navigate("SPI_Review_TaskList", null,state);
	}else if(node.isInState("SPI_Onboarding","Finish")){
		var state =workflow.getStateByID("Finish")
		webUi.navigate("SPI_Finish_Tasklist", null,state);
	}else{
		//do nothing
	}
}


}