/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "Set Item Specific Attribute(Temp)",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "Set Item Specific Attribute(Temp)",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "LE_Contract_Item_Child", "Contract_Item", "Bill_Of_Material", "Item", "BPA" ],
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
  }, {
    "contract" : "WebUiContextBind",
    "alias" : "ctx",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (currentNode,step,itemRef,pbomRef,ctx) {
			/**
			 * @author - Piyal [CTS]
			 * Setting the item specific attributes From Item/PBOM to Contract item
			 */

			log.info("Set Item Specific Attribute For Contract Item");

			
			var selection=ctx.getSelection();	
			var Workflow=step.getWorkflowHome().getWorkflowByID("Create_BPA")
            var State = Workflow.getStateByID("Enrich_BPA_CI_LE");
			var lob=null;
			var std_pack=null;
			var minimumQty=null;
               execute(currentNode)
			
			function execute(currentNode)
			{
			var objectType = currentNode.getObjectType().getID();
			var itemrefData = null;
			var pbomRefData = null;
			var attItemObj = null;
			var query= step.getHome(com.stibo.query.home.QueryHome);

			if (objectType == 'Contract_Item') {
				resetValue(currentNode);
				itemrefData = currentNode.queryReferences(itemRef).asList(1);
				pbomRefData = currentNode.queryReferences(pbomRef).asList(1);

				 if (itemrefData.size() > 0 && pbomRefData.size() > 0) {
						ctx.showAlert("ERROR", "Contract Item can not have both Item and PBOM reference same time")
						return false;
				 }
				
				if (itemrefData.size() > 0) {

					var srcRefTarget = itemrefData.get(0).getTarget();
				   //log.info("srcRefTarget "+srcRefTarget.getID());
				   log.info("INN");
					copyAttributes(currentNode, srcRefTarget);
				}
				if (pbomRefData.size() > 0) {

					var srcRefTarget = pbomRefData.get(0).getTarget();

					var attItemid = srcRefTarget.getValue("Parent_Item").getSimpleValue();
					 
					 //log.info("attItemid "+attItemid);
					var c = com.stibo.query.condition.Conditions;
					var querySpecification = query.queryFor(com.stibo.core.domain.Product).where(
						c.valueOf(step.getAttributeHome().getAttributeByID("Item_Num")).eq(attItemid)
					);

					var queryResult = querySpecification.execute().asList(1);
					//log.info(queryResult.size() + "  log")
					if (queryResult.size() > 0) {
						attItemObj = queryResult.get(0);

					}
					  
					if (attItemObj) {
						log.info("attItemObj bom "+attItemObj.getID());
						copyAttributes(currentNode, attItemObj);
					}
				}

			}
			}

			function copyAttributes(currentNode, srcRefTarget) {
				//log.info("objectType1134 "+srcRefTarget.getID());
				var uom = srcRefTarget.getValue("Primary_UOM").getID();
                lob=currentNode.getValue("Legacy_Source").getID();
				if (uom && uom != "") {

					currentNode.getValue("BPA_UOM").setLOVValueByID(uom);
					currentNode.getValue("UOM_Copied_From_Item").setValue(uom);
					
					log.info("UOM :" + currentNode.getValue("BPA_UOM").getSimpleValue())
					log.info("UOM_Copied_From_Item :" + currentNode.getValue("UOM_Copied_From_Item").getSimpleValue())
				}

				var oracleItemNumber = srcRefTarget.getValue("Item_Num").getSimpleValue();
				//log.info("objectType11345 "+oracleItemNumber);
				if (oracleItemNumber && oracleItemNumber != "") {
					currentNode.getValue("Oracle_Item_Num").setValue(oracleItemNumber);
					log.info("OracleItemNumber " + currentNode.getValue("Oracle_Item_Num").getSimpleValue())
				}
				var OEM_Full_Name = srcRefTarget.getValue("OEM_Full_Name").getSimpleValue();
				if (OEM_Full_Name && OEM_Full_Name != "") {
					currentNode.getValue("BPA_OEM_Full_Name").setValue(OEM_Full_Name);
					log.info("OEM_Full_Name " + currentNode.getValue("BPA_OEM_Full_Name").getSimpleValue());
				}
				var OEM_Part_Number = srcRefTarget.getValue("Mfg_Part_No").getSimpleValue();
				if (OEM_Part_Number && OEM_Part_Number != "") {
					currentNode.getValue("BPA_OEM_Part_Number").setValue(OEM_Part_Number);
					log.info("OEM_Part_Number " + currentNode.getValue("BPA_OEM_Part_Number").getSimpleValue())
				}
				var Pack_Quantity = srcRefTarget.getValue("Pack_Qty").getSimpleValue();
				 log.info("Pack_Quantity " + Pack_Quantity)
				if (Pack_Quantity && Pack_Quantity != "") {
					currentNode.getValue("BPA_Pack_Quantity").setValue(Pack_Quantity);
					log.info("Pack_Quantity " + currentNode.getValue("BPA_Pack_Quantity").getSimpleValue())
				}else if(Pack_Quantity == null) 
				{
				  if(lob!="RTL")
					{
					   currentNode.getValue("BPA_Pack_Quantity").setValue("1");
					}
				}

				var itemLevelBuyer = srcRefTarget.getValue("Buyer").getSimpleValue();
				// log.info("Pack_Quantity "+Pack_Quantity)
				if (itemLevelBuyer && itemLevelBuyer != "") {
					currentNode.getValue("BPA_Item_Level_Buyer_Planner").setValue(itemLevelBuyer);
					log.info("Buyer " + currentNode.getValue("BPA_Item_Level_Buyer_Planner").getSimpleValue())
				}


			}



			function resetValue(currentNode) {
				currentNode.getValue("BPA_UOM").setValue(null);
				currentNode.getValue("BPA_Pack_Quantity").setValue(null);
				currentNode.getValue("BPA_OEM_Part_Number").setValue(null);
				currentNode.getValue("BPA_OEM_Full_Name").setValue(null);
				currentNode.getValue("Oracle_Item_Num").setValue(null);
				currentNode.getValue("BPA_Item_Level_Buyer_Planner").setValue(null);
				currentNode.getValue("UOM_Copied_From_Item").setValue(null);
			}
			
			
}