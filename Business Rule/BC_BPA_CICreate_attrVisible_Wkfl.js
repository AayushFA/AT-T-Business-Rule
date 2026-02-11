/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_BPA_CICreate_attrVisible_Wkfl",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "RTL CI Create non Mandatory Attribute - Main Wkfl",
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
     
var attrHome = manager.getAttributeHome();
var objectType = node.getObjectType().getID();
var tempPar = node.getValue("Temp_Parent_Item").getSimpleValue();
if(tempPar){
var bpaNode = manager.getProductHome().getProductByID(tempPar.trim());
var legSou = bpaNode.getValue("Legacy_Source").getSimpleValue();
}
if (objectType == "Contract_Item") {
	if(tempPar != null){
	if(legSou=="Retail Consumer"){
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