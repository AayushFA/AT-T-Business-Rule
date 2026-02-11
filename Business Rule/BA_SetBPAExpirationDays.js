/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetBPAExpirationDays",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATTReportBusinessRules" ],
  "name" : "Set BPA Header Expiration Days",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
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
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager) {
//author : @aw240u( cognizant)

var expDateFormat = node.getValue("Expiration_Date").getSimpleValue();
var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd"); // For ISO Date Format
var dateNow = new Date();
var todayDateFormat = dateTimeFormatter.format(dateNow);
var expDateObj = new Date(expDateFormat);
var todayDateObj = new Date(todayDateFormat);
if (expDateFormat >= todayDateFormat) {
    var timeDiff = expDateObj.getTime() - todayDateObj.getTime();
    var diffInDays = (timeDiff / (1000 * 3600 * 24));
    node.getValue("BPA_Expiration_Days").setValue(diffInDays);
} else {
    node.getValue("BPA_Expiration_Days").setValue(null);
    
}
//make attribute externally maintained
//check for expiry<today scenario for null
}