/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_SPL_Validation_Library",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Validation_Libraries" ],
  "name" : "SPL Validation Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_SPL_Derivation",
    "libraryAlias" : "splLib"
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
/***
 * @author Madhuri
 */
/*************************** Validatons Functions ***************************/

function validateMandatoryAttribute(node, attributeId, stepManager) {
	var errorMessage = "";
	var attributeValue = node.getValue(attributeId).getSimpleValue();
	var attribute = stepManager.getAttributeHome().getAttributeByID(attributeId);
	if (!attributeValue) {
		errorMessage = attribute.getName() + " is mandatory.\n";
	}
	return errorMessage;
}

function validateDuplicateAttributeValue(node,attributeId,stepManager,queryHome) {
	var errorMessage ="";
     var currentNodeId = node.getID(); 
	var attributeValue = stepManager.getAttributeHome().getAttributeByID(attributeId);
	var currentAttributeValue = node.getValue(attributeId).getSimpleValue();
	if (currentAttributeValue) {
		var condition = com.stibo.query.condition.Conditions;
		var querySpecification = queryHome.queryFor(com.stibo.core.domain.Product).where(condition.valueOf(attributeValue).eq(currentAttributeValue));
		var query = querySpecification.execute();
		var duplicateValueList = new java.util.ArrayList();
		var isDuplicateValue = false;
		query.forEach(
			function(result) {
				duplicateValueList.add(result);
				return true;
			});
		if (duplicateValueList.size() > 0) {
			for (var i = 0; i < duplicateValueList.size(); i++) {
				if (duplicateValueList.get(i).getParent().getObjectType().getID() != "CancelledType" && currentNodeId != duplicateValueList.get(i).getID()) {		
					duplicateItem = duplicateValueList.get(i).getID()				
					isDuplicateValue = true;
					break;
				}
			}
		}
		if(isDuplicateValue == true){		
			     errorMessage = errorMessage + "\n Duplicate value present for attribute " + attributeId + " on item " + duplicateItem								
			}
		}
		return errorMessage;
	}

function validateMandatoryAttributeGroup(node,stepManager,attributeGroup){
	var errorMessage = "";
    var attributesIterator = attributeGroup.getAttributes().iterator();
    while (attributesIterator.hasNext()) {
			var attributeId = attributesIterator.next().getID();
			var attributeValue = node.getValue(attributeId).getSimpleValue();
			if(!attributeValue){
				attributeName = stepManager.getAttributeHome().getAttributeByID(attributeId).getName()
				errorMessage = errorMessage + "\n" + attributeName +" is mandatory"
            }
	}   						
   return errorMessage;
}

function validateCarrierDC(node,stepManager,query){
	var errorMessage = "";
	var itemMap = new java.util.HashMap();
	var duplicateMap = new java.util.HashMap();
	var mfgPartNumber = node.getValue("Mfg_Part_No").getSimpleValue();
	
	var currentNodeCarrierList = splLib.getCurrentCarrierDCData(node);
	itemMap = splLib.getAllCarrierDCData(node,stepManager,query,itemMap);
	
	for (var i = 0; i < currentNodeCarrierList.length; i++) {	
		duplicateMap = splLib.validateDuplicateCarrierDCAcrossSystem(itemMap, currentNodeCarrierList[i], duplicateMap);
	}	
	errorMessage = generateErrorMessage(duplicateMap);		
	    return errorMessage;
    
}

function generateErrorMessage(duplicateMap) {
	var carrierDataString = "";
	var errorMessage = "";
	var itemSet = duplicateMap.keySet();
	var iterator = itemSet.iterator();
	while (iterator.hasNext()) {
		carrierDataString = "";
		var mfgPartNumber = iterator.next();
		var carrierDataList = duplicateMap.get(mfgPartNumber);
		for (var i = 0; i < carrierDataList.size(); i++) {
			var carrierData = carrierDataList.get(i);
			carrierDataString = carrierDataString + carrierData + ",";
		}
		carrierDataString = carrierDataString.substring(0, carrierDataString.length - 1);		
		errorMessage = errorMessage + "Carrier MPN " + carrierDataString + " found for Item " + mfgPartNumber +" \n";
	}
	return errorMessage;
}

function validateAppleAPIData(query){
	var errorMessage = "";
	var errorCounter =0;	
	    query.forEach(function(task) {	    	
	        var currentNode = task.getNode();	        
	        if(currentNode.getValue("SPL_Apple_Pull_Exceptions").getSimpleValue()){	            
	            errorCounter++;	           
	        }
	        return true;
	    });	    
	if(errorCounter > 0)
	  errorMessage = "Batch is not submitted due to one or more Items data not pulled through Apple PDX API. Please Cancel Batch and reload the data file."
return errorMessage;
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.validateMandatoryAttribute = validateMandatoryAttribute
exports.validateDuplicateAttributeValue = validateDuplicateAttributeValue
exports.validateMandatoryAttributeGroup = validateMandatoryAttributeGroup
exports.validateCarrierDC = validateCarrierDC
exports.generateErrorMessage = generateErrorMessage
exports.validateAppleAPIData = validateAppleAPIData