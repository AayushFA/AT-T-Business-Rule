/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_CancelButton_Visibility",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "Check if Cancel Button Visible",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item", "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
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
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ugWrlnEng",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_WRLN_Engineering",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ugWrlnSrc",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_WRLN_Sourcing",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,ugWrlnEng,ugWrlnSrc) {
function isProcessedInEBS(node) {
    ebsFlag = node.getValue("BPA_Processed_In_EBS").getID();
    objType = node.getObjectType().getID();
    var curUser = step.getCurrentUser();
    	var wrlnEngUser = ugWrlnEng.isMember(curUser) && !ugWrlnSrc.isMember(curUser); //STIBO-2529
    if(objType == "BPA" && wrlnEngUser){ //STIBO-1432
    		return true;
    }else {
   	 return  (ebsFlag== "Y" || ebsFlag== "E");
    }
}

  if (!isProcessedInEBS(node)) {
    return true;
  }

  return false;

}