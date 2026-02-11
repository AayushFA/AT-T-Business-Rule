/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_BPA_SmartSheet_Import_Condition",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "Validate BPA Smartsheet for Contract Item Only",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "BPALib"
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
    "alias" : "step",
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
    "contract" : "ObjectTypeBindContract",
    "alias" : "item",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "Item",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ugWrlnEng",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_WRLN_Engineering",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ugWrlnSrc",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_WRLN_Sourcing",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,issue,query,item,ugWrlnEng,ugWrlnSrc,BPALib) {
var querySpecification = null;
var queryResult = null;
var objecTyepe = "Item";
var obj = null;
var Item_status = null;
var c = com.stibo.query.condition.Conditions;
var Item_No_Refrenced_To_CI = step.getAttributeHome().getAttributeByID("Item_Num");
var itemNum = node.getValue("Item_No_Refrenced_To_CI").getSimpleValue();
obj = step.getNodeHome().getObjectByKey("Item.Key", itemNum);

var curUser = step.getCurrentUser();
var wrlnEngUser = ugWrlnEng.isMember(curUser)&& !ugWrlnSrc.isMember(curUser); //STIBO-2529

var flag = true;
if (obj) {
	// STIBO-1432 PRod support July release
	if (wrlnEngUser && obj.getValue("NTW_BOM_Type").getID() != "LOCAL EXPLOSION"){
		issue.addError( "The item you are attempting to add is not defined as a Local Explosion. Please review item set and/or work with the sourcing manger in order to add to BPA (Blanket Purchase Agreement).", node, Item_No_Refrenced_To_CI);
          flag = false;
	}
	// STIBO-1432 PRod support July release
    // STIBO-2335 Prod Support July release
    if (obj.getValue("Line_Of_Business").getID() == "ENT" ||
        obj.getValue("Line_Of_Business").getID() == "WRLN") {
        var mandCheckAttrENT = ["Max_Order_Qty", "Min_Order_Qty", "Non_Process_Flag", "STD_PACKAGING"];
        mandCheckAttrENT.forEach(function(attrID) {
            if (!node.getValue(attrID).getSimpleValue()) {
                issue.addWarning(step.getAttributeHome().getAttributeByID(attrID).getName() + "  is mandatory for Wireline/Entertainment");
                flag = false;
            }
        });
    }
    if (obj.getValue("Line_Of_Business").getID() == "RTL"){
    	BPALib.clearRTLAttributes(node);
    }
    if (obj.getValue("Line_Of_Business").getID() == "ENT") {
        var itemStatus = obj.getValue("Item_Status_ENT").getSimpleValue();
        if (itemStatus) {
            if (itemStatus != "Pre Launch" && itemStatus != "No Buy" && !itemStatus.startsWith("Act")) {
                issue.addWarning("Could not process line-item changes as " + itemNum + " is not in Active* status, please work with Technical SME to change item status and then resubmit or disregard change.");
                return issue;
            } else if (flag == false) {
                return issue;
            } else
                return true;
        } else {
            issue.addWarning("Could not process line-item changes as " + itemNum + " status is blank, please work with Technical SME to change item status and then resubmit or disregard change.");
            return issue;
        }
    } else if (obj.getValue("Line_Of_Business").getID() == "WRLN") {
        var itemStatus = obj.getValue("Item_Status_WRLN").getSimpleValue();
        if (itemStatus) {
            if (itemStatus != "Active S" && itemStatus != "Active NS") {
                issue.addWarning("Could not process line-item changes as " + itemNum + " is not in Active* status, please work with Technical SME to change item status and then resubmit or disregard change.");
                return issue;
            } else if (flag == false) {
                return issue;
            } else
                return true;
        } else {
            issue.addWarning("Could not process line-item changes as " + itemNum + " status is blank, please work with Technical SME to change item status and then resubmit or disregard change.");
            return issue;
        }
    } else if (obj.getValue("Line_Of_Business").getID() == "RTL") {
        var itemStatus = obj.getValue("Item_Status_RTL").getSimpleValue();
        if (itemStatus) {
            if (!itemStatus.startsWith("Act") && itemStatus != "No Buy" && itemStatus != "Pre Launch") {
                issue.addWarning("Could not process line-item changes as " + itemNum + " is not in Active* status, please work with Technical SME to change item status and then resubmit or disregard change.");
                return issue;
            } else
                return true;
        } else {
            issue.addWarning("Could not process line-item changes as " + itemNum + " status is blank, please work with Technical SME to change item status and then resubmit or disregard change.");
            return issue;
        }
    } else {
        return true;
    }
} else {
    issue.addWarning("The chosen item " + itemNum + " does not exist");
    return issue;
}
}