/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Item_Network_Validation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Validation_Libraries" ],
  "name" : "Item Network Validation Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Item_Common_Validation",
    "libraryAlias" : "commonValidationLib"
  } ]
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
function validateNetworkDerivedReference(node, stepManager) { // need to review
    var errorMessage = "";
    var networkRefType = stepManager.getLinkTypeHome().getClassificationProductLinkTypeByID("Network_Derived_Reference");
    var networkReferences = node.getClassificationProductLinks().get(networkRefType);
    if (networkReferences.size() == 0) {
        errorMessage = "Please add Reference to assign Categories and Accounts";
    } else {
        var firstReferenceClassification = stepManager.getClassificationHome().getClassificationByID(networkReferences.get(0).getClassification().getID());
        if (firstReferenceClassification.getObjectType().getID() != 'Item_Class') {
            errorMessage = "Please add a Purchasing & Accounting Reference of Type 'Item Class' Only";
        }
    }
    return errorMessage;
}

function validateReplacementReason(node, step, query) {
    var errorMessage = "";
    var replacementItem = node.getValue("Replacement_Item").getSimpleValue();
    var reasonCode = node.getValue("Reason_Code").getID();
    var itemNumberAttribute = step.getAttributeHome().getAttributeByID("Item_Num");
    if (replacementItem &&commonValidationLib.isItemNumberExist(node)) {
        var c = com.stibo.query.condition.Conditions;
        var querySpecification = query.queryFor(com.stibo.core.domain.Product).where(c.valueOf(itemNumberAttribute).eq(replacementItem));
        var results = querySpecification.execute().asList(10);
        if (results.size() == 0) {
            errorMessage = "Please enter a valid Replacement Item";
        }
        if (!reasonCode) {
            errorMessage = "Reason Code is required if Replacement Item is entered";
        }
    }
    return errorMessage;
}

function validateDuplicateManufacturingPartNumber(node, stepManager, query) {
    var errorMessage = "";
    var currentNodeID = node.getID();
    var currentNodeObjectType = node.getObjectType();
    var mfgPartNoAttribute = stepManager.getAttributeHome().getAttributeByID("Mfg_Part_No");
    var mfgPartNumber = node.getValue("Mfg_Part_No").getSimpleValue();
    if (mfgPartNumber) {
        var Conditions = com.stibo.query.condition.Conditions;
        var querySpec = query.queryFor(com.stibo.core.domain.Product).where(Conditions.valueOf(mfgPartNoAttribute).eq(mfgPartNumber).and(Conditions.objectType(currentNodeObjectType)));
        var resultSet = querySpec.execute();
        var matchingProducts = new java.util.ArrayList();
        var hasDuplicate = false;
        resultSet.forEach(function(result) {
            matchingProducts.add(result);
            return true;
        });
        for (var i = 0; i < matchingProducts.size(); i++) {
            var product = matchingProducts.get(i);
            var productLineOfBusiness = product.getValue("Line_Of_Business").getID();
            var productObjectType = product.getParent().getObjectType().getID();
            var productID = product.getID();
            if (productObjectType != "CancelledType" && productID != currentNodeID && productLineOfBusiness == "NTW") {
                hasDuplicate = true;
                break;
            }
        }
        if (hasDuplicate) {
            var duplicateDetails = node.getValue("Duplicate_MPN_Details").getSimpleValue();
            var duplicateReason = node.getValue("Duplicate_MPN_Reason").getSimpleValue();
            if (!duplicateDetails || !duplicateReason) {
                errorMessage = "Duplicate MSN Details and Duplicate Reason are mandatory when Mfg Part No is duplicate.";
            }
        }
    }
    return errorMessage;
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.validateNetworkDerivedReference = validateNetworkDerivedReference
exports.validateReplacementReason = validateReplacementReason
exports.validateDuplicateManufacturingPartNumber = validateDuplicateManufacturingPartNumber