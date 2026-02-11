/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_IIEP_Import",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "BPA Inbound Integration Business Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item", "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_Audit_Library",
    "libraryAlias" : "libAudit"
  }, {
    "libraryId" : "AT&T_Global_Library",
    "libraryAlias" : "LibGlobal"
  }, {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "BPALib"
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
    "contract" : "EventQueueBinding",
    "alias" : "oiep",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.FrontOutboundIntegrationEndpointImpl",
    "value" : "step://OutBoundIntegrationEndpoint?id=BPA_OIEP_Update_V1",
    "description" : null
  }, {
    "contract" : "MailHomeBindContract",
    "alias" : "mailHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,oiep,mailHome,libAudit,LibGlobal,BPALib) {
/**
 * @author - Piyal, Madhuri, Abiraami and John [CTS]
 * BPA Inbound Integration Business Action
 */

log.info("Inside BPA Inbound Integration Business Action: "+node.getID());

var response_status = null;
var error_reason = null;
var bpaID = null;
var bpaCloneWFinstance = null;
var bpaWFinstance = null;
var clonnedFrom = null;
var bpaNo = null;
var objectType = null;
var stepOBJ = null;
var partialApprAttrList = new java.util.ArrayList(); //STIBO-1914 May 9th Support Release 
var processedInEBS = null;

processedInEBS = node.getValue("BPA_Processed_In_EBS").getID(); //STIBO-3407 Prod Support Team April 12 Release
response_status = node.getValue("EBS_ResponseStatus_BPA").getSimpleValue();
bpaID = node.getID();
stepOBJ = step.getProductHome().getProductByID(bpaID);
objectType = stepOBJ.getObjectType().getID();
//STIBO-1914 May 9th Support Release 
libAudit.setDateTime(node, "Response_Received_DateTime");
partialApprAttrList.add("Response_Received_DateTime");
//STIBO-1914 May 9th Support Release 
var instanceName = libAudit.getHostEnvironment(); //STIBO-1862 May 16th Support Release 

if (objectType == "BPA" &&  !node.isInState("BPA_Clone", "Publish_to_EBS")) {
    bpaNo = node.getValue("Oracle_Contract_Num").getSimpleValue();

    if (node.isInState("Create_BPA", "Publish_to_EBSQueue")) {
        // Case: When BPA is coming from Create_BPA	

        log.info("Inside BPA Inbound Integration Business Action getValueFromApprovedWS  Create_BPA");
        if (response_status && response_status == "Success") {
            bpaWFinstance = node.getWorkflowInstanceByID("Create_BPA");
            // Case: IIEP Create.

            //STIBO-1914 May 2nd Support Release
            //STIBO-3407 Prod Support Team April 12 Release 
            if (!processedInEBS || processedInEBS == "N") {
                setCreatedUserandDate(node, bpaWFinstance, "Publish_to_EBSQueue");
                //STIBO-1914 May 9th Support Release //STIBO-1914 May 9th Support Release 
            } else if(processedInEBS == "Y" || processedInEBS == "E") {
                setLastUpdatedUserandDate(node, bpaWFinstance, "Publish_to_EBSQueue");
            }
            //STIBO-3407 Prod Support Team April 12 Release
            //STIBO-1914 May 2nd Support Release 

            setEBSProcessedFlag(node);
            bpaWFinstance.getTaskByID("Publish_to_EBSQueue").triggerByID("ebs.success", "BPA Number received from EBS");

            //STIBO-1781 - Clone logic moved to BA_BPA_Clone_IIEP_Import
            
            var headerStatus = node.getValue("BPA_Status").getID();
            if (headerStatus == "CLOSED") {
                // Close the Contract items if header is closed and publish to EBS
                closeChildren(node);
            }
        } else if (response_status && response_status == "Fail") {
            bpaWFinstance = node.getWorkflowInstanceByID("Create_BPA");
            bpaWFinstance.getTaskByID("Publish_to_EBSQueue").triggerByID("ebs.error", "Error received from EBS");
            // Case: IIEP Create.
            if (!getValueFromApprovedWS(node, "Oracle_Contract_Num")) {
                log.info("Inside BPA Inbound Integration Business Action getValueFromApprovedWS  create Update create");
            }
        }
    }

    if(response_status == "Fail") {
        initiateBPAWorkflowOnFailure(node, "Initiated BPA workflow on failure response")
    }
}

if (objectType == "Contract_Item" && !node.getParent().isInState("BPA_Clone", "Publish_to_EBS") && !node.getParent().isInState("BPA_Clone", "Enrich_ClonedBPA")) {
	log.info("CI into BA_BPA_IIEP: "+ node.getID())
	log.info("CI response_status: "+ response_status)
	node.getValue("SS_Creation").setSimpleValue(""); //STIBO-1048
    bpaWFinstance = node.getWorkflowInstanceByID("Create_BPA");
    
    //STIBO-1234, May 18th Release
    var curPrice = node.getValue("Current_Price").getSimpleValue();
    var futurePrice = node.getValue("Price_2").getSimpleValue();
    var curEffDate = node.getValue("Current_Effective_Date").getSimpleValue();
    var futureDate = node.getValue("Future_Effective_Date").getSimpleValue();
    var CIPrice = node.getValue("Price").getSimpleValue();
    //STIBO-1234, May 18th Release

    if (response_status && response_status == "Success") {       
        //STIBO-1914 May 2nd  Support Release 
        //STIBO-3407 Prod Support Team April 12 Release
        if (!processedInEBS || processedInEBS == "N") {
            setCreatedUserandDate(node, bpaWFinstance, "Publish_to_EBSQueue");
         } else if(processedInEBS == "Y" || processedInEBS == "E") {
            setLastUpdatedUserandDate(node, bpaWFinstance, "Publish_to_EBSQueue");
        }
        //STIBO-3407 Prod Support Team April 12 Release
        //STIBO-1914 May 2nd Support Release 
        setEBSProcessedFlag(node);

        //STIBO-1234, May 18th Release
        var IDArray_CI = new java.util.ArrayList();
        var IDArray_CILE = new java.util.ArrayList();
        IDArray_CI = ['Current_Price', 'Price_2', 'Current_Effective_Date', 'Future_Effective_Date', 'Price'];
        IDArray_CILE = ['LE_Percentage','LE_Price','LE_Future_Price'];
        if ((parseFloat(curPrice) == parseFloat(futurePrice)) && (curEffDate == futureDate)) { //Nullify the future price details once the future effdate == current date
            node.getValue("Price_2").setSimpleValue("");
            node.getValue("Future_Effective_Date").setSimpleValue("");        	       
	        children = node.getChildren().toArray();
	        children.forEach(function(child) {
	            log.info(child.getID())
	            //STIBO-2735, Set LE_Future_Price to LE_Price, clear off LE_Future_Price & recalc the LE_Percentage
	            child.getValue("LE_Price").setValue(child.getValue("LE_Future_Price").getValue());
	            child.getValue("LE_Future_Price").setValue("");
	            BPALib.setCILEPercentage(child, step);
	            // BPALib.LEPriceCalc(child, curPrice)	          
	            BPALib.partialApproveFields(child, IDArray_CILE);
	        });
        }
         BPALib.partialApproveFields(node, IDArray_CI);
        //STIBO-1234, May 18th Release     	
        if (node.isInState("Create_BPA", "Publish_to_EBSQueue")) {
            bpaWFinstance.getTaskByID("Publish_to_EBSQueue").triggerByID("ebs.success", "BPA Number received from EBS");
        }
    } else if (response_status && response_status == "Fail") {
        var ciID = node.getID();
        var processed = node.getValue("BPA_Processed_In_EBS").getID();
         log.info("Failed CI: "+node.getID())
        //STIBO-1234, May 18th Release
        //if(CIPrice == null || Current_Effective_Date == null){
        var IDArray_CI = new java.util.ArrayList();
        IDArray_CI = ['Current_Price', 'Price', 'Current_Effective_Date'];
        var appNode = step.executeInWorkspace("Approved", function(approvedManager) {
            var approveWSOBJ = approvedManager.getObjectFromOtherManager(node);
            if (approveWSOBJ) {
                var apprPrice = approveWSOBJ.getValue("Price").getSimpleValue();
                node.getValue("Price").setSimpleValue(apprPrice);
                var apprCP = approveWSOBJ.getValue("Current_Price").getSimpleValue();
                node.getValue("Current_Price").setSimpleValue(apprCP);
                var apprDate = approveWSOBJ.getValue("Current_Effective_Date").getSimpleValue();
                node.getValue("Current_Effective_Date").setSimpleValue(apprDate);
                BPALib.partialApproveFields(node, IDArray_CI);
            }
        });
        //}
        //STIBO-1234, May 18th Release

        if (node.isInState("Create_BPA", "Publish_to_EBSQueue")) {
        	log.info("CI is in BPA WF");
            var user = bpaWFinstance.getTaskByID("Publish_to_EBSQueue").getAssignee();
            bpaWFinstance.getTaskByID("Publish_to_EBSQueue").triggerByID("ebs.error", "Error received from EBS");
            //STIBO-1037, Jun 8th,2024 Release       
            var errors = node.getValue("EBS_BPA_Error_Reason").getSimpleValue();
            if (errors) {
            	var errMsg = ciID + " is not processed with below reasons. Please take necessary action: \n" + errors;
            	var subject = instanceName + ": " + ciID + " failed to Process"; //STIBO-1862
            	//Send Email to Initiator
            	var userID = checkUserID(user);
            	if (userID) {
            		sendEmailNotif(userID, subject, errMsg);
            	}				 		
            }
            //STIBO-1037, Jun 8th,2024 Release  
        } else {
            initiateBPAWorkflowOnFailure(node, "Initiated BPA workflow on failure response")
        }
    }
}

if (objectType == 'LE_Contract_Item_Child' &&  !node.getParent().getParent().isInState("BPA_Clone", "Publish_to_EBS") && !node.getParent().getParent().isInState("BPA_Clone", "Enrich_ClonedBPA")) {
    if (response_status && response_status == "Success") {

        //STIBO-1914 May 9th  Support Release
        //STIBO-3407 Prod Support Team April 12 Release 
        if (!processedInEBS || processedInEBS == "N") {
            setLECreatedUserandDate(node);
        } else if(processedInEBS == "Y" || processedInEBS == "E") {
            setLELastUpdatedUserandDate(node);
        }
        //STIBO-3407 Prod Support Team April 12 Release
        //STIBO-1914 May 9th Support Release 

        setEBSProcessedFlag(node);
        BPALib.leKeyGeneration(node, step)
    } else if (response_status && response_status == "Fail") {
        log.info("CILE: " + node.getID() + "is failed in EBS processing");
        //STIBO-1632, Jun 6th Release
        var bpaError = node.getValue("EBS_BPA_Error_Reason").getSimpleValue();
        if (bpaError) {
            var responseDate = node.getValue("Response_Received_DateTime").getSimpleValue()
            var leType = node.getValue("LE_TYPE").getSimpleValue();
            var lePID = node.getValue("Le_Name_PID").getSimpleValue();
            var leName = node.getValue("LE_Name").getSimpleValue();
            if (leName == null)
                leName = "";
            var logs = bpaError.split("<multisep/>");
            logs.forEach(function(log) {
                var message = responseDate + " |" + node.getID() + "| " + leType + " | " + lePID + leName + " | " + log;
                this.log.info(message);
                node.getParent().getValue("EBS_BPA_Error_Reason").addValue(message);
            }, this);
        } //STIBO-1632, Jun 6th Release
    }
}

function setEBSProcessedFlag(node) {
	var isSet = node.getValue("BPA_Processed_In_EBS").getSimpleValue();
	//  STIBO-2156 : If Contract Item is closed then it is eligible to reopen
	if (objectType == "Contract_Item") {
		var ciStatus = node.getValue("ContractItem_Status").getID();
		if(ciStatus && ciStatus == "CLOSED") { 
			node.getValue("BPA_Processed_In_EBS").setLOVValueByID("E");
		} else {
			if (isSet != "Yes") {
				node.getValue("BPA_Processed_In_EBS").setLOVValueByID("Y");
			}
		}
	} else {
		if (isSet != "Yes") {
			node.getValue("BPA_Processed_In_EBS").setLOVValueByID("Y");
		}		
	}  
}

function getValueFromApprovedWS(node, atr) {
    var approveWSOBJ = null;

    appNode = step.executeInWorkspace("Approved", function(approvedManager) {
        approveWSOBJ = approvedManager.getObjectFromOtherManager(node);
        if (approveWSOBJ) {
            approveVal = approveWSOBJ.getValue(atr).getSimpleValue();
            if (approveVal) {

                return approveVal;
            }
            return null;
        }
    });
}

function processChildren(node, status, objectType) {
    if (objectType == "BPA") {
        if (status == "Success") {
            log.info("Inside BPA Inbound Integration Business Action getValueFromApprovedWS  create");
            var ciChldrn = node.getChildren().toArray();
            ciChldrn.forEach(function(child) {

                bpaWFinstance = child.getWorkflowInstanceByID("Create_BPA");

                if (bpaWFinstance) {
                    if (child.isInState("Create_BPA", "Publish_to_EBSQueue")) {
                        bpaWFinstance.getTaskByID("Publish_to_EBSQueue").triggerByID("ebs.success", "BPA Number received from EBS");
                    }
                }

                var cileChldrn = child.getChildren().toArray();
                cileChldrn.forEach(function(cile) {
                    if (cile.isInState("Create_BPA", "Publish_to_EBSQueue")) {
                        bpaWFinstance = cile.getWorkflowInstanceByID("Create_BPA");
                        bpaWFinstance.getTaskByID("Publish_to_EBSQueue").triggerByID("ebs.success", "BPA Number received from EBS");
                    }
                });
            });
        }
        if (status == "Fail") {
            //log.info("Inside BPA Inbound Integration Business Action getValueFromApprovedWS  create");
            var ciChldrn = node.getChildren().toArray();
            ciChldrn.forEach(function(child) {

                bpaWFinstance = child.getWorkflowInstanceByID("Create_BPA");
                if (bpaWFinstance)

                    if (bpaWFinstance.getTaskByID("Publish_to_EBSQueue") != null) {
                        bpaWFinstance.getTaskByID("Publish_to_EBSQueue").triggerByID("ebs.error", "Error received from EBS");
                    }
                var cileChldrn = child.getChildren().toArray();
                cileChldrn.forEach(function(cile) {
                    if (cile.isInState("Create_BPA", "Publish_to_EBSQueue")) {
                        bpaWFinstance = cile.getWorkflowInstanceByID("Create_BPA");
                        bpaWFinstance.getTaskByID("Publish_to_EBSQueue").triggerByID("ebs.error", "Error received from EBS");
                    }
                });
            });
        }
    }
}

function closeChildren(node) {
    // Close the Contract items of source 
    srcBPAChildren = node.getChildren();
    srcChldItr = srcBPAChildren.iterator();
    while (srcChldItr.hasNext()) {
        contractItem = srcChldItr.next();
        contractItem.getValue("ContractItem_Status").setLOVValueByID("CLOSED");
        contractItem.approve();
    }
}


function checkUserID(user) {
    log.info("in checkuserfunc");
    if (user.getID().contains('@ATT.COM'))
        userID = user.getID();

    else if (user.getEMail()) {
        //Add validation to check the Email standards
        userID = user.getEMail();
    }
    return userID;
}

function sendEmailNotif(userID, subject, message) {
    //log.info("in email funct");
    var mail = mailHome.mail();

    //STIBO-1862
    var instanceName = libAudit.getHostEnvironment(); //STIBO-1862
    var sender = instanceName + "-noreply@cloudmail.stibo.com";
    mail.from(sender);
    //STIBO-1862

    //mail.from("noreply@cloudmail.stibo.com");
    mail.addTo(userID);
    mail.subject(subject);
    mail.plainMessage(message);
    mail.send();
}

//STIBO-1914 May 9th Release 
function setCreatedUserandDate(node, WFinstance, state) {
    libAudit.setDateTime(node, "Created_Date");
    partialApprAttrList.add("Created_Date");
    if (WFinstance) {
        var currentUser = WFinstance.getSimpleVariable("currentUser");
        if (currentUser) {
            libAudit.setUser(node, currentUser, "Created_By");
            partialApprAttrList.add("Created_By");
        }
    }
}

function setLECreatedUserandDate(node) {
    libAudit.setDateTime(node, "Created_Date");
    partialApprAttrList.add("Created_Date");
    var CreatedByCI = node.getParent().getValue("Created_By").getSimpleValue();
    if (CreatedByCI) {
        libAudit.setUser(node, CreatedByCI, "Created_By");
        partialApprAttrList.add("Created_By");
    }
}

function setLastUpdatedUserandDate(node, WFinstance, state) {
    libAudit.setDateTime(node, "Last_Updated_DateTime");
    partialApprAttrList.add("Last_Updated_DateTime");
    if (WFinstance) {
        var currentUser = WFinstance.getSimpleVariable("currentUser");
        if (currentUser) {
            libAudit.setUser(node, currentUser, "Last_Updated_By");
            partialApprAttrList.add("Last_Updated_By");
        }
    }
}

function setLELastUpdatedUserandDate(node, WFinstance, state) {
    libAudit.setDateTime(node, "Last_Updated_DateTime");
    partialApprAttrList.add("Last_Updated_DateTime");
    var CreatedByCI = node.getParent().getValue("Last_Updated_By").getSimpleValue();
    if (CreatedByCI) {
        libAudit.setUser(node, CreatedByCI, "Last_Updated_By");
        partialApprAttrList.add("Last_Updated_By");
    }
}

BPALib.partialApproveFields(node, partialApprAttrList);
//STIBO-1914 May 9th Release 


function initiateBPAWorkflowOnFailure(node, message) {
    if(!node.isInWorkflow("Create_BPA") && node.getParent().getID() != "CancelledProducts" && node.getParent().getParent().getID() != "CancelledProducts") {//STIBO-3610 Prod Support Team April 12 Release
        node.startWorkflowByID("Create_BPA", message);
    }
}
}