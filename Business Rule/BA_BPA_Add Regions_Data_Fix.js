/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_Add Regions_Data_Fix",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Data_Fix_Actions" ],
  "name" : "BPA Add Regions Data Fix",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "bpaLib"
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
    "contract" : "LookupTableHomeBindContract",
    "alias" : "BPAZoomDataLookUP",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,BPAZoomDataLookUP,step,bpaLib) {
/*   
 *    @Author - Madhuri[CTS]
 *   Purpose - Populate the "Region(s) for Zoom Form - ADD ONLY" attribute value based on existing Zoom Data Containers data and partial approve 
 */

    var children = node.getChildren();
    if(children.size()>0){
	    children.forEach(function (CI) {    
		    var regionDCList = new java.util.ArrayList();
		    var existingRegList = new java.util.ArrayList();    
		    regionDCList = getRegionList(CI,regionDCList);//Get the list of Regions from Data Container on the Contract Item
		    existingRegList = getExistingRegList(CI,existingRegList);//Get the list of existing values from "Existing Regions" attribute 
		    setCIRegions(CI,regionDCList,existingRegList) //Update the "Existing Regions" attribute value
	    });
    }
    
function  getRegionList(node,regionDCList){
    var regionDC = node.getDataContainerByTypeID("Region").getDataContainers().toArray();        
    if (regionDC.length != 0) {
        regionDC.forEach(function(dc) {
            var regionDCObj = dc.getDataContainerObject();
            var regionDCObjID = regionDCObj + "";
            regionDCObjID = regionDCObjID.split(":");
            regionDCObjID = regionDCObjID[1];
            var cfas = regionDCObj.getValue("CFAS_CO_Code").getID();
            var state = regionDCObj.getValue("STATE").getID();
            if (regionDCObj.getValue("Regional_Status").getID() == "ACTIVE") {
                if (state)
	            regionDCList.add(cfas + ";" + state);
	          else
	            regionDCList.add(cfas);
            }
        });
    }    
    return regionDCList;
}
    
function getExistingRegList(node,existingRegList){
       CItemExistingReg = node.getValue("CI_Existing_Regions").getValues();
	  for (var i = 0; i < CItemExistingReg.size(); i++) {
	    existingRegList.add(CItemExistingReg.get(i).getID());
	  }
	  return existingRegList;
}

function setCIRegions(node,regionDCList,existingRegList){
     if(regionDCList.size()>0){
	     for(var j=0;j<regionDCList.size();j++){	     	
		     var bpaLookUpResult = BPAZoomDataLookUP.getLookupTableValue("LT_BPA_Wireline_Regions_Data", regionDCList.get(j));
		     if (bpaLookUpResult != null && !existingRegList.contains(bpaLookUpResult)) {				     	
		     	  existingRegList.add(bpaLookUpResult)	     			     	
		     	  node.getValue("CI_Existing_Regions").append().addLOVValueByID(bpaLookUpResult).apply();
		     }
	     }
     }
     IDArray_CI = ['CI_Existing_Regions']; 
	 bpaLib.partialApproveFields(node, IDArray_CI);	     
}
}