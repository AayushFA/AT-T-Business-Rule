/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Item_Transportation_Derivation",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Derivation_Libraries" ],
  "name" : "Item Transportation Derivation Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonDerivationLib"
  }, {
    "libraryId" : "AT&T_Global_Library",
    "libraryAlias" : "libGlobal"
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
//1. Set_Carton_Weight
//([Item].[Transportation Package Attributes].[UnitWeight] * [Item].[Transportation HU Attributes].[EachQtyPerCase]) + [Item].[Transportation HU Attributes].[CaseTareWeight]
function setCartonWeight(node) {
    var pItemChildren = node.getChildren();
    var pkgOrderingUOM;
    var huOrderingUOM;   
    pItemChildren.forEach(function(pItemChildHU) {
        if (pItemChildHU.getObjectType().getID() == "Transportation_Handling_Unit") {
            huOrderingUOM = pItemChildHU.getValue("TMS_Ordering_UOM").getSimpleValue();
            pItemChildren.forEach(function(pItemChildPKG) {
                if (pItemChildPKG.getObjectType().getID() == "Transportation_Package") {
                    pkgOrderingUOM = pItemChildPKG.getValue("TMS_Ordering_UOM").getSimpleValue();
                    log.info("huOrderingUOM :" + huOrderingUOM + " pkgOrderingUOM :" + pkgOrderingUOM);
                    if (pkgOrderingUOM == huOrderingUOM) {
                        var unitWeight = pItemChildPKG.getValue("TMS_Unit_Weight") ? pItemChildPKG.getValue("TMS_Unit_Weight").getSimpleValue() : 0;
                        var qtyPerCase = pItemChildHU.getValue("TMS_Each_Qty_Per_Case") ? pItemChildHU.getValue("TMS_Each_Qty_Per_Case").getSimpleValue() : 0;
                        var tareWeight = pItemChildHU.getValue("TMS_Case_Tare_Weight") ? pItemChildHU.getValue("TMS_Case_Tare_Weight").getSimpleValue() : 0;
                        var cartonWeight = null;
                        log.info("(unitWeight :" + unitWeight + " qtyPerCase :" + qtyPerCase + " tareWeight :" + tareWeight);
                        //Calculate Carton-Weight
                        //if (unitWeight && qtyPerCase && tareWeight) {
                        if (unitWeight && qtyPerCase) {
                        	 cartonWeight = (parseFloat(unitWeight) * parseFloat(qtyPerCase));
                        	}
                        if (tareWeight){
                            cartonWeight = cartonWeight + parseFloat(tareWeight);
                        }
                        log.info("cartonWeight :" + cartonWeight);
                        pItemChildHU.getValue("TMS_Carton_Weight").setSimpleValue(cartonWeight);
                    }
                }
            });
        }
    });    
}

//2. Set_Inner_Pack_Each
// [Item].[Transportation HU Attributes].[EachQtyPerCase] / [Item].[Transportation HU Attributes].[NumofInnerCartons]
function setInnerPackEach(node) {
    var pItemChildren = node.getChildren();    
    pItemChildren.forEach(function(pItemChild) {
        if (pItemChild.getObjectType().getID() == "Transportation_Handling_Unit") {
            var eachQtyPerCase = pItemChild.getValue("TMS_Each_Qty_Per_Case").getSimpleValue();
            var numOfInnerCartons = pItemChild.getValue("TMS_Num_of_Inner_Cartons").getSimpleValue();
            if (eachQtyPerCase && numOfInnerCartons) {
                var innerPackEach;
                var parsedEachQtyPerCase = parseFloat(eachQtyPerCase);
                var parsedNumOfInnerCartons = parseFloat(numOfInnerCartons);
                if (isNaN(parsedEachQtyPerCase) || isNaN(parsedNumOfInnerCartons) || parsedNumOfInnerCartons == 0) {                   
                    innerPackEach = 0;
                } else {
                    innerPackEach = parseFloat(parsedEachQtyPerCase / parsedNumOfInnerCartons);                    
                }
                pItemChild.getValue("TMS_Inner_Pack_Each").setSimpleValue(innerPackEach);
            }
        }
    });  
}

//3. Set_Inner_Pack_Weight
function setInnerPackWeight(node) {
    var pItemChildren = node.getChildren();    

    pItemChildren.forEach(function(pItemChildPKG) {
        if (pItemChildPKG.getObjectType().getID() == "Transportation_Package") {
            var pkgOrderingUOM = pItemChildPKG.getValue("TMS_Ordering_UOM") ? pItemChildPKG.getValue("TMS_Ordering_UOM").getSimpleValue() : "";
            var unitWeight = pItemChildPKG.getValue("TMS_Unit_Weight") ? pItemChildPKG.getValue("TMS_Unit_Weight").getSimpleValue() : "";

            pItemChildren.forEach(function(pItemChildHu) {
                if (pItemChildHu.getObjectType().getID() == "Transportation_Handling_Unit") {
                    var innerPackEach = pItemChildHu.getValue("TMS_Inner_Pack_Each") ? pItemChildHu.getValue("TMS_Inner_Pack_Each").getSimpleValue() : "";
                    var huOrderingUOM = pItemChildHu.getValue("TMS_Ordering_UOM") ? pItemChildHu.getValue("TMS_Ordering_UOM").getSimpleValue() : "";

                    if (pkgOrderingUOM == huOrderingUOM) {
                        if (innerPackEach && unitWeight) {
                            var innerPackWeight = parseFloat(innerPackEach) * parseFloat(unitWeight);                           
                            pItemChildHu.getValue("TMS_Inner_Pack_Weight").setSimpleValue(innerPackWeight);
                        }
                    }
                }
            });
        }
    });
    
}

//4. Set_Eaches_Per_Pallet
//[Item].[Transportation HU Attributes].[EachQtyPerCase] * [Item].[Transportation HU Attributes].[CasesPerLayer] * [Item].[Transportation HU Attributes].[NumberOfLayersOnPallet]
//eachQtyperPallet 
function setEachesPerPallet(node) {
    var pItemChildren = node.getChildren();   
    pItemChildren.forEach(function(pItemChild) {
        log.info("Object Type:" + pItemChild.getObjectType().getID());
        if (pItemChild.getObjectType().getID() == "Transportation_Handling_Unit") {
            var eachQtyPerCase = pItemChild.getValue("TMS_Each_Qty_Per_Case") ? pItemChild.getValue("TMS_Each_Qty_Per_Case").getSimpleValue() : "";
            var casesPerLayer = pItemChild.getValue("TMS_Cases_Per_Layer") ? pItemChild.getValue("TMS_Cases_Per_Layer").getSimpleValue() : "";
            var numberOfLayersOnPallet = pItemChild.getValue("TMS_Number_Of_Layers_On_Pallet") ? pItemChild.getValue("TMS_Number_Of_Layers_On_Pallet").getSimpleValue() : "";
            if (eachQtyPerCase && casesPerLayer && numberOfLayersOnPallet) {
                var eachQtyPerPallet = parseFloat(eachQtyPerCase) * parseFloat(casesPerLayer) * parseFloat(numberOfLayersOnPallet);               
                pItemChild.getValue("TMS_Each_Qty_Per_Pallet").setSimpleValue(eachQtyPerPallet);
            }
        }
    });   
}

//5. Set_Each_Qty_Per_TL
//	[Item].[Transportation HU Attributes].[EachQtyPerPallet] * [Item].[Transportation HU Attributes].[PalletsPerTL]		
//	= [Transportation HU Attributes].[EachQtyPerTL]
function setEachQtyPerTL(node) {
    var pItemChildren = node.getChildren();   
    pItemChildren.forEach(function(pItemChild) {
        if (pItemChild.getObjectType().getID() == "Transportation_Handling_Unit") {
            var eachQtyPerPallet = pItemChild.getValue("TMS_Each_Qty_Per_Pallet") ? pItemChild.getValue("TMS_Each_Qty_Per_Pallet").getSimpleValue() : "";
            var palletsPerTL = pItemChild.getValue("TMS_Pallets_Per_TL") ? pItemChild.getValue("TMS_Pallets_Per_TL").getSimpleValue() : "";
            if (eachQtyPerPallet && palletsPerTL) {
                var eachQtyPerTL = parseFloat(eachQtyPerPallet) * parseFloat(palletsPerTL);               
                pItemChild.getValue("TMS_Each_Qty_Per_TL").setSimpleValue(eachQtyPerTL);
            }
        }
    });   
}


//6. Set_Pallet_Length  : [Item].[Transportation HU Attributes].[PalletLength]  = cust_pdh_common_util.FUNC_EXECUTE_STMT("SELECT ATTRIBUTE1", " FROM FUSION.FND_FLEX_VALUE_SETS F, FUSION.FND_FLEX_VALUES V", " WHERE F.FLEX_VALUE_SET_NAME = 'CUST_PDH_OTM_THU' AND F.FLEX_VALUE_SET_ID = V.FLEX_VALUE_SET_ID AND V.FLEX_VALUE = '" + [Item].[Transportation HU Attributes].[HandlingUnitID] + "'")
//7. Set_Pallet_Width   : [Item].[Transportation HU Attributes].[PalletWidth]  = cust_pdh_common_util.FUNC_EXECUTE_STMT("SELECT ATTRIBUTE2", " FROM FUSION.FND_FLEX_VALUE_SETS F, FUSION.FND_FLEX_VALUES V", " WHERE F.FLEX_VALUE_SET_NAME = 'CUST_PDH_OTM_THU' AND F.FLEX_VALUE_SET_ID = V.FLEX_VALUE_SET_ID AND V.FLEX_VALUE = '" + [Item].[Transportation HU Attributes].[HandlingUnitID] + "'")
//8. Set_Pallet_Height	: [Item].[Transportation HU Attributes].[PalletHeight]	= cust_pdh_common_util.FUNC_EXECUTE_STMT("SELECT ATTRIBUTE3", " FROM FUSION.FND_FLEX_VALUE_SETS F, FUSION.FND_FLEX_VALUES V", " WHERE F.FLEX_VALUE_SET_NAME = 'CUST_PDH_OTM_THU' AND F.FLEX_VALUE_SET_ID = V.FLEX_VALUE_SET_ID AND V.FLEX_VALUE = '" + [Item].[Transportation HU Attributes].[HandlingUnitID] + "'")
function setPalletDimension(node, lookUpTable) {
    var pItemChildren = node.getChildren();   
    var itemClassLookupResult;
    var tmsHandlingUnitId;
    pItemChildren.forEach(function(pItemChild) {
        if (pItemChild.getObjectType().getID() == "Transportation_Handling_Unit") {
            tmsHandlingUnitId = pItemChild.getValue("TMS_Handling_Unit_ID").getSimpleValue();
            itemClassLookupResult = lookUpTable.getLookupTableValue("LT_HUID_Attributes", tmsHandlingUnitId); //.toString()
            itemClassLookupResult = String(itemClassLookupResult);
            var dimensions = itemClassLookupResult.split('|');
            if (dimensions.length >= 3) {
                var palletLength = dimensions[0].trim();
                var palletWidth = dimensions[1].trim();
                var palletHeight = dimensions[2].trim();
                pItemChild.getValue("TMS_Pallet_Length").setSimpleValue(palletLength);
                pItemChild.getValue("TMS_Pallet_Width").setSimpleValue(palletWidth);
                pItemChild.getValue("TMS_Pallet_Height").setSimpleValue(palletHeight);
            } 
        };

    });    
}

//9. Set_Each_Qty_Per_Container
//Set_Each_Qty_Per_Container
//[Item].[Transportation HU Attributes].[EachQtyPerPallet] * [Item].[Transportation HU Attributes].[PalletsPerContainer]
//EachQtyPerContainer
function setEachQtyPerContainer(node) {
    var pItemChildren = node.getChildren();    
    pItemChildren.forEach(function(pItemChild) {        
        if (pItemChild.getObjectType().getID() == "Transportation_Handling_Unit") {
            var eachQtyPerPallet = pItemChild.getValue("TMS_Each_Qty_Per_Pallet") ? pItemChild.getValue("TMS_Each_Qty_Per_Pallet").getSimpleValue() : null;
            var palletsPerContainer = pItemChild.getValue("TMS_Pallets_Per_Container") ? pItemChild.getValue("TMS_Pallets_Per_Container").getSimpleValue() : null;
            if (eachQtyPerPallet != null && palletsPerContainer != null) {
                var eachQtyPerContainer = parseFloat(eachQtyPerPallet) * parseFloat(palletsPerContainer);                
                pItemChild.getValue("TMS_Each_Qty_Per_Container").setSimpleValue(eachQtyPerContainer);
            }
        }
    });   
}

/*
10. Set_Eaches_Per_Layer
	[Item].[Transportation HU Attributes].[HandlingUnitType] == "REEL" and !isNull([Item].[Transportation HU Attributes].[MaxLengthOnReelFT])
	= [Item].[Transportation HU Attributes].[MaxLengthOnReelFT]
		ELSE 
	[Item].[Transportation HU Attributes].[HandlingUnitType] != "REEL" and !isNull([Item].[Transportation HU Attributes].[EachQtyPerCase]) and !isNull([Item].[Transportation HU Attributes].[CasesPerLayer])
	= [Item].[Transportation HU Attributes].[EachQtyPerCase] * [Item].[Transportation HU Attributes].[CasesPerLayer]
	EachesPerLayer
*/
function setEachesPerLayer(node) {
    var pItemChildren = node.getChildren();    
    pItemChildren.forEach(function(pItemChild) {
        if (pItemChild.getObjectType().getID() == "Transportation_Handling_Unit") {
            var handlingUnitType = pItemChild.getValue("TMS_Handling_Unit_Type").getSimpleValue() ? pItemChild.getValue("TMS_Handling_Unit_Type").getSimpleValue() : null;
            var MaxLengthOnReelFT = pItemChild.getValue("TMS_MaxLength_On_ReelFT") ? pItemChild.getValue("TMS_MaxLength_On_ReelFT").getSimpleValue() : null;
            if (handlingUnitType && handlingUnitType == "REEL" && MaxLengthOnReelFT) {
                pItemChild.getValue("TMS_Eaches_Per_Layer").setSimpleValue(MaxLengthOnReelFT);
            } else {
                var eachQtyPerCase = pItemChild.getValue("TMS_Each_Qty_Per_Case") ? pItemChild.getValue("TMS_Each_Qty_Per_Case").getSimpleValue() : null;
                var casesPerLayer = pItemChild.getValue("TMS_Cases_Per_Layer") ? pItemChild.getValue("TMS_Cases_Per_Layer").getSimpleValue() : null;
                if (handlingUnitType && handlingUnitType != "REEL" && eachQtyPerCase && casesPerLayer) {
                    var eachesPerLayer = parseFloat(eachQtyPerCase) * parseFloat(casesPerLayer);                   
                    pItemChild.getValue("TMS_Eaches_Per_Layer").setSimpleValue(eachesPerLayer);
                }
            }
        }
    });    
}


/* 
function : setTMSItemType
Rule : TMS_Item_Type = [Item].[Device Core Attributes].[ProductClass]
*/
function setTMSItemType(node) {    
    var lob = node.getValue("Line_Of_Business").getID();
    if (lob == "RTL") {    
    		var tmsItemtype = node.getValue("Product_Class") ? node.getValue("Product_Class").getID() : null;
    		if (tmsItemtype) {       
        		node.getValue("TMS_Item_Type").setLOVValueByID(tmsItemtype);
    		}    
    }
}

/*
function : setTMSProductType
Rule : TMS Product Type(TMS_Product_Type) = [Item].[Device Core Attributes].[ProductType]
*/
function setTMSProductType(node) {   
    var lob = node.getValue("Line_Of_Business").getID();
    if (lob == "RTL") {       
    		var tmsProducttype = node.getValue("Product_Type") ? node.getValue("Product_Type").getSimpleValue() : null;
    		if (tmsProducttype) {       
        		node.getValue("TMS_Product_Type").setLOVValueByID(tmsProducttype);
    		}
    }
}

/*
function : setSerializedProduct
Rule : Serialized Product(TMS_Serialized_Product) = IF  [Item].[Inventory].[Serial Number Control] != 1 then Y, else N
*/
function setSerializedProduct(node) {
    var lob = node.getValue("Line_Of_Business").getID();
    if (lob == "RTL") {
    		var serialControlCode = node.getValue("Serial_Generation") ? node.getValue("Serial_Generation").getID() : null;   
    		var serializedProduct;
	     if (serialControlCode) {
	        if (serialControlCode != "1") {            
	            serializedProduct = "Y";
	        } else {            
	            serializedProduct = "N";
	        }
	        node.getValue("TMS_Serialized_Product").setLOVValueByID(serializedProduct);
	    }
    }   
}

/*
function : setUnitWeight
Rule :  Unit Weight(TMS_Unit_Weight)  - IF [Item].[Main].[User Item Type] != "Collateral Items" or [Item].[Main].[User Item Type] != "DF-CO"  
										then 0.1
										If [Item].[Main].[User Item Type] == "Collateral Items" or [Item].[Main].[User Item Type] == "DF-CO" 
										then 0.01
*/
function setUnitWeight(node) {
  
    var userItemType = node.getValue("User_Item_Type") ? node.getValue("User_Item_Type").getSimpleValue() : null;   
    var tmsUnitWeight;
    if (userItemType && (userItemType == "Collateral Items" || userItemType == "DF-CO")) {      
        tmsUnitWeight = "0.01";
    } else {        
        tmsUnitWeight = "0.1";
    }    
    node.getValue("TMS_Unit_Weight").setSimpleValue(tmsUnitWeight);    
}

/*
	function recursiveApproval
	Description : Approve Objects recursively 
*/
function recursiveApproval(node) {
    //Approve parent/Comp Item Object
    var objectType = node.getObjectType().getID();
    node.approve();
    //Approve Child Transportation PKG and HU objects
    var children = node.getChildren().toArray(); //node.queryChildren(); 	
    children.forEach(function(child) {
        var approvalStatus = child.getApprovalStatus();
        var childObjectType = child.getObjectType().getID();        
        if (childObjectType == "Transportation_Package" || childObjectType == "Transportation_Handling_Unit") {
            child.approve();
        }
    });
}

/*
	function getApprovedObject
	Description : Get object from the approved workspace
*/
function getApprovedObject(node, stepManager) {   
    if (!node) return null;
    var approvedManager = stepManager.executeInWorkspace("Approved", function(step) {
        return step;
    });
    return approvedManager.getProductHome().getProductByID(node.getID()); //null - if new object and returns object. 
}

/*
	function workflowDismissAction
	Description : Transportation Workflow Dismiss Action
*/
function workflowDismissAction(node, stepManager) {
  
    var pItemChildren = node.getChildren().toArray();
    var cancelFolder = stepManager.getProductHome().getProductByID("CancelledProducts");
    libGlobal.rollBackandParitialApprove(node, stepManager, "Product"); //PItem     
    pItemChildren.forEach(function(pChild) {
        var objectType =pChild.getObjectType().getID(); 
        if (pChild.getObjectType().getID() == "Transportation_Package" || pChild.getObjectType().getID() == "Transportation_Handling_Unit") {
            log.info("Child Object Type :" + String(pChild.getObjectType().getID()));
            if (getApprovedObject(pChild, stepManager)) {
                //Object found in the Approved workspace - Rollback and restore Approved object               
                libGlobal.rollBackandParitialApprove(pChild, stepManager, "Product");
            } else {
                //Object not in the Approved Workspace - delete the node (it completely                
                pChild.setParent(cancelFolder);
                commonDerivationLib.deleteKey(pChild, stepManager, objectType);
                pChild.approve();
                //pChild.delete();
            }
        }
    });
}
/*===== business library exports - this part will not be imported to STEP =====*/
exports.setCartonWeight = setCartonWeight
exports.setInnerPackEach = setInnerPackEach
exports.setInnerPackWeight = setInnerPackWeight
exports.setEachesPerPallet = setEachesPerPallet
exports.setEachQtyPerTL = setEachQtyPerTL
exports.setPalletDimension = setPalletDimension
exports.setEachQtyPerContainer = setEachQtyPerContainer
exports.setEachesPerLayer = setEachesPerLayer
exports.setTMSItemType = setTMSItemType
exports.setTMSProductType = setTMSProductType
exports.setSerializedProduct = setSerializedProduct
exports.setUnitWeight = setUnitWeight
exports.recursiveApproval = recursiveApproval
exports.getApprovedObject = getApprovedObject
exports.workflowDismissAction = workflowDismissAction