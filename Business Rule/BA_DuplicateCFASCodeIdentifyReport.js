/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_DuplicateCFASCodeIdentifyReport",
  "type" : "BusinessAction",
  "setupGroups" : [ "BPA_BA" ],
  "name" : "Identify Duplicate CFAS Code Report",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Contract_Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_Audit_Library",
    "libraryAlias" : "libAudit"
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
  }, {
    "contract" : "MailHomeBindContract",
    "alias" : "mailHome",
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
    "contract" : "ReferenceTypeBindContract",
    "alias" : "itemRef",
    "parameterClass" : "com.stibo.core.domain.impl.ReferenceTypeImpl",
    "value" : "ContractItem_Item",
    "description" : null
  }, {
    "contract" : "ObjectTypeBindContract",
    "alias" : "ciObjType",
    "parameterClass" : "com.stibo.core.domain.impl.ObjectTypeImpl",
    "value" : "Contract_Item",
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,mailHome,webui,itemRef,ciObjType,libAudit) {
/*
 ** Author-Abiraami
 * STIBO-2177
DG team need a report/process for CFAS Code Data Cleansing
 */

 //Attributes to be added in the report
var report = "Contract Item ID , Oracle Item Number , Contract Item Status , Item Number , Item Status , CFAS company code , Regional Status , BPA Number , BPA Header status ,Price \n";
var query = step.getHome(com.stibo.query.home.QueryHome);
var c = com.stibo.query.condition.Conditions;

if (node) {
    execute(node);
} else if (!node) {
    selection = webui.getSelection(); // Fetch the Items list from webui selection
    selection.forEach(function(uiNode) {
        if (uiNode.getObjectType().getID() == 'Contract_Item') {

            selectedNode = uiNode;
            execute(selectedNode);
        }
    });
}

function execute(node) {
    var orcItemNum = node.getValue("Oracle_Item_Num").getSimpleValue();
    var ciStat = node.getValue("ContractItem_Status").getSimpleValue();
    var ciPrice = node.getValue("Price").getSimpleValue();
    var bpaNum = node.getParent().getValue("Oracle_Contract_Num").getSimpleValue();
    var bpaHeaderStat = node.getParent().getValue("BPA_Status").getSimpleValue();

    var srcRefTargetItemList = node.queryReferences(itemRef).asList(1); //Fetch the Item refered to the Contract item
    if (srcRefTargetItemList.size() > 0) {
        var item = srcRefTargetItemList.get(0).getTarget();
        var itemStat = item.getValue("Item_Status").getSimpleValue();
        var itemNum = item.getValue("Item_Num").getSimpleValue();

        var cfasMap = new java.util.HashMap();
        var regionDCs = node.getDataContainerByTypeID("Region").getDataContainers();
        var regionIterator = regionDCs.iterator();
		// Fetch the Active CFAS code from the current node and store it in a map
        var sequence = 0;
        while (regionIterator.hasNext()) {
            regionDC = regionIterator.next();
            if (regionDC.getDataContainerObject().getValue("Regional_Status").getID() == "ACTIVE") {
                sequence++;
                cfasMap.put(sequence, regionDC.getDataContainerObject().getValue("CFAS_CO_Code").getID())
            }
        }
		// Query the other contract items which has the same Item reference
        var querySpecification = query.queryFor(com.stibo.core.domain.Product).where(c.hasReference(itemRef).where(c.targetIs(item)));
        var product = querySpecification.execute().asList(10000);
       for (i = 0; i < product.size(); i++) {
            var regionDCs = product.get(i).getDataContainerByTypeID("Region").getDataContainers();
            var regionIterator = regionDCs.iterator();
            while (regionIterator.hasNext()) {
                regionDC = regionIterator.next();
                if (regionDC.getDataContainerObject().getValue("Regional_Status").getID() == "ACTIVE") {
                     cfasCode = regionDC.getDataContainerObject().getValue("CFAS_CO_Code").getID();
                     //Capture the Contract item in report if CFAS code matches
                    if (cfasMap.containsValue(cfasCode) && node.getID() != product.get(i).getID()) {
                        var dupOrcItemNum = product.get(i).getValue("Oracle_Item_Num").getSimpleValue();
                        var dupCIStat = product.get(i).getValue("ContractItem_Status").getSimpleValue();
                        var dupCIPrice = product.get(i).getValue("Price").getSimpleValue();
                        var dupBpaNum = product.get(i).getParent().getValue("Oracle_Contract_Num").getSimpleValue();
                        var dupBpaHeaderStat = product.get(i).getParent().getValue("BPA_Status").getSimpleValue();

                        //if (!report.includes(node.getID())) {
                            report += node.getID() + "," + orcItemNum + "," + ciStat + "," + itemNum + "," + itemStat + "," + cfasCode + "," + "Active" + "," + bpaNum + "," + bpaHeaderStat + "," + ciPrice + "\n";
                       // }
                        report += product.get(i).getID() + "," + dupOrcItemNum + "," + dupCIStat + "," + itemNum + "," + itemStat + "," + cfasCode + "," + "Active" + "," + dupBpaNum + "," + dupBpaHeaderStat + "," + dupCIPrice + "\n";

                    }
                }
            }
       }
    }
}

// Mail generation method
var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd HH.mm.ss");
var dateNow = new Date();
var formattedDateTime = dateTimeFormatter.format(dateNow) + "";
var filePath = "/opt/stibo/DuplicateCFASReport_" + formattedDateTime + ".csv"; // Includes timestamp with File name
var fileName = "DuplicateCFASReport_" + formattedDateTime + ".csv";
var file = new java.io.File(filePath);
if (!file.exists()) {
    file.createNewFile();
}
var fw = new java.io.FileWriter(file, false);
fw.write(report);
fw.flush();
fw.close();
var fileInputStream = new java.io.FileInputStream(file);
var asset = step.getAssetHome().getAssetByID("SOX_25232444");
asset.upload(fileInputStream, "SOX_25232444");


var mail = mailHome.mail();
var instanceName = libAudit.getHostEnvironment();
var sender = instanceName + "-noreply@cloudmail.stibo.com";
var receiver = step.getCurrentUser().getEMail();
var subject = instanceName + ": Duplicate CFAS code report";
var body = "Please find the Duplicate CFAS code report attached";
// use try catch to send mail report
try {
    mail.from(sender);
    mail.addTo(receiver);
    mail.subject(subject);
    mail.plainMessage(body);
    mail.attachment().fromAsset(asset).name(fileName).attach();
    mail.send();
    if (!node) {
        webui.showAlert("ACKNOWLEDGMENT", "Success", "Please check your E-mail for the report of Duplicate CFAS code identification");
    }
} catch (e) {
    webui.showAlert("ERROR", "Issue - Report not sent", "Please check with Production support team for mail generation issues");
}
}