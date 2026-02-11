/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ZOOM_DC_Delete",
  "type" : "BusinessAction",
  "setupGroups" : [ "BG_BA_DataMigration_BA's" ],
  "name" : "BA_ZOOM_DC_Delete",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {

//Misc.Charges (DC_MiscCharges)//Region
function resetDataContainer() {
    node.getDataContainerByTypeID("Region").deleteLocal();
 //   node.getDataContainerByTypeID("DC_MiscCharges").deleteLocal();
    
}

resetDataContainer() 
}