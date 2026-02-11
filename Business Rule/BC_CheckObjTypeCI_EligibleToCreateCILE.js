/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_CheckObjTypeCI_EligibleToCreateCILE",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "Check if object type Contract item And Eligible to Create CILE",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item", "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "lib"
  } ]
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
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,lib) {
var objectType= node.getObjectType().getID();
var parent = "";
if (node.isInWorkflow("Create_BPA")) {
	parent = node.getParent();
} else {
	var tempPar = node.getValue("Temp_Parent_Item").getSimpleValue();
	if (tempPar != null) {
		parent = manager.getProductHome().getProductByID(tempPar);
	}
}

var bpaType = parent.getParent().getID();
log.info(parent.getID() + bpaType)
if(objectType=='Contract_Item' && bpaType != "BPA_DTV")
{
	var ciToItem = manager.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
     var item = node.getReferences(ciToItem).toArray();
	//log.info("item:"+item[0].getTarget().getID());
	if(item.length>0){
		var itemTarget =item[0].getTarget();
		log.info("itemTarget: "+itemTarget.getID())
		var bomType=itemTarget.getValue("NTW_BOM_Type").getSimpleValue();
		var itemStatus = itemTarget.getValue("Item_Status").getSimpleValue();
		var CIStatus = node.getValue("ContractItem_Status").getID();
		var BPAStatus = node.getParent().getValue("BPA_Status").getID();
		Expiration_Date = node.getParent().getValue("Expiration_Date").getSimpleValue();	
		if (Expiration_Date) 
			var isBPAExpired=lib.checkDateIfLessthanToday(Expiration_Date);
			log.info(isBPAExpired)
		//log.info("bomType:"+bomType);
		if(bomType=="LOCAL EXPLOSION" && !isBPAExpired && BPAStatus!= "CLOSED" && CIStatus != "CLOSED" && (itemStatus == "Active S" || itemStatus == "Active NS")){		
			return true		
		}
		else{
			
			return false
		}
     }
}
else{		
		return false
	}
}