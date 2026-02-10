/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_ABC_WF_Pull_Supplier_Items",
  "type" : "BusinessAction",
  "setupGroups" : [ "ABC_BusinessAction" ],
  "name" : "ABC Workflow Pull Supplier Items",
  "description" : "Save the changes ,reparent and initiate in workflow post supplier validation check",
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_Audit_Library",
    "libraryAlias" : "libAudit"
  }, {
    "libraryId" : "BL_ABC_Validation",
    "libraryAlias" : "abcVal"
  }, {
    "libraryId" : "BL_ABC_Common",
    "libraryAlias" : "abcCoLib"
  } ]
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
    "alias" : "webui",
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
    "contract" : "GatewayBinding",
    "alias" : "giep",
    "parameterClass" : "com.stibo.core.domain.impl.integrationendpoint.gateway.FrontGatewayIntegrationEndpointImpl",
    "value" : "GSC_SupplierItems_Pull_GEIP",
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "gsclookuptable",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "MailHomeBindContract",
    "alias" : "mailHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "log",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ListOfValuesBindContract",
    "alias" : "conManLov",
    "parameterClass" : "com.stibo.core.domain.impl.ListOfValuesImpl",
    "value" : "LOV_Contract_Manager",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,webui,query,giep,gsclookuptable,mailHome,log,conManLov,libAudit,abcVal,abcCoLib) {
/**
 * author: aw240u(cognizant), Madhuri[CTS], Lev(CTS)
 * Combined with: Megha[CTS] - ABC Pull Supplier Items
 */
var objExistError = "";
var bpakey = node.getValue("BPA_Agreement_Key").getSimpleValue();
if (!bpakey) {
    var supplierReferenceError = validateSupplierReference(node);
    if (supplierReferenceError) {
        webui.showAlert("ERROR", supplierReferenceError);
        return;
    }
    abcCoLib.supplierAttrfromRef(node, step);
    var supplierStatusError = abcVal.supplierActiveCheck(node, step);
    if (supplierStatusError) {
        webui.showAlert("ERROR", supplierStatusError);
        return;
    }
    var objExistError = checkExistingKeys(node, step) + abcVal.checkDupMasterContract(node, step, query);
    if (objExistError) {
        webui.showAlert("ERROR", objExistError);
        return;
    }
}
var rangeFrom = 0;
var batchLimit = Number(step.getEntityHome().getEntityByID("ABC_Attributes_Configurations").getValue("ABC_GSC_Batch_Limit").getSimpleValue());
var rangeTo = rangeFrom + batchLimit;
node.getValue("SI_Retrieve_Again").setLOVValueByID("Y");
var hasMore = true;
var errorOccurred = false;
var isInitiated = false;
while (hasMore) {
    try {
        var payload = buildBPAHeaderPayload(node);
    } catch (error) {
        throw ("Failed to build BPA Header Payload: " + error.message);
    }
    Object.assign(payload, {
        RangeFrom: String(rangeFrom),
        RangeTo: String(rangeTo)
    });
    var body = createCatalogMessage(payload);
    var post = giep.post().header("InstanceName", "scm-oic-01-idfykvb66dwb-px");
    try {
        response = post.path("/").body(body).invoke();
    } catch (e) {
        errorOccurred = true;
        if (e.javaException instanceof com.stibo.gateway.rest.RESTGatewayException) {
            throw "Error while calling the pull API: " + e.javaException.getMessage();
        } else {
            throw (e);
        }
    }
    if (response) {
        var error = checkExternalDataErrors(response);
        if (error) {
            hasMore = false;
            errorOccurred = true;
            webui.showAlert("ERROR", error);
            break;
        } else {
            if (!bpakey) {
                setKey(node, step);;
            }
            hasMore = processExternalDataPayload(response);
        }
    } else {
        hasMore = false;
    }
    if (hasMore) {
        rangeFrom = rangeTo + 1;
        rangeTo += batchLimit;
    }
}
if (!errorOccurred && !bpakey) {
    if (!node.isInWorkflow("ABC_Workflow")) {
        var consType = node.getValue("Consumer_Type").getSimpleValue();
        var folderID = "ABC_HUB"
        var parentFolder = step.getProductHome().getProductByID(folderID);
        node.setParent(parentFolder);
        node.startWorkflowByID("ABC_Workflow", "Start Workflow");
        webui.navigate("ALM_Enrichment_Failed_State_Node_Detail_Page", node);
        webui.showAlert("INFO", "BPA Created");
    }
} else if (!errorOccurred && bpakey) {
    updateEndDateForUnprocessedPriceBreaks(node, step);
}
var gscProcessedItemCount = countGscProcessedChildren(node);
if (gscProcessedItemCount > 0) {
   // abcCoLib.sendPullMail(node, log, mailHome, step, conManLov, libAudit, gscProcessedItemCount);
   abcCoLib.sendPullMail("SOX_63009231", node, log, mailHome, step, conManLov, libAudit, gscProcessedItemCount);
}

function checkExternalDataErrors(response) {
    var data = JSON.parse(response);
    if (data.ATTCatalogMessage && data.ATTCatalogMessage.ResponseData && Array.isArray(data.ATTCatalogMessage.ResponseData)) {
        var responseData = data.ATTCatalogMessage.ResponseData;
        if (responseData.length > 0 && responseData[0].ErrorResponse) {
            if (responseData[0].ErrorResponse.includes("No Valid Data found for search criteria.")) {
                return "No New or Updated Data for this catalog found in pull from Supplier Portal (GSC).";
            } else {
                return responseData[0].ErrorResponse;
            }
        }
    }
    return null;
}

function createCatalogMessage(data) {
    var message = {
        ATTCatalogMessage: {}
    };
    var keys = ["SupplierNumber", "SupplierSiteCode", "DocumentType", "ContractNumber", "QuoteNumber", "ATTItemNumber", "ManufacturerPartNumber", "SupplierPartNumber", "UNSPSCCode", "ATTContactATTUID", "RetrieveAgain", "Datefrom", "Dateto", "RangeFrom", "RangeTo"];
    keys.forEach(function(key) {
        message.ATTCatalogMessage[key] = data[key] || "";
    });
    return JSON.stringify(message);
}

function buildBPAHeaderPayload(node) {
    try {
        return {
            SupplierNumber: String(node.getValue("SI_Supplier_Number").getSimpleValue() || ""),
            SupplierSiteCode: String(node.getValue("SI_Supplier_Site").getSimpleValue() || ""),
            ContractNumber: String(node.getValue("SI_Master_Contract_Number").getSimpleValue() || ""),
            RetrieveAgain: String(node.getValue("SI_Retrieve_Again").getID() || "")
        };
    } catch (error) {
        throw (error);
    }
}

function processExternalDataPayload(response) {
    var data = JSON.parse(response);
    var responseData = data.ATTCatalogMessage.ResponseData;
    if (Array.isArray(responseData)) {
        responseData.map(function(item) {
            var attributes = processItemAttributes(item, gsclookuptable);
            processAttributes(attributes.headerAttributes, attributes.contractItemAttributes, attributes.priceBreakAttributes, item);
        });
    }
    return data.ATTCatalogMessage.hasMore === "true";
}

function processItemAttributes(item, gsclookuptable) {
    var headerAttributes = [];
    var contractItemAttributes = [];
    var priceBreakAttributes = [];
    Object.keys(item).forEach(function(key) {
        var gscMappingResult = gsclookuptable.getLookupTableValue("LT_GSCPull_AttributeMapping", key);
        if (gscMappingResult) {
            var value = item[key];
            var mappingParts = gscMappingResult.split("\\|");
            var objectTypeMapping = mappingParts[0];
            var attributeID = mappingParts[1];
            if (objectTypeMapping == "H") {
                var headerAttribute = {
                    attributeID: attributeID,
                    value: value
                };
                headerAttributes.push(headerAttribute);
            } else if (objectTypeMapping == "CI") {
                var contractItemAttribute = {
                    attributeID: attributeID,
                    value: value
                };
                contractItemAttributes.push(contractItemAttribute);
            } else if (objectTypeMapping == "PB") {
                var priceBreakAttribute = {
                    attributeID: attributeID,
                    value: value
                };
                priceBreakAttributes.push(priceBreakAttribute);
            }
        }
    });
    return {
        headerAttributes: headerAttributes,
        contractItemAttributes: contractItemAttributes,
        priceBreakAttributes: priceBreakAttributes
    };
};

function processAttributes(headerAttributes, contractItemAttributes, priceBreakAttributes, item) {
    if (headerAttributes.length > 0) {
        processHeaderAttributes(headerAttributes, item);
    }
    if (contractItemAttributes.length > 0) {
        processContractItemAttributes(contractItemAttributes, item);
    }
    if (priceBreakAttributes.length > 0) {
        processPriceBreakAttributes(priceBreakAttributes, item);
    }
}

function processHeaderAttributes(headerAttributes, item) {
    var bpaKey = abcCoLib.generateBpaKey(item.SupplierNumber, item.SupplierSiteCode, item.ContractNumber);
    var bpaHeaderObj = step.getProductHome().getObjectByKey("Supplier.Item.Key", bpaKey) || step.getProductHome().getObjectByKey("Supplier.PartNum.Key", bpaKey);
    if (bpaHeaderObj) {
        headerAttributes.forEach(function(attr) {
            processAndUpdateAttribute(step, bpaHeaderObj, attr.attributeID, attr.value);
        });
        abcCoLib.setGSCFlagToY(bpaHeaderObj);
        abcCoLib.setDefaultBuyer(bpaHeaderObj);
        abcCoLib.setDefaultImportSource(bpaHeaderObj);
        var actionCode = abcCoLib.isProcessedInOracle(bpaHeaderObj) ? "U" : "ORIGINAL";
        libAudit.setDateTime(bpaHeaderObj, "SI_Pull_TimeStamp");
        bpaHeaderObj.getValue("SI_Action_Code").setLOVValueByID(actionCode);
        abcCoLib.setNodeName(bpaHeaderObj);
    }
}

function processContractItemAttributes(contractItemAttributes, item) {
    const {
        SupplierNumber: supplierNumber,
        SupplierSiteCode: supplierSiteCode,
        ContractNumber: contractNumber,
        SupplierPartNum: supplierPartNumber,
        ATTItemNumber: attItemNumber,
        PriceBreakQty: priceBreakQty,
        StgtblRecid: recId
    } = item;
    var ciItemKey = supplierNumber && supplierSiteCode && contractNumber && attItemNumber ? abcCoLib.generateCiItemKey(supplierNumber, supplierSiteCode, contractNumber, attItemNumber) : null;
    var ciPartNumKey = supplierNumber && supplierSiteCode && contractNumber && supplierPartNumber ? abcCoLib.generateCiPartNumKey(supplierNumber, supplierSiteCode, contractNumber, supplierPartNumber) : null;
    var existingCiItem = ciItemKey ? step.getProductHome().getObjectByKey("Supplier.Item.Key", ciItemKey) : null;
    var existingCiPartNumItem = ciPartNumKey ? step.getProductHome().getObjectByKey("Supplier.PartNum.Key", ciPartNumKey) : null;
    var isCiUpdate = (existingCiItem || existingCiPartNumItem);
    if (isCiUpdate) {
        processCIBasedonKeys(existingCiItem, existingCiPartNumItem, ciItemKey, ciPartNumKey, contractItemAttributes, attItemNumber, supplierPartNumber, supplierNumber, supplierSiteCode, contractNumber, recId, priceBreakQty);
    } else {
        createNewContractItem(contractItemAttributes, ciItemKey, ciPartNumKey, supplierNumber, supplierSiteCode, contractNumber, recId, priceBreakQty);
    }
}

function processCIBasedonKeys(existingCiItem, existingCiPartNumItem, ciItemKey, ciPartNumKey, contractItemAttributes, attItemNumber, supplierPartNumber, supplierNumber, supplierSiteCode, contractNumber, recId, priceBreakQty) {
    var contractItem = "";
    if (attItemNumber && supplierPartNumber) {
        contractItem = processBothKeys(existingCiItem, existingCiPartNumItem, ciItemKey, ciPartNumKey, contractItemAttributes, supplierNumber, supplierSiteCode, contractNumber, recId, priceBreakQty);
    } else if (attItemNumber) {
        contractItem = processOnlyATTItemNumber(existingCiItem, ciItemKey, contractItemAttributes, supplierNumber, supplierSiteCode, contractNumber, recId, priceBreakQty);
    } else if (supplierPartNumber) {
        contractItem = processOnlySupplierPartNumber(existingCiPartNumItem, ciPartNumKey, contractItemAttributes, supplierNumber, supplierSiteCode, contractNumber, recId, priceBreakQty);
    } else {
        createNewContractItem(contractItemAttributes, ciItemKey, ciPartNumKey, supplierNumber, supplierSiteCode, contractNumber, recId, priceBreakQty);
    }
}
//Process when both ATTItemNumber and Supplier PN present
function processBothKeys(existingCiItem, existingCiPartNumItem, ciItemKey, ciPartNumKey, contractItemAttributes, supplierNumber, supplierSiteCode, contractNumber, recId, priceBreakQty) {
    if (existingCiItem && existingCiPartNumItem) {
        var itemID = existingCiItem.getID()
        var partNumID = existingCiPartNumItem.getID()
        if (itemID == partNumID) {
            updateCIAttributes(existingCiItem, contractItemAttributes, recId, priceBreakQty);
            return existingCiItem;
        } else {
            return null;
        }
    } else {
        return handleMissingKeys(existingCiItem, existingCiPartNumItem, ciItemKey, ciPartNumKey, contractItemAttributes, supplierNumber, supplierSiteCode, contractNumber, recId, priceBreakQty);
    }
}
//Process when only ATTItemNumber is present
function processOnlyATTItemNumber(existingCiItem, ciItemKey, contractItemAttributes, supplierNumber, supplierSiteCode, contractNumber, recId, priceBreakQty) {
    if (existingCiItem) {
        updateCIAttributes(existingCiItem, contractItemAttributes, recId, priceBreakQty);
        return existingCiItem;
    } else {
        return createNewContractItem(contractItemAttributes, ciItemKey, null, supplierNumber, supplierSiteCode, contractNumber, recId, priceBreakQty);
    }
}
//Process when only Supplier Part Num is present
function processOnlySupplierPartNumber(existingCiPartNumItem, ciPartNumKey, contractItemAttributes, supplierNumber, supplierSiteCode, contractNumber, recId, priceBreakQty) {
    if (existingCiPartNumItem) {
        updateCIAttributes(existingCiPartNumItem, contractItemAttributes, recId, priceBreakQty);
        return existingCiPartNumItem;
    } else {
        return createNewContractItem(contractItemAttributes, null, ciPartNumKey, supplierNumber, supplierSiteCode, contractNumber, recId, priceBreakQty);
    }
}
//Function to Handle missing keys and updtate attributes
function handleMissingKeys(existingCiItem, existingCiPartNumItem, ciItemKey, ciPartNumKey, contractItemAttributes, supplierNumber, supplierSiteCode, contractNumber, recId, priceBreakQty) {
    var contractItem = "";
    if (existingCiItem && !existingCiPartNumItem) {
        contractItem = existingCiItem;
        contractItem.getValue("SI_PartNum_Key").setSimpleValue(ciPartNumKey);
        updateCIAttributes(contractItem, contractItemAttributes, recId, priceBreakQty);
        return contractItem;
    } else if (!existingCiItem && existingCiPartNumItem) {
        contractItem = existingCiPartNumItem;
        contractItem.getValue("SI_Item_Key").setSimpleValue(ciItemKey);
        updateCIAttributes(contractItem, contractItemAttributes, recId, priceBreakQty);
        return contractItem;
    } else if (!existingCiItem && !existingCiPartNumItem) {
        return createNewContractItem(contractItemAttributes, ciItemKey, ciPartNumKey, supplierNumber, supplierSiteCode, contractNumber, recId, priceBreakQty);
    }
}

function createNewContractItem(contractItemAttributes, ciItemKey, ciPartNumKey, supplierNumber, supplierSiteCode, contractNumber, recId, priceBreakQty) {
    var bpaKey = supplierNumber + "_" + supplierSiteCode + "_" + contractNumber;
    var bpaHeaderObj = step.getProductHome().getObjectByKey("Supplier.Item.Key", bpaKey) || step.getProductHome().getObjectByKey("Supplier.PartNum.Key", bpaKey);
    if (!bpaHeaderObj) return;
    var newCI = bpaHeaderObj.createProduct(null, "Contract_Item");
    if (!newCI) return;
    if (ciItemKey) newCI.getValue("SI_Item_Key").setSimpleValue(ciItemKey);
    if (ciPartNumKey) newCI.getValue("SI_PartNum_Key").setSimpleValue(ciPartNumKey);
    contractItemAttributes.forEach(function(attr) {
        processAndUpdateAttribute(step, newCI, attr.attributeID, attr.value);
    });
    abcCoLib.setGSCFlagToY(newCI);
    abcCoLib.copyItemDescription(newCI);
    abcCoLib.setNodeName(newCI);
    libAudit.setDateTime(newCI, "SI_Pull_TimeStamp");
    if (!abcCoLib.isProcessedInOracle(newCI)) {
        newCI.getValue("SI_Action_Code").setLOVValueByID("A");
    }
    if (!priceBreakQty) {
        newCI.getValue("SI_Record_ID").setSimpleValue(recId);
    } else {
        newCI.getValue("Has_Price_Break").setLOVValueByID("Y");
    }
    var processedInCloud = newCI.getValue("SI_BPA_Processed_In_Cloud").getID();
    if (!processedInCloud) {
        newCI.getValue("SI_BPA_Processed_In_Cloud").setLOVValueByID("N");
    }
}

function updateCIAttributes(contractItem, contractItemAttributes, recId, priceBreakQty) {
    contractItemAttributes.forEach(function(attr) {
        processAndUpdateAttribute(step, contractItem, attr.attributeID, attr.value);
    });
    abcCoLib.setGSCFlagToY(contractItem);
    abcCoLib.copyItemDescription(contractItem);
    libAudit.setDateTime(contractItem, "SI_Pull_TimeStamp");
    if (abcCoLib.isProcessedInOracle(contractItem)) {
        contractItem.getValue("SI_Action_Code").setLOVValueByID("SYNC");
    }
    if (!priceBreakQty) {
        contractItem.getValue("SI_Record_ID").setSimpleValue(recId);
    } else {
        contractItem.getValue("Has_Price_Break").setLOVValueByID("Y");
    }
    contractItem.getValue("SI_Supplier_Catalog_Status").setSimpleValue(null);
    var processedInCloud = contractItem.getValue("SI_BPA_Processed_In_Cloud").getID();
    if (!processedInCloud) {
        contractItem.getValue("SI_BPA_Processed_In_Cloud").setLOVValueByID("N");
    }
}
//Function to process Price Break (Creation Only)
function processPriceBreakAttributes(priceBreakAttributes, item) {
    const {
        SupplierNumber: supplierNumber,
        SupplierSiteCode: supplierSiteCode,
        ContractNumber: contractNumber,
        SupplierPartNum: supplierPartNumber,
        ATTItemNumber: attItemNumber,
        PriceBreakQty: priceBreakQty,
        StgtblRecid: recId
    } = item;
    if (!priceBreakQty || priceBreakQty.trim() === "") {
        return;
    }
    var pbItemKey = supplierNumber && supplierSiteCode && contractNumber && attItemNumber ? abcCoLib.generatepbItemKey(supplierNumber, supplierSiteCode, contractNumber, attItemNumber, priceBreakQty) : null;
    var pbPartNumKey = supplierNumber && supplierSiteCode && contractNumber && supplierPartNumber ? abcCoLib.generatepbPartNumKey(supplierNumber, supplierSiteCode, contractNumber, supplierPartNumber, priceBreakQty) : null;
    var existingPbItem = pbItemKey ? step.getProductHome().getObjectByKey("Supplier.Item.Key", pbItemKey) : null;
    var existingPbPartNumItem = pbPartNumKey ? step.getProductHome().getObjectByKey("Supplier.PartNum.Key", pbPartNumKey) : null;
    var isPbUpdate = existingPbPartNumItem || existingPbItem;
    if (isPbUpdate) {
        processPbBasedonKeys(pbItemKey, pbPartNumKey, priceBreakAttributes, attItemNumber, supplierPartNumber, supplierNumber, supplierSiteCode, contractNumber, priceBreakQty, recId);
    } else {
        createNewpbItem(priceBreakAttributes, pbItemKey, pbPartNumKey, supplierNumber, supplierSiteCode, contractNumber, attItemNumber, supplierPartNumber, priceBreakQty, recId);
    }
}

function createNewpbItem(priceBreakAttributes, pbItemKey, pbPartNumKey, supplierNumber, supplierSiteCode, contractNumber, attItemNumber, supplierPartNumber, priceBreakQty, recId) {
    var ciPnkey = (supplierNumber ? supplierNumber.trim() : "") + "_" + (supplierSiteCode ? supplierSiteCode.trim() : "") + "_" + (contractNumber ? contractNumber.trim() : "") + "_" + (supplierPartNumber ? supplierPartNumber.trim() : "");
    var ciItemkey = (supplierNumber ? supplierNumber.trim() : "") + "_" + (supplierSiteCode ? supplierSiteCode.trim() : "") + "_" + (contractNumber ? contractNumber.trim() : "") + "_" + (attItemNumber ? attItemNumber.trim() : "");
    var ciPnObj = ciPnkey ? step.getProductHome().getObjectByKey("Supplier.PartNum.Key", ciPnkey) : null;
    var ciItemObj = ciItemkey ? step.getProductHome().getObjectByKey("Supplier.Item.Key", ciItemkey) : null;
    var newPB = (ciItemObj || ciPnObj) && priceBreakQty ? (ciItemObj || ciPnObj).createProduct(null, "Price_Break") : null;
    if (!newPB) return;
    if (pbItemKey) newPB.getValue("SI_Item_Key").setSimpleValue(pbItemKey);
    if (pbPartNumKey) newPB.getValue("SI_PartNum_Key").setSimpleValue(pbPartNumKey);
    priceBreakAttributes.forEach(function(attr) {
        processAndUpdateAttribute(step, newPB, attr.attributeID, attr.value);
    });
    abcCoLib.setGSCFlagToY(newPB);
    newPB.getValue("ABC_Update_Flag").setLOVValueByID("Y");
    newPB.getValue("SI_Record_ID").setSimpleValue(recId);
    libAudit.setDateTime(newPB, "SI_Pull_TimeStamp");
    abcCoLib.setNodeName(newPB);
}

function processPbBasedonKeys(pbItemKey, pbPartNumKey, priceBreakAttributes, attItemNumber, supplierPartNumber, supplierNumber, supplierSiteCode, contractNumber, priceBreakQty, recId) {
    var pbItem = attItemNumber && supplierPartNumber ? processPbBothKeys(pbItemKey, pbPartNumKey, priceBreakAttributes, attItemNumber, supplierPartNumber, supplierNumber, supplierSiteCode, contractNumber, priceBreakQty, recId) : attItemNumber ? processOnlyPbATTItemNumber(pbItemKey, priceBreakAttributes, attItemNumber, supplierNumber, supplierSiteCode, contractNumber, priceBreakQty, recId) : supplierPartNumber ? processOnlyPbSupplierPartNumber(pbPartNumKey, priceBreakAttributes, supplierPartNumber, supplierNumber, supplierSiteCode, contractNumber, priceBreakQty, recId) : createNewpbItem(priceBreakAttributes, pbItemKey, pbPartNumKey, supplierNumber, supplierSiteCode, contractNumber, attItemNumber, supplierPartNumber, priceBreakQty, recId);
}

function processPbBothKeys(pbItemKey, pbPartNumKey, priceBreakAttributes, attItemNumber, supplierPartNumber, supplierNumber, supplierSiteCode, contractNumber, priceBreakQty, recId) {
    var existingPbItem = step.getProductHome().getObjectByKey("Supplier.Item.Key", pbItemKey);
    var existingPbPartNumItem = step.getProductHome().getObjectByKey("Supplier.PartNum.Key", pbPartNumKey);
    if (existingPbItem && existingPbPartNumItem) {
        if (existingPbItem.getID() === existingPbPartNumItem.getID()) {
            updatePbAttributes(existingPbItem, priceBreakAttributes, recId);
            return existingPbItem;
        }
        return null;
    }
    return handleMissingPbKeys(existingPbItem, existingPbPartNumItem, pbItemKey, pbPartNumKey, priceBreakAttributes, supplierNumber, supplierSiteCode, contractNumber, attItemNumber, supplierPartNumber, priceBreakQty, recId);
}
//process when only pb ATTItemNumber is present
function processOnlyPbATTItemNumber(pbItemKey, priceBreakAttributes, attItemNumber, supplierNumber, supplierSiteCode, contractNumber, priceBreakQty, recId) {
    var pbItem = step.getProductHome().getObjectByKey("Supplier.Item.Key", pbItemKey);
    if (pbItem) {
        updatePbAttributes(pbItem, priceBreakAttributes, recId);
        return pbItem;
    } else {
        return createNewpbItem(priceBreakAttributes, pbItemKey, null, supplierNumber, supplierSiteCode, contractNumber, attItemNumber, null, priceBreakQty, recId);
    }
}
//process when only pb supplier part num is present
function processOnlyPbSupplierPartNumber(pbPartNumKey, priceBreakAttributes, supplierPartNumber, supplierNumber, supplierSiteCode, contractNumber, priceBreakQty, recId) {
    var pbItem = step.getProductHome().getObjectByKey("Supplier.PartNum.Key", pbPartNumKey);
    if (pbItem) {
        updatePbAttributes(pbItem, priceBreakAttributes, recId);
        return pbItem;
    } else {
        return createNewpbItem(priceBreakAttributes, null, pbPartNumKey, supplierNumber, supplierSiteCode, contractNumber, null, supplierPartNumber, priceBreakQty, recId);
    }
}
//Handle missing pb keys and updtate attribute accordingly
function handleMissingPbKeys(existingPbItem, existingPbPartNumItem, pbItemKey, pbPartNumKey, priceBreakAttributes, supplierNumber, supplierSiteCode, contractNumber, attItemNumber, supplierPartNumber, priceBreakQty, recId) {
    var pbItem = existingPbItem || existingPbPartNumItem;
    if (existingPbItem && !existingPbPartNumItem) {
        pbItem.getValue("SI_PartNum_Key").setSimpleValue(pbPartNumKey);
    } else if (!existingPbItem && existingPbPartNumItem) {
        pbItem.getValue("SI_Item_Key").setSimpleValue(pbItemKey);
    } else if (!existingPbItem && !existingPbPartNumItem) {
        return createNewpbItem(priceBreakAttributes, pbItemKey, pbPartNumKey, supplierNumber, supplierSiteCode, contractNumber, attItemNumber, supplierPartNumber, priceBreakQty, recId);
    }
    updatePbAttributes(pbItem, priceBreakAttributes, recId);
    return pbItem;
}

function updatePbAttributes(pbItem, priceBreakAttributes, recId) {
    if (pbItem.getValue("SI_Price_Break_End_Date").getSimpleValue()) {
        pbItem.getValue("SI_Price_Break_End_Date").setValue(null);
    }
    priceBreakAttributes.forEach(function(attr) {
        processAndUpdateAttribute(step, pbItem, attr.attributeID, attr.value);
    });
    abcCoLib.setGSCFlagToY(pbItem);
    pbItem.getValue("ABC_Update_Flag").setLOVValueByID("Y");
    libAudit.setDateTime(pbItem, "SI_Pull_TimeStamp");
    pbItem.getValue("SI_Record_ID").setSimpleValue(recId);
}

function processAndUpdateAttribute(step, node, attributeID, value) {
    var hasLov = step.getAttributeHome().getAttributeByID(attributeID).hasLOV();
    var processedValue = hasLov ? mapAttributeValue(step, node, value, attributeID) : processRawValue(attributeID, value);
    var trimmedValue = processedValue ? processedValue.trim() : "";
    var excSpecialChar = abcCoLib.replaceHtml(trimmedValue);
    try {
        if (hasLov) {
            if (trimmedValue) node.getValue(attributeID).setLOVValueByID(trimmedValue);
        } else {
            node.getValue(attributeID).setSimpleValue(excSpecialChar);
        }
    } catch (error) {
        throw ("Error setting value " + trimmedValue + " for attribute " + attributeID + error);
    }
}

function processRawValue(attributeID, value) {
    return (
        (attributeID === "SI_Price_Break_Start_Date" || attributeID === "SI_Price_Break_End_Date" || attributeID === "SI_Line_End_Date") && value) ? convertToISODate(value) : value;
}

function convertToISODate(dateString) {
    try {
        new java.text.SimpleDateFormat("yyyy-MM-dd").parse(dateString);
        return dateString;
    } catch (error) {
        var existingErrorsString = node.getValue("ABC_Validation_Errors").getSimpleValue() || "";
        var errorMessage = error.message;
        node.getValue("ABC_Validation_Errors").append().addValue(errorMessage).apply();
        throw new Error("Invalid date format");
    }
}

function mapAttributeValue(step, node, value, attributeID) {
    if (!value) return "";
    var lov = step.getAttributeHome().getAttributeByID(attributeID).getListOfValues();
    if (!lov) return "";
    try {
        if (!lov.getListOfValuesValueByID(value)) {
            throw Error("Value '" + value + "' not found in LOV for attribute '" + attributeID + "'.");
        }
        return value;
    } catch (error) {
        var existingErrorsString = node.getValue("ABC_Validation_Errors").getSimpleValue() || "";
        var errorMessage = error.message;
        if (existingErrorsString.indexOf(errorMessage) === -1) {
            node.getValue("ABC_Validation_Errors").append().addValue(errorMessage).apply();
        	  return "";
        }
    }
}

function setKey(node, step) {
    var keyValue = [
        node.getValue("SI_Supplier_Number").getValue(),
        node.getValue("SI_Supplier_Site").getValue(),
        node.getValue("SI_Master_Contract_Number").getValue()
    ].join("_");
    step.getKeyHome().updateUniqueKeyValues2({
        "SI_Item_Key": String(keyValue)
    }, node);
    step.getKeyHome().updateUniqueKeyValues2({
        "SI_PartNum_Key": String(keyValue)
    }, node);
}

function checkExistingKeys(node, step) {
    var errMsg = "";
    var currentObjectId = node.getID();
    var contractNumber = node.getValue("SI_Master_Contract_Number").getValue();
    var supplierNo = node.getValue("SI_Supplier_Number").getValue();
    var supplierSiteCode = node.getValue("SI_Supplier_Site").getValue();
    var keyValue = supplierNo + "_" + supplierSiteCode + "_" + contractNumber;
    var objByPartNum = step.getNodeHome().getObjectByKey("Supplier.PartNum.Key", keyValue);
    if (objByPartNum && objByPartNum.getID() !== currentObjectId) {
        errMsg += "\n" + objByPartNum.getID() + " exist with the same Master Contract Number and Supplier Site Code, please change to proceed";
    }
    var objByItemNum = step.getNodeHome().getObjectByKey("Supplier.Item.Key", keyValue);
    if (objByItemNum && objByItemNum.getID() !== currentObjectId) {
        if (!objByPartNum || objByPartNum.getID() === currentObjectId || objByPartNum.getID() !== objByItemNum.getID()) {
            errMsg += "\n" + objByItemNum.getID() + " exist with the same Master Contract Number and Supplier Site Code, please change to proceed";
        }
    }
    return errMsg;
}

function updateEndDateForUnprocessedPriceBreaks(node) {
    if (!node) return;
    node.getChildren().toArray().forEach(function(contractItem) {
        if (contractItem.getObjectType().getID() == "Contract_Item") {
            var contractItemGscFlag = contractItem.getValue("SI_GSC_Flag").getID();
            if (contractItemGscFlag == "Y") {
                contractItem.getChildren().toArray().forEach(function(priceBreak) {
                    var objecttype = priceBreak.getObjectType().getID();
                    var gscFlag = priceBreak.getValue("SI_GSC_Flag").getSimpleValue();
                    if (objecttype == "Price_Break" && !gscFlag) {
                        var currentDate = abcCoLib.getCurrentDate();
                        priceBreak.getValue("SI_Price_Break_End_Date").setValue(currentDate);
                        priceBreak.getValue("ABC_Update_Flag").setSimpleValue(null);
                    }
                });
            }
        }
    });
}

function countGscProcessedChildren(bpaHeader) {
    var count = 0;
    if (bpaHeader) {
        var children = bpaHeader.getChildren().toArray();
        children.forEach(function(child) {
            if (child.getObjectType().getID() == "Contract_Item") {
                var gscFlagValue = child.getValue("SI_GSC_Flag").getID();
                if (gscFlagValue == "Y") {
                    count++;
                }
            }
        });
    }
    return count;
}

function validateSupplierReference(node, stepManager) {
    var supplierReference = step.getLinkTypeHome().getClassificationProductLinkTypeByID("BPA_To_Supplier");
    var error = "";
    if (node.getClassificationProductLinks(supplierReference).size() == 0) {
        error = "Supplier Reference is Mandatory";
    }
    return error;
}
}