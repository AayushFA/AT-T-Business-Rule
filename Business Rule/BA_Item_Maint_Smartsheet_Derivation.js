/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Item_Maint_Smartsheet_Derivation",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Smartsheet_Actions" ],
  "name" : "Item Maintenance Smartsheet Derivations",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Companion_SKU", "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Retail_Derivation",
    "libraryAlias" : "retailDerivationLib"
  }, {
    "libraryId" : "BL_Item_UNSPSC_Derivation",
    "libraryAlias" : "unspscLib"
  }, {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonDerivationLib"
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
    "alias" : "stepManager",
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
exports.operation0 = function (node,stepManager,query,retailDerivationLib,unspscLib,commonDerivationLib) {
// STIBO-2940 Prod Support Team(Jan 25 Release)
if (node.getObjectType().getID() == "Item") {
   var lob = node.getValue("Line_Of_Business").getID();
   unspscLib.createUNSPSCReference(node, stepManager, query);
   if (lob == "RTL") {
      var compItemTypeTemp = node.getValue("Companion_Item_Type_Temp").getSimpleValue();
      if (compItemTypeTemp) {
         var compItemTypes = node.getValue("Companion_Item_Type").getSimpleValue() + "";
         compItemTypeTemp = compItemTypeTemp.split("<multisep/>");
         compItemTypeTemp.forEach(function (comp) {
            if (!compItemTypes.includes(comp)) {
               node.getValue("Companion_Item_Type").addValue(comp);
            }
         });
         node.getValue("Companion_Item_Type_Temp").setSimpleValue(null);
      }
      retailDerivationLib.setIMEIitemID(node, stepManager); //CTXSCM-17234
   } else if (lob == "ENT") {   	
      var userItemType = node.getValue("User_Item_Type_ENT").getID();
      if (userItemType == "SATELLITE") {      	
         commonDerivationLib.clearAttributeValue(node, "User_Defined_Item_Num");
         commonDerivationLib.clearAttributeValue(node, "Change_Reason");
         commonDerivationLib.clearAttributeValue(node, "Requested_Standard_Cost");
      }
   }
}
commonDerivationLib.initiateItemIntoWorkflow(node);


}