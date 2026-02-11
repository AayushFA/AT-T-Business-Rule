/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_Clone_IIEP_Import",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "BPA Clone Inbound Integration Business Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item", "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Clone_Library",
    "libraryAlias" : "cloneLib"
  }, {
    "libraryId" : "AT&T_Audit_Library",
    "libraryAlias" : "libAudit"
  }, {
    "libraryId" : "AT&T_Global_Library",
    "libraryAlias" : "globalLib"
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
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "bpaRefType",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "BPACopyTrans_ContractToContract",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "contractItemRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ContractItem_Item",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,oiep,mailHome,bpaRefType,contractItemRef,cloneLib,libAudit,globalLib,BPALib) {
/**
 * @author - Aditya Rudragoudar, Madhuri [CTS]
 * BPA Inbound Integration Business Action for clone workflow
 */

log.info("Inside BPA Clone Inbound Integration Business Action");

var objectType = node.getObjectType().getID();
var bpaCloneWFinstance = node.getWorkflowInstanceByID("BPA_Clone");
var responseStatus = node.getValue("EBS_ResponseStatus_BPA").getSimpleValue();
var clonnedFrom = node.getValue("BPA_Cloned_From").getSimpleValue();
var userAction = node.getValue("BPA_Clone_WF_UserAction").getID();

if (objectType == "BPA" && node.isInState("BPA_Clone", "Publish_to_EBS") && userAction == "Clone") {
  log.info("Clone function for Target BPA:"+node.getID());
  var bpaNo = node.getValue("Oracle_Contract_Num").getSimpleValue();
  var clonnedFrom = node.getValue("BPA_Cloned_From").getSimpleValue();
  var user = bpaCloneWFinstance.getTaskByID("Publish_to_EBS").getAssignee();
  if (responseStatus && responseStatus == "Success" && bpaNo) {
    node.getValue("BPA_Processed_In_EBS").setSimpleValue("Yes");
    setCreatedUserandDate(node, bpaCloneWFinstance, "Publish_to_EBS");
    node.approve();
    //Loop thru children & Set Create Date, Flag,approve
    children = node.getChildren().toArray();
    children.forEach(function (child) {
      child.getValue("BPA_Processed_In_EBS").setSimpleValue("Yes");
      setChildCreatedUserandDate(child);
      child.approve();
      //Loop thru LE Childs & Set Create Date, Flag,approve
      childrenLE = child.getChildren().toArray();
      childrenLE.forEach(function (childLE) {
        childLE.getValue("BPA_Processed_In_EBS").setSimpleValue("Yes");
        setChildCreatedUserandDate(childLE);
        childLE.approve();
      });
    });
    bpaCloneWFinstance.getTaskByID("Publish_to_EBS").triggerByID("stibo.end", "BPA Clone completed");
    if (clonnedFrom) {
      var sourceBPA = step.getProductHome().getProductByID(clonnedFrom);
      if (sourceBPA) {
        var sourceBPANum = sourceBPA.getValue("Oracle_Contract_Num").getSimpleValue();
        var sourceBPAWFinstance = sourceBPA.getWorkflowInstanceByID("BPA_Clone");
        if (isFullClone(sourceBPA, node)) {
          sourceBPA.getValue("BPA_Status").setLOVValueByID("CLOSED");
          setLastUpdatedUserandDate(sourceBPA, sourceBPAWFinstance, "Suspend_Sources_BPA");
          oiep.republish(sourceBPA);
          closeBPAChildren(sourceBPA);
          sendFullCloneCloseRequestEmail(node, bpaNo, sourceBPA, sourceBPANum, user)
        } else { // 
          sourceBPA.getValue("BPA_Status").setLOVValueByID("OPEN");
          var bpaNumber = sourceBPA.getValue("Oracle_Contract_Num").getSimpleValue();
          sourceBPA.setName(bpaNumber);
          var partialCloneCloseRequests = closePartialCloneContractItems(sourceBPA, node);
          if (partialCloneCloseRequests.size() > 0) {
            sendPartialCloneCloseRequestEmail(node, bpaNo, sourceBPA, sourceBPANum, partialCloneCloseRequests, user);
          }
        }
        sourceBPA.approve(); // Call Partial Approve
        sourceBPAWFinstance.getTaskByID("Suspend_Sources_BPA").triggerByID("stibo.end", "BPA Clone completed");
      }
    }
  }

  if (responseStatus && responseStatus == "Fail") {
    bpaCloneWFinstance.getTaskByID("Publish_to_EBS").triggerByID("stibo.error", "Error received from EBS");
  }
}

if (objectType == "Contract_Item" && node.getParent().isInWorkflow("BPA_Clone") &&
  node.getParent().getValue("BPA_Clone_WF_UserAction").getID() == "Clone") {
  if (responseStatus && responseStatus == "Fail") {
    var approvdedNode = getObjFromApprovedWS(node, step);
    var price = node.getValue("Price").getSimpleValue();
    var approvedPrice = approvdedNode.getValue("Price").getSimpleValue();
    node.getValue("Price").setSimpleValue(approvedPrice);
  }
}

if (objectType == "BPA" && node.isInState("BPA_Clone", "Publish_to_EBS") && (userAction == "Copy" || userAction == "Move")) {
    var clonnedFrom = node.getValue("BPA_Cloned_From").getSimpleValue();
    if (clonnedFrom) {
	    var sourceBPA = step.getProductHome().getProductByID(clonnedFrom);
	    if (sourceBPA) {
	    	  var sourceBPAWFinstance = sourceBPA.getWorkflowInstanceByID("BPA_Clone");
            var targetBPAWFinstance = node.getWorkflowInstanceByID("BPA_Clone");
            if(checkAllEBSResponse(node)) {
            	   log.info(node.getValue("EBS_BPA_Error_Reason").getSimpleValue());
            	   log.info("Removing objects from WF through BPA loop");
		        //Remove both Source BPA & Target BPA from WF
		        sourceBPAWFinstance.getTaskByID("Publish_to_EBS").triggerByID("stibo.end", "BPA Copy/Move completed");
		        targetBPAWFinstance.getTaskByID("Publish_to_EBS").triggerByID("stibo.end", "BPA Copy/Move completed");       
		
		        //Clear Off the fields			    
		        cloneLib.clearOffFields(sourceBPA,bpaRefType);
		        cloneLib.clearOffFields(node,bpaRefType);
            }
	    }
     }
}

if (objectType == "Contract_Item" && node.getParent().isInState("BPA_Clone", "Publish_to_EBS") &&
  (node.getParent().getValue("BPA_Clone_WF_UserAction").getID() == "Copy" || node.getParent().getValue("BPA_Clone_WF_UserAction").getID() == "Move")) { //Target CIs in case of Copy/move Actions           
  log.info("Copy/move function for Target CI: " + node.getID());
  var targetBPA = node.getParent();
  var clonnedFrom = targetBPA.getValue("BPA_Cloned_From").getSimpleValue();
  if (clonnedFrom) {
    var sourceBPA = step.getProductHome().getProductByID(clonnedFrom);
    if (sourceBPA) {
      var sourceBPAWFinstance = sourceBPA.getWorkflowInstanceByID("BPA_Clone");
      var targetBPAWFinstance = targetBPA.getWorkflowInstanceByID("BPA_Clone");
      var user = targetBPAWFinstance.getTaskByID("Publish_to_EBS").getAssignee();
      var sourceContractItems = sourceBPA.getChildren();
      var targetContractItems = targetBPA.getChildren();
      var counter = 0;
      var targetCIs = [];

      //Check if all Target CIs received EBS response
      targetContractItems.forEach(function (child) {
        if (child.getValue("Partial_Clone_Flag").getID() == "Y") {
          if (!child.getValue("EBS_ResponseStatus_BPA").getID()) {
            counter++;
          } else {
            targetCIs.push(child);
          }
        }
      });

      if (counter == 0) {
        //Update Source CIs data         
        [partialCloseRequests, partialFailedRequests] = updateSourceCIsData(targetBPA, targetCIs, sourceContractItems, sourceBPA);
        log.info("partialCloseRequests: " + partialCloseRequests);
        log.info("partialFailedRequests: " + partialFailedRequests);

        //Close Source BPA in case of full Move
        if (targetBPA.getValue("BPA_Clone_WF_UserAction").getID() == "Move") {
          if (isFullMove(sourceBPA)) {
            sourceBPA.getValue("BPA_Status").setLOVValueByID("CLOSED");
            setLastUpdatedUserandDate(sourceBPA, sourceBPAWFinstance, "Publish_to_EBS");
            sourceBPA.approve();
            oiep.republish(sourceBPA);
          }
        }
        //Send Email to user with Copy/Move details			
         if (partialCloseRequests.size() > 0 || partialFailedRequests.size() > 0) {
          sendCopyMoveUpdtEmail(targetBPA, sourceBPA,partialCloseRequests, partialFailedRequests, user);
         }

        //move the Failed Target CIs to Cancelled folder & revert Source CIs changes       
        updateFailedCIs(targetBPA, targetCIs, sourceContractItems);
        
        if(checkAllEBSResponse(targetBPA)) {
        	   log.info("Removing objects from WF through CI lines loop");
	        //Remove both Source BPA & Target BPA from WF
	        sourceBPAWFinstance.getTaskByID("Publish_to_EBS").triggerByID("stibo.end", "BPA Copy/Move completed");
	        targetBPAWFinstance.getTaskByID("Publish_to_EBS").triggerByID("stibo.end", "BPA Copy/Move completed");       
	
	        //Clear Off the fields			    
	        cloneLib.clearOffFields(sourceBPA,bpaRefType);
	        cloneLib.clearOffFields(targetBPA,bpaRefType);
        }
      }
    }
  }
}

if (objectType == "LE_Contract_Item_Child" && node.getParent().getParent().isInState("BPA_Clone", "Publish_to_EBS")) {
    var targetBPA = node.getParent().getParent();
    var userAction = targetBPA.getValue("BPA_Clone_WF_UserAction").getID();
    if (userAction == "Copy" || userAction == "Move"){
    var clonnedFrom = targetBPA.getValue("BPA_Cloned_From").getSimpleValue();
    if (clonnedFrom) {
	    var sourceBPA = step.getProductHome().getProductByID(clonnedFrom);
	    if (sourceBPA) {
	    	  var sourceBPAWFinstance = sourceBPA.getWorkflowInstanceByID("BPA_Clone");
            var targetBPAWFinstance = targetBPA.getWorkflowInstanceByID("BPA_Clone");
            if(checkAllEBSResponse(targetBPA)) {           	   
            	   log.info("Removing objects from WF through CILE loop");
		        //Remove both Source BPA & Target BPA from WF
		        sourceBPAWFinstance.getTaskByID("Publish_to_EBS").triggerByID("stibo.end", "BPA Copy/Move completed");
		        targetBPAWFinstance.getTaskByID("Publish_to_EBS").triggerByID("stibo.end", "BPA Copy/Move completed");       
		
		        //Clear Off the fields			    
		        cloneLib.clearOffFields(sourceBPA,bpaRefType);
		        cloneLib.clearOffFields(targetBPA,bpaRefType);
            }
	    }
     }
    }
}

function updateSourceCIsData(targetBPA, targetCIs, sourceContractItems, sourceBPA) {
  log.info("Into Updte Source CI Loop");
  var sourceBPAWFinstance = sourceBPA.getWorkflowInstanceByID("BPA_Clone");  	  
  var currentUser = sourceBPAWFinstance.getSimpleVariable("Assignee");
  var partialCloseRequests = new java.util.ArrayList();
  var partialFailedRequests = new java.util.ArrayList(); 
  var inactivatedCFASList ="";
  sourceContractItems.forEach(function (sourceCI) {
    if (sourceCI.getValue("Partial_Clone_Flag").getID() == "Y") {
      var sourceOIN = sourceCI.getValue("Oracle_Item_Num").getSimpleValue();
      targetCIs.forEach(function (targetCI) {
        var targetOIN = targetCI.getValue("Oracle_Item_Num").getSimpleValue();
        if (sourceOIN == targetOIN ) {
          if (targetCI.getValue("EBS_ResponseStatus_BPA").getID() == "S") {
            if (targetBPA.getValue("BPA_Clone_WF_UserAction").getID() == "Move") {            	
              sourceCI.getValue("ContractItem_Status").setLOVValueByID("CLOSED");
            }
            if (targetBPA.getValue("BPA_Clone_WF_UserAction").getID() == "Copy") {
                inactivatedCFASList = inactivateZoomData(sourceCI);
            }
            sourceCI.getValue("Detail").setLOVValueByID("PBREAK"); // EBS - Madhu's program fails if not set
            setLastUpdatedUserandDate(sourceCI, sourceBPAWFinstance, "Publish_to_EBS");
            sourceCI.approve();
            oiep.republish(sourceCI);
            if(inactivatedCFASList){
              partialCloseRequests.add(sourceCI.getID() + "|" + sourceOIN+"|"+inactivatedCFASList);
            }
            else{
              partialCloseRequests.add(sourceCI.getID() + "|" + sourceOIN);
            }
            targetCI.getValue("BPA_Processed_In_EBS").setSimpleValue("Yes");
		      libAudit.setDateTime(targetCI, "Created_Date");
			  if (currentUser) {
				libAudit.setUser(targetCI, currentUser, "Created_By");
		      }
		      targetCI.approve();
		      //Loop thru LE Childs & Set Create Date, Flag,approve
		      childrenLE = targetCI.getChildren().toArray();
		      childrenLE.forEach(function (childLE) {
		        childLE.getValue("BPA_Processed_In_EBS").setSimpleValue("Yes");
		        libAudit.setDateTime(childLE, "Created_Date");
				if (currentUser) {
					libAudit.setUser(childLE, currentUser, "Created_By");
		        }
		        childLE.approve();
		      });
          }
          if (targetCI.getValue("EBS_ResponseStatus_BPA").getID() == "F") {
            var errorReason = targetCI.getValue("EBS_BPA_Error_Reason").getSimpleValue();            
            partialFailedRequests.add(sourceCI.getID() + "|" + sourceOIN + "|" + errorReason);
          }
        }
      });
    }
  });
  return [partialCloseRequests, partialFailedRequests];
}

function isFullMove(sourceBPA) {
  var openCIs = 0;
  var sourceContractItems = sourceBPA.getChildren();
  sourceContractItems.forEach(function (sourceCI) {
    if (sourceCI.getValue("ContractItem_Status").getID() != "CLOSED")
      openCIs++
  });
  if (openCIs == 0)
    return true;
  else
    return false;
}

function isFullClone(sourceBPA, cloneBPA) {
  var sourceBPAContractItems = sourceBPA.getChildren();
  var isFullClone = true;
  sourceBPAContractItems.forEach(function (contractItemSourceBPA) {
    var foundItem = false;
    var itemNumSource = contractItemSourceBPA.getValue("Oracle_Item_Num").getSimpleValue();
    var itemNumSourceStatus = contractItemSourceBPA.getValue("ContractItem_Status").getID();
    var cloneBPAContractItems = cloneBPA.getChildren();

    cloneBPAContractItems.forEach(function (contractItemCloneBPA) {
      var itemNumClone = contractItemCloneBPA.getValue("Oracle_Item_Num").getSimpleValue();
      var itemNumCloneStatus = contractItemCloneBPA.getValue("ContractItem_Status").getID();
      if (itemNumSource == itemNumClone && itemNumSourceStatus == "OPEN" && itemNumCloneStatus == "OPEN") {
        foundItem = true; // Item present in cloned BPA
      }
    });

    if (!foundItem && itemNumSourceStatus == "OPEN") { // Item is not present in cloned BPA		
      isFullClone = false; // Partial Clone
    }
  });
  return isFullClone; // Default full clone
}

function closePartialCloneContractItems(sourceBPA, cloneBPA) {
  oiep.republish(sourceBPA); // Required in EBS integration
  var sourceBPAContractItems = sourceBPA.getChildren();
  var partialCloneCloseRequests = new java.util.ArrayList();
  sourceBPAContractItems.forEach(function (contractItemSourceBPA) {
    var itemNumSource = contractItemSourceBPA.getValue("Oracle_Item_Num").getSimpleValue();
    var itemNumSourceStatus = contractItemSourceBPA.getValue("ContractItem_Status").getID();
    var cloneBPAContractItems = cloneBPA.getChildren();
    cloneBPAContractItems.forEach(function (contractItemCloneBPA) {
      var itemNumClone = contractItemCloneBPA.getValue("Oracle_Item_Num").getSimpleValue();
      var itemNumCloneStatus = contractItemCloneBPA.getValue("ContractItem_Status").getID();
      if (itemNumSource == itemNumClone && itemNumSourceStatus == "OPEN" && itemNumCloneStatus == "OPEN") {
        contractItemSourceBPA.getValue("Detail").setLOVValueByID("PBREAK"); // EBS - Madhu's program fails if not set
        contractItemSourceBPA.getValue("ContractItem_Status").setLOVValueByID("CLOSED");
        contractItemSourceBPA.approve();
        oiep.republish(contractItemSourceBPA);
        partialCloneCloseRequests.add(contractItemSourceBPA.getID() + "|" + itemNumSource);
      }
    });
  });
  return partialCloneCloseRequests;
}

function closeBPAChildren(sourceBPA) {
  // Close the Contract items of source 
  var srcBPAChildren = sourceBPA.getChildren();
  srcBPAChildren.forEach(function (contractItem) {
    contractItem.getValue("ContractItem_Status").setLOVValueByID("CLOSED");
    //Set Update Tie & User   
    contractItem.approve();
  });
}

function getObjFromApprovedWS(node, step) {
  var approvedNode = null;
  step.executeInWorkspace("Approved", function (approvedstep) {
    approvedNode = approvedstep.getObjectFromOtherManager(node);
  });
  return approvedNode;
}

function sendPartialCloneCloseRequestEmail(node, bpaNo, sourceBPA, sourceBPANum, partialCloneCloseRequests, user) {
  var userID = getEmailId(user);
  if (userID) {
    var mail = mailHome.mail();
    var instanceName = libAudit.getHostEnvironment();
    var sender = instanceName + "-noreply@cloudmail.stibo.com";
    var subject = "Partial Clone – Successful Process";
    var message = "Dear user, \nSTEP has successfully received the new BPA number for the partial clone and sent a close request to EBS for the specific contract lines on the Source BPA.\n";
    message = message + "\n Partial Clone Details: \n";
    message = message + "\n Cloned BPA STEP ID: " + node.getID();
    message = message + "\n Cloned BPA Number: " + bpaNo;
    message = message + "\n Source BPA STEP ID: " + sourceBPA.getID();
    message = message + "\n Source BPA Number: " + sourceBPANum;
    message = message + "\n\n Close request sent for following contract items from source BPA:";
    partialCloneCloseRequests.forEach(function (closeCI) {
      message = message + "\n" + sourceBPA.getID() + "|" + closeCI;
    });
    mail.from(sender);
    mail.addTo(userID);
    mail.subject(subject);
    mail.plainMessage(message);
    mail.send();
  }
}

function sendFullCloneCloseRequestEmail(node, bpaNo, sourceBPA, sourceBPANum, user) {
  var userID = getEmailId(user);
  if (userID) {
    var mail = mailHome.mail();
    var instanceName = libAudit.getHostEnvironment();
    var sender = instanceName + "-noreply@cloudmail.stibo.com";
    var subject = "Full Clone –  Successful Process";
    var message = "Dear user, \nSTEP has successfully received the new BPA number for the full clone and sent a close request to EBS for Source BPA.\n";
    message = message + "\n Full Clone Details: \n";
    message = message + "\n Cloned BPA STEP ID: " + node.getID();
    message = message + "\n Cloned BPA Number: " + bpaNo;
    message = message + "\n Source BPA STEP ID: " + sourceBPA.getID();
    message = message + "\n Source BPA Number: " + sourceBPANum;
    message = message + "\n\n Close request sent for source BPA:\n" + sourceBPA.getID();
    mail.from(sender);
    mail.addTo(userID);
    mail.subject(subject);
    mail.plainMessage(message);
    mail.send();
  }
}

function sendCopyMoveUpdtEmail(targetBPA, sourceBPA,partialCloseRequests, partialFailedRequests, user) {
  log.info("Into sendCopyMoveUpdtEmail loop");

  var targetBPANum = targetBPA.getValue("Oracle_Contract_Num").getValue();
  var sourceBPANum = sourceBPA.getValue("Oracle_Contract_Num").getValue();
  var userID = getEmailId(user);

  if (userID) {
    var mail = mailHome.mail();
    var instanceName = libAudit.getHostEnvironment();
    var sender = instanceName + "-noreply@cloudmail.stibo.com";
    
    if(partialFailedRequests.size() ==0)
     var subject = "BPA Contract Item Copy/Move Complete";
    else
     var subject = "BPA Contract Item Move/Copy Complete with Failures";
     
	var message = "Dear user, \n\nThe BPA Contract Item Copy/Move request is complete.  These records are no longer in workflow.\n\nFrom: Source BPA Number: "+sourceBPANum+"  [STEP ID "+sourceBPA.getID()+"]\n\nTo: Target BPA Number: "+targetBPANum+"  [STEP ID "+targetBPA.getID()+"]\n\n-----------\n\nPROCESSING DETAILS:\n\n";
	
	if(partialFailedRequests.size() > 0){
	   message = message + "All actions were not successfully processed.  Each BPA Contract Item that was NOT PROCESSED must be resolved through maintenance in the BPA Workflow prior to reprocessing the BPA Clone/Copy/Move Workflow.\n\n";
	}
    
    if (targetBPA.getValue("BPA_Clone_WF_UserAction").getID() == "Move" && partialCloseRequests.size() > 0) {
      message = message + "Close request sent for following contract items from source BPA:";
      partialCloseRequests.forEach(function (closeCI) {	    
        message = message + "\n"+sourceBPA.getID() + "|" + closeCI;
      });
      if (sourceBPA.getValue("BPA_Status").getID() == "CLOSED")
        message = message + "\n\nClose request sent for source BPA:\n" + sourceBPA.getID() + "|" + sourceBPANum;
    }
    if (targetBPA.getValue("BPA_Clone_WF_UserAction").getID() == "Copy" && partialCloseRequests.size() > 0) {
      message = message + "Regions INACTIVE request sent for following contract items from source BPA:";
      partialCloseRequests.forEach(function (closeCI) {
        message = message + "\n" + sourceBPA.getID() + "|" + closeCI ;
      });
    }
    if (targetBPA.getValue("BPA_Clone_WF_UserAction").getID() == "Move" && partialFailedRequests.size() > 0) {
      message = message + "\n\nMove request for following contract items is NOT PROCESSED with below reasons:";
      partialFailedRequests.forEach(function (updateCI) {
        message = message + "\n" + sourceBPA.getID() + "|" + updateCI;
      });
    }
    if (targetBPA.getValue("BPA_Clone_WF_UserAction").getID() == "Copy" && partialFailedRequests.size() > 0) {
      message = message + "\n\nCopy Regions request for following contract items is NOT PROCESSED with below reasons:";
      partialFailedRequests.forEach(function (updateCI) {
        message = message + "\n" + sourceBPA.getID() + "|" + updateCI;
      });
    }
    mail.from(sender);
    mail.addTo(userID);
    mail.subject(subject);
    mail.plainMessage(message);
    mail.send();
  }
}

function getEmailId(user) {
  var userID = "";
  if (user.getID().contains('@ATT.COM')) {
    userID = user.getID();
  } else if (user.getEMail()) {
    userID = user.getEMail();
  }
  return userID;
}

function setCreatedUserandDate(node, WFinstance, state) {
  libAudit.setDateTime(node, "Created_Date");
  if (WFinstance) {
    var currentUser = WFinstance.getSimpleVariable("Assignee");
    if (currentUser) {
      libAudit.setUser(node, currentUser, "Created_By");
    }
  }
}

function setChildCreatedUserandDate(node) {
  libAudit.setDateTime(node, "Created_Date");
  var CreatedByCI = node.getParent().getValue("Created_By").getSimpleValue();
  if (CreatedByCI) {
    libAudit.setUser(node, CreatedByCI, "Created_By");
  }
}

function setLastUpdatedUserandDate(node, WFinstance, state) {
  libAudit.setDateTime(node, "Last_Updated_DateTime");
  if (WFinstance) {
    var currentUser = WFinstance.getSimpleVariable("Assignee");
    if (currentUser) {
      libAudit.setUser(node, currentUser, "Last_Updated_By");
    }
  }
}

function updateFailedCIs(targetBPA, targetContractItems, sourceContractItems) {
  log.info("updateFailedCIs");  
  var userAction = targetBPA.getValue("BPA_Clone_WF_UserAction").getID();
  log.info("userAction:"+userAction)
  targetContractItems.forEach(function (targetCI) {
    if (targetCI.getValue("EBS_ResponseStatus_BPA").getID() == "F") {     
        var targetOIN = targetCI.getValue("Oracle_Item_Num").getSimpleValue();
        sourceContractItems.forEach(function (sourceCI) {
          var sourceOIN = sourceCI.getValue("Oracle_Item_Num").getSimpleValue();
          if (sourceOIN == targetOIN && sourceCI.getValue("Partial_Clone_Flag").getID() == "Y" && userAction == "Copy")
            updateConsignOrgData(sourceCI, targetCI);
         });
           var refs = targetCI.getReferences(contractItemRef).toArray();
	      if (refs.length > 0) {
	      	refs.forEach(function (item) {
	            item.delete();
	          });
	      }
           targetCI.getValue("Oracle_Item_Num").setSimpleValue("");
	      targetCI.getValue("Oracle_Contract_Num").setSimpleValue("");	  
	      targetCI.getValue("Consign_Org_Code").setSimpleValue("");    
		 step.getKeyHome().updateUniqueKeyValues2({
			"ContractItem_key": String("")
		 }, targetCI);
	      var cancelFolder = step.getProductHome().getProductByID("CancelledProducts");
	      targetCI.setParent(cancelFolder);
	      targetCI.approve();
    }
  });
}

function inactivateZoomData(sourceCI){
	log.info("Into inactivateZoomData Func for:"+sourceCI.getID());	
	var inactivatedCFASList ="";	
	var entityObj = step.getEntityHome().getEntityByID("BPA_Region_DC_Hierarchy");
	var CFASList = entityObj.getValue("Inactive_CFAS_Codes").getSimpleValue();
	var CFASList = JSON.parse(CFASList);	
	var regionToMove = sourceCI.getValue("CI_Region_Distribution_Center_temp").getValues();
	for (var i = 0; i < regionToMove.size(); i++) {
	  var regionName = regionToMove.get(i).getID();	  	  
	  for (var j = 0; j < CFASList.length; j++) {	  	
	    for (key in CFASList[j]) {	    	
	      if (regionName == key) {	      	
	        var cfasList = CFASList[j][key];
	        cfasList.forEach(function (code) {	        	
	          var refCiDcs = sourceCI.getDataContainerByTypeID("Region").getDataContainers().toArray();          
	          refCiDcs.forEach(function (refDc) {
	            var refCurDcObj = refDc.getDataContainerObject();
	            var refCFASCode = refCurDcObj.getValue("CFAS_CO_Code").getID();
	            var refState = refCurDcObj.getValue("STATE").getID();
	            var refStatus = refCurDcObj.getValue("Regional_Status").getID();	           
	            if (code.includes(";")) {
	              var codeSplit = code.split(";");	             
	              if (refCFASCode == codeSplit[0] && refState == codeSplit[1] && refStatus == "ACTIVE"){
	                refCurDcObj.getValue("Regional_Status").setLOVValueByID("INACTIVE");	              
	              if(!inactivatedCFASList.includes(regionToMove.get(i).getValue()))
	                 inactivatedCFASList += regionToMove.get(i).getValue()+","	                
	              }
	            } else {	            	
	              if (refCFASCode == code && refStatus == "ACTIVE"){
	                refCurDcObj.getValue("Regional_Status").setLOVValueByID("INACTIVE");	               
	                if(!inactivatedCFASList.includes(regionToMove.get(i).getValue()))
	                   inactivatedCFASList += regionToMove.get(i).getValue()+","	                 
	              }
	            }
	          });
	        });
	      }
	    }
	  }
	}
	log.info("inactivatedCFASList: "+inactivatedCFASList)
	return inactivatedCFASList;
}

function updateConsignOrgData(sourceCI, targetCI){
	var targetConsignOrgsList = new java.util.ArrayList();
	var sourceConsignOrgsList = new java.util.ArrayList();
	var targetConsignOrgs = targetCI.getValue("Consign_Org_Code").getValues();
	var sourceConsignOrgs = sourceCI.getValue("Consign_Org_Code").getValues();
	if (sourceConsignOrgs) {		
		 for (var i = 0; i < sourceConsignOrgs.size(); i++) {
		      sourceConsignOrgsList.add(sourceConsignOrgs.get(i).getValue())
		 }
	}
     if (targetConsignOrgs) {		
		 for (var j = 0; j < targetConsignOrgs.size(); j++) {
		      targetConsignOrgsList.add(targetConsignOrgs.get(j).getValue())
		 }
     }
     if(targetConsignOrgsList.size()>0){
		 for (var k = 0; k < targetConsignOrgsList.size(); k++) {
		 	if(!sourceConsignOrgsList.contains(targetConsignOrgsList.get(k)))
		 	  sourceCI.getValue("Consign_Org_Code").append().addValue(targetConsignOrgsList.get(k)).apply();
		 }
		 IDArray_CI = ['Consign_Org_Code']; 
		 BPALib.partialApproveFields(sourceCI, IDArray_CI);	 
      }		
          
}

function checkAllEBSResponse(targetBPA) {	
	var isAllResponse = false;
	var resultList = new java.util.ArrayList();
	var ciChldrn = targetBPA.getChildren().toArray();
	ciChldrn.forEach(function(child) {
		if (child.getValue("Partial_Clone_Flag").getID() == "Y"){
		    if(child.getValue("EBS_ResponseStatus_BPA").getID()){
			  isAllResponse = true;
			  resultList.add(isAllResponse);
			} else {
				isAllResponse = false;
				resultList.add(isAllResponse);
			}
			var cileChldrn = child.getChildren().toArray();
			cileChldrn.forEach(function(cile) {		
				if(cile.getValue("EBS_ResponseStatus_BPA").getID()){
				  isAllResponse = true;
				  resultList.add(isAllResponse);
				} else {
					isAllResponse = false;
					resultList.add(isAllResponse);
				}		
	       });
		}		
	});
	if (!resultList.contains(false)) {	
		var ciChldrn = targetBPA.getChildren().toArray();
	     ciChldrn.forEach(function(child) {
			if (child.getValue("Partial_Clone_Flag").getID() == "Y" && child.getValue("EBS_ResponseStatus_BPA").getID()=="F"){	
				var bpaError = child.getValue("EBS_BPA_Error_Reason").getSimpleValue();
			        if (bpaError) {
			            var responseDate = child.getValue("Response_Received_DateTime").getSimpleValue()         
			            var logs = bpaError.split("<multisep/>");
			            logs.forEach(function(log) {
			                var message = responseDate + "|" + child.getID() + "|"+log;			                
			                targetBPA.getValue("EBS_BPA_Error_Reason").addValue(message);
			            });
			        }
				
			}
	     });
		return true;
	}
	else {
	  return false;
	  }
}
}