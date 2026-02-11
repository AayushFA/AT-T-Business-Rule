/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BPA_Header_Validation_SubmitForReview",
  "type" : "BusinessCondition",
  "setupGroups" : [ "BPA_BC" ],
  "name" : "BPA Header Validation SubmitForReview(No use)",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item", "BPA" ],
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
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
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
    "contract" : "ReferenceTypeBindContract",
    "alias" : "BPASupRef",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentWorkflowBindContract",
    "alias" : "currentWF",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "QueryHomeBindContract",
    "alias" : "query",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "CI_ItemRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ContractItem_Item",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "CI_BOMParentRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "LEContractItem_BOM_Parent",
    "description" : null
  }, {
    "contract" : "ReferenceTypeBindContract",
    "alias" : "CILE_BOMChildRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "LEContractItem_BOM_Child",
    "description" : null
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "wcontext",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,BPASupRef,currentWF,query,CI_ItemRef,CI_BOMParentRef,CILE_BOMChildRef,wcontext,lib) {
/**
 * @author - Piyal [CTS]
 * BPA Contact Item Key Generation
 */

var objectType = node.getObjectType().getID();
var currentWFinstance = node.getWorkflowInstance(currentWF);
var bpaSupplierRef = null;
var Header_Buyer = null;
var payment_terms = null;
var FOB_ZIP = null;
var Freight_Terms = null;
var BPA_Legacy_Contract_No = null;
var Legacy_Source = null;
var BPA_Contract_Manager = null;
var Effect_Date = null;
var Expiration_Date = null;
var sb = new java.lang.StringBuffer();
var details = null;
var itemType = null;
var Price = null;
var Supplier_Item = null;
var STD_PACKAGING = null;
var min_order = null;
var max_order = null;
var Price_Break_Qty = null;
var lead_Time = null;
var zip = null;
var zip_action = null;
var cfas_cmp_code = null;
var scharge_code = null;
var scharge_amnt = null;
var Flat_Charge_Flag = null;
var childBOMRef=null;
var le_type = null;
var le_name=null;
var LE_Percentage=null;
var quantity= null;
if (objectType == 'BPA') {
	
    bpaSupplierRef = node.queryReferences(BPASupRef).asList(1);
    if (bpaSupplierRef.size() == 0) {
        sb.append("BPA header to Supplier reference is mandatory for .\n");
    }

    Header_Buyer = node.getValue("Header_Buyer").getSimpleValue();
    if (!Header_Buyer || Header_Buyer == "") {
        sb.append("Header Buyer is mandatory.\n");
    }
    payment_terms = node.getValue("Payment_Terms").getSimpleValue();
    if (!payment_terms || payment_terms == "") {
        sb.append("Payment terms is mandatory.\n");
    }
    FOB_ZIP = node.getValue("FOB_ZIP").getSimpleValue();
    if (!FOB_ZIP || FOB_ZIP == "") {
        sb.append("FOB ZIP is mandatory.\n");
    }

    Freight_Terms = node.getValue("Freight_Terms").getSimpleValue();
    if (!Freight_Terms || Freight_Terms == "") {
        sb.append("Freight Terms is mandatory.\n");
    }
    BPA_Legacy_Contract_No = node.getValue("Legacy_Cont_Num").getSimpleValue();
    if (!BPA_Legacy_Contract_No || BPA_Legacy_Contract_No == "") {
        sb.append(" Contract No. is mandatory.\n");
    }
    Legacy_Source = node.getValue("Legacy_Source").getSimpleValue();
    if (!Legacy_Source || Legacy_Source == "") {
        sb.append("Business Source is mandatory.\n");
    }

    BPA_Contract_Manager = node.getValue("BPA_Contract_Manager").getSimpleValue();
    if (!BPA_Contract_Manager || BPA_Contract_Manager == "") {
        sb.append("Contract Manager is mandatory.\n");
    }
    Effect_Date = node.getValue("Effect_Date").getSimpleValue();
    if (!Effect_Date || Effect_Date == "") {
        sb.append("Effective Date is mandatory.\n");
    }
    Expiration_Date = node.getValue("Expiration_Date").getSimpleValue();
    if (!Expiration_Date || Expiration_Date == "") {
        sb.append("Expiration Date is mandatory.\n");
    } else if (Expiration_Date) {
        if (lib.checkDateIfLessthanToday(Expiration_Date)) {
            sb.append("Expiration Date should be greater that Today.\n");
        }
    }
    if (Expiration_Date && Effect_Date) {
        if (Expiration_Date < Effect_Date) {
            sb.append("Expiration Date should be in future than Effective Date.\n");
        }
    }
}

if (objectType == 'Contract_Item') {
    details = node.getValue("Detail").getID();
    if (!details || details == "") {
        sb.append("Details is mandatory.\n");
    } else if (details) {
        if (details == "LEXPLOSION") {
            sb.append("Details should be set to Price Break.\n");
        }
    }

    itemType = node.getValue("Item_Type").getSimpleValue();
    if (!itemType || itemType == "") {
        sb.append("Item Type is mandatory.\n");
    }

    Price = node.getValue("Price").getSimpleValue();
    if (!Price || Price == "") {
        sb.append("Price is mandatory.\n");
    }

    Supplier_Item = node.getValue("Supplier_Item").getSimpleValue();
    if (!Supplier_Item || Supplier_Item == "") {
        sb.append("Supplier Item is mandatory.\n");
    }

    STD_PACKAGING = node.getValue("STD_PACKAGING").getSimpleValue();
    if (!STD_PACKAGING || STD_PACKAGING == "") {
        sb.append("STD PACKAGING is mandatory.\n");
    }
    min_order = node.getValue("Min_Order_Qty").getSimpleValue();
    if (!min_order || min_order == "") {
        sb.append("Minimum Order Qty is mandatory.\n");
    }
    max_order = node.getValue("Max_Order_Qty").getSimpleValue();
    if (!max_order || max_order == "") {
        sb.append("Maximum Order Qty is mandatory.\n");
    }
    Price_Break_Qty = node.getValue("Price_Break_Qty").getSimpleValue();
    if (!Price_Break_Qty || Price_Break_Qty == "") {
        sb.append("Price Break Qty is mandatory.\n");
    }
    lead_Time = node.getValue("Lead_Time").getSimpleValue();

    if (details && details == "PBREAK") {
        if (!lead_Time || lead_Time == "") {
            sb.append("Lead Time is mandatory when Details is set as Price Break for contract item.\n");
        }
    }

    Legacy_Source = node.getParent().getValue("Legacy_Source").getID();
    zip = getDCAttribute("ZIP", "Region", node);
    if (Legacy_Source && (Legacy_Source == "WRLN" || Legacy_Source == "WRLN_NON")) {

        if (!zip || zip == "") {
            sb.append("ZIP is mandatory when Business source is selected as Wireline(WRLN) or or Wireline-Non(WRLN_NON).\n");
        }
    }
    zip_action = getDCAttribute("ZIP_Action", "Region", node);
    if (zip) {
        if (!zip_action || zip_action == "") {
            sb.append("ZIP Action is mandatory when value of ZIP is present.\n");
        }
    }
    cfas_cmp_code = getDCAttribute("CFAS_CO_Code", "Region", node);
    Legacy_Source = node.getParent().getValue("Legacy_Source").getID();
    if (Legacy_Source && (Legacy_Source == "WRLN" || Legacy_Source == "WRLN_NON")) {

        if (!cfas_cmp_code || cfas_cmp_code == "") {
            sb.append("CFAS company code is mandatory when Business source is selected as Wireline(WRLN) or Wireline-Non(WRLN_NON).\n");
        }
    }

    scharge_code = getDCAttribute("Service_Charge_Code", "DC_MiscCharges", node);
    if (Legacy_Source && (Legacy_Source == "WRLN" || Legacy_Source == "WRLN_NON")) {

        if (!scharge_code || scharge_code == "") {
            sb.append("Service Charge code is mandatory when Business source is selected as Wireline(WRLN) or Wireline-Non(WRLN_NON).\n");
        }
    }
    scharge_amnt = getDCAttribute("Service_Amount", "DC_MiscCharges", node);
    if (scharge_code) {

        if (!scharge_amnt || scharge_amnt == "") {
            sb.append("Service amount code is mandatory when Service Charge Code is provided.\n");
        }
    }
    Flat_Charge_Flag = getDCAttribute("Flat_Charge_Flag", "DC_MiscCharges", node);
    if (scharge_code) {

        if (!Flat_Charge_Flag || Flat_Charge_Flag == "") {
            sb.append("Flat Charge Flag is mandatory when Service Charge Code is provided.\n");
        }
    }
}
if (objectType == 'LE_Contract_Item_Child') {
	
    details = node.getValue("Detail").getID();
    if (details && details != "LEXPLOSION") {
        sb.append("Details should be LEXPLOSION for Local Explosion Child .\n");
    } else if (!details) {
        sb.append("Detail is mandatory for Local Explosion Child.\n");
    }
    le_type=node.getValue("LE_TYPE").getID();
    if(!le_type)   {
    	 sb.append("Local Explosion type is mandatory for Local Explosion Child.\n");
    }
    LE_Percentage=node.getValue("LE_Percentage").getSimpleValue();
    if(!LE_Percentage)    {
    	 sb.append("Local Explosion percentage is mandatory for Local Explosion Child.\n");
    }
}

if (sb.length() > 0) {     
    return sb.toString();
}
return true;

function getDCAttribute(attrName, DCid, node) {
    var existingDCs = node.getDataContainerByTypeID(DCid).getDataContainers();
    var existingDCsItr = existingDCs.iterator();
    var curDC = null;
    var isLOV = false;
    if (existingDCsItr.hasNext()) {
        isLOV = step.getAttributeHome().getAttributeByID(attrName).hasLOV();
        curDC = existingDCsItr.next().getDataContainerObject();
        if (curDC.getValue(attrName)) {         
            if (isLOV) {
                return curDC.getValue(attrName).getID();
            } else {
                return curDC.getValue(attrName).getSimpleValue();
            }
        } else {
            return null;
        }
    }
}

}