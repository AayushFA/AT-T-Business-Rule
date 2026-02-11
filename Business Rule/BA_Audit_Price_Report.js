/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Audit_Price_Report",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_GlobalBusinessAction" ],
  "name" : "Audit Price Report",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Item", "Companion_SKU" ],
  "allObjectTypesValid" : true,
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
var collectionId = "63099521";
var collectionHome = step.getNodeCollectionHome();
var collection = collectionHome.getNodeCollectionByID(collectionId);
var itemArray = [];
if (collection) {
    var nodeQuery = collection.queryNodes();
    nodeQuery.forEach(function(item) {
        itemArray.push(item);
        return true;
    });
}
var report = "Item Number\tRevision No.\tItem Status\tMarket Price\tPrevious Market Price\tRevision Date\tRevision user\n";
var dateTimeFormatter = new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

function hasActualPriceChange(revisions, attributeId) {
    var observedPrices = new java.util.HashSet();
    for (var i = 0; i < revisions.length; i++) {
        var value = revisions[i].getNode().getValue(attributeId);
        var price = value ? String(value.getSimpleValue()) : "";
        price = price === "null" ? "" : price;
        if (price !== "") {
            observedPrices.add(price);
        }
    }
    return observedPrices.size() > 1;
}

function execute(node) {
    var revisions = node.getRevisions().toArray();
    if (revisions.length < 2) return;
    var attributeId = "Market_Price";
    if (!hasActualPriceChange(revisions, attributeId)) return;
    var lastLoggedValue = null;
    var reportLines = [];
    for (var i = revisions.length - 1; i >= 0; i--) {
        var currentRevision = revisions[i];
        var currentValueRaw = currentRevision.getNode().getValue(attributeId);
        var currentValue = currentValueRaw ? String(currentValueRaw.getSimpleValue()) : "";
        currentValue = currentValue === "null" ? "" : currentValue;
        if (currentValue === "" && lastLoggedValue === null) continue;
        if (lastLoggedValue === null || currentValue !== lastLoggedValue) {
            var itemNum = currentRevision.getNode().getValue("Item_Num") ? currentRevision.getNode().getValue("Item_Num").getSimpleValue() : "";
            var itemStatus = currentRevision.getNode().getValue("Item_Status") ? currentRevision.getNode().getValue("Item_Status").getSimpleValue() : "";
            var revisionDate = currentRevision.getCreatedDate() ? dateTimeFormatter.format(currentRevision.getCreatedDate()) : "";
            var revisionUser = currentRevision.getUserID();
            var revisionNumber = currentRevision.getName();
            var previousValue = lastLoggedValue !== null ? lastLoggedValue : "";
            var row = itemNum + "\t'" + revisionNumber + "'\t" + itemStatus + "\t" + currentValue + "\t" + previousValue + "\t" + revisionDate + "\t" + revisionUser + "\n";
            reportLines.push(row);
            lastLoggedValue = currentValue;
        }
    }
    for (var j = reportLines.length - 1; j >= 0; j--) {
        report += reportLines[j];
       // log.info("report" + report);
    }
}
itemArray.forEach(function(node) {
    execute(node);
});
if (report.trim() !== "Item Number\tRevision No.\tItem Status\tMarket Price\tPrevious Market Price\tRevision Date\tRevision user") {
    var dateTimeFormatterFile = new java.text.SimpleDateFormat("yyyy-MM-dd_HH.mm.ss");
    var dateNow = new Date();
    var formattedDateTimeFile = dateTimeFormatterFile.format(dateNow);
    var filePath = "/opt/stibo/PriceChangeReport_" + formattedDateTimeFile + ".xls";
    var fileName = "PriceChangeReport_" + formattedDateTimeFile + ".xls";
    var file = new java.io.File(filePath);
    if (!file.exists()) {
        file.createNewFile();
    }
    var fw = new java.io.FileWriter(file, false);
    fw.write(report);
    fw.flush();
    fw.close();
    var fileInputStream = new java.io.FileInputStream(file);
    var asset = step.getAssetHome().getAssetByID("SOX_62809558");
    asset.upload(fileInputStream, "SOX_62809558");
    var mail = mailHome.mail();
    var instanceName = libAudit.getHostEnvironment();
    var sender = instanceName + "-noreply@cloudmail.stibo.com";
    var receivers = ["mr952y@att.com"];//--> Test Users remove in prod
   /* var currentUser =step.getCurrentUser().getEMail(); //-->Enable if email should send to current user
    if (currentUser) {
    	receivers = [currentUser];
	}*/
   // var receivers = ["DL-StiboDevandProdSupportTeam@att.com"]; //--> Enable in Prod for sending weekly report
    if (receivers.length === 0) {
        issue.addError("Please check with STIBO Production support team to add your E-mail address to user details");
    } else {
        var subject = instanceName + ": Price Change Report";
        var body = "Hi, Please find the latest report of price changes attached, including related item details.";
        try {
        	log.severe("recivers    "+receivers);
            mail.from(sender);
            receivers.forEach(function(email) {
                mail.addTo(email);
            });
            mail.subject(subject);
            mail.plainMessage(body);
            mail.attachment().fromAsset(asset).name(fileName).attach();
            mail.send();
            webui.showAlert("ACKNOWLEDGMENT", "Success", "Please check your E-mail for the Price Change Report.");
        } catch (e) {
            webui.showAlert("ERROR", "Issue - Report not sent", "Please check with Production support team for mail generation issues. Check the logs for details.");
        }
    }
}
}