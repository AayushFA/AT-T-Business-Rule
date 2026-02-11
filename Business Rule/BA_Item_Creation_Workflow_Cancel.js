/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Item_Creation_Workflow_Cancel",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Workflow_Actions" ],
  "name" : "Item Creation Workflow Cancellation",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonDerivationLib"
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,commonDerivationLib) {
/**
 * @author - Madhuri [CTS]
 * Move the cancelled item to Cancelled Products folder
 */

var lob = node.getValue("Line_Of_Business").getSimpleValue();
if (lob == "Network Mobility") {
	referenceType = stepManager.getLinkTypeHome().getClassificationProductLinkTypeByID("Network_Derived_Reference");
	var references = node.getClassificationProductLinks().get(referenceType);
	if (references.size() > 0) {
		references.get(0).delete();
	}
}

var cancelFolder = stepManager.getProductHome().getProductByID("CancelledProducts");
node.setParent(cancelFolder);
findChildren(node, stepManager); // STIBO-3647

function findChildren(node, stepManager) {
  var children = node.getChildren();
  if (children.size() > 0) {
    children.forEach(function(child) {
      var objectType = child.getObjectType().getID();
      commonDerivationLib.deleteKey(child, stepManager, objectType);
       findChildren(child, stepManager);
    });
  }
}

}