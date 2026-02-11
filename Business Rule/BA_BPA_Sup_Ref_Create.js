/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_Sup_Ref_Create",
  "type" : "BusinessAction",
  "setupGroups" : [ "BG_BA_DataMigration_BA's" ],
  "name" : "DM BPA Supplier Reference Creation",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
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
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ClassificationProductLinkTypeBindContract",
    "alias" : "ref",
    "parameterClass" : "com.stibo.core.domain.impl.ClassificationProductLinkTypeImpl",
    "value" : "BPA_To_Supplier",
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
exports.operation0 = function (node,step,ref,query) {
/**
 * @author - Piyal [CTS]
 * Supplier Reference Creation
 */
var supplier = null;
var siteCode = null;
var bpaSupClassification = null;
var children = null;
var childSiteCode = null;
var querySpecification = null;
var c = com.stibo.query.condition.Conditions;
var queryResult = null;
var supCode = null;
var obj = null;

try {
	supplier = node.getValue("BPA_Supplier").getSimpleValue();
	siteCode = node.getValue("Supplier_Site").getSimpleValue();
	querySpecification = query.queryFor(com.stibo.core.domain.Classification).where(
		c.valueOf(step.getAttributeHome().getAttributeByID("sup_no")).eq(supplier)
	);
	queryResult = querySpecification.execute().asList(1);

	if (queryResult.size() > 0) {
		for (var i = 0; i < queryResult.size(); i++) {
			obj = queryResult.get(i);
		}
		if (obj) {
			var children = obj.getChildren();
			for (var j = 0; j < children.size(); j++) {
				var childsiteCode = children.get(j).getValue("Supplier_Site_Code").getSimpleValue();
				if (childsiteCode == siteCode) {
					var classification = node.createClassificationProductLink(children.get(j), ref);					
					break;
				}
			}
		}
	} else {		
		return false;
	}
} catch (e) {	
	throw (e);
}
}