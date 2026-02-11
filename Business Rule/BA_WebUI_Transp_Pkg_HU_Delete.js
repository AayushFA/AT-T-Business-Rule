/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_WebUI_Transp_Pkg_HU_Delete",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Transportation_Attribute_Action" ],
  "name" : "WebUI Transportation PKG Delete Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Transportation_Handling_Unit", "Transportation_Package" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonDerivationLib"
  } ]
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
    "contract" : "ProductBindContract",
    "alias" : "cancelled",
    "parameterClass" : "com.stibo.core.domain.impl.FrontProductImpl",
    "value" : "CancelledProducts",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,webui,cancelled,commonDerivationLib) {
/*
 * author: aw240u
 */
var selection = webui.getSelection();
var errorReason = "";
var error = "";
var count = 0;
selection.forEach(function(item) {
	var puUOM = item.getValue("TMS_Ordering_UOM").getSimpleValue();
	var parent = item.getParent();
	var child = parent.getChildren().toArray();
	var huNodes= [];
	child.forEach(function(childNode){
         if(childNode.getObjectType().getID()=="Transportation_Handling_Unit"){
         	huNodes.push(childNode);
         }
	});
	huNodes.forEach(function(huNode){
		if(huNode.getValue("TMS_Ordering_UOM").getSimpleValue()==item.getValue("TMS_Ordering_UOM").getSimpleValue()){
			count= count+1;
		}
		
	});
	if (count>0) {
        error += item.getID() + " :This Packaging Unit object can only be deleted once the associated Handling Unit for the specific ordering UOM has been deleted first\n";
    }
});
selection.forEach(function(item) {
    if (!item.getValue("Item_Cancel_Reason").getSimpleValue()) {
        errorReason += item.getID() + " :Please provide Delete Reason to proceed.\n";
    }
});

if (error) {
    webui.showAlert("ERROR", error);
}else if(errorReason){
	webui.showAlert("ERROR", errorReason); 
}
else {
    selection.forEach(function(item) {
        var currentParentID = item.getParent().getID();
        var objectType =item.getObjectType().getID();
        item.setParent(cancelled);
        item.setName(currentParentID);
        commonDerivationLib.deleteKey(item, manager, objectType);
        item.approve();
    });
}

webui.navigate(webui.getScreenId(), null);
}