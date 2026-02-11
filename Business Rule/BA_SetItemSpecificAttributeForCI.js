/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SetItemSpecificAttributeForCI",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "Set Item Specific Attribute For Contract Item",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item", "Bill_Of_Material", "BPA", "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "ATT_BPA_SingleSS_Library",
    "libraryAlias" : "bpaSingleSsLib"
  }, {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "lib"
  }, {
    "libraryId" : "ATT_BPA_Zoom_Library",
    "libraryAlias" : "bpaZoomLib"
  }, {
    "libraryId" : "AT&T_BPA_Validation_Library",
    "libraryAlias" : "validationLib"
  }, {
    "libraryId" : "ATT_BPA_ASL_Library",
    "libraryAlias" : "aslLib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "refContractItem",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ContractItem_Item",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "pbomRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "LEContractItem_BOM_Parent",
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "BPAZoomDataLookUP",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "UgWrlnEng",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_WRLN_Engineering",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ugWrlnSrc",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_WRLN_Sourcing",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,refContractItem,pbomRef,webui,BPAZoomDataLookUP,UgWrlnEng,ugWrlnSrc,bpaSingleSsLib,lib,bpaZoomLib,validationLib,aslLib) {
/**
 * @author - Piyal [CTS]
 * Setting the item specific attributes From Item/PBOM to Contract item
 * @author - John [CTS], Tanusree [CTS], AAyush[CTS]
 * Add Zoom Data for ENT & WRLN from WRLN pItem
 */

log.info("Set Item Specific Attribute For Contract Item");

var Workflow = stepManager.getWorkflowHome().getWorkflowByID("Create_BPA")
var State = Workflow.getStateByID("Enrich_BPA_CI_LE");

var curUser = stepManager.getCurrentUser();
var wrlnEngUser = UgWrlnEng.isMember(curUser)&& !ugWrlnSrc.isMember(curUser);//STIBO-2529

var lob = null;
var std_pack = null;
var minimumQty = null;
var zipDefault = "";
var regionalStatusDefault = "ACTIVE";
var zipActionDefault = "INCLUDE";
var stateDefault = "";
var region = null;
var serviceCount = 0;
var infoMsg = "";
var regionDCStatus = false;
var refItem;
var refContractItemID;
var approveList = [];
var zoomDataCheck = "";
var zoomInfoCheck = "";

var parent = node.getParent();
var statusRefExist = lib.executeCI(node, stepManager, refContractItem);

if(statusRefExist ==""){
	var refItemTypeCheck = validationLib.validateReferencedItemType(node, refContractItem, parent,wrlnEngUser);
	if (refItemTypeCheck == ""){
		var crossRefCheck = validationLib.validateCIUniqueness(node,stepManager,parent);
		if(crossRefCheck==""){
			refContractItemID = node.getReferences(refContractItem);
			if (refContractItemID.size() > 0) {
				refItem = refContractItemID.get(0).getTarget();
				itemNum = refItem.getValue("Item_Num").getSimpleValue();
				refItemStatus = refItem.getValue("Line_Of_Business").getID();
				if(!node.getValue("Consign_Org_Code").getSimpleValue() && node.getValue("BPA_Processed_In_EBS").getID()!= "Y" && refItemStatus!= "WRLN"){
                       aslLib.setConsignOrg(node,stepManager,refContractItem); //Set CI consign org codes from consigned child orgs
                   }
				var consignmentDataCheck = validationLib.validateConsignOrgCodeData(node, "Consign_Org_Code", stepManager);				
				var regionDataCheck = aslLib.validateRegionData(node,refItem,stepManager);
				if(node.getValue("BPA_Processed_In_EBS").getID()!= "Y"){
					 [zoomDataCheck,zoomInfoCheck] = bpaZoomLib.zoomDataPopulate(node, refItem, BPAZoomDataLookUP, stepManager,parent);
				}
				else{
					if(!consignmentDataCheck && !regionDataCheck){
						 [zoomDataCheck,zoomInfoCheck] = bpaZoomLib.zoomDataPopulate(node, refItem, BPAZoomDataLookUP, stepManager,parent);
						/*if(node.getValue("BPA_Processed_In_EBS").getID()!= "Y"){
							var invalidZoomDataCheck = validationLib.validateInvalidZoomData(node,stepManager,refItem);
						}*/
					}
				}
					if(consignmentDataCheck ||regionDataCheck || zoomDataCheck)
						webui.showAlert("ERROR", consignmentDataCheck + regionDataCheck +zoomDataCheck);
				     if(zoomInfoCheck)
						webui.showAlert("INFO", zoomInfoCheck);
				}							
		}else{
			   webui.showAlert("ERROR", crossRefCheck);
		    }
	}
	else{
		 webui.showAlert("ERROR", refItemTypeCheck);
	}
}
else{
	 webui.showAlert("ERROR", statusRefExist);
}

}