/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Item_Wireline_HECI_Derivation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Derivation_Libraries" ],
  "name" : "Item Wireline HECI Derivation Library",
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
function getHECIdetails(node, giep) {
	var raw = null;
	var response = null;
	var prevHECI = node.getValue("HECI_Response").getSimpleValue();
	var heci = node.getValue("HECI").getSimpleValue();
	if (heci) {
		heci = heci.trim();
	}
	if (heci != prevHECI) {
		raw = "<InputParameters xmlns=\"http://xmlns.oracle.com/pcbpel/adapter/db/sp/GetHECIDetsFromEBS_1\"><HECIValue>" + heci + "</HECIValue></InputParameters>";
		log.info("WRLHC: Sending HECI request for the node " + node.getID() + " and HECI code " + heci);
		try {
			response = giep.post().path("/").body(raw).invoke();
		} catch (e) {
			if (e.javaException instanceof com.stibo.gateway.rest.RESTGatewayException) {
				throw "Error getting HECI Response: " + e.javaException.getMessage();
			} else {
				throw (e);
			}
		}
		if (response) {
			node.getValue("HECI_Response").setSimpleValue(heci);
			node.getDataContainerByTypeID("DC_HECI").deleteLocal();
			processHECIResponse(node, response);
		}
	}
}

function processHECIResponse(node, response) {
	var documentBuilder = new javax.xml.parsers.DocumentBuilderFactory.newInstance().newDocumentBuilder();
	var inputSource = new org.xml.sax.InputSource();
	inputSource.setCharacterStream(new java.io.StringReader(response));
	var document = documentBuilder.parse(inputSource);
	var heciTableElements = document.getElementsByTagName("tns:HECI_TBL");
	for (var i = 0; i < heciTableElements.getLength(); i++) {
		var heciTableElement = heciTableElements.item(i);
		var heciItems = heciTableElement.getElementsByTagName("tns:HECI_TBL_ITEM");
		if (heciItems.getLength() > 0) {
			//node.getValue("HECI_Response").setSimpleValue(heciTableElement);
			node.getDataContainerByTypeID("DC_HECI").deleteLocal(); // On each response delete the DC and recreate
			for (var j = 0; j < heciItems.getLength(); j++) {
				var heciItemElement = heciItems.item(j);
				createHECIDC(node, heciItemElement, heciTableElements.getLength());
			}
		}
	}
}

function setDefaultUserSelection(node) {
	var heciList = node.getDataContainerByTypeID("DC_HECI").getDataContainers().toArray();
	if (heciList.length == 1) {
		heciList.forEach(function(dc) {
			var heciObject = dc.getDataContainerObject();
			heciObject.getValue("HECI_User_Selection").setSimpleValue("Yes")
		});
	}
}

function createHECIDC(node, heciItemElement) {
	var dataContainer = node.getDataContainerByTypeID("DC_HECI").addDataContainer().createDataContainerObject(null);
	var fields = {
		"HECI_Code": "HECI",
		"HECI_ECI_Code": "ECI",
		"HECI_FRC": "FRC",
		"HECI_Basic_Unit": "BASIC_UNIT",
		"HECI_Manufacturer_Code": "MFR_CODE",
		"HECI_Manufacturer_Name": "MFG_NAME",
		"HECI_Manufacturer_Part": "PART_NUMBER",
		"HECI_CPR": "CPR",
		"HECI_Exclude_from_TPI_flag": "EXCL_TPI_FLG",
		"HECI_Manufacturer_Status": "MFR_STATUS",
		"HECI_EQUIP_TYPE": "EQUIP_TYPE"
	};
	for (var key in fields) {
		var tagName = "tns:" + fields[key];
		var value = getTagTextContent(heciItemElement, tagName);
		dataContainer.getValue(key).setSimpleValue(value);
	}
}

function getTagTextContent(parent, tagName) {
	var elements = parent.getElementsByTagName(tagName);
	return elements.getLength() > 0 ? elements.item(0).getTextContent() : "";
}

function clearHECIDetails(node) {
	var heci = node.getValue("HECI").getSimpleValue();
	var heciList = node.getDataContainerByTypeID("DC_HECI").getDataContainers().toArray();
	if (!heci) {
		heciList.forEach(function(dc) {
			var heciObj = dc.getDataContainerObject();
			if (heciObj.getValue("HECI_User_Selection").getSimpleValue() == "Yes") {
				if (node.getValue("ECI_CODE").getSimpleValue() == heciObj.getValue("HECI_ECI_Code").getSimpleValue()) node.getValue("ECI_CODE").setSimpleValue("");
				if (node.getValue("Basic_Unit").getSimpleValue() == heciObj.getValue("HECI_Basic_Unit").getSimpleValue()) node.getValue("Basic_Unit").setSimpleValue("");
				if (node.getValue("FRC").getSimpleValue() == heciObj.getValue("HECI_FRC").getSimpleValue()) node.getValue("FRC").setSimpleValue("");
				if (node.getValue("CPR").getSimpleValue() == heciObj.getValue("HECI_CPR").getSimpleValue()) node.getValue("CPR").setSimpleValue("");
				if (node.getValue("EXL_TPI_FLG").getSimpleValue() == heciObj.getValue("HECI_Exclude_from_TPI_flag").getSimpleValue()) node.getValue("EXL_TPI_FLG").setSimpleValue("");
				if (node.getValue("Manufacturer_Status").getSimpleValue() == heciObj.getValue("HECI_Manufacturer_Status").getSimpleValue()) node.getValue("Manufacturer_Status").setSimpleValue("");
				if (node.getValue("OEM_WRLN").getSimpleValue() == heciObj.getValue("HECI_Manufacturer_Code").getSimpleValue()) node.getValue("OEM_WRLN").setSimpleValue("");
				if (node.getValue("OEM_Full_Name").getSimpleValue() == heciObj.getValue("HECI_Manufacturer_Code").getSimpleValue()) node.getValue("OEM_Full_Name").setSimpleValue("");
				if (node.getValue("Mfg_Part_No").getSimpleValue() == heciObj.getValue("HECI_Manufacturer_Part").getSimpleValue()) node.getValue("Mfg_Part_No").setSimpleValue("");
				if (node.getValue("EQUIP_TYPE").getSimpleValue() == heciObj.getValue("HECI_EQUIP_TYPE").getSimpleValue()) node.getValue("EQUIP_TYPE").setSimpleValue("");
				if (node.getValue("User_Defined_Item_Num").getSimpleValue() == heciObj.getValue("HECI_Code").getSimpleValue()) node.getValue("User_Defined_Item_Num").setSimpleValue("");
			}
		});
		node.getDataContainerByTypeID("DC_HECI").deleteLocal();
		node.getValue("HECI_Response").setSimpleValue("");
	}
}

function setHECIAttributes(node, stepManager) {
	var errorMessage = [];
	var heciList = node.getDataContainerByTypeID("DC_HECI").getDataContainers().toArray();
	heciList.forEach(function(dc) {
		var heciObj = dc.getDataContainerObject();
		if (heciObj.getValue("HECI_User_Selection").getSimpleValue() == "Yes") {
			node.getValue("HECI").setSimpleValue(heciObj.getValue("HECI_Code").getSimpleValue());
			node.getValue("ECI_CODE").setSimpleValue(heciObj.getValue("HECI_ECI_Code").getSimpleValue());
			node.getValue("Basic_Unit").setSimpleValue(heciObj.getValue("HECI_Basic_Unit").getSimpleValue());
			//STIBO-3237 Prod support( Feb 22 Release)
			var frc = heciObj.getValue("HECI_FRC").getSimpleValue();
			if (stepManager.getListOfValuesHome().getListOfValuesByID("LOV_FRC").getListOfValuesValueByID(frc)) {
				node.getValue("FRC").setSimpleValue(frc);
			} else {
				errorMessage.push("Selected HECI is missing FRC value " + frc + " in the system. Please contact the Data Governance team to request its addition");
			} //STIBO-3237 Prod support( Feb 22 Release)
			node.getValue("CPR").setSimpleValue(heciObj.getValue("HECI_CPR").getSimpleValue());
			node.getValue("EXL_TPI_FLG").setSimpleValue(heciObj.getValue("HECI_Exclude_from_TPI_flag").getSimpleValue());
			node.getValue("Manufacturer_Status").setSimpleValue(heciObj.getValue("HECI_Manufacturer_Status").getSimpleValue());
			//STIBO-3237 Prod support( Feb 22 Release)
			var oemName = heciObj.getValue("HECI_Manufacturer_Name").getSimpleValue();
			if (stepManager.getListOfValuesHome().getListOfValuesByID("LOV_OEM_Full_Name").getListOfValuesValueByID(oemName)) {
				node.getValue("OEM_Full_Name").setSimpleValue(oemName);
			} else {
				errorMessage.push("Selected HECI is missing OEM Name" + oemName + " in the system. Please contact the Data Governance team to request its addition");
			} //STIBO-3237 Prod support( Feb 22 Release)
			node.getValue("OEM_WRLN").setSimpleValue(heciObj.getValue("HECI_Manufacturer_Code").getSimpleValue());
			node.getValue("Mfg_Part_No").setSimpleValue(heciObj.getValue("HECI_Manufacturer_Part").getSimpleValue());
			node.getValue("EQUIP_TYPE").setSimpleValue(heciObj.getValue("HECI_EQUIP_TYPE").getSimpleValue());
		}
	});
	return errorMessage.join("\n");
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.getHECIdetails = getHECIdetails
exports.processHECIResponse = processHECIResponse
exports.setDefaultUserSelection = setDefaultUserSelection
exports.createHECIDC = createHECIDC
exports.getTagTextContent = getTagTextContent
exports.clearHECIDetails = clearHECIDetails
exports.setHECIAttributes = setHECIAttributes