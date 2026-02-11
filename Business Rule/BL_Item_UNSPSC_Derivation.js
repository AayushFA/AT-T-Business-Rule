/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Item_UNSPSC_Derivation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Derivation_Libraries" ],
  "name" : "Item UNSPSC Derivation Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessLibrary",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
/**
 * @author - John, and Madhuri [CTS]
 * Create UNSPSC Reference in Item
 */
function createUNSPSCReference(productNode, attributeManager, productQueryHome) {
    var lineOfBusiness = productNode.getValue("Line_Of_Business").getSimpleValue();
    var inventoryCategoryAttributeId, purchasingCategoryAttributeId, expenditureTypeAttributeId;
    var inventoryCategory, purchasingCategory, expenditureType;
    // Set attribute IDs and values based on Line Of Business
    if (lineOfBusiness == "Wireline") {
        inventoryCategoryAttributeId = attributeManager.getAttributeHome().getAttributeByID("Inventory_Cat_WRLN");
        purchasingCategoryAttributeId = attributeManager.getAttributeHome().getAttributeByID("Purchasing_Cat_WRLN");
        inventoryCategory = productNode.getValue("Inventory_Cat_WRLN").getSimpleValue();
        purchasingCategory = productNode.getValue("Purchasing_Cat_WRLN").getSimpleValue();
    } else if (lineOfBusiness == "Entertainment") {
        inventoryCategoryAttributeId = attributeManager.getAttributeHome().getAttributeByID("Inventory_Cat_ENT");
        purchasingCategoryAttributeId = attributeManager.getAttributeHome().getAttributeByID("Purchasing_Cat_ENT");
        inventoryCategory = productNode.getValue("Inventory_Cat_ENT").getSimpleValue();
        purchasingCategory = productNode.getValue("Purchasing_Cat_ENT").getSimpleValue();
    } else if (lineOfBusiness == "Retail") {
        inventoryCategoryAttributeId = attributeManager.getAttributeHome().getAttributeByID("Inventory_Cat_RTL");
        purchasingCategoryAttributeId = attributeManager.getAttributeHome().getAttributeByID("Purchasing_Cat_RTL");
        inventoryCategory = productNode.getValue("Inventory_Cat_RTL").getSimpleValue();
        purchasingCategory = productNode.getValue("Purchasing_Cat_RTL").getSimpleValue();
    } else if (lineOfBusiness == "Network Mobility") {
        purchasingCategoryAttributeId = attributeManager.getAttributeHome().getAttributeByID("Purchasing_Cat_NTW");
        purchasingCategory = productNode.getValue("Purchasing_Cat_NTW").getSimpleValue();
        expenditureType = productNode.getValue("Expenditure_Type").getSimpleValue();
        expenditureTypeAttributeId = attributeManager.getAttributeHome().getAttributeByID("Expenditure_Type");
    }
    var duplicateProductList = new java.util.ArrayList();
    var currentProductId = productNode.getID();
    var unspscReferenceLinkType = attributeManager.getLinkTypeHome().getClassificationProductLinkTypeByID("ATT_UNSPSC_Reference");
    // Only create UNSPSC reference if one does not exist      
    if (productNode.getClassificationProductLinks(unspscReferenceLinkType).size() == 0) {
        if (lineOfBusiness == "Network Mobility" && purchasingCategory && expenditureType) {
            validateDuplicateByPurchasingCategoryAndExpenditureType();
        } else if (["Wireline", "Retail", "Entertainment"].includes(String(lineOfBusiness))) {
            if (purchasingCategory && inventoryCategory) {
                validateDuplicateByInventoryAndPurchasingCategory();
            }
        }
    }
    // Helper: Copy classification link from duplicate products by classification level
    function copyClassificationLinkFromDuplicates(duplicates, classificationLevels) {
        for (var i = 0; i < classificationLevels.length; i++) {
            var level = classificationLevels[i];
            for (var j = 0; j < duplicates.size(); j++) {
                var links = duplicates.get(j).getClassificationProductLinks(unspscReferenceLinkType);
                if (links.size() > 0) {
                    var classification = links.get(0).getClassification();
                    if (classification.getObjectType().getID() == level) {
                        productNode.createClassificationProductLink(classification, unspscReferenceLinkType);
                        return true;
                        
                    }
                }
            }
        }
        return false;
    }
    // --- Network Mobility Logic ---
    function validateDuplicateByPurchasingCategoryAndExpenditureType() {
        duplicateProductList.clear();
        var condition = com.stibo.query.condition.Conditions;
        var query = productQueryHome.queryFor(com.stibo.core.domain.Product).where(condition.valueOf(purchasingCategoryAttributeId).eq(purchasingCategory).and(condition.valueOf(expenditureTypeAttributeId).eq(expenditureType))).execute();
        query.forEach(function(result) {
            if (result.getParent().getObjectType().getID() != "CancelledType" && result.getID() != currentProductId) {
                duplicateProductList.add(result);
            }
            return true;
        });
        if (duplicateProductList.size() > 0) {
            if (!copyClassificationLinkFromDuplicates(duplicateProductList, ["ATT_UNSPSC_Commodity", "ATT_UNSPSC_Class", "ATT_UNSPSC_Family"])) {
                validateDuplicateByPurchasingCategory();
            }
        } else {
            validateDuplicateByPurchasingCategory();
        }
    }

    function validateDuplicateByPurchasingCategory() {
        duplicateProductList.clear();
        var condition = com.stibo.query.condition.Conditions;
        var query = productQueryHome.queryFor(com.stibo.core.domain.Product).where(condition.valueOf(purchasingCategoryAttributeId).eq(purchasingCategory)).execute();
        query.forEach(function(result) {
            if (result.getParent().getObjectType().getID() != "CancelledType" && result.getID() != currentProductId) {
                duplicateProductList.add(result);
            }
            return true;
        });
        if (duplicateProductList.size() > 0) {
            if (!copyClassificationLinkFromDuplicates(duplicateProductList, ["ATT_UNSPSC_Commodity", "ATT_UNSPSC_Class", "ATT_UNSPSC_Family"])) {
                validateDuplicateByExpenditureType();
            }
        } else {
            validateDuplicateByExpenditureType();
        }
    }

    function validateDuplicateByExpenditureType() {
        if (!expenditureTypeAttributeId) return;
        duplicateProductList.clear();
        var condition = com.stibo.query.condition.Conditions;
        var query = productQueryHome.queryFor(com.stibo.core.domain.Product).where(condition.valueOf(expenditureTypeAttributeId).eq(expenditureType)).execute();
        query.forEach(function(result) {
            if (result.getParent().getObjectType().getID() != "CancelledType" && result.getID() != currentProductId) {
                duplicateProductList.add(result);
            }
            return true;
        });
        if (duplicateProductList.size() > 0) {
            copyClassificationLinkFromDuplicates(duplicateProductList, ["ATT_UNSPSC_Commodity", "ATT_UNSPSC_Class", "ATT_UNSPSC_Family"]);
        }
    }
    // --- Wireline, Retail, Entertainment Logic ---
    function validateDuplicateByInventoryAndPurchasingCategory() {
        duplicateProductList.clear();
        var condition = com.stibo.query.condition.Conditions;
        var query = productQueryHome.queryFor(com.stibo.core.domain.Product).where(condition.valueOf(purchasingCategoryAttributeId).eq(purchasingCategory).and(condition.valueOf(inventoryCategoryAttributeId).eq(inventoryCategory))).execute();
        query.forEach(function(result) {
            if (result.getParent().getObjectType().getID() != "CancelledType" && result.getID() !== currentProductId) {
                duplicateProductList.add(result);
            }
            return true;
        });
        if (duplicateProductList.size() > 0) {
            if (!copyClassificationLinkFromDuplicates(duplicateProductList, ["ATT_UNSPSC_Commodity", "ATT_UNSPSC_Class", "ATT_UNSPSC_Family"])) {
                validateDuplicateByInventoryCategory();
            }
        } else {
            validateDuplicateByInventoryCategory();
        }
    }

    function validateDuplicateByInventoryCategory() {
        duplicateProductList.clear();
        var condition = com.stibo.query.condition.Conditions;
        var query = productQueryHome.queryFor(com.stibo.core.domain.Product).where(condition.valueOf(inventoryCategoryAttributeId).eq(inventoryCategory)).execute();
        query.forEach(function(result) {
            if (result.getParent().getObjectType().getID() != "CancelledType" && result.getID() != currentProductId) {
                duplicateProductList.add(result);
            }
            return true;
        });
        if (duplicateProductList.size() > 0) {
            if (!copyClassificationLinkFromDuplicates(duplicateProductList, ["ATT_UNSPSC_Commodity", "ATT_UNSPSC_Class", "ATT_UNSPSC_Family"])) {
                validateDuplicateByPurchasingCategoryOnly();
            }
        } else {
            validateDuplicateByPurchasingCategoryOnly();
        }
    }

    function validateDuplicateByPurchasingCategoryOnly() {
        duplicateProductList.clear();
        var condition = com.stibo.query.condition.Conditions;
        var query = productQueryHome.queryFor(com.stibo.core.domain.Product).where(condition.valueOf(purchasingCategoryAttributeId).eq(purchasingCategory)).execute();
        query.forEach(function(result) {
            if (result.getParent().getObjectType().getID() != "CancelledType" && result.getID() != currentProductId) {
                duplicateProductList.add(result);
            }
            return true;
        });
        if (duplicateProductList.size() > 0) {
            copyClassificationLinkFromDuplicates(duplicateProductList, ["ATT_UNSPSC_Commodity", "ATT_UNSPSC_Class", "ATT_UNSPSC_Family"]);
        }
    }
}

function validateUNSPSCReference(node, stepManager) {// Need to review-07/15
	var UNCPSCref = stepManager.getLinkTypeHome().getClassificationProductLinkTypeByID("ATT_UNSPSC_Reference");
	var error = "";
	if (node.getClassificationProductLinks(UNCPSCref).size() == 0) {
		error = "Please add UNSPSC Reference";		
	} else {
		if (node.getClassificationProductLinks(UNCPSCref).get(0).getClassification().getObjectType().getID() == "ATT_UNSPSC_Segment") {
			error = "UNSPSC selection must be Level 2 or lower";			
		}
	}
  return error;
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.createUNSPSCReference = createUNSPSCReference
exports.validateUNSPSCReference = validateUNSPSCReference