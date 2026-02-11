/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_OrgStatusUpdtReport",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_GlobalBusinessAction" ],
  "name" : "Org Status Update Report",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Child_Org_Item", "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_Audit_Library",
    "libraryAlias" : "libAudit"
  }, {
    "libraryId" : "AT&T_Global_Library",
    "libraryAlias" : "globalLib"
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
exports.operation0 = function (node,step,mailHome,webui,issue,libAudit,globalLib) {
/** Author - Madhuri[CTS]
 *  STIBO-1549 DC Orgs Status Update Report
 */

//Report header attributes
var report = "Item Number"+"\t"+"Org Code"+"\t"+"Revision No."+"\t"+"Item Status"+"\t"+"Contract Manager"+"\t"+"Sourcing Comments"+"\t"+"BPA Lines"+"\t"+" Approved and Submitted by"+"\t"+"Revision Date"+"\t"+"Revision user\n";
if (node) {
    execute(node);
    logger.info(node.getValue("Line_Of_Business").getID())
} else if (!node) {
    selection = webui.getSelection(); // Fetch the Items list from webui selection
    selection.forEach(function(item) {
        if (item.getObjectType().getID() == 'Child_Org_Item' && item.getValue("Line_Of_Business").getID() == "WRLN") {
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
    if (apprNode){
    var apprRev = apprNode.getRevisions().toArray(); // Revisions from approved workspace
    var id = node.getID();
    // List of attributes to be included in SOX report
    var itemStatus = null;
    var itemNum = null;  
    var orgCode = null;
    var contractMgr = null;
    var comments = null
    var BPANums = [];
    var lastUpdBy = null;
    var lastUpdDate = null;

    var changeFlag = new java.util.HashMap(); // Capture the change flag for the attributes

    for (var i = apprRev.length - 1; i >= 0; i--) {
        changeFlag.put("Item_Status", checkChange(apprRev, "Item_Status", i));
        changeFlag.put("Item_Num", checkChange(apprRev, "Item_Num", i));  
        changeFlag.put("Organization_Code", checkChange(apprRev, "Organization_Code", i));      
        changeFlag.put("Contract_Mgr", checkChange(apprRev, "Item_Num", i));         
        changeFlag.put("BPA_Pending_Comments", checkChange(apprRev, "BPA_Pending_Comments", i));

        //Fetch the values for attributes from approved workspace
        itemStatus = apprRev[i].getNode().getValue("Item_Status").getSimpleValue();
        itemNum = apprRev[i].getNode().getValue("Item_Num").getSimpleValue();   
        orgCode = apprRev[i].getNode().getValue("Organization_Code").getSimpleValue();
        contractMgr = apprRev[i].getNode().getValue("Contract_Mgr").getSimpleValue();         
        comments = apprRev[i].getNode().getValue("BPA_Pending_Comments").getSimpleValue();
        if(comments)
        comments = comments.replace("<multisep/>", " | ");
        var BPALines = apprRev[i].getNode().getParent().getReferencedByProducts();
        if(BPALines.size()>0){		
		BPALines.forEach(function (ref) {
			var BPALine = ref.getSource();				
			  if (ref.getSource().getObjectType().getID() == "Contract_Item" && BPALine.getParent().getID() !="CancelledProducts" && BPALine.getParent().getID() !="BPA_Onboarding") {
				var BPANum = BPALine.getParent().getValue("Oracle_Contract_Num").getSimpleValue();
				
				if(BPANums.indexOf(BPANum) == -1)
				    BPANums= BPANums +"|"+BPANum
			  }
		});
		
        }
        submittedDate = apprRev[i].getNode().getValue("Submitted_DateTime").getSimpleValue();
        isPublished = (checkPublishInfo(apprRev, "Submitted_DateTime", i) || checkPublishInfo(apprRev, "Last_Updated_DateTime", i));
        lastUpdBy = apprRev[i].getNode().getValue("Submitted_By").getSimpleValue();
        lastUpdDate = apprRev[i].getNode().getValue("Response_Received_DateTime").getSimpleValue();
        submittedDate = apprRev[i].getNode().getValue("Submitted_DateTime").getSimpleValue();
        revDate = apprRev[i].getCreatedDate();
        revUser = apprRev[i].getUserID();
        revNo = apprRev[i].getName();

        if ((changeFlag.containsValue(true) || i == (apprRev.length - 1)) && itemNum) {
            var j = 0;
            for (var k = revision.length - 1; k >= 0; k--) {
                j++;
                apprArr = apprRev[i].toString().split("@");
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
            report += itemNum + "\t" + orgCode+ "\t" + revNo + "\t" + itemStatus +  "\t" + contractMgr +"\t" + comments  +"\t"+BPANums+"\t" +lastUpdBy + "\t" + revDate + "\t" + revUser + "\n";
        }
    }
}
}

var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd HH-mm-ss");
var dateNow=new Date();
var formattedDateTime = dateTimeFormatter.format(dateNow)+"";
var filePath = "/opt/stibo/OrgStatusUpdtReport_"+formattedDateTime+".xls"; // Includes timestamp with File name
var fileName = "OrgStatusUpdtReport_"+formattedDateTime+".xls";
var file = new java.io.File(filePath);
if (!file.exists()) {
    file.createNewFile();
}
var fw = new java.io.FileWriter(file, false);
fw.write(report);
fw.flush();
fw.close();
var fileInputStream = new java.io.FileInputStream(file);
var asset = step.getAssetHome().getAssetByID("SOX_25669553");
asset.upload(fileInputStream, "SOX_25669553");


var mail = mailHome.mail();
var instanceName = libAudit.getHostEnvironment(); 
var sender = instanceName + "-noreply@cloudmail.stibo.com";
var receiver = step.getCurrentUser();
var subject = instanceName + ": Org Status report";
var body = "Please find the Org Status report attached";
try {
    var userID = globalLib.getEmailId(receiver);
    if (userID) {	   
	    mail.from(sender);
	    mail.addTo(userID);
	    mail.subject(subject);
	    mail.plainMessage(body);
	    mail.attachment().fromAsset(asset).name(fileName).attach();
	    mail.send();
	    if (!node) {
	        webui.showAlert("ACKNOWLEDGMENT", "Success", "Please check your E-mail for the report generated");
	    }
    }
} catch (e) {
    logger.info("Issue in mail generation for the report");
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