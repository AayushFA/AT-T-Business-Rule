/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ABC_WF_OnEntryFinalState",
  "type" : "BusinessAction",
  "setupGroups" : [ "ABC_BusinessAction" ],
  "name" : "ABC Workflow On Entry Final State",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_Audit_Library",
    "libraryAlias" : "libAudit"
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
    "alias" : "obj",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "log",
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (obj,log,giep,mailHome,step,conManLov,libAudit,abcCoLib) {
/**
 * @author Lev, Madhuri [CTS], mb916k
 * Description - ABC Final state actions
 * Push status back to GSC
 * If GSC Push is Success, update the Keys, Clean up feedback & status attributes
 * Remove Header from workflow
 */
// Push status back to GSC business fuction call
var bpaWFinstance = obj.getWorkflowInstanceByID("ABC_Workflow");
var currentUser = bpaWFinstance.getSimpleVariable("Assignee");

var ret = abcCoLib.publishGSCData(step, obj,giep,mailHome,"Accepted");

if(!ret[0]){	
	if(ret[1]<1){
		abcCoLib.sendRejectMail("SOX_63009231", obj, log, mailHome, step, conManLov, libAudit, ret[1], true);
	}
	generateAgreementKey(obj); //BPA Agreement Key Generation for Contract Lines & Price Breaks     
     abcCoLib.clearOffValues(obj);  //Clean up GSC & Update Flags and approve objects
     setSubmittedUserandDate(obj, currentUser)
     obj.approve();
     var children = obj.getChildren();
	children.forEach(function (ci){
		abcCoLib.clearOffValues(ci);
		setSubmittedUserandDate(ci, currentUser)
		ci.approve();
		var pbs = ci.getChildren();		
	     pbs.forEach(function (pb){
			abcCoLib.clearOffValues(pb);
			setSubmittedUserandDate(pb, currentUser)
		     pb.approve();
	     });
	});
     removeWF(obj);
}

function generateAgreementKey(node){
	var objectType = node.getObjectType().getID();
log.info("Node in Agreement Key Generation: " + node.getID() + " objectType : " + objectType)
	if (objectType == 'BPA') {	   
	    var agreementNumber = node.getValue("Agreement_Number").getSimpleValue();	
	    var contractItemKey = node.getValue("BPA_Agreement_Key").getSimpleValue();
	    if (agreementNumber && contractItemKey == null && abcCoLib.isProcessedInOracle(node)) {
	        log.info("Create BPA Key")
	        node.getValue("BPA_Agreement_Key").setSimpleValue(agreementNumber);	    
	    }
	    node.getChildren().forEach(function(contractItem) {
	        updateKeysForCIAndPBs(contractItem);
	    });
	}
}

function updateKeysForCIAndPBs(node) {
    var catalogStatus = node.getValue("SI_Supplier_Catalog_Status").getID();
    var contractItemKey = node.getValue("BPA_Agreement_Key").getSimpleValue();
    var itemNumber = node.getValue("ATT_Item_Number").getSimpleValue();
    var partNumber = node.getValue("SI_Part_Number").getSimpleValue();
    var agreementNumber = node.getParent().getValue("Agreement_Number").getSimpleValue();
    if (agreementNumber && contractItemKey == null && catalogStatus == "Accepted"){// && abcCoLib.isProcessedInOracle(node)) {
        if (itemNumber) {
            node.getValue("BPA_Agreement_Key").setSimpleValue(agreementNumber + "_" + itemNumber);
        } else {
            if (partNumber)
                node.getValue("BPA_Agreement_Key").setSimpleValue(agreementNumber + "_" + partNumber);
        }         
	    var children = node.getChildren();
	    if (children.size() > 0) {
	        children.forEach(function(pb) {
	            var parentKey = node.getValue("BPA_Agreement_Key").getSimpleValue();
	            var pbQuantity = pb.getValue("SI_Price_Break_Quantity").getSimpleValue();
	            var pbKey = pb.getValue("BPA_Agreement_Key").getSimpleValue();
	            if (parentKey && pbQuantity && pbKey == null) {
	                pb.getValue("BPA_Agreement_Key").setSimpleValue(parentKey + "_" + pbQuantity);             
	            }
	        });
	    }
    }
}

function removeWF(node){
	var wfInstance = node.getWorkflowInstanceByID("ABC_Workflow");
	if(wfInstance)
	    wfInstance.delete("Removed from ABC Workflow on Successful Process");
}

function setSubmittedUserandDate(node, currentUser) {
	  libAudit.setDateTime(node, "Submitted_DateTime");
	  if (currentUser) {
	    libAudit.setUser(node, currentUser, "Submitted_By");
	  }
	}
}