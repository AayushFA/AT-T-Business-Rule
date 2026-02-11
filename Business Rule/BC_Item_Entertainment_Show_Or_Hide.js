/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Item_Entertainment_Show_Or_Hide",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_Web_UI_Conditions" ],
  "name" : "Entertainment UI Show Or Hide",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Generate_Item_Number",
    "libraryAlias" : "itmGenLib"
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
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "HiddenContextBind",
    "alias" : "hide",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,stepManager,hide,itmGenLib) {
/*
 * author: aw240u(cognizant), John
 */

var lob = node.getValue("Line_Of_Business").getID();
var attributeHome = stepManager.getAttributeHome();
var itemClass = node.getValue("Item_Class").getID();
var userItemType = node.getValue("User_Item_Type_ENT").getID();
//if (lob == "ENT" && !(itemClass == "ATT DirecTV" || (itemClass == "BAU Wireline" && userItemType == "UVERSE"))) {

if(lob == "ENT"){		
	if(itemClass !="ATT DirecTV"){		
		//if(userItemType == "UVERSE"){ -CTXSCM-26004 
			if(itemClass != "BAU Broadband" && itemClass != "BAU Wireline" ){								
				hide.setHidden(node, attributeHome.getAttributeByID("ENT_Companion_Item_Type"));													
			}
	//	}
	}	
}

var parLob = node.getValue("Line_Of_Business").getID();
var itemClassId = node.getValue("Item_Class").getID();
itemClassId = itmGenLib.replaceSpaceWithUnderscores(String(itemClassId));
var attrHome = stepManager.getAttributeHome();
var userEnteredItemValue = node.getValue("User_Defined_Item_Num").getSimpleValue();
if ((parLob == "ENT") && (itemClassId != "BAU_Wireline")) {
   var result = itmGenLib.getPrfixBasedOnItemClass(stepManager, itemClassId);
   var sequenceId = result.sequenceName;
   if (sequenceId.trim() == "User Defined") {
      //do nothing
   } else {
      hide.setHidden(node, attrHome.getAttributeByID("User_Defined_Item_Num"));
   }
}
return true;
}