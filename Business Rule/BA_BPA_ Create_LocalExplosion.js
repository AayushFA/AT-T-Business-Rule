/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_ Create_LocalExplosion",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "Create Local Explosion from CI detail page",
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,webui) {
//author: aw240u(Aayush Kumar Mahato) - Cognizant

var ciToItem = manager.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
var item = node.getReferences(ciToItem).toArray();
if(item.length>0){
var itemTarget = item[0].getTarget();
 var bomType = itemTarget.getValue("NTW_BOM_Type").getSimpleValue();
if (bomType == "LOCAL EXPLOSION") {	
	if(!node.getValue("Price_2").getSimpleValue()){
	    var OnboardFolder = manager.getProductHome().getProductByID("BPA_Onboarding");
	    var Workflow = manager.getWorkflowHome().getWorkflowByID("Create_BPA")
	    
	    var id = node.getID();
	    var BPANo = node.getValue("Oracle_Contract_Num").getSimpleValue();
	    var ItemNum = node.getValue("Oracle_Item_Num").getSimpleValue();
	    var parentName = node.getParent().getName();
		if(node.isInWorkflow("Create_BPA")){
			
	    var currObj = OnboardFolder.createProduct(null, "LE_Contract_Item_Child");
	    naviOrShowError(node,currObj);
	    }else {
		var currObj = OnboardFolder.createProduct(null, "LE_Contract_Item_Child");
		naviOrShowError(node,currObj);
	    }
	}
	else{//STIBO-2735, Do not allow new LE on a CI with Future Price
	  webui.showAlert("ERROR", "New LE Child cannot be created if Contract Line Future Price is entered");
	}
}
else{
webui.showAlert("ERROR", "The selected Item Reference is not Eligible for LE Creation", "Please select proper item reference for LE Creation");
}
}else{
	 webui.showAlert("ERROR", "Item Reference not Selected: ", "Please Provide Item Reference to Proceed");

}




function naviOrShowError(node,currObj){
	var error = "" ;
	if(!node.getValue("BPA_Processed_In_EBS").getID())
	  var CIPrice = node.getValue("Price").getSimpleValue();
	else
	  var CIPrice = node.getValue("Current_Price").getSimpleValue();
	if (!CIPrice || CIPrice == null || CIPrice == 0) {
        error = "Please provide Contract Item Price."
    }
	if (error == "") {
        currObj.getValue("CILE_Temp_Price").setValue(CIPrice);
        currObj.getValue("Temp_Parent_Item").setValue(id);
        currObj.getValue("Oracle_Contract_Num").setSimpleValue(BPANo);
        currObj.getValue("Oracle_Item_Num").setSimpleValue(ItemNum);
        if (parentName) {
            currObj.setName(parentName + "_" + currObj.getID());
        }
        webui.navigate("BPA_CILE_Creation_Screen", currObj);
    } else {
        //var State = Workflow.getStateByID("Enrich_BPA_CI_LE");
        //webui.navigate("BPA_WF_Node_Detail_Screen", node, State);
        webui.showAlert("ERROR", "Missing Attribute Data", error);
    }
}
}