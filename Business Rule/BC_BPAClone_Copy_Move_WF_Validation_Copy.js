/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_BPAClone_Copy_Move_WF_Validation_Copy",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_CT_BusinessCondition" ],
  "name" : "Copy Validations",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "bpaLib"
  }, {
    "libraryId" : "ATT_BPA_SingleSS_Library",
    "libraryAlias" : "bpaSSLib"
  }, {
    "libraryId" : "AT&T_BPA_Validation_Library",
    "libraryAlias" : "bpaCloneValid"
  }, {
    "libraryId" : "AT&T_BPA_Clone_Library",
    "libraryAlias" : "ciLib"
  }, {
    "libraryId" : "ATT_BPA_Zoom_Library",
    "libraryAlias" : "bpaZoomLib"
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
    "contract" : "WebUiContextBind",
    "alias" : "webui",
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
    "contract" : "LookupTableHomeBindContract",
    "alias" : "BPAZoomDataLookUP",
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
    "contract" : "ReferenceTypeBindContract",
    "alias" : "contractItemReference",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ContractItem_Item",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,webui,issue,BPAZoomDataLookUP,query,contractItemReference,bpaLib,bpaSSLib,bpaCloneValid,ciLib,bpaZoomLib) {
/**
 author : AAYUSH KUMAR MAHATO
*/
var bpaTobpa = manager.getReferenceTypeHome().getReferenceTypeByID("BPACopyTrans_ContractToContract");
var bpaOwn = node.getReferences(bpaTobpa).toArray();
if (bpaOwn.length > 0) {
  var bpaRef = bpaOwn[0].getTarget();
}
if (bpaRef != null) {
	
  bpaRef.getValue("BPA_Clone_WF_UserAction").setLOVValueByID("Copy");
  bpaRef.getValue("BPA_Cloned_From").setSimpleValue(node.getID());
  var targetRefCheck = checkIfSameRefAdded(node) + legacySourceCheck(bpaRef) + bpaNumberCheck(bpaRef) + bpaStatusCheck(bpaRef) + checkCancelledBPA(bpaRef) + bpaSSLib.checkExpDateGreaterThanToday(bpaRef, manager) + bpaCloneValid.isReferenceInBPAWF(bpaRef) +bpaCloneValid.bpaClonePostEnrichValHeader(bpaRef, manager, query);;
  var atleastOneTempRegion = atleastOneTempRegionAdded(node, manager);
  var nodeRefItemCheck = nodeRefItemCheck(node);
   var enteredRegionCheck = enterRegion(node);
  var targetOinList = checkTargetBpaOinlist(node, manager);
  var nodeChildMandVal = nodeChildMandVal(node);
  var checkChildInbpaWorkflow = checkChildInbpaWorkflow(node);
  var valiSourceCI = valiSourceCI(node);
  var errMsg = targetOinList + nodeChildMandVal  + nodeRefItemCheck  +valiSourceCI + checkChildInbpaWorkflow ;
  if (targetRefCheck.trim()) {
    return "This action cannot be completed for the following reasons: "+"("+ bpaRef.getID() +")"+ "\n \n" + targetRefCheck;
  } else
  if (atleastOneTempRegion.trim()) {
    return "This action cannot be completed for the following reasons: \n \n" + atleastOneTempRegion;
  } else if (errMsg.trim()) {
    return "This action cannot be completed for the following reasons: \n \n " + errMsg;
  } 
   else if (enteredRegionCheck.trim()) {
    return "This action cannot be completed for the following reasons: \n \n" + enteredRegionCheck;
  }  else {
    return true
  }
} else {
  return "Please provide Target BPA Reference and proceed";
}



function bpaStatusCheck(node) {
  var errorRes = "";
  var bpaStatus = node.getValue("BPA_Status").getSimpleValue();
  if (bpaStatus == "Closed") {
    errorRes = "Target Contract " + bpaRef.getID() + ": " + "status is Closed \n";
  }
  return errorRes;
}

function checkIfSameRefAdded(node) {
  var errRes = ""
  var bpaTobpa = manager.getReferenceTypeHome().getReferenceTypeByID("BPACopyTrans_ContractToContract");
  var bpaOwn = node.getReferences(bpaTobpa).toArray();
  if (bpaOwn.length > 0) {
    var bpaRef = bpaOwn[0].getTarget();
    var bpaRefID = bpaRef.getID();
    var bpaOwnID = node.getID();
    if (bpaRefID == bpaOwnID) {
      errRes = "Added Target BPA Reference is same as the Source BPA \n"
    }
  }
  return errRes;
}
//Entered region by user is valid or not 
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
          [calcCFASCodes, calcCFASDupList] = getTargetCFASZoomData(regionName, refItem, childOrgs, consignOrgsList, calcCFASCodes, calcCFASDupList);
          for (var k = 0; k < regionDCList.size(); k++) {
            if (!calcCFASCodes.contains(regionDCList.get(k)))
              activeCounter++;
          }
          if (activeCounter == 0) {
            activeError = "\nAt least one Active Region / CFAS Company code will not be present on the Contract Line - " + item.getID() + " after copying the selected regions.\n";
          }
          error += validateDupZoom(calcCFASDupList, refItem, item, manager);        
        } else {
          //nothing
        }
      }
    }
  });
  return activeError + error;
}

function getTargetCFASZoomData(regionToMove, refItem, childOrgs, consignOrgsList, calcCFASCodes, calcCFASDupList) {
  var material = refItem.getValue("Material_Item_Type").getID();
  var entityObj = manager.getEntityHome().getEntityByID("BPA_Region_DC_Hierarchy");
  var CFASList = entityObj.getValue("BPA_DC_Region_CFAS_Code").getSimpleValue();
  var CFASList = JSON.parse(CFASList);
  var reg = "";
  var zip = null;
  var state = null;
  log.info("material:" + material)
  if (material == "Minor Material" || material == "Cable") {
    childOrgs.forEach(function(child) {
      var childOrgStatus = child.getValue("Item_Status_WRLN").getID();
      var childOrgCode = child.getValue("Organization_Code").getID();
      var childConsignInd = child.getValue("Consignment").getID();
      if (childOrgCode == regionToMove) {
        if (childOrgStatus == "Active S" && consignOrgsList.contains(regionToMove))
          reg = regionToMove + ";" + childOrgStatus + ";" + childConsignInd;
        else if (childOrgStatus == "Active S" && !consignOrgsList.contains(regionToMove)) {
          childConsignInd = 2;
          reg = regionToMove + ";" + childOrgStatus + ";" + childConsignInd;
        } else(childOrgStatus == "Active NS")
        reg = regionToMove + ";" + childOrgStatus + ";" + childConsignInd;
      }
    });
  } else {
    var consignInd = 2;
    var status = refItem.getValue("Item_Status_WRLN").getID();
    reg = regionToMove + ";" + status + ";" + consignInd;
  }
  for (var j = 0; j < CFASList.length; j++) {
    for (key in CFASList[j]) {
      if (reg == key) {
        var cfasList = CFASList[j][key];
        cfasList.forEach(function(code) {
          log.info("code: " + code)
          calcCFASCodes.add(code);
          if (code.includes(";")) {
            var codeSplit = code.split(";");
            calcCFASDupList.add(codeSplit[0] + zip + codeSplit[1]);
          } else
            calcCFASDupList.add(code + zip + state);
        });
      }
    }
  }
  return [calcCFASCodes, calcCFASDupList];
}

function validateDupZoom(calcCFASList, refItem, node, step) {
  var citemMap = new java.util.HashMap();
  var dupMap = new java.util.HashMap();
  var errorMsg = "";
  citemMap = bpaCloneValid.getRefCICFASCompCodes(node, refItem);
  for (var s = 0; s < calcCFASList.size(); s++) {
    bpaCloneValid.checkDuplicateCFASDataAcrossCI(citemMap, dupMap, calcCFASList.get(s)); // Check duplicate CFAS throughout the system							
  }
  var ebsFlag = node.getValue("BPA_Processed_In_EBS").getID();
  if (bpaCloneValid.generateErrorMessage(dupMap, ebsFlag, step))
    errorMsg = node.getID() + " Validations: " + errorMsg + bpaCloneValid.generateErrorMessage(dupMap, ebsFlag, step);
  return errorMsg;
}

function checkTargetBpaOinlist(node, manager) {
  var bpaChildren = node.getChildren().toArray();
  var tarBpA = getBPARef(node);
  var tarBpaChildren = tarBpA.getChildren().toArray();
  var refOINs = new java.util.ArrayList();
  var sourceCombo = new java.util.ArrayList();
  var count = 0;
  var validError = "";
  bpaChildren.forEach(function(item) {
    var regiontoMove = item.getValue("CI_Region_Distribution_Center_temp").getSimpleValue();
    if (regiontoMove) {
      var oin = item.getValue("Oracle_Item_Num").getSimpleValue();
      var comboItem = item.getID() + ":" + oin.trim();
      sourceCombo.add(comboItem);
    }
  });
  tarBpaChildren.forEach(function(targetItem) {
    var refOin = targetItem.getValue("Oracle_Item_Num").getSimpleValue();
    refOINs.add(refOin);
  });
  sourceCombo.forEach(function(combo) {
    var ci = combo.split(":");
    if (refOINs.contains(ci[1].trim())) {
      validError = validError + ci[0] + "(" + ci[1] + ")" + " :This CI with OIN is already in Referenced CI's List . \n"
    }
  });
  return validError
}

function getBPARef(node) {
  var bpaRef = ""
  var bpaTobpa = manager.getReferenceTypeHome().getReferenceTypeByID("BPACopyTrans_ContractToContract");
  var bpaOwn = node.getReferences(bpaTobpa).toArray();
  if (bpaOwn.length > 0) {
    bpaRef = bpaOwn[0].getTarget();
  }
  return bpaRef
}

function atleastOneTempRegionAdded(node, manager) {
  var error = "";
  count = 0;
  var enterRegionList = [];
  var bpaChildren = node.getChildren().toArray();
  bpaChildren.forEach(function(item) {
    var regiontoMove = item.getValue("CI_Region_Distribution_Center_temp").getSimpleValue();
    if (regiontoMove) {
      count = count + 1;
    }
  })
  if (count == 0) {
    error = "Please Provide Atleast one REGION TO COPY to proceed.\n"
  }
  return error
}
// Validate CI Status & Ite Ref status only for Source CIs where Region_Temp has value (If action = Copy)
function nodeChildMandVal(node) {
  var errorCheck = ""
  var bpaNodeChildren = node.getChildren().toArray();
  bpaNodeChildren.forEach(function(nodeCI) {
    var regiontoMove = nodeCI.getValue("CI_Region_Distribution_Center_temp").getSimpleValue();
    if (regiontoMove) {
		
      errorCheck = errorCheck + ciStatusCheck(nodeCI);
	  
    }
  })
  
  return errorCheck
}

function ciStatusCheck(ci) {
  var validError = ""
  if (ci.getValue("ContractItem_Status").getID() == "CLOSED") {
    validError = ci.getID() + ": Status is closed ,hence cannot proceed \n"
  }
  return validError
}

function legacySourceCheck(node) {
  var legacyError = ""
  var legacySource = node.getValue("Legacy_Source").getID();
  if (legacySource && (legacySource == "RTL")) {
    legacyError = "Target Contract is not Wireline , please make correct selection.\n"
  }
  return legacyError
}

function checkCancelledBPA(node) {
  var folderError = ""
  if (node.getParent().getID() == "CancelledProducts") {
    folderError = node.getID() + " :Target Contract is a cancelled BPA , Please make proper selection.\n "
  }
  return folderError
}

function bpaNumberCheck(node) {
  var errorRes = "";
  var bpaNumber = node.getValue("Oracle_Contract_Num").getSimpleValue();
  if (bpaNumber == null || bpaNumber == "") {
    errorRes = errorRes + "\n Target Contract's Blanket Purchase Agreement Number is null.\n";
  }
  return errorRes;
}
//Issue # 7 : copy validation BC : chk the applicable Source CI's refIte's LOB == WRLN
function nodeRefItemCheck(node) {
  var errorRefCheck = ""
  var bpaNodeChildren = node.getChildren().toArray();
  bpaNodeChildren.forEach(function(nodeCI) {
    var regiontoMove = nodeCI.getValue("CI_Region_Distribution_Center_temp").getSimpleValue();
    if (regiontoMove) {
      var ciToItem = manager.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
      var item = nodeCI.getReferences(ciToItem).toArray();
      if (item.length > 0) {
        var itemTarget = item[0].getTarget();
        var lobType = itemTarget.getValue("Line_Of_Business").getID();
        if (lobType != "WRLN") {
          errorRefCheck = errorRefCheck + "The Contract-Item to Item reference for the corresponsding CI: " + nodeCI.getID() + " is not Wireline ,hence cannot proceed \n"
        }
      }
    }
  })
  return errorRefCheck
}

function valiSourceCI(node){
	var errorRefCheck = ""
	var bpaNodeChildren = node.getChildren().toArray();
  bpaNodeChildren.forEach(function(nodeCI) {
    var regiontoMove = nodeCI.getValue("CI_Region_Distribution_Center_temp").getSimpleValue();
    if (regiontoMove) {
		errorRefCheck = errorRefCheck + bpaCloneValid.validateContractItem(nodeCI, manager,contractItemReference,bpaLib)
	}
  })
  return errorRefCheck
}
 

function checkChildInbpaWorkflow(node){
	var error = ""
	if(bpaCloneValid.getContractItemIDsinBPAWkfCopy(node)){
    error = error + "\n The following Children Contract Items: " + bpaCloneValid.getContractItemIDsinBPAWkfCopy(node) + " are in BPA Workflow. Please finish BPA workflow for Contract Items.  \n";
	}
	return error ;
}
}