/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CreateChildOrgForCompSKU_Support",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_SupportBusinessActions" ],
  "name" : "CreateChildOrgForCompSKU Support",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Companion_SKU" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
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
    "contract" : "EventQueueBinding",
    "alias" : "oiep",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,query,oiep,Lib) {
//Author : Abiraami
//Support activity -Data fix - To create child orgs for companion sku

var itemParent = node.getParent();
if(itemParent){
	logger.info("Parent found")
	Lib.createCompanionChildOrgs(itemParent, node, manager, query); // Create Child Org Items for Companion SKU
}
var children = node.getChildren().iterator();
    while (children.hasNext()) {
        var child = children.next();
        oiep.republish(child);
    }

}