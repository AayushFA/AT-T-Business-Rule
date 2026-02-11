/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SPL_Batch_Request_Submit",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_SPL_Web_UI_Actions" ],
  "name" : "SPL Batch Request Submit Web UI Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Apple_Generate_Item_Number",
    "libraryAlias" : "appItmGenLib"
  }, {
    "libraryId" : "BL_Generate_Item_Number",
    "libraryAlias" : "itmGenLib"
  }, {
    "libraryId" : "BL_SPL_Validation_Library",
    "libraryAlias" : "splValidationLib"
  }, {
    "libraryId" : "BL_SPL_Derivation",
    "libraryAlias" : "splLib"
  } ]
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
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "QueryHomeBindContract",
    "alias" : "queryHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,webui,queryHome,appItmGenLib,itmGenLib,splValidationLib,splLib) {
/**
 * @author - Aditya Rudragoudar
 * @coauthor - Aayush Mahato
 * Submits current batch to enrirchment state
 */

log.info("Inside SPL Batch Submit Business Action");
var condition = com.stibo.query.condition.Conditions;
var query = splLib.getAllSPLWorkflowTasks(stepManager, queryHome, condition);
var workflowBatchIdList = []
var batchId = "";

var appleAPIError = splValidationLib.validateAppleAPIData(query);
if(appleAPIError){
	webui.showAlert("ERROR", appleAPIError);
}else{
	try {
	  //to generate the itm number of all the item in Sequence
	appItmGenLib.reRunItemNumberGenerationAllTillMaxLimit(stepManager);
	} catch (e) {
	  throw itmGenLib.getMessageBetweenWords(e.toString(), "JavaException: javax.script.ScriptException:", "in");
	 }
	if (query) {	
	    query.forEach(function(task) {
	        var currentNode = task.getNode();
	        if (currentNode.isInState("SPI_Onboarding", "Start")) {           
	            workflowBatchIdList.push(currentNode.getID());
	            task.triggerByID("Submit", "Moved to Enrichment State");
	        }
	        if (!batchId) {
	            batchId = currentNode.getValue("Batch_Id").getSimpleValue();
	        }
	        return true;
	    });	
	}
	var screenId = webui.getScreenId();
	webui.navigate(screenId, node);
}
}