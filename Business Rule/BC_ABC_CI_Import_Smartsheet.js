/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_ABC_CI_Import_Smartsheet",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ABC_BusinessCondition" ],
  "name" : "ABC CI Import Smartsheet",
  "description" : "Used for the validation of the CI - at the time of import",
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_ABC_Validation",
    "libraryAlias" : "abcValidationLib"
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
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "issue",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "MandatoryContextBind",
    "alias" : "mand",
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
exports.operation0 = function (node,manager,issue,mand,query,abcValidationLib) {
//author : aw240u@att.com(cognizant)
var parent = node.getParent();
var partNumb = node.getValue("SI_Part_Number").getSimpleValue();
if (!parent.isInWorkflow("ABC_Workflow")) {
	if(partNumb){
  		issue.addError(node.getID()+"("+ partNumb.trim()+")"+ ": Parent of the corresponding Contract number not in Catalog Management Workflow. /n");
  	}else{
  issue.addError(node.getID() + ": Parent of the corresponding Contract number not in Catalog Management Workflow. /n");
  	}
  	return issue;
} else if (parent.isInWorkflow("ABC_Workflow") && parent.isInState("ABC_Workflow", "ABC_Publish_State")) {
  if(partNumb){
  		issue.addError(node.getID()+"("+ partNumb.trim()+")"+ ": Parent of the corresponding Contract number is in Catalog Management Workflow's Awaiting Response State.hence cannot proceed. /n");
  }else{
  	issue.addError(node.getID() + ": Parent of the corresponding Contract number is in Catalog Management Workflow's Awaiting Response State.hence cannot proceed. /n");
  }
  return issue;
} else {
  var childErrors = abcValidationLib.ciConditionalValidations(node, manager,query);
  if (childErrors.trim()) {
  	if(partNumb){
  		issue.addError(node.getID()+"("+ partNumb.trim()+")"+ ": " + childErrors);
  	}else{
    issue.addError(node.getID() + ": " + childErrors);
  	}
    return issue;
  } else {
    return true;
  }
}
}