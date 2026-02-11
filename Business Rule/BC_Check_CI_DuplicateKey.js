/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Check_CI_DuplicateKey",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "Check CI Duplicate Key",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,issue,query) {
var objectType=null;
 var querySpecification = null;
 var c = com.stibo.query.condition.Conditions;
 var queryResult = null; 
var oracleItemNo=null;
var bpaNo=null;
var parent=null;
var children=null;
var error=false;

objectType= node.getObjectType().getID();

if(objectType=="Contract_Item")
{
  oracleItemNo = node.getValue("Oracle_Item_Num").getSimpleValue();
  //bpaNo=node.getValue("Oracle_Contract_Num").getSimpleValue();
   
  if(oracleItemNo)
  {
     parent=node.getParent();
	 children= parent.getChildren();
	 for (var i = 0; i < children.size(); i++)
	 {
	    var child= children.get(i);
		if(node.getID()!= child.getID())
		{
		   var itemNo=child.getValue("Oracle_Item_Num").getSimpleValue();
		   if(oracleItemNo.equals(itemNo))
		   {
		     issue.addWarning("Same MST item is already linked with another Contract item under same Header. Please link different MST Item. ");
     	     error=true;
			 break;
		   }
		}
	 }
	 
  }
// Changes made for STIBO-1555
var leChildren = node.getChildren();
if (leChildren.size() > 0) {
	for (var i = 0; i < leChildren.size(); i++) {
		var childCILE = leChildren.get(i);
		log.info("childCILE " + childCILE.getID());
		var leObjectType = childCILE.getObjectType().getID();
		if(leObjectType == 'LE_Contract_Item_Child')
		{
			checkLEDuplicateKey(childCILE);
		}			
	}
}						

}
// Changes made for STIBO-1555
function checkLEDuplicateKey(node)
{
   var Le_Name_PID = node.getValue("Le_Name_PID").getSimpleValue();
   var Le_Non_PID = node.getValue("LE_Name").getSimpleValue();
     parent=node.getParent();
	 children= parent.getChildren();
	  for (var i = 0; i < children.size(); i++)
	 {
	     var child= children.get(i);
		 if(node.getID()!= child.getID())
		 {
		   if(Le_Name_PID && Le_Name_PID!="" )
		   {
		    
		      var tempNamePID=child.getValue("Le_Name_PID").getSimpleValue();
			  if(Le_Name_PID.equals(tempNamePID))
			  {
			     issue.addWarning("Same MST item is already linked with another Local Explosion item under same Contract Item . Please link different MST Item. ");
     	          error=true;
			      break;
			  }
		   }else if(Le_Non_PID)
		   {
		  
		     var tempNameNonPID=child.getValue("LE_Name").getSimpleValue();
			 if(Le_Non_PID.equals(tempNameNonPID))
			 {
			      issue.addWarning(" Another Local Explosion item with "+Le_Non_PID+" exist under same Contract Item. Please use different Local Explosion Name - Non PID");
     	          error=true;
			      break;
			 }
		   }
		 }
	 }
}
 if(error)
  {
    return issue;
  }else{
    return true;
  }




}