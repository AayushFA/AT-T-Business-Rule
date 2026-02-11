/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_SPL_Assign_Item_Number",
  "type" : "BusinessAction",
  "setupGroups" : [ "Apple_Item_Number_Generation" ],
  "name" : "SPL Assign Item Number",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Generate_Item_Number",
    "libraryAlias" : "itmGenLib"
  }, {
    "libraryId" : "BL_Apple_Generate_Item_Number",
    "libraryAlias" : "appItmGenLib"
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
exports.operation0 = function (node,manager,step,itmGenLib,appItmGenLib) {
/*
 * author : aw240u@att.com
 */
 
appItmGenLib.reRunItemNumberGenerationAllTillMaxLimit(step);
//log.info("check:"+appItmGenLib.isValidLetterSequence(['200X','200Y','200Z']));

 
 
 /*function reRunItemNumberGenerationAllTillMaxLimit(step){
var retryCount = 0;
var returnMessage = "";
  while (retryCount <= itmGenLib.numberOfRetryToDo(step)) {
	  
    if (retryCount == itmGenLib.numberOfRetryToDo(step)) {
      returnMessage = returnMessage + "Max tries done,cannot proceed: " + retryCount;
      break;
	}
	 var performResult = populateItemNumbersForAll(step) ;
	 if(performResult!=true){
		 returnMessage = returnMessage + performResult ;
		 break ;
	 }
	 if (checkIfSequenceAligned(step)) {
    	log.info("checkif SequenceAlignedYes:");
       break;
    } else {
	  clearKeysAndAttributeValue(step);	
      retryCount++
    }
  }
  if (returnMessage) {
    throw returnMessage;
    //log.info("final message:"+returnMessage);
  }
}
 
 
  function populateItemNumbersForAll(manager){
 var condition = com.stibo.query.condition.Conditions;
var queryHome = manager.getHome(com.stibo.query.home.QueryHome);
var query = getAllSPLWorkflowTasks(manager, queryHome, condition);
var listName = [];
var itmMessageResult = ""
if (query) {
  query.forEach(function(task) {
    var currentNode = task.getNode();
    listName.push(currentNode.getID());
    return true;
  });
}
log.info("listName1:" + listName);
var ItemNumList = [];
listName.forEach(function(currNode) {
  var node = manager.getProductHome().getProductByID(currNode);
  //populate item number first time
  try { // Item Number Generation
  	itmGenLib.generateItemNumberWithRetry(node, manager);
      
} catch (e) {
  itmMessageResult = itmMessageResult + itmGenLib.getMessageBetweenWords(e.toString(), "javax.script.ScriptException:", "in") +"/n";
  //itmMessageResult = itmMessageResult + e
}
  
})
if(itmMessageResult.trim()){
	return itmMessageResult;
 }else{
 	//log.info("ran till here");
	 return true;
 }
  }
 
 
 
 
 function checkIfSequenceAligned(manager){
var condition = com.stibo.query.condition.Conditions;
var queryHome = manager.getHome(com.stibo.query.home.QueryHome);
var query = getAllSPLWorkflowTasks(manager, queryHome, condition);
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
	log.info("isMixedSequence(ItemNumList)true:"+ItemNumList);
  return true ;
} else {
	log.info("isMixedSequence(ItemNumList)false:"+ItemNumList);
  return false ;
}
 }

function getAllSPLWorkflowTasks(manager, queryHome, condition) {
  var condition = com.stibo.query.condition.Conditions;
  var spiWorkflow = manager.getWorkflowHome().getWorkflowByID("SPI_Onboarding");
  var querySpecification = queryHome.queryWorkflowTasks().where(condition.workflow().eq(spiWorkflow));
  return querySpecification.execute();
}

function clearKeysAndAttributeValue(manager) {
	log.info("inside clearKeysAndAttributeValue");
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
  log.info("listName ClEARlIST :"+listName);
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
// log.info(isMixedSequence(["A12","A13","A14","A15"]));


function isMixedSequence(arr) {
  if (!arr || !arr.length) {
    return false;
  }

  var parts = [];
  arr.forEach(function(item) {
    parts.push(parseSequenceItem(item));
  });
 //log.info("parts:"+parts);
  var allNumbers = [];
  var allLetters = [];
  parts.forEach(function(p) {
    allNumbers.push(p.numberPart);
    allLetters.push(p.letterPart);
  });
  log.info("allNumbers:"+allNumbers);
  log.info("allLetters:"+allLetters);
  var firstNum = allNumbers[0];
  var allNumsSame = allNumbers.every(function(n) {
    return !(n - firstNum);
  });

  var firstCode = allLetters[0].charCodeAt(0);
  var allLettersSame = allLetters.every(function(l) {
    return !(l.charCodeAt(0) - firstCode);
  });

  if (allNumsSame) {
    // numbers fixed → letters must form a valid alphabetical step
    //log.info("isValidLetterSequenceRESULT:"+isValidLetterSequence(allLetters));
    return isValidLetterSequence(allLetters);
  }
  if (allLettersSame) {
    // letters fixed → numbers must form a valid numeric step
    log.info("isValidNumberSequence(allNumbers):"+isValidNumberSequence(allNumbers));
    return isValidNumberSequence(allNumbers);
  }
  // both vary → each must form a valid sequence
  
  return isValidNumberSequence(allNumbers) &&
         isValidLetterSequence(allLetters);
}


function isValidNumberSequence(numbers) {
  var uniq = [];
  numbers.forEach(function(n) {
    if (uniq.indexOf(n) < 0) {
      uniq.push(n);
    }
  });
  uniq.sort(function(a, b) {
    return a - b;
  });
  if (uniq.length < 2) {
    return true;
  }
  var step = uniq[1] - uniq[0];
  if (step <= 0) {
    return false;
  }
  for (var i = 1; i < uniq.length; i++) {
    if (uniq[i] - uniq[i - 1] - step) {
      return false;
    }
  }
  return true;
}


// * Returns true if the array of letters forms a strictly increasing
 //* alphabetical sequence (step > 0), ignoring order and duplicates.

function isValidLetterSequence(letters) {
  var uniqCodes = [];
  letters.forEach(function(letter) {
    var code = letter.charCodeAt(0);
    if (uniqCodes.indexOf(code) < 0) {
      uniqCodes.push(code);
    }
  });
  uniqCodes.sort(function(a, b) {
    return a - b;
  });
  if (uniqCodes.length < 2) {
    return true;
  }
  var step = uniqCodes[1] - uniqCodes[0];
  if (step <= 0) {
    return false;
  }
  for (var i = 1; i < uniqCodes.length; i++) {
    if (uniqCodes[i] - uniqCodes[i - 1] - step) {
      return false;
    }
  }
  return true;
}


 //* Parses items like "RTL.70536" or "RTL70536" into { letterPart, numberPart }.
 
function parseSequenceItem(item) {
  var parts = item.match(/^([A-Za-z]+)\.?(\d+)$/) || [];
  var letters = parts[1];
  var digits  = parts[2] && +parts[2];
  if (!letters || isNaN(digits)) {
    throw new 'Invalid format: "' + item + '". Expected LETTERS[.][DIGITS].';
  }
  return {
    letterPart: letters,
    numberPart: digits
  };
}
*/









}