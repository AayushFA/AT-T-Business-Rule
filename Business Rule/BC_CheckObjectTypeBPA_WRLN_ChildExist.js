/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_CheckObjectTypeBPA_WRLN_ChildExist",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "Check if object type BPA WRLN & Child Exist",
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
var lob= node.getValue("Legacy_Source").getID()
var Child=node.getChildren();
if(objectType=='BPA')
{
//if(lob=="WRLN_NON" || lob=="WRLN" || lob=="QTE")	//2_26_2024 STIBO-1428
if(lob!="RTL")
	{
		if(Child.size()>0){
	 return true;	 
	}
	}else
	{
	 return false;
	}
	
}else
return false;
}