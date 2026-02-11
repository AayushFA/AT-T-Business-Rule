/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DM_Partial_Approval",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_GlobalBusinessAction" ],
  "name" : "DM Partial Approve [Reuse for any objects]",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Companion_SKU", "Item", "BPA" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
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
exports.operation0 = function (node,step,bpaLib) {
var attributeList =['Send_Item_Info','COGS_Account_Org','Sales_Account_Org','Transport_Lead_Time','Buyer','Receipt_Required_Flag','Auto_Lot_Alpha_Prefix','Engineered_Item_Flag','Inventory_Planning_Code','Invoiceable_Item_Flag','Lot_Control_Code','MRP_Safety_Stock_Code','Orderable_On_Web_Flag','Receive_Close_Tolerance','Recipe_Enabled_Flag','Start_Auto_Lot_Number','WIP_Supply_Type','Serial_Status_Enabled','Full_Lead_Time','Default_Serial_Status_Id', 'ATO_Forecast_Control','ATP_Components_Flag','ATP_Flag','Create_Supply_Flag','Planning_Make_Buy_Code','Preprocessing_Lead_Time','Rounding_Control_Type','Build_In_WIP_Flag', 'Market_Price_From_Oracle','Oracle_Authorization_Date','Oracle_Authorized_By','Oracle_Authorization_Reason','Oracle_Authorization_Status','AC_Power','DC_Power', 'BTU_Per_Hour','DC_Voltage','AC_Current','AC_Voltage','DC_Current','PMT_Item_Category','PMT_Item_Type','Send_Item_Info','Sales_Account_Org','COGS_Account_Org','AP_Category','AP_Sub_Category','ETF_Cat1','ETF_Cat2','ETF_Max_Value1','ETF_Max_Value2','Third_Party_Billing','SC_Demand_Planner','In_Comm_UPC','ASIN','FNSKU','RIO_Part_Number','UVERSE_Item_Number','System_Source','Leased','Device_Name','Assign_To_Field_Orgs','CSI_Returnthrehold','DOA_Returnthrehold','NAD_Item','NAD_Type','NAD_Code','NAD_Type_Descr','USP_Certified','Internal_WAP_Enabled','IAD_Certified_Flag','Generic_Material','Award_Price','Price_Protection','Client_Type','EQUIP_TYPE','Mobile_Unit','APG_Capable','STD_Capable','Number_Of_Tuners','Swappable','Decoder_Type','MDU_Wiring_Scheme','Orbital_Slots','Receiver_Type','MRVCompatible','SWIM_Capable','ATSC_Tuner_Type','Accessory_Type','Live_4K_Capable','VOD_4K_Capable','DVR_Type','DECA_Capable','MPG_Capable','HD_Capable','Gl_Capable','DVR_Capable','RMA_Required','OUI_Type','Hardware_Serialized_Flag','Serialized_Flag','Product_Type_Identifier','IV_Enabled_Flag','ReceiverId_Required_Flag','Product_Line_Item_Number','Domain_Code','Signal_Type','Is_Ird','Is_Antenna','Is_Multi_Switch','Number_Of_Input','Number_Of_Output','AHL_Serialized_Flag','MOCA_Version','Activatable_Flag','Mac_Auto_Pop_Flag','Rid_Auto_Pop_Flag','Serial_Auto_Pop_Flag','Is_SFS_Installable','4K_Genie','ATSC','Digital_Signage','Genie_Gen1','MRV_Installable','RBAND3','RBAND5','SWiM','Tivo','Transcoding','W0','W1','W2','W3','Wiring_Capability','Wiring_Scheme','Vis_Impaired','Expenditure_Type_EBS','Ext_App_Dwnld_Code','Assign_To_Field_Orgs','DTV_Part_Number','BOM_Enabled_Flag','Min_Max_Qty_Maximum']
bpaLib.partialApproveFields(node, attributeList);
}