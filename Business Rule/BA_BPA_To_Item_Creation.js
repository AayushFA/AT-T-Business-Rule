/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_BPA_To_Item_Creation",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "Create MST Item From BPA",
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
  }, {
    "contract" : "DataIssuesContextBind",
    "alias" : "issue",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,issue) {
		/**
			 * @author - Piyal [CTS]
			 * The BA will create MS items from BPA Flow
			 */

		
		var name = null;
		var lob=null;
		var BPA_MFG_PartNo=null;
		var BPA_Business_Group=null;
		var BPA_Material_Item_Type_Web=null;	
		var userItemTypeENT = null;
		var userItemTypeWRLN = null;
		var userItemTypeRTL = null;
		var productHome = null;
		var itemCreateWF = step.getWorkflowHome().getWorkflowByID("Item_Creation_Workflow");
		var refHome = step.getReferenceTypeHome().getReferenceTypeByID("ContractItem_Item");
		var srcRefTarget =node.queryReferences(refHome).asList(1);
		var OnboardingProducts= "OnboardingProducts";
		var product =null;		
		lob= node.getParent().getValue("Legacy_Source").getID();		
		BPA_MFG_PartNo= node.getValue("BPA_MFG_PartNo").getSimpleValue();
		
		if ((lob!=null && lob != "")) {
		if(lob=="WRLN" || lob=="WRLN_NON") {
		   BPA_Business_Group=node.getValue("BPA_Business_Group").getID();
		   BPA_Material_Item_Type_Web=node.getValue("BPA_Material_Item_Type_Web").getID();
		   if(BPA_Business_Group!=null && BPA_Material_Item_Type_Web!=null &&  BPA_MFG_PartNo!=null)   {
			  productHome = step.getProductHome().getProductByID(OnboardingProducts);
			  product = productHome.createProduct(null, "Item");
			  if(product)  {
				product.getValue("Business_Group").setLOVValueByID(BPA_Business_Group);
				product.getValue("Material_Item_Type_Web").setLOVValueByID(BPA_Material_Item_Type_Web);
				product.getValue("Mfg_Part_No").setSimpleValue(BPA_MFG_PartNo);
				node.createReference(product, refHome);
				itemCreateWF.start(product, null);
				reset(node);
			  }
		   }else	  {
		  	 issue.addWarning("MFG Part No is mandatory for Item Creation.\n",node,step.getAttributeHome().getAttributeByID("BPA_MFG_PartNo"));
		  	 issue.addWarning("Business Group is mandatory for Item Creation.\n",node,step.getAttributeHome().getAttributeByID("BPA_Business_Group"));
		  	 issue.addWarning("Material Item Type Web is mandatory for Item Creation.\n",node,step.getAttributeHome().getAttributeByID("BPA_Material_Item_Type_Web"));
		  	 return issue;
		  }
		}else if(lob=="RTL") {
		  userItemTypeRTL = node.getValue("CI_UserItemType_RTL").getID();
		  if(userItemTypeRTL!=null &&  BPA_MFG_PartNo!=null)	  {
			productHome = step.getProductHome().getProductByID(OnboardingProducts);
			product = productHome.createProduct(null, "Item");
			if(product)	{
			   product.getValue("Mfg_Part_No").setSimpleValue(BPA_MFG_PartNo);
			   product.getValue("RTL_Item_Type").setLOVValueByID(userItemTypeRTL);
			   node.createReference(product, refHome);
			   itemCreateWF.start(product, null);
			   reset(node);
			}
		  }else  {
		  	 issue.addWarning("MFG Part No is mandatory for Item Creation.\n",node,step.getAttributeHome().getAttributeByID("BPA_MFG_PartNo"));
		  	 issue.addWarning("User Item Type RTL is mandatory for Item Creation.\n",node,step.getAttributeHome().getAttributeByID("CI_UserItemType_RTL"));
		  	 return issue;
		  }
		}else {
		  
		  userItemTypeENT = node.getValue("CI_User_ItemType_ENT").getID();
		 
		  if(userItemTypeENT!=null &&  BPA_MFG_PartNo!=null)	  {
			productHome = step.getProductHome().getProductByID(OnboardingProducts);
			product = productHome.createProduct(null, "Item");
			if(product)			{   
			   product.getValue("Mfg_Part_No").setSimpleValue(BPA_MFG_PartNo);
			   product.getValue("ENT_Item_Type").setLOVValueByID(userItemTypeENT);
			   node.createReference(product, refHome);
			   itemCreateWF.start(product, null);
			   reset(node);
			}
		  }else  {		  	
		  	 issue.addWarning("MFG Part No is mandatory for Item Creation.\n",node,step.getAttributeHome().getAttributeByID("BPA_MFG_PartNo"));
		  	 issue.addWarning("User Item Type ENT is mandatory for Item Creation.\n",node,step.getAttributeHome().getAttributeByID("CI_User_ItemType_ENT"));
		  	 return issue;
		  }
		}		
	}
				
	function reset(node)
		{		
			node.getValue("BPA_MFG_PartNo").setSimpleValue(null);
			node.getValue("BPA_Business_Group").setSimpleValue(null);
			node.getValue("CI_UserItemType_RTL").setSimpleValue(null);
			node.getValue("BPA_Material_Item_Type_Web").setSimpleValue(null);
			node.getValue("CI_User_ItemType_ENT").setSimpleValue(null);
		}	
							
}