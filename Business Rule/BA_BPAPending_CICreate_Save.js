/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPAPending_CICreate_Save",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_BA_BPA_Pending" ],
  "name" : "BPA pending CI creation(Save & Proceed)",
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
  }, {
    "contract" : "QueryHomeBindContract",
    "alias" : "query",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,webui,query) {
//author : Aayush(Cognizant)

var BPAno = node.getValue("Oracle_Contract_Num").getSimpleValue();
//log.info("BPAno:"+BPAno);
if (BPAno == null) {
    webui.showAlert("ERROR", "BPA Number is Blank", "Please Provide the BPA Number to proceed");
} else if (BPAno != null) {
	log.info("in");
    var BPAno = node.getValue("Oracle_Contract_Num").getSimpleValue().trim();
    var magBPAno = manager.getAttributeHome().getAttributeByID("Oracle_Contract_Num");
    var statement = node.getID() + " : is initiated into BPA Worklfow " ;
     
    /*
	var c = com.stibo.query.condition.Conditions;
    var querySpecification = query.queryFor(com.stibo.core.domain.Product).where(
        c.valueOf(magBPAno).eq(BPAno)
    );
    //log.info("querySpecification:"+querySpecification);
    var queryResult = querySpecification.execute().asList(10);
    log.info("queryResult:"+queryResult);*/
    var bpaObject = manager.getNodeHome().getObjectByKey("BPANumber.Key", BPAno);
    log.info("bpaObject:" +bpaObject);
    if (bpaObject == null) {
        webui.showAlert("ERROR", "BPA Number is Invalid", "Entered BPA number does not exist in the system,Please Provide valid BPA Number to proceed");
        //log.info("inn here");
		}
		else{
			log.info("here");
		node.setParent(bpaObject);
		node.startWorkflowByID("Create_BPA", "Start Workflow");
		webui.showAlert("ACKNOWLEDGMENT", "Entered BPA Number is Valid", statement);
		returnTasklist();
		}
}
    
	function returnTasklist(){
	var Workflow=manager.getWorkflowHome().getWorkflowByID("BPA_Action_Pending_WF")
    var State =Workflow.getStateByID("Item_Onboarding")
    webui.navigate("BPA_Action_Pending_WF_Onboarding_Tasklist", null,State );
	}
	
}