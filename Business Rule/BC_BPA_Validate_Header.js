/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_BPA_Validate_Header",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "Header Validations",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item", "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "lib"
  }, {
    "libraryId" : "ATT_BPA_SingleSS_Library",
    "libraryAlias" : "sslib"
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
    "contract" : "ClassificationProductLinkTypeBindContract",
    "alias" : "BPASupRef",
    "parameterClass" : "com.stibo.core.domain.impl.ClassificationProductLinkTypeImpl",
    "value" : "BPA_To_Supplier",
    "description" : null
  }, {
    "contract" : "QueryHomeBindContract",
    "alias" : "query",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "CI_ItemRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ContractItem_Item",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "CI_BOMParentRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "LEContractItem_BOM_Parent",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "CILE_BOMChildRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "LEContractItem_BOM_Child",
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "wcontext",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "issue",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ugWrlnEng",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_WRLN_Engineering",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ugWrlnSrc",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_WRLN_Sourcing",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ug_dtv",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_DTV_Sourcing",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,BPASupRef,query,CI_ItemRef,CI_BOMParentRef,CILE_BOMChildRef,wcontext,issue,ugWrlnEng,ugWrlnSrc,ug_dtv,lib,sslib) {
/***
 * @author John 
 * @returns Validation Errors on webUI and SS for Header
 */
log.severe("Start Of Header Validations")
var objectType = node.getObjectType().getID();
var bpaSupplierRef = null;
var Header_Buyer = null;
var payment_terms = null;
var FOB_ZIP = null;
var Freight_Terms = null;
var BPA_Legacy_Contract_No = null;
var Legacy_Cont_Num = null;
var BPA_Contract_Manager = null;
var Effect_Date = null;
var Expiration_Date = null;
var Legacy_Source = null;
var Legacy_Source_ENT = null;
var Legacy_Source_RTL = null;
var Legacy_Source_WRLN = null;
var BPA_Status = null;
var sb = new java.lang.StringBuffer();
var error = false;
var BPANo = null;
var headerDesc = null;

Legacy_Source = node.getValue("Legacy_Source").getID();
Legacy_Source_ENT = node.getValue("Legacy_Source_ENT_Temp").getID();
Legacy_Source_RTL = node.getValue("Legacy_Source_RTL_Temp").getID();
Legacy_Source_WRLN = node.getValue("Legacy_Source_WRLN_Temp").getID();

var TempBusinessSourceID = node.getValue("Temp_Legacy_Source").getID();

if (objectType == "BPA") {     
	checkHeaderBuyer();
	checkEffect_ExpDate()
	checkCreateCI();
	checkBusinessSource(); //STIBO-1648
	checkRetailSourcing();
	checkLegacyContractNum(); //STIBO-1648
	checkFOB_ZIP();
	checkLegacySource();
	checkFreightTerms();
	checkPaymentTerms();
	checkSupplierRef();
	checkWrlnUserPermission();
	checkContractManager();
	checkBPAStatus();
	checkHeaderDesc();
}

log.severe("End Of Header Validations")
//////////////////////////////////////////////////////////////////


function checkHeaderBuyer() {

	Header_Buyer = node.getValue("Header_Buyer").getID();
	if (Header_Buyer) {

		if ((Legacy_Source_ENT) || (Legacy_Source_WRLN) || (Legacy_Source_RTL && Legacy_Source_RTL != "RTL") || (Legacy_Source && Legacy_Source != "RTL")) {
			if (Header_Buyer != "Wirelinebuyer") {
				issue.addWarning("Header Buyer should be Wireline, Buyer if Legacy Source is not selected as  Retail Consumer. \n", node, step.getAttributeHome().getAttributeByID("Header_Buyer"));
				error = true;
			}
		}
	} else {
		issue.addWarning("Header Buyer can not be Blank\n", node, step.getAttributeHome().getAttributeByID("Header_Buyer"));
		error = true;
	}
}

function checkEffect_ExpDate() {

	Effect_Date = node.getValue("Effect_Date").getSimpleValue();
	Expiration_Date = node.getValue("Expiration_Date").getSimpleValue();

	if (!Effect_Date) {
		issue.addWarning("Effective Date is required.\n", node, step.getAttributeHome().getAttributeByID("Effect_Date"));
		error = true;
	}
	//STIBO-1648
	if ((Legacy_Source_WRLN && Legacy_Source_WRLN != "WRLN_NON" && !Expiration_Date) ||
		(Legacy_Source_RTL && !Expiration_Date) ||
		(Legacy_Source_ENT && !Expiration_Date)) {
		issue.addWarning("Expiration Date is required.\n", node, step.getAttributeHome().getAttributeByID("Expiration_Date"));
		error = true;
	}
	var expError = sslib.checkExpDateGreaterThanToday(node, step); //STIBO-2537 checkExpDateGreaterThanToday();
	if (expError) {
		issue.addWarning(expError, node, step.getAttributeHome().getAttributeByID("Expiration_Date"));
		error = true;
	}

	BPANo = node.getValue("Oracle_Contract_Num").getSimpleValue();

	if (Effect_Date) {

		if (BPANo == null) { // this condition to ensure user will not get the validation during update bpa			
			if (lib.checkDateIfLessthanToday(Effect_Date)) {
				issue.addWarning("\nEffective Date should be greater than or Equal to Today,\n", node, step.getAttributeHome().getAttributeByID("Effect_Date"));
				error = true;
			}
		}
	}
	if (Expiration_Date && Effect_Date) {
		if (Expiration_Date < Effect_Date) {
			issue.addWarning("Expiration Date should be in future than Effective Date.\n");
			error = true;
		}
	}
}

//STIBO-1648
function checkBusinessSource() {	
	var curUser = step.getCurrentUser();	
	if ((Legacy_Source == "WRLN") || (Legacy_Source == "WRLN_NON")) {
		if (TempBusinessSourceID) {
			node.getValue("Legacy_Source").setLOVValueByID(TempBusinessSourceID);
		}
	}	
	if(((Legacy_Source_ENT && Legacy_Source_ENT != "DTV") || (Legacy_Source && Legacy_Source != "DTV")) && ug_dtv.isMember(curUser)){
    	    	 issue.addError("DTV Users do not have the privilege to work on the chosen Business Source apart from DTV.");
           error = true;
    	    }
}
//STIBO-1648

function checkRetailSourcing() {

	retail_sourcing = node.getValue("RTL_Update_Price").getID();
	if (Legacy_Source && (Legacy_Source == "RTL")) {
		if (!retail_sourcing || retail_sourcing == "") {
			issue.addWarning("Retail Sourcing  is mandatory for RTL BPA.\n", node, step.getAttributeHome().getAttributeByID("RTL_Update_Price"));
			error = true;
		}
	}
}

//STIBO-1648
function checkLegacyContractNum() {

	var legacyContractNum = node.getValue("BPA_Legacy_Contract_No").getSimpleValue();
	if (Legacy_Source != "WRLN_NON" && TempBusinessSourceID != "WRLN_NON" && !legacyContractNum) {
		issue.addWarning("Legacy Contract Number is required.\n", node, step.getAttributeHome().getAttributeByID("BPA_Legacy_Contract_No"));
	}
}

function checkFOB_ZIP() {

	FOB_ZIP = node.getValue("FOB_ZIP").getID();
	if (!FOB_ZIP) {
		issue.addWarning("FOB ZIP is mandatory.\n", node, step.getAttributeHome().getAttributeByID("FOB_ZIP"));
		error = true;
	}
}

function checkCreateCI() {

	Legacy_Source = node.getValue("Legacy_Source").getID();
	if (Legacy_Source && node.getChildren().size() == 0) {
		issue.addWarning("BPA does not have any child Contract Item. Please Create it from The Header BPA.");
		error = true;
	}
}

function checkLegacySource() {

	if (!Legacy_Source && !Legacy_Source_ENT && !Legacy_Source_RTL && !Legacy_Source_WRLN) {
		issue.addWarning("Business Source is mandatory.\n", node, step.getAttributeHome().getAttributeByID("Legacy_Source"));
		error = true;
	}
}

function checkFreightTerms() {

	Freight_Terms = node.getValue("Freight_Terms").getID();
	if (!Freight_Terms) {
		issue.addWarning("Freight Terms is mandatory.\n", node, step.getAttributeHome().getAttributeByID("Freight_Terms"));
		error = true;
	}
}

function checkPaymentTerms() {

	payment_terms = node.getValue("Payment_Terms").getID();
	if (!payment_terms) {
		issue.addWarning("Payment Terms is mandatory.\n", node, step.getAttributeHome().getAttributeByID("Payment_Terms"));
		error = true;
	}
}

function checkSupplierRef() {

	bpaSupplierRef = step.getLinkTypeHome().getClassificationProductLinkTypeByID("BPA_To_Supplier");
	var srcRefTargetSupSiteCode = node.queryClassificationProductLinks(bpaSupplierRef).asList(1);
	if (srcRefTargetSupSiteCode.size() == 0) {
		issue.addWarning("Supplier reference is mandatory.\n", node, step.getLinkTypeHome().getClassificationProductLinkTypeByID("BPA_To_Supplier"));
		error = true;
	} else {
		var bpaToSup = step.getLinkTypeHome().getClassificationProductLinkTypeByID("BPA_To_Supplier");
		var refType = node.getClassificationProductLinks().get(bpaToSup).toArray();
		if (refType[0] != null) {
			var bpaToSupTarget = refType[0].getClassification();;
			var purchSiteFlag = bpaToSupTarget.getValue("Supplier_Purchasing_Site_Flag").getSimpleValue();
			if (purchSiteFlag == "N") {
				issue.addWarning("Supplier reference with Purchase Site Flag as No cannot proceed.\n", node, step.getLinkTypeHome().getClassificationProductLinkTypeByID("BPA_To_Supplier"));
				error = true;
			}
		}
	}
}

// STIBO-1432 PRod support July release
function checkWrlnUserPermission() {
	var curUser = step.getCurrentUser();
	var wrlnEngUser = ugWrlnEng.isMember(curUser) && !ugWrlnSrc.isMember(curUser); //STIBO-2529
	if (wrlnEngUser) {
		issue.addError("Wireline Engineer user does not have access to submit BPA Header. Please contact a Sourcing Manager");
		error = true;
	}
}


function checkContractManager() {

	if(Legacy_Source){
		 BPA_Contract_Manager = node.getValue("BPA_Contract_Manager").getSimpleValue();
		 if(!BPA_Contract_Manager){
		 	issue.addWarning("Contract Manager is mandatory.\n", node, step.getAttributeHome().getAttributeByID("BPA_Contract_Manager"));
		     error = true;
		 }		
	}else if(!Legacy_Source){
		 BPA_Contract_Manager = node.getValue("BPA_ContractMngr_SS").getSimpleValue();
		 if(!BPA_Contract_Manager){
		 	issue.addWarning("Contract Manager is mandatory.\n", node, step.getAttributeHome().getAttributeByID("BPA_ContractMngr_SS"));
		     error = true;
		 }	
	}	
}

function checkBPAStatus() {
	Legacy_Source = node.getValue("Legacy_Source").getID();
	BPA_Status = node.getValue("BPA_Status").getID();
	if (Legacy_Source && !BPA_Status) {
		issue.addWarning("Header Status is mandatory.\n", node, step.getAttributeHome().getAttributeByID("BPA_Status"));
		error = true;
	}
}

function checkHeaderDesc() {

	headerDesc = node.getValue("BPA_Description").getSimpleValue();
	if (!headerDesc) {
		issue.addWarning("Header Description is mandatory.\n", node, step.getAttributeHome().getAttributeByID("BPA_Description"));
		error = true;
	}
}

if (error) {
	return issue;
} else {
	return true;
}


}