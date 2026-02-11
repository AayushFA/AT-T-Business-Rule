/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_IMEI_Joiner_Combined_Outbound",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_IMEI_Integration_Actions" ],
  "name" : "IMEI Joiner Combined Outbound Action",
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
    "contract" : "OutboundBusinessProcessorExecutionReportLoggerBindContract",
    "alias" : "executionReportLogger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "OutboundBusinessProcessorJoinerSourceBindContract",
    "alias" : "joinerSource",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "OutboundBusinessProcessorJoinerResultBindContract",
    "alias" : "joinerResult",
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
exports.operation0 = function (executionReportLogger,joinerSource,joinerResult,step,lib) {
/**
 * @author - rj5341.
 * @Reviewed By - Aditya Rudragoudar
 * IMEI Telegence Outbound Integration - Joiner for main, gsm and dcl
*/
var headerColumns = lib.getAssetFileContent("DA-7516498", step);
var headerColumnsGSM = lib.getAssetFileContent("DA-7528299", step);
var headerColumnsDCL = lib.getAssetFileContent("DA-7528300", step);
lib.appendFromGroup("main", joinerSource, joinerResult, headerColumns, headerColumnsGSM, headerColumnsDCL);
}