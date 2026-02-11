/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_SPL_Derivation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Derivation_Libraries" ],
  "name" : "SPL Derivation Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Child_Org_Retail_Derivation",
    "libraryAlias" : "retailChildOrgLib"
  }, {
    "libraryId" : "AT&T_Audit_Library",
    "libraryAlias" : "auditLib"
  }, {
    "libraryId" : "BL_Item_UNSPSC_Derivation",
    "libraryAlias" : "unspscLib"
  }, {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonDerivationLib"
  }, {
    "libraryId" : "BL_Item_Retail_Derivation",
    "libraryAlias" : "retailDerivationLib"
  }, {
    "libraryId" : "BL_Generate_UPC_GTIN",
    "libraryAlias" : "upcGTINLib"
  }, {
    "libraryId" : "BL_Generate_Item_Number",
    "libraryAlias" : "itmGenLib"
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
/***
 * @author Aditya,Madhuri
 */
/*************************** Common Functions ***************************/
function getAllSPLWorkflowTasks(manager, queryHome, condition) {
  var splWorkflow = manager.getWorkflowHome().getWorkflowByID("SPI_Onboarding");
  var querySpecification = queryHome.queryWorkflowTasks().where(condition.workflow().eq(splWorkflow));
  return querySpecification.execute();
}
/*************************** Apple Set Default Attributes ***************************/
function setBatchId(node,stepManager){
	var currentTime = new Date();
	var month = (currentTime.getMonth() + 1).toString().padStart(2, "0"); //06
	var year = currentTime.getFullYear();
	var currentNumber = "R"+year+month  //R240406
	var seriesNumber;
	var entity = stepManager.getEntityHome().getEntityByID("RTL_Item_Type");
	var currentBatchId = entity.getValue("Batch_Id").getSimpleValue();//R202405_10

	if(currentBatchId){
		 seriesNumber = currentBatchId.split("_")
		if(seriesNumber[0] != currentNumber){
		  currentBatchId = currentNumber+"_01";
		  entity.getValue("Batch_Id").setSimpleValue(currentBatchId);//R202406_01
		  node.getValue("Batch_Id").setValue(currentBatchId);
		}
		else
		   node.getValue("Batch_Id").setValue(currentBatchId);
	}
	else{
	   entity.getValue("Batch_Id").setSimpleValue(currentNumber+"_01");
	   node.getValue("Batch_Id").setValue(currentNumber+"_01");
	}
}

function setAppleDefaultAttributes(node,stepManager,queryHome,lookupTable){
    var appleLob = node.getValue("Apple_LoB").getID();	
	setAttributeValue(node,appleLob,lookupTable,"RTL_Item_Type");
	setAttributeValue(node,appleLob,lookupTable,"User_Item_Type_RTL");
	setAttributeValue(node,appleLob,lookupTable,"Inventory_Cat_RTL");	
	setAttributeValue(node,appleLob,lookupTable,"Description_Prefix");
	setAttributeValue(node,appleLob,lookupTable,"Tier");
	deriveMarketPrice(node, appleLob,lookupTable,"Market_Price");
	derivePalletQty(node);
	setDefaultValues(node,stepManager,lookupTable);
	setBatteryForm(node,lookupTable);
	setDimensionUnit(node,appleLob,lookupTable);
	commonDerivationLib.setHazmatUnNumber(node,lookupTable);
	commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Cat_Group_Name", "RTL_Catalog_Group_Name", "LOV");
	commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","COGS_Account", "RTL_COGS_Account", "LOV");
	commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Description_Prefix", "RTL_Description_Prefix", "LOV");
	commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Item_Class", "RTL_Item_Class", "LOV");
	commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Product_Class", "RTL_Product_Class", "LOV");
	commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Product_Sub_Type", "RTL_Product_Sub_Type", "LOV");
	commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Product_Type", "RTL_Product_Type", "LOV");
	commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Purchasing_Cat_RTL", "RTL_Purchasing_Cat", "LOV");
	commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Sales_Account", "RTL_Sales_Account", "LOV");
	commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Send_Item_Info", "RTL_Send_Item_Info", "LOV");
	commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","No_Commit_Fee_Eligible", "RTL_No_Commitment_Fee_Eligible", "LOV");
	commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Returnable", "ESI_Returnable_Flag", "LOV");
	commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Reservable", "RTL_Reservable_Flag", "LOV");
	commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Inventory_Asset_Value", "ESI_Inventory_Asset_Value", "LOV");
	commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","Inventory_Item", "ESI_Inventory_Item", "LOV");
	commonDerivationLib.deriveBasedOnItemType(node,stepManager,"RTL","User_Item_Type_RTL", "RTL_User_Item_Type", "LOV");
	unspscLib.createUNSPSCReference(node,stepManager,queryHome) //Auto Classification of Item to UNSPSC
}

function setDefaultValues(node,stepManager,lookupTable)
{
	var defaultAttributes = lookupTable.getLookupTableValue("LT_SPL_Apple_Default_Attribute_Mapping", "defaultAttributes");
	var defaultAttributesArray = defaultAttributes.split(",");
	defaultAttributesArray.forEach(function(attribute) {
		var lookupResult = lookupTable.getLookupTableValue("LT_SPL_Apple_Default_Attribute_Mapping", attribute);
		if (lookupResult) {
			setLookupResult(node,attribute,lookupResult);
		}
    });
}

function setAttributeValue(node,appleLob,lookupTable,attribute){
	if(!node.getValue(attribute).getSimpleValue()){
		var lookupResult = lookupTable.getLookupTableValue("LT_SPL_Apple_Default_Attribute_Mapping", attribute+"|"+appleLob);
		if (lookupResult) {
			setLookupResult(node,attribute,lookupResult)
		}		  
	}	
}

function setLookupResult(node,attribute,lookupResult) {
	const mapComp = lookupResult.toString().split("\\|");
 	var attributeValue = mapComp[0];
	var attributeType = mapComp[1];
	if (attributeType == "LOV") {
		node.getValue(attribute).setLOVValueByID(attributeValue);
	} else if (attributeType == "Text") {
		node.getValue(attribute).setSimpleValue(attributeValue);
	}
}

function setBatteryForm(node,lookupTable){	
	var cells = node.getValue("Battery_Num_Cells").getValue();
	if(parseInt(cells) == 1){
	   var lookupResult = lookupTable.getLookupTableValue("LT_SPL_Apple_Default_Attribute_Mapping", "Battery_Form|1");
	 }
	if(parseInt(cells) >1){
	   var lookupResult = lookupTable.getLookupTableValue("LT_SPL_Apple_Default_Attribute_Mapping", "Battery_Form|>1");
	 }
	 if (lookupResult) {
		setLookupResult(node,"Battery_Form",lookupResult)
	}
}
	
function setDimensionUnit(node,appleLob,lookupTable){
    var dimensionHeight = node.getValue("Dimension_Height").getValue();
	var dimensionLength = node.getValue("Dimension_Length").getValue();
	var dimensionWidth = node.getValue("Dimension_Width").getValue();
	if(dimensionHeight || dimensionLength || dimensionWidth)	{	   
	   setAttributeValue(node,appleLob,lookupTable,"Dimension_Unit")
	}
}
/*************************** Apple My Supply Attributes Derivation Functions ***************************/
function setSPLMySupplyAttributes(currentNode, manager, bfRemoveJunkChar, bfRemoveJunkCharDevice, splLookup) {
  var supplier = currentNode.getValue("SPI_Supplier_Name").getSimpleValue();
  var appleLob = currentNode.getValue("Apple_LoB").getID();
  deriveWatchModel(currentNode, appleLob);
  deriveProductColor(currentNode, appleLob, splLookup);
  deriveModelNo(currentNode, appleLob, splLookup);
  deriveBandType(currentNode, appleLob, splLookup);
  deriveBandSize(currentNode, appleLob, splLookup);
  /**STIBO-3376 Remove transformation Logic as field is editable, hence commented **/
  //deriveMarketingNameAndFeatures(currentNode, appleLob, splLookup);
  //deriveIMEIType(currentNode, appleLob);
  setAttributeValue(currentNode,appleLob,splLookup,"Tier");
  deriveUDCParentModel(currentNode, appleLob)
  deriveMarketPrice(currentNode, appleLob,splLookup,"Market_Price");
  derivePalletQty(currentNode);
  commonDerivationLib.removeJunkChars(currentNode,manager,"Long_Description",bfRemoveJunkChar);
  commonDerivationLib.removeJunkChars(currentNode,manager,"Model",bfRemoveJunkCharDevice);
  commonDerivationLib.removeJunkChars(currentNode,manager,"Marketing_Name",bfRemoveJunkCharDevice);
  commonDerivationLib.convertToUpperCase(currentNode,"Marketing_Name");
  commonDerivationLib.convertToUpperCase(currentNode,"Model");
  retailDerivationLib.convertToUpperCaseMfgPartNoAndItemDesc(currentNode);
  currentNode.getValue("Submitted_Date").setSimpleValue(commonDerivationLib.getCurrentDate());
  commonDerivationLib.setSerialGeneration(currentNode,"RTL",manager);
  commonDerivationLib.copyAttributeValue(currentNode, "Serial_Type","IMEI_Type","LOV");
  if (!currentNode.getValue("UPC").getSimpleValue())
    currentNode.getValue("Generate_New_UPC").setLOVValueByID("Y");
  else
    currentNode.getValue("Generate_New_UPC").setLOVValueByID("N"); 
}

function deriveUDCParentModel(node, appleLob) {
  var udcParentModel = "";
  var features = node.getValue("Features").getSimpleValue();
  var model = node.getValue("Model").getSimpleValue();
  var currentParentModel = node.getValue("Parent_Model").getSimpleValue();
  if (!currentParentModel) {
    if (appleLob == "iPhone" || appleLob == "iPad") {
      if (features && model) {
        udcParentModel = features + "_" + model;
      }
      if (!features && model) {
        udcParentModel = model;
      }
    } else if ((appleLob == "Watch" || appleLob == "Apple Watch") && model) {
      if (model.includes(" ")) {
        var part1 = model.substring(0, model.indexOf(" ") + 1);
        var part2 = model.substring(model.lastIndexOf(" "));
        if (features) {
          udcParentModel = features + "_" + part1.trim() + part2.trim();
        } else {
          udcParentModel = part1.trim() + part2.trim();
        }
      } else {
        if (features && model) {
          udcParentModel = features + "_" + model;
        }
        if (!features && model) {
          udcParentModel = model;
        }
      }
    }
    node.getValue("Parent_Model").setSimpleValue(udcParentModel);
  }
}

function deriveMarketPrice(node, appleLob,lookupTable,attribute) { //Do not popuate for iPad -- STIBO-3376
  if (!node.getValue(attribute).getSimpleValue()) {
  	var lookupResult = lookupTable.getLookupTableValue("LT_SPL_Apple_Default_Attribute_Mapping", attribute+"|"+appleLob);
	if (lookupResult) {
		const mapComp = lookupResult.toString().split("\\|");
		var attributeValue = mapComp[0];
		var price = "";
		var dac = node.getValue("Requested_Standard_Cost").getSimpleValue();
		if (dac) {
		    price = (parseFloat(dac) + parseFloat(attributeValue)).toFixed(2);
		    node.getValue(attribute).setSimpleValue(price);
		}
	}   
  }
}

function approveCarrierDC(node, idArray) {
  var set = new java.util.HashSet();
  var setUnapproved = node.getNonApprovedObjects();
  var unapprovedIterator = setUnapproved.iterator();
  while (unapprovedIterator.hasNext()) {
    var partObject = unapprovedIterator.next();
    var partObjectString = partObject.toString();
    if(partObjectString.indexOf("DataContainerPartObject") != -1&& idArray.indexOf(String(partObject.getDataContainerTypeID())) != -1) {     
      set.add(partObject);
    }
  }
  if (set.size() > 0) {
    node.approve(set);
  }
}

function createCarrierDC(node, companionSKU, step) {
  var carrierDCIterator = node.getDataContainerByTypeID("DC_Carrier").getDataContainers().iterator();
  while (carrierDCIterator.hasNext()) {
    var carrierDCObject = carrierDCIterator.next().getDataContainerObject();
    var carrierName = carrierDCObject.getValue("Carrier_Name").getSimpleValue();
    if (carrierName.startsWith("APPLE"))
      var carrierMPN = carrierDCObject.getValue("Carrier_MPN").getSimpleValue();
    else
      var carrierMPN = "COMP_SKU_MPN";
    var dcKey = step.getHome(com.stibo.core.domain.datacontainerkey.keyhome.DataContainerKeyHome).getDataContainerKeyBuilder("DC_Carrier")
      .withAttributeValue("Carrier_MPN", carrierMPN)
      .withAttributeValue("Carrier_Name", carrierName)
      .build();
     companionSKU.getDataContainerByTypeID("DC_Carrier").addDataContainer().createDataContainerObjectWithKey(dcKey);
  }
}

function setAttributesNull(currentNode) {
  currentNode.getValue("Mfg_Part_No").setSimpleValue("");
  currentNode.getValue("Apple_LoB").setSimpleValue(""); 
  currentNode.getValue("SPI_Supplier_Name").setSimpleValue("");
  currentNode.getValue("Batch_Id").setSimpleValue("");
  currentNode.getValue("Config_Code").setSimpleValue("");
}

function deleteKey(node, manager) {
  var supplierKey = node.getValue("Supplier_Mfg_Part_No").getSimpleValue();
  var itemKey = node.getValue("Item_Num").getSimpleValue();
  var upcKey = node.getValue("UPC").getSimpleValue();
  if (supplierKey) {
    manager.getKeyHome().updateUniqueKeyValues2({
      "Supplier_Mfg_Part_No": String("")
    }, node);
  }
  if (itemKey) {
    manager.getKeyHome().updateUniqueKeyValues2({
      "Item_Num": String("")
    }, node);
  }
  if (upcKey) {
    manager.getKeyHome().updateUniqueKeyValues2({
      "UPC": String("")
    }, node);
  }
}

function getCurrentCarrierDCData(node) {
  var carrierDCList = [];
  var carrierDCIterator = node.getDataContainerByTypeID("DC_Carrier").getDataContainers().iterator();
  while (carrierDCIterator.hasNext()) {
    var carrierDCObject = carrierDCIterator.next().getDataContainerObject();
    var carrierMPN = carrierDCObject.getValue("Carrier_MPN").getSimpleValue();
    if (!carrierDCList.includes(carrierMPN)) {
      carrierDCList.push(carrierMPN);
    }
  }
  return carrierDCList;
}

function getAllCarrierDCData(node, step, query, itemMap) {
  var carrierDCListAll;
  var querySpecification = null;
  var c = com.stibo.query.condition.Conditions;
  var queryResult = null;
  var dcHome = step.getHome(com.stibo.core.domain.datacontainertype.DataContainerTypeHome);
  if (node.getObjectType().getID() == "Item") {
    var querySpecification = query.queryFor(com.stibo.core.domain.Product)      
      .where(c.objectType(step.getObjectTypeHome().getObjectTypeByID("Item"))
        .and(c.valueOf(step.getAttributeHome().getAttributeByID("Line_Of_Business")).eq("Retail")));
  }
  if (node.getObjectType().getID() == "Companion_SKU") {
    var querySpecification = query.queryFor(com.stibo.core.domain.Product)
      .where(c.objectType(step.getObjectTypeHome().getObjectTypeByID("Companion_SKU"))
        .and(c.valueOf(step.getAttributeHome().getAttributeByID("Line_Of_Business")).eq("Retail")));
  }
  var queryExecute = querySpecification.execute().asList(50000);
  queryExecute.forEach(function(queryResult) {
      // need to retrieve DC_Carrier for each Item
      var currentNode = queryResult;
      if (currentNode.getID() != node.getID()) {
        var mfgPartNumber = currentNode.getValue("Mfg_Part_No").getSimpleValue();
        if (mfgPartNumber) {
          if (currentNode.getDataContainerByTypeID("DC_Carrier").getDataContainers().toArray().length != 0) {
            var carrierDCIterator = currentNode.getDataContainerByTypeID("DC_Carrier").getDataContainers().iterator();
            while (carrierDCIterator.hasNext()) {
              var carrierDcObject = carrierDCIterator.next().getDataContainerObject();
              var carrierMPN = carrierDcObject.getValue("Carrier_MPN").getSimpleValue();				
              if (itemMap.get(mfgPartNumber)) {
                carrierDCListAll = itemMap.get(mfgPartNumber);
                if (!carrierDCListAll.contains(carrierMPN))
                  carrierDCListAll.add(carrierMPN);
              } else {
                carrierDCListAll = new java.util.ArrayList();
                carrierDCListAll.add(carrierMPN);
                itemMap.put(mfgPartNumber, carrierDCListAll);
              }
            }
          }
        }
      }
      return true;
    });
  return itemMap;
}

function validateDuplicateCarrierDCAcrossSystem(itemMap, currentCarrierData, duplicateMap) {
  var duplicateCarrierList = new java.util.ArrayList();
  var itemSet = itemMap.keySet();
  var iterator = itemSet.iterator();
  while (iterator.hasNext()) {
    var mfgPartNumber = iterator.next();
    var carrierDataList = itemMap.get(mfgPartNumber);
    if (carrierDataList.size() > 0 && carrierDataList.contains(currentCarrierData)) {
      prepareDuplicateMap(mfgPartNumber, currentCarrierData, duplicateMap, duplicateCarrierList);
    }
  }
  return duplicateMap;
}

function prepareDuplicateMap(mfgPartNumber, currentCarrierData, duplicateMap, duplicateCarrierList) {
  if (duplicateMap.get(mfgPartNumber)) {
    duplicateCarrierList = duplicateMap.get(mfgPartNumber);
    if (!duplicateCarrierList.contains(currentCarrierData))
      duplicateCarrierList.add(currentCarrierData);
  } else {
    duplicateCarrierList = new java.util.ArrayList();
    duplicateCarrierList.add(currentCarrierData);
    duplicateMap.put(mfgPartNumber, duplicateCarrierList);
  }
}

function validateDuplicateCarrierMPNAcrossSKUs(node, carrierMPN, query, step) {
  objectType = node.getObjectType().getID()
  if (objectType == "Companion_SKU") {
    var parent = node.getParent();
  }
  var errorMessage = "";
  var querySpecification = null;
  var c = com.stibo.query.condition.Conditions;
  var queryResult = null;
  var querySpecification = query.queryFor(com.stibo.core.domain.Product)
    .where(c.valueOf(step.getAttributeHome().getAttributeByID("Mfg_Part_No")).eq(carrierMPN));
  var queryExecute = querySpecification.execute().asList(50000);
  queryExecute.forEach(
    function(queryResult) {
      var currentNode = queryResult;
      var currentItemNumber = "";
      currentItemNumber = currentNode.getValue("Item_Num").getValue();
      if (!currentItemNumber)
        currentItemNumber = currentNode.getValue("Reserved_Item_Num").getValue();
      currentobjectType = currentNode.getObjectType().getID()
      if (currentobjectType == "Companion_SKU") {
        var currentParent = currentNode.getParent();
      }
      if ((objectType == "Item" && currentobjectType == "Item" && currentNode.getID() != node.getID()) ||
        (objectType == "Item" && currentobjectType == "Companion_SKU" && currentParent.getID() != node.getID()) ||
        (objectType == "Companion_SKU" && currentobjectType == "Item" && currentNode.getID() != parent.getID()) ||
        (objectType == "Companion_SKU" && currentobjectType == "Companion_SKU" && currentNode.getID() != node.getID() && currentParent.getID() != parent.getID())) {
        errorMessage = errorMessage + "Carrier MPN Value - " + carrierMPN + " is the MfgPartNum of an existing Item.\n"
      }
    });
  return errorMessage;
}
/**Apple SPL My Supply Attributes Transformation rules**/
function deriveProductColor(node, appleLob, splLookup) {
  var longDescription = node.getValue("Long_Description").getValue();
  if (longDescription)
    longDescription = longDescription.toUpperCase();
  if (longDescription && (appleLob == "iPhone" || appleLob == "iPad" || appleLob == "Watch")) {
    if (!node.getValue("COLOR").getID()) {
      try {
        var colorList = splLookup.getLookupTableValue("LT_SPL_MySupply_Attribute_Transformation", "COLOR");
        colorList = JSON.parse(colorList);
        for (var i = 0; i < colorList.length; i++) {
          for (color in colorList[i]) {
            if (longDescription.contains(color)) {
              colorCode = colorList[i][color];
              node.getValue("COLOR").setLOVValueByID(colorCode);
              if (appleLob == "Watch")
                node.getValue("Widget_Color").setLOVValueByID(colorCode);
            }
          }
        }
      } catch (error) {
			error = "Add data in correct syntax in LT_SPL_MySupply_Attribute_Transformation table.";
			throw (error);
      }
    }
    if (!node.getValue("Product_Color").getValue()) {
    	  var color = node.getValue("COLOR").getValue();
    	  if (color){
    	  	node.getValue("Product_Color").setSimpleValue(color);
    	  }
    }
  }
}

function deriveModelNo(node, appleLob, splLookup) {
  var sapPartDescription = node.getValue("Apple_SAP_Part_Description").getValue();
  if (!node.getValue("Model").getValue()) {
    if (sapPartDescription && (appleLob == "iPhone" || appleLob == "iPad")) {
      try {
        if (sapPartDescription)
          sapPartDescription = sapPartDescription.toUpperCase().replace(" ", "");
        var modelList = splLookup.getLookupTableValue("LT_SPL_MySupply_Attribute_Transformation", "Model");
        modelList = JSON.parse(modelList);
        for (var i = 0; i < modelList.length; i++) {
          for (model in modelList[i]) {
            if (sapPartDescription.contains(model)) {
              modelNo = modelList[i][model];
              node.getValue("Model").setSimpleValue(modelNo);
            }
          }
        }
      } catch (error) {
        error = "Add data in correct syntax in LT_SPL_MySupply_Attribute_Transformation table.";
        throw (error);
      }
    }
    if (sapPartDescription && appleLob == "Watch") {
      try {
        var watchSize = "";
        var color = node.getValue("COLOR").getID();
        if (sapPartDescription)
          sapPartDescription = sapPartDescription.toUpperCase();
        var watchCase = "";
        var model = "";
        var sizeList = splLookup.getLookupTableValue("LT_SPL_MySupply_Attribute_Transformation", "Widget_Size");
        sizeList = JSON.parse(sizeList);
        for (var i = 0; i < sizeList.length; i++) {
          for (size in sizeList[i]) {
            if (sapPartDescription.contains(size)) {
              watchSize = sizeList[i][size];
            }
          }
        }
        var materialList = splLookup.getLookupTableValue("LT_SPL_MySupply_Attribute_Transformation", "Widget_Material");
        materialList = JSON.parse(materialList);
        for (var i = 0; i < materialList.length; i++) {
          for (material in materialList[i]) {
            if (sapPartDescription.contains(material)) {
              watchCase = materialList[i][material];
            }
          }
        }
        if (watchSize && color && watchCase)
          model = watchSize + " " + color + " " + watchCase;
        if (watchSize && color && !watchCase)
          model = watchSize + " " + color;
        if (!watchSize && color && watchCase)
          model = color + " " + watchCase;
        if (!watchSize && color && !watchCase)
          model = color;
        if (!watchSize && !color && watchCase)
          model = watchCase;
        if (watchSize && !color && !watchCase)
          model = watchSize;
        node.getValue("Model").setSimpleValue(model);
        node.getValue("Widget_Material").setLOVValueByID(watchCase);
        node.getValue("Widget_Size").setSimpleValue(watchSize);
      } catch (error) {
        error = "Add data in correct syntax in LT_SPL_MySupply_Attribute_Transformation table.";
        throw (error);
      }
    }
  }
}

function deriveMarketingNameAndFeatures(node, appleLob, splLookup) {
  var sapPartDescription = node.getValue("Apple_SAP_Part_Description").getValue();
  if (sapPartDescription)
    sapPartDescription = sapPartDescription.toUpperCase();
  var longDescription = node.getValue("Long_Description").getValue();
  if (longDescription)
    longDescription = longDescription.toUpperCase();
  var currentTime = new Date();
  var month = (currentTime.getMonth() + 1).toString().padStart(2, "0"); //06
  var year = currentTime.getFullYear();
  var yearSubString = year.toString().substring(2);
  var marketingName1 = "";
  var marketingName2 = "";
  var features = "";
  if (!node.getValue("Marketing_Name").getValue() || !node.getValue("Features").getValue()) {
    if (sapPartDescription && appleLob == "iPhone") {
      try {
        var marketingName1List = splLookup.getLookupTableValue("LT_SPL_MySupply_Attribute_Transformation", "Marketing_Name1");
        marketingName1List = JSON.parse(marketingName1List);
        for (var i = 0; i < marketingName1List.length; i++) {
          for (key in marketingName1List[i]) {
            if (sapPartDescription.contains(key)) {
              var marketingName1 = marketingName1List[i][key][0];
              var features = marketingName1List[i][key][1];
              if (!node.getValue("Marketing_Name").getValue()) {
                if (marketingName1 == "IPH SE") {
                  node.getValue("Marketing_Name").setSimpleValue(marketingName1 + yearSubString);
                  node.getValue("Features").setSimpleValue(features + yearSubString);
                } else {
                  var marketingName2List = splLookup.getLookupTableValue("LT_SPL_MySupply_Attribute_Transformation", "IPhone_Name2");
                  marketingName2List = JSON.parse(marketingName2List);
                  for (var j = 0; j < marketingName2List.length; j++) {
                    for (key in marketingName2List[j]) {
                      if (sapPartDescription.contains(key)) {
                        marketingName2 = marketingName2List[j][key];
                      }
                    }
                  }
                  node.getValue("Marketing_Name").setSimpleValue(marketingName1 + marketingName2);
                  node.getValue("Features").setSimpleValue(features + marketingName2);
                }
              }
            }
          }
        }
      } catch (error) {
        error = "Add data in correct syntax in LT_SPL_MySupply_Attribute_Transformation table.";
        throw (error);
      }
    }
    if (sapPartDescription && appleLob == "iPad") {
      try {
        var marketingName1List = splLookup.getLookupTableValue("LT_SPL_MySupply_Attribute_Transformation", "Marketing_Name1");
        marketingName1List = JSON.parse(marketingName1List);
        for (var i = 0; i < marketingName1List.length; i++) {
          for (key in marketingName1List[i]) {
            if (sapPartDescription.contains(key)) {
              marketingName1 = marketingName1List[i][key][0];
              features = marketingName1List[i][key][1];
            }
          }
        }
        var marketingName2List = splLookup.getLookupTableValue("LT_SPL_MySupply_Attribute_Transformation", "IPad_Name2");
        marketingName2List = JSON.parse(marketingName2List);
        for (var j = 0; j < marketingName2List.length; j++) {
          for (key in marketingName2List[j]) {
            if (sapPartDescription.contains(key)) {
              mktgName2 = marketingName2List[j][key];
            }
          }
        }
        if (sapPartDescription.contains("IPAD WF CL")) {
          if (!node.getValue("Marketing_Name").getValue())
            node.getValue("Marketing_Name").setSimpleValue(marketingName1);
          if (!node.getValue("Features").getValue())
            node.getValue("Features").setSimpleValue(features);
        } else {
          if (!node.getValue("Marketing_Name").getValue())
            node.getValue("Marketing_Name").setSimpleValue(marketingName1 + marketingName2 + " " + yearSubString);
          if (!node.getValue("Features").getValue())
            node.getValue("Features").setSimpleValue(features + year);
        }
      } catch (error) {
        error = "Add data in correct syntax in LT_SPL_MySupply_Attribute_Transformation table.";
        throw (error);
      }
    }
    if (longDescription && appleLob == "Watch") {
      try {
        var name = "";
        var wrist = "";
        var marketingName = "";
        var lob = appleLob.toUpperCase();
        var features = "";
        var bandSizeList = splLookup.getLookupTableValue("LT_SPL_MySupply_Attribute_Transformation", "Band_Size");
        bandSizeList = JSON.parse(bandSizeList);
        for (var i = 0; i < bandSizeList.length; i++) {
          for (key in bandSizeList[i]) {
            if (longDescription.contains(key)) {
              wrist = bandSizeList[i][key];
            }
          }
        }
        var marketingName1List = splLookup.getLookupTableValue("LT_SPL_MySupply_Attribute_Transformation", "Marketing_Name1");
        marketingName1List = JSON.parse(marketingName1List);
        for (var i = 0; i < marketingName1List.length; i++) {
          for (key in marketingName1List[i]) {
            if (longDescription.contains(key)) {
              name = marketingName1List[i][key][0];
              features = marketingName1List[i][key][1];
            }
          }
        }
        if (name == "SE") {
          name = name + yearSubString;
          features = features + year;
        }
        if (name && wrist)
          marketingName = name + " " + wrist
        if (name && !wrist)
          marketingName = name
        if (!name && wrist)
          marketingName = wrist
        if (features)
          features = lob + "_" + features
        if (!node.getValue("Marketing_Name").getValue())
          node.getValue("Marketing_Name").setSimpleValue(marketingName);
        if (!node.getValue("Features").getValue())
          node.getValue("Features").setSimpleValue(features);
        node.getValue("Band_Size").setLOVValueByID(wrist);
      } catch (error) {
        error = "Add data in correct syntax in LT_SPL_MySupply_Attribute_Transformation table.";
        throw (error);
      }
    }
  }
}

function deriveIMEIType(node, appleLob) {
  if (!node.getValue("IMEI_Type").getValue()) {
    if (appleLob == "iPhone")
      node.getValue("IMEI_Type").setLOVValueByID("IMEI-15-S6");
    if (appleLob == "iPad")
      node.getValue("IMEI_Type").setLOVValueByID("IMEI-15-7A");
    if (appleLob == "Watch")
      node.getValue("IMEI_Type").setLOVValueByID("IMEI-15-R1");
  }
}

function derivePalletQty(node) {
  var palletQty = node.getValue("Units_per_Pallet").getSimpleValue();
  if (!palletQty || palletQty == 0) {
    var singlePackQty = node.getValue("Apple_Pallet_Of_Single_Shippers_Qty").getSimpleValue();
    if (singlePackQty)
      node.getValue("Units_per_Pallet").setSimpleValue(singlePackQty);
  }
}

function deriveBandType(node, appleLob, splLookup) {
  if (!node.getValue("Band_Type").getValue()) {
    var longDescription = node.getValue("Long_Description").getValue();
    if (longDescription && appleLob == "Watch") {
      try {
        var bandTypeList = splLookup.getLookupTableValue("LT_SPL_MySupply_Attribute_Transformation", "Band_Type");
        bandTypeList = JSON.parse(bandTypeList);
        for (var i = 0; i < bandTypeList.length; i++) {
          for (key in bandTypeList[i]) {
            if (longDescription.contains(key)) {
              node.getValue("Band_Type").setSimpleValue(bandTypeList[i][key]);
            }
          }
        }
      } catch (error) {
        error = "Add data in correct syntax in LT_SPL_MySupply_Attribute_Transformation table.";
        throw (error);
      }
    }
  }
}

function isSPLWorkflowActive(manager) {
  var userGroups = manager.getCurrentUser().getGroups().toString();
  if (!userGroups.contains("UG_DG")) {
    var condition = com.stibo.query.condition.Conditions;
    var queryHome = manager.getHome(com.stibo.query.home.QueryHome);
    var query = getAllSPLWorkflowTasks(manager, queryHome, condition);
    var count = 0;
    if (query) {
      query.forEach(function(task) {
        var currentNode = task.getNode();
        if (currentNode.isInState("SPI_Onboarding", "Start") || currentNode.isInState("SPI_Onboarding", "SPI_Enrichment") || currentNode.isInState("SPI_Onboarding", "SPI_Review")) {
          count = count + 1
        }
        return true
      });
    }
    if (count > 0) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

function populateSPLWarningMessage(manager) {
  var splWarningMessage = ""; 
  if(isSPLWorkflowActive(manager)){
	  var entity = manager.getEntityHome().getEntityByID("ItemAttributes_Hierarchy");
	  var warningMessage = entity.getValue("SPL_Warning_Message").getSimpleValue();
	  var warningHeader = "<b> Warning </b>: Retail Supplier Product Launch In-Progress";
	  if (warningMessage) {
	    splWarningMessage =  warningHeader + "\n \n" + warningMessage;
	  } else {
	    splWarningMessage = "<b> Please provide Value in the attribute:Warning Message </b>";
	  }
  }
  return splWarningMessage;
}

function cleanNumber(inNumber) {
  return inNumber.replace(/[a-zA-Z]/g, '');
}

function gramsToLbsConversion(grams) {
  const pounds = grams * 0.00220462;
  return pounds.toFixed(6);
}

function mmToInchConversion(mm){
	var inch = mm/25.4 ;
	return Number(inch.toFixed(6));
}

function generateId(value) {
  return value.toLowerCase().split(' ').map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

function setNewLovValue(stiboAtt, setValue, node, step) {
  const listOfValues = step.getAttributeHome().getAttributeByID(stiboAtt).getListOfValues();
  const newId = generateId(setValue);
  listOfValues.createListOfValuesValue(setValue, null, newId);
  node.getValue(stiboAtt).setLOVValueByID(newId);
}

function findLovIdByValue(stiboAttribute, seekValue, caseSensitive, step) {
  var foundId = false;
  const listOfValues = step.getAttributeHome().getAttributeByID(stiboAttribute).getListOfValues();
  const validValues = listOfValues.queryValidValues();
  validValues.forEach(function(value) {
    if (caseSensitive) {
      if (seekValue == value.getValue()) {
        foundId = value.getID();
        return false;
      }
    } else {
      if (seekValue.toLowerCase() == value.getValue().toLowerCase()) {
        foundId = value.getID();
        return false;
      }
    }
    return true;
  });
  return foundId;
}

function clearValueNull(variable) {
  if (variable == null) {
    variable = '';
  }
  return variable;
}

function findLovIdByMap(lookuptable,appleValue) {
  const mappedId = lookuptable.getLookupTableValue("LT_SPL_Apple_Stibo_PDX_Units_Conversion", appleValue);
  return mappedId;
}

function setAppleRequestBody(mfgPartNumber, catId) {
  const raw = {
    "filters": [{
      "filterType": "attribute",
      "attributeId": "MATERIAL_PART_NUMBER",
      "value": mfgPartNumber + "",
      "conditionType": "EQUAL"
    }],
    "catalogId": catId + "",
    "searchLanguage": "en-US",
    "responseLanguages": [
      "en-US"
    ],
    "pageSize": "100"
  }
  return raw;
}

function setApplePDXAttributes(node,stepManager,log,splLookup,giep,retailItemType) {
	catalogId = retailItemType.getValue("SPL_Catalog_Id").getSimpleValue();
	mfgPartNumber = node.getValue("Supplier_Mfg_Part_No").getSimpleValue();
	var post = giep.post(); 
	post.header("Content-Type", "application/json; charset=UTF-8");
	//post.header("InstanceName", "scm-oic-01-idfykvb66dwb-px");

	const raw = setAppleRequestBody(mfgPartNumber, catalogId);
	try{
		var response = post.path("/").body(JSON.stringify(raw)).invoke();
	} catch (e) {
			if (e.javaException instanceof com.stibo.gateway.rest.RESTGatewayException) {
				node.getValue("SPL_Apple_Pull_Exceptions").setSimpleValue('RESTGatewayException recieved');
				return;
			}
	}

	var stiboAttributesArray = getStiboAttributesForAppleMap(splLookup);
	try{
		const dz = JSON.parse(response);
	}catch (error) {
			node.getValue("SPL_Apple_Pull_Exceptions").setSimpleValue('JSON parse error');
	}

	if (!dz.catalogProducts[0]) {
			log.info('Empty response recieved');
			node.getValue("SPL_Apple_Pull_Exceptions").setSimpleValue('Empty response received.');
			return;
	}
	performAppleMap(stiboAttributesArray, log, splLookup, dz, node, stepManager);
}

function getStiboAttributesForAppleMap(lookuptable) {
  var stiboAttributes = lookuptable.getLookupTableValue("LT_SPL_Apple_Stibo_PDX_Attribute_Mapping", "stiboAtts");
  return stiboAttributes.split(",");
}

function performAppleMap(stiboAttributesArray, log, lookuptable, dz, node, step) {
  stiboAttributesArray.forEach(function(stiboAtt) {
    var appleAtt = lookuptable.getLookupTableValue("LT_SPL_Apple_Stibo_PDX_Attribute_Mapping", stiboAtt);
    if (appleAtt) {
      //log.info("map comp: " + appleAtt);
      const mapComp = appleAtt.toString().split("\\|");
      var mapAtt = mapComp[0];
      var rule = mapComp[1];
      //log.info("apple att: " + mapAtt);
      //log.info("rule: " + rule);
      if (dz.catalogProducts[0].attributes["en-US"][mapAtt]) {
        //log.info('apple att value: ' + dz.catalogProducts[0].attributes["en-US"][mapAtt].value);
        if (rule == 'LOV') {
          const lovId = findLovIdByValue(stiboAtt, dz.catalogProducts[0].attributes["en-US"][mapAtt].value, true, step);
          if (lovId) {
            node.getValue(stiboAtt).setLOVValueByID(lovId);
          } else {
            var errMss = clearValueNull(node.getValue("SPL_Apple_Pull_Validation_Errors").getSimpleValue());
            node.getValue("SPL_Apple_Pull_Validation_Errors").setSimpleValue(errMss + stiboAtt + " is missing value: " + dz.catalogProducts[0].attributes["en-US"][mapAtt].value+", ");
          }
        } else if (rule == 'LOVIgnoreCase') {
          const lovId2 = findLovIdByValue(stiboAtt, dz.catalogProducts[0].attributes["en-US"][mapAtt].value, false, step);
          if (lovId2) {
            node.getValue(stiboAtt).setLOVValueByID(lovId2);
          } else {
            var errMss = clearValueNull(node.getValue("SPL_Apple_Pull_Validation_Errors").getSimpleValue());
            node.getValue("SPL_Apple_Pull_Validation_Errors").setSimpleValue(errMss + stiboAtt + " is missing value: " + dz.catalogProducts[0].attributes["en-US"][mapAtt].value+", ");
          }
        } else if (rule == 'LOVWithAdd') {
          const lovId3 = findLovIdByValue(stiboAtt, dz.catalogProducts[0].attributes["en-US"][mapAtt].value, false, step);
          if (lovId3) {
            node.getValue(stiboAtt).setLOVValueByID(lovId3);
          } else {
            setNewLovValue(stiboAtt, dz.catalogProducts[0].attributes["en-US"][mapAtt].value, node, step);
          }
        } else if (rule == 'LOVWithMap') {
          const lovId4 = findLovIdByMap(lookuptable, stiboAtt, dz.catalogProducts[0].attributes["en-US"][mapAtt].value);
          if (lovId4) {
            node.getValue(stiboAtt).setLOVValueByID(lovId4);
          } else {
            var errMss = clearValueNull(node.getValue("SPL_Apple_Pull_Validation_Errors").getSimpleValue());
            node.getValue("SPL_Apple_Pull_Validation_Errors").setSimpleValue(errMss + stiboAtt + " is missing value: " + dz.catalogProducts[0].attributes["en-US"][mapAtt].value+", ");
          }
        } else if (rule == 'LOVWithMapAndAppleSource') {
          var lovId5 = findLovIdByMap(lookuptable,dz.catalogProducts[0].attributes["en-US"][mapAtt].value);
          if (lovId5) {
          	try {
            node.getValue(stiboAtt).setLOVValueByID(lovId5);
          } catch (error) {
            var appSrcAtt = appleAtt.toString().split("\\|")[2];
            node.getValue(appSrcAtt).setSimpleValue(dz.catalogProducts[0].attributes["en-US"][mapAtt].value);
            var errMss = clearValueNull(node.getValue("SPL_Apple_Pull_Validation_Errors").getSimpleValue());
            node.getValue("SPL_Apple_Pull_Validation_Errors").setSimpleValue(errMss + stiboAtt + " is missing value: " + dz.catalogProducts[0].attributes["en-US"][mapAtt].value+", ");
          }
        }} else if (rule == 'LOVWithValueAndAppleSource') {
var lovId6 = findLovIdByValue(stiboAtt, dz.catalogProducts[0].attributes["en-US"][mapAtt].value, false, step);
 //log.info("lovId6:"+lovId6);
try {
	node.getValue(stiboAtt).setLOVValueByID(lovId6);
}catch (error) {
	var appSrcAtt = appleAtt.toString().split("\\|")[2];
	node.getValue(appSrcAtt).setSimpleValue(dz.catalogProducts[0].attributes["en-US"][mapAtt].value);
	var errMss = clearValueNull(node.getValue("SPL_Apple_Pull_Validation_Errors").getSimpleValue());
	node.getValue("SPL_Apple_Pull_Validation_Errors").setSimpleValue(errMss + stiboAtt + " is missing value: " + dz.catalogProducts[0].attributes["en-US"][mapAtt].value+", ");
}
}else if (rule == 'NumberConvertGramsToLbs') {
          try {
            node.getValue(stiboAtt).setSimpleValue(gramsToLbsConversion(cleanNumber(dz.catalogProducts[0].attributes["en-US"][mapAtt].value)));
          } catch (error) {
            var errMss = clearValueNull(node.getValue("SPL_Apple_Pull_Validation_Errors").getSimpleValue());
            node.getValue("SPL_Apple_Pull_Validation_Errors").setSimpleValue(errMss + 'Please Enter numeric value under: ' + stiboAtt + ', ');
          }
        }else if (rule == 'NumberConvertmmToin') {
          try {
            node.getValue(stiboAtt).setSimpleValue(mmToInchConversion(cleanNumber(dz.catalogProducts[0].attributes["en-US"][mapAtt].value)));
          } catch (error) {
            var errMss = clearValueNull(node.getValue("SPL_Apple_Pull_Validation_Errors").getSimpleValue());
            node.getValue("SPL_Apple_Pull_Validation_Errors").setSimpleValue(errMss + 'Please Enter numeric value under: ' + stiboAtt + ', ');
          }
        } else if (rule == 'Number' || rule == 'Integer') {
          try {
            node.getValue(stiboAtt).setSimpleValue(cleanNumber(dz.catalogProducts[0].attributes["en-US"][mapAtt].value));
          } catch (error) {
            var errMss = clearValueNull(node.getValue("SPL_Apple_Pull_Validation_Errors").getSimpleValue());
            node.getValue("SPL_Apple_Pull_Validation_Errors").setSimpleValue(errMss + 'Please Enter numeric value under: ' + stiboAtt + ', ');
          }
        } else if (rule == 'ISODate') {
          try {
            node.getValue(stiboAtt).setSimpleValue((dz.catalogProducts[0].attributes["en-US"][mapAtt].value).trim());
          } catch (error) {
            var errMss = clearValueNull(node.getValue("SPL_Apple_Pull_Validation_Errors").getSimpleValue());
            node.getValue("SPL_Apple_Pull_Validation_Errors").setSimpleValue(errMss + 'Cannot convert the entered date ' + stiboAtt +', ');
          }
        } else if (rule == 'TextWithApplSrc') {
      	
          try {
            node.getValue(stiboAtt).setSimpleValue(dz.catalogProducts[0].attributes["en-US"][mapAtt].value);
          } catch (error) {
          	
            var errorGrab = stiboAtt +error.toString().split(":")[2]+error.toString().split(":")[3]+" value of :"+error.toString().split(":")[4]+", ";
            var appSrcAtt = appleAtt.toString().split("\\|")[2];
            node.getValue(appSrcAtt).setSimpleValue(dz.catalogProducts[0].attributes["en-US"][mapAtt].value);
            var errMss = clearValueNull(node.getValue("SPL_Apple_Pull_Validation_Errors").getSimpleValue());
            node.getValue("SPL_Apple_Pull_Validation_Errors").setSimpleValue(errMss + errorGrab);
          }
        } else if (rule == 'TextConcatUOM') {
          var uom = appleAtt.toString().split("\\|")[2];
          var value = (dz.catalogProducts[0].attributes["en-US"][mapAtt].value).trim();
		  var unit = (dz.catalogProducts[0].attributes["en-US"][uom.trim()].value).trim();
          if (value && unit) {
            var value = (dz.catalogProducts[0].attributes["en-US"][mapAtt].value).trim();
            var unit = (dz.catalogProducts[0].attributes["en-US"][uom.trim()].value).trim();
            var changeUOM = lookuptable.getLookupTableValue("LT_SPL_Apple_Stibo_PDX_Units_Conversion", unit);
            var conCat = value + " " + changeUOM + "";
            node.getValue(stiboAtt).setSimpleValue(conCat);
          } else if(value && !unit) {
            var errMss = clearValueNull(node.getValue("SPL_Apple_Pull_Validation_Errors").getSimpleValue());
            node.getValue("SPL_Apple_Pull_Validation_Errors").setSimpleValue(errMss + 'Uom does not exist for: ' + stiboAtt  +', ');
          }else {
            var conCat = value + " " + changeUOM + "";
            node.getValue(stiboAtt).setSimpleValue(conCat);
          }
        } 
        /*else if (rule == 'MultiText') {
          var value = (dz.catalogProducts[0].attributes["en-US"][mapAtt].value);
		  try {
          if (value) {
            value.forEach(function(indValue) {
            	if(indValue.trim())
              node.getValue(stiboAtt).addValue(indValue.trim());
		  })}
          }  catch (error) {            
            var errValue =error.toString().split(":")[2];	
            var errMss = clearValueNull(node.getValue("SPL_Apple_Pull_Validation_Errors").getSimpleValue());
            node.getValue("SPL_Apple_Pull_Validation_Errors").setSimpleValue(errMss + errValue+": " + stiboAtt + ', ');
          }
        }*/
        else if (rule == 'CompositeAttribute') {
          var primaryAttrId = mapAtt;
          var secondaryAttrId = appleAtt.toString().split("\\|")[2];
		  try{
          if (compositeAttributeValue(dz, primaryAttrId, secondaryAttrId)) {
            node.getValue(stiboAtt).setSimpleValue(compositeAttributeValue(dz, primaryAttrId, secondaryAttrId));
          } }catch (error) { 
            var errMss = clearValueNull(node.getValue("SPL_Apple_Pull_Validation_Errors").getSimpleValue());
            node.getValue("SPL_Apple_Pull_Validation_Errors").setSimpleValue(errMss + 'Cannot find ' + secondaryAttrId + ' under ' + primaryAttrId + ' for: ' + stiboAtt + ', ');
          }
        } else {
          try {
            node.getValue(stiboAtt).setSimpleValue(dz.catalogProducts[0].attributes["en-US"][mapAtt].value);
          } catch (error) {
             var errorVal = error.toString().split(":")[3]+" value of :"+error.toString().split(":")[4]+", ";
             var errMss = clearValueNull(node.getValue("SPL_Apple_Pull_Validation_Errors").getSimpleValue());
            node.getValue("SPL_Apple_Pull_Validation_Errors").setSimpleValue(errMss +errorVal+': ' + stiboAtt + ', ');
          }
        }
      } else {
        log.info('apple att not present');
      }
    } else {
      log.info('apple att not mapped');
    }
  });
}


function deriveWatchModel(node, appleLob) {
  if ((appleLob == "Watch" || appleLob == "Apple Watch") && !node.getValue("Model").getValue()) {
    var model = "";
    var watchSize = node.getValue("Widget_Size").getValue();
    var watchCase = node.getValue("Widget_Material").getID();
    var color = node.getValue("COLOR").getID();
    if (watchSize && color && watchCase)
      model = watchSize + " " + color + " " + watchCase;
    if (watchSize && color && !watchCase)
      model = watchSize + " " + color;
    if (!watchSize && color && watchCase)
      model = color + " " + watchCase;
    if (!watchSize && color && !watchCase)
      model = color;
    if (!watchSize && !color && watchCase)
      model = watchCase;
    if (watchSize && !color && !watchCase)
      model = watchSize;
    node.getValue("Model").setSimpleValue(model);
  }
}

function compositeAttributeValue(dz, primaryAttributeId, secondaryAttributeId) {
  var populateValue = ""
  var compositeAttributes = dz.catalogProducts[0].attributes["en-US"][primaryAttributeId]["value"].value;
  compositeAttributes.forEach(function(compositeAttribute) {
    if (compositeAttribute.id == secondaryAttributeId) {
      populateValue = compositeAttribute.value;
    }
  });
    return populateValue;
}

function deriveBandSize(node, appleLob, splLookup) {
  if (!node.getValue("Band_Size").getValue()) {
    var longDescription = node.getValue("Long_Description").getValue();
    if (longDescription) longDescription = longDescription.toUpperCase();
    if (longDescription && appleLob == "Watch") {
      try {
        var wrist = "";
        var bandSizeList = splLookup.getLookupTableValue("LT_SPL_MySupply_Attribute_Transformation", "Band_Size");
        bandSizeList = JSON.parse(bandSizeList);
        for (var i = 0; i < bandSizeList.length; i++) {
          for (key in bandSizeList[i]) {
            if (longDescription.contains(key)) {
              wrist = bandSizeList[i][key];
            }
          }
        }
        node.getValue("Band_Size").setLOVValueByID(wrist);
      } catch(error) {
        error = "Add data in correct syntax in LT_SPL_MySupply_Attribute_Transformation table.";
        throw (error);
      }
    }
  }
}
         
function processWorkflowCompleteItems(stepManager,queryHome) {  	
    var workflowCompleteItemList = [];
    var condition = com.stibo.query.condition.Conditions;
    var query = getAllSPLWorkflowTasks(stepManager, queryHome, condition);
    var user = "";
    query.forEach(function(task) {
        var currentNode = task.getNode();
        var splWFInstance = currentNode.getWorkflowInstanceByID("SPI_Onboarding");
	   var userId = splWFInstance.getSimpleVariable("Assignee");
	   user = stepManager.getUserHome().getUserByID(userId);
        var batchId = currentNode.getValue("Batch_Id").getSimpleValue();
        var lookupTableHome = stepManager.getHome(com.stibo.lookuptable.domain.LookupTableHome)
         if (currentNode.isInState("SPI_Onboarding", "SPI_Review")){ 
          //Add Code to generate UPC & GTIN if Null for each currentNode
          /* 
            try { // UPC GTIN Generation
        	 	upcGTINLib.generateUpcGtin(currentNode, stepManager);
        	 	} catch (e) {
              throw itmGenLib.getMessageBetweenWords(e.toString(), "javax.script.ScriptException:", "in Library");
        	 		}
          */
        	  retailChildOrgLib.createRetailChildOrgs(currentNode, stepManager, lookupTableHome);//create Child Orgs for currentNode
        	  itmGenLib.childOrgItemNumberGeneration(currentNode, stepManager);//item number generation//Item Number generation for Child Org by parsing currentNod
        	  commonDerivationLib.setItemParent(currentNode, stepManager);//Classify the SPL Item under Retail folder
        	  //commonDerivationLib.setUPC(currentNode,stepManager); // STIBO-3370 Prod Support Mar 15 Release, Copy UPC (Text) value to UPC(GTIN)
            commonDerivationLib.recursiveApproval(currentNode,stepManager,"RTL")
            var itemNum = currentNode.getValue("Item_Num").getSimpleValue();
            var mfgPartNum = currentNode.getValue("Mfg_Part_No").getSimpleValue();
            workflowCompleteItemList.push(currentNode.getID() + " | " + batchId +" | " + mfgPartNum + " | " + itemNum);
            splWFInstance.getTaskByID("SPI_Review").triggerByID("Approve", "SPL WF completed");
         }
        return true;
    });
	sendBatchSuccessEmail(stepManager,user,workflowCompleteItemList);
	resetBatchId(stepManager);
}

function sendBatchSuccessEmail(stepManager,user,workflowCompleteItemList) {
	log.severe("Into sendBatchSuccessEmail")
	log.severe("Into sendBatchSuccessEmail User: "+user)
    var mailHome = stepManager.getHome(com.stibo.mail.home.MailHome);
    var subject = "Supplier Product Launch | New Product Introduction - Successful";
    var message = "Dear user, \n \nThe SPL Batch for New Product Introduction has successfully processed. Item Numbers have been assigned.\n";
    message = message + "\nRecords successfully processed:" + workflowCompleteItemList.length;
    message = message + "\n\nID | Batch Id | MFG Part No | Item Number\n\n";
    workflowCompleteItemList.forEach(function(itemMessage) {
        message = message + "\n"+ itemMessage;
    });
    sendEmail(user, subject, message,mailHome);
}

function sendEmail(user, subject, message,mailHome) {
    var userID = getEmailId(user)
    if(userID) {
        var mail = mailHome.mail();
        var instanceName = auditLib.getHostEnvironment();
        var sender = instanceName + "-noreply@cloudmail.stibo.com";
        mail.from(sender);
        mail.addTo(userID);
        mail.subject(subject);
        mail.plainMessage(message);
        mail.send();
    }   
}

function getEmailId(user) {
    var userID ="";
    if (user.getID().contains('@ATT.COM')){
        userID = user.getID();
    } else if (user.getEMail()) {
        userID = user.getEMail();
    }
    return userID;
}

function resetBatchId(stepManager) {
    var entityObject = stepManager.getEntityHome().getEntityByID("RTL_Item_Type");
    var currentBatchID = entityObject.getValue("Batch_Id").getSimpleValue(); //R202406_03   
    if(currentBatchID) {
	    var seriesNumber = currentBatchID.split("_");
	    var seriesNumber0 = seriesNumber[0];
	    var seriesNumber1 = parseFloat(seriesNumber[1]) + 1;
	    if (seriesNumber1.toString().length == 1) {
	        seriesNumber1 = seriesNumber1.toString().padStart(2, "0");
	    }    
	    entityObject.getValue("Batch_Id").setValue(seriesNumber0+"_"+seriesNumber1);
    }
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.getAllSPLWorkflowTasks = getAllSPLWorkflowTasks
exports.setBatchId = setBatchId
exports.setAppleDefaultAttributes = setAppleDefaultAttributes
exports.setDefaultValues = setDefaultValues
exports.setAttributeValue = setAttributeValue
exports.setLookupResult = setLookupResult
exports.setBatteryForm = setBatteryForm
exports.setDimensionUnit = setDimensionUnit
exports.setSPLMySupplyAttributes = setSPLMySupplyAttributes
exports.deriveUDCParentModel = deriveUDCParentModel
exports.deriveMarketPrice = deriveMarketPrice
exports.approveCarrierDC = approveCarrierDC
exports.createCarrierDC = createCarrierDC
exports.setAttributesNull = setAttributesNull
exports.deleteKey = deleteKey
exports.getCurrentCarrierDCData = getCurrentCarrierDCData
exports.getAllCarrierDCData = getAllCarrierDCData
exports.validateDuplicateCarrierDCAcrossSystem = validateDuplicateCarrierDCAcrossSystem
exports.prepareDuplicateMap = prepareDuplicateMap
exports.validateDuplicateCarrierMPNAcrossSKUs = validateDuplicateCarrierMPNAcrossSKUs
exports.deriveProductColor = deriveProductColor
exports.deriveModelNo = deriveModelNo
exports.deriveMarketingNameAndFeatures = deriveMarketingNameAndFeatures
exports.deriveIMEIType = deriveIMEIType
exports.derivePalletQty = derivePalletQty
exports.deriveBandType = deriveBandType
exports.isSPLWorkflowActive = isSPLWorkflowActive
exports.populateSPLWarningMessage = populateSPLWarningMessage
exports.cleanNumber = cleanNumber
exports.gramsToLbsConversion = gramsToLbsConversion
exports.mmToInchConversion = mmToInchConversion
exports.generateId = generateId
exports.setNewLovValue = setNewLovValue
exports.findLovIdByValue = findLovIdByValue
exports.clearValueNull = clearValueNull
exports.findLovIdByMap = findLovIdByMap
exports.setAppleRequestBody = setAppleRequestBody
exports.setApplePDXAttributes = setApplePDXAttributes
exports.getStiboAttributesForAppleMap = getStiboAttributesForAppleMap
exports.performAppleMap = performAppleMap
exports.deriveWatchModel = deriveWatchModel
exports.compositeAttributeValue = compositeAttributeValue
exports.deriveBandSize = deriveBandSize
exports.processWorkflowCompleteItems = processWorkflowCompleteItems
exports.sendBatchSuccessEmail = sendBatchSuccessEmail
exports.sendEmail = sendEmail
exports.getEmailId = getEmailId
exports.resetBatchId = resetBatchId