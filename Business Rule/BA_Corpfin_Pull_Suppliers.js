/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Corpfin_Pull_Suppliers",
  "type" : "BusinessAction",
  "setupGroups" : [ "Supplier_BA" ],
  "name" : "Corpfin Pull Suppliers",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_Global_Library",
    "libraryAlias" : "globalLib"
  }, {
    "libraryId" : "AT&T_Audit_Library",
    "libraryAlias" : "auditLib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "ManagerBindContract",
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "GatewayBinding",
    "alias" : "giep",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.gateway.FrontGatewayIntegrationEndpointImpl",
    "value" : "Corpfin_Supplier_Pull_GEIP",
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "log",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookuptable",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "MailHomeBindContract",
    "alias" : "mailHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "EntityBindContract",
    "alias" : "entityObject",
    "parameterClass" : "com.stibo.core.domain.impl.entity.FrontEntityImpl$$Generated$$10",
    "value" : "Corpfin_Attributes_Configurations",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (step,giep,log,lookuptable,mailHome,entityObject,globalLib,auditLib) {
log.severe("Start Of BA_Corpfin_Pull_Suppliers");

var days = Number(entityObject.getValue("CorpfinPull_Days_Counter").getValue());
var pageSize = Number(entityObject.getValue("CorpfinPull_Page_Size").getValue());
var pageNumber = 1;
var itemsCounter = true;
var emailBody1 = entityObject.getValue("Corpfin_Failure_Email_Body_1").getValue();
var emailBody2 = entityObject.getValue("Corpfin_Failure_Email_Body_2").getValue();
var emailBody3 = entityObject.getValue("Corpfin_Failure_Email_Body_3").getValue();
var subject = "Suppliers Bulk-Update Scheduled Process Failure Notification";
var usersList = entityObject.getValue("Production_Support_Email_List").getSimpleValue().split(",");
var instanceName =  globalLib.getCorpfinInstanceName(entityObject);
var errorMessage = "";        
try{
	var payload = globalLib.buildSupplierPayload(days);
} catch(payloadError){
	if(payloadError){
		errorMessage = "while building Corpfin payload in STIBO\n\nError Details:\n" +payloadError.message;
	}
}

var post = giep.post();
post.header("InstanceName", instanceName);

while (itemsCounter) {
	try{
	  var response = post.path("/suppliers/fetch").pathQuery({
	    page_number: String(pageNumber),
	    page_size: String(pageSize)
	  }).body(JSON.stringify(payload)).invoke();  
	} catch (responseError){
	   if(responseError){	
		 errorMessage = "during Corpfin API call from STIBO\n\nError Details:\n" + responseError.message;		
	   }
	} 
	  if (response) {
	    var responseData = JSON.parse(response);
	    Object.keys(responseData).forEach(function(key) {
	      if (key == "items") {
	        log.severe("items length:" + responseData[key].length)
	        if (responseData[key].length > 0) {
	          pageNumber++;
	          itemsCounter = true;
	          responseData[key].forEach(function(supplier) {
	          try{
	            processSupplier(supplier, log, lookuptable, step);
	          } catch(processError){
	          	if(processError){		          	
					errorMessage = "while Corpfin Supplier data transformation into STIBO\n\nError Details:\n"+processError.message;
	          	}
	          }
	          });
	        }
	        else {
	          itemsCounter = false;
	        }
	      }
	    });
	  }
	  else {
	    itemsCounter = false
	    break;
	  }
}
log.severe("subject: "+subject)

if(errorMessage){	
	var emailBody = emailBody1+errorMessage+"\n\nImpact:\n"+emailBody2+"\n\nNext Steps:\n"+emailBody3;
	log.severe("emailBody: "+emailBody)
	var instanceName = auditLib.getHostEnvironment();
	var mail = mailHome.mail();
	var sender = instanceName + "-noreply@cloudmail.stibo.com";
	for (user = 0; user < usersList.length; user++) {										
		globalLib.sendEmailNotif(step, mail, usersList[user], sender, subject, emailBody);
	}			
}
log.severe("End Of BA_Corpfin_Pull_Suppliers");

function processSupplier(supplier, log, lookuptable, step) {
  var supNo = "";
  var supplierAttsArray = globalLib.getStiboAttsForSupplierMap(lookuptable, "supplierAtts");
  Object.keys(supplier).forEach(function(key) {
    if (key == "SUPPLIER_NUMBER") {
      supNo = supplier[key];
    }
  });
  var supplierObj = step.getNodeHome().getObjectByKey("Supplier_Key", supNo);
  if (supplierObj) {
    globalLib.updateSupplierAttrs(supplierAttsArray, log, lookuptable, supplier, supplierObj, step);
    auditLib.setDateTime(supplierObj, "Last_Updated_DateTime");
  }
  else {
    supplierObj = globalLib.createSupplier(supNo, step, auditLib);
    globalLib.updateSupplierAttrs(supplierAttsArray, log, lookuptable, supplier, supplierObj, step);
  }
  supplierObj.approve();
}
}