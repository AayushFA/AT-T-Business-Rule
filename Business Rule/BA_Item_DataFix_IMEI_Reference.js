/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Item_DataFix_IMEI_Reference",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_IMEI_Data_Migration_Actions" ],
  "name" : "Set Item to IMEI Reference",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Generate_Item_Number",
    "libraryAlias" : "itmGenLib"
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
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "issue",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,issue,itmGenLib) {
/*
 * author : AW240U(COGNIZANT)
 * WHERE TO USE IT: TO populate item to imei reference
 * Steps to run : 
 * Step 1:search for all the Rtl ITEMS who has "IMEI_Item_ID" this attribute filled
 * Step 2:run this br on that collection 
 * Step 3:click on "save failed object" and make a collection of it - this represents the items whose attribute value "IMEI_Item_ID" 
 *       doesnt have corresponding "IMEI Item " in the imei hierarchy.
 */

var imeiItemID = node.getValue("IMEI_Item_ID").getSimpleValue();
var error = "";
if(imeiItemID){
	imeiItemID = imeiItemID.toUpperCase();
}
if (imeiItemID && imeiItemID!="N/A" && imeiItemID!="NA") {
	var imeiObject = manager.getNodeHome().getObjectByKey("IMEI.Item.Key", imeiItemID);
    if (imeiObject) {
    var refType = manager.getReferenceTypeHome().getReferenceTypeByID("Item_To_IMEI_Item_Reference");
    var referenceCount = node.queryReferences(refType).asList(1).toArray();
    if (referenceCount.length > 0) {
      referenceCount.forEach(function(reference) {      	
        reference.delete();
      });
      node.createReference(imeiObject, refType);
       partialApprove(node);
    }
    if (referenceCount.length == 0) {
    	  node.createReference(imeiObject, refType);
    	   partialApprove(node);
    }
   
  } else {
    error = error + node.getID() + "(" + imeiItemID.trim() + ")" + ":IMEI-ID not in the IMEI ITEM HIERARCHY \n";
    throw error;
  }
}



function partialApprove(node) {
	var set = new java.util.HashSet();
	var setUnapproved = node.getNonApprovedObjects();
	var unapprovedIterator = setUnapproved.iterator();
	while (unapprovedIterator.hasNext()) {
		var partObject = unapprovedIterator.next();
		var partObjectStr = partObject.toString();
		if (partObjectStr.indexOf("ProductReferencePartObject") != -1) {
			set.add(partObject);
		}
	}
	if (set.size() > 0) {
		node.approve(set);
	}
}
}