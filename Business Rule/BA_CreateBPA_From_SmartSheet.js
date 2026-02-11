/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CreateBPA_From_SmartSheet",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "Create BPA From SmartSheet",
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
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "issue",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ListOfValuesBindContract",
    "alias" : "lov",
    "parameterClass" : "com.stibo.core.domain.impl.ListOfValuesImpl",
    "value" : "BPA_CM_LOV",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,issue,lov) {
/**
 * @author - Piyal [CTS]
 * Create BPA from Smartsheet
 */

var contManger= node.getValue("BPA_ContractMngr_SS").getSimpleValue();
var val=null;
contManger=contManger.toUpperCase();
val=lov.getListOfValuesValueByID(contManger);

if(!val){
	
	issue.addError("The given Contract Manager ID is not valid");
	return issue;
}
else{
node.getValue("BPA_Contract_Manager").setLOVValueByID(contManger);
}


}
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "BPA",
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
exports.operation1 = function (BPA,step) {
/**
	 * @author - Piyal [CTS]
	 * Setting parent for BPA during creation through Smartsheet
	 */

//var onBoarding=step.getProductHome().getProductByID("BPA_Onboarding");
//node.setParent(onBoarding);



var objectType=null;

var rtl=step.getProductHome().getProductByID("BPA_RTL");
var dtv=step.getProductHome().getProductByID("BPA_DTV");
var wrln_ent=step.getProductHome().getProductByID("BPA_WRLN_ENT");
var onBoarding=step.getProductHome().getProductByID("BPA_Onboarding");
//log.info(wrln);
var legacySource=null;
objectType =BPA.getObjectType().getID();

if(objectType=="BPA")
{
     BPA.setName(BPA.getID());
     if(BPA.getObjectType().getID()=="BPA"){
  	legacySourceENT=BPA.getValue("Legacy_Source_ENT_Temp").getID();
  	legacySourceRTL=BPA.getValue("Legacy_Source_RTL_Temp").getID();
  	legacySourceWRLN=BPA.getValue("Legacy_Source_WRLN_Temp").getID();
  	if(legacySourceRTL!=null)
  	{
  		
  		 BPA.setParent(rtl);
		 
  	}else if(legacySourceWRLN!=null)
  	{
  		BPA.setParent(wrln_ent);
  	}
	else if(legacySourceENT!=null && legacySourceENT!="DTV" ){
		BPA.setParent(wrln_ent);
     }
     else if(legacySourceENT!=null && legacySourceENT=="DTV" ){
		BPA.setParent(dtv);
     }
  else
  	{
  		BPA.setParent(onBoarding)
  	}
}
}


  

}
/*===== business rule plugin definition =====
{
  "pluginId" : "ReferenceOtherBABusinessAction",
  "parameters" : [ {
    "id" : "ReferencedBA",
    "type" : "com.stibo.core.domain.businessrule.BusinessAction",
    "value" : "BA_PushObjectInBPACreateWF"
  } ],
  "pluginType" : "Operation"
}
*/
