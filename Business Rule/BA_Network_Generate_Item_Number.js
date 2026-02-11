/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Network_Generate_Item_Number",
  "type" : "BusinessAction",
  "setupGroups" : [ "Network_Item_Number_Generation" ],
  "name" : "Generate Network Mobility Item Number",
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,itmGenLib) {
/* author: ks9629 */
var itemClassId = node.getValue("Item_Class").getID();
itemClassId = itemClassId.replace(" ", "_");
var objectType = node.getObjectType().getID();
var itemNumber = node.getValue("Item_Num").getSimpleValue();
// Check if ItemNumber is not already assigned
var lob = node.getValue("Line_Of_Business").getSimpleValue();
if(lob=="Network Mobility"){
if (itemNumber == null || itemNumber == "") {
   if (objectType == "Item") {
   	   //itmGenLib.generateItemNumberWithRetry(node, step)
        log.info("result:"+itmGenLib.generateItemNumberWithRetry(node, step));
   	}
    }else {
  log.info("Item Number already included, cannot proceed");
}
}else{
	log.info("Lob is not Network");
}


}