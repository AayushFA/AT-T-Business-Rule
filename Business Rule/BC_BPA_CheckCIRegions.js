/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_BPA_CheckCIRegions",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "Check CI Regions",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "lib"
  }, {
    "libraryId" : "AT&T_BPA_Validation_Library",
    "libraryAlias" : "validationLib"
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,lib,validationLib) {
/**
 * @author - Madhuri [CTS]
 * Validating the Regions Selected on CI against the referenced pItem
 */

log.info("Set Item Specific Attribute For Contract Item");

var error = "";
var lob = null;
var refItem;
var approveList = [];
var parent = node.getParent();
var itemNum= node.getValue("Item_No_Refrenced_To_CI").getValue();
var refItem = step.getNodeHome().getObjectByKey("Item.Key", itemNum);
refItemStatus_WRLN = refItem.getValue("Item_Status_WRLN").getID();
refItemStatus_ENT = refItem.getValue("Item_Status_ENT").getID();

if (refItem.getValue("Line_Of_Business").getID() == "WRLN" && refItemStatus_WRLN.startsWith("Act")) {
		error = error + getRefContractItem_WRLN();
	}	 

if(error)
  return error;
else
	return true;

function getRefContractItem_WRLN() {	
	var error = "";
			var materialItemType = refItem.getValue("Material_Item_Type_Web").getSimpleValue();
			log.info("materialItemType:" + materialItemType)
			var childOrgs = refItem.getChildren().toArray();
			var childOrgList = new java.util.ArrayList();
			cItemRegDistCenter = node.getValue("CI_Region_Distribution_Center").getValues();				
			var CIRegDistList = new java.util.ArrayList();
			var childOrgCount = 0
            childOrgs.forEach(function(child){
            var childObjID = child.getObjectType().getID();
            if(childObjID=="Child_Org_Item"){
            childOrgCount = childOrgCount+1;
            }
            })
			for (var i = 0; i < cItemRegDistCenter.size(); i++) {
				CIRegDistList.add(cItemRegDistCenter.get(i).getID());
			}			
               log.info("CIRegDistList:"+CIRegDistList)                            
               childOrgs.forEach(function(child) {
                                    var childObjType = child.getObjectType().getID();
                                   if(childObjType=="Child_Org_Item"){
                                    var childId = child.getID();
                                    var childOrgCode = child.getValue("Organization_Code").getID();                                   
                                    var childItemStatus = child.getValue("Item_Status").getID();                                   
                                    if (childItemStatus == "Active S"  || childItemStatus == "Active NS") {
                                       // getRegionsID(refItem, materialItemType, childOrgCode, "Active S", node, stepManager, zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region, BPAZoomDataLookUP);
                                        childOrgList.add(childOrgCode)
                                    }
                                   }
                                });
			if (materialItemType != null) {
				if (materialItemType == "Cable" && CIRegDistList.contains("All Regions")) {					
					error = error + "\n All regions is not applicable for Cable. Please choose a region.";
				} else if ((materialItemType == "Minor Material" || materialItemType == "Cable") && !CIRegDistList.contains("All Regions")) { // MMC Case				
					log.info("MMC case")
					var refItemRegionDC = node.getValue("BPA_RefItem_Region_Distribution_Center").getValues();					
					var childCounter = 0;
					var infoMsg = "";
					for (var i = 0; i < cItemRegDistCenter.size(); i++) {
						var citemRegionDC = cItemRegDistCenter.get(i).getID();
						var citemRegionDCValue = cItemRegDistCenter.get(i).getSimpleValue();												
							//if (childOrgs.length == 0 || (childOrgs.length == 1 && childOrgs[0].getValue("Organization_Code").getID().includes("ASE"))) {
							if (childOrgCount == 0 || (childOrgCount== 1 && childOrgs[0].getValue("Organization_Code").getID().includes("ASE"))) {
								log.info("child org not present");
								error =  error + "\n Could not process region selection as " + itemNum + " is not assigned to respective child org please work with Technical SME or Planner to assign item to respective child org and resubmit.\n";
							}
							
							if (citemRegionDC != "Services" && !childOrgList.contains(citemRegionDC)) {							
								error = error + "\n Could not process region selection as " + itemNum + " is not assigned to " + citemRegionDCValue + " please work with Technical SME or Planner to assign item to respective child org and resubmit.\n";
								
							}
					
					}
					
				} else if ((materialItemType == "Minor Material" && cItemRegDistCenter.size() == 1 && CIRegDistList.contains("All Regions")) ||
					(materialItemType == "Minor Material" && cItemRegDistCenter.size() > 1 && CIRegDistList.contains("All Regions"))) {
					log.info("AllRegions Loop")					
					var childOrgsDefaultList = new java.util.ArrayList();
					var childOrgList = new java.util.ArrayList();
					// childOrgsDefaultList = ['AK1', 'MW1', 'SE2', 'SW1', 'WE2', 'WE3']
					childOrgsDefaultList.add('AK1');
					childOrgsDefaultList.add('MW1');
					childOrgsDefaultList.add('SE2');
					childOrgsDefaultList.add('SW1');
					childOrgsDefaultList.add('WE2');
					childOrgsDefaultList.add('WE3');
					childOrgs.forEach(function(child) {
						var childObjTypeID = child.getObjectType().getID();
                            if(childObjTypeID=="Child_Org_Item"){
						infoMsg = "";
						var childId = child.getID();
						var childOrgCode = child.getValue("Organization_Code").getID();
						var childItemStatus = child.getValue("Item_Status").getSimpleValue();						
						if (childItemStatus == "Active NS" && childOrgCode != "WE4") {
							childOrgList.add(childOrgCode);
						}
						}
					});					
					if (childOrgsDefaultList.size() != childOrgList.size())
						error = error + "\n Could not process region selection as " + itemNum + " is not assigned to all child orgs or are not in Active* status. Please work with Technical SME to change item status or review and resubmit.";					
				} 
			} else {
				error = error + "This Material Item Type is not available on the Item. No zoom data added";
			}
	log.info("error:"+error)
   return error;
}
}