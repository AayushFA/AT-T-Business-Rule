/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_CloneBPA",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "Clone BPA",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
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
    "alias" : "currentNode",
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
    "alias" : "ctx",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "itemRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ContractItem_Item",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "pbomRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "LEContractItem_BOM_Parent",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (currentNode,step,ctx,itemRef,pbomRef,lib) {
log.info("Inside Clone BPA");

if(currentNode)
{
	execute(currentNode);
}else if(!currentNode)
{
	var selection=ctx.getSelection();
	selection.forEach(function(item) {
		execute(item);
	});
}



function execute(node){

var contractItem = null;
var leContractChldItems = null;
var detail = null;
var cileObj = null;
var srcBPAChildren = null;
var srcChldItr = null;
var srcLeChldItr = null;
var ciStatus = null;
var cileList = new java.util.ArrayList();
var wfBPAclone = null;
var sourceBPACurrentStatus = null;
var clonedBPAObj = null;
try {

	sourceBPACurrentStatus = node.getValue("BPA_Status").getID();

	if (sourceBPACurrentStatus == "OPEN") {
		clonedBPAObj = cloneSrcBpa(node);

		ctx.showAlert("ACKNOWLEDGMENT", "BPA Created", clonedBPAObj.getID());

		/*

		var WFinstance = node.getWorkflowInstance(currentWF);
		
		WFinstance.getTaskByID("Clone").triggerLaterByID("stibo.suspend",null);

		*/
		

		wfBPAclone = step.getWorkflowHome().getWorkflowByID("BPA_Clone");
		
		//wfBPAclone.start(clonedBPAObj, null);
		//wfBPAclone.start(node, null);
		log.info(clonedBPAObj.getID())
		log.info(node.getID())
		//

		srcBPAChildren = node.getChildren();
		srcChldItr = srcBPAChildren.iterator();

		while (srcChldItr.hasNext()) {
			contractItem = srcChldItr.next();
			detail = contractItem.getValue("Detail").getID();
			ciStatus = contractItem.getValue("ContractItem_Status").getID();
			if (ciStatus && ciStatus == "OPEN") {
				var clonedCI = cloneSrcContractItem(contractItem, clonedBPAObj, detail);
				leContractChldItems = contractItem.getChildren();
				srcLeChldItr = leContractChldItems.iterator();
				while (srcLeChldItr.hasNext()) {
					cileObj = srcLeChldItr.next();
					var cileObjStatus = getValue("LE_Status").getID();
					if (cileObjStatus && ciStatus == "ACTIVE") {
						cileList.add(cileObj);
					}

				}
				cloneSrcContractLEChild(clonedCI, cileList);

			}


		}

	}
} catch (e) {
	log.info(e);
	throw (e);
}
}

log.info("Exiting Clone BPA");

function cloneSrcBpa(node) {
	var srcBPAId = null;
	var srcBPAName = null;
	var BPARoot = null;
	var clonedBPA = null;
	var clonedBPAId = null;
	var headerAttrGrp = null;
	var srcRefTargetSupSiteCode = null;
	//var refHome = step.getReferenceTypeHome().getReferenceTypeByID("BPA_To_Supplier");
	var refHome = step.	getLinkTypeHome().getClassificationProductLinkTypeByID("BPA_To_Supplier");
	var wfBPAcreate = step.getWorkflowHome().getWorkflowByID("Create_BPA");
	try {
		
		srcBPAId = node.getID();
		srcBPAName = node.getName();
		BPARoot = step.getProductHome().getProductByID(node.getParent().getID());
		if (BPARoot) {
			clonedBPA = BPARoot.createProduct(null, "BPA");

			if (clonedBPA) {
				if (wfBPAcreate) {
				
					clonedBPA.setName(srcBPAName);
					wfBPAcreate.start(clonedBPA, null);
					
				}
				clonedBPAId = clonedBPA.getID();
				clonedBPA.getValue("BPA_Cloned_From").setValue(node.getID());
				// clonedBPA.getValue("BPA_Status").setValue("Open");
				///
                  
                    
				
				srcRefTargetSupSiteCode = node.queryClassificationProductLinks(refHome).asList(1);
				//log.info("srcRefTargetSupSiteCode"+srcRefTargetSupSiteCode.getObjectType())
				if (srcRefTargetSupSiteCode.size() > 0) {

					var srcRefTargetItem = srcRefTargetSupSiteCode.get(0);
					
					log.info("srcRefTargetSupSiteCode"+srcRefTargetItem.getClassification())
					clonedBPA.createClassificationProductLink(srcRefTargetItem.getClassification(), refHome);
					

				}
				///// 
				copyAttributeValue(node, clonedBPA);


			}
		}
	} catch (e) {
		log.info(e);
		throw (e);
	}
	return clonedBPA;
}

function cloneSrcContractItem(contractItem, node, detail) {


	var srcCIId = null;
	var srcCIName = null;
	var parentBPAId = null;
	var parentBPA = null;
	var clonedCI = null;
	var clonedCIId = null;
	var ciAttrGrp = null;
	var ciItemAttrGr = null;
	var refATTItem = null;
	var CI_To_ItemRef = null;
	var CI_To_LEBOMRef = null;
	var srcRefTargetItemList = null;
	var srcRefTargetBOMList = null;
	var attrVal = null;
	var dcZip = contractItem.getDataContainerByTypeID("Region");
	var dcServiceChrg = contractItem.getDataContainerByTypeID("DC_MiscCharges");
	try {
		srcCIId = contractItem.getID();
		srcCIName = contractItem.getName();
		parentBPA = node;
		parentBPAId = parentBPA.getID();

		clonedCI = parentBPA.createProduct(null, "Contract_Item");
		if (clonedCI) {
			//lib.removeFromworkflow(clonedCI, step);
			clonedCIId = clonedCI.getID();
			
			srcRefTargetItemList = contractItem.queryReferences(itemRef).asList(1);
			//srcRefTargetBOMList = contractItem.queryReferences(pbomRef).asList(1);
		
			if (srcRefTargetItemList && srcRefTargetItemList.size() > 0) {

				var srcRefTargetItem = srcRefTargetItemList.get(0).getTarget();
				clonedCI.createReference(srcRefTargetItem, "ContractItem_Item")
				clonedCI.setName(srcRefTargetItem.getName());
			}

			/*if (srcRefTargetBOMList && srcRefTargetBOMList.size() > 0) {
				var srcRefTargetItem = srcRefTargetBOMList.get(0).getTarget();
				clonedCI.createReference(srcRefTargetItem, "LEContractItem_BOM_Parent")
				clonedCI.setName(srcRefTargetItem.getName());
			}*/


			copyDCs(contractItem, clonedCI);
			//copyDCs(contractItem, clonedCI, "Region");
			copyAttributeValue(contractItem, clonedCI);




		}


	} catch (e) {
		log.info(e);
		throw (e);
	}
	return clonedCI;
}

function cloneSrcContractLEChild(clonedCI, cileList) {
	var srcCILEId = null;
	var srcCILEObj = null;
	var srcCILEName = null;
	var parentCIId = null;
	var parentCI = null;
	var clonedCILEObj = null;
	var clonedCILEId = null;
	var refATTItem = null;
	var LEItemRef = null;
	var srcRefTargetItemList = null;
	try {
		parentCI = clonedCI;
		for (var i = 0; i < cileList.size(); i++) {
			srcCILEObj = cileList.get(i);
			clonedCILEObj = parentCI.createProduct(null, "LE_Contract_Item_Child");
			if (clonedCILEObj) {
				//lib.removeFromworkflow(clonedCI, step);
				LEItemRef = step.getReferenceTypeHome().getReferenceTypeByID("LocalExplosion_Item_Reference");
				srcRefTargetItemList = srcCILEObj.queryReferences(LEItemRef).asList(1);
				if (srcRefTargetItemList.size() > 0) {

					var srcRefTargetItem = srcRefTargetItemList.get(0).getTarget();
					clonedCILEObj.createReference(srcRefTargetItem, "LocalExplosion_Item_Reference")
					clonedCILEObj.setName(srcRefTargetItem.getName());
				}
			}
		}

	} catch (e) {
		log.info(e);
		throw (e);
	}
}

function copyAttributeValue(src, dest) {
	var AttrGrp = null;
	var srcObjType = null;
	var destObjType = null;
	var singleValID = null;
	var singleVal = null;
	var mulVal = null;
	var val = null;

	const exclude = ["BPA_Status", "Oracle_Contract_Num", "BPA_Supplier", "Supplier_Site", "EBS_BPA_Error_Reason", "EBS_ResponseStatus_BPA", "BPA_Legacy_Contract_No", "FOB_Terms", "Effect_Date", "Contract_Manager", "Freight_Terms", "Expiration_Date", "ContractItem_key", "BPA_Cloned_From"];

	try {

		srcObjType = src.getObjectType().getID();
		destObjType = dest.getObjectType().getID();

		if (srcObjType == "Contract_Item" && destObjType == "Contract_Item") {

			AttrGrp = step.getAttributeGroupHome().getAttributeGroupByID("AG_CotractItemAttributes");
		} else if (srcObjType == "BPA" && destObjType == "BPA") {

			AttrGrp = step.getAttributeGroupHome().getAttributeGroupByID("AG_BPA_Header_Attributes");

		} else if (srcObjType == "LE_Contract_Item_Child" && destObjType == "LE_Contract_Item_Child") {

			AttrGrp = step.getAttributeGroupHome().getAttributeGroupByID("AG_LE_Attr");

		}
		if (AttrGrp) {
			var Attrs = AttrGrp.getAttributes();
			var attrItr = Attrs.iterator();

			while (attrItr.hasNext()) {
				var attr = attrItr.next();
				var attrID = attr.getID();
				//log.info("attrID "+attrID)
				if (!exclude.includes(attrID + "")) {

					if (attr.hasLOV()) {
						if (attr.isMultiValued()) {
							mulVal = src.getValue(attrID).getValues();
							if (mulVal.size() > 0) {
								for (var i = 0; i < mulVal.size(); i++) {

									var valID = mulVal.get(i).getID();
									dest.getValue(attrID).append().addLOVValueByID(valID).apply();
								}
							}
						} else {

							singleValID = src.getValue(attrID).getID();
							if (singleValID) {
								dest.getValue(attrID).setLOVValueByID(singleValID);
							}
						}
					} else {
						if (!attr.isMultiValued()) {
							singleVal = src.getValue(attrID).getSimpleValue();
							if (singleVal) {
								dest.getValue(attrID).setValue(singleVal);
							}

						} else {
							mulVal = src.getValue(attrID).getValues();
							if (mulVal.size() > 0) {
								for (var i = 0; i < mulVal.size(); i++) {
									singleVal = mulVal.get(i).getSimpleValue();
									// log.info(" dest= "+singleVal +" --- "+attrID);
									dest.getValue(attrID).append().addValue(singleVal).apply();
								}
							}
						}

					}
				}
			}
		}



	} catch (e) {
		log.info(e);
		throw (e);
	}

}

function copyDCs(node, contractItem) {
	var existingDCs = node.getDataContainers();
	var existingDCsItr = existingDCs.iterator();
	var dataCon = null;
	var dcID = null;
	var Service_Amount = null;
	var Scharge_Status = null;
	var Flat_Charge_Flag = null;
	var Service_Charge_Code = null;
	var CFAS_CO_Code = null;
	var Regional_Status = null;
	var ZIP_Action = null;
	var STATE = null;
	var ZIP = null;
	while (existingDCsItr.hasNext()) {
		dataCon = existingDCsItr.next();
		dcID = dataCon.getDataContainerType().getID();
		log.info("DC  " + dcID)
		if (dcID == "DC_MiscCharges") {
			//var clonedDc = contractItem.getDataContainerByTypeID(dcID).addDataContainer().createDataContainerObject(null);
			var curDCarr = node.getDataContainerByTypeID(dcID).getDataContainers().toArray();

			curDCarr.forEach(function(curDc) {
				var curDCObj = curDc.getDataContainerObject();
				Service_Charge_Code = curDCObj.getValue("Service_Charge_Code").getSimpleValue();
				var DCkey = step.getHome(com.stibo.core.domain.datacontainerkey.keyhome.DataContainerKeyHome).getDataContainerKeyBuilder("DC_MiscCharges")
					.withAttributeValue("Service_Charge_Code", Service_Charge_Code)
					.build();
				var clonedDc = contractItem.getDataContainerByTypeID("DC_MiscCharges").addDataContainer().createDataContainerObjectWithKey(DCkey);
				//var clonedDc = contractItem.getDataContainerByTypeID(dcID).addDataContainer().createDataContainerObject(null);			

				if (curDCObj.getValue("Service_Amount")) {
					Service_Amount = curDCObj.getValue("Service_Amount").getSimpleValue();
					
					clonedDc.getValue("Service_Amount").setSimpleValue(Service_Amount);
				}

				if (curDCObj.getValue("Scharge_Status")) {
					Scharge_Status = curDCObj.getValue("Scharge_Status").getID();
					clonedDc.getValue("Scharge_Status").setLOVValueByID(Scharge_Status);
				}

				if (curDCObj.getValue("Flat_Charge_Flag")) {
					Flat_Charge_Flag = curDCObj.getValue("Flat_Charge_Flag").getID();
					clonedDc.getValue("Flat_Charge_Flag").setLOVValueByID(Flat_Charge_Flag);
				}

				if (curDCObj.getValue("Service_Charge_Code")) {
					Service_Charge_Code = curDCObj.getValue("Service_Charge_Code").getID();
					clonedDc.getValue("Service_Charge_Code").setLOVValueByID(Service_Charge_Code);
				}
			});


		} 
		/*else if (dcID == "Region") {
			// var clonedDc = contractItem.getDataContainerByTypeID(dcID).addDataContainer().createDataContainerObject(null);
			
			var curDCarr = node.getDataContainerByTypeID(dcID).getDataContainers().toArray();
			
             
			curDCarr.forEach(function(curDc) {
			
			var curDCObj = curDc.getDataContainerObject();
			//
			 CFAS_CO_Code = curDCObj.getValue("CFAS_CO_Code").getSimpleValue();
		     ZIP = curDCObj.getValue("ZIP").getSimpleValue();
			 if(!ZIP)
			 {
			   ZIP="N/A";
			 }
			 Regional_Status = curDCObj.getValue("Regional_Status").getSimpleValue();
			var DCkey = step.getHome(com.stibo.core.domain.datacontainerkey.keyhome.DataContainerKeyHome).getDataContainerKeyBuilder("Region")
				.withAttributeValue("CFAS_CO_Code", CFAS_CO_Code)
				.withAttributeValue("ZIP", ZIP)
				.withAttributeValue("Regional_Status", Regional_Status)
				.build();
			//
			
			
				var clonedDc = contractItem.getDataContainerByTypeID(dcID).addDataContainer().createDataContainerObjectWithKey(DCkey);
				

				if (curDCObj.getValue("STATE")) {
					STATE = curDCObj.getValue("STATE").getID();
					clonedDc.getValue("STATE").setLOVValueByID(STATE);

				}

				if (curDCObj.getValue("ZIP")) {
					ZIP = curDCObj.getValue("ZIP").getID();
					clonedDc.getValue("ZIP").setLOVValueByID(ZIP);
				}

				if (curDCObj.getValue("ZIP_Action")) {
					ZIP_Action = curDCObj.getValue("ZIP_Action").getID();
					clonedDc.getValue("ZIP_Action").setLOVValueByID(ZIP_Action);
				}

				if (curDCObj.getValue("Regional_Status")) {
					Regional_Status = curDCObj.getValue("Regional_Status").getID();
					clonedDc.getValue("Regional_Status").setLOVValueByID(Regional_Status);
				}

				if (curDCObj.getValue("CFAS_CO_Code")) {
					CFAS_CO_Code = curDCObj.getValue("CFAS_CO_Code").getID();
					clonedDc.getValue("CFAS_CO_Code").setLOVValueByID(CFAS_CO_Code);
				}
			});

		}

*/


	}
}
}