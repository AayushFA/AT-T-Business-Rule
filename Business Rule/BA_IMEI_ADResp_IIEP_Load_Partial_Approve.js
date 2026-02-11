/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_IMEI_ADResp_IIEP_Load_Partial_Approve",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_IMEI_Integration_Actions" ],
  "name" : "IMEI AddDelResp IIEP Load File And Partial Approve",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonLib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "InboundBusinessProcessorImporterSourceBindContract",
    "alias" : "inboundMessage",
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
    "contract" : "InboundBusinessProcessorExecutionReportLoggerBindContract",
    "alias" : "executionReportLogger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
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
exports.operation0 = function (inboundMessage,manager,executionReportLogger,logger,node,commonLib) {
/*
  * @author Hari B 
  * IMEI Tac Add Del Response - Inbound Interface 
  * This rule sets the telegence processed flag (IMEI_TAC_Telegence_Processed) to P for successful responses received
*/

// To rmemove object from workflow
function removeWF(node, workflowName){
    var wfInstance = node.getWorkflowInstanceByID(workflowName);
    if(wfInstance)
        wfInstance.delete("Removed from " + workflowName + " upon updating the telegence process flag successfully");
}

var payload = inboundMessage.getMessage();

try {
    var text = String(payload);
    var lines = text.split(/\r\n|\r|\n/);
} catch (e) {
    executionReportLogger.logError("Unexpected error: " + e);
}

for (var i = 1; i < lines.length - 1; i++) {
    
//    executionReportLogger.logInfo("---------------------Loop ---------------------"+i);
    
    var fields = lines[i].split("|");
    var recType = fields[0];
    var action = fields[1];
    var itemId = fields[2];
    var fromTac = fields[3];
    var tlgProcessFlag = fields[5];

    if(recType == "D" && action == "ADD" && tlgProcessFlag == "P"){

    var itemimei = manager.getNodeHome().getObjectByKey("IMEI.Item.Key", itemId);
    var fromtacbykey = manager.getNodeHome().getObjectByKey("IMEI.TAC.From.Key", fromTac); 
  
    try {
        fromtacbykey.getValue("IMEI_TAC_Telegence_Processed").setLOVValueByID("P");
    }
    catch (e){
        executionReportLogger.logInfo("Error in setting the flag: " + e);
    }

    // Partial Approval 
    var partialApprovalList = commonLib.getAttributeGroupList(fromtacbykey, manager, "AG_IMEI_Tac_Response_Inbound");
    commonLib.partialApproveFields(fromtacbykey, partialApprovalList);

    // Remove object from workflow (Its waiting in Awaiting Feedback Status before this step) 
    removeWF(itemimei, "IMEI_Maintenance_Workflow");
    removeWF(itemimei, "IMEI_Onboarding_Workflow");

   }
  
}

    var clearOffValueObj = manager.getEntityHome().getEntityByID("IMEI_Configuration");

    var clearAttrIMEIMaintTracker = clearOffValueObj.getValue("IMEI_Maintenance_Tracker").setSimpleValue(null); 

return true;
}