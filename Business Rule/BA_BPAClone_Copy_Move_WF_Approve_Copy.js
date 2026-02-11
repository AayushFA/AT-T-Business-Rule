/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPAClone_Copy_Move_WF_Approve_Copy",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_CT_BusinessAction" ],
  "name" : "Copy Approve",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "bpaLib"
  }, {
    "libraryId" : "AT&T_BPA_Clone_Library",
    "libraryAlias" : "clnLib"
  }, {
    "libraryId" : "ATT_BPA_Zoom_Library",
    "libraryAlias" : "bpaZoomLib"
  }, {
    "libraryId" : "ATT_BPA_ASL_Library",
    "libraryAlias" : "aslLib"
  }, {
    "libraryId" : "ATT_BPA_SingleSS_Library",
    "libraryAlias" : "sslib"
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
    "alias" : "manager",
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
    "contract" : "LookupTableHomeBindContract",
    "alias" : "BPAZoomDataLookUP",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,manager,webui,BPAZoomDataLookUP,bpaLib,clnLib,bpaZoomLib,aslLib,sslib) {
/**
 Action :Copy 
check condition:copy - if error show error or else execute
--check the "region to move" for ci ---create the new ci for the region split
--do not copy the region dc + misc charge
--populate the zoom
--bring the target bpa in publish with new ci and
--navigate to publish state -tasklist
//author @aw240u@att.com(Aayush Kumar Mahato)
//Aprrove and submit Routing happening using this Business rule
*/
var workFlowInstance = node.getWorkflowInstanceByID("BPA_Clone");
var stateID = "Copy_Enrichment";
if (workFlowInstance)
  var task = workFlowInstance.getTaskByID(stateID);
if (task != null) {
  var event = task.triggerByID("CopySubmit", "approving");
  var message = event.getScriptMessage();
  //doing the validation before executing
  if (message == null) {
    var bpaRef = getBPARef(node);
    if (bpaRef != null) {
      bpaRef.getValue("BPA_Clone_WF_UserAction").setLOVValueByID("Copy");
      bpaRef.getValue("BPA_Cloned_From").setSimpleValue(node.getID());
      var enterRegionList = [];
      var bpaChildren = node.getChildren().toArray();
      bpaChildren.forEach(function(item) {
        var regiontoMove = item.getValue("CI_Region_Distribution_Center_temp").getSimpleValue();
        if (regiontoMove) {
          //set partial clone flag
          item.getValue("Partial_Clone_Flag").setSimpleValue("Yes");
          enterRegionList.push(item);
        }
      })
      enterRegionList.forEach(function(i) {
        //Verify if the Item Ref on 'i' is already existing on Target BPA's CI list, 
        //If existing..call zoomDataPopulate only on the identified CI
        //else clone the CI & populate zoomData
        var newCI = clnLib.cloneSrcContractItem(i, bpaRef, manager); //Create new CI & copy Attributes, misc Charge DC
        newCI.getValue("Consign_Org_Code").setSimpleValue("");
        newCI.getValue("CI_Region_Distribution_Center").setSimpleValue("");
        //COPY THE CILE 
        var cileNodes = i.getChildren().toArray();
        cileNodes.forEach(function(cile) {
          if (cile.getValue("LE_Status").getID() == "ACTIVE") {
            clnLib.cloneSrcContractLEChild(cile, newCI, manager)
          }
        })
        //After Cloning the Source & before calling Zoom Populate, Copy new Temp_Region DC value from Source CI to cloned CI CI_Region_Dist Attribute
        var regionDistCent = i.getValue("CI_Region_Distribution_Center_temp").getSimpleValue();
        regionDistCent = regionDistCent.split("<multisep/>");
        regionDistCent.forEach(function(i) {
          newCI.getValue("CI_Region_Distribution_Center").addValue(i);
        })
        //populate using the zoom data populate from ss lbrary
        var ciToItem = manager.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
        var itemRef = newCI.getReferences(ciToItem).toArray();
        if (itemRef.length > 0) {
          var refItem = itemRef[0].getTarget();
        }
        //Update the ConsignOrg List data on bothe Source & Target CIs
        updateConsignOrgData(bpaRef, node, refItem.getID());
        var parent = bpaRef
        bpaZoomLib.zoomDataPopulate(newCI, refItem, BPAZoomDataLookUP, manager, parent);
      })
    }
    //navigation logic
    bpaRef.startWorkflowByID("BPA_Clone", "Start Workflow");
    var workFlowInstance = bpaRef.getWorkflowInstanceByID("BPA_Clone");
    var stateID = "Start";
    var task = workFlowInstance.getTaskByID(stateID);
    if (task != null) {
      task.triggerByID("TarBpaRef", "Direct Routing to Publish State");
    }
    var Workflow = manager.getWorkflowHome().getWorkflowByID("BPA_Clone")
    var state = Workflow.getStateByID("Publish_to_EBS");
    //navigating to the publish state
    webui.navigate("BPA_Clone_WF_EBSResponse_TaskList", null, state);
  } else {
    webui.showAlert("ERROR", message);
  }
}

function getBPARef(node) {
  var bpaRef = ""
  var bpaTobpa = manager.getReferenceTypeHome().getReferenceTypeByID("BPACopyTrans_ContractToContract");
  var bpaOwn = node.getReferences(bpaTobpa).toArray();
  if (bpaOwn.length > 0) {
    bpaRef = bpaOwn[0].getTarget();
  }
  return bpaRef
}

function updateConsignOrgData(bpaRef, node, refItem) {
  //Get the list of Regions to Move 
  var bpaRefChild = bpaRef.getChildren().toArray();
  bpaRefChild.forEach(function(targetCI) {
    var targetOIN = targetCI.getValue("Oracle_Item_Num").getValue();
    var regiontoMove = targetCI.getValue("CI_Region_Distribution_Center_temp").getValues();
    if (regiontoMove.size() > 0) {
      var regionList = new java.util.ArrayList();
      for (var j = 0; j < regiontoMove.size(); j++) {
        regionList.add(regiontoMove.get(j).getID())
      }
       //Get the List of Consigned Child orgs on the refItem
      var consignChildItems = aslLib.returnConsignChildItems(refItem, manager);
      if (consignChildItems) {
        consignChildOrgCodes = aslLib.returnConsignOrgCodes(consignChildItems, manager);
      }
      if (regionList.size() > 0) {
        var bpaChildren = node.getChildren().toArray();
        bpaChildren.forEach(function(sourceCI) {
          var sourceOIN = sourceCI.getValue("Oracle_Item_Num").getValue();
         if (sourceOIN == targetOIN) {
            var consignOrgs = sourceCI.getValue("Consign_Org_Code").getValues();
            if (consignOrgs) {
              var consignOrgsList = new java.util.ArrayList();
              for (var i = 0; i < consignOrgs.size(); i++) {
                consignOrgsList.add(consignOrgs.get(i).getValue())
              }
            }
            log.info("consignOrgsList: " + consignOrgsList)
            log.info("consignChildOrgCodes: "+consignChildOrgCodes)
            sourceCI.getValue("Consign_Org_Code").setSimpleValue("");         
            for (var k = 0; k < consignChildOrgCodes.size(); k++) {
             // if (consignChildOrgCodes.contains(consignChildOrgCodes.get(k).getValue())) {
                if (regionList.contains(consignChildOrgCodes.get(k)))
                  targetCI.getValue("Consign_Org_Code").append().addValue(consignChildOrgCodes.get(k)).apply();
                else{
                if(consignOrgsList.contains(consignChildOrgCodes.get(k)))
                  sourceCI.getValue("Consign_Org_Code").append().addValue(consignChildOrgCodes.get(k)).apply();
                }
            }
          }          
        });
      }
    }   
  });
}
}