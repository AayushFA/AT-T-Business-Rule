/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "GetOICToken",
  "type" : "BusinessFunction",
  "setupGroups" : [ "TokenBasedAuthentication" ],
  "name" : "Get Oracle Cloud Token",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "TokenLibrary",
    "libraryAlias" : "TokenLibrary"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessFunctionWithBinds",
  "binds" : [ {
    "contract" : "GatewayBinding",
    "alias" : "giep",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.gateway.FrontGatewayIntegrationEndpointImpl",
    "value" : "OIC_GetToken_GEIP",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation",
  "functionReturnType" : "java.util.Map<java.lang.String, java.lang.String>",
  "functionParameterBinds" : [ ]
}
*/
exports.operation0 = function (giep,TokenLibrary) {
/**
 * @author Aditya Rudragoudar
 * Function to get the access token from AT&T OIC
 * @returns access token
 */
var map = new java.util.HashMap(); // Body

var post = giep.post(); //Override Header
post.header("Content-Type", "application/x-www-form-urlencoded");
post.header("InstanceName", "scm-oic-01-idfykvb66dwb-px");

//Additional body contents
map.put("scope", "https://25E86D50291D48ACBD930E63D059F3B4.integration.us-phoenix-1.ocp.oraclecloud.com:443urn:opc:resource:consumer::all");
map.put("grant_type", "client_credentials");

var token = TokenLibrary.getToken(logger, post, map);
return token;

}