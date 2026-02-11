/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Is_Parent_ABC",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ABC_BusinessCondition" ],
  "name" : "Is Parent Object ABC",
  "description" : "Checking if the object is children under \"At&t root\"",
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
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node) {
/**
 * @authors -  aw240u(cognizant)
 * 
 */
var objTyp = node.getObjectType().getID();
//log.info("objTyp:" + objTyp);
if (objTyp == "BPA") {
    var parNodeID = node.getParent();
    var granNodeID = parNodeID.getParent().getID();
    if (granNodeID == "ATT_ABC_Root") {
        return true
    } else {
        return false
    }
}
if (objTyp == "Contract_Item") {
    var parNodeID = node.getParent().getParent();
    var parNodeIDVal = parNodeID.getID();
    var granNodeID = parNodeID.getParent().getID();
    if (granNodeID == "ATT_ABC_Root" || parNodeIDVal =="ATT_ABC_Root" ) {
    return true
    } else {
        return false
    }
}
if (objTyp == "Price_Break") {
    var parNodeID = node.getParent().getParent().getParent();
    var granNodeID = parNodeID.getParent().getID();
    if (granNodeID == "ATT_ABC_Root") {
        return true
    } else {
        return false
    }
}
return false;
}