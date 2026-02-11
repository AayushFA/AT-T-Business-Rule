/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Display_ItemType_LOV_For_CI",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "Condition to Display ItemType LOV For CI",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item" ],
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
exports.operation0 = function (node,step,hide) {
/**
	 * @author - Piyal [CTS]
	 * This BC is to display Item type LOV for MSt Item creation from BPA based on LOB
	 */
log.info("Condition to Display ItemType LOV For CI entry");
var objectType= node.getObjectType().getID();
//var lob=null;
var lob= node.getValue("Legacy_Source").getID();
var parent= node.getParent();
var attrHome= step.getAttributeHome();
if(objectType=="Contract_Item")
{
	lob= parent.getValue("Legacy_Source").getID();
	log.info(lob);
	if(lob=="WRLN" || lob=="WRLN_NON" || lob=="QTE")
	{
		hide.setHidden(node,attrHome.getAttributeByID ("CI_User_ItemType_ENT"));
		hide.setHidden(node,attrHome.getAttributeByID ("CI_UserItemType_RTL"));
	}else if(lob=="RTL")
	{
		hide.setHidden(node,attrHome.getAttributeByID ("CI_User_ItemType_ENT"));
		hide.setHidden(node,attrHome.getAttributeByID ("BPA_Business_Group"));
		hide.setHidden(node,attrHome.getAttributeByID ("BPA_Material_Item_Type_Web"));
	}else
	{
		hide.setHidden(node,attrHome.getAttributeByID ("CI_UserItemType_RTL"));
		hide.setHidden(node,attrHome.getAttributeByID ("BPA_Business_Group"));
		hide.setHidden(node,attrHome.getAttributeByID ("BPA_Material_Item_Type_Web"));
	}
     log.info("Condition to Display ItemType LOV For CI exit");
	return true;
	
}
log.info("Condition to Display ItemType LOV For CI exit");
return false;

}