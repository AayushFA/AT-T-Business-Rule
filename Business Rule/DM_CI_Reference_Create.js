/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "DM_CI_Reference_Create",
  "type" : "BusinessAction",
  "setupGroups" : [ "BG_BA_DataMigration_BA's" ],
  "name" : "DM CI Reference Create",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
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
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "itemRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ContractItem_Item",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "bomRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "LEContractItem_BOM_Parent",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "leRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "LEContractItem_BOM_Child",
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
exports.operation0 = function (node,step,itemRef,bomRef,leRef,query) {
/**
 * @author - Piyal [CTS]
 * CI Reference Create
 */

var attItemNo = null;
var c = null;
var querySpecification = null;
var queryResult = null;
var bpaSupClassification = null;
var children = null;
var childSiteCode = null;

try {
	attItemNo = node.getValue("Oracle_Contract_Num").getSimpleValue();
	c = com.stibo.query.condition.Conditions;
	querySpecification = query.queryFor(com.stibo.core.domain.Product).where(
		c.valueOf("BPANumber.Key").eq(attItemNo); queryResult = querySpecification.execute().asList(10);
		if (queryResult.size() == 0) {

		}
		compSKUIdentity = manager.getAttributeHome().getAttributeByID("Comp_SKU_Identity") var c = com.stibo.query.condition.Conditions;
		var querySpecification = query.queryFor(com.stibo.core.domain.Product).where(
			c.valueOf(compSKUIdentity).eq(node.getID() + "." + compType)
		);
		var queryResult = querySpecification.execute().asList(10)
		if (queryResult.size() == 0)
			return true
		else
			return false
	}

} catch (e) {
	e.printStackTrace();
	log.info(e);
	throw (e);
}

}