/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_WebUI_Transp_Handling_Unit_Create",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Transportation_Attribute_Action" ],
  "name" : "WebUI Transportation Handling Unit Create Action",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Companion_SKU", "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Transportation_Validation",
    "libraryAlias" : "transpValLib"
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
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "orderingUOM",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Ordering_UOM</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "handlingUnitType",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Handling_Unit_Type</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "handlingUnitID",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Handling_Unit_ID</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "caseLength",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Case_Length</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "caseWidth",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Case_Width</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "caseHeight",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Case_Height</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "caseTareWeight",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Case_Tare_Weight</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "caseVolume",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Case_Volume</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "eachQtyPerCase",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Each_Qty_Per_Case</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "numofInnerCartons",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Num_of_Inner_Cartons</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "innerPack",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Inner_Pack</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "innerPackLength",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Inner_Pack_Length</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "innerPackWidth",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Inner_Pack_Width</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "innerPackHeight",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Inner_Pack_Height</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "casesPerLayer",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Cases_Per_Layer</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "numberOfLayersOnPallet",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Number_Of_Layers_On_Pallet</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "palletsPerContainer",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Pallets_Per_Container</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "tmsTruckStackability",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Truck_Stackability</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "maxLengthOnReelFT",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_MaxLength_On_ReelFT</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "nestedItemMaxStackableQty",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Nested_Item_Max_Stackable_Qty</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "nestedItemIncrementalVolume",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Nested_Item_Incremental_Volume</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "nestedItemIncrementalVolumeUOM",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Nested_Item_Incremental_Volume_UOM</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webui",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "eachQtyPerPallet",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Each_Qty_Per_Pallet</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "palletsPerTL",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Pallets_Per_TL</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  }, {
    "contract" : "AttributeValidatedContextParameterStringBinding",
    "alias" : "eachesPerLayer",
    "parameterClass" : "com.stibo.core.domain.businessrule.attributecontextparameter.AttributeValidatedContextParameter",
    "value" : "<AttributeValidatedContextParameter>\n  <Parameters>\n    <Parameter ID=\"Attribute\" Type=\"java.lang.String\">TMS_Eaches_Per_Layer</Parameter>\n    <Parameter ID=\"ID\" Type=\"java.lang.String\"></Parameter>\n  </Parameters>\n</AttributeValidatedContextParameter>",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,orderingUOM,handlingUnitType,handlingUnitID,caseLength,caseWidth,caseHeight,caseTareWeight,caseVolume,eachQtyPerCase,numofInnerCartons,innerPack,innerPackLength,innerPackWidth,innerPackHeight,casesPerLayer,numberOfLayersOnPallet,palletsPerContainer,tmsTruckStackability,maxLengthOnReelFT,nestedItemMaxStackableQty,nestedItemIncrementalVolume,nestedItemIncrementalVolumeUOM,webui,eachQtyPerPallet,palletsPerTL,eachesPerLayer,transpValLib) {
/*
 * author: aw240u
 */

if (!handlingUnitID || !handlingUnitType) {
    webui.showAlert("ERROR", "Mandatory Errors", "Please fill Mandatory fields");
} else {
    var errorMsg = transpValLib.validateHU(node, orderingUOM, handlingUnitType, handlingUnitID);
    if (errorMsg) {
        webui.showAlert("ERROR", "HU Creation Error", errorMsg);
        return;
    }
    
    var itemNum = node.getValue("Item_Num").getSimpleValue();
    var huKey = itemNum +"-"+ orderingUOM +"-"+ handlingUnitType +"-"+ handlingUnitID;
    var handlingUnit = node.createProduct(null, "Transportation_Handling_Unit");
    //handlingUnit.getValue("TMS_Carton_Weight").setSimpleValue(CartonWeight);
    handlingUnit.getValue("Transportation_Handling_Unit_Key").setSimpleValue(huKey);
    handlingUnit.getValue("TMS_Case_Height").setSimpleValue(caseHeight);
    handlingUnit.getValue("TMS_Case_Length").setSimpleValue(caseLength);
    handlingUnit.getValue("TMS_Cases_Per_Layer").setSimpleValue(casesPerLayer);
    handlingUnit.getValue("TMS_Case_Tare_Weight").setSimpleValue(caseTareWeight);
    handlingUnit.getValue("TMS_Case_Volume").setSimpleValue(caseVolume);
    handlingUnit.getValue("TMS_Case_Width").setSimpleValue(caseWidth);
    //handlingUnit.getValue("TMS_Eaches_Per_Layer").setSimpleValue(eachesPerLayer);
    handlingUnit.getValue("TMS_Each_Qty_Per_Case").setSimpleValue(eachQtyPerCase);
    //handlingUnit.getValue("TMS_Each_Qty_Per_Container").setSimpleValue(eachQtyPerContainer);
    //handlingUnit.getValue("TMS_Each_Qty_Per_Pallet").setSimpleValue(eachQtyPerPallet);
    //handlingUnit.getValue("TMS_Each_Qty_Per_TL").setSimpleValue(eachQtyPerTL);
    handlingUnit.getValue("TMS_Handling_Unit_ID").setLOVValueByID(handlingUnitID);
    handlingUnit.getValue("TMS_Handling_Unit_Type").setLOVValueByID(handlingUnitType);
    handlingUnit.getValue("TMS_Inner_Pack").setLOVValueByID(innerPack);
    //handlingUnit.getValue("TMS_Inner_Pack_Each").setSimpleValue(innerPackEach);
    handlingUnit.getValue("TMS_Inner_Pack_Height").setSimpleValue(innerPackHeight);
    handlingUnit.getValue("TMS_Inner_Pack_Length").setSimpleValue(innerPackLength);
    //handlingUnit.getValue("TMS_Inner_Pack_Weight").setSimpleValue(innerPackWeight);
    handlingUnit.getValue("TMS_Inner_Pack_Width").setSimpleValue(innerPackWidth);
    handlingUnit.getValue("TMS_MaxLength_On_ReelFT").setSimpleValue(maxLengthOnReelFT);
    handlingUnit.getValue("TMS_Nested_Item_Incremental_Volume").setSimpleValue(nestedItemIncrementalVolume);
    handlingUnit.getValue("TMS_Nested_Item_Incremental_Volume_UOM").setLOVValueByID(nestedItemIncrementalVolumeUOM);
    handlingUnit.getValue("TMS_Nested_Item_Max_Stackable_Qty").setSimpleValue(nestedItemMaxStackableQty);
    handlingUnit.getValue("TMS_Number_Of_Layers_On_Pallet").setSimpleValue(numberOfLayersOnPallet);
    handlingUnit.getValue("TMS_Eaches_Per_Layer").setSimpleValue(eachesPerLayer);   
    handlingUnit.getValue("TMS_Num_of_Inner_Cartons").setSimpleValue(numofInnerCartons);
    handlingUnit.getValue("TMS_Ordering_UOM").setLOVValueByID(orderingUOM);
    //handlingUnit.getValue("TMS_Pallet_Height").setSimpleValue(palletHeight);
    //handlingUnit.getValue("TMS_Pallet_Length").setSimpleValue(palletLength);
    handlingUnit.getValue("TMS_Pallets_Per_Container").setSimpleValue(palletsPerContainer);
    handlingUnit.getValue("TMS_Pallets_Per_TL").setSimpleValue(palletsPerTL);
    //handlingUnit.getValue("TMS_Pallet_Width").setSimpleValue(palletWidth);
    handlingUnit.getValue("TMS_Truck_Stackability").setSimpleValue(tmsTruckStackability);
    handlingUnit.getValue("Parent_Item_Number").setSimpleValue(itemNum);
    webui.showAlert("INFO", "Handling Unit", "--Created--");
}
}