/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_RejectFromReview",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "BPA Reject From Review State",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item", "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "BulkUpdateTriggerStateFlowEvent",
  "parameters" : [ {
    "id" : "currentStateID",
    "type" : "java.lang.String",
    "value" : "Review"
  }, {
    "id" : "eventID",
    "type" : "java.lang.String",
    "value" : "Reject"
  }, {
    "id" : "processNote",
    "type" : "java.lang.String",
    "value" : "Rejected from Review state."
  }, {
    "id" : "stateFlowID",
    "type" : "java.lang.String",
    "value" : "Create_BPA"
  } ],
  "pluginType" : "Operation"
}
*/
