/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Generate_Item_Number",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Derivation_Libraries" ],
  "name" : "Generate Item Number Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ ]
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

function getPrfixBasedOnItemClass(step, itemClassId) {
  var entityHome = step.getEntityHome().getEntityByID(itemClassId);
  var prefixValue = entityHome.getValue("Item_Prefix").getSimpleValue();
  var sequenceName = entityHome.getValue("Item_Num_Sequence").getSimpleValue();
  return {
    prefix: prefixValue,
    sequenceName: sequenceName
  };
}

function generateItemNumberWithRetry(node, step) {
  var returnMessage = "";
  var itemNumber = node.getValue("Item_Num").getSimpleValue();
  var itemClassId = node.getValue("Item_Class").getID();
  if (itemNumber) {
    returnMessage = "Item Number is already populated for this object.";
    throw returnMessage;
  }
  if (!itemClassId) {
    returnMessage = "Item Class is Mandatory for Item Number Generation";
    throw returnMessage;
  }
  itemClassId = replaceSpaceWithUnderscores(String(itemClassId));
  var result = getPrfixBasedOnItemClass(step, itemClassId);
  var prefix = result.prefix;
  var sequenceId = result.sequenceName;
  if (!prefix) {
    returnMessage = returnMessage + "Prefix is null ";
    throw returnMessage;
  }
  if (!sequenceId) {
    returnMessage = returnMessage + "Sequence Id is null ";
    throw returnMessage;
  }
  if (sequenceId == "HECI") {
    var itemNumberBase = node.getValue("HECI").getSimpleValue();
    if (itemNumberBase === null || itemNumberBase === "") {
      returnMessage = "HECI is mandatory";
      throw returnMessage;
    }
    var key = "Item.Core.Key"
    if (!searchNodewithExistingKey(step, key, itemNumberBase)) {
      node.getValue("Item_Num_Core").setSimpleValue(itemNumberBase);
      var generatedItemNumber = prefix + itemNumberBase;
      key = "Item.Key"
      if (!searchNodewithExistingKey(step, key, generatedItemNumber)) {
        node.getValue("Item_Num").setSimpleValue(generatedItemNumber);       
        return;
      } else {
        returnMessage = "Unable to populate Item_Num.";
      }
    } else {
      returnMessage = "This HECI Code:" + itemNumberBase + " exists on another Item";
    }
  } else if(hardWiredItemNumberExceptionCheck(node)){
	   var itemNumberBase = node.getValue("HECI").getSimpleValue();
       var key = "Item.Core.Key"
    if (!searchNodewithExistingKey(step, key, itemNumberBase)) {
      node.getValue("Item_Num_Core").setSimpleValue(itemNumberBase);
      var generatedItemNumber = prefix + itemNumberBase;
      key = "Item.Key"
      if (!searchNodewithExistingKey(step, key, generatedItemNumber)) {
        node.getValue("Item_Num").setSimpleValue(generatedItemNumber);       
        return;
      } else {
        returnMessage = "Unable to populate Item_Num.";
      }
    } else {
      returnMessage = "This HECI Code:" + itemNumberBase + " exists on another Item";
    }
	  }else {
    var retryCount = 0;
    while (retryCount <= numberOfRetryToDo(step)) {
      var businessAction = step.getBusinessRuleHome().getBusinessActionByID(sequenceId.trim());
      // log.info("businessAction:"+businessAction);
      //log.info("sequenceId:"+sequenceId.trim());
      businessAction.execute(node);
      var itemNumberBase = node.getValue("Item_Num_Base").getSimpleValue();
      if (!itemNumberBase) {
        returnMessage = returnMessage + "Item Number Base is null ";
        break;
      }
      var key1 = "Item.Core.Key"
      if (retryCount == numberOfRetryToDo(step)) {
        returnMessage = returnMessage + "max tries done,cannot proceed: " + retryCount;
        break;
      }
      if (!searchNodewithExistingKey(step, key1, itemNumberBase)) {
        node.getValue("Item_Num_Core").setSimpleValue(itemNumberBase);
        var generatedItemNumber = prefix + itemNumberBase;
        var key = "Item.Key"
        if (!searchNodewithExistingKey(step, key, generatedItemNumber)) {
          node.getValue("Item_Num").setSimpleValue(generatedItemNumber);        
          break;
        } else {
          retryCount++
        }
      } else {
        retryCount++
      }
    }
  }
  if (returnMessage) {
    throw returnMessage;
  }
}

function retailCompanionSKUitemNumberGeneration(node, step) {
  if (node.getChildren().toArray().length > 0) {
    var child = node.getChildren();
    child.forEach(function(comSku) {
      var objectType = comSku.getObjectType().getID();
      if (objectType == "Companion_SKU") {
        if (comSku.getValue("Item_Num").getSimpleValue() == null || comSku.getValue("Item_Num").getSimpleValue() == "") {
          var parLob = comSku.getParent().getValue("Line_Of_Business").getID();
          var compType = comSku.getValue("Companion_Item_Type").getSimpleValue();
          compType = compType.split("-")[0];
          if (parLob == "RTL") {
            var parItemNo = comSku.getParent().getValue("Item_Num").getSimpleValue();
            var compItemNo = parItemNo.toString().split("\\.")[1];
            var initial = parItemNo.toString().split("\\.")[0];
            compItemNo = compItemNo.slice(1);
            var newCompItemNo = null;
           if (compType.trim().length() == 1) {
              newCompItemNo = initial.trim() + "." + compType.trim() + compItemNo;
              } else if (compType.trim().length() == 2 || compType.trim().length() == 3) {
            	if (compType.trim() == "LDU") {
                newCompItemNo = initial.trim() + "." + returnInitials(comSku, step) + compItemNo.trim() + "LDU";
              }
              if (compType.trim() == "DEP") {
                var compItemNo = parItemNo.toString().split("\\.")[1];
                newCompItemNo = initial.trim() + "." + returnInitials(comSku, step) + compItemNo.trim();
              }
              if (compType.trim() == "AR") {
                newCompItemNo = initial.trim() + "." + returnInitials(comSku, step) + compItemNo.trim() + "AR";
              }
            }
             else if (compType.trim().startsWith("FG")) {
             compType = compType.trim().slice(-3);
              newCompItemNo = initial.trim() + "." + returnInitials(comSku, step) + compItemNo.trim() + compType;
            }
             else if (compType.trim().startsWith("WIP")) {
              compType = compType.trim().slice(-3);
              newCompItemNo = initial.trim() + "." + returnInitials(comSku, step) + compItemNo.trim() + compType;
            } else {
              //extra condition to cover
            }
          }
          comSku.getValue("Item_Num").setSimpleValue(newCompItemNo);
          var compTypeName = comSku.getValue("Companion_Item_Type").getSimpleValue();        
        }
      }
    })
  }
}


function runAssignItemNumGen(assignBR, node) {
  assignBR.execute(node);
}

function replaceFirstCharacterWithR(str) {
  var str = str + ""
  str= str.slice(4);
  if (str.length > 0) {
  	return 'RTL.R' + str.slice(1);
  }
}

function searchNodewithExistingKey(step, key, upComingItemNumber) {
  var nodeSearch = step.getNodeHome().getObjectByKey(key, upComingItemNumber);
  if (nodeSearch) {
    return true
  } else {
    return false
  }
}

function retailEntertainmentItemNumberGeneration(node, step) {
  var message = "";
  var parLob = node.getValue("Line_Of_Business").getID();
  var itemClassId = node.getValue("Item_Class").getID();
  itemClassId = replaceSpaceWithUnderscores(String(itemClassId));
  var result = getPrfixBasedOnItemClass(step, itemClassId);
  var sequenceName = result.sequenceName;
  var userEnteredItemValue = node.getValue("User_Defined_Item_Num").getSimpleValue();
  if (parLob == "RTL" || parLob == "ENT") {
    if (userEnteredItemValue&&(sequenceName=="User Defined" || itemClassId=="BAU_Wireline")) {
      var validResponse = checkAndSetEnteredValueItemNumber(node, step);
      if (validResponse) {
      	message = message + validResponse
      }
    } else {
      var result = getPrfixBasedOnItemClass(step, itemClassId);
      var sequenceId = result.sequenceName;
      if (sequenceId.trim() == "User Defined" && !userEnteredItemValue) {
        message = message + "Please Provide valid User Defined Item Num \n";
      } else {
        try {
          generateItemNumberWithRetry(node, step);
        } catch (e) {
          message = message + e
        }
      }
    }
    if (message) {
      throw message;
    }
  }
}


function checkAndSetEnteredValueItemNumber(node, step) {
  var message = "";
  var userEnteredItemValue = node.getValue("User_Defined_Item_Num").getSimpleValue();
  if (userEnteredItemValue) {
    var itemClassId = node.getValue("Item_Class").getID();
    itemClassId = replaceSpaceWithUnderscores(String(itemClassId));
    var result = getPrfixBasedOnItemClass(step, itemClassId);
    var prefix = result.prefix;
    if (prefix) {
      var generateItemNumber = prefix + userEnteredItemValue;
      if (!searchNodewithExistingKey(step, "Item.Key", generateItemNumber)) {
        node.getValue("Item_Num").setSimpleValue(generateItemNumber);      
      } else {
        message = message + node.getID() + " :Please choose a different value for User Defined Item Num; this Item Number already exists. \n";
       }
      if (!searchNodewithExistingKey(step, "Item.Core.Key", userEnteredItemValue)) {
        node.getValue("Item_Num_Core").setSimpleValue(userEnteredItemValue);
      } else {
        message = message + node.getID() + " :Please choose a different value for User Defined Item Num; this Item Number already exists. \n";
      }
    }
  }
  return message
}


function returnInitials(node, step) {
  var keyValue = "";
  var entityObj = step.getEntityHome().getEntityByID("CompanionSKU_Hierarchy");
  var consignInvalidCFASList = entityObj.getValue("CompSKU_itemNo_Initials").getSimpleValue();
  consignInvalidCFASList = JSON.parse(consignInvalidCFASList);
  var parLob = node.getParent().getValue("Line_Of_Business").getID();
  var compType = node.getValue("Companion_Item_Type").getSimpleValue();
  compType = compType.split("-")[0].trim();
  for (var j = 0; j < consignInvalidCFASList.length; j++) {
    for (key in consignInvalidCFASList[j]) {
      if (
        (compType == "LDU" && key == "LDU") ||
        (compType == "DEP" && key == "DEP") ||
        (compType == "AR" && key == "AR") ||
        (compType.startsWith("FG") && key == "FG") ||
        (compType.startsWith("WIP") && key == "WIP")
      ) {
        keyValue = consignInvalidCFASList[j][key];
        break;
      }
    }
    if (keyValue != "") {
      break;
    }
  }
  return keyValue
}

function entertainmentCompanionSKUitemNumberGeneration(node, step) {
  var lob = node.getValue("Line_Of_Business").getSimpleValue();
  if (lob == "Entertainment") {
    if (node.getChildren().toArray().length > 0) {
      var child = node.getChildren();
      child.forEach(function(compSKU) {
        var objectType = compSKU.getObjectType().getID();
        if (objectType == "Companion_SKU") {
          if (compSKU.getValue("Item_Num").getSimpleValue() == null || compSKU.getValue("Item_Num").getSimpleValue() == "") {
            var parent = compSKU.getParent();
            var parentItemClass = parent.getValue("Item_Class").getSimpleValue();
            var itemNumberBase = parent.getValue("Item_Num").getSimpleValue();
            if (parentItemClass == "BAU Broadband") {
              var newItemNumberBase = replaceFirstCharacterWithR(itemNumberBase);
              if (compSKU.getValue("Item_Num").getSimpleValue() == null || compSKU.getValue("Item_Num").getSimpleValue() == "") {
               compSKU.getValue("Item_Num").setSimpleValue(newItemNumberBase);              
              }
            } else {
              var newItemNumberBase = itemNumberBase + "-R";
              if (compSKU.getValue("Item_Num").getSimpleValue() == null || compSKU.getValue("Item_Num").getSimpleValue() == "") {
                compSKU.getValue("Item_Num").setSimpleValue(newItemNumberBase);              
              }
            }
          }
        }
      })
    }
  }
}

function childOrgItemNumberGeneration(node, step) {
	
  if (node.getChildren().toArray().length > 0) {
    var child = node.getChildren();
    var parentItemNumber = node.getValue("Item_Num").getSimpleValue();   
    child.forEach(function(child) {
      var objectType = child.getObjectType().getID();
      if (objectType == "Child_Org_Item") {      	 
        child.getValue("Item_Num").setSimpleValue(parentItemNumber);     
      } else if (objectType == "Companion_SKU") {
        var grandChilds = child.getChildren();
        var coNewItemNum = child.getValue("Item_Num").getSimpleValue();
        grandChilds.forEach(function(grandChild) {
          var objectType = grandChild.getObjectType().getID();
          if (objectType == "Child_Org_Item") {
            grandChild.getValue("Item_Num").setSimpleValue(coNewItemNum);        
          }
        })
      }
    })
  }
}

function numberOfRetryToDo(step) {
  var rootNode = step.getEntityHome().getEntityByID("Item_Number_Lookup_Root");
  var retryLimit = rootNode.getValue("Item_Number_Generation_Max_Retry_Limit").getSimpleValue();
  if (!retryLimit) {
    return 3 //minimum added
  } else {
    return retryLimit
  }
}

function getMessageBetweenWords(error, startWord, endWord) {
  var errorMessage = error.toString();
  var startIndex = errorMessage.indexOf(startWord);
  if (startIndex === -1) {
    return null;
  }
  var endStartIndex = startIndex + startWord.length;
  var endIndex = errorMessage.indexOf(endWord, endStartIndex);
  if (endIndex === -1) {
    return null;
  }
  return errorMessage.substring(endStartIndex, endIndex).trim();
  return errorMessage;
}

function setCompanionCrossReference(node, stepManager) {
     node.getValue("Companion_Cross_Reference").setSimpleValue(null);
	var companions = node.queryChildren();
    companions.forEach(function(companionSku) {
    if (companionSku.getObjectType().getID() == "Companion_SKU") {
      var itemNumber = companionSku.getValue("Item_Num").getSimpleValue();
      var suffix = itemNumber.substring(itemNumber.indexOf('.') + 1);
      var crossReference = null;
      var lob = companionSku.getParent().getValue("Line_Of_Business").getID();
      if (lob == "RTL") {
        var companionTypeValues = companionSku.getValue("Companion_Item_Type").getSimpleValue();
        var companionTypeID = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_Companion_Item_Type_Duplicate").getListOfValuesValueByID(companionTypeValues);
        if (companionTypeID) {
       	var companionType = companionTypeID.getValue();
        }
        if (companionType && suffix) {
          if (companionType.startsWith("FG")) { // if comp item type starts with FG or WIP
            var crossReference = "USED_FG|" + suffix;
          } else if (companionType.startsWith("WIP")) {
            var crossReference = "USED_WIP|" + suffix;
          } else {
            var crossReference = companionType + "|" + suffix;
          }
        }
      }
      if (lob == "ENT") {
        var companionType = "REFURB";
        if (companionType && suffix) {
          var crossReference = companionType + "|" + suffix;
        }
      }
      node.getValue("Companion_Cross_Reference").addValue(crossReference);
    }
    return true;
  });
}

function replaceSpaceWithUnderscores(value) {
  return value.trim().replace(/\s+/g, "_");
}


function hardWiredItemNumberExceptionCheck(node){
	var itemClassId = node.getValue("Item_Class").getID();
	var heciAttr = node.getValue("HECI").getSimpleValue();
	if(itemClassId=="Hardwired" && heciAttr){
	return true 
	}else{
	return false 
	}
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.getPrfixBasedOnItemClass = getPrfixBasedOnItemClass
exports.generateItemNumberWithRetry = generateItemNumberWithRetry
exports.retailCompanionSKUitemNumberGeneration = retailCompanionSKUitemNumberGeneration
exports.runAssignItemNumGen = runAssignItemNumGen
exports.replaceFirstCharacterWithR = replaceFirstCharacterWithR
exports.searchNodewithExistingKey = searchNodewithExistingKey
exports.retailEntertainmentItemNumberGeneration = retailEntertainmentItemNumberGeneration
exports.checkAndSetEnteredValueItemNumber = checkAndSetEnteredValueItemNumber
exports.returnInitials = returnInitials
exports.entertainmentCompanionSKUitemNumberGeneration = entertainmentCompanionSKUitemNumberGeneration
exports.childOrgItemNumberGeneration = childOrgItemNumberGeneration
exports.numberOfRetryToDo = numberOfRetryToDo
exports.getMessageBetweenWords = getMessageBetweenWords
exports.setCompanionCrossReference = setCompanionCrossReference
exports.replaceSpaceWithUnderscores = replaceSpaceWithUnderscores
exports.hardWiredItemNumberExceptionCheck = hardWiredItemNumberExceptionCheck