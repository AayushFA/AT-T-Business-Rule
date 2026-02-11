/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_CheckObjectTypeCI_WRLN_ChildExist",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "Check if object type CI ENT_WRLN & Child Exist",
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
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
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
var objectType= node.getObjectType().getID();
var attrHome=step.getAttributeHome();
var lob= node.getParent().getValue("Legacy_Source").getID()
var Child=node.getChildren();
if(objectType=='Contract_Item')
{
    if(lob!="RTL")		
	{
		if(Child.size()>0){
		  if(node.getValue("BPA_Processed_In_EBS").getID() != "Y")
	         return true;	 
	       else
	         return false;
		
	}else
	{
	 return false;
	}
	
}else
return false;
}
}