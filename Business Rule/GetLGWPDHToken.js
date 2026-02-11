/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "GetLGWPDHToken",
  "type" : "BusinessFunction",
  "setupGroups" : [ "TokenBasedAuthentication" ],
  "name" : "Get LGW SOA Token",
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
    "contract" : "SecretBindContract",
    "alias" : "clientSecret",
    "parameterClass" : "com.stibo.passwordparameter.PasswordParameter",
    "value" : "eRAjNzxQJ81jAUVjF4v9QMzi6tO5Moj50vldXzM9PnLMt1RytxjdTRO11XUCUbQRkAQBzM0bgv5p/h+1XPLnRA==",
    "description" : null
  }, {
    "contract" : "SecretBindContract",
    "alias" : "clientId",
    "parameterClass" : "com.stibo.passwordparameter.PasswordParameter",
    "value" : "eRAjNzxQJ81jAUVjF4v9QJB0rP27YS9RlaTE8Y0xG3kG49lAvi+tE1+H87hbZxLmkAQBzM0bgv5p/h+1XPLnRA==",
    "description" : null
  }, {
    "contract" : "GatewayBinding",
    "alias" : "giep",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.gateway.FrontGatewayIntegrationEndpointImpl",
    "value" : "LGWPDHTokenGIEP",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation",
  "functionReturnType" : "java.util.Map<java.lang.String, java.lang.String>",
  "functionParameterBinds" : [ ]
}
*/
exports.operation0 = function (clientSecret,clientId,giep,TokenLibrary) {
/**
 * @author Aditya Rudragoudar
 * Function to get the access token from AT&T LGW
 * @ruturns access token
 */
var map = new java.util.HashMap();
map.put("grant_type", "client_credentials");
map.put("client_id", clientId);
map.put("client_secret", clientSecret);
var token = TokenLibrary.getToken(logger, giep.post(), map);
//logger.info("Token --->"+token); // This line should not be uncommented in Production. 
return token;
}