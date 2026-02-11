/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "Get_Apple_Token",
  "type" : "BusinessFunction",
  "setupGroups" : [ "TokenBasedAuthentication" ],
  "name" : "Get Apple Token",
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
    "value" : "Apple_Token_GIEP",
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
 * Function to get the access token from Apple
 * @ruturns access token
 */
var map = new java.util.HashMap();
map.put("grant_type", "client_credentials");
var post = giep.post();

var token = TokenLibrary.getToken(logger, post, map);

//logger.info("Token --->"+token); // This line should not be uncommented in Production. 
return token;
}