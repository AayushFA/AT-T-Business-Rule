/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_IMEI_Telegence_Preprocessor",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_IMEI_Integration_Actions" ],
  "name" : "IMEI Telegence Preprocessor Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item" ],
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
    "contract" : "CurrentEventBatchBinding",
    "alias" : "batch",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (batch,stepManager) {
/**
 * @author Aditya Rudragoudar
 * Preprocessor to remove duplicate Modify events
 */
var events = batch.getEvents();

for (var a = 0, eventCount = events.size(); a < eventCount; a++) {
    var event = events.get(a);
    var node = event.getNode();
    var objectTypeId = node.getObjectType().getID();
    var eventTypeId = event.getSimpleEventType().getID();
    if(eventTypeId == "Delete" || eventTypeId == "Create") {
        for (var b = 0, eventCount = events.size(); b < eventCount; b++) {
            var compareEvent = events.get(b);
            var compareNode = compareEvent.getNode();
            if(compareNode.getID() == node.getID() && compareEvent.getSimpleEventType().getID() == "Modify") {
               log.severe("Removing duplicate Modify Event: "+compareNode.getID());
               batch.removeEvent(compareEvent);
            }
        }
    }
}
}