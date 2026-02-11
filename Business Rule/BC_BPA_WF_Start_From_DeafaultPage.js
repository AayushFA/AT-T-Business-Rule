/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_BPA_WF_Start_From_DeafaultPage",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "Start BPA WF from Deafault Page Condition",
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
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ug_dg",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_DG",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ug_wrlnSourcing",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_WRLN_Sourcing",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ug_rtlPlanner",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_RTL_Planner",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ug_rtlBuyer",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_RTL_Buyer",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ug_entBuyer",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_ENT_Buyer",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "stiboUser",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "Stibo",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ug_wrlnEng",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_WRLN_Engineering",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ug_dtv",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_DTV_Sourcing",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,ug_dg,ug_wrlnSourcing,ug_rtlPlanner,ug_rtlBuyer,ug_entBuyer,stiboUser,ug_wrlnEng,ug_dtv) {
log.severe("Start Of BPA WF Applies If Condition");
var objectType=node.getObjectType().getID();
var curUser = step.getCurrentUser();
log.severe("checkUser :"+checkUser(curUser))
log.severe("BPA True Condition:"+objectType=="BPA" &&!node.isInWorkflow("BPA_Clone") && !node.isInWorkflow("Create_BPA") && checkUser(curUser));
log.severe("CI True Condition: "+objectType=="Contract_Item" &&!node.isInWorkflow("BPA_Clone") && !node.isInWorkflow("Create_BPA") && checkUser(curUser))
if(objectType=="BPA" &&!node.isInWorkflow("BPA_Clone") && !node.isInWorkflow("Create_BPA") && checkUser(curUser))
{
	return true;
}else if(objectType=="Contract_Item" &&!node.isInWorkflow("BPA_Clone") && !node.isInWorkflow("Create_BPA") && checkUser(curUser))
{
	return true;
}
return false;	
log.severe("End Of BPA WF Applies If Condition");

function checkUser(curUser){
	if (ug_dg.isMember(curUser) || ug_wrlnSourcing.isMember(curUser) || ug_rtlPlanner.isMember(curUser) || ug_rtlBuyer.isMember(curUser) ||ug_entBuyer.isMember(curUser) ||stiboUser.isMember(curUser) || ug_wrlnEng.isMember(curUser) || ug_dtv.isMember(curUser)){
		return true;
	}
	else{
		return false
	}
}
	
	
	
	/*if(objectType=="BPA" &&!node.isInWorkflow("BPA_Clone") && !node.isInWorkflow("Create_BPA"))
	{
      if(node.getValue("BPA_Status").getID()=="OPEN"))
      {
      return true;
      }else  if(node.getValue("ContractItem_Status").getID()=="OPEN"))
      {
        return true;
      }
	}else
     {
      return false;
      }*/

}