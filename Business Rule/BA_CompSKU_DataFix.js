/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CompSKU_DataFix",
  "type" : "BusinessAction",
  "setupGroups" : [ "BR_DataFix" ],
  "name" : "Companion Sku Data Fix",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Item", "Companion_SKU" ],
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
    "contract" : "ReferenceTypeBindContract",
    "alias" : "ref",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "BOM_Parent",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,ref) {
var parentItem = getParentItem(node);
var newCompSku = createNewCompSku(parentItem);
setCompanionTypeandIdentity(node, newCompSku);
copyDescAttributes(node, newCompSku);
copySpecAttributes(node, newCompSku);
copySpecAdditionalAttributes(node, newCompSku);
updateReferences(node, newCompSku);
updateItemKey(node, newCompSku);
setName(node, newCompSku);
reparentChildren(node, newCompSku);
approvenewparent();
moveNodeToCancelled(node);
//tempSet();
function getParentItem(node) {
    var tempValue = node.getValue("Temp_Parent").getSimpleValue();
    var parentId = tempValue.split("\\|")[0];
    var parentItem = step.getNodeHome().getObjectByKey("Item.Key", parentId);
    return parentItem;
}

function createNewCompSku(parentItem) {
    var newCompSku = parentItem.createProduct(null, "Companion_SKU");
    return newCompSku;
}

function copyDescAttributes(node, newCompSku) {
    var attrGroupID = step.getAttributeGroupHome().getAttributeGroupByID("AG_CompSku_Description_Temp");
    if (attrGroupID) {
        var attr = attrGroupID.getAttributes().toArray();
        var attrID = "";
        for (var i = 0; i < attr.length; i++) {
            attrID = attr[i].getID();
            var hasLov = step.getAttributeHome().getAttributeByID(attrID).hasLOV();
            var valueObj = node.getValue(attrID);
            var attrValue;
            // var attrValue = node.getValue(attrID);    
            attrValue = hasLov ? valueObj.getID() : valueObj.getSimpleValue();
            if (hasLov) {
                if (attrValue) {
                    newCompSku.getValue(attrID).setLOVValueByID(attrValue);
                }
            } else {
                if (attrValue) {
                    newCompSku.getValue(attrID).setSimpleValue(attrValue);
                }
            }
        }
    }
}

function copySpecAttributes(node, newCompSku) {
    var attrGroupID = step.getAttributeGroupHome().getAttributeGroupByID("AG_CompSku_Specification_Temp");
    if (attrGroupID) {
        var tempValue = node.getValue("Temp_Parent").getSimpleValue();
        var compType = tempValue.split("\\|")[1];
        var attr = attrGroupID.getAttributes().toArray();
        for (var i = 0; i < attr.length; i++) {
            var attrID = attr[i].getID();
            var hasLov = step.getAttributeHome().getAttributeByID(attrID).hasLOV();
            var attrValue = node.getValue(attrID).getSimpleValue();
            var parentAttrvalue = newCompSku.getParent().getValue(attrID).getSimpleValue();
            if (attrValue != parentAttrvalue) {
                if (hasLov) {
                    var lovID = node.getValue(attrID).getID();
                    if (lovID) {
                        newCompSku.getValue(attrID).setLOVValueByID(lovID);
                    }
                } else {
                    if (attrValue) {
                        newCompSku.getValue(attrID).setSimpleValue(attrValue);
                    }
                }
            }
        }
    }
}

function copySpecAdditionalAttributes(node, newCompSku) {
    var tempValue = node.getValue("Temp_Parent").getSimpleValue();
    var compType = tempValue.split("\\|")[1];
    var stdCost = node.getValue("Submit_Standard_Cost").getID(); // old parent
    var parentStdCost = newCompSku.getParent().getValue("Submit_Standard_Cost").getID(); //new paremt
    if (stdCost) {
        newCompSku.getValue("Submit_Standard_Cost").setLOVValueByID(stdCost);
    } else {
        newCompSku.getValue("Submit_Standard_Cost").setLOVValueByID("N");
    }
    //Marektprice
    var marketPrice = node.getValue("Market_Price").getSimpleValue();
    var parentMarketPrice = newCompSku.getParent().getValue("Market_Price").getSimpleValue();
    if (marketPrice) {
        newCompSku.getValue("Market_Price").setSimpleValue(marketPrice);
    } else {
        newCompSku.getValue("Market_Price").setSimpleValue("0");
    }
    //list price
    var listPrice = node.getValue("List_Price").getSimpleValue();
    var parentListPrice = newCompSku.getParent().getValue("List_Price").getSimpleValue();
    if (listPrice) {
        newCompSku.getValue("List_Price").setSimpleValue(listPrice);
    } else {
        newCompSku.getValue("List_Price").setSimpleValue("0");
    }
    // Description_Prefix
    var descPrefixID = node.getValue("Description_Prefix").getID();
    var parentDescPrefixID = newCompSku.getParent().getValue("Description_Prefix").getID();
    if (descPrefixID) {
        if (descPrefixID != parentDescPrefixID) {
            newCompSku.getValue("Description_Prefix").setLOVValueByID(descPrefixID);
        }
    } else {
        if (compType == "DISPLAY") {
            newCompSku.getValue("Description_Prefix").setLOVValueByID("DIS");
        } else if (compType == "DEM") {
            newCompSku.getValue("Description_Prefix").setLOVValueByID("DEM");
        }
    }
    //Inventory cat rtl
    var invCatID = node.getValue("Inventory_Cat_RTL").getID();
    var parentInvCatID = newCompSku.getParent().getValue("Inventory_Cat_RTL").getID();
    if (invCatID) {
        if (invCatID != parentInvCatID) {
            newCompSku.getValue("Inventory_Cat_RTL").setLOVValueByID(invCatID);
        }
    } else {
        if (compType == "DISPLAY") {
            newCompSku.getValue("Inventory_Cat_RTL").setLOVValueByID("DISPLAY.DEMO");
        }
    }
}

function updateReferences(node, newCompSku) {
    var referenceTypeIDs = ["ContractItem_Item", "BOM_Child", "BOM_Parent", "BOM_Child_Substitute"];
    referenceTypeIDs.forEach(function(refTypeID) {
        var referenceType = step.getReferenceTypeHome().getReferenceTypeByID(refTypeID);
        if (referenceType) {
            var referencedByList = node.queryReferencedBy(referenceType).asList(1000);
            if (referencedByList.size() > 0) {
                referencedByList.forEach(function(reference) {
                    var sourceItem = reference.getSource();
                    if (sourceItem) {
                        reference.delete();
                        sourceItem.createReference(newCompSku, referenceType);
                    }
                });
            }
        }
    });
}

function updateItemKey(node, newCompSku) {
    var oldItemKey = node.getValue("Item_Num").getSimpleValue();
    if (oldItemKey) {
        step.getKeyHome().updateUniqueKeyValues2({
            "Item_Num": String("")
        }, node);
    }
    newCompSku.getValue("Item_Num").setSimpleValue(oldItemKey);
}

function setCompanionTypeandIdentity(node, newCompSku) {
    var tempValue = node.getValue("Temp_Parent").getSimpleValue();
    var compType = tempValue.split("\\|")[1];
    var parent = newCompSku.getParent();
    parentId = parent.getID();
    newCompSku.getValue("Comp_SKU_Identity").setSimpleValue(parentId + "." + compType);
    if (node.getValue("Line_Of_Business").getSimpleValue() == "Retail") {
        newCompSku.getValue("Companion_Item_Type").replace().addLOVValueByID(compType).apply();
        parent.getValue("Companion_Item_Type").append().addLOVValueByID(compType).apply();
    }
    if (node.getValue("Line_Of_Business").getSimpleValue() == "Entertainment") {
        newCompSku.getValue("ENT_Companion_Item_Type").replace().addLOVValueByID(compType).apply();
        newCompSku.getValue("Companion_Item_Type").replace().addLOVValueByID(compType).apply();
        parent.getValue("Companion_Item_Type").append().addLOVValueByID(compType).apply();
        parent.getValue("ENT_Companion_Item_Type").append().addLOVValueByID(compType).apply();
    }
}

function setName(node, newCompSku) {
    var tempValue = node.getValue("Temp_Parent").getSimpleValue();
    var compType = tempValue.split("\\|")[1];
    var itemNum = newCompSku.getValue("Item_Num").getSimpleValue();
    if (!newCompSku.getName()) {
        if (compType && itemNum) {
            newCompSku.setName(itemNum + "(" + compType + ")");
        }
    }
}

function reparentChildren(node, newCompSku) {
    newCompSku.approve();
    var children = node.getChildren();
    if (children.size() > 0) {
        children.forEach(function(child) {
            child.setParent(newCompSku);
            child.approve();
        });
    }
}

function approvenewparent() {
    var tempValue = node.getValue("Temp_Parent").getSimpleValue();
    var newparent = tempValue.split("\\|")[0];
    var parentItem = step.getNodeHome().getObjectByKey("Item.Key", newparent);
    parentItem.approve();
}

function moveNodeToCancelled(node) {
    var cancelFolder = step.getProductHome().getProductByID("CancelledProducts");
    node.setParent(cancelFolder);
    node.approve();
}
/*
function tempSet() {
    var attrGroupID = step.getAttributeGroupHome().getAttributeGroupByID("AG_CompSku_Specification_Temp");
    var oldParentId = node.getValue("Temp_Parent").getSimpleValue(); // Stibo ID only
    var oldParent = step.getProductHome().getProductByID(oldParentId);
    var newParent = node.getParent();
    var attributes = attrGroupID.getAttributes().toArray();
    for (var i = 0; i < attributes.length; i++) {
        var attrID = attributes[i].getID();
        var attrDef = step.getAttributeHome().getAttributeByID(attrID);
        var hasLov = attrDef.hasLOV();
        var oldValue = oldParent.getValue(attrID).getSimpleValue();
        var newValue = newParent.getValue(attrID).getSimpleValue();
        if (oldValue != newValue) {
            if (hasLov) {
                var lovID = oldParent.getValue(attrID).getID();
                if (lovID) {
                    node.getValue(attrID).setLOVValueByID(lovID);
                    log.info(attrID + " updated with LOV ID: " + lovID);
                }
            } else {
                if (oldValue) {
                    node.getValue(attrID).setSimpleValue(oldValue);
                    log.info(attrID + " updated with value: " + oldValue);
                }
            }
        }
    }

    var oldItemId = node.getValue("Temp_Parent").getSimpleValue();
    var oldItem = step.getProductHome().getProductByID(oldItemId);
    var stdCostID = oldItem.getValue("Submit_Standard_Cost").getID();
    if (!stdCostID) {
        node.getValue("Submit_Standard_Cost").setLOVValueByID("N");
    }
    var listPrice = oldItem.getValue("List_Price").getSimpleValue();
    if (!listPrice) {
        node.getValue("List_Price").setSimpleValue("0");
    }
    var marketPrice = oldItem.getValue("Market_Price").getSimpleValue();
    if (!marketPrice) {
        node.getValue("Market_Price").setSimpleValue("0");
    }

    var descPrefixID = oldItem.getValue("Description_Prefix").getID();
    if (!descPrefixID) {
        var compType = node.getValue("Companion_Item_Type").getSimpleValue();
        var prefixMap = {
            "DEM": "DEM",
            "DISPLAY": "DIS"
        };
        var defaultPrefixID = prefixMap[compType];
        if (defaultPrefixID) {
            node.getValue("Description_Prefix").setLOVValueByID(defaultPrefixID);
        }
    }
   var inventoryCatID = oldItem.getValue("Inventory_Cat_RTL").getID();
    var compType = node.getValue("Companion_Item_Type").getSimpleValue();
    if (!inventoryCatID && compType == "DISPLAY") {
        newCompSku.getValue("Inventory_Cat_RTL").setLOVValueByID("DISPLAY.DEMO");
    }
    node.approve();  
}*/
}