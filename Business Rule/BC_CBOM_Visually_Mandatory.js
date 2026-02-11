/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_CBOM_Visually_Mandatory",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_BOM_Web_UI_Conditions" ],
  "name" : "CBOM UI Visually Mandatory",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BOM_Child" ],
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
    "contract" : "ManagerBindContract",
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "MandatoryContextBind",
    "alias" : "mandatory",
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
exports.operation0 = function (node,stepManager,mandatory,hide) {
/**
 * set Mandatory for BOM_Price and Vendor_Product_Number for WRLN
 */
var parentLOB = "";
var parentBOMType = "";
var tempParentLOB = node.getValue("Temp_Parent_LOB").getSimpleValue();
var tempParentBomID = node.getValue("Temp_Parent_ID").getSimpleValue();
if (tempParentLOB) {
    parentLOB = tempParentLOB;
}
if (tempParentBomID) {
    var entityObject = stepManager.getEntityHome().getEntityByID(tempParentBomID);
    if (entityObject) {
        var parentItemNumber = entityObject.getValue("Parent_Item").getSimpleValue();
        if (parentItemNumber) {
            var itemID = stepManager.getNodeHome().getObjectByKey("Item.Key", parentItemNumber);
            if (itemID) {
                parentBOMType = itemID.getValue("NTW_BOM_Type").getID();
            }
        }
    }
}
if (!parentLOB || !parentBOMType) {
    var parentItemNum = node.getValue("Parent_Item").getSimpleValue();
    if (parentItemNum) {
        var parentItem = stepManager.getNodeHome().getObjectByKey("Item.Key", parentItemNum);
        if (parentItem) {
            if (!parentLOB) {
                parentLOB = parentItem.getValue("Line_Of_Business").getID();
            }
            if (!parentBOMType) {
                parentBOMType = parentItem.getValue("NTW_BOM_Type").getID();
            }
        }
    }
}
var attributeHome = stepManager.getAttributeHome();
if (parentLOB == "WRLN" && parentBOMType == "NON Stock") {
    mandatory.setMandatory(node, attributeHome.getAttributeByID("Child_Item"));
    mandatory.setMandatory(node, attributeHome.getAttributeByID("BOM_Quantity_Per"));
    mandatory.setMandatory(node, attributeHome.getAttributeByID("BOM_Start_Date"));
    mandatory.setMandatory(node, attributeHome.getAttributeByID("BOM_Price"));
    mandatory.setMandatory(node, attributeHome.getAttributeByID("Vendor_Product_Number"));
    return true;
} else {
    mandatory.setMandatory(node, attributeHome.getAttributeByID("Child_Item"));
    mandatory.setMandatory(node, attributeHome.getAttributeByID("BOM_Quantity_Per"));
    mandatory.setMandatory(node, attributeHome.getAttributeByID("BOM_Start_Date"));
    hide.setHidden(node, attributeHome.getAttributeByID("BOM_Price"));
    hide.setHidden(node, attributeHome.getAttributeByID("Child_Product_Ref"));
    hide.setHidden(node, attributeHome.getAttributeByID("Vendor_Product_Number"));
    return true;
}

return false;

}