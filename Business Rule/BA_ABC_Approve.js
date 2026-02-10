/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ABC_Approve",
  "type" : "BusinessAction",
  "setupGroups" : [ "ABC_BusinessAction" ],
  "name" : "ABC Approve Button",
  "description" : "Usage: linked to the approve button on 2 abc portal screens: ALM_Enrichment_State_Task_List, ABC_Multi_Revision_Screen_CI",
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
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
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "GatewayBinding",
    "alias" : "giep",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.gateway.FrontGatewayIntegrationEndpointImpl",
    "value" : "GSC_SupplierItems_Push_GEIP",
    "description" : null
  }, {
    "contract" : "MailHomeBindContract",
    "alias" : "mailHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "BusinessFunctionBindContract",
    "alias" : "Trim_Special_Junk_Chars",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.function.javascript.reference.BusinessFunctionReferenceImpl",
    "value" : "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<BusinessFunctionReference>\n  <BusinessFunction>BF_ABC_Remove_Special_Char</BusinessFunction>\n</BusinessFunctionReference>\n",
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "QueryHomeBindContract",
    "alias" : "query",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ListOfValuesBindContract",
    "alias" : "conManLov",
    "parameterClass" : "com.stibo.core.domain.impl.ListOfValuesImpl",
    "value" : "SI_Contract_Manager_LOV",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,webui,giep,mailHome,Trim_Special_Junk_Chars,logger,query,conManLov,libAudit,abcValidationLib,abcCoLib) {
/**
 * @author - Madhuri[CTS],Kanika[CTS],aw240u,mb916k
 *desc: abc approve
 */

if (node) {
  execute(node);
} else if (!node) {
  selection = webui.getSelection(); // Fetch the Items list from webui selection
  selection.forEach(function (item) {
    execute(item);
  });
}

function execute(node) {
  logger.severe("Node in Approve Function:  " + node.getID());
  var objectType = node.getObjectType().getID();
  if (objectType == 'BPA') {
    log.severe("Approve catlog validation start");
    errors = abcValidations(node, step);
    log.severe("Approve catlog validation end");
    if (errors) {
      webui.showAlert("ERROR", errors);
    } else {
      var workFlowInstance = node.getWorkflowInstanceByID("ABC_Workflow");
      var bpaChild = node.getChildren().toArray();
      var bpaAgreementNo = node.getValue("Agreement_Number").getValue();
      
      log.severe("Approve catlog isAllRejcted check start");
      var isAllRejectedFlag = isAllRejcted(node);
      if (!bpaAgreementNo && isAllRejectedFlag) { //All the CI Lines are Rejected while creating BPA
	    	var combo = abcCoLib.publishGSCData(step, node, giep, mailHome, "Rejected");
        if (combo[0]) {
          webui.showAlert("ERROR", "GSC Push Operation is failed, please contact Support Team");
        } else {
						
        	if(combo[1]>0){
          	abcCoLib.sendRejectMail("SOX_63009231", node, logger, mailHome, step, conManLov, libAudit, combo[1]);
        	}
          if (workFlowInstance)
            workFlowInstance.delete("Cancelled the node from WF");
          abcCoLib.cancelNode(node, step);
          webui.showAlert("INFO", "Contract is Cancelled since all the Contract Lines are Rejected");
          webui.navigate("ABC_Home_Page", node);
        }
      }
      log.severe("Approve catlog isAllRejcted check end");

      log.severe("Approve catlog not all rejected check start");
      if (!bpaAgreementNo && !isAllRejectedFlag) { //Approve New Contract with Accepted CI Lines Data              
        var [bpaChildCount, ciChildCount] = abcCoLib.getAcceptedLinesCount(node, step);
        if (bpaChildCount == 0) {
          webui.showAlert("ERROR", "Atleast one Contract Line should be Purchasable.");
        } else {
		  var combo = abcCoLib.publishGSCData(step, node, giep, mailHome, "Rejected");
          if (combo[0]) {
            webui.showAlert("ERROR", "GSC Push Operation is failed, please contact Support Team");
          } else {
						  
            if(combo[1]>0){
            	// To Do - Added by mb916k for attaching CI Report
            	// abcCoLib.sendRejectMail(node, logger, mailHome, step, conManLov, libAudit, combo[1]);
            	abcCoLib.sendRejectMail("SOX_63009231", node, logger, mailHome, step, conManLov, libAudit, combo[1]);
            	// End By mb916k
            }
            bpaChild.forEach(function (ci) {
              if (ci.getValue("SI_Supplier_Catalog_Status").getID() == "Rejected")
                abcCoLib.cancelNode(ci, step);
            });
            publishBPA(node);
            var Workflow = step.getWorkflowHome().getWorkflowByID("ABC_Workflow")
            var State = Workflow.getStateByID("ALM_Enrichment_State");
            if(!State)
               State = Workflow.getStateByID("ABC_Publish_State");
            webui.navigate("ALM_Enrichment_State_Task_List", null, State);              
           // webui.navigate("ALM_Enrichment_State_Task_List", node);
            webui.showAlert("INFO", "Approved Successfully");
          }
        }
        log.severe("Approve catlog not all rejected check end");
      }
      //Update Contract Scenarios	         
      if (bpaAgreementNo) {
      	logger.info("Update Contract Scenarios");
      	logger.info("isAllRejcted: "+isAllRejcted(node) + abcCoLib.unApprovedABCAttributes(node,step))
        if (!isAllRejcted(node) || (isAllRejcted(node) && abcCoLib.unApprovedABCAttributes(node,step))) { //Partial CI Lines are Rejected while Updating BPA         
          logger.info("Eligible for Publish")
          //abcCoLib.rollBackChanges(node, step);
		  var combo = abcCoLib.publishGSCData(step, node, giep, mailHome, "Rejected");
          if (combo[0]) {
            webui.showAlert("ERROR", "GSC Push Operation is failed, please contact Support Team");
          } else {
						  
            if(combo[1]>0){
            	// To Do - Added by mb916k for attaching CI Report
            	// abcCoLib.sendRejectMail(node, logger, mailHome, step, conManLov, libAudit,combo[1]);
            	abcCoLib.sendRejectMail("SOX_63009231", node, logger, mailHome, step, conManLov, libAudit, combo[1]);
            	// End By mb916k 
            	
            }
            abcCoLib.rollBackChanges(node, step);
            var [bpaChildCount, ciChildCount] = abcCoLib.getAcceptedLinesCount(node, step);
            if (bpaChildCount > 0 || abcCoLib.unApprovedABCAttributes(node, step)) {
              publishBPA(node);
              var Workflow = step.getWorkflowHome().getWorkflowByID("ABC_Workflow")
              var State = Workflow.getStateByID("ALM_Enrichment_State");
              if(!State)
                 State = Workflow.getStateByID("ABC_Publish_State");
              webui.navigate("ALM_Enrichment_State_Task_List", null, State);             
              webui.showAlert("INFO", "Approved Successfully");
            } else {
              if (workFlowInstance)
                workFlowInstance.delete("Dismissed the node from WF");                        
             // if (abcCoLib.publishGSCData(step, node, giep, mailHome, "Accepted")[0]) {
               // webui.showAlert("ERROR", "GSC Push Operation is failed, please contact Support Team");
              //} else {
                //If GSC Push successful then clear off Flag values
                abcCoLib.clearOffValues(node);
                node.approve();
                bpaChild.forEach(function (ci) {
                  abcCoLib.clearOffValues(ci);
                  ci.approve();
                  var pbs = ci.getChildren();
                  pbs.forEach(function (pb) {
                    abcCoLib.clearOffValues(pb);
                    pb.approve();
                  });
                });
                webui.showAlert("INFO", "Contract is Dismissed since the updated Contract Lines data is rejected or non purchasable.");
                webui.navigate("ABC_Home_Page", node);
             // }
            }
          }
        }
        if (isAllRejcted(node) && !abcCoLib.unApprovedABCAttributes(node,step)) {
		  var combo = abcCoLib.publishGSCData(step, node, giep, mailHome, "Rejected");
          if (combo[0]) {
            webui.showAlert("ERROR", "GSC Push Operation is failed, please contact Support Team");
          } else {
						  
            if(combo[1]>0){
            	// To Do - Added by mb916k for attaching CI Report
            	// abcCoLib.sendRejectMail(node, logger, mailHome, step, conManLov, libAudit, combo[1]);
            	abcCoLib.sendRejectMail("SOX_63009231", node, logger, mailHome, step, conManLov, libAudit, combo[1]);
            	// End By mb916k            	
            }            
            abcCoLib.rollBackChanges(node, step);
            abcCoLib.clearOffValues(node);
            node.approve();
                bpaChild.forEach(function (ci) {
                  abcCoLib.clearOffValues(ci);
                  ci.approve();
                  var pbs = ci.getChildren();
                  pbs.forEach(function (pb) {
                    abcCoLib.clearOffValues(pb);
                    pb.approve();
                  });
                });
            if (workFlowInstance) 
              workFlowInstance.delete("Dismissed the node from WF");
            webui.showAlert("INFO", "Contract is Dismissed since all the Contract Lines are Rejected");
            webui.navigate("ABC_Home_Page", node);
          }
        }
      }
    }
  }
}

function abcValidations(node, step) {
  var bpaErrors = "";
  var ciErrors = "";
  var pbErrors = "";
  var ciCounter = 0;

  var bpaChild = node.getChildren().toArray();
  node.getValue("ABC_Validation_Errors").setSimpleValue(null);
  node.getValue("SI_BPA_Cloud_Response_Status").setSimpleValue(null);
  node.getValue("SI_BPA_Cloud_Error_Reason").setSimpleValue(null);
  node.getValue("SI_Children_Count").setSimpleValue(null);
  //Run the BPA Validations
  bpaErrors += abcValidationLib.bpaValidations(node, step) + abcValidationLib.supplierActiveCheck(node, step) + abcValidationLib.endDateValidate(node);
  if (abcValidationLib.bpaValidations(node, step) || abcValidationLib.supplierActiveCheck(node, step))
    bpaErrors += "Please Contact Technical Support Team \n";
  if (bpaChild.length > 0) {
    bpaChild.forEach(function (ci) {
      ci.getValue("ABC_Validation_Errors").setSimpleValue(null);
      ci.getValue("SI_BPA_Cloud_Response_Status").setSimpleValue(null);
      ci.getValue("SI_BPA_Cloud_Error_Reason").setSimpleValue(null);
      ci.getValue("SI_Children_Count").setSimpleValue(null);
      if (ci.getValue("SI_Supplier_Catalog_Status").getID() != "Rejected") {
        var reasons = ci.getValue("SI_Supplier_Catalog_Reject_Reason").getValues();
        reasons.forEach(function (reason) {
          reason.deleteCurrent();
        });
        // ci.getValue("SI_Supplier_Catalog_Reject_Reason").setSimpleValue(null);	
      }
      //Run the Contract Lines Validations      
      var childErrors = abcValidationLib.ciConditionalValidations(ci, step, query);
      /*if (childErrors.trim()) {
        ci.getValue("SI_Supplier_Catalog_Reject_Reason").append().addValue(childErrors).apply();
      }*/
      var ciChild = ci.getChildren().toArray();
      if (ciChild.length > 0) {
        ciChild.forEach(function (pb) { //Run the Price Break Validations
          pb.getValue("SI_BPA_Cloud_Response_Status").setSimpleValue(null);
          pb.getValue("SI_BPA_Cloud_Error_Reason").setSimpleValue(null);
          var pbChildErrors = abcValidationLib.priceBreakValidations(pb, step);
          if (pbChildErrors.trim()) {
            pbChildErrors = pb.getID() + " Validations: \n" + pbChildErrors;
            ci.getValue("ABC_Validation_Errors").append().addValue(pbChildErrors).apply();
           // ci.getValue("SI_Supplier_Catalog_Reject_Reason").append().addValue(pbChildErrors).apply();
            pbErrors += pbChildErrors;
          }
        });
      }
      
      if (childErrors.trim()) {
        ci.getValue("ABC_Validation_Errors").append().addValue(childErrors + pbErrors).apply();
		var partNumb = ci.getValue("SI_Part_Number").getSimpleValue();
		if(partNumb){
        childErrors = ci.getID() +"("+partNumb.trim()+")"+" Validations: \n" + childErrors + "\n";
		}else{
			childErrors = ci.getID() + " Validations: \n" + childErrors + "\n";
		}
        ciErrors += childErrors;
      }

    });
  }

  if (bpaErrors.trim()) {
    node.getValue("ABC_Validation_Errors").append().addValue(bpaErrors).apply();
    bpaErrors = node.getID() + " Validations: \n" + bpaErrors + "\n";
  }

  logger.info("abcvalidations func result:: " + bpaErrors + ciErrors + pbErrors);
  if (bpaErrors || ciErrors || pbErrors)
    return bpaErrors + "\n" + ciErrors + "\n" + pbErrors;
  else
    RmvSpcChar(node, step, "SI_BPA_Description"); //remove special charachter from attr: header desc and attr: att item desc
  var child = node.getChildren().toArray();
  if (child.length > 0) {
    child.forEach(function (ci) {
      RmvSpcChar(ci, step, "SI_ATT_Item_Description");
    });
  }
  return false;
}

//remove special character
function RmvSpcChar(node, step, attrid) {
  var stringWithoutSpecialChars;
  //const regex = /[^a-z0-9A-Z\s]/g;
  const regex1 = /[-—*|^\[\]_'\t\n\r]/g;
  const regex2 = /\\[tnr]/g;
  // for converting multiple spaces into single after removal of all special chars.
  const regex3 = /\s\s+/g;
  var attr = step.getAttributeHome().getAttributeByID(attrid);
  var attrValue = node.getValue(attr.getID()).getSimpleValue();
  if (attrValue != null) {
    attrValue = attrValue + "";
    stringWithoutSpecialChars = attrValue.replace(regex1,'');
    stringWithoutSpecialChars = stringWithoutSpecialChars.replace(regex2,'');
    stringWithoutSpecialChars = stringWithoutSpecialChars.replace(regex3, ' ');
    stringWithoutSpecialChars = stringWithoutSpecialChars.trim();
    node.getValue(attrid).setValue(stringWithoutSpecialChars);
  }
}

function publishBPA(node) {
  var workFlowInstance = node.getWorkflowInstanceByID("ABC_Workflow");
  var enrichStateID = "ALM_Enrichment_State";
  var failedStateID = "ABC_Failed_State";
  if (workFlowInstance) {
    var enrichTask = workFlowInstance.getTaskByID(enrichStateID);
    var failedTask = workFlowInstance.getTaskByID(failedStateID);
  }
  if (enrichTask) {
    enrichTask.triggerByID("Approve", "Routing to Publish State");
  }
  if (failedTask) {
    failedTask.triggerByID("Approve", "Routing to Publish State");
  }
}

function isAllRejcted(node) {
  var bpaChild = node.getChildren().toArray();
  var rejectedCount = 0;
  if (bpaChild.length > 0) {
    bpaChild.forEach(function (ci) {
      if (ci.getValue("SI_Supplier_Catalog_Status").getID() == "Rejected")
        rejectedCount++;
    });
    if (bpaChild.length == rejectedCount)
      return true;
    else
      return false;
  }
}
}