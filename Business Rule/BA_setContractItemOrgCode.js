/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_setContractItemOrgCode",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "Set Contract Item OrgCode",
  "description" : "Set Contract Item OrgCode",
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "ATT_BPA_ASL_Library",
    "libraryAlias" : "aslLib"
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
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,logger,aslLib) {
// STIBO-2011 Prod Support August release

var refTypeObj = step.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
var consignChildItems = new java.util.ArrayList();
var orgCodeArrList = new java.util.ArrayList();
var consignChildOrgCodes = new java.util.ArrayList();
var validCI = 'N';

//Set CI consign org codes from consigned child orgs
function init() {
	if(node.getObjectType().getID()=='Contract_Item') {
		var item = aslLib.returnItem(node, refTypeObj);
		var consignOrgCodes = node.getValue('Consign_Org_Code').getValues();
		validCI = aslLib.validCICheck(node);
		if(validCI == 'Y')
		{
			if(item) {
				var consignChildItems = aslLib.returnConsignChildItems(item, step);
					if(consignChildItems) {
						consignChildOrgCodes = aslLib.returnConsignOrgCodes(consignChildItems, step);
						if(consignChildOrgCodes) {
							aslLib.setCIConsignOrgCodes(node,consignChildOrgCodes);
						}
						else if((!consignChildOrgCodes)&&(consignOrgCodes)) {
							aslLib.setCIBlankConsignOrgCodes(node);
						}
					}
					else if(!consignChildItems && (consignOrgCodes)) {
						aslLib.setCIBlankConsignOrgCodes(node);
					}
			}
			else if((!item)&&(consignOrgCodes)) {
				aslLib.setCIBlankConsignOrgCodes(node);
			}
		}
		else {
			//Skip
		}
	}
}

init();

step = node.getManager();
}