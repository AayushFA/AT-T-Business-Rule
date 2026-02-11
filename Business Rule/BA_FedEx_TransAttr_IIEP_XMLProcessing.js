/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_FedEx_TransAttr_IIEP_XMLProcessing",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Integration_Actions" ],
  "name" : "FedEx Transportation IIEP XML Processing Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Transportation_Derivation",
    "libraryAlias" : "transportationDerivationLib"
  }, {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonLib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "InboundBusinessProcessorExecutionReportLoggerBindContract",
    "alias" : "log",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "InboundBusinessProcessorImporterSourceBindContract",
    "alias" : "inboundMessage",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
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
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookupTable",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (log,inboundMessage,node,step,lookupTable,transportationDerivationLib,commonLib) {

var inputXmlMsg = inboundMessage.getMessage();
var db = javax.xml.parsers.DocumentBuilderFactory.newInstance().newDocumentBuilder();
var is = new org.xml.sax.InputSource();
is.setCharacterStream(new java.io.StringReader(inputXmlMsg));
var doc = db.parse(is);

// --- PKG attribute mapping (define once) ---
var pkgAttributes = [
  { xml: "PkgOrderingUOM", stibo: "TMS_Ordering_UOM", isLOV: true },
  { xml: "PkgUnitWeight", stibo: "TMS_Unit_Weight" },
  { xml: "PkgUnitLength", stibo: "TMS_Unit_Length" },
  { xml: "PkgUnitWidth", stibo: "TMS_Unit_Width" },
  { xml: "PkgUnitHeight", stibo: "TMS_Unit_Height" },
  { xml: "PkgUnitVolume", stibo: "TMS_Unit_Volume" },
  { xml: "PkgWeightUOM", stibo: "TMS_Weight_UOM" },
  { xml: "PkgDimensionUOM", stibo: "TMS_Dimension_UOM" },
  { xml: "PkgVolumeUOM", stibo: "TMS_Volume_UOM" },
  { xml: "PkgHazmatIndicator", stibo: "TMS_Hazmat_Indicator", isLOV: true },
  { xml: "PkgHazmatTriggerWeight", stibo: "TMS_Hazmat_Trigger_Weight" },
  { xml: "PkgHazmatTriggerWeightUOM", stibo: "TMS_Hazmat_Trigger_Weight_UOM" },
  { xml: "PkgHazmatClass", stibo: "TMS_Hazmat_Class" },
  { xml: "PkgHazmatIDUnnaNumber", stibo: "TMS_Hazmat_ID_Unna_Number" }
];

// --- HU attribute mapping (define once) ---
var huAttributes = [
  { xml: "ThuUOM", stibo: "TMS_Ordering_UOM", isLOV: true },
  { xml: "ThuHandlingUnitType", stibo: "TMS_Handling_Unit_Type" },
  { xml: "ThuHandlingUnitID", stibo: "TMS_Handling_Unit_ID" },
  { xml: "ThuLength", stibo: "TMS_Case_Length" },
  { xml: "ThuWidth", stibo: "TMS_Case_Width" },
  { xml: "ThuHeight", stibo: "TMS_Case_Height" },
  { xml: "ThuTareWeight", stibo: "TMS_Case_Tare_Weight" },
  { xml: "ThuVolume", stibo: "TMS_Case_Volume" },
  { xml: "ThuNumofInnerCartons", stibo: "TMS_Num_of_Inner_Cartons" },
  { xml: "ThuInnerPack", stibo: "TMS_Inner_Pack", isLOV: true },
  { xml: "ThuInnerPackEach", stibo: "TMS_Inner_Pack_Each" },
  { xml: "ThuInnerPackWeight", stibo: "TMS_Inner_Pack_Weight" },
  { xml: "ThuInnerPackLength", stibo: "TMS_Inner_Pack_Length" },
  { xml: "ThuInnerPackWidth", stibo: "TMS_Inner_Pack_Width" },
  { xml: "ThuInnerPackHeight", stibo: "TMS_Inner_Pack_Height" },
  { xml: "ThuCartonsPerLayer", stibo: "TMS_Cases_Per_Layer" },
  { xml: "ThuNumberOfLayersOnPallet", stibo: "TMS_Number_Of_Layers_On_Pallet" },
  { xml: "ThuEachQtyPerPallet", stibo: "TMS_Each_Qty_Per_Pallet" },
  { xml: "ThuPalletsPerContainer", stibo: "TMS_Pallets_Per_Container" },
  { xml: "ThuPalletsPerTL", stibo: "TMS_Pallets_Per_TL" },
  { xml: "ThuEachQtyPerTHU", stibo: "TMS_Each_Qty_Per_Container" },
  { xml: "ThuEachQtyPerTL", stibo: "TMS_Each_Qty_Per_TL" },
  { xml: "ThuTruckStackability", stibo: "TMS_Truck_Stackability" }
];

// --- Item attribute mapping (define once) ---
var itemAttributes = [
  { xml: "ItmTMSItemType", stibo: "TMS_Item_Type", isLOV: true },
  { xml: "ItmCountryOfOrigin", stibo: "TMS_Country_Of_Origin" },
  { xml: "ItmNMFC", stibo: "TMS_NMFC", isLOV: true },
  { xml: "ItmEquipmentType", stibo: "TMS_Equipment_Type", isLOV: true },
  { xml: "ItmIneligibleMode", stibo: "TMS_Ineligible_Mode", isLOV: true },
  { xml: "ItmSerializedProduct", stibo: "TMS_Serialized_Product", isLOV: true },
  { xml: "ItmNMFCArticleID", stibo: "TMS_NMFC_Article_ID" }
];

// --- Generic attribute extraction function ---
function extractAttributesFromNode(node, attributes) {
  var result = {};
  attributes.forEach(function(attr) {
    var xmlNode = node.getElementsByTagName(attr.xml).item(0);
    result[attr.xml] = xmlNode ? xmlNode.getTextContent().trim() : "";
  });
  return result;
}

function setNodeValuesFlexible(targetNode, values, attributes) {
  attributes.forEach(function(attr) {
    if (attr.isLOV) {
      targetNode.getValue(attr.stibo).setLOVValueByID(values[attr.xml]);
    } else {
      targetNode.getValue(attr.stibo).setSimpleValue(values[attr.xml]);
    }
  });
}

// =========================================================
// === ITEM/PACKAGE/HU ATTRIBUTE PROCESSING (HIERARCHICAL) ===
// =========================================================
var itemElement = doc.getElementsByTagName("item").item(0); // Only one <item>
var itemNumber = itemElement.getElementsByTagName("ItemNumber").item(0).getTextContent();
var organizationCode = itemElement.getElementsByTagName("OrganizationCode").item(0).getTextContent();
var sender = itemElement.getElementsByTagName("Sender").item(0).getTextContent();
log.logInfo("itemNumber: " + itemNumber);

var itemAttr = itemElement.getElementsByTagName("RTLTransportationItemAttr").item(0);
if (itemAttr) {
  var itemValues = extractAttributesFromNode(itemAttr, itemAttributes);
  var nodeHome = step.getNodeHome();
  var itemNode = nodeHome.getObjectByKey("Item.Key", itemNumber);
  if (itemNode) {
    setNodeValuesFlexible(itemNode, itemValues, itemAttributes);
    var partialApprovalList = commonLib.getAttributeGroupList(itemNode, step, "AG_Fedex_Trans_Item_Attr_Inbound");
    commonLib.partialApproveFields(itemNode, partialApprovalList);
  }
}

// --- For each Package under this Item ---
var packageAttrs = itemElement.getElementsByTagName("RTLTransportationPackageAttr");
for (var j = 0; j < packageAttrs.getLength(); j++) {
  var packageAttr = packageAttrs.item(j);
  log.logInfo("---- RTLTransportationPackageAttr #" + (j + 1) + " for itemNumber: " + itemNumber + " ----");

  var pkgValues = extractAttributesFromNode(packageAttr, pkgAttributes);
  var pkgOrderingUom = pkgValues["PkgOrderingUOM"];

  if (itemNumber && pkgOrderingUom) {
    var packageKey = itemNumber + "_" + pkgOrderingUom;
    log.logInfo("packageKey " + packageKey);

    var nodeHome = step.getNodeHome();
    var pkgNode = nodeHome.getObjectByKey("Transportation.Package.Key", packageKey);
    log.logInfo("pkgNode " + pkgNode);

    if (pkgNode) {
      log.logInfo("In Update ");
      setNodeValuesFlexible(pkgNode, pkgValues, pkgAttributes);
      var partialApprovalList = commonLib.getAttributeGroupList(pkgNode, step, "AG_Fedex_Trans_Pkg_Attr_Inbound");
      commonLib.partialApproveFields(pkgNode, partialApprovalList);
    } else {
      log.logInfo("In Create ");
      var parentNode = nodeHome.getObjectByKey("Item.Key", itemNumber);
      var newPkgNode = parentNode.createProduct(null, "Transportation_Package");
      step.getKeyHome().updateUniqueKeyValues2(
        { "Transportation_Package_Key": String(packageKey) },
        newPkgNode
      );
      setNodeValuesFlexible(newPkgNode, pkgValues, pkgAttributes);
      
//    var partialApprovalList = commonLib.getAttributeGroupList(newPkgNode, step, "AG_Fedex_Trans_Pkg_Attr_Inbound");
//    commonLib.partialApproveFields(newPkgNode, partialApprovalList);
//    Adding full approval instead of partial approval in case of Creation Scenario 

	 newPkgNode.approve();	//PKG CREATE 
      
    }
  } else {
    log.logInfo("Package key attributes missing, skipping package node creation/update.");
  }

  // --- For each HU under this Package ---
  var huAttrs = packageAttr.getElementsByTagName("RTLTransportationHUAttr");
  for (var m = 0; m < huAttrs.getLength(); m++) {
    var huAttr = huAttrs.item(m);
    log.logInfo("---- RTLTransportationHUAttr #" + (m + 1) + " under Package #" + (j + 1) + " for itemNumber: " + itemNumber + " ----");

    var huValues = extractAttributesFromNode(huAttr, huAttributes);
    var thuUom = huValues["ThuUOM"];
    var thuHandlingUnitType = huValues["ThuHandlingUnitType"];
    var thuHandlingUnitId = huValues["ThuHandlingUnitID"];

    if (itemNumber && thuUom && thuHandlingUnitType && thuHandlingUnitId) {
      var huKey = itemNumber + "_" + thuUom + "_" + thuHandlingUnitType + "_" + thuHandlingUnitId;
      log.logInfo("huKey " + huKey);

      var huNode = nodeHome.getObjectByKey("Transportation.Handling.Unit.Key", huKey);
      log.logInfo("huNode " + huNode);

      if (huNode) {
        log.logInfo("In HU Update ");
        
        setNodeValuesFlexible(huNode, huValues, huAttributes);

    //  log.logInfo("itemNumber " + itemNumber);
    //  log.logInfo("itemNode " + itemNode);

	   transportationDerivationLib.setCartonWeight(itemNode);
	   transportationDerivationLib.setEachesPerPallet(itemNode);
	   transportationDerivationLib.setPalletDimension(itemNode,lookupTable);
	   transportationDerivationLib.setEachesPerLayer(itemNode);
        
        var partialApprovalList = commonLib.getAttributeGroupList(huNode, step, "AG_Fedex_Trans_HU_Attr_Inbound");
        commonLib.partialApproveFields(huNode, partialApprovalList);
        
      } else {
        log.logInfo("In HU Create ");
        
        var parentNode = nodeHome.getObjectByKey("Item.Key", itemNumber);
        
        var newHuNode = parentNode.createProduct(null, "Transportation_Handling_Unit");
        
        step.getKeyHome().updateUniqueKeyValues2(
          { "Transportation_Handling_Unit_Key": String(huKey) },
          newHuNode
        );
        
        setNodeValuesFlexible(newHuNode, huValues, huAttributes);

	   transportationDerivationLib.setCartonWeight(itemNode);
	   transportationDerivationLib.setEachesPerPallet(itemNode);
	   transportationDerivationLib.setPalletDimension(itemNode,lookupTable);
	   transportationDerivationLib.setEachesPerLayer(itemNode);
        
//      var partialApprovalList = commonLib.getAttributeGroupList(newHuNode, step, "AG_Fedex_Trans_HU_Attr_Inbound");
//      commonLib.partialApproveFields(newHuNode, partialApprovalList);

//      Adding full approval instead of partial approval in case of Creation Scenario 

	   newHuNode.approve();  	//HU CREATE 
        
      }
    } else {
      log.logInfo("HU key attributes missing, skipping HU node creation/update.");
    }
  }
}

}