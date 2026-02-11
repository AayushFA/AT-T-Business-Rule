/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_Reparent",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "BPA Reparent During Create",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA_Root", "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
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
  }, {
    "contract" : "ProductBindContract",
    "alias" : "src",
    "parameterClass" : "com.stibo.core.domain.impl.FrontProductImpl",
    "value" : "BPA_Root",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (BPA,step,src) {
//var chidren= src.getChildren().asList();
var wrln=step.getProductHome().getProductByID("BPA_WRLN");
var rtl=step.getProductHome().getProductByID("BPA_RTL");
var ent=step.getProductHome().getProductByID("BPA_ENT");
var wrln_ent=step.getProductHome().getProductByID("BPA_WRLN_ENT");
var dtv=step.getProductHome().getProductByID("BPA_DTV");
var onBoarding=step.getProductHome().getProductByID("BPA_Onboarding");
log.info(wrln_ent);
var legacySource=null;


  
     if(BPA.getObjectType().getID()=="BPA"){
  	legacySource=BPA.getValue("Legacy_Source").getID();
  	if(legacySource)
  	{
  		if(legacySource=="RTL")
  		{
  			BPA.setParent(rtl)
  		}
  		else if(legacySource=="DTV")
  		{
  			BPA.setParent(dtv)
  		}
  		else{
  			BPA.setParent(wrln_ent)
  		}
  		
  	}else
  	{
  		BPA.setParent(onBoarding)
  	}
  }
  

}