/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_ ContractItem_KeyGeneration",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "BPA Contract Item Key Generation",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item", "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "BPALib"
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,BPALib) {
/**
 * @author - Piyal [CTS] 
 * @author - Reviewed and refactored by Aditya Rudragoudar
 * BPA Contact Item Key Generation
 */

var objectType = node.getObjectType().getID();

if (objectType == 'Contract_Item') {
    updateKeysForCIAndCILEs(node);	
}

if (objectType == 'BPA') {
    node.getChildren().forEach(function(contractItem) {
        updateKeysForCIAndCILEs(contractItem);	
    });
}

function updateKeysForCIAndCILEs(contractItem) {
    var contractItemKey = contractItem.getValue("ContractItem_key").getSimpleValue();
	var oracleItemNumber = contractItem.getValue("Oracle_Item_Num").getSimpleValue();
	var oracleContractNumber = contractItem.getValue("Oracle_Contract_Num").getSimpleValue();
	if (contractItemKey == null && oracleContractNumber != null ) {
		if (oracleItemNumber) {
			//contractItem.getValue("Oracle_Item_Num").setValue(oracleItemNumber);
			//contractItem.getValue("Oracle_Contract_Num").setValue(oracleContractNumber);
			contractItem.getValue("ContractItem_key").setSimpleValue(oracleContractNumber + "_" + oracleItemNumber);
            	log.info("BPA_CI_KG: Updated key for : "+oracleContractNumber+" : "+oracleItemNumber);		
		} 
	}
	// Changes made for STIBO-1555
	var leChildren = contractItem.getChildren();
	if (leChildren.size() > 0) {
		for (var i = 0; i < leChildren.size(); i++) {
			var childCILE = leChildren.get(i);
			var leObjectType = childCILE.getObjectType().getID();
			if (leObjectType == 'LE_Contract_Item_Child') {
				BPALib.leKeyGeneration(childCILE,step);
			}			
		}
	}
}
}