/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_BPA_ZoomDataValidation",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "BPA Zoom Data Validation",
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
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "reference",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ContractItem_Item",
    "description" : null
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "dataIssues",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,reference,dataIssues,logger,stepManager) {
/**
 * @author - Tanusree [CTS]
 * Zoom Data Validation for WRLN 
 */
var noIssuesFlag = true;
var pitem;
var citemRef = node.getReferences(reference);

if (node.getValue("BPA_Processed_In_EBS").getSimpleValue() != "Yes") {
	if (citemRef != null && citemRef.size() > 0) {
		var businessSource = node.getValue("Legacy_Source").getSimpleValue();
		log.info("businessSource--> " + businessSource)
		//if(businessSource == "Wireline" || businessSource == "WRLN_NON" || businessSource == "Quote") // 2_26_24 STIBO-1428
		if (businessSource != "Retail Consumer") {
			pitem = citemRef.get(0).getTarget();
			var refItemLOB = pitem.getValue("Line_Of_Business").getSimpleValue();
			if (refItemLOB == "Wireline") {
				checkItemStatus(pitem);
				checkMaterialItemType(pitem);
			}

		}
	}

	if (noIssuesFlag == false) {
		return dataIssues;
	} else {
		return true;
	}
} else {
	return noIssuesFlag;
}

function checkItemStatus(pitem) {
	var itemStatus = pitem.getValue("Item_Status").getSimpleValue();
	var iteNum = pitem.getValue("Item_Num").getSimpleValue();
	var materialItemType = pitem.getValue("Material_Item_Type_Web").getSimpleValue();

	var refItemLOB = pitem.getValue("Line_Of_Business").getSimpleValue();
	if (itemStatus == "Obs NS" || itemStatus == "Obs S") {
		dataIssues.addWarning("Item Number {" + iteNum + "} is not active", node);
		noIssuesFlag = false;
	} else if (materialItemType == null) {
		dataIssues.addWarning("This Material Item Type is not available on the Item. No zoom data added", node);
		noIssuesFlag = false;
	}
}

function checkMaterialItemType(pitem) {
	var orgCodeStatus = true;
	var materialItemType = pitem.getValue("Material_Item_Type_Web").getSimpleValue();

	if (materialItemType != null) {
		var citemRegionDistCenter = node.getValue("BPA_Region_Distribution_Center").getID();
		if (citemRegionDistCenter == null) {
			//dataIssues.addWarning("Please select Region Distribution Center.");
			dataIssues.addWarning("Please select Region Distribution Center.", node, stepManager.getAttributeHome().getAttributeByID("BPA_Region_Distribution_Center"));
			noIssuesFlag = false;
		} else {
			if (!(materialItemType.contains("Minor Material") || materialItemType.contains("Cable"))) {
				var pitemRegionDistCenters = pitem.getValue("Region_Distribution_Center").getValues();

				/*if(citemRegionDistCenter == null)
				{
					citemRegionDistCenter = bpaLib.getDCAttribute("BPA_Region_Distribution_Center", "Region", node, step);
				}*/

				logger.info("citemRegionDistCenter -> " + citemRegionDistCenter);

				if (pitemRegionDistCenters.size() > 0) {
					var pitemRegDistList = "";

					for (var i = 0; i < pitemRegionDistCenters.size(); i++) {
						var pitemRegDistCenter = pitemRegionDistCenters.get(i).getID();
						pitemRegDistList += pitemRegDistCenter;
						logger.info("pitemRegDistList ->" + pitemRegDistList);

					}
					if (!pitemRegDistList.includes(citemRegionDistCenter)) {
						dataIssues.addWarning("{" + citemRegionDistCenter + "} is not available on the Item");
						noIssuesFlag = false;
					}
				}
			}
			if (materialItemType == "Minor Material" || materialItemType == "Cable") {
				citemRegionDistCenter = node.getValue("BPA_Region_Distribution_Center").getID();

				if (citemRegionDistCenter != null) {
					if (citemRegionDistCenter == "All Regions") {
						dataIssues.addWarning("All regions is not applicable for Minor Material/Cable/Plugin. Please choose a region.");
						noIssuesFlag = false;
					} else {
						orgCodeStatus = getMatchingOrgCode(pitem, citemRegionDistCenter);
						if (orgCodeStatus == true) {
							dataIssues.addWarning("This region is not available on the Item. No zoom data added");
							noIssuesFlag = false;
						}
					}
				}

			}
		}
	}
}

function getMatchingOrgCode(pitem, regionDistCenter) {
	var orgCodeStatus = true;
	var citemsLinked = pitem.getChildren();

	for (var i = 0; i < citemsLinked.size(); i++) {
		var citem = citemsLinked.get(i);
		var orgCode = citem.getValue("Organization_Code").getID();
		if (regionDistCenter != null && regionDistCenter.contains(orgCode) == true) {
			orgCodeStatus = false;
		}
	}
	return orgCodeStatus;
}
}