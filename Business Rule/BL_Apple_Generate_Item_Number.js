/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Apple_Generate_Item_Number",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Derivation_Libraries" ],
  "name" : "Apple-Generate Item Number Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Generate_Item_Number",
    "libraryAlias" : "itmGenLib"
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
/*
 * author : aw240u@att.com
 */
function reRunItemNumberGenerationAllTillMaxLimit(step) {
  var retryCount = 0;
  var returnMessage = "";
  while (retryCount <= itmGenLib.numberOfRetryToDo(step)) {
    if (retryCount == itmGenLib.numberOfRetryToDo(step)) {
      returnMessage = returnMessage + "Max tries done,cannot proceed: " + retryCount;
      break;
    }
    var performResult = populateItemNumbersForAll(step);
    if (performResult != true) {
      returnMessage = returnMessage + performResult;
      break;
    }
    if (checkIfSequenceAligned(step)) {
      populateReservedItemNumber(step);
      log.info("checkif SequenceAlignedYes:");
      break;
    } else {
      clearKeysAndAttributeValue(step);
      retryCount++
    }
  }
  if (returnMessage) {
    throw returnMessage;
  }
}

function populateItemNumbersForAll(manager) {
  var condition = com.stibo.query.condition.Conditions;
  var queryHome = manager.getHome(com.stibo.query.home.QueryHome);
  var query = getAllSPIWorkflowTasks(manager, queryHome, condition);
  var listName = [];
  var itmMessageResult = ""
  if (query) {
    query.forEach(function(task) {
      var currentNode = task.getNode();
      listName.push(currentNode.getID());
      return true;
    });
  }
  var ItemNumList = [];
  listName.forEach(function(currNode) {
    var node = manager.getProductHome().getProductByID(currNode);
    try { // Item Number Generation
      itmGenLib.generateItemNumberWithRetry(node, manager);
    } catch (e) {
      itmMessageResult = itmMessageResult + itmGenLib.getMessageBetweenWords(e.toString(), "javax.script.ScriptException:", "in") + "\n";
    }
  })
  if (itmMessageResult.trim()) {
    return itmMessageResult;
  } else {
    return true;
  }
}

function checkIfSequenceAligned(manager) {
  var condition = com.stibo.query.condition.Conditions;
  var queryHome = manager.getHome(com.stibo.query.home.QueryHome);
  var query = getAllSPIWorkflowTasks(manager, queryHome, condition);
  var listName = [];
  if (query) {
    query.forEach(function(task) {
      var currentNode = task.getNode();
      listName.push(currentNode.getID());
      return true;
    });
  }
  var ItemNumList = [];
  listName.forEach(function(currNode) {
    var node = manager.getProductHome().getProductByID(currNode);
    var itemNum = node.getValue("Item_Num").getSimpleValue();
    ItemNumList.push(itemNum.trim())
  })
  if (isMixedSequence(ItemNumList)) {
    log.info("isMixedSequence(ItemNumList)true:" + ItemNumList);
    return true;
  } else {
    log.info("isMixedSequence(ItemNumList)false:" + ItemNumList);
    return false;
  }
}

function getAllSPIWorkflowTasks(manager, queryHome, condition) {
  var condition = com.stibo.query.condition.Conditions;
  var spiWorkflow = manager.getWorkflowHome().getWorkflowByID("SPI_Onboarding");
  var querySpecification = queryHome.queryWorkflowTasks().where(condition.workflow().eq(spiWorkflow));
  return querySpecification.execute();
}

function clearKeysAndAttributeValue(manager) {
  var condition = com.stibo.query.condition.Conditions;
  var queryHome = manager.getHome(com.stibo.query.home.QueryHome);
  var query = getAllSPIWorkflowTasks(manager, queryHome, condition);
  var listName = [];
  if (query) {
    query.forEach(function(task) {
      var currentNode = task.getNode();
      listName.push(currentNode.getID());
      return true;
    });
  }
  listName.forEach(function(eachNode) {
    var eachNode = manager.getProductHome().getProductByID(eachNode);
    manager.getKeyHome().updateUniqueKeyValues2({
      "Item_Num": null
    }, eachNode);
    manager.getKeyHome().updateUniqueKeyValues2({
      "Item_Num_Core": null
    }, eachNode);
    eachNode.getValue("Item_Num_Base").setSimpleValue(null);
  })
}

function isMixedSequence(arr) {
  if (!arr || !arr.length) return false;

  var parts = [];
  for (var i = 0; i < arr.length; i++) {
    parts.push(parseSequenceItem(arr[i]));
  }

  var allNumbers = [];
  var allLetters = [];
  for (var i = 0; i < parts.length; i++) {
    allNumbers.push(parts[i].numberPart);
    allLetters.push(parts[i].letterPart);
  }

  var firstCode = allLetters[0].charCodeAt(0);
  var allLettersSame = true;
  for (var i = 0; i < allLetters.length; i++) {
    if (allLetters[i].charCodeAt(0) !== firstCode) {
      allLettersSame = false;
      break;
    }
  }

  if (allLettersSame) {
    return isValidAlphaNumericSequence(allNumbers);
  }

  return isValidAlphaNumericSequence(allNumbers) && isValidLetterSequence(allLetters);
}

function isValidAlphaNumericSequence(arr) {
  var values = [];
  for (var i = 0; i < arr.length; i++) {
    var str = arr[i];
    var numPart = "";
    var charPart = "";
    for (var j = 0; j < str.length; j++) {
      var ch = str[j];
      if (ch >= '0' && ch <= '9') {
        numPart += ch;
      } else {
        charPart = ch.toUpperCase();
        break;
      }
    }
    if (numPart === "" || charPart === "" || charPart.length !== 1) return false;

    var num = parseInt(numPart, 10);
    var charCode = charPart.charCodeAt(0) - 65; // A=0, B=1, ..., Z=25
    var combined = num * 26 + charCode;
    values.push(combined);
  }

  for (var i = 1; i < values.length; i++) {
    var step = values[1] - values[0];
    if (step <= 0 || values[i] - values[i - 1] !== step) {
      return false;
    }
  }

  return true;
}

function isValidLetterSequence(letters) {
  var codes = [];
  for (var i = 0; i < letters.length; i++) {
    var code = letters[i].toUpperCase().charCodeAt(0);
    var found = false;
    for (var j = 0; j < codes.length; j++) {
      if (codes[j] === code) {
        found = true;
        break;
      }
    }
    if (!found) {
      codes.push(code);
    }
  }

  if (codes.length < 2) return true;

  for (var i = 1; i < codes.length; i++) {
    var step = codes[1] - codes[0];
    if (step <= 0 || codes[i] - codes[i - 1] !== step) {
      return false;
    }
  }

  return true;
}

function parseSequenceItem(item) {
  var str = String(item);
  var dotIndex = str.indexOf(".");
  var firstPart = str.substring(0, dotIndex);
  var secondPart = str.substring(dotIndex + 1);
  return {
    letterPart: firstPart,
    numberPart: secondPart
  };
}

function populateReservedItemNumber(manager) {
  var condition = com.stibo.query.condition.Conditions;
  var queryHome = manager.getHome(com.stibo.query.home.QueryHome);
  var query = getAllSPIWorkflowTasks(manager, queryHome, condition);
  var listName = [];
  var itmMessageResult = ""
  if (query) {
    query.forEach(function(task) {
      var currentNode = task.getNode();
      listName.push(currentNode.getID());
      return true;
    });
  }
  var ItemNumList = [];
  listName.forEach(function(currNode) {
    var currNode = manager.getProductHome().getProductByID(currNode);
    currNode.getValue("Reserved_Item_Num").setSimpleValue(currNode.getValue("Item_Num_Core").getSimpleValue());
  })
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.reRunItemNumberGenerationAllTillMaxLimit = reRunItemNumberGenerationAllTillMaxLimit
exports.populateItemNumbersForAll = populateItemNumbersForAll
exports.checkIfSequenceAligned = checkIfSequenceAligned
exports.getAllSPIWorkflowTasks = getAllSPIWorkflowTasks
exports.clearKeysAndAttributeValue = clearKeysAndAttributeValue
exports.isMixedSequence = isMixedSequence
exports.isValidAlphaNumericSequence = isValidAlphaNumericSequence
exports.isValidLetterSequence = isValidLetterSequence
exports.parseSequenceItem = parseSequenceItem
exports.populateReservedItemNumber = populateReservedItemNumber