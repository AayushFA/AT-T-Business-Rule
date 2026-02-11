/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_RTL_ChildOrg_NDC_VDC_DataFix",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Data_Fix_Actions" ],
  "name" : "RTL ChildOrgItems NDC VDC Data Fix",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Companion_SKU" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T Item Library",
    "libraryAlias" : "Lib"
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
    "alias" : "manager",
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
    "contract" : "LookupTableHomeBindContract",
    "alias" : "defaultChildOrgsLookupTableRTL",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,query,defaultChildOrgsLookupTableRTL,Lib) {
//createChildOrgs(node, "NDC|VDC");
createChildOrgs(node, "NDC");
createChildOrgs(node, "VDC");

function createChildOrgs(node, childOrgs) {
    childOrgs = childOrgs.split("\\|");
    for (i = 0; i < childOrgs.length; i++) {
        var OrgID = manager.getListOfValuesHome().getListOfValuesByID("LOV_ORG_Code").getListOfValuesValueByID(childOrgs[i]);
        if (OrgID) {
            var flag = Lib.checkChildOrg(node, manager, query, childOrgs[i]);
            if (flag) {
               childOrgItem = node.createProduct(null, "Child_Org_Item");
                Lib.setChildOrgAttrs(node, childOrgItem, childOrgs[i]);
            }
        }
    }
}
}