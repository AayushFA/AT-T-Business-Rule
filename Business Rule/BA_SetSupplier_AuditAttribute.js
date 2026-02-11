/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetSupplier_AuditAttribute",
  "type" : "BusinessAction",
  "setupGroups" : [ "Supplier_BA" ],
  "name" : "Set Supplier Audit Attributes",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA_Supplier", "Supplier_Site" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_Audit_Library",
    "libraryAlias" : "libAudit"
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,libAudit) {
var appStep = step.executeInWorkspace("Approved", function(step) {
        return step;
      });
  var appSupplier = appStep.getClassificationHome().getClassificationByID(node.getID());
  if (appSupplier) {
        libAudit.setDateTime(node, "Last_Updated_DateTime");	
  }
  else
   libAudit.setDateTime(node, "Created_Date");
   node.approve();
}