/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "AT&T_Audit_Library",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "AT&T_Global_Libraries" ],
  "name" : "AT&T Audit Library",
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
function setUser(node, userID ,attID){	
	node.getValue(attID).setSimpleValue(userID);
}

function setDateTime(node, attID){
	var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
	var dateNow=new Date();
	var formattedDateTime = dateTimeFormatter.format(dateNow);
	node.getValue(attID).setSimpleValue(formattedDateTime);
	
}
//STIBO-1862 Include instance name in Sender email address and Subject
function getHostEnvironment() {
    var env = new java.util.HashMap();
    env.put("att-dev-", "DEV");
    env.put("att-sandbox-", "SIT");
    env.put("att-dev2-", "UAT");
    env.put("att-preprod-", "PREPROD");
    env.put("att-prod-", "PROD");
    env.put("att-preproduction-", "PREPRODUCTION");
    var hostName = java.net.InetAddress.getLocalHost().getHostName();
    var environment = null;
    var keys = env.keySet().toArray();
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (hostName.startsWith(key)) {
            environment = env.get(key);
            break;
        }
    }
    return environment;
}


/*===== business library exports - this part will not be imported to STEP =====*/
exports.setUser = setUser
exports.setDateTime = setDateTime
exports.getHostEnvironment = getHostEnvironment