/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_IMEI_Node_Handler_Combined_Outbound",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_IMEI_Integration_Actions" ],
  "name" : "IMEI Node Handler Combined Outbound Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "IMEI_Item" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_IMEI_Telegence_Outbound",
    "libraryAlias" : "lib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "OutboundBusinessProcessorNodeHandlerSourceBindContract",
    "alias" : "nodeHandlerSource",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "OutboundBusinessProcessorNodeHandlerResultBindContract",
    "alias" : "nodeHandlerResult",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "OutboundBusinessProcessorExecutionReportLoggerBindContract",
    "alias" : "executionReportLogger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookup",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "log",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (nodeHandlerSource,nodeHandlerResult,executionReportLogger,lookup,log,step,lib) {
/**
 * @author - rj5341.
 * @Reviewed By - Aditya Rudragoudar
 * IMEI Telegence Outbound Integration - Node Handler for main, GSM and DCL
*/
var headerColumns = lib.getAssetFileContent("DA-7516498", step);
var headerColumnsGSM = lib.getAssetFileContent("DA-7528299", step);
var headerColumnsDCL = lib.getAssetFileContent("DA-7528300", step);
var eventTypeId = nodeHandlerSource.getSimpleEventType().getID();
var nodeMain = nodeHandlerSource.getNode();
if (nodeMain) {
	var node = null;
	var objTypeId = nodeMain.getObjectType().getID();
	executionReportLogger.logInfo("Event Type ID: " + eventTypeId + ", Node ID: " + nodeMain.getID());

	if (nodeMain instanceof com.stibo.core.domain.Product && objTypeId == "IMEI_Tac_Range") {
		var dataAction = "";
		var dataActionGSM = "";
		var dataActionDCL = "";
		
		if (eventTypeId == "Delete") {
			dataAction = "D|DELETE|";
			node = nodeMain; // Main Workspace Object
		} else {	
			dataAction = "D|ADD|";
			dataActionGSM = "D|ADD|";
			dataActionDCL = "D|ADD|";
			node = lib.getApprovedObject(nodeMain, step); // Approvded Workspace Object
		}

		var approvedNode = lib.getApprovedObject(node, step);
		// MAIN
		var mesg;
		if(eventTypeId == "Delete") {	
			mesg =  "MAIN:"+dataAction + lib.buildMessage(headerColumns, nodeMain, nodeMain.getParent(), step);
			executionReportLogger.logInfo("IMEI Tac Range Delete Message: " + mesg);
			nodeHandlerResult.addMessage("main", mesg);
		} 

		if(eventTypeId == "Create") {	
			mesg =  "MAIN:"+dataAction + lib.buildMessage(headerColumns, node, node.getParent(), step);
			executionReportLogger.logInfo("IMEI Tac Range Add Message: " + mesg);
			nodeHandlerResult.addMessage("main", mesg);
		}

		if (eventTypeId == "Modify") {
			var modifyType = lib.changeType(node, step);
			var predecessorIMEIItemNode, predecessorTacRangeNode, deleteMsg, addMsg;
			executionReportLogger.logInfo("Modify Type: " + modifyType);
			
			if (modifyType === "tacrangeupdate") {
				predecessorTacRangeNode = lib.getPredecessorNode(approvedNode);
				deleteMsg = "MAIN:D|DELETE|" + lib.buildMessage(headerColumns, predecessorTacRangeNode, node.getParent(), step);
				addMsg = "MAIN:D|ADD|" + lib.buildMessage(headerColumns, node, node.getParent(), step);
				executionReportLogger.logInfo("TAC Range Modify Delete Message: " + deleteMsg);
				executionReportLogger.logInfo("TAC Range Modify Add Message: " + addMsg);
			} else if (modifyType === "imeiitemupdate") {
				predecessorIMEIItemNode = lib.getPredecessorNode(node.getParent());
				deleteMsg = "MAIN:D|DELETE|" + lib.buildMessage(headerColumns, node, predecessorIMEIItemNode, step);
				addMsg = "MAIN:D|ADD|" + lib.buildMessage(headerColumns, node, node.getParent(), step);
				executionReportLogger.logInfo("IMEI Item Modify Delete Message: " + deleteMsg);
				executionReportLogger.logInfo("IMEI Item Modify Add Message: " + addMsg);
			} else if (modifyType === "both") {
				predecessorIMEIItemNode = lib.getPredecessorNode(node.getParent());
				predecessorTacRangeNode = lib.getPredecessorNode(approvedNode);
				deleteMsg = "MAIN:D|DELETE|" + lib.buildMessage(headerColumns, predecessorTacRangeNode, predecessorIMEIItemNode, step);
				addMsg = "MAIN:D|ADD|" + lib.buildMessage(headerColumns, node, node.getParent(), step);
				executionReportLogger.logInfo("IMEI Item & Tac Range Modify Delete Message: " + deleteMsg);
				executionReportLogger.logInfo("IMEI Item & Tac Range Modify Add Message: " + addMsg);
			} else {
				deleteMsg = "MAIN:D|DELETE|" + lib.buildMessage(headerColumns, node, node.getParent(), step);
				addMsg = "MAIN:D|ADD|" + lib.buildMessage(headerColumns, node, node.getParent(), step);
				executionReportLogger.logInfo("IMEI Item & Tac Range No Change Delete Message: " + deleteMsg);
				executionReportLogger.logInfo("IMEI Item & Tac Range No Change Add Message: " + addMsg);
			}
			nodeHandlerResult.addMessage("main", deleteMsg + addMsg);
		}		
		
		// GSM	
		if (dataActionGSM == "D|ADD|") {
			var mesgGSM =  "GSM:"+dataActionGSM + lib.buildMessage(headerColumnsGSM, node, node.getParent(), step);	
			nodeHandlerResult.addMessage("main", mesgGSM);
		}
		// DCL
		if (dataActionDCL == "D|ADD|") {
			var mesgDCL =  "DCL:"+dataActionDCL + lib.buildMessage(headerColumnsDCL, node, node.getParent(), step);	
			nodeHandlerResult.addMessage("main", mesgDCL);
		}
	}
}
}