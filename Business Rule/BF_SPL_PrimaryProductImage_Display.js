/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BF_SPL_PrimaryProductImage_Display",
  "type" : "BusinessFunction",
  "setupGroups" : [ "ATT_SPL_Web_UI_Actions" ],
  "name" : "Primary Product Image Display",
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
    "contract" : "NodeBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : ""
  } ]
}
*/
exports.operation0 = function (node) {
var link1 =node.getValue("PDP_Image_1").getSimpleValue();
var link2 =node.getValue("PDP_Image_2").getSimpleValue(); 
var link3 =node.getValue("PDP_Image_3").getSimpleValue(); 

if(link1){
var html1 = '<img src='+link1+' width =50% height =auto>'
}else{
	html1 =""
}

var html = html1;
if(html.trim()){
return html
}else{
	return "-----No Image------"
}

}