/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Transportation_Tab_Hide_SPLUser",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Web_UI_Conditions" ],
  "name" : "Transportation Tab Hide for SPL User",
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
    "contract" : "ManagerBindContract",
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "appleGroup",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_Apple",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (stepManager,node,appleGroup) {
/*
 * author: aw240u
 */
var curUser = stepManager.getCurrentUser();
    	var result = appleGroup.isMember(curUser);
    if(result){ 
    		return false
    }else {
   	 return true
    }
}