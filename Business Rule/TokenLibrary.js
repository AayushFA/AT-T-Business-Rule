/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "TokenLibrary",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "TokenBasedAuthentication" ],
  "name" : "Token Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessLibrary",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
/**
 * @author Aditya Rudragoudar
 * Library for getting any access token
 */
function getToken(logger, post, map){
    var request = post.urlEncodedBody(map);
    var response;
    try {
        response = request.invoke();  
    } catch (e) {
        if (e.javaException instanceof com.stibo.gateway.rest.RESTGatewayException) {
            throw "Error getting token: " + e.javaException.getMessage();
        } else {
            throw (e);
        }
    }
    var obj = JSON.parse(response + "");
    var authHeaderValue = "Bearer " + obj.access_token;
    var resultMap = new java.util.HashMap();
    resultMap.put("Authorization", authHeaderValue);
    return resultMap;   
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.getToken = getToken