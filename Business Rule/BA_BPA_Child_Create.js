/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_Child_Create",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "BPA Create Child",
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
    "contract" : "WebUiContextBind",
    "alias" : "ctx",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,ctx) {
log.info("Inside BPA Create Child");
//var a=ctx.getSelection();
/*
a.forEach(function(child) {
        log.info("-------------" +child.getObjectType().getID());

        if(child.getObjectType().getID()=="BPA") {
            child.createProduct(null, "Contract_Item");
        }

        else  if(child.getObjectType().getID()=="BPA"){
            child.createProduct(null, "LE_Contract_Item_Child");
        }

    }
);*/
var currentNode = null;
var selection = ctx.getSelection();
var error = "";

if (selection.size() == 0) {
    currentNode = node;
    execute(currentNode);
} else if (selection.size() > 0) {
    selection.forEach(function(item) {
        currentNode = item;
        execute(currentNode);
    });
}

function execute(currentNode) {
    var selectedNodes = ctx
    var wfBPAcreate = step.getWorkflowHome().getWorkflowByID("Create_BPA");
    var parentName = null;
    var newObject = null;
    if (currentNode.getObjectType().getID() == "BPA") {
        newObject = currentNode.createProduct(null, "Contract_Item");
        parentName = newObject.getParent().getName();
        if (parentName) {
            newObject.setName(parentName + "_" + newObject.getID());
        }
        wfBPAcreate.start(newObject, null);
        error = error + "\n" + currentNode.getID() + "<html><body><b><font color = green> : Contract Item created succesfully for BPA Header</font></b></body></html>" ;
    } /*else if (currentNode.getObjectType().getID() == "Contract_Item") {
        log.info("checkin");
         var ciToItem = step.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
        log.info("ciToItem:"+ciToItem);
        var item = currentNode.getReferences(ciToItem).toArray();
		
        if(item.length>0){
        //log.info("item:"+item[0].getTarget().getID());
        var itemTarget = item[0].getTarget();
        log.info("itemTarget:"+itemTarget);
        var bomType = itemTarget.getValue("NTW_BOM_Type").getSimpleValue();
        log.info("bomType:"+bomType);
        if (bomType == "LOCAL EXPLOSION") {

            newObject = currentNode.createProduct(null, "LE_Contract_Item_Child");
            parentName = newObject.getParent().getParent().getName();
            if (parentName) {
                newObject.setName(parentName + "_" + newObject.getID());
            }
           // wfBPAcreate.start(newObject, null);
            error = error + "\n" + currentNode.getID() + "<html><body><b><font color = green> : Local Explosion created for Contract Item: </font></b></body></html>";

        }else {
            error = error + "\n" + currentNode.getID() + "<html><body><b><font color = red > : Local Explosion is not created for Contract Item as the item Referenced to it is not Valid,Please retry with other reference Item</font></b></body></html>";

        } 
		}else {
			
            error = error + "\n" + currentNode.getID() + "<html><body><b><font color = red > : Local Explosion is not created for Contract Item as there is no item Referenced to it,Please add valid Item reference to proceed </font></b></body></html>";

        }
    } else if (currentNode.getObjectType().getID() == "LE_Contract_Item_Child") {

        error = error + "\n" + currentNode.getID() + "<html><body><b><font color = red > : Children cannot be created for LE Contract Item</font></b></body></html>";

    } else {
        //nothing
    }*/

    if (error) {
        ctx.showAlert("INFO", "Result Details: ", error);
    } else {
        //do nothing
    }




}
}