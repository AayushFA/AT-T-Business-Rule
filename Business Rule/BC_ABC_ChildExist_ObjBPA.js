/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_ABC_ChildExist_ObjBPA",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Web_BC" ],
  "name" : "Check if Children Exist & Obj is BPA",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Item" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
//author @aw240u@att.com(Aayush Kumar Mahato)

var ChildrenExist =node.getChildren();
//logger.info("ChildrenExist :"+node.getObjectType().getID());
if(node.getObjectType().getID()=="BPA"){
if(ChildrenExist.size() >0){
	return true
}
else{
	return false
}
}
}