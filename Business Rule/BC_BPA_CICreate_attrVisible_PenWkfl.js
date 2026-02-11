/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_BPA_CICreate_attrVisible_PenWkfl",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "RTL CI Create non Mandatory Attribute - Pending Wkfl",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
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
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ReadOnlyContextBind",
    "alias" : "readOnly",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "HiddenContextBind",
    "alias" : "hide",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,webui,readOnly,hide) {
//author :AAYUSH MAHATO
var ciToItem = manager.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
var item = node.getReferences(ciToItem).toArray();
if (item.length > 0) {
	var itemTarget = item[0].getTarget();
	var lob = itemTarget.getValue("Line_Of_Business").getSimpleValue();
	
}
var attrHome = manager.getAttributeHome();
var objectType = node.getObjectType().getID();
var tempPar = node.getValue("Temp_Parent_Item").getSimpleValue();
if (objectType == "Contract_Item") {
	if(tempPar == null){
    if(lob=="Retail"){
	hide.setHidden(node,attrHome.getAttributeByID ("Max_Order_Qty"));
	hide.setHidden(node,attrHome.getAttributeByID ("Min_Order_Qty"));
	hide.setHidden(node,attrHome.getAttributeByID ("STD_PACKAGING"));
	hide.setHidden(node,attrHome.getAttributeByID ("Non_Process_Flag"));
    }else{
	return true ;
}
}
}
return true;
}