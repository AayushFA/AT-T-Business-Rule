/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_ABC_Validation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ABC_Library" ],
  "name" : "ABC Validation Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_ABC_Common",
    "libraryAlias" : "abcCoLib"
  } ]
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
/*************************** Common Functions ***************************/
/** Validates Mandatory Attributes **/
function validateMandatoryAttribute(node, attr_id, step) {
  var error = "";
  var attributeValue = node.getValue(attr_id).getSimpleValue();
  var attr = step.getAttributeHome().getAttributeByID(attr_id);
  if (!attributeValue) {
    error = attr.getName() + " is mandatory.\n";
  }
  return error;
}
/** Validates Mandatory Attributes for BPA Object**/
function bpaValidations(node, step) {
  var BPAErrors = "";
  var SupplierNumbercheck = validateMandatoryAttribute(node, "SI_Supplier_Number", step);
  var SupplierSitecheck = validateMandatoryAttribute(node, "SI_Supplier_Site", step);
  var StartDatecheck = validateMandatoryAttribute(node, "SI_BPA_Start_Date", step);
  var ATTContactPersoncheck = validateMandatoryAttribute(node, "SI_ATT_Contact_Manager", step);
  var MasterContractNumbercheck = validateMandatoryAttribute(node, "SI_Master_Contract_Number", step);
  var ContractManagercheck = validateMandatoryAttribute(node, "SI_Contract_Manager", step);
  var BpaDescCheck = validateMandatoryAttribute(node, "SI_BPA_Description", step);
  
  BPAErrors = SupplierNumbercheck + SupplierSitecheck + StartDatecheck + ATTContactPersoncheck + MasterContractNumbercheck + ContractManagercheck+BpaDescCheck;
  return BPAErrors;
}
/** Validates Mandatory Attributes for Contract Line Object**/
function ciValidations(node, step) {
  var CIErrors = "";
  var LineTypecheck = validateMandatoryAttribute(node, "SI_Line_Type", step);
  var ItemDescriptioncheck = validateMandatoryAttribute(node, "SI_Item_Description", step);
  var Categorycheck = validateMandatoryAttribute(node, "UNSPSC_Code", step);
  var ATTUnitPricecheck = validateMandatoryAttribute(node, "SI_ATT_Unit_Price", step);
  var MarketListPricecheck = validateMandatoryAttribute(node, "SI_Market_List_Price", step);
  var SupplierItemcheck = validateMandatoryAttribute(node, "SI_Part_Number", step);
  CIErrors = LineTypecheck + ItemDescriptioncheck + Categorycheck + ATTUnitPricecheck + MarketListPricecheck + SupplierItemcheck + lineEndDateCheck(node);
  return CIErrors;
}

function lineEndDateCheck(ci) {
  var parent = ci.getParent();
  var headStartDate = parent.getValue("SI_BPA_Start_Date").getSimpleValue();
  var headEndDate = parent.getValue("SI_BPA_End_Date").getSimpleValue();
  var error = ""
  var lineEndDate = ci.getValue("SI_Line_End_Date").getSimpleValue();
  if(!headEndDate){
  	headEndDate="";
  }
  var mstConNum = ci.getValue("SI_Master_Contract_Number").getSimpleValue();
  if (!isDateBetweenEndCI(headStartDate, headEndDate, lineEndDate)) {
    error =error + "Line End Date must be between Catalog Start Date " + headStartDate + " and End Date " + headEndDate + " for Master Contract Number " + mstConNum + ".\n";   
  }
  return error
}
/** Validates Mandatory Attributes for Price Break Object**/
function priceBreakValidations(node, step) {
  var PBErrors = "";
  var PriceBreakQtycheck = validateMandatoryAttribute(node, "SI_Price_Break_Quantity", step);
  var PriceBreakPricecheck = validateMandatoryAttribute(node, "SI_Price_Break_Price", step);
  var EffectiveStartDatecheck = validateMandatoryAttribute(node, "SI_Price_Break_Start_Date", step);
  PBErrors =  PriceBreakPricecheck + EffectiveStartDatecheck + pbDateCheck(node);
  return PBErrors;
}

function pbDateCheck(pb) {
  var pbStartDate = pb.getValue("SI_Price_Break_Start_Date").getSimpleValue();
  var pbEndDate = pb.getValue("SI_Price_Break_End_Date").getSimpleValue();
  var grdPar = pb.getParent().getParent();
  var bpaStartDate = grdPar.getValue("SI_BPA_Start_Date").getSimpleValue();
  var bpaEndDate = grdPar.getValue("SI_BPA_End_Date").getSimpleValue();
  if(!bpaEndDate){
  	bpaEndDate="";
  }
  var error = "";
  var ciID = pb.getParent();
  var mstConNum = ciID.getValue("SI_Master_Contract_Number").getSimpleValue();
  if (!isDateBetweenStart(bpaStartDate, bpaEndDate, pbStartDate) || !isDateBetweenEnd(bpaStartDate, bpaEndDate, pbEndDate)) {
    error = error + "Price Break Start Date and End Date must be between Catalog Start Date " + bpaStartDate + " and End Date " + bpaEndDate + " for Master Contract Number " + mstConNum + ".\n"
  }
  /*if(!isDateBetweenEnd(bpaStartDate,bpaEndDate,pbEndDate)){
  	error = error + "End date not between " +bpaID.getID()+" start Date and end Date.\n"
  }*/
  return error;
}

function isDateBetweenEndCI(startDate, endDate, checkDate) {
  if (checkDate) {
    if (endDate == null || endDate == "") {
      var start = new Date(startDate);
      var check = new Date(checkDate);
      return check > start;
    } else {
      var start = new Date(startDate);
      var end = new Date(endDate);
      var check = new Date(checkDate);
      return check >= start && check <= end;
    }
  } else {
    return true
  }
}

function isDateBetweenStart(startDate, endDate, checkDate) {
  if (checkDate) {
    if (endDate == null || endDate == "") {
        var start = new Date(startDate);
        var check = new Date(checkDate);
        return check >= start;
      } else {
        var start = new Date(startDate);
        var end = new Date(endDate);
        var check = new Date(checkDate);
        return check >= start && check < end;
      }
    } else {
      return true
    }
  }

function isDateBetweenEnd(startDate, endDate, checkDate) {
  if (checkDate) {
    if (endDate == null || endDate == "") {
      var start = new Date(startDate);
      var check = new Date(checkDate);
      return check > start;
    } else {
      var start = new Date(startDate);
      var end = new Date(endDate);
      var check = new Date(checkDate);
      return check > start && check <= end;
    }
  } else {
    return true
  }
}
/** Attributes level Validations for Contract Line Object**/
function ciConditionalValidations(ci, step,query) {
  var ciErrors = "";
  var gscFlag = ci.getValue("SI_GSC_Flag").getID();
  var catalogStatus = ci.getValue("SI_Supplier_Catalog_Status").getID();
  var purchasable = ci.getValue("SI_Purchasable_Flag").getID();
  var itemDescription = ci.getValue("SI_ATT_Item_Description").getValue();
  var lineEndDate = ci.getValue("SI_Line_End_Date").getValue();
  var lineType = ci.getValue("SI_Line_Type").getID();
  var UOM = ci.getValue("SI_UOM").getValue();
  var itemNum = ci.getValue("ATT_Item_Number").getSimpleValue();
  var rejectReason = ci.getValue("SI_Supplier_Catalog_Reject_Reason").getSimpleValue();
  var appStep = step.executeInWorkspace("Approved", function(step) {
        return step;
      });
  var appCi = appStep.getProductHome().getProductByID(ci.getID());
  if (appCi) {
        var appPurchasable = appCi.getValue("SI_Purchasable_Flag").getID();
        var appCatalogStatus = appCi.getValue("SI_Supplier_Catalog_Status").getID();
        var appItemDescription = appCi.getValue("SI_ATT_Item_Description").getValue();
        var appLineEndDate = appCi.getValue("SI_Line_End_Date").getValue();
  }
  ci.getValue("ABC_Validation_Errors").setSimpleValue(null);
  if (!gscFlag && !ci.getParent().getValue("Agreement_Number").getValue()) {
    ciErrors += "GSC Flag is not set. Please contact Support Team \n";
  } else if (!catalogStatus) {
    ciErrors += "Please set the Status";
  } else { 	
  	    //Run the CI Validations on Rejected Lines  
	    if (catalogStatus == "Rejected") { 
	      if (gscFlag == "Y" && (!rejectReason || rejectReason == null)) {//Reject Reason is required if CI Catlog Status is Rejected	      
	        ciErrors += "Reject Reason is required\n";
	      }	      
	     if(!gscFlag && catalogStatus == "Rejected"){//Rejected lines shouldn't be updated in STIBO without a GSC pull
	        if(appItemDescription != itemDescription || appLineEndDate != lineEndDate)
	           ciErrors += " Rejected lines can be updated only when there are updates from GSC. New From GSC must be Yes.\n" 
	      }
	      if(!gscFlag && appCatalogStatus == "Accepted" ){ //For CI which are accepted and not purchasable earlier, Was able to update status to Rejected when there are no GSC updates
	        ciErrors += "Accept or Reject is only usable when new lines are pulled from GSC. New From GSC must be Yes. \n" 
	      }
	    }
	    	//Run the CI Validations on Accepted Lines      
	      if (catalogStatus == "Accepted" && !purchasable)
	          ciErrors += "Purchasable Flag is required if the Contract Line status is set to Accepted\n";
	      if (purchasable == "N" && abcCoLib.isProcessedInOracle(ci))      
	          ciErrors += "This Contract Line is already processed in Oracle PO. To end purchasing, Please enter Contract Line End Date. \n"      	    
	      if (purchasable == "N" && !abcCoLib.isProcessedInOracle(ci) && lineEndDate)      
	          ciErrors += "Non purchasable lines cannot be end dated.\n" 
	      if (catalogStatus == "Accepted" && purchasable) {	      	  
	      	 if (lineType == "Fixed Price" && UOM) {      	 	
		        ciErrors += "UOM should be blank for Fixed price line types\n";     	 	
		      }
		      if ((lineType == "Services" || lineType == "Material") && !UOM) {
		        ciErrors += "UOM is required for Material & Services Line Types\n";
		      }
		      if (itemNum == null || itemNum == "") {
		        ciErrors += validateMandatoryAttribute(ci, "SI_ATT_Item_Description", step) + "\n";
		      }
		      ciErrors += checkDuplicateCI(ci,step,query);
		      ciErrors += ciValidations(ci, step);
	      }	     
  }
  return ciErrors;
}
/**    Check Supplier & Site Inactive   **/
function supplierActiveCheck(node, step) {
  var error = ""
  var siteInactFlag = false;
  var bpaToSup = step.getLinkTypeHome().getClassificationProductLinkTypeByID("BPA_To_Supplier");
  var siteCode = node.queryClassificationProductLinks(bpaToSup).asList(1);
  if (siteCode.size() > 0) {
    var suplierSite = siteCode.get(0).getClassification();
    var siteInactDate = suplierSite.getValue("Supplier_Inactive_Date").getSimpleValue();
    var purchFlag = suplierSite.getValue("Supplier_Purchasing_Site_Flag").getSimpleValue();
    if(siteInactDate)
	    siteInactFlag = abcCoLib.isDateInPast(siteInactDate);      	    
    if(siteInactFlag || purchFlag != "Y")
      error = error + "Supplier site is inactive, please select active supplier\n"
  }
  return error
}

function isEligibleForPublish(contractItem, step) {
  catalogStatus = contractItem.getValue("SI_Supplier_Catalog_Status").getID();
  purchasable = contractItem.getValue("SI_Purchasable_Flag").getID();
  gscFlag = contractItem.getValue("SI_GSC_Flag").getID();
  publishFlag = contractItem.getValue("ABC_Publish_Oracle").getID();
  contractItemKey = contractItem.getValue("BPA_Agreement_Key").getValue();
  if (catalogStatus == "Accepted" && purchasable == "Y") {
    if (gscFlag == "Y" || abcCoLib.unApprovedABCAttributes(contractItem, step) || publishFlag == "Y")
      return true;
    else
      return false;
  } else
    return false;
}

function isEligibleForProcess(contractItem) {
  catalogStatus = contractItem.getValue("SI_Supplier_Catalog_Status").getID();
  purchasable = contractItem.getValue("SI_Purchasable_Flag").getID();
  gscFlag = contractItem.getValue("SI_GSC_Flag").getID();
  updateFlag = contractItem.getValue("ABC_Update_Flag").getID();
  contractItemKey = contractItem.getValue("BPA_Agreement_Key").getValue();
  if (catalogStatus == "Accepted" && purchasable == "Y") {
    if (gscFlag == "Y" || updateFlag == "Y")
      return true;
    else
      return false;
  } else
    return false;
}

function endDateValidate(node) {
  var endDate = node.getValue("SI_BPA_End_Date").getSimpleValue();
  var startDate = node.getValue("SI_BPA_Start_Date").getSimpleValue();
  var error = "";
  if (endDate) {
    if (isDateGreater(startDate,endDate)) {
      error = "BPA end date can't be less than start date.\n"
    } /*else if (checkDateIfLessthanToday(endDate)) {
      error = "BPA end date can't be less than current date. \n"
    }*/ else {
      //do nothing
    }
  }
  return error;
}

function isDateGreater(date1,date2){
	var d1 =new Date(date1);
	var d2 = new Date(date2);
	return d1>d2;
}




function startDateValidate(node) {
  var startDate = node.getValue("SI_BPA_Start_Date").getSimpleValue();
  var error = "";
  if (startDate) {
     if (checkDateIfLessthanToday(startDate) && !abcCoLib.isProcessedInOracle(node)) {
      error = "BPA start date can't be less than current date. \n"
    } else {
      //do nothing
    }
  }
  return error;
}


function checkDateIfLessthanToday(date) {
  var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd"); // For ISO Date Format
  var dateNow = new Date();
  var formattedDateTime = dateTimeFormatter.format(dateNow);
  if (date < formattedDateTime ) {
    return true;
  } else if (date > formattedDateTime || date == formattedDateTime) {
    return false;
  }
}

function checkDuplicateCI(node, step, query) {
	var errorMsg = "";
if(checkDateIfGreaterthanToday(node.getValue("SI_Line_End_Date").getValue())){	
  var supNo = node.getValue("SI_Supplier_Number").getValue();
  var supSite = node.getValue("SI_Supplier_Site").getValue();
  var num = node.getValue("SI_Part_Number").getValue();
  //log.info(supNo + "_" + supSite + "_" + num);
  var querySpecification = null;
  var c = com.stibo.query.condition.Conditions;
  var queryResult = null;
  if (node.getObjectType().getID() == "Contract_Item") {
    var querySpecification = query.queryFor(com.stibo.core.domain.Product)
      .where(c.objectType(step.getObjectTypeHome().getObjectTypeByID("Contract_Item"))
        .and(c.valueOf(step.getAttributeHome().getAttributeByID("SI_Part_Number")).eq(num)));

    var queryExecute = querySpecification.execute().asList(5);
    //log.info("query executed" + queryExecute.size());
    queryExecute.forEach(
      function (queryResult) {
        var parent = queryResult.getParent();
        var contractNum = parent.getValue("SI_Master_Contract_Number").getValue();
        var lineEndDate = queryResult.getValue("SI_Line_End_Date").getValue();
        if(parent.getObjectType().getID() == "BPA")
          var headerDate = parent.getValue("SI_BPA_End_Date").getValue();
        if (parent.getParent().getID() != "ABC_Cancelled" && queryResult.getParent().getID() != "ABC_Cancelled" && queryResult.getID() != node.getID() &&
          queryResult.getValue("SI_Supplier_Number").getValue() == supNo && checkDateIfGreaterthanToday(headerDate)) {
          	if(checkDateIfGreaterthanToday(lineEndDate))          
                 errorMsg = errorMsg + "Duplicate Contract Line Item " + queryResult.getID() + " found under Master Contract Number " + contractNum + "\n"
        }
      });
  }  
}
return errorMsg;
}

function checkDateIfGreaterthanToday(date) {
  var dateFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd"); // For ISO Date Format
  var dateNow = new Date();
  var formattedDate = dateFormatter.format(dateNow);
  if (date > formattedDate || !date || date == formattedDate) {
    return true;
  } else if (date < formattedDate ) {
    return false;
  }
}

function checkDupMasterContract(node, step, query) {
    var errorMsg = "";
    var supplierNum ="";
	var bpaSupplierType = step.getHome(com.stibo.core.domain.classificationproductlinktype.ClassificationProductLinkTypeHome).getLinkTypeByID('BPA_To_Supplier');
	var bpaSupplierObj = node.queryClassificationProductLinks(bpaSupplierType).asList(1);
	if(bpaSupplierObj.size()>0) {
		var supplier = bpaSupplierObj.get(0).getClassification();
		supplierNum = supplier.getValue("Supplier_Number").getSimpleValue();				
	}
  var masterContractNum = node.getValue("SI_Master_Contract_Number").getValue();
if(masterContractNum != "NO CONTRACT"){
  var querySpecification = null;
  var c = com.stibo.query.condition.Conditions;
  var queryResult = null;
  if (node.getObjectType().getID() == "BPA") {
    var querySpecification = query.queryFor(com.stibo.core.domain.Product)
      .where(c.objectType(step.getObjectTypeHome().getObjectTypeByID("BPA"))
        .and(c.valueOf(step.getAttributeHome().getAttributeByID("SI_Master_Contract_Number")).eq(masterContractNum)));
		//.and(c.valueOf(step.getAttributeHome().getAttributeByID("SI_Supplier_Number")).eq(supplierNum)));

    var queryExecute = querySpecification.execute().asList(5);
    //log.info("query executed" + queryExecute.size());
    queryExecute.forEach(
      function (queryResult) {  
      	var supplier =  queryResult.getValue("SI_Supplier_Number").getValue();      
        if (queryResult.getParent().getID() != "ABC_Cancelled" && queryResult.getID() != node.getID() && supplier != supplierNum) {          
          errorMsg = "\n"+queryResult.getID()+ " exist with the same Master Contract Number " + masterContractNum + " and Supplier " + supplier + " ,please change to proceed.\n"
        }
      });
  }
}
  return errorMsg;
}

/*===== business library exports - this part will not be imported to STEP =====*/
exports.validateMandatoryAttribute = validateMandatoryAttribute
exports.bpaValidations = bpaValidations
exports.ciValidations = ciValidations
exports.lineEndDateCheck = lineEndDateCheck
exports.priceBreakValidations = priceBreakValidations
exports.pbDateCheck = pbDateCheck
exports.isDateBetweenEndCI = isDateBetweenEndCI
exports.isDateBetweenStart = isDateBetweenStart
exports.isDateBetweenEnd = isDateBetweenEnd
exports.ciConditionalValidations = ciConditionalValidations
exports.supplierActiveCheck = supplierActiveCheck
exports.isEligibleForPublish = isEligibleForPublish
exports.isEligibleForProcess = isEligibleForProcess
exports.endDateValidate = endDateValidate
exports.isDateGreater = isDateGreater
exports.startDateValidate = startDateValidate
exports.checkDateIfLessthanToday = checkDateIfLessthanToday
exports.checkDuplicateCI = checkDuplicateCI
exports.checkDateIfGreaterthanToday = checkDateIfGreaterthanToday
exports.checkDupMasterContract = checkDupMasterContract