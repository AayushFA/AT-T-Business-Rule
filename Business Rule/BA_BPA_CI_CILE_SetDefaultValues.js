/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_CI_CILE_SetDefaultValues",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "BPA Set Default Values",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item", "BPA" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "BPALib"
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
    "alias" : "step",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,BPALib) {
log.info("Inside BPA Set Default Values");
var Legacy_Source = null;
var header_status = null;
var header_Buyer = null;
var parent = null;
var details = null;
var cile_status = null;
var objectType = node.getObjectType().getID();
var parent = null;
var ci_status = null;
var Price_Break_Qty = null;
var tempLegacySource_wrln = null;
var tempLegacySource_rtl = null;
var tempLegacySource_ent = null;
var maxOrderQty = null;
var minOrderQty = null;
var leadTime= null;
var nonProcessflag = null;
var priceBreakPrice = null;
var standPack = null;
var BPAno=null;

if (objectType == 'BPA') {

    //code for copy the value from TEMP legacy sourceto actual Legacy source
    tempLegacySource_wrln = node.getValue("Legacy_Source_WRLN_Temp").getID();
    tempLegacySource_rtl = node.getValue("Legacy_Source_RTL_Temp").getID();
    tempLegacySource_ent = node.getValue("Legacy_Source_ENT_Temp").getID();
    if (tempLegacySource_wrln != null) {
        node.getValue("Legacy_Source").setLOVValueByID(tempLegacySource_wrln);
    } else if (tempLegacySource_rtl != null) {
        node.getValue("Legacy_Source").setLOVValueByID(tempLegacySource_rtl);
    } else if (tempLegacySource_ent != null) {
        node.getValue("Legacy_Source").setLOVValueByID(tempLegacySource_ent);
    }
    ////End

    Legacy_Source = node.getValue("Legacy_Source").getID();
    //log.info(Legacy_Source)
    if (Legacy_Source) {
        //log.info(Legacy_Source)
        header_Buyer = node.getValue("Header_Buyer").getSimpleValue();
        if (!header_Buyer || header_Buyer == "") {
            if (Legacy_Source != "RTL") {
                node.getValue("Header_Buyer").setLOVValueByID("Wirelinebuyer");


            }
        }
    }

    header_status = node.getValue("BPA_Status").getID();
    if (!header_status || header_status == "") {
        node.getValue("BPA_Status").setLOVValueByID("OPEN");
    }

    //setting the id as name
    if(node.getName() == null)
    node.setName(node.getID());


}
if (objectType == 'Contract_Item') {
    // the below code is added to set BPA no at CI obj to localize the value		
	 BPAno= node.getParent().getValue("Oracle_Contract_Num").getSimpleValue();
	 if(BPAno)
	 {	 
	   if(node.getValue("Oracle_Contract_Num").getSimpleValue()!=null && !node.getValue("Oracle_Contract_Num").isLocal())
	   {
	     node.getValue("Oracle_Contract_Num").setSimpleValue(BPAno);
	   }
	 }	 
	Legacy_Source = node.getParent().getValue("Legacy_Source").getID();
    Price_Break_Qty = node.getValue("Price_Break_Qty").getSimpleValue();
    if (!Price_Break_Qty || Price_Break_Qty != "") {
        node.getValue("Price_Break_Qty").setSimpleValue("0");
    }
    ci_status = node.getValue("ContractItem_Status").getID();
    if (!ci_status || ci_status == "") {
        node.getValue("ContractItem_Status").setLOVValueByID("OPEN");
    }
    details = node.getValue("Detail").getID();
    if (!details) {
        log.info("Exiting BPA Set Default Values details " + details);
        node.getValue("Detail").setLOVValueByID("PBREAK");
    }
    /*
   if(node.getName() == null){
    parent = node.getParent().getName();
    if (parent) {
        node.setName(parent + "(" + node.getID() + ")");
    }
   }*/
	maxOrderQty =node.getValue("Max_Order_Qty").getSimpleValue();
	if(!maxOrderQty || maxOrderQty==""){
	   node.getValue("Max_Order_Qty").setSimpleValue("999999");
	
	}
	
	minOrderQty =node.getValue("Min_Order_Qty").getSimpleValue();
	if(!minOrderQty || minOrderQty==""){
	   node.getValue("Min_Order_Qty").setSimpleValue("1");
	
	}
	
	leadTime =node.getValue("Lead_Time").getSimpleValue();
	if(Legacy_Source!="RTL" ||Legacy_Source!="WRLN" || Legacy_Source!="WRLN_NON" || Legacy_Source!="QTE" ){
	    if(node.getValue("Lead_Time").getSimpleValue()==null || node.getValue("Lead_Time").getSimpleValue()=="")
	   {
	      node.getValue("Lead_Time").setSimpleValue("14");
	   }
	}
	
	
	nonProcessflag=node.getValue("Non_Process_Flag").getSimpleValue();
	if(!nonProcessflag || nonProcessflag==""){
	   node.getValue("Non_Process_Flag").setLOVValueByID("N");
	
	}
	/*
	priceBreakPrice=node.getValue("Price_2").getSimpleValue();
	if(!priceBreakPrice || priceBreakPrice==""){
	   node.getValue("Price_2").setSimpleValue("0");
	   var IDArray = new java.util.ArrayList();		
		IDArray = ['Price_2'];
		if(node.getValue("BPA_Processed_In_EBS").getID() == "Y")
	   BPALib.partialApproveFields(node, IDArray)
	}*/
	
	standPack=node.getValue("STD_PACKAGING").getSimpleValue();
	if(!standPack || standPack==""){
	   node.getValue("STD_PACKAGING").setSimpleValue("1");
	
	}
	// Changes made for STIBO-1555
	var leChildren = node.getChildren();
	if (leChildren.size() > 0) {
		for (var i = 0; i < leChildren.size(); i++) {
			var childCILE = leChildren.get(i);
			log.info("childCILE " + childCILE.getID());
			var leObjectType = childCILE.getObjectType().getID();
			if(leObjectType == 'LE_Contract_Item_Child')
			{
				BPALib.setLEDefaultValues(childCILE);
			}
		}
	}
	
}


log.info("Exiting BPA Set Default Values");
}