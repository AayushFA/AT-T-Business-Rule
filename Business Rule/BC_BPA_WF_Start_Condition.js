/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_BPA_WF_Start_Condition",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "BPA WorkFlow Start Condition",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item", "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
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
    "contract" : "ObjectTypeBindContract",
    "alias" : "header",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "BPA",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "ci",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "Contract_Item",
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "issue",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ProductBindContract",
    "alias" : "cancelled",
    "parameterClass" : "com.stibo.core.domain.impl.FrontProductImpl",
    "value" : "CancelledProducts",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ug_wrlnEng",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_WRLN_Engineering",
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "manager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "CI_ItemRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ContractItem_Item",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ug_wrlnSourcing",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_WRLN_Sourcing",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ug_dg",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_DG",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ug_rtlPlanner",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_RTL_Planner",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ug_entBuyer",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_ENT_Buyer",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "stiboUser",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "Stibo",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ug_rtlBuyer",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_RTL_Buyer",
    "description" : null
  }, {
    "contract" : "UserGroupBindContract",
    "alias" : "ug_dtv",
    "parameterClass" : "com.stibo.core.domain.impl.GroupImpl",
    "value" : "UG_DTV_Sourcing",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,header,ci,issue,cancelled,ug_wrlnEng,manager,CI_ItemRef,ug_wrlnSourcing,ug_dg,ug_rtlPlanner,ug_entBuyer,stiboUser,ug_rtlBuyer,ug_dtv) {
var errorFlag = false;
var curUser = manager.getCurrentUser();
var wrlnEngUser = ug_wrlnEng.isMember(curUser) && !ug_wrlnSourcing.isMember(curUser); //STIBO-2529
var isPrivileged = checkUser(curUser);

if (node.getObjectType().getID() == header.getID()) {

    if (wrlnEngUser) {
        issue.addError("Wireline Engineer does not have access to edit BPA header. Please contact sourcing manager");
        errorFlag = true;
    }
    if (!isPrivileged) {
        issue.addError("User is not privileged to start the BPA Workflow.");
        errorFlag = true;
    }

    if (node.getParent().getID() == cancelled.getID()) {
        issue.addError("BPA has been cancelled before and can not be initiated in Workflow.");
        errorFlag = true;
    }

    if ((node.getValue("BPA_Status").getSimpleValue() == "Closed") || (node.getValue("BPA_Status").getSimpleValue() == "Suspend")) {
        issue.addError("BPA Header status is not Open and can not be initiated in Workflow.");
        errorFlag = true;
    }

    if (node.isInWorkflow("BPA_Clone")) {
        issue.addError("BPA is in Clone Workflow, can not be initiated in BPA Workflow.");
        errorFlag = true;
    }
    // STIBO- 3771 DTV
    if (ug_dtv.isMember(curUser) ) {
         var legacySourceENT = node.getValue("Legacy_Source_ENT_Temp").getID();  
         var legacySource = node.getValue("Legacy_Source").getID();   	   
    	    if((legacySourceENT && legacySourceENT != "DTV") || (legacySource && legacySource != "DTV")){
    	    	 issue.addError("DTV Users do not have the privilege to work on the chosen Business Source apart from DTV.");
           errorFlag = true;
    	    }       
    }
    
    //ABC Workflow check---- part of abc workflow development
    var parent = node.getParent();
    var graParID = parent.getParent().getID();
    if (graParID == "ATT_ABC_Root"|| node.isInWorkflow("ABC_Workflow")){
        issue.addError("BPA is valid for ABC Workflow, can not be initiated in BPA Workflow.");
        errorFlag = true;
 }
    

} else if (node.getObjectType().getID() == ci.getID()) {
    // STIBO-1432 PRod support July release
    var itemRef = node.queryReferences(CI_ItemRef).asList(1);
    var ntwBomType = "";

    if (itemRef) {
        ntwBomType = itemRef.get(0).getTarget().getValue("NTW_BOM_Type").getID();
    }

    if (wrlnEngUser && ntwBomType != "LOCAL EXPLOSION") {
        issue.addError("  The item you are attempting to add/update is not defined as a Local Explosion. Please review item set and/or work with the sourcing manger in order to add to BPA (Blanket Purchase Agreement).");
        errorFlag = true;
    }
    // STIBO-1432 PRod support July release
    if (node.getParent().getID() == cancelled.getID() || node.getParent().getParent().getID() == cancelled.getID()) {
        issue.addError("This Contract Item has been cancelled before and can not be initiated in Workflow.");
        errorFlag = true;
    }
    var parentNode = node.getParent();

    if (parentNode.isInWorkflow("BPA_Clone")) {
        issue.addError("This Contract Item Parent is present in BPA Clone Workflow, can not be initiated in BPA Workflow.");
        errorFlag = true;
    }

    if ((parentNode.getValue("BPA_Status").getSimpleValue() == "Closed") || (parentNode.getValue("BPA_Status").getSimpleValue() == "Suspend")) {
        issue.addError("BPA header status is not open and can not be initiated in Workflow.");
        errorFlag = true;
    }

}

if (errorFlag == true) {
    return issue;
} else {
    return true;
}

function checkUser(curUser) {
    if (ug_dg.isMember(curUser) || ug_wrlnSourcing.isMember(curUser) || ug_rtlPlanner.isMember(curUser) || ug_rtlBuyer.isMember(curUser) || ug_entBuyer.isMember(curUser) || stiboUser.isMember(curUser) || ug_wrlnEng.isMember(curUser) ||ug_dtv.isMember(curUser)) {
        return true;
    } else {
        return false
    }
}
}