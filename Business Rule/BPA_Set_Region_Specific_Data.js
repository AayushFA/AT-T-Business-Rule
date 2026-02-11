/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BPA_Set_Region_Specific_Data",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "Set Region Specific Data",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item" ],
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
    "contract" : "EntityBindContract",
    "alias" : "regionDCRoot",
    "parameterClass" : "com.stibo.core.domain.impl.entity.FrontEntityImpl$$Generated$$10",
    "value" : "BPA_Region_DC_Hierarchy",
    "description" : null
  }, {
    "contract" : "QueryHomeBindContract",
    "alias" : "query",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "BPA_Region",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "BPA_Region",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "itemRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ContractItem_Item",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,regionDCRoot,query,BPA_Region,itemRef) {
/**
 * @author - Piyal [CTS]
 * Setting the Region dc attribute in zoom for WRLN/WRLN-NON  BPA
 */
log.info("Set Region Specific Data start");
var objectType = null;
var lob = null;
var Material_Item_Type = null;
var Region_Distribution_Center = null; // Multivalued LOV
var c = com.stibo.query.condition.Conditions;
var querySpecification = null;
var queryResult = null;
var itemrefData = null;
var attItemObj = null;
var listMatType_Region = new java.util.HashMap();
var query = step.getHome(com.stibo.query.home.QueryHome);

objectType = node.getObjectType().getID();

if (objectType == 'Contract_Item') {
    lob = node.getValue("Legacy_Source").getID();
    itemrefData = node.queryReferences(itemRef).asList(1);
    if (itemrefData.size() > 0) {
        attItemObj = itemrefData.get(0).getTarget();
        //attItemObj.getValue("Line_Of_Business").getLOVValue().getID()
        if (lob == "WRLN" || lob == "WRLN_NON") {
            fetchRegionDCData(attItemObj)
            populateRegionZoomData(listMatType_Region, node);
        } else if (lob == "RTL") { // RTL 
            populateRegionRTLZoomData(node, attItemObj);
        } else { // Always ENT
            populateRegionENTZoomData(node, attItemObj);
        }
    }
}

function fetchRegionDCData(attItemObj) {
    var valID = null;
    var BPA_RegionDC_Key = null;
    var listMatType_RegionTemp = new java.util.HashMap();
    Material_Item_Type = attItemObj.getValue("Material_Item_Type").getID();
    Region_Distribution_Center = attItemObj.getValue("Region_Distribution_Center").getValues();

    if (Material_Item_Type != null && Region_Distribution_Center != null) {
        for (var i = 0; i < Region_Distribution_Center.size(); i++) {
            valID = Region_Distribution_Center.get(i).getID();
            //BPA_RegionDC_Key=Material_Item_Type+"."+valID;

            // listMatType_Region.add(BPA_RegionDC_Key);//list implementation
            listMatType_RegionTemp.put(valID, Material_Item_Type);
        }
    }

    if (listMatType_RegionTemp.containsKey("All Regions")) {
        listMatType_Region.put("All Regions", listMatType_RegionTemp.get("All Regions"));

    } else {
        listMatType_Region.putAll(listMatType_RegionTemp);
    }

}

function populateRegionZoomData(listMatType_Region, contractItemNode) {
    var BPA_RegionDC_Key = null;
    var entObj = null;
    var children = null;
    var regionDC = null;
    var cfasCompCode = null;
    var childStates = null;
    var stateObj = null;
    var state = null;
    var zips = null;
    var zip = null;
    var childCC = null;
    var keySet = null;
    var matType = null;
    var regionDC = null;
    var regionDCVal = null;
    var attrBPA_RegionDC_Key = step.getAttributeHome().getAttributeByID("BPA_RegionDC_Key");
    var attrMaterial_Type = step.getAttributeHome().getAttributeByID("Material_Type");
    var attrRegionCode = step.getAttributeHome().getAttributeByID("Region_Code")
    c = com.stibo.query.condition.Conditions;
    resetDataContainer("Region");
    keySet = listMatType_Region.keySet().iterator();

    while (keySet.hasNext()) {
        region = keySet.next();

        matType = listMatType_Region.get(region);
        log.info("regionDC" + region);
        log.info("matType" + matType);
        querySpecification = query.queryFor(com.stibo.core.domain.entity.Entity).where(c.valueOf(attrMaterial_Type).eq(matType).and(c.valueOf(attrRegionCode).eq(region)).and(c.objectType(BPA_Region)));
        queryResult = querySpecification.execute().asList(500);
        //log.info("queryResult"+queryResult.size());
        if (queryResult != null && queryResult.size() > 0) {
            for (var i = 0; i < queryResult.size(); i++) {
                entObj = queryResult.get(i);
                log.info("entObj name" + entObj.getName());
                cfasCompCode = entObj.getValue("CFAS_CO_Code").getID();
                zip = entObj.getValue("ZIP").getID();
                state = entObj.getValue("STATE").getID();
                log.info("state" + state);
                if (cfasCompCode != null) {
                    regionDC = contractItemNode.getDataContainerByTypeID("Region").addDataContainer().createDataContainerObject(null);
                    regionDC.getValue("CFAS_CO_Code").setLOVValueByID(cfasCompCode);
                    regionDC.getValue("BPA_Region_Distribution_Center").setLOVValueByID(region);
                    if (state != null) {
                        regionDC.getValue("STATE").setLOVValueByID(state);
                    }
                    if (zip != null) {
                        regionDC.getValue("ZIP").setLOVValueByID(zip);
                    }
                    regionDC.getValue("Regional_Status").setLOVValueByID("ACTIVE");
                    regionDC.getValue("ZIP_Action").setLOVValueByID("INCLUDE");
                }
            }
        }
    }
}

function resetDataContainer(region) {
    node.getDataContainerByTypeID(region).deleteLocal();
}


function populateRegionENTZoomData(node, attItemObj) {
    var regionDC = null;
    regionDC = node.getDataContainerByTypeID("Region").addDataContainer().createDataContainerObject(null);
    regionDC.getValue("CFAS_CO_Code").setLOVValueByID("ZB");
    regionDC.getValue("Regional_Status").setLOVValueByID("ACTIVE");
    regionDC.getValue("ZIP_Action").setLOVValueByID("INCLUDE");
}

function populateRegionRTLZoomData(node, attItemObj) {
    var regionDC = null;
    regionDC = node.getDataContainerByTypeID("Region").addDataContainer().createDataContainerObject(null);
    regionDC.getValue("CFAS_CO_Code").setLOVValueByID("ZB");
    regionDC.getValue("Regional_Status").setLOVValueByID("ACTIVE");
    regionDC.getValue("ZIP_Action").setLOVValueByID("INCLUDE");

    var inventoryCatENT = attItemObj.getValue("Inventory_Cat_ENT").getLOVValue();
    if (inventoryCatENT) {
        inventoryCatENT = inventoryCatENT.getID().toLowerCase();
        if (inventoryCatENT.includes("collateral")) {
            regionDC = node.getDataContainerByTypeID("Region").addDataContainer().createDataContainerObject(null);
            regionDC.getValue("CFAS_CO_Code").setLOVValueByID("SS00");
            regionDC.getValue("Regional_Status").setLOVValueByID("ACTIVE");
            regionDC.getValue("ZIP_Action").setLOVValueByID("INCLUDE");
        }
    }
}
}