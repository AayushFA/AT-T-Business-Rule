/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_BPAClone_Copy_Move_WF_Validation_Move",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_CT_BusinessCondition" ],
  "name" : "Move Validations",
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
    "libraryId" : "AT&T_BPA_Validation_Library",
    "libraryAlias" : "bpaCloneValid"
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
exports.operation0 = function (node,manager,webui,issue,query,contractItemReference,bpaLib,bpaCloneValid,sslib) {
/**
 * @author: AAYUSH KUMAR MAHATO
 */
var bpaTobpa = manager.getReferenceTypeHome().getReferenceTypeByID("BPACopyTrans_ContractToContract");
var bpaOwn = node.getReferences(bpaTobpa).toArray();
if (bpaOwn.length > 0) {
  var bpaRef = bpaOwn[0].getTarget();
}
if (bpaRef != null) {
  bpaRef.getValue("BPA_Clone_WF_UserAction").setLOVValueByID("Move");
  bpaRef.getValue("BPA_Cloned_From").setSimpleValue(node.getID());
 
  var targetRefCheck = checkIfSameRefAdded(node) + checkCancelledBPA(bpaRef) + bpaNumberCheck(bpaRef) + bpaStatusCheck(bpaRef) + sslib.checkExpDateGreaterThanToday(bpaRef, manager) + bpaCloneValid.isReferenceInBPAWF(bpaRef) + SourceTargetBPAlegacyCheck(node, bpaRef) + bpaCloneValid.bpaClonePostEnrichValHeader(bpaRef, manager, query);;
  var atleastOneFlagCheck = atleastOneFlag(node);
  var checkEnteredOinlist = checkEnteredOinlist(node, manager);
  var nodeChildMandVal = nodeChildMandVal(node);
  var valiSourceCI = valiSourceCI(node);
  var checkChildInbpaWorkflow = checkChildInbpaWorkflow(node);
  var errMsg = checkEnteredOinlist + nodeChildMandVal + valiSourceCI +checkChildInbpaWorkflow ;
  if (targetRefCheck.trim()) {
   return "This action cannot be completed for the following reasons: "+"("+ bpaRef.getID() +")"+ "\n \n" + targetRefCheck;  
    } else if (atleastOneFlagCheck.trim()) {
    return "This action cannot be completed for the following reasons: \n \n" + atleastOneFlagCheck;
  } else if (errMsg.trim()) {
    return "This action cannot be completed for the following reasons: \n \n" + errMsg;
  } else {
    return true
  }
} else {
  return "Please provide Target BPA Reference and proceed";
}

function bpaStatusCheck(node) {
  var errorRes = "";
  var bpaStatus = node.getValue("BPA_Status").getSimpleValue();
  if (bpaStatus == "Closed") {
    errorRes = "The Target Contract " + bpaRef.getID() + ": " + "status is Closed  \n\n";
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
      errRes = errRes + " Added Target BPA Reference is same as the Source BPA\n";
    }
  }
  return errRes;
}

function checkEnteredOinlist(node, manager) {
  var bpaChildren = node.getChildren().toArray();
  var userList = node.getValue("BPA_Partial_Clone_Item_Num_List").getSimpleValue();
  var currOINs = [];
  var flagCurrOINs = []
  var inValidOINs = []
  var refOINs = [];
  var splitList = [];
  var trimSplitList = [];
  var validError = "";
  if (userList) {
    splitList = userList.split("\n");
    trimSplitList = splitList.filter(entry => entry.trim() !== '');
    bpaChildren.forEach(function(item) {
      var oin = item.getValue("Oracle_Item_Num").getSimpleValue();
      currOINs.push(oin)
    });
    //Loop thru trimSplitList for validations - //CHECK AT THE END **
    trimSplitList.forEach(function(l) {
      if (!currOINs.includes(l.trim())) {
        inValidOINs.push(l.trim());
      }
    });
    if (inValidOINs.length > 0) {
      validError = validError + inValidOINs.toString() + " :Entered OIN is not in the Contract Items List . \n\n"
    }
  }
  //check if entered oin list already in target reference
  var bpaTobpa = manager.getReferenceTypeHome().getReferenceTypeByID("BPACopyTrans_ContractToContract");
  var bpaOwn = node.getReferences(bpaTobpa).toArray();
  if (bpaOwn.length > 0) {
    var bpaRef = bpaOwn[0].getTarget();
  }
  if (bpaRef != null) {
    var bpaRefChild = bpaRef.getChildren().toArray()
    bpaRefChild.forEach(function(ci) {
      var refoin = ci.getValue("Oracle_Item_Num").getSimpleValue();
      refOINs.push(refoin)
    });
  };
  bpaChildren.forEach(function(l) {
    var partClnFlag = l.getValue("Partial_Clone_Flag").getSimpleValue();
    if (partClnFlag == "Yes") {
      var flagOin = l.getValue("Oracle_Item_Num").getSimpleValue();
      if (refOINs.includes(flagOin.trim())) {
        flagCurrOINs.push(flagOin.trim())
      }
    }
  });
  if (flagCurrOINs.length > 0) {
    validError = validError + flagCurrOINs.toString() + " :Entered OIN is already in the Target Contract Line Items List.\n \n"
  }
  /*//contract item status check
  bpaChildren.forEach(function(item) {
    var partClnFlag = item.getValue("Partial_Clone_Flag").getSimpleValue();
    if (partClnFlag == "Yes") {
      if (item.getValue("ContractItem_Status").getID() == "CLOSED") {
        validError = validError + item.getID() + " : Status is closed ,please remove it from OIN list and proceed \n"
      }
    }
  });*/
  return validError;
}

function atleastOneFlag(node) {
  var bpaChildren = node.getChildren().toArray();
  var atleastError = ""
  var count = 0;
  //Collect the CI OIN List
  bpaChildren.forEach(function(item) {
    if (item.getValue("Partial_Clone_Flag").getSimpleValue() == "Yes") {
      count = count + 1;
    }
  });
  if (count < 1) {
    atleastError = "Atleast one Contract Item flag should be set to Yes \n"
  }
  return atleastError;
}
// Validate CI Status & Ite Ref status only for Source CIs where Partial_Clone_Flag = "Yes" (If action = move)
function nodeChildMandVal(node) {
  var errorCheck = ""
  var bpaNodeChildren = node.getChildren().toArray();
  bpaNodeChildren.forEach(function(nodeCI) {
    var partCloneflag = nodeCI.getValue("Partial_Clone_Flag").getSimpleValue();
    if (partCloneflag == "Yes") {
      errorCheck = errorCheck + ciStatusCheck(nodeCI);
    }
  })
  return errorCheck
}

function ciStatusCheck(ci) {
  var validError = ""
  if (ci.getValue("ContractItem_Status").getID() == "CLOSED") {
    validError = ci.getID() + ": Status is Closed ,hence cannot proceed \n"
  }
  return validError
}

function checkCancelledBPA(node) {
  var folderError = ""
  if (node.getParent().getID() == "CancelledProducts") {
    folderError = "\n Target Contract " + node.getID() + " is Cancelled, Please select a valid Contract to proceed.\n "
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


function SourceTargetBPAlegacyCheck(node, bpaRef) {
  var souTarError = ""
  var sourceLegacy = node.getValue("Legacy_Source").getID();
  var targetLegacy = bpaRef.getValue("Legacy_Source").getID();
  log.info("sourceLegacy:" + sourceLegacy);
  if ((sourceLegacy == "WRLN" || sourceLegacy == "WRLN_NON") && (targetLegacy == "WRLN" || targetLegacy == "WRLN_NON")) {
    //do nothing
  } else {
    if (sourceLegacy != targetLegacy) {
      souTarError = "Target Contract Business Source is different from the Source Contract. \n"
    }
  }
  return souTarError
}

function valiSourceCI(node){
	var errorRefCheck = ""
	var bpaNodeChildren = node.getChildren().toArray();
  bpaNodeChildren.forEach(function(nodeCI) {
     var partClnFlag = nodeCI.getValue("Partial_Clone_Flag").getSimpleValue();
    if (partClnFlag == "Yes") {
		errorRefCheck = errorRefCheck + bpaCloneValid.validateContractItem(nodeCI, manager,contractItemReference,bpaLib)
		
	}
  })
  return errorRefCheck
}


function checkChildInbpaWorkflow(node){
	var error = ""
	if(bpaCloneValid.getContractItemIDsinBPAWkfMove(node)){
    error = error + "\n The following Children Contract Items: " + bpaCloneValid.getContractItemIDsinBPAWkfMove(node) + " are in BPA Workflow. Please finish BPA workflow for Contract Items.  \n";
	}
	return error ;
}
}