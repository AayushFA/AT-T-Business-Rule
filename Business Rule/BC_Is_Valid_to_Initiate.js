/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Is_Valid_to_Initiate",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ABC_BusinessCondition" ],
  "name" : "Is Valid to Initiate in ABC Workflow",
  "description" : "Checking if the object is cancelled product or not",
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_ABC_Validation",
    "libraryAlias" : "abcLib"
  } ]
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
exports.operation0 = function (node,abcLib) {
/**
 * @authors -  aw240u(cognizant)
 * 
 */
var objTyp = node.getObjectType().getID();
if (objTyp == "BPA") {
  var parNodeID = node.getParent();
  var supplExpDate = node.getValue("SI_BPA_End_Date").getSimpleValue();
  log.info("supplExpDate:"+supplExpDate);
  var granNodeID = parNodeID.getParent().getID();
  if (node.isInWorkflow("ABC_Workflow")) {
    return false
  }
  else if (granNodeID == "ATT_ABC_Root" && parNodeID.getID() == "ABC_Cancelled") {
    return false
  }
  else if(supplExpDate==null){
    	return true;
    }
  else if (supplExpDate) {
  	if (abcLib.checkDateIfLessthanToday(supplExpDate)) {
  		 return false;
    }else{
    	return true
    }
  }
    
  else{
  	return true;
  }
} else {
  return false
}
/*
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

*/
}