/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ABC_IIEP_Import",
  "type" : "BusinessAction",
  "setupGroups" : [ "ABC_BusinessAction" ],
  "name" : "ABC Inbound Integration Business Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item", "BPA", "Price_Break" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_Audit_Library",
    "libraryAlias" : "libAudit"
  }, {
    "libraryId" : "BL_ABC_Validation",
    "libraryAlias" : "abcValidationLib"
  }, {
    "libraryId" : "BL_ABC_Common",
    "libraryAlias" : "abcCoLib"
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ListOfValuesBindContract",
    "alias" : "conManLov",
    "parameterClass" : "com.stibo.core.domain.impl.ListOfValuesImpl",
    "value" : "SI_Contract_Manager_LOV",
    "description" : null
  }, {
    "contract" : "MailHomeBindContract",
    "alias" : "mailHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "log",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,conManLov,mailHome,log,libAudit,abcValidationLib,abcCoLib) {
/**
 * @author - Madhuri[CTS], mb916k
 * ABC Inbound Integration Business Action
 */

log.severe("Inside ABC Inbound Integration Business Action: " + node.getID());

var response_status = node.getValue("SI_BPA_Cloud_Response_Status").getID();
var objectType = node.getObjectType().getID();
var resultList = new java.util.ArrayList();
var resultErrorList = new java.util.ArrayList();
var instanceName = libAudit.getHostEnvironment();

libAudit.setDateTime(node, "Response_Received_DateTime");

if (objectType == "BPA") {
    var bpaWFinstance = node.getWorkflowInstanceByID("ABC_Workflow");
    [resultList,ciCounter,resultErrorList] = checkAllOracleResponse(node);
    log.severe("checkAllOracleResponse: "+ ciCounter);
    log.severe(!resultList.contains(false)  && ciCounter == node.getValue("SI_Children_Count").getValue());
    if (!resultList.contains(false) && ciCounter == node.getValue("SI_Children_Count").getValue()) {     	               
        if (!resultErrorList.contains(true)) {
            log.severe("BPA Loop - BPA out of WF");            
            processBPA(node);
            processChildren(node);            
        } else {        	 
            log.severe("BPA Loop - BPA Error State");
            if(bpaWFinstance){
            	 var task = bpaWFinstance.getTaskByID("ABC_Publish_State");
            	 if(task)
                   task.triggerByID("Feedback", "Failed at Oracle");
            }                     
        }
         abcCoLib.sendPOStatusEmail("SOX_63009231",node,step,conManLov,mailHome,log);	  //Send Email Notif
         removeFromWF(node); // Move the BPA to Finish State only in case of Success           
    }
}

if (objectType == "Contract_Item" || objectType == "Price_Break") {   
    var parent = "";
    if (objectType == "Contract_Item")
        parent = node.getParent();
    if (objectType == "Price_Break")
        parent = node.getParent().getParent();
    if (parent) {
        var parentWFinstance = parent.getWorkflowInstanceByID("ABC_Workflow");
        [resultList,ciCounter,resultErrorList] = checkAllOracleResponse(parent);
        log.severe(!resultList.contains(false)  && ciCounter == parent.getValue("SI_Children_Count").getValue());
        if (!resultList.contains(false) && ciCounter == parent.getValue("SI_Children_Count").getValue()) {          				          
            if (!resultErrorList.contains(true)) {
                log.severe("Child Loop - BPA out of WF");                 
                processChildren(parent);
                processBPA(parent);
            } else {          	              	     
                log.severe("Child Loop - BPA Error State");
                if(parentWFinstance){
	            	 var task = parentWFinstance.getTaskByID("ABC_Publish_State");
	            	 if(task)
	                   task.triggerByID("Feedback", "Failed at Oracle");
	            }	                        
            }
            abcCoLib.sendPOStatusEmail("SOX_63009231",parent,step,conManLov,mailHome,log);   //Send Email Notif 
            removeFromWF(parent); // Move the BPA to Finish State only in case of Success           
        }
    }   
}

function setOracleProcessedFlag(node) {
    var isSet = node.getValue("SI_BPA_Processed_In_Cloud").getID();
    if (isSet != "Y") {
        node.getValue("SI_BPA_Processed_In_Cloud").setLOVValueByID("Y");
    }
}

function setCreatedUserandDate(node) {
    libAudit.setDateTime(node, "Created_Date");
    var userID = node.getValue("Submitted_By").getSimpleValue();
    if (userID)
        libAudit.setUser(node, userID, "Created_By");
}

function setLastUpdatedUserandDate(node, WFinstance, state) {
    libAudit.setDateTime(node, "Last_Updated_DateTime");
    var userID = node.getValue("Submitted_By").getSimpleValue();
    if (userID)
        libAudit.setUser(node, userID, "Last_Updated_By");
}

function checkAllOracleResponse(BPA) {
    var isAllResponse = false;
    var resultList = new java.util.ArrayList();
    var ciCounter = 0;
	var isError = false;
    var resultErrorList = new java.util.ArrayList();    
    var ciChldrn = BPA.getChildren().toArray();
    var BPA_no = BPA.getValue("Agreement_Number").getValue();
	var bpaResponse = BPA.getValue("SI_BPA_Cloud_Response_Status").getID();
    if (bpaResponse) {
        isAllResponse = true;
        resultList.add(isAllResponse);		
		if (bpaResponse=="F") {
			isError = true;
			resultErrorList.add(isError);
		}
    } else {
        isAllResponse = false;
        resultList.add(isAllResponse);
    }
    ciChldrn.forEach(function(child) {      
    	var pbCounter = 0;	  
    	  if(child.getValue("ABC_Publish_Oracle").getID() == "Y"){ 
		    var ciResponse = child.getValue("SI_BPA_Cloud_Response_Status").getID();
		    var ciKey = child.getValue("BPA_Agreement_Key").getValue();
            if (ciResponse) {					              
					ciCounter++;			   
					if (ciResponse=="F") {               	 
						isError = true;
						resultErrorList.add(isError);                  
					}
					if(abcCoLib.isProcessedInOracle(BPA) && ciResponse=="S"){
						setOracleProcessedFlag(child);
						child.getValue("SI_Action_Code").setLOVValueByID("SYNC");						
					}
            } else {
            	//log.info("Child Response NOT received for: "+child.getID())
            }
            var pbChldrn = child.getChildren().toArray();
            pbChldrn.forEach(function(pb) {
            	log.info(pb.getID())
				var pbResponse = pb.getValue("SI_BPA_Cloud_Response_Status").getID()
                if (pbResponse) {
                	pbCounter++;  
					if (pbResponse=="F") {               	 
						isError = true;
						resultErrorList.add(isError);                                        
                        }
                        if(abcCoLib.isProcessedInOracle(BPA) && pbResponse=="S"){
						setOracleProcessedFlag(pb);								
					}
                } else {
                    log.info("PB Response NOT received for: "+pb.getID())
                }                          
            });
			if(pbCounter == child.getValue("SI_Children_Count").getValue() || !child.getValue("SI_Children_Count").getValue()){
			        isAllResponse = true;
                      resultList.add(isAllResponse);
			}
			else{
			        isAllResponse = false;
                      resultList.add(isAllResponse);
			}
			 
        }       
    });
    return [resultList,ciCounter,resultErrorList];
}

function processBPA(node) {	
    if (node.isInState("ABC_Workflow", "ABC_Publish_State")) {    	   
        if (response_status && response_status == "S") {
            if (!abcCoLib.isProcessedInOracle(node)) { //Create
                node.setName(node.getValue("Agreement_Number").getValue());                 
                setCreatedUserandDate(node);                             
            } else { //update	                
                setLastUpdatedUserandDate(node);              
            }
            setOracleProcessedFlag(node);
           // if (bpaWFinstance)
             //   bpaWFinstance.getTaskByID("ABC_Publish_State").triggerByID("Success", "BPA Number received from Oracle");
        }
    }
}

function processChildren(node) {
    var ciChldrn = node.getChildren().toArray();
    ciChldrn.forEach(function(child) {
       if(child.getValue("ABC_Publish_Oracle").getID() == "Y"){
            setDatesandFlags(child);
            var pbChldrn = child.getChildren().toArray();
            pbChldrn.forEach(function(pb) {
                setDatesandFlags(pb);
            });
        }
    });
}

function setDatesandFlags(node) {	
    var response_status = node.getValue("SI_BPA_Cloud_Response_Status").getID();
    if (response_status && response_status == "S") {
        if (node.getObjectType().getID() == "Contract_Item") {
            node.getValue("SI_ATT_Approved_Price").setValue(node.getValue("SI_ATT_Unit_Price").getValue());          
        }
        if (!abcCoLib.isProcessedInOracle(node)) {
            setCreatedUserandDate(node);
        } else {
            setLastUpdatedUserandDate(node);
        }
        setOracleProcessedFlag(node);
    }
}

function removeFromWF(node){
	var abcWFinstance = node.getWorkflowInstanceByID("ABC_Workflow");
	var response_status = node.getValue("SI_BPA_Cloud_Response_Status").getID();
    if (abcWFinstance && response_status && response_status == "S") {
    	  var task = abcWFinstance.getTaskByID("ABC_Publish_State");
    	  if(task)
    	    task.triggerByID("Success", "BPA Number received from Oracle");
    }	
}

}