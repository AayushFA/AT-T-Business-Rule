/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_Check_CI_Update_InfoMsg",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "Check CI-Update Info Msg",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item" ],
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,issue) {
var objectType = node.getObjectType().getID();
ContractItem_Status = node.getValue("ContractItem_Status").getSimpleValue();
Supplier_Item = node.getValue("Supplier_Item").getSimpleValue();
Lead_Time = node.getValue("Lead_Time").getSimpleValue();
Max_Order_Qty = node.getValue("Max_Order_Qty").getSimpleValue();
Min_Order_Qty = node.getValue("Min_Order_Qty").getSimpleValue();
Price = node.getValue("Price_2").getSimpleValue();
STD_PACKAGING = node.getValue("STD_PACKAGING").getSimpleValue();
Non_Process_Flag = node.getValue("Non_Process_Flag").getSimpleValue();
futEffDt = node.getValue("Future_Effective_Date").getSimpleValue();
var infomsg = "";

if (objectType == 'Contract_Item') {
    var apprManager = step.executeInWorkspace("Approved", function(step) {
        return step;
    });
   
    var apprnode = apprManager.getProductHome().getProductByID(node.getID());
    if (apprnode != null) {

        var apprContractItem_Status = apprnode.getValue("ContractItem_Status").getSimpleValue();
        var apprSupplier_Item = apprnode.getValue("Supplier_Item").getSimpleValue();
        var apprLead_Time = apprnode.getValue("Lead_Time").getSimpleValue();
        var apprMax_Order_Qty = apprnode.getValue("Max_Order_Qty").getSimpleValue();
        var apprMin_Order_Qty = apprnode.getValue("Min_Order_Qty").getSimpleValue();
        var apprPrice = apprnode.getValue("Price_2").getSimpleValue();
        var apprSTD_PACKAGING = apprnode.getValue("STD_PACKAGING").getSimpleValue();
        var apprNon_Process_Flag = apprnode.getValue("Non_Process_Flag").getSimpleValue();
        var apprFutEffDt = apprnode.getValue("Future_Effective_Date").getSimpleValue();
       
if (ContractItem_Status !="") {
        if (apprContractItem_Status == ContractItem_Status) {
            infomsg = infomsg + "\n Contract Item Status: " + ContractItem_Status;           
        }
}
        if (apprSupplier_Item == Supplier_Item) {
            infomsg = infomsg + "\n Supplier Part Num: " + Supplier_Item;
        }
        if (apprLead_Time == Lead_Time) {
            infomsg = infomsg + "\n Lead Time :" + Lead_Time;
        }       
        if (apprSTD_PACKAGING == STD_PACKAGING) {
            infomsg = infomsg + "\n STD PACKAGING :" + STD_PACKAGING;
        }
        if (apprNon_Process_Flag == Non_Process_Flag) {
            infomsg = infomsg + "\n Non Process Flag :" + Non_Process_Flag;
        }
        if (apprMax_Order_Qty == Max_Order_Qty) {
            infomsg = infomsg + "\n Max Order Qty :" + Max_Order_Qty;
        }
        if (apprMin_Order_Qty == Min_Order_Qty) {
            infomsg = infomsg + "\n Min Order Qty :" + Min_Order_Qty;
        }
        if (apprPrice == Price) {
            infomsg = infomsg + "\n Price :" + Price;
        }
        if (apprFutEffDt == futEffDt) {
            infomsg = infomsg + "\n Effective Date :" + futEffDt;
        }
    }
    if(infomsg != ""){
    	infomsg = "Info: Processed but the following field values equal current value " + infomsg +" "+node.getID()+" initiated into BPA Workflow. Please take action."
    }
}
if (infomsg != "") {
    issue.addWarning(infomsg);
    return issue;
} else
    return true;
}