/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPACreateOB_Preprocessor",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "BPA Create OB Preprocessor",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
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
    "contract" : "CurrentEventBatchBinding",
    "alias" : "batch",
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
exports.operation0 = function (batch,step) {
/**
 * @author - Piyal [CTS]
 * BPA Create OB Preprocessor
 */

var events = batch.getEvents();
for (var a = 0; a < events.size(); a++) {
	var event = events.get(a);
	if (event.getSimpleEventType().getID() == "Create") {
		var node = event.getNode();		
		if (node != null) {
			var children = node.getChildren();
			if (children.size() > 0) {
				for (var i = 0; i < children.size(); i++) {
					var childCI = children.get(i);
					batch.addAdditionalNode(childCI);
					var leChildren = childCI.getChildren();
					if (leChildren.size() > 0) {
						for (var j = 0; j < leChildren.size(); j++) {
							var childCILE = leChildren.get(j);							
							batch.addAdditionalNode(childCILE);
						}
					}
				}
			}
		}
	}
}

}