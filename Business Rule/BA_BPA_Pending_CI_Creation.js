/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_Pending_CI_Creation",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_BA_BPA_Pending" ],
  "name" : "BPA Pending CI Creation(Add to BPA)",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
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
exports.operation0 = function (node,manager,webui,ugWrlnEng,ugWrlnSrc) {
//author : Aayush(Cognizant) && Abiraami
//STIBO-1432
var curUser = manager.getCurrentUser();
var wrlnEngUser = ugWrlnEng.isMember(curUser)&& !ugWrlnSrc.isMember(curUser);//STIBO-2529
var error = false;


var OnboardFolder = manager.getProductHome().getProductByID("BPA_Onboarding");

var selection = webui.getSelection();
selection.forEach(function(item) {
	//STIBO-1432
	if (wrlnEngUser && item.getValue("NTW_BOM_Type").getID() != "LOCAL EXPLOSION"){
		webui.showAlert("ERROR", item.getName(),"The item you are attempting to add is not defined as a Local Explosion. Please review item set and/or work with the sourcing manger in order to add to BPA (Blanket Purchase Agreement).");
		error = true;
	}
	//STIBO-1432
	else{
		var newObject = OnboardFolder.createProduct(null, "Contract_Item");
    		newObject.createReference(item, "ContractItem_Item");
    		newObject.setName(item.getValue("Item_Num").getSimpleValue());
    		webui.navigate("BPA_CI_Create_Screen", newObject);
	}
})
if(error == false){
	
}
}