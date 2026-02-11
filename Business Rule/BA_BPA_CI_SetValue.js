/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_CI_SetValue",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "Set Value CI Creation",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item", "Item" ],
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
    "libraryId" : "ATT_BPA_ASL_Library",
    "libraryAlias" : "aslLib"
  }, {
    "libraryId" : "AT&T_BPA_Validation_Library",
    "libraryAlias" : "validationLib"
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
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "QueryHomeBindContract",
    "alias" : "query",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ProductBindContract",
    "alias" : "cancelled",
    "parameterClass" : "com.stibo.core.domain.impl.FrontProductImpl",
    "value" : "CancelledProducts",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "setValueFrmRef",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_SetItemSpecificAttributeForCI",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "refContractItem",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ContractItem_Item",
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "BPAZoomDataLookUP",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "pbomRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "LEContractItem_BOM_Parent",
    "description" : null
  }, {
    "contract" : "BusinessActionBindContract",
    "alias" : "setDefault",
    "parameterClass" : "com.stibo.core.domain.impl.businessrule.FrontBusinessActionImpl",
    "value" : "BA_BPA_CI_CILE_SetDefaultValues",
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
exports.operation0 = function (node,manager,webui,query,cancelled,setValueFrmRef,refContractItem,BPAZoomDataLookUP,pbomRef,setDefault,UgWrlnEng,ugWrlnSrc,bpaSingleSsLib,lib,bpaZoomLib,aslLib,validationLib) {
/**
 * @author - Piyal [CTS]
 * Setting the item specific attributes From Item/PBOM to Contract item
 * @author - John [CTS], Tanusree [CTS], AAyush[CTS]
 * Add Zoom Data for ENT & WRLN from WRLN pItem
 */

log.info("Set Item Specific Attribute For Contract Item");

var curUser = manager.getCurrentUser();
var wrlnEngUser = UgWrlnEng.isMember(curUser) && !ugWrlnSrc.isMember(curUser);//STIBO-2529
//logger.info("Wrln eng only:" + wrlnEngUser)

var Workflow = manager.getWorkflowHome().getWorkflowByID("Create_BPA")
var State = Workflow.getStateByID("Enrich_BPA_CI_LE");
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
var errMsg = "";
var regionDCStatus = false;
var refContractItemID;
var approveList = [];
var parent = "";
var allRegionCheck ="";

errMsg = getParent(); //parent defining code
if(parent){
lib.setDefaultCICILE(node,parent,refContractItem); // STIBO- 2335 
var statusRefExist = lib.executeCI(node, manager, refContractItem);
if (statusRefExist == "") {
	var refItemTypeCheckValidCheck = validationLib.validateReferencedItemType(node, refContractItem, parent,wrlnEngUser) + validationLib.validateCIUniqueness(node, manager, parent);
        if (refItemTypeCheckValidCheck == "") {
            refContractItemID = node.getReferences(refContractItem);
            if (refContractItemID.size() > 0) {
                refItem = refContractItemID.get(0).getTarget();                
                itemNum = refItem.getValue("Item_Num").getSimpleValue();
                var setConsign = node.getValue("Consign_Flag").getID();               
                log.info(setConsign + refItem.getValue("Line_Of_Business").getID())
                if (!setConsign || setConsign == "N") {
                	 if(refItem.getValue("Line_Of_Business").getID() != "WRLN")   {           	
			 	    aslLib.setConsignOrg(node, manager, refContractItem); //Set CI consign org codes from consigned child orgs
                	    if(node.getValue("Consign_Org_Code").getSimpleValue()){
			 	       node.getValue("Consign_Flag").setLOVValueByID("Y");
			 	    }
                	 }                	 			 	 
			  }		
			  if(setConsign == null){
			  	log.info("else loop")			  	
			  	    if(refItem.getValue("Line_Of_Business").getID() == "WRLN")
                	 	  allRegionCheck = aslLib.populateConsignOrgs_WRLN(node,refItem,manager);
                	 }	
			  if(!allRegionCheck){	
				var consignmentDataCheck = validationLib.validateConsignOrgCodeData(node, "Consign_Org_Code", manager);
				var regionDataCheck = aslLib.validateRegionData(node,refItem,manager);
				//if (!consignmentDataCheck && !regionDataCheck) {
				  var [zoomDataCheck,zoomInfoCheck] = bpaZoomLib.zoomDataPopulate(node, refItem, BPAZoomDataLookUP, manager, parent);
				  var err = consignmentDataCheck+regionDataCheck+zoomDataCheck;
				  if (err){
				    webui.showAlert("ERROR", err);
				}
				 if (zoomInfoCheck){
				    webui.showAlert("INFO", zoomInfoCheck);
				}
			  }
			  else {
		            webui.showAlert("ERROR", allRegionCheck);
		        }
            }
        } 
        else {
            webui.showAlert("ERROR", refItemTypeCheckValidCheck);
        }        
} 
else {
        webui.showAlert("ERROR", statusRefExist);
}
}
else{
	webui.showAlert("ERROR", errMsg);
}

function getParent(){
	var error = "";
	if (node.isInWorkflow("Create_BPA")) {
	    parent = node.getParent();
	}
	else {
	    var tempPar = node.getValue("Temp_Parent_Item").getSimpleValue();
	    if (tempPar != null) {
	        parent = manager.getProductHome().getProductByID(tempPar);
	    }
	    else {
	        var BPAno = node.getValue("Oracle_Contract_Num").getSimpleValue();
	        log.info("BPAno:" + BPAno);
	        if (BPAno == null) {
	            //webui.showAlert("ERROR", "BPA Number is Blank", "Please Provide the BPA Number to proceed");
	            error = "BPA Number is Blank", "Please Provide the BPA Number to proceed";
	        } else if (BPAno != null) {
	            var BPAnoPen = node.getValue("Oracle_Contract_Num").getSimpleValue().trim();
	            var magBPAno = manager.getAttributeHome().getAttributeByID("Oracle_Contract_Num");
	            var bpaObject = manager.getNodeHome().getObjectByKey("BPANumber.Key", BPAno);
	            if (bpaObject == null) {
	                //webui.showAlert("ERROR", "BPA Number is Invalid", "Entered BPA number does not exist in the system,Please Provide valid BPA Number to proceed");
	                error = "BPA Number is Invalid", "Entered BPA number does not exist in the system,Please Provide valid BPA Number to proceed";
	            } else {
	                //var parent = manager.getProductHome().getProductByID(BPAnoPen);
	                parent = bpaObject;
	            }
	        }
	    }
	}
	return error;
}          
}