/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "ATT_BPA_Zoom_Library",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "AT&T_Global_Libraries" ],
  "name" : "AT&T BPA Zoom Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "bpaLib"
  }, {
    "libraryId" : "ATT_BPA_ASL_Library",
    "libraryAlias" : "aslLib"
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
/**
 * @author - Madhuri [CTS]
 * Zoom Library
 */
function zoomDataPopulate(node, refItem, BPAZoomDataLookUP, stepManager, parent) {
  var error = "";
  var info = "";
  itemNum = refItem.getValue("Item_Num").getSimpleValue();
  refItemStatus_WRLN = refItem.getValue("Item_Status_WRLN").getID();
  refItemStatus_ENT = refItem.getValue("Item_Status_ENT").getID();
  if (refItem.getValue("Line_Of_Business").getID() == "WRLN" && refItemStatus_WRLN.startsWith("Act")) {
    [error,info] = WRLNZoomData(node, refItem, BPAZoomDataLookUP, stepManager);
  } else if (refItem.getValue("Line_Of_Business").getID() == "ENT" && (refItemStatus_ENT.startsWith("Act") || refItemStatus_ENT == "Pre Launch" || refItemStatus_ENT == "No Buy" || refItemStatus_ENT == "DSL COL")) {
     ENTZoomData(node, refItem, BPAZoomDataLookUP, stepManager, parent);
  } else {
    //Do Nothing
  }
  return [error,info];
}

function WRLNZoomData(node, refItem, BPAZoomDataLookUP, stepManager) {
   var errMsg ="";
   var infoMsg = "";
  var serviceCount = 0;
  var approvedList;
  var businessSource = node.getValue("Legacy_Source").getSimpleValue();
  if (businessSource != "Retail Consumer") {
    approvedList = getAllFromApprovedWS(stepManager, node, "Region");
   // resetDataContainer(node, "Region");
    populateApprovedWSData(node, stepManager, approvedList, refItem);
    if (refItem) {
      var itemNum = refItem.getValue("Item_Num").getSimpleValue();
      var refItemLOB = refItem.getValue("Line_Of_Business").getSimpleValue();
      if (refItemLOB == "Wireline") {
        var childOrgs = refItem.getChildren().toArray();
        var childOrgList = new java.util.ArrayList();
        var [CIRegDistList, consignOrgList, apprConsignOrgList] = getRegionsList(node, stepManager);
         [errMsg,infoMsg] = createZoom(node, stepManager, refItem, CIRegDistList, consignOrgList, apprConsignOrgList, BPAZoomDataLookUP);       
      }
    }
  }
  return [errMsg,infoMsg];
}

function ENTZoomData(node, refItem, BPAZoomDataLookUP, stepManager, parent) {
  var zipDefault = "";
  var regionalStatusDefault = "ACTIVE";
  var zipActionDefault = "INCLUDE";
  var stateDefault = "";
  var region = null;
  var serviceCount = 0;
  var approvedList;
  var businessSource = node.getValue("Legacy_Source").getSimpleValue();
  if (businessSource != "Retail Consumer") {
    approvedList = getAllFromApprovedWS(stepManager, node, "Region");
   // resetDataContainer(node, "Region");
    populateApprovedWSData(node, stepManager, approvedList, refItem);
    var CFASCodeDefault = "ZB";
    if (refItem) {
      var inventoryCat = refItem.getValue("Inventory_Cat_ENT").getSimpleValue();
      var pItemNum = refItem.getValue("Item_Num").getSimpleValue();
      var refItemLOB = refItem.getValue("Line_Of_Business").getSimpleValue();
      if (refItemLOB == "Entertainment") {
        var dcExist = node.getDataContainerByTypeID("Region").getDataContainers().toArray().length;
        if (dcExist == 0) {
          if (!checkZBDup(node, refItem)) {
            addRegionDCforENT(node, stepManager, refItem, CFASCodeDefault, zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region);
          }
          cItemRegDistCenter = node.getValue("CI_Region_Distribution_Center").getValues();
          if (cItemRegDistCenter.size() > 0) {
            for (var i = 0; i < cItemRegDistCenter.size(); i++) {
              if (cItemRegDistCenter.get(i).getID() == "Services") {
                addRegionDC(node, stepManager, refItem, "SS00", zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, "Services");
                addRegionDC(node, stepManager, refItem, "ALQB", zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, "Services");
                addRegionDC(node, stepManager, refItem, "Q9AX", zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, "Services");
              }
            }
          }
          if (inventoryCat && pItemNum) {
            if (pItemNum.startsWith("RTL.") && inventoryCat.includes("COLLATERAL") == true) {
              CFASCode = "SS00";
              addRegionDCforENT(node, stepManager, refItem, CFASCode, zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region);
            }
            if (pItemNum.startsWith("ATT.") && inventoryCat.includes("LITERATURE") == true) {
              CFASCode = "SS00";
              addRegionDCforENT(node, stepManager, refItem, CFASCode, zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region);
            }
            var supplierNum = parent.getValue("BPA_Supplier").getSimpleValue();
            if (inventoryCat && supplierNum) {
              var combined = inventoryCat + "|" + supplierNum;
              var bpaLookUpResult = BPAZoomDataLookUP.getLookupTableValue("LT_BPA_ENT_Zoom_Data", combined);
              if (bpaLookUpResult) {
                bpaLookUpResult = bpaLookUpResult.split("\\|");
                for (var i = 0; i < bpaLookUpResult.length; i++) {
                  CFASCode = bpaLookUpResult[i];
                  addRegionDCforENT(node, stepManager, refItem, CFASCode, zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region);
                }
              }
            }
          }
        }
      }
    }
  }
  return "";
}

function getAllFromApprovedWS(step, node, atr) {
  var approveList = new java.util.ArrayList();
  var appNode = step.executeInWorkspace("Approved", function(approvedManager) {
    var approveWSOBJ = approvedManager.getObjectFromOtherManager(node);
    if (approveWSOBJ) {
      var regionDCsItr = approveWSOBJ.getDataContainerByTypeID(atr).getDataContainers().iterator();
      while (regionDCsItr.hasNext()) {
        var regDcObj = regionDCsItr.next().getDataContainerObject();
        var cfasCodeApprove = regDcObj.getValue("CFAS_CO_Code").getSimpleValue();
        var zipApprove = regDcObj.getValue("ZIP").getSimpleValue();
        var stateApprove = regDcObj.getValue("STATE").getSimpleValue();
        var zipActionApprove = regDcObj.getValue("ZIP_Action").getSimpleValue();
        var regionApprove = regDcObj.getValue("Regional_Status").getSimpleValue();
        var regionDCApprove = regDcObj.getValue("BPA_Region_Distribution_Center").getID();
        var approveVal = regionDCApprove + "-" + cfasCodeApprove + "-" + regionApprove + "-" + stateApprove + "-" + zipApprove + "-" + zipActionApprove;
        approveList.add(approveVal);
      }
    }
  });
  return approveList;
}

function populateApprovedWSData(node, stepManager, approvedList, refItem) {
  for (var i = 0; i < approvedList.size(); i++) {
    var approvedData = approvedList.get(i);
    if (approvedData.includes("null"))
      approvedData = approvedData.replaceAll("null", "");
    var regionDCdata = approvedData.split("-");
    addRegionDC(node, stepManager, refItem, regionDCdata[1], regionDCdata[4], regionDCdata[3], regionDCdata[5], regionDCdata[2], regionDCdata[0]);
  }
}

function resetDataContainer(node, region) {
  node.getDataContainerByTypeID(region).deleteLocal();
}

function getRegionsList(node, stepManager) {
  var CIRegDistList = new java.util.ArrayList();
  var consignOrgList = new java.util.ArrayList();
  var apprConsignOrgList = new java.util.ArrayList();
  cItemRegDistCenter = node.getValue("CI_Region_Distribution_Center").getValues();
  for (var i = 0; i < cItemRegDistCenter.size(); i++) {
    CIRegDistList.add(cItemRegDistCenter.get(i).getID());
  }
  log.info("Initial CIRegDistList:" + CIRegDistList);
  //Add Consigned Org Codes to the Zoom list
  var status = node.getValue("BPA_Processed_In_EBS").getID();
  var consignOrgs = node.getValue("Consign_Org_Code").getValues();
  log.info("consignOrgs:" + consignOrgs)
  for (var i = 0; i < consignOrgs.size(); i++) {
    if (!CIRegDistList.contains(consignOrgs.get(i).getValue())) {
      CIRegDistList.add(consignOrgs.get(i).getValue());
    }
    consignOrgList.add(consignOrgs.get(i).getValue());
  }
  if (status == "Y" ||status == "E") {
    var approvedManager = stepManager.executeInWorkspace("Approved", function(stepApr) {
      return stepApr;
    });
    var approvedNode = approvedManager.getProductHome().getProductByID(node.getID());
    if (approvedNode) {
      var apprConsignOrgs = approvedNode.getValue("Consign_Org_Code").getValues();
      for (var j = 0; j < apprConsignOrgs.size(); j++) {
        if (!CIRegDistList.contains(apprConsignOrgs.get(j).getValue())) {
          CIRegDistList.add(apprConsignOrgs.get(j).getValue());
        }
        apprConsignOrgList.add(apprConsignOrgs.get(j).getValue());
      }
    }
  }
  log.info("CIRegDistList:" + CIRegDistList + CIRegDistList.size());
  log.info("consignOrgList:" + consignOrgList);
  log.info("apprConsignOrgList: " + apprConsignOrgList);
  return [CIRegDistList, consignOrgList, apprConsignOrgList];
}

function createZoom(node, stepManager, refItem, CIRegDistList, consignOrgList, apprConsignOrgList, BPAZoomDataLookUP) {
  var infoMsg = "";
  var infoMsg1 = "";
  var infoMsg2 = "";
  var errMsg = "";
  var errMsg1 = "";
  var errMsg2 ="";
  var region = null;
  var zipDefault = "";
  var regionalStatusDefault = "ACTIVE";
  var zipActionDefault = "INCLUDE";
  var stateDefault = "";
  var materialItemType = refItem.getValue("Material_Item_Type").getSimpleValue();
  var itemNum = refItem.getValue("Item_Num").getSimpleValue();
  var refItemStatus = refItem.getValue("Item_Status_WRLN").getID();
  if (materialItemType != null) {
    if (CIRegDistList.size() == 0 && materialItemType != "Plug-In") {
      infoMsg += "\n The Region(s) selection for Zoom Form is blank. Please review the Zoom Data.";
    } else if (materialItemType != "Minor Material" && materialItemType != "Cable" && materialItemType != "Plug-In") { // Non MMC case														
      log.info("Into Non MMC case");      
      createZoomNonMMC(node, stepManager, refItem, materialItemType, CIRegDistList, zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region, BPAZoomDataLookUP);
    }  else if ((materialItemType == "Minor Material" || materialItemType == "Cable") && !CIRegDistList.contains("All Regions")) { // MMC Case				
      log.info("Into MMC without All Regions")
      for (var i = 0; i < CIRegDistList.size(); i++) {
        var citemRegionDC = CIRegDistList.get(i);
        if (citemRegionDC == "Services") {
          log.info("In Services");
          addRegionDC(node, stepManager, refItem, "SS00", zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, "Services");
          addRegionDC(node, stepManager, refItem, "ALQB", zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, "Services");
          addRegionDC(node, stepManager, refItem, "Q9AX", zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, "Services");
        } else
          [errMsg1, infoMsg1] = createZoomMMC(node, stepManager, refItem, citemRegionDC, consignOrgList, apprConsignOrgList, zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region, BPAZoomDataLookUP);
      }
    } else if ((materialItemType == "Minor Material" && CIRegDistList.size() == 1 && CIRegDistList.contains("All Regions")) ||
      (materialItemType == "Minor Material" && CIRegDistList.size() > 1 && CIRegDistList.contains("All Regions"))) {      
     
      log.info("Into MMC Case with All Regions");         
     var allActiveS = new java.util.ArrayList();
     var allActiveNS = new java.util.ArrayList();
  	 var childOrgs = refItem.getChildren().toArray();
	 childOrgs.forEach(function(actChild) {    
	   var actChildCode = actChild.getValue("Organization_Code").getID();    
	   var actChildStatus = actChild.getValue("Item_Status_WRLN").getID(); 
	   if(actChildCode != "ASE" && actChildCode != "WE4" && actChildStatus=="Active S")
	      allActiveS.add(actChildCode)
       if(actChildCode != "ASE" && actChildCode != "WE4" && actChildStatus=="Active NS")
	      allActiveNS.add(actChildCode)   
	 });		
	 
	 var childDefaultOrgs = new java.util.ArrayList();    
	  var entityObj = stepManager.getEntityHome().getEntityByID("ItemAttributes_Hierarchy");
	  var entityValue = entityObj.getValue("WRLN_Default_Child_Orgs").getSimpleValue();
	  entityValue = entityValue.split(",");
	  for (s=0;s<entityValue.length;s++){
	  	childDefaultOrgs.add(s)
	  }
      var consignChildItems = aslLib.returnConsignChildItems(refItem.getID(), stepManager);
      
      if(!(consignChildItems.size()==0 && allActiveS.size() == childDefaultOrgs.size()) && allActiveNS.size() != childDefaultOrgs.size()){
	      var childOrgList = new java.util.ArrayList();  	 
		 childOrgs.forEach(function(child) {    
		   var childOrgCode = child.getValue("Organization_Code").getID();    
		   var childItemStatus = child.getValue("Item_Status_WRLN").getID(); 
		   if(childOrgCode != "ASE" && childOrgCode != "WE4" && childItemStatus.startsWith("Act"))
		      childOrgList.add(childOrgCode)       
		 });	
	
	      for (var i = 0; i < childOrgList.size(); i++) {
	        var defaultChild = childOrgList.get(i);
	        [errMsg2, infoMsg2] = createZoomMMC(node, stepManager, refItem, defaultChild, consignOrgList, apprConsignOrgList, zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region, BPAZoomDataLookUP);
	      }
      }
	      if(allActiveNS.size() == childDefaultOrgs.size()){
	      	getRegionsID(refItem, materialItemType, "All Regions", "Not Active", node, stepManager, zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region, BPAZoomDataLookUP);
	       
	      }      
    } else if (materialItemType == "Plug-In" && refItemStatus.startsWith("Act")) {
      createZoomPlugin(node, stepManager, refItem, materialItemType, CIRegDistList, zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region, BPAZoomDataLookUP);
    }
  } else {
    infoMsg += "This Material Item Type is not available on the Item. No zoom data added";
  }
  errMsg+= errMsg1 + errMsg2;
  infoMsg+= infoMsg1 + infoMsg2;  
  return [errMsg,infoMsg];
}

function createZoomNonMMC(node, stepManager, refItem, materialItemType, CIRegDistList, zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region, BPAZoomDataLookUP) {
  for (var i = 0; i < CIRegDistList.size(); i++) {
    log.info(" CIRegDistList.size(): " + CIRegDistList.size());
    if (CIRegDistList.get(i) == "Services" && !CIRegDistList.contains("All Regions")) {
      addRegionDC(node, stepManager, refItem, "SS00", zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, "Services");
      addRegionDC(node, stepManager, refItem, "ALQB", zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, "Services");
      addRegionDC(node, stepManager, refItem, "Q9AX", zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, "Services");
    } else
      getRegionsID(refItem, materialItemType, CIRegDistList.get(i), "Not Active", node, stepManager, zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region, BPAZoomDataLookUP);
  }
}

function createZoomMMC(node, stepManager, refItem, curRegDC, consignOrgList, apprConsignOrgList, zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region, BPAZoomDataLookUP) {
  log.info("createZoomMMC Loop");
  var errMsg = "";
  var infoMsg = "";
  var codes = "";
  var refItemRegionDC = node.getValue("BPA_RefItem_Region_Distribution_Center").getValues();
  var itemNum = refItem.getValue("Item_Num").getSimpleValue();
  var status = node.getValue("BPA_Processed_In_EBS").getID();
  var materialItemType = refItem.getValue("Material_Item_Type").getSimpleValue();
  var childOrgList = new java.util.ArrayList();
  var childOrgs = refItem.getChildren().toArray();
  var childOrgCount = 0
  childOrgs.forEach(function(child){
  var childObjID = child.getObjectType().getID();
  if(childObjID=="Child_Org_Item"){
  childOrgCount = childOrgCount+1;
  }
})
 // if (childOrgs.length == 0 || (childOrgs.length == 1 && childOrgs[0].getValue("Organization_Code").getID().includes("ASE"))) {
	if (childOrgCount == 0 || (childOrgCount == 1 && childOrgs[0].getValue("Organization_Code").getID().includes("ASE"))) {
    errMsg = "\n Could not process region selection as " + itemNum + " is not assigned to respective child org, please work with Technical SME or Planner to assign item to respective child org and resubmit.";
  }else {  	
    childOrgs.forEach(function(child) {
    var childObjType = child.getObjectType().getID();
    if(childObjType=="Child_Org_Item"){
      var consignInd = "";
      var childId = child.getID();
      var childOrgCode = child.getValue("Organization_Code").getID();
      var childItemStatus = child.getValue("Item_Status").getID();
      var childConsignInd = child.getValue("Consignment").getID();
      childOrgList.add(childOrgCode)
      if (curRegDC == childOrgCode && childItemStatus == "Active S") {   
      	getRegionsID(refItem, materialItemType, childOrgCode, "Active S", node, stepManager, zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region, BPAZoomDataLookUP);   	        
      }
       if (curRegDC == childOrgCode && childItemStatus == "Active NS") {          
            getRegionsID(refItem, materialItemType, childOrgCode, "Not Active", node, stepManager, zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region, BPAZoomDataLookUP);
          }   
    }		  
    });
	   
  }  
  return [errMsg, infoMsg];
}

function createZoomPlugin(node, stepManager, refItem, materialItemType, CIRegDistList, zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region, BPAZoomDataLookUP) { 
  var refItemStatus = refItem.getValue("Item_Status_WRLN").getID();
  if (CIRegDistList.contains("Services") && !CIRegDistList.contains("All Regions")) {
    addRegionDC(node, stepManager, refItem, "SS00", zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, "Services");
    addRegionDC(node, stepManager, refItem, "ALQB", zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, "Services");
    addRegionDC(node, stepManager, refItem, "Q9AX", zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, "Services");
  }
  if (refItemStatus == "Active S")
    getRegionsID(refItem, materialItemType, "All Regions", "Active S", node, stepManager, zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region, BPAZoomDataLookUP);
  if (refItemStatus == "Active NS")
    getRegionsID(refItem, materialItemType, "All Regions", "Not Active", node, stepManager, zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region, BPAZoomDataLookUP);
}

function getRegionsID(refItem, materialItemType, regDistCenter, itemStatus, node, stepManager, zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region, BPAZoomDataLookUP) {
 // if (childConsignInd)
    var combined = materialItemType + "|" + regDistCenter + "|" + itemStatus + "";
  //else
   // var combined = materialItemType + "|" + regDistCenter + "|" + itemStatus + "";
  log.info("combined:" + combined)
  var bpaLookUpResult = BPAZoomDataLookUP.getLookupTableValue("LT_BPA_Wireline_Zoom_Data", combined);
  if (bpaLookUpResult != null) {
    bpaLookUpResult = bpaLookUpResult.split("\\|");
    for (var i = 0; i < bpaLookUpResult.length; i++) {
      var regDistCenEntityName = stepManager.getEntityHome().getEntityByID(bpaLookUpResult[i]).getName();
      if (regDistCenEntityName.includes("ALLT") == true) {
        for (var q = 0; q < ALLTCompanyCodes.length; q++) {
          addRegionDC(node, stepManager, refItem, ALLTCompanyCodes[q], zipDefault, stateDefault, zipActionDefault, regionalStatusDefault, region);
        }
      } else {
        regionID = bpaLookUpResult[i];
        var regDistCenterEntityId = stepManager.getEntityHome().getEntityByID(regionID);
        if (regDistCenterEntityId != null) {
          var cfasCompCode = regDistCenterEntityId.getValue("CFAS_CO_Code").getSimpleValue();
          var regionCode = regDistCenterEntityId.getValue("Region_Code").getSimpleValue();
          var zip = regDistCenterEntityId.getValue("ZIP").getSimpleValue();
          if (zip == null) {
            zip = zipDefault;
          }
          var state = regDistCenterEntityId.getValue("STATE").getSimpleValue();
          if (state == null) {
            state = stateDefault;
          }
          addRegionDC(node, stepManager, refItem, cfasCompCode, zip, state, zipActionDefault, regionalStatusDefault, regionCode);
        }
      }
    }
  }
}

function addRegionDC(node, step, pitem, CFASCode, zip, state, zipAction, regionalStatus, region) {
  log.info("addRegionDC: " + pitem);
  log.info(CFASCode + zip + state)
  var error = false;
  var errMsg = "";
  var itemNum = pitem.getValue("Item_Num").getSimpleValue();
  if (!checkExistingDC(node, CFASCode, zip, state)) {
    var regionDCobj = node.getDataContainerByTypeID("Region").addDataContainer().createDataContainerObject(null);
    if (CFASCode) {
      regionDCobj.getValue("CFAS_CO_Code").setSimpleValue(CFASCode);
    }
    if (zip) {
      regionDCobj.getValue("ZIP").setSimpleValue(zip);
    }
    if (state) {
      regionDCobj.getValue("STATE").setSimpleValue(state);
    }
    if (zipAction) {
      regionDCobj.getValue("ZIP_Action").setSimpleValue(zipAction);
    }
    if (regionalStatus) {
      regionDCobj.getValue("Regional_Status").setSimpleValue(regionalStatus);
    }
    if (region) {
      //regionDCobj.getValue("BPA_Region_Distribution_Center").addLOVValueByID(region);
      regionDCobj.getValue("BPA_Region_Distribution_Center").setLOVValueByID(region);
    }
  } else {
    errMsg = errMsg + "\n Could not process region selection as " + itemNum + " and BPA already has same region (company code combination) please review, correct, and resubmit or disregard change.";
    error = true;
  }
  return errMsg;
}

function checkExistingDC(node, cfasCompCode, zip, state) {
	log.info("checkExistingDC: "+node+cfasCompCode+ zip+ state)
	var regionDC = node.getDataContainerByTypeID("Region").getDataContainers().toArray();
	log.info("Zoom Length: "+regionDC + regionDC.length)
  if (node.getDataContainerByTypeID("Region").getDataContainers().toArray().length != 0) {
    var counter = 0;
    var regionDCsItr = node.getDataContainerByTypeID("Region").getDataContainers().iterator();
    while (regionDCsItr.hasNext()) {
      var regDcObj = regionDCsItr.next().getDataContainerObject();
      log.info("CFAS Code: "+regDcObj.getValue("CFAS_CO_Code").getSimpleValue() + "Zip: "+regDcObj.getValue("ZIP").getSimpleValue()+
        "State: "+regDcObj.getValue("STATE").getSimpleValue() )
      if (regDcObj.getValue("CFAS_CO_Code").getSimpleValue() == cfasCompCode &&
        (!regDcObj.getValue("ZIP").getSimpleValue() || regDcObj.getValue("ZIP").getSimpleValue() == zip) &&
        (!regDcObj.getValue("STATE").getSimpleValue() || regDcObj.getValue("STATE").getSimpleValue() == state)) {
        counter++;
      }
    }
    log.info("counter: "+counter)
    if (counter == 0) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
}

function addRegionDCforENT(node, step, pitem, CFASCode, zip, state, zipAction, regionalStatus, region) {
  var error = false;
  var errMsg = "";
  var itemNum = pitem.getValue("Item_Num").getSimpleValue();
  if (checkDupCFASCompCode(node, pitem, step, CFASCode, zip, state) == false) {
    var regionDCobj = node.getDataContainerByTypeID("Region").addDataContainer().createDataContainerObject(null);
    if (CFASCode) {
      regionDCobj.getValue("CFAS_CO_Code").setSimpleValue(CFASCode);
    }
    if (zip) {
      regionDCobj.getValue("ZIP").setSimpleValue(zip);
    }
    if (state) {
      regionDCobj.getValue("STATE").setSimpleValue(state);
    }
    if (zipAction) {
      regionDCobj.getValue("ZIP_Action").setSimpleValue(zipAction);
    }
    if (regionalStatus) {
      regionDCobj.getValue("Regional_Status").setSimpleValue(regionalStatus);
    }
    if (region) {
      regionDCobj.getValue("BPA_Region_Distribution_Center").setLOVValueByID(region);
    }
  } else { //duplicate check = true 
    getRegionDataforEnt(node, pitem)
  }
}

function checkDupCFASCompCode(node, pitem, step, currentNodeValue) {
  var count = 0;
  var refItem;
  var citem;
  var citemID;
  var refCI = pitem.getReferencedByProducts();
  var itr = refCI.iterator();
  while (itr.hasNext()) {
    var obj = itr.next();
    citem = obj.getSource();
    //log.info("citem = " + citem);
    if (citem.getObjectType().getID() == "Contract_Item" && citem.getID() != node.getID()) {
      var parent = citem.getParent();
      if (parent.getObjectType().getID() == "BPA")
        var folder = parent.getParent().getID();
      else
        var folder = citem.getParent().getID()
      if ((parent == "BPA" && (folder != "CancelledProducts" && folder != "BPA_Onboarding")) || (folder != "CancelledProducts" && folder != "BPA_Onboarding")) {
        if (citem.getDataContainerByTypeID("Region").getDataContainers().toArray().length != 0) {
          var regionDCsItr = citem.getDataContainerByTypeID("Region").getDataContainers().iterator();
          while (regionDCsItr.hasNext()) {
            //log.info("inside region DC loop");
            var regDcObj = regionDCsItr.next().getDataContainerObject();
            var regDCcfasCompCode = regDcObj.getValue("CFAS_CO_Code").getSimpleValue();
            var regDCZip = regDcObj.getValue("ZIP").getID();
            var regDCState = regDcObj.getValue("STATE").getID();
            var regionalStatus = regDcObj.getValue("Regional_Status").getSimpleValue();
            var regDCData = regDCcfasCompCode + regDCZip + regDCState;
            //log.info("combined value = " +regDCData );
            if (regDCData == currentNodeValue) {
              //log.info("inside condition");
              var expirationDate = citem.getParent().getValue("Expiration_Date").getSimpleValue();
              //log.info("expirationDate = " + expirationDate);
              if (citem.getParent().getValue("BPA_Status").getSimpleValue() == "Open") {
                //log.info("Inside BPA status = " + citem.getParent().getValue("BPA_Status").getSimpleValue());
                if ((expirationDate && expirationDate >= getCurrentDate()) || !expirationDate || expirationDate == "") {
                  //log.info("is Expired = " + lib.getCurrentDate());								
                  if (citem.getValue("ContractItem_Status").getSimpleValue() == "Open") {
                    //log.info("citem status = " + citem.getValue("ContractItem_Status").getSimpleValue());
                    if (regionalStatus && regionalStatus == "ACTIVE") {
                      //log.info("regionalStatus = " + regionalStatus);
                      count++;
                      citemID = citem.getID();
                      break;
                    }
                  }
                }
              } else {
                break;
              }
            }
          }
        }
      }
    }
  }
  if (count == 0) {
    return false;
  } else {
    return true;
  }
}

function checkZBDup(node, pitem) {
	var flag = false;
	var citem;
	var citemCFASCodeList;
	var refCI = pitem.getReferencedByProducts();
	var itr = refCI.iterator();
	while (itr.hasNext()) {
		var ref = itr.next();
		citem = ref.getSource();
		if (citem.getObjectType().getID() == "Contract_Item" && citem.getID() != node.getID()) {
			var parent = citem.getParent();
			var parentObjType = parent.getObjectType().getID();
			if (parentObjType == "BPA")
				var folder = parent.getParent().getID();
			else
				var folder = citem.getParent().getID()
			if ((parentObjType == "BPA" && (folder != "CancelledProducts" && folder != "BPA_Onboarding")) || (folder != "CancelledProducts" && folder != "BPA_Onboarding")) {
				if (citem.getDataContainerByTypeID("Region").getDataContainers().toArray().length != 0) {
					citemCFASCodeList = new java.util.ArrayList();
					var regionDCsItr = citem.getDataContainerByTypeID("Region").getDataContainers().iterator();
					while (regionDCsItr.hasNext()) {					
						var regDcObj = regionDCsItr.next().getDataContainerObject();
						var regDCcfasCompCode = regDcObj.getValue("CFAS_CO_Code").getSimpleValue();
						var regionalStatus = regDcObj.getValue("Regional_Status").getSimpleValue();
						var ZipStatus = regDcObj.getValue("ZIP_Action").getSimpleValue();
						if (regDCcfasCompCode == "ZB" && regionalStatus == "ACTIVE" && ZipStatus == "INCLUDE") {
							var expirationDate = citem.getParent().getValue("Expiration_Date").getSimpleValue();
							if (citem.getParent().getValue("BPA_Status").getSimpleValue() == "Open") {								
								if ((expirationDate && expirationDate >= bpaLib.getCurrentDate()) || !expirationDate || expirationDate == "") {
									if (citem.getValue("ContractItem_Status").getSimpleValue() == "Open") {
										flag = true;
										break;
									}
								}
							}
						}
					}
				}
			}
		}
	}
	return flag;
}

function addRegionDCNewCI(node, step, CFASCode, zip, state, zipAction, regionalStatus, region) {

	if (checkExistingDC(node, CFASCode, zip, state) == false) {
		/* var DCkey = step.getHome(com.stibo.core.domain.datacontainerkey.keyhome.DataContainerKeyHome).getDataContainerKeyBuilder("Region")
		    .withAttributeValue("CFAS_CO_Code", CFASCode)
		    .withAttributeValue("ZIP", zip)
		    .withAttributeValue("STATE", state)
		    .build(); */
		var regionDCobj = node.getDataContainerByTypeID("Region").addDataContainer().createDataContainerObject(null);
		if (CFASCode) {
			regionDCobj.getValue("CFAS_CO_Code").setSimpleValue(CFASCode);
		}
		if (zip) {
			regionDCobj.getValue("ZIP").setSimpleValue(zip);
		}
		if (state) {
			regionDCobj.getValue("STATE").setSimpleValue(state);
		}
		if (zipAction) {
			regionDCobj.getValue("ZIP_Action").setSimpleValue(zipAction);
		}
		if (regionalStatus) {
			regionDCobj.getValue("Regional_Status").setSimpleValue(regionalStatus);
		}
		if (region) {
			regionDCobj.getValue("BPA_Region_Distribution_Center").setLOVValueByID(region);
		}
	}
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.zoomDataPopulate = zoomDataPopulate
exports.WRLNZoomData = WRLNZoomData
exports.ENTZoomData = ENTZoomData
exports.getAllFromApprovedWS = getAllFromApprovedWS
exports.populateApprovedWSData = populateApprovedWSData
exports.resetDataContainer = resetDataContainer
exports.getRegionsList = getRegionsList
exports.createZoom = createZoom
exports.createZoomNonMMC = createZoomNonMMC
exports.createZoomMMC = createZoomMMC
exports.createZoomPlugin = createZoomPlugin
exports.getRegionsID = getRegionsID
exports.addRegionDC = addRegionDC
exports.checkExistingDC = checkExistingDC
exports.addRegionDCforENT = addRegionDCforENT
exports.checkDupCFASCompCode = checkDupCFASCompCode
exports.checkZBDup = checkZBDup
exports.addRegionDCNewCI = addRegionDCNewCI