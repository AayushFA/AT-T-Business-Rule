/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ABC_EscalationMail",
  "type" : "BusinessAction",
  "setupGroups" : [ "ABC_BusinessAction" ],
  "name" : "ABC Escalation Mail after 5 days",
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
    "contract" : "MailHomeBindContract",
    "alias" : "mailHome",
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
exports.operation0 = function (node,step,mailHome,conManLov,libAudit,abcCoLib) {
/**
 author: aw240u
 desc: send email post 5 days if obj lie without usage
 */
var emailGrpObj = step.getEntityHome().getEntityByID("ABC_Attributes_Configurations");
var emailGrpID = emailGrpObj.getValue("ABC_WTSC_Data_Governance_Grp").getSimpleValue();
var workflowInst = step.getWorkflowHome().getWorkflowByID("ABC_Workflow");
var stateName = stateNodeName(node);
sendEscalationEmail(node, step, mailHome, log);

function sendEscalationEmail(node, step, mailHome, log) {
  var mailUser = abcCoLib.abcEmailReciever(node, step, conManLov);
  if (emailGrpID) {
    mailUser.push(emailGrpID);
  }
  log.info("mailUser:"+mailUser);
  var prodSupp = productionSuppEmailAddress(node, step);
  log.info("prod: " +prodSupp);
  var assignee = node.getWorkflowInstanceByID("ABC_Workflow").getSimpleVariable("Assignee");
  assignee = step.getUserHome().getUserByID(assignee);
  var subject = node.getID() + " :Supplier Catalog abandoned in Stibo STEP workflow," + stateNodeName(node) + " for 5 or more days"
  var stepID = node.getID();
  var body = escalationMailBody(node, step);
  try {
    if (subject && body) {
      var instanceName = libAudit.getHostEnvironment();
      var mail = mailHome.mail();
      var sender = instanceName + "-noreply@cloudmail.stibo.com";
      var wflwHme = node.getWorkflowInstanceByID("ABC_Workflow");
      var state = wflwHme.getTasks().toArray();
      state = state[0].getState().getID();
       var date= new Date();
       date.setTime(date.getTime() + 432000000);
      if (state == "ALM_Enrichment_State" || state == "ABC_Failed_State") {
        for (z = 0; z < mailUser.length; z++) {
          abcCoLib.sendEmailNotif5dayEscalate(mail, mailUser[z], sender, subject, body, instanceName, log);
       log.info("inn1");     
       if(state == "ALM_Enrichment_State")
	         node.getTaskByID("ABC_Workflow","ALM_Enrichment_State").setDeadline(date);
	   if(state == "ABC_Failed_State")
	         node.getTaskByID("ABC_Workflow","ABC_Failed_State").setDeadline(date);
        }
      } else {
        for (y = 0; y < prodSupp.length; y++) {
         abcCoLib.sendEmailNotif5dayEscalate(mail, prodSupp[y], sender, subject, body, instanceName, log);         
         node.getTaskByID("ABC_Workflow","ABC_Publish_State").setDeadline(date);
        log.info("inn2");
        }
      }
    }
  } catch (e) {
    if (e) throw (e)
  }
}

function stateNodeName(node) {
  var wflwHme = node.getWorkflowInstanceByID("ABC_Workflow");
  var state = wflwHme.getTasks().toArray();
  state = state[0].getState().getTitle();
  return state
}

function escalationMailBody(node, step) {
  var body = "";
  body = body + "Dear User," + "<br><br>" + "The catalog below has been sitting in the Catalog Management workflow," + stateNodeName(node) + " for 5 days or more." + "<br>" + "The task will remain in workflow until action is taken.  Please login to Stibo STEP to complete processing." + "<br><br>" + abcCoLib.createCommonEmailBody(node, step);
  return body
}

function productionSuppEmailAddress(node, step) {
  var emailGrpObj = step.getEntityHome().getEntityByID("ABC_Attributes_Configurations");
  var emailPrdSupp = emailGrpObj.getValue("ABC_Production_Support_EmailAddress").getSimpleValue();
  var emailList = []
  emailPrdSupp = emailPrdSupp.split("<multisep/>");
  emailPrdSupp.forEach(function(value) {
    emailList.push(value.trim());
  });
  return emailList
}
}