/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DataFix_DTV_Items_Reparent",
  "type" : "BusinessAction",
  "setupGroups" : [ "BR_DataFix" ],
  "name" : "DataFix DTV Items and BPA Reparent",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA", "Item" ],
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step) {
/**
 * @author - John 
 * Data Fix to Move DTV Items to DTV Blue Folders
 * Data Fix to Move DTV BPA's to DTV Folder
 */

var lob = node.getValue("Line_Of_Business").getID();
var legacySource = node.getValue("Legacy_Source").getID();

var parentID = "";

if (lob == "ENT") {

	try {
		parentID = step.getProductHome().getProductByID("SATELLITE");
		if (parentID) {
			node.setParent(parentID);
			node.approve();
		}
	} catch (exeception) {
		log.info("Failed to Move -->  " + node.getID())
	}
} else if (lob == "RTL") {

	try {
		parentID = step.getProductHome().getProductByID("ENTMOB_COL");
		if (parentID) {
			node.setParent(parentID);
			node.approve();
		}
	} catch (exeception) {
		log.info("Failed to Move -->  " + node.getID())
	}
}

if(legacySource == "DTV"){
      try {
		parentID = step.getProductHome().getProductByID("BPA_DTV");
		if (parentID) {
			node.setParent(parentID);
			node.approve();
		}
	} catch (exeception) {
		log.info("Failed to Move -->  " + node.getID())
	}
	
}



}