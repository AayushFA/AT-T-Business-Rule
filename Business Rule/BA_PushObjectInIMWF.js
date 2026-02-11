/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_PushObjectInIMWF",
  "type" : "BusinessAction",
  "setupGroups" : [ "Integration_BA" ],
  "name" : "Push Object In IMWF",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "BulkUpdateInitiateMultipleItemsInWorkflow",
  "parameters" : [ {
    "id" : "processNote",
    "type" : "java.lang.String",
    "value" : "Item Pushed into WF by adding Recoverable State Info"
  }, {
    "id" : "stateFlowID",
    "type" : "java.lang.String",
    "value" : "Item_Maintenance_Workflow"
  } ],
  "pluginType" : "Operation"
}
*/
