/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_BPA_Validate_Smartsheet",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "Validate BPA Smartsheet",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item", "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "BPALib"
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "bpa",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "BPA",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "ci",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "Contract_Item",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "cile",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "LE_Contract_Item_Child",
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "issue",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "cileItemRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "LocalExplosion_Item_Reference",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,bpa,ci,cile,issue,cileItemRef,BPALib) {
//CILE  
var error = false;
var leName = null;
var le_PID = null;
var le_type = null;
var errMsg = ""
//CI
//BPA
if (cile) {
	var ciObj = node.getParent();
     var wfBPAcreate = step.getWorkflowHome().getWorkflowByID("Create_BPA");
     var lob = node.getParent().getValue("Legacy_Source").getID();
     var ciToItem = step.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
     var item = node.getReferences(ciToItem).toArray();
	//log.info("item:"+item[0].getTarget().getID());
	var itemTarget =item[0].getTarget();
	var bomType=itemTarget.getValue("NTW_BOM_Type").getSimpleValue();
	var itemStatus = itemTarget.getValue("Item_Status").getSimpleValue();
	var CIStatus = ciObj.getValue("ContractItem_Status").getID();
	var BPAStatus = ciObj.getParent().getValue("BPA_Status").getID();
	var Expiration_Date = ciObj.getParent().getValue("Expiration_Date").getSimpleValue();	

	var wf = ciObj.getWorkflowInstanceByID("Create_BPA");
      if(wf)
        var BPAWFPublishQueueState = wf.getTaskByID("Publish_to_EBSQueue")
      if (BPAWFPublishQueueState) {
        errMsg = errMsg + "\nCILE cannot be processed as the Contract Item is in Publish Q";
      }
	if (Expiration_Date) 
		var isBPAExpired=BPALib.checkDateIfLessthanToday(Expiration_Date);
	if(bomType!="LOCAL EXPLOSION")
	      errMsg = "LE Child is not processed as referenced Item BOM type is not LOCAL EXPLOSION";
	 
	if(isBPAExpired) 
	      errMsg = "LE Child is not processed as BPA Contract is expired";
	 
	if(BPAStatus== "CLOSED")
	      errMsg = "LE Child is not processed as BPA Contract is Closed";
	 
	
	    if(CIStatus == "CLOSED")
	         errMsg = "LE Child is not processed as Contract Item is Closed";
	 
	 
	    if(itemStatus != "Active S" && itemStatus != "Active NS")
	         errMsg = "LE Child is not processed as referenced Item status is Not Active";
	 
	 if(node.getValue("LE_TYPE").getID() == null){
	 	key = node.getValue("Local_Explosion_Key").getSimpleValue();
	 	if(key.includes("_"))
			{				
				var type = key.substring(key.lastIndexOf("_")+1);
				log.info("type:" + type)
				if(type == "KITTING EXPENSE" || type =="RTU" || type =="LABOR"){
				     node.getValue("LE_TYPE").setLOVValueByID("NON-EXPENSE")
				     node.getValue("LE_Name").setLOVValueByID(type)
				     }
				else if(type == "WARRANTY" || type =="OTHER EXPENSE" ){
				      node.getValue("LE_TYPE").setLOVValueByID("EXPENSE")
				      node.getValue("LE_Name").setLOVValueByID(type)
				}
				else{
					node.getValue("LE_TYPE").setLOVValueByID("MATERIAL");
					var obj = step.getNodeHome().getObjectByKey("Item.Key",type);
					if(obj){
					   node.createReference(obj, cileItemRef);
					   node.getValue("Item_No_Referenced_to_CILE").setSimpleValue(type);
					}
				}
			}	     
		 }	 	
	
      errMsg = BPALib.CILEValidations(node, lob, step);      
     
  if (errMsg == "") {  
    if (!ciObj.isInWorkflow("Create_BPA")) {
      wfBPAcreate.start(ciObj, null);
    } 
  }

  if (errMsg != "") {
    issue.addWarning(errMsg);
    return issue;
  } else
    return true;
}
}