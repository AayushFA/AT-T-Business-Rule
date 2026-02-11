/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SOA_Preprocessor",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Integration_Actions" ],
  "name" : "SOA Oubound Preprocessor",
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
    "contract" : "ManagerBindContract",
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentEventBatchBinding",
    "alias" : "batch",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (stepManager,batch) {
/**
 * @author Aditya Rudragoudar && mb916k
 * Preprocessor to add parent, HU, and PKG objects to batch
 * Incoming objects Item, Child Org, Companion SKU
 */
var events = batch.getEvents();

function getApprovedObject(node, stepManager) {
    if (!node) return null;
    var approvedManager = stepManager.executeInWorkspace("Approved", function(step) {
        return step;
    });
    return approvedManager.getProductHome().getProductByID(node.getID());
}

for (var a = 0, eventCount = events.size(); a < eventCount; a++) {
    var event = events.get(a);
    var node = event.getNode();
    var approvedNode = getApprovedObject(node, stepManager);
    if (approvedNode) {
	    var objectTypeId = approvedNode.getObjectType().getID();
	    var parent = approvedNode.getParent();
	    var parentObjectTypeId = parent ? parent.getObjectType().getID() : null;
	
	    // Handle Child_Org_Item
	    if (objectTypeId == "Child_Org_Item") {
	        var approvedParent = getApprovedObject(parent, stepManager);
	        if (approvedParent) {
	            batch.addAdditionalNode(approvedParent);
	            addTransportationAndChildOrgObjects(approvedParent);
	        }
	    }

		if (objectTypeId == "Transportation_Handling_Unit") {
	        var approvedParent = getApprovedObject(parent, stepManager);
	        if (approvedParent) {
	            batch.addAdditionalNode(approvedParent);
	            addTransportationAndChildOrgObjects(approvedParent);
	        }
	    }

		if (objectTypeId == "Transportation_Package") {
	        var approvedParent = getApprovedObject(parent, stepManager);
	        if (approvedParent) {
	            batch.addAdditionalNode(approvedParent);
	            addTransportationAndChildOrgObjects(approvedParent);
	        }
	    }

	    // Handle Companion_SKU as parent
	    if (parentObjectTypeId == "Companion_SKU" && parent) {
	        var grandParent = getApprovedObject(parent.getParent(), stepManager);
	        if (grandParent) {
	            batch.addAdditionalNode(grandParent);
	            addTransportationAndChildOrgObjects(grandParent);
	        }
	    }

	    // Handle Companion_SKU as node
	    if (objectTypeId == "Companion_SKU") {
	        var approvedParent = getApprovedObject(parent, stepManager);
	        if (approvedParent) {
	            batch.addAdditionalNode(approvedParent);
	            addTransportationAndChildOrgObjects(approvedNode);
	            addTransportationAndChildOrgObjects(approvedParent);
	        }
	    }

	    // Always add transportation objects for Item or Companion_SKU
	    if (objectTypeId == "Item" || objectTypeId == "Companion_SKU") {
	        addTransportationAndChildOrgObjects(approvedNode);
	    }
	    if (objectTypeId == "Item") {
            addCompanionSKU(approvedNode);
        }
  	}
}

function addTransportationAndChildOrgObjects(node) {
    if (!node) return;
    var childObjects = node.queryChildren().asList(1000);
    childObjects.forEach(function(child) {
        var approvedChild = getApprovedObject(child, stepManager);
        if (approvedChild) {
            var approvedObjectTypeId = approvedChild.getObjectType().getID();
            if (approvedObjectTypeId == "Transportation_Handling_Unit" || approvedObjectTypeId == "Transportation_Package" || approvedObjectTypeId == "Child_Org_Item" ||
                approvedObjectTypeId == "Companion_SKU") {
                batch.addAdditionalNode(child);
                 if (approvedObjectTypeId == "Companion_SKU") {
                    addTransportationAndChildOrgObjects(approvedChild);
                }
            }
        }
    });
}

function addCompanionSKU(node) {
    if (!node) return;
    var childObjects = node.queryChildren().asList(1000);
    childObjects.forEach(function(child) {
        var approvedChild = getApprovedObject(child, stepManager);
        if (approvedChild && approvedChild.getObjectType().getID() == "Companion_SKU") {
            batch.addAdditionalNode(child);           
            addCompanionSKU(approvedChild);
        }
    });
}
}