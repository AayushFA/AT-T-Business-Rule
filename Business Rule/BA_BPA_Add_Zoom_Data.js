/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_Add_Zoom_Data",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "BPA WRLN Add Zoom Data",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item", "Item", "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "lib"
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
    "contract" : "ReferenceTypeBindContract",
    "alias" : "refContractItem",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ContractItem_Item",
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "BPAZoomDataLookUP",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "dataIssues",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "webUIContext",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,refContractItem,BPAZoomDataLookUP,stepManager,dataIssues,webUIContext,lib) {
/**
 * @author - John [CTS]
 * Add Zoom Data for ENT & WRLN from WRLN pItem
 */
 
/*
var regionDCobj = null;
var cItemRegDistCenter;
var noIssuesFlag = true;
var zipDefault = "";
var regionalStatusDefault = "ACTIVE";
var zipActionDefault = "INCLUDE";
var stateDefault = "";
var region = null;


const ALLTCompanyCodes = ['AQ00', 'AN00', 'AP00', 'AM00', 'AL00', '5A00', '5F00', '5G00',
	'5K00', '5L00', '5M00', '5N00', '5S00', '5T00', 'PN00', 'PC00', 'TT00',
	'TM00', 'TK00', 'TO00', 'TA00'
];
if (node.getValue("BPA_Processed_In_EBS").getSimpleValue() != "Yes") {

	var businessSource = node.getValue("Legacy_Source").getSimpleValue();
	//if (businessSource == "Wireline" || businessSource == "WRLN_NON" || businessSource == "Quote") {//2_27_24 STIBO-1428
	if (businessSource != "Retail Consumer") {
		log.info("businessSource--> " + businessSource)
		getRefContractItem();
	}

	if (noIssuesFlag == false) {
		return dataIssues;
	} else {
		return true;
	}
}

function getRefContractItem() {

	var refContractItemID = node.getReferences(refContractItem);
	if (refContractItemID.size() > 0) {

		var refItem = refContractItemID.get(0).getTarget();
		var materialItemType = refItem.getValue("Material_Item_Type_Web").getSimpleValue();
		var itemStatus = refItem.getValue("Item_Status").getSimpleValue();
		var refItemLOB = refItem.getValue("Line_Of_Business").getSimpleValue();
		if (refItemLOB == "Wireline") {
			cItemRegDistCenter = node.getValue("BPA_Region_Distribution_Center").getLOVValue();
			if (itemStatus == "Obs NS" || itemStatus == "Obs S") {
				var itemNum = refItem.getValue("Item_Num").getSimpleValue();
				webUIContext.showAlert("ERROR", "Item Number {" + itemNum + "} is not active");
				logger.info("Item Number {" + itemNum + "} is not active");
			} else if (materialItemType == null) {
				webUIContext.showAlert("Alert", "This Material Item Type is not available on the Item. No zoom data added");
			} else if (materialItemType != null && cItemRegDistCenter != null) {

				cItemRegDistCenter = cItemRegDistCenter.getID();
				if (materialItemType != "Minor Material" && materialItemType != "Cable") { // Non MMC case
					var regDistCenter = refItem.getValue("Region_Distribution_Center").getValues()
					if (regDistCenter == "[]") {
						logger.info("The Region Distribution Center is blank on the Master Item Reference. Please review the Zoom Data Tab.");
						webUIContext.showAlert("Alert", "The Region Distribution Center is blank on the Master Item Reference.", "Please review the Zoom Data Tab.");
						getRegionsID(materialItemType, cItemRegDistCenter, "Not Active");
					} else {
						var counter = 0
						for (var i = 0; i < regDistCenter.size(); i++) {
							if (cItemRegDistCenter == regDistCenter.get(i).getID()) {
								counter++
								getRegionsID(materialItemType, cItemRegDistCenter, "Not Active");
								break;
							}
						}
						if (counter == 0) {
							webUIContext.showAlert("ERROR", "{" + cItemRegDistCenter + "} is not available on the Item");
							logger.info("{" + cItemRegDistCenter + "} is not available on the Item");
						}
					}
				} else { // MMC Case				

					if (cItemRegDistCenter == "All Regions") {
						webUIContext.showAlert("ERROR", "All regions is not applicable for Minor Material/Cable. Please choose a region.");
						logger.info("All regions is not applicable for Minor Material/Cable. Please choose a region.");
					} else {

						var childOrgs = refItem.getChildren().toArray();
						var counter = 0;
						childOrgs.forEach(function(child) {
							var childId = child.getID();
							var childOrgCodes = child.getValue("Organization_Code").getID();
							if (childOrgCodes == cItemRegDistCenter) {
								counter++;
								var childItemStatus = child.getValue("Item_Status").getSimpleValue();
								if (childItemStatus == "Active S") {
									getRegionsID(materialItemType, cItemRegDistCenter, childItemStatus)
								} else {
									getRegionsID(materialItemType, cItemRegDistCenter, "Not Active")
								}
							}
						});

						if (counter == 0) {
							webUIContext.showAlert("ERROR", "This region is not available on the Item. No zoom data added");
							logger.info("This region is not available on the Item. No zoom data added");
						}
					}
				}
			}
		}
	}

	function getRegionsID(materialItemType, regDistCenter, itemStatus) {

		var combined = materialItemType + "|" + regDistCenter + "|" + itemStatus + "";
		log.info("combined--> " + combined)
		var bpaLookUpResult = BPAZoomDataLookUP.getLookupTableValue("LT_BPA_Wireline_Zoom_Data", combined);
		if (bpaLookUpResult != null) {
			bpaLookUpResult = bpaLookUpResult.split("\\|");
			for (var i = 0; i < bpaLookUpResult.length; i++) {
				var regDistCenEntityName = stepManager.getEntityHome().getEntityByID(bpaLookUpResult[i]).getName();
				if (regDistCenEntityName.includes("ALLT") == true) {
					for (var q = 0; q < ALLTCompanyCodes.length; q++) {
						lib.addRegionDC(node, stepManager, ALLTCompanyCodes[q], zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region);
					}
				} else {
					setRegionDC(bpaLookUpResult[i]);
				}
			}
		}
	}
}


function setRegionDC(regionID) {

	var regDistCenterEntityId = stepManager.getEntityHome().getEntityByID(regionID);
	if (regDistCenterEntityId != null) {

		var cfasCompCode = regDistCenterEntityId.getValue("CFAS_CO_Code").getSimpleValue();
		var regionCode = regDistCenterEntityId.getValue("Region_Code").getSimpleValue();
		var zip = regDistCenterEntityId.getValue("ZIP").getSimpleValue();
		if (zip == null) {
			zip = zipDefault;
		}
		var State = regDistCenterEntityId.getValue("STATE").getSimpleValue();
		if (State == null) {
			State = stateDefault;
		}
		lib.addRegionDC(node, stepManager, cfasCompCode, zip, State, zipActionDefault, regionalStatusDefault, regionCode);
	}
}
*/
}