/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_AuditSOXReport",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_GlobalBusinessAction" ],
  "name" : "Audit SOX Report",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
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
exports.operation0 = function (node,step,mailHome,webui,issue,libAudit) {
/** Author - Abiraami
 *  STIBO-1483 SOX report
 */

//Report header attributes
//var report = "Item Number,Revision No. (SOX related changes only), User Defined Item Description,Item Status,OEM,MFG Part number,Accounting type,Purchasing Category,Expenditure type,Account SubAccount,Expenditure code,MIC COE NTW,Item created by, Approved and Submitted by,Revision Date,Revision user\n";
var report = "Item Number" + "\t" + "Revision No. (SOX related changes only)" + "\t" + " User Defined Item Description" + "\t" + "Item Status" + "\t" + "OEM Full Name" + "\t" + "MFG Part number" + "\t" + "Accounting type" + "\t" + "Purchasing Category" + "\t" + "Expenditure type" + "\t" + "Account SubAccount" + "\t" + "Expenditure code" + "\t" + "MIC COE NTW" + "\t" + "Item created by" + "\t" + "Item created date" + "\t" + " Approved and Submitted by" + "\t" + "Revision Date" + "\t" + "Revision user\n";
var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

if (node) {
    execute(node);
} else if (!node) {
    selection = webui.getSelection(); // Fetch the Items list from webui selection
    selection.forEach(function(item) {
        if (item.getObjectType().getID() == 'Item' && item.getValue("Line_Of_Business").getID() == "NTW") {

            selectedNode = item;
            execute(selectedNode);
        }
    });
}

function execute(node) {

    var revision = node.getRevisions().toArray(); // Revisions from Main workspace
    var apprManager = step.executeInWorkspace("Approved", function(step) {
        return step;
    });
    var apprNode = apprManager.getProductHome().getProductByID(node.getID());
    if (apprNode) {
        var apprRev = apprNode.getRevisions().toArray(); // Revisions from approved workspace
        var id = node.getID();
        // List of attributes to be included in SOX report
        var itemStatus = null;
        var itemNum = null;
        var userDefinedItemDesc = null;
        var oem = null;
        var mfgPartNo = null;
        var itemNum = null;
        var accType = null;
        var purchasingCat = null;
        var expType = null;
        var accSubacc = null;
        var expCode = null;
        var micCoeNtw = null;
        var createdBy = revision[revision.length - 1].getUserID();
        var createdDate = null;
        var lastUpdBy = null;
        var lastUpdDate = null;

        var changeFlag = new java.util.HashMap(); // Capture the change flag for the SOX attributes

        for (var m = revision.length - 1; m >= 0; m--) {
            itemName = revision[m].getNode().getName();
            if (itemName != null) {
                itemStatus = revision[m].getNode().getValue("Item_Status").getSimpleValue();
                itemNum = revision[m].getNode().getValue("Item_Num").getSimpleValue();
                userDefinedItemDesc = revision[m].getNode().getValue("User_Defined_Item_Description").getSimpleValue() + "";
                userDefinedItemDesc = userDefinedItemDesc.replace(/\n/g, " ");
                oem = revision[m].getNode().getValue("OEM_Full_Name").getSimpleValue();
                mfgPartNo = revision[m].getNode().getValue("Mfg_Part_No").getSimpleValue();
                accType = revision[m].getNode().getValue("Accounting_Type").getSimpleValue();
                purchasingCat = revision[m].getNode().getValue("Purchasing_Cat").getSimpleValue();
                expType = revision[m].getNode().getValue("Expenditure_Type").getSimpleValue();
                accSubacc = revision[m].getNode().getValue("Account_SubAccount").getSimpleValue();
                expCode = revision[m].getNode().getValue("Expenditure_Code").getSimpleValue();
                micCoeNtw = revision[m].getNode().getValue("MIC_COE_NTW").getSimpleValue();
                lastUpdBy = revision[m].getNode().getValue("Submitted_By").getSimpleValue();
                revDate = dateTimeFormatter.format(revision[m].getCreatedDate());
                createdDate = revDate;
                revNo = 0.1;
                revKey = itemNum + "|" + revDate;
                n = m;

                while (n < revision.length) {
                    temprevUser = revision[n].getUserID();
                    if (temprevUser != "STEPSYS") {
                        revUser = temprevUser;
                        break;
                    }
                    n = n + 1;
                }



                report += itemNum + "\t" + "'" + revNo + "'" + "\t" + userDefinedItemDesc + "\t" + itemStatus + "\t" + oem + "\t" + mfgPartNo + "\t" + accType + "\t" + purchasingCat + "\t" + expType + "\t" + accSubacc + "\t" + expCode + "\t" + micCoeNtw + "\t" + createdBy + "\t" + createdDate + "\t" + lastUpdBy + "\t" + revDate + "\t" + revUser + "\n";
                break;

            }
        }

        for (var i = apprRev.length - 1; i >= 0; i--) {
            changeFlag.put("Item_Status", checkChange(apprRev, "Item_Status", i));
            changeFlag.put("Item_Num", checkChange(apprRev, "Item_Num", i));
            changeFlag.put("User_Defined_Item_Description", checkChange(apprRev, "User_Defined_Item_Description", i));
            changeFlag.put("OEM_Full_Name", checkChange(apprRev, "OEM_Full_Name", i));
            changeFlag.put("Mfg_Part_No", checkChange(apprRev, "Mfg_Part_No", i));
            changeFlag.put("Accounting_Type", checkChange(apprRev, "Accounting_Type", i));
            changeFlag.put("Purchasing_Cat", checkChange(apprRev, "Purchasing_Cat", i));
            changeFlag.put("Expenditure_Type", checkChange(apprRev, "Expenditure_Type", i));
            changeFlag.put("Account_SubAccount", checkChange(apprRev, "Account_SubAccount", i));
            changeFlag.put("Expenditure_Code", checkChange(apprRev, "Expenditure_Code", i));
            changeFlag.put("MIC_COE_NTW", checkChange(apprRev, "MIC_COE_NTW", i));

            //Fetch the values for SOX attributes from approved workspace
            itemStatus = apprRev[i].getNode().getValue("Item_Status").getSimpleValue();
            itemNum = apprRev[i].getNode().getValue("Item_Num").getSimpleValue();
            userDefinedItemDesc = apprRev[i].getNode().getValue("User_Defined_Item_Description").getSimpleValue() + "";
            userDefinedItemDesc = userDefinedItemDesc.replace(/\n/g, " ");
            oem = apprRev[i].getNode().getValue("OEM_Full_Name").getSimpleValue();
            mfgPartNo = apprRev[i].getNode().getValue("Mfg_Part_No").getSimpleValue();
            accType = apprRev[i].getNode().getValue("Accounting_Type").getSimpleValue();
            purchasingCat = apprRev[i].getNode().getValue("Purchasing_Cat").getSimpleValue();
            expType = apprRev[i].getNode().getValue("Expenditure_Type").getSimpleValue();
            accSubacc = apprRev[i].getNode().getValue("Account_SubAccount").getSimpleValue();
            expCode = apprRev[i].getNode().getValue("Expenditure_Code").getSimpleValue();
            micCoeNtw = apprRev[i].getNode().getValue("MIC_COE_NTW").getSimpleValue();

            submittedDate = apprRev[i].getNode().getValue("Submitted_DateTime").getSimpleValue();

            isPublished = (checkPublishInfo(apprRev, "Submitted_DateTime", i) || checkPublishInfo(apprRev, "Last_Updated_DateTime", i));

            lastUpdBy = apprRev[i].getNode().getValue("Submitted_By").getSimpleValue();
            revDate = dateTimeFormatter.format(apprRev[i].getCreatedDate());
            revUser = apprRev[i].getUserID();
            revNo = apprRev[i].getName();
            apprRevKey = itemNum + "|" + revDate;
            apprArr = apprRev[i].toString().split("@");
            firstRevArr = revision[m].toString().split("@");
            if ((changeFlag.containsValue(true)) && itemNum) {
                if (revKey != apprRevKey) {


                    var j = 0;
                    for (var k = revision.length - 1; k >= 0; k--) {
                        j++;
                        revArr = revision[k].toString().split("@");

                        if (apprArr[1] == revArr[1]) {

                            revUser = revision[k + 1].getUserID();

                            revNo = revision[k + 1].getName();
                            if (revUser == "STEPSYS") {
                                revUser = revision[k + 2].getUserID();
                                revNo = revision[k + 2].getName();
                                if (revUser == "STEPSYS") {
                                    revUser = revision[k + 3].getUserID();
                                    revNo = revision[k + 3].getName();
                                }
                            }
                            break;
                        }
                    }
                    revNoStr = revNo.toString();
                    if (revNoStr != "0.1") {
                        report += itemNum + "\t" + "'" + revNoStr + "'" + "\t" + userDefinedItemDesc + "\t" + itemStatus + "\t" + oem + "\t" + mfgPartNo + "\t" + accType + "\t" + purchasingCat + "\t" + expType + "\t" + accSubacc + "\t" + expCode + "\t" + micCoeNtw + "\t" + createdBy + "\t" + createdDate + "\t" + lastUpdBy + "\t" + revDate + "\t" + revUser + "\n";
                    }
                }
            }
        }
    }
}

var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd_HH.mm.ss");
var dateNow = new Date();
var formattedDateTime = dateTimeFormatter.format(dateNow);
var filePath = "/opt/stibo/SOXReport_" + formattedDateTime + ".xls"; // Includes timestamp with File name
var fileName = "SOXReport_" + formattedDateTime + ".xls";
var file = new java.io.File(filePath);
if (!file.exists()) {
    file.createNewFile();
}
var fw = new java.io.FileWriter(file, false);
fw.write(report);
fw.flush();
fw.close();
var fileInputStream = new java.io.FileInputStream(file);
var asset = step.getAssetHome().getAssetByID("SOX_17260270");
asset.upload(fileInputStream, "SOX_17260270");


var mail = mailHome.mail();
var instanceName = libAudit.getHostEnvironment(); //STIBO-1862
var sender = instanceName + "-noreply@cloudmail.stibo.com"; //STIBO-1862
var receiver = step.getCurrentUser().getEMail();

if (!receiver) {
    issue.addError("Please check with STIBO Production support team to add your E-mail address to user details");
}

var subject = instanceName + ": SOX report"; //STIBO-1862
var body = "Please find the SOX report attached";
// use try catch to send mail report
try {
    mail.from(sender);
    mail.addTo(receiver);
    mail.subject(subject);
    mail.plainMessage(body);
    mail.attachment().fromAsset(asset).name(fileName).attach();
    mail.send();
    if (!node) {
        webui.showAlert("ACKNOWLEDGMENT", "Success", "Please check your E-mail for SOX report generated");
    }
} catch (e) {
    logger.info("Issue in mail generation for SOX report");
    webui.showAlert("ERROR", "Issue - Report not sent", "Please check with Production support team for mail generation issues");
}



// compare the approved WS revision values
function checkChange(node, attID, revNo) {
    var changeFlag = false;
    currentValue = node[revNo].getNode().getValue(attID).getSimpleValue();
    if (revNo != node.length - 1) {
        prevValue = node[revNo + 1].getNode().getValue(attID).getSimpleValue();
        if (prevValue != currentValue) {
            changeFlag = true;
        }
        return changeFlag;

    }
}

function checkPublishInfo(node, attID, revNo) {
    var publishFlag = false;
    currentValue = node[revNo].getNode().getValue(attID).getSimpleValue();
    if (revNo != node.length - 1) {
        prevValue = node[revNo + 1].getNode().getValue(attID).getSimpleValue();
        if (prevValue != currentValue) {
            publishFlag = true;
        }
        return publishFlag;

    }
}
}