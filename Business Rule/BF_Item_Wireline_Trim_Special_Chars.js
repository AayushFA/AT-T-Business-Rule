/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BF_Item_Wireline_Trim_Special_Chars",
  "type" : "BusinessFunction",
  "setupGroups" : [ "ATT_Item_Special_Character_Functions" ],
  "name" : "Wireline Trim Special Characters",
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
// Must not contain ()[]{} | $ *%@!
const regexAllowedCharsList = /[^a-z0-9A-Za-zA-Z0-9~#^&_+\-=\\;':"\\,.<>\/?\s]/g;
// for converting multiple spaces into single after removal of all special chars.
const regexMultiSpace = /\s\s+/g;
var attrValue = node.getValue(attr.getID()).getSimpleValue();
if (attrValue) {
	attrValue = attrValue + "";	
	stringWithoutSpecialChars = attrValue.replace(regexAllowedCharsList, '');
	stringWithoutSpecialChars = stringWithoutSpecialChars.replace(regexMultiSpace, ' ');
	stringWithoutSpecialChars = stringWithoutSpecialChars.trim();
	return stringWithoutSpecialChars;
} else {
	return attrValue;
}
}