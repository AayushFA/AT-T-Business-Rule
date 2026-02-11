/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BF_ABC_Remove_Special_Char",
  "type" : "BusinessFunction",
  "setupGroups" : [ "ATT_Global_Business_Functions" ],
  "name" : "ABC Remove Special Char",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessFunctionWithBinds",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation",
  "functionReturnType" : "java.lang.String",
  "functionParameterBinds" : [ {
    "contract" : "ProductBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : ""
  }, {
    "contract" : "AttributeBindContract",
    "alias" : "attr",
    "parameterClass" : "null",
    "value" : null,
    "description" : ""
  } ]
}
*/
exports.operation0 = function (node,attr) {
var stringWithoutSpecialChars;
const regex = /[^a-z0-9A-Z~!@#$%^&*()_+=-~{}|\][":;'{}<>?,.\-\/\s]/g;
// for converting multiple spaces into single after removal of all special chars.
const regex3 = /\s\s+/g;

var attrValue = node.getValue(attr.getID()).getSimpleValue();
if (attrValue != null) {
	attrValue = attrValue + "";
	stringWithoutSpecialChars = attrValue.replace(regex, '');
	stringWithoutSpecialChars = stringWithoutSpecialChars.replace(regex3, ' ');
	stringWithoutSpecialChars = stringWithoutSpecialChars.trim();

	return stringWithoutSpecialChars;
} else
	return attrValue
}