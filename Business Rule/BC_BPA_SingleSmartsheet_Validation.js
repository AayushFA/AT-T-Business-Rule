/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_BPA_SingleSmartsheet_Validation",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "BPA SingleSmartsheet Validation",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "StagingBPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Validation_Library",
    "libraryAlias" : "bpaValidLib"
  }, {
    "libraryId" : "ATT_BPA_SingleSS_Library",
    "libraryAlias" : "bpaSingleSsLib"
  }, {
    "libraryId" : "ATT_BPA_Zoom_Library",
    "libraryAlias" : "bpaZoomLib"
  }, {
    "libraryId" : "ATT_BPA_ASL_Library",
    "libraryAlias" : "aslLib"
  }, {
    "libraryId" : "AT&T_Audit_Library",
    "libraryAlias" : "auditLib"
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
  }, {
    "contract" : "QueryHomeBindContract",
    "alias" : "queryHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "AttributeGroupBindContract",
    "alias" : "ciGrp",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "AG_CotractItemAttributes",
    "description" : null
  }, {
    "contract" : "AttributeGroupBindContract",
    "alias" : "cileGrp",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "AG_LE_Attr",
    "description" : null
  }, {
    "contract" : "AttributeGroupBindContract",
    "alias" : "ciSSGrp",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "AG_BPA_SmartSheet_CI",
    "description" : null
  }, {
    "contract" : "AttributeGroupBindContract",
    "alias" : "cileSSGrp",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "AG_BPA_SmartSheet_CILE",
    "description" : null
  }, {
    "contract" : "AttributeGroupBindContract",
    "alias" : "miscDCGrp",
    "parameterClass" : "com.stibo.core.domain.impl.AttributeGroupImpl",
    "value" : "AG_DC_MisC_Attr",
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "issue",
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
    "contract" : "ObjectTypeBindContract",
    "alias" : "headerObj",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "BPA",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "contractItemReference",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ContractItem_Item",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "itemObj",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "Item",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,queryHome,ciGrp,cileGrp,ciSSGrp,cileSSGrp,miscDCGrp,issue,BPAZoomDataLookUP,headerObj,contractItemReference,itemObj,bpaValidLib,bpaSingleSsLib,bpaZoomLib,aslLib,auditLib) {
/*
 * Author-Abiraami, Madhuri, John
 * Single smartsheet Create validation - CI and CILE
 */
var pitem = "";
var pitemError = "";
var error = "";
var ciItemNumCheckError = "";
var minMaxCheckError = "";
var allRegionCheck ="";
var regionDCError = "";
var miscDCError = "";
var ALLTZoomDataCheckError = "";
var WESTTZoomDataCheckError = "";
var activeZoomDataCheckError = "";
var zoomDataError = "";
var zoomInfo ="";
var cileError = "";
var cileCreateError = "";
var bpaHeaderObjError = "";
var bpaHeaderCheckErr = "";
var duplicateZoomDataCheckError = "";
var dateAttr = "Imported_TS";
var bpaHeaderObj = "";
var mandatoryAttrCheckError = "";
var validateCIOracleItemNumError = "";
var inactiveZoomDataCheck = "";
var stdPackageNonZeroCheck= "";
bpaSingleSsLib.trimSpaces(node, step); // Trim spaces and new line for all text fields
var itemNumAttr = step.getAttributeHome().getAttributeByID("Item_Num");
var c = com.stibo.query.condition.Conditions;

var ciItemNum = node.getValue("Item_No_Refrenced_To_CI").getSimpleValue();
var cileItemNum = node.getValue("Item_No_Referenced_to_CILE").getSimpleValue();
var cileType = node.getValue("LE_TYPE").getSimpleValue();
var cileName  = node.getValue("LE_Name").getSimpleValue();
var cilePrice = node.getValue("LE_Price").getSimpleValue();
var cileQty = node.getValue("Quantity_2").getSimpleValue();

if (ciItemNum) {
	node.getValue("Oracle_Item_Num").setSimpleValue(ciItemNum);
	var pitem = step.getNodeHome().getObjectByKey("Item.Key", ciItemNum);
	if (pitem) {
		var itemLOB = pitem.getValue("Line_Of_Business").getID();
	} else {
		pitemError = "\nItem number is not found. Please check the Item number provided"
	}
} else {
	pitemError = "\nCould not process line-item changes as Item No is required field please review and resubmit"
}

var bpaIdentifier = node.getValue("BPA_Header_ID_Temp").getSimpleValue();
if (bpaIdentifier) {
	if (bpaIdentifier.startsWith("BPA-")) {
		bpaHeaderObj = step.getProductHome().getProductByID(bpaIdentifier);
		if (!bpaHeaderObj)
			bpaHeaderObjError = "\n BPA Header Object does not exist with the provided BPA Header Stibo ID. Please review and resubmit."
	} else {
		bpaHeaderObj = step.getNodeHome().getObjectByKey("BPANumber.Key", bpaIdentifier);
		if (!bpaHeaderObj)
			bpaHeaderObjError = "\n BPA Header Object does not exist with the provided Blanket Purchase Agreement. Please review and resubmit"
	}
	if (bpaHeaderObj){
		var [bpaHeaderCheckErr, headerClosed, ciClosed] = bpaSingleSsLib.headerCheck(bpaHeaderObj, node)
	}
		
} else {
	bpaHeaderObjError = "\n Could not process line-item changes as Oracle Blanket Purchase Agreement is required field please review and resubmit"
}

// Create contract item
if (bpaHeaderObj && ciItemNum && pitem) {
	var legacySource = bpaHeaderObj.getValue("Legacy_Source").getID();
	var [ciObj, ciItemNumCheckError] = bpaSingleSsLib.ciCreation(bpaHeaderObj, node, pitem, ciGrp, ciSSGrp, dateAttr, step,contractItemReference,aslLib);
	if (!ciItemNumCheckError) {
		validateCIOracleItemNumError = bpaValidLib.validateCIOracleItemNumStatus(ciObj, step);
		mandatoryAttrCheckError = bpaSingleSsLib.mandatoryCIAttrCheck(ciObj, step);
		//aslLib.setConsignOrg(ciObj,step,contractItemReference); //Set CI consign org codes from consigned child orgs
		if (itemLOB == "WRLN" || itemLOB == "ENT") {
			minMaxCheckError = bpaValidLib.validateMinMaxOrderQty(ciObj);
			if (node.getValue("STD_PACKAGING").getSimpleValue()){
				var stdPackageNonZeroCheck = bpaValidLib.validateStdPackaging(node);
			}
			if(itemLOB == "WRLN")		{
				 allRegionCheck = aslLib.populateConsignOrgs_WRLN(ciObj,pitem,step);
			}
			[zoomDataError,zoomInfo] = bpaZoomLib.zoomDataPopulate(ciObj,pitem, BPAZoomDataLookUP, step, bpaHeaderObj);
		}
		//Cretae Region DCs 
		if (legacySource != "RTL") {
		regionDCError = bpaSingleSsLib.createRegionDC(ciObj, ciObj, pitem, step);
		var regionDCGrp = step.getAttributeGroupHome().getAttributeGroupByID("AG_DC_Region_Attr");		
		bpaSingleSsLib.populateAttributes(node, ciObj, regionDCGrp, step);		
		regionDCError = bpaSingleSsLib.createRegionDC(node, ciObj, pitem, step);
		}
		//Create Service Charge Code DCs
		var miscDCGrp = step.getAttributeGroupHome().getAttributeGroupByID("AG_DC_MisC_Attr");
		bpaSingleSsLib.populateAttributes(node, ciObj, miscDCGrp, step);
		if (!bpaSingleSsLib.miscDCCheck(node, ciObj)) {		
			miscDCError = bpaSingleSsLib.createMiscDC(node, ciObj, miscDCGrp, step);
			miscDCError = miscDCError + bpaValidLib.validateMiscChargeDC(ciObj);
		}		
		//Validate Zoom Data
		if (legacySource != "RTL") {
				ALLTZoomDataCheckError = bpaValidLib.validateALLTZoomData(ciObj);
				WESTTZoomDataCheckError = bpaValidLib.validateWESTTZoomData(ciObj);
				inactiveZoomDataCheck = bpaValidLib.validateInActiveZoomData(ciObj);
				activeZoomDataCheckError = bpaValidLib.validateActiveZoomData(ciObj);
		}					
		var lib = "";
		duplicateZoomDataCheckError = bpaValidLib.validateDuplicateZoomData(ciObj, contractItemReference, lib, step);
	}
	//CILE check - Check for NTW BOM type and create CILE object	
	if (ciObj && (cileType || cileItemNum || cileName || cilePrice || cileQty) && pitem) {
		cileError = bpaValidLib.validateCILENtwBOMType(pitem)
		if (!cileError) {
			cileCreateError = bpaSingleSsLib.cileCreation(ciObj, node, cileGrp, cileSSGrp, dateAttr, step)
		}
	}
}
error = mandatoryAttrCheckError + validateCIOracleItemNumError + bpaHeaderObjError + bpaHeaderCheckErr + pitemError + ciItemNumCheckError + minMaxCheckError + stdPackageNonZeroCheck + allRegionCheck + zoomDataError + regionDCError + miscDCError + ALLTZoomDataCheckError + WESTTZoomDataCheckError + activeZoomDataCheckError + inactiveZoomDataCheck + duplicateZoomDataCheckError + cileError + cileCreateError;

if (error) {
	return error;
} else {
	auditLib.setDateTime(node, dateAttr)
	var procBpa = step.getProductHome().getProductByID("Processed_BPAs");
	node.setParent(procBpa); // Move the staging BPA object to Processed BPA folder 
	
	if (!bpaHeaderObj.isInWorkflow("Create_BPA")) {
			bpaHeaderObj.startWorkflowByID("Create_BPA", "Initiated to workflow");
	}
	if (!ciObj.isInWorkflow("Create_BPA")) {
			ciObj.startWorkflowByID("Create_BPA", "Initiated to workflow");
	}	
	return true;
}
}