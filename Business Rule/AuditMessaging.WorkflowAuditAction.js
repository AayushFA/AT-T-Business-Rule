/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "AuditMessaging.WorkflowAuditAction",
  "type" : "BusinessAction",
  "setupGroups" : [ "Workflow Auditing" ],
  "name" : "Workflow Audit Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
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
    "contract" : "CurrentWorkflowBindContract",
    "alias" : "workflow",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "TransitionEvaluationBindContract",
    "alias" : "transitionEvaluation",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,workflow,transitionEvaluation) {
// Workflow Audit Action version 1.0. June 2019, Component audit-messaging
// NOTE: A bind must be made to the relevant audit messaging topic for this to produce an audit message, see at bottom of script
var nodeID = node.getID();
var userID = manager.getCurrentUser().getID();
var workflowID = workflow.getID();

var event = transitionEvaluation.getEvent();
var eventID = null;
if (event != null) {
   eventID = event.getID();
}

var transitionMessage = transitionEvaluation.getMessage();
var transitionRejected = transitionEvaluation.isRejected();
var resultMessages = transitionEvaluation.getResultMessages();

if (resultMessages.size() === 0) {
   var concatenatedResults = null;
} else {
   var concatenatedResults = "Evaluation Results (" + resultMessages.size() + "): ";
}

var resultMessageIter = resultMessages.iterator();
while (resultMessageIter.hasNext()) {
   concatenatedResults = concatenatedResults + resultMessageIter.next() + "; ";
}

var sourceState = transitionEvaluation.getSource();
var sourceStateID = null;
if (sourceState) {
   sourceStateID = sourceState.getID();
}

var targetState = transitionEvaluation.getTarget();
var targetStateID = null;
if (targetState) {
   targetStateID = targetState.getID();
}

var logTime = new Date().getTime();

// When using the Audit Message Receiver JDBC Delivery Plugin, the default behaviour when processing 
// messages is to "insert" each message into the database (i.e. create a new database entry for each 
// message). If you wish to "upsert" messages (i.e. if a message with a matching ID exists, update 
// the entry, otherwise create a new database entry), the audit message should contain a field with
// the key "_ID". For example, the field could be set to be a combination of the nodeID and workflowID.
//
// var auditObject = {
//    "_ID": "" + nodeID + "_" + workflowID,
//    ...
// }
var auditObject = {
   "nodeID": "" + nodeID,
   "workflowID": "" + workflowID,
   "userID": "" + userID,
   "logTime": logTime,
   "transition": {
      "eventID": "" + eventID,
      "submitMessage": "" + transitionMessage,
      "sourceStateID": "" + sourceStateID,
      "targetStateID": "" + targetStateID,
      "isRejected": transitionRejected,
      "rejectionMessages": "" + concatenatedResults
   }
};

var auditMessage = JSON.stringify(auditObject);

//--------------- UPDATE BELOW TO YOUR SYSTEM SETUP ---------------
// Send audit message to the audit message framework. A bind will have to be made to a
// topic of an audit message receiver plugin.
//topic.sendMessageAsync(auditMessage)

}