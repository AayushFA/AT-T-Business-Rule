/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Reparent_BPA",
  "type" : "BusinessAction",
  "setupGroups" : [ "BG_BA_DataMigration_BA's" ],
  "name" : "DM BPA Reparent",
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
    "contract" : "ProductBindContract",
    "alias" : "src",
    "parameterClass" : "com.stibo.core.domain.impl.FrontProductImpl",
    "value" : "BPA_Onboarding",
    "description" : null
  }, {
    "contract" : "ProductBindContract",
    "alias" : "src2",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ProductBindContract",
    "alias" : "src3",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,src,src2,src3) {
//var chidren= src.getChildren().asList();
var WRLN_ENT=step.getProductHome().getProductByID("BPA_WRLN_ENT");
var rtl=step.getProductHome().getProductByID("BPA_RTL");
//var ent=step.getProductHome().getProductByID("BPA_ENT");
var onBoarding=step.getProductHome().getProductByID("BPA_Onboarding");
//log.info(wrln);
var legacySource=null;

var children= src2.getChildren().toArray();
//var children= src.getChildren().toArray();
//var children= src3.getChildren().toArray();
  children.forEach(function(BPA){
     if(BPA.getObjectType().getID()=="BPA"){
  	legacySource=BPA.getValue("Legacy_Source").getID();
  	if(legacySource)
  	{
  		if(legacySource=="RTL")
  		{
  			BPA.setParent(rtl)
  		}
  		else{
  			BPA.setParent(WRLN_ENT)
  		}
  		
  	}else
  	{
  		BPA.setParent(onBoarding)
  	}
  }
  });

}