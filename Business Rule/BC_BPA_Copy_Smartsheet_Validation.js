/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_BPA_Copy_Smartsheet_Validation",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_CT_BusinessCondition" ],
  "name" : "Copy Smartsheet Validation",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Clone_Library",
    "libraryAlias" : "bpaCloneLib"
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
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "issue",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,issue,bpaCloneLib) {
/* author: Aayush Mahato
 @desc: to check if the entered "Region to Copy" is valid or not
 */
var parent = node.getParent();
var enteredRegionCheck = enterRegion(parent);
if (enteredRegionCheck.trim()) {
	issue.addError(enteredRegionCheck);
  return issue
} else {
  return true
}

function enterRegion(node) {
  var error = "";
  var activeError = "";
  var child = node.getChildren().toArray();
  child.forEach(function(item) {
    var regionToMove = item.getValue("CI_Region_Distribution_Center_temp").getValues();
    if (regionToMove.size() > 0) {
      log.info("CI: " + item.getID())
      var regionDCList = new java.util.ArrayList();
      var calcCFASDupList = new java.util.ArrayList();
      var childOrgList = new java.util.ArrayList();
      var calcCFASCodes = new java.util.ArrayList();
      var consignOrgsList = new java.util.ArrayList();
      //Get CI's existing Region CFAS Codes List
      var itemNum = item.getValue("Oracle_Item_Num").getValue();
      var refItem = manager.getNodeHome().getObjectByKey("Item.Key", itemNum);
      var refItemStatus = refItem.getValue("Item_Status_WRLN").getID();
      var regionDC = item.getDataContainerByTypeID("Region").getDataContainers().toArray();
      regionDC.forEach(function(dc) {
        var regionDCObj = dc.getDataContainerObject();
        var regionDCObjID = regionDCObj + "";
        regionDCObjID = regionDCObjID.split(":");
        regionDCObjID = regionDCObjID[1];
        if (regionDCObj.getValue("Regional_Status").getID() == "ACTIVE") {
          var cfas = regionDCObj.getValue("CFAS_CO_Code").getID();
          var state = regionDCObj.getValue("STATE").getID();
          var zip = regionDCObj.getValue("ZIP").getID();
          if (state)
            regionDCList.add(cfas + ";" + state);
          else
            regionDCList.add(cfas);
          //regionDupList.add(cfas +zip+ state);
        }
      });
      //Get Child Orgs List on the Item
      var childOrgs = refItem.getChildren().toArray();
      childOrgs.forEach(function(child) {
        var childOrgStatus = child.getValue("Item_Status_WRLN").getID();
        var childOrgCode = child.getValue("Organization_Code").getID();
        if (childOrgStatus == "Active S" || childOrgStatus == "Active NS")
          childOrgList.add(childOrgCode);
      });
      //Get consign Orgs List on the Item
      var consignOrgs = item.getValue("Consign_Org_Code").getValues();
      if (consignOrgs) {
        for (var i = 0; i < consignOrgs.size(); i++) {
          consignOrgsList.add(consignOrgs.get(i).getValue())
        }
      }
      //Check whether the Child Org against entered Region to Move is existing on Item	
      for (var i = 0; i < regionToMove.size(); i++) {
        var activeCounter = 0;
        var regionName = regionToMove.get(i).getID();
        var material = refItem.getValue("Material_Item_Type").getID();
        if ((material == "Minor Material" || material == "Cable") && !childOrgList.contains(regionName) ||
            ((material != "Minor Material" && material != "Cable") && !refItemStatus.startsWith("Act"))) {
          error = error + "The Region to Copy " + regionToMove.get(i).getValue() + " for the Contract Line " + item.getID() + " is incorrect ,please select appropriate  region. \n";
        } else if (((material == "Minor Material" || material == "Cable") && childOrgList.contains(regionName)) ||
          (material != "Minor Material" && material != "Cable")) {
          [calcCFASCodes, calcCFASDupList] = bpaCloneLib.getTargetCFASZoomData(regionName, refItem, childOrgs, consignOrgsList, calcCFASCodes, calcCFASDupList,manager);
          for (var k = 0; k < regionDCList.size(); k++) {
            if (!calcCFASCodes.contains(regionDCList.get(k)))
              activeCounter++;
          }
          if (activeCounter == 0) {
            activeError = "\nAt least one Active Region / CFAS Company code will not be present on the Contract Line - " + item.getID() + " after copying the selected regions.\n";
          }
          error += bpaCloneLib.validateDupZoom(calcCFASDupList, refItem, item, manager);        
        } else {
          //nothing
        }
      }
    }
  });
  return activeError + error;
}
}