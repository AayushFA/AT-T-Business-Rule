/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BF_Item_Network_Trim_Special_Chars",
  "type" : "BusinessFunction",
  "setupGroups" : [ "ATT_Item_Special_Character_Functions" ],
  "name" : "Network Trim Special Characters",
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
// Allow only  ',"-.
//const regexRemoveSpecCharsList = /[^a-z0-9A-Z"',.\-\/\s]/g;
const regexRemoveSpecCharsList = /[^a-z0-9A-Za-zA-Z0-9~#^&_+\-=\\;':"\\,.<>\/?\s]/g;
// for converting multiple spaces into single after removal of all special chars.
const regexMultiSpace = /\s\s+/g;
var attrValue = node.getValue(attr.getID()).getSimpleValue();
if (attrValue) {		
	if (attrValue.includes("<lt/>")) {
		attrValue = attrValue.replace("<lt/>", "");
	}
	if (attrValue.includes("<gt/>")) {
		attrValue = attrValue.replace("<gt/>", "");
	}
	attrValue = attrValue + "";	
	stringWithoutSpecialChars = attrValue.replace(regexRemoveSpecCharsList, '');
	stringWithoutSpecialChars = stringWithoutSpecialChars.replace(regexMultiSpace, ' ');
	stringWithoutSpecialChars = stringWithoutSpecialChars.trim();
	return stringWithoutSpecialChars;
} else {
	return attrValue;
}
}