/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_SPL_Default_Page_Visibility",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_SPL_Conditions" ],
  "name" : "SPL Default Page Visibility",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
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
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookUpTableHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "HiddenContextBind",
    "alias" : "hide",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ReadOnlyContextBind",
    "alias" : "readOnly",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,lookUpTableHome,hide,readOnly) {
/*
var attributeHome = stepManager.getAttributeHome();
//var lob = node.getValue("Line_Of_Business").getID();

	
	var compItemTypes =node.getValue("Companion_Item_Type").getSimpleValue();
	log.info(compItemTypes);
	 var compItemType = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_Companion_Item_Type_Duplicate").getListOfValuesValueByID(compItemTypes).getValue();
	log.info(compItemType);

	readOnlyAttributes = lookUpTableHome.getLookupTableValue("LT_CompanionSKU_UI_ReadOnly_Attributes", "Create_Update_Attributes");
	//log.info(readOnlyAttributesList);
	if(readOnlyAttributes){
	readOnlyAttributesList=readOnlyAttributes.split(",");
	
	readOnlyAttributesList.forEach(function(attributeID){
			
	var compItemTypesList = lookUpTableHome.getLookupTableValue("LT_CompanionSKU_UI_ReadOnly_Attributes", attributeID);
	//log.info("Lookup Result: " + LookUpResult);
	if(compItemTypesList){
		log.info(compItemTypesList);
		if(compItemTypesList.includes(compItemType)){
			readOnly.setReadOnly(node, attributeHome.getAttributeByID(attributeID));
			 
			log.info("Should be readOnly " + attributeID);
		}
		
	}
});
}
return true;

}*/
//validateConfigCode(node,stepManager);
function validateConfigCode(node,stepManager){
	
	var errorMessage="";
	var retailDeviceList = stepManager.getEntityHome().getEntityByID("RTL_Item_Type").getValue("Retail_Device_Items").getSimpleValue();
	var OEM = node.getValue("OEM").getID();
	var OEMFullName = node.getValue("OEM_Full_Name").getID();
	var retailItemType = node.getValue("RTL_Item_Type").getID();
	var configCode = node.getValue("Config_Code").getSimpleValue();		
	if (retailDeviceList && retailDeviceList.includes(String(retailItemType)) && configCode && (OEM != "APL" || OEMFullName != "Apple")){				
		errorMessage = "Config code is only valid for Apple devices. Please remove the entered value and submit";
		log.info(errorMessage);
	}
	if(retailDeviceList && retailDeviceList.includes(String(retailItemType)) && !configCode && (OEM == "APL" || OEMFullName =="Apple")){
		errorMessage="Config code is mandatory for Apple items";
		log.info(errorMessage);
	}
	return errorMessage;		
}
if(node.getObjectType().getID() == "Item" && node.isInWorkflow("SPI_Onboarding") && node.getValue("Apple_LoB").getID())
   return true;
else
   return false;
}