/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Item_Wireline_HECI_Validation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Validation_Libraries" ],
  "name" : "Item Wireline HECI Validation Library",
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
function validateHECIResponse(node, stepManager) {
    var currentHECI = node.getValue("HECI").getSimpleValue();
    var previousHECI = node.getValue("HECI_Response").getSimpleValue();
    var errorMessage = '';
    if (currentHECI) {
        if (validateHECINumber(node, stepManager)) {
            if (previousHECI && currentHECI && (currentHECI != previousHECI)) {
                errorMessage = "Please run the HECI service again since the value is updated";
            }
        }
    }
    return errorMessage;
}

function validateHECIUserSelection(node, stepManager) {
    var errorMessage = "";
    var currentHECI = node.getValue("HECI").getSimpleValue();
    if (!currentHECI) {
        if (validateHECINumber(node, stepManager)) {
            var selectedCount = 0;
            var heciDataContainers = node.getDataContainerByTypeID("DC_HECI").getDataContainers().toArray();
            if (heciDataContainers.length == 0) {
                return "Current HECI doesn't have any records. Please enter a valid HECI.";
            } else {
                heciDataContainers.forEach(function (dataContainer) {
                    var heciObject = dataContainer.getDataContainerObject();
                    if (heciObject.getValue("HECI_User_Selection").getSimpleValue() == "Yes") {
                        selectedCount++;
                    }
                });
            }
            if (selectedCount > 1) {
                errorMessage = "Please select only one HECI from the Data Containers section.";
            } else if (heciDataContainers.length > 0 && selectedCount == 0) {
                errorMessage = "Please select at least one HECI from the Data Containers section.";
            }
            return errorMessage;
        }
    }
}

function validateHECIMaterialItemType(node) {
    var errorMessage = '';
    var currentHECI = node.getValue("HECI").getSimpleValue();
    var equipmentType = node.getValue("EQUIP_TYPE").getSimpleValue();
    var materialItemType = node.getValue("Material_Item_Type_Web").getSimpleValue();
    if (currentHECI) {
        if ((equipmentType == "PLUG-IN" || equipmentType == "HARDWIRED")) {
            if (materialItemType) {
                var materialItemTypeLower = materialItemType.toLowerCase();
                var equipmentTypeLower = equipmentType.toLowerCase();
                if (materialItemTypeLower != equipmentTypeLower) {
                    errorMessage = "Equipment type doesn't match with material item type selected, do you still want to proceed?";
                }
            }
            return errorMessage;
        }
    }
}

function validateHECINumber(node, stepManager) {
    var errorMessage = [];
    var businessGroup = node.getValue("Business_Group").getID();
    var currentHECI = node.getValue("HECI").getSimpleValue();
    var materialItemType = node.getValue("Material_Item_Type_Web").getSimpleValue();
    if (businessGroup == "DBOSS" && currentHECI) {
        errorMessage.push("HECI cannot be entered for DTV Items");
    }
    // Check for missing HECI in Item Creation Workflow for Plug-In Material Type
    if (commonValidationLib.isItemNumberExist(node) && !currentHECI && materialItemType == "Plug-In") {
        errorMessage.push("HECI cannot be blank for Plug-In Material Types");
    }
    var itemNumber = "ATT." + currentHECI;
    var itemObject = stepManager.getProductHome().getObjectByKey("Item.Key", itemNumber);
    if (itemObject) {
        errorMessage.push("An Item already exists with the current HECI, Please provide another HECI");
    }
    if (errorMessage.length > 0) {
        return errorMessage.join('\n').toString();
    }
}

function validateHECIAttributes(node, stepManager) {
    var errorMessage = [];
    var heciContainers = node.getDataContainerByTypeID("DC_HECI").getDataContainers().toArray();
    // Cache the LOV objects outside the loop for efficiency
    var lovFRC = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_FRC");
    var lovOEMFullName = stepManager.getListOfValuesHome().getListOfValuesByID("LOV_OEM_Full_Name");
    heciContainers.forEach(function (container) {
        var heciObject = container.getDataContainerObject();
        var userSelection = heciObject.getValue("HECI_User_Selection").getID();
        if (userSelection == "Y") {
            var frcValue = heciObject.getValue("HECI_FRC").getSimpleValue();
            var oemNameValue = heciObject.getValue("HECI_Manufacturer_Name").getSimpleValue();
            if (!lovFRC.getListOfValuesValueByID(frcValue)) {
                errorMessage.push("Selected HECI is missing FRC value '" + frcValue + "' in the system. Please contact the Data Governance team to request its addition.");
            } if (!lovOEMFullName.getListOfValuesValueByID(oemNameValue)) {
                errorMessage.push("Selected HECI is missing OEM Name '" + oemNameValue + "' in the system. Please contact the Data Governance team to request its addition.");
            }
        }
    });
    if (errorMessage.length > 0) {
        return errorMessage.join('\n').toString();
    }
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.validateHECIResponse = validateHECIResponse
exports.validateHECIUserSelection = validateHECIUserSelection
exports.validateHECIMaterialItemType = validateHECIMaterialItemType
exports.validateHECINumber = validateHECINumber
exports.validateHECIAttributes = validateHECIAttributes