/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_Asurion_IIEP_LoadFile_Partial_Approve",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_Item_Integration_Actions" ],
  "name" : "Asurion IIEP Load File And Partial Approve",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "BL_Item_Common_Derivation",
    "libraryAlias" : "commonLib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "InboundBusinessProcessorImporterSourceBindContract",
    "alias" : "inboundMessage",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "ManagerBindContract",
    "alias" : "stepManager",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "InboundBusinessProcessorExecutionReportLoggerBindContract",
    "alias" : "executionReportLogger",
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
    "contract" : "LoggerBindContract",
    "alias" : "logger",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookupTableHome",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
    "contract" : "CurrentObjectBindContract",
    "alias" : "node",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (inboundMessage,stepManager,executionReportLogger,mailHome,logger,lookupTableHome,node,commonLib) {
/*
Author: NR0533 / HB253Y 
Asurion Interface Load File and Partial Approve
ID: BA_Asurion_IIEP_LoadFile_Partial_Approve
*/

// Acknowledgement email template (simplified header, no logo cell)
var ackTemplateVar = `From: AT&T PDH Import <FROM_ADDRESS>
To: RECIPIENT
Subject: Stibo Asurion Import Summary - FILENAME

MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="=_Part_47_121768188.1622637182295"
X-Feedback-ID: ascii:2vfe8K/3Ht8kRxLS+Ar5wQHtwriFoyS9w0uYiWo0Io=:2vfe8K/3Ht8kRxLS+Ar5wQHtwriFoyS9w0uYiWo0Io=:2vfe8K/3Ht8kRxLS+Ar5wQHtwriFoyS9w0uYiWo0Io=
List-Unsubscribe: <mailto:info@att.com?subject=unsubscribe>

--=_Part_47_121768188.1622637182295
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: quoted-printable

Team,

ENV_MESSAGE

The file (FILENAME) was received by ATT on DATE2 and processed in Stibo.

Total File Rows: ROWSREAD

   Updated : UPDATED_COUNT
   Error   : ERROR_COUNT
   Matching: MATCH_COUNT
   STIBOONLY_LABELSTIBOONLY_COUNT

Updated:

UPDATED_DATA

Error:

ERROR_DATA

Matching:

MATCHING_DATA

STIBO_ONLY

************************************************************************************************************************************************************************

Please do not respond to this email. This is an unmanaged inbox. Please reach out to production support for any concerns or questions: PROD_EMAIL

************************************************************************************************************************************************************************

Important: This email is intended for the above named recepients only and may be confidential, proprietary and/or legally privileged. If this email has come to you in error you must take no action based on it, nor may you copy or show it to anyone. Please contact the sender and delete the material from any computer.
--=_Part_47_121768188.1622637182295
Content-Type: text/html; charset=UTF-8
Content-Transfer-Encoding: quoted-printable

<html>
<head>
  <meta content="text/html; charset=UTF-8" http-equiv="Content-Type">
  <style type="text/css">
    .HeaderText { color: #003D74; font-size: 12pt; font-style: italic; text-align: right; }
    .MessageCell { color: #003D74; font-size: 11pt; }
    .Terminator { font-size: 9pt; color: #B4B2A9; text-align: center; }
    .BorderTop { background: #B4B2A9; height: 10px; }
    .BorderRight { background: #B4B2A9; width: 10px; }
    .BorderBottom { background: #B4B2A9; height: 10px; }
    .BorderLeft { background: #B4B2A9; width: 10px; }
    .TableClass { border: 1px solid #003D74; }
  </style>  
</head>
<body>
  <table class="TableClass" width="80%" cellspacing="0" cellpadding="0">
    <tr class="BorderTop"><td colspan="3">&nbsp;</td></tr>
    <tr>
      <td class="BorderLeft">&nbsp;</td>
      <td><div class="HeaderText">Asurion File Acknowledgement</div></td>
      <td class="BorderRight">&nbsp;</td>
    </tr>
    <tr>
      <td class="BorderLeft">&nbsp;</td>
      <td>
        <table width="100%" cellspacing="0" cellpadding="2">
          <tr>
            <td class="MessageCell">
              <br />Team,<br /><br />
              ENV_MESSAGE
              <br />The file (FILENAME) was received by ATT on DATE2 and processed in Stibo.<br /><br />
              Total File Rows: ROWSREAD<br /><br />
              &nbsp;&nbsp;&nbsp; Updated : UPDATED_COUNT<br />
              &nbsp;&nbsp;&nbsp; Error   : ERROR_COUNT<br />
              &nbsp;&nbsp;&nbsp; Matching: MATCH_COUNT<br />
              &nbsp;&nbsp;&nbsp; STIBOONLY_LABELSTIBOONLY_COUNT<br /><br />
              Updated:<br /><br />
              UPDATED_DATA
              <br />Error:<br /><br />
              ERROR_DATA
              <br />Matching:<br /><br />
              MATCHING_DATA
              <br />STIBO_ONLY
              <br />************************************************************************************************************************************************************************<br />
              <br />Please do not respond to this email. This is an unmanaged inbox. Please reach out to production support for any concerns or questions: PROD_EMAIL<br />
              <br />************************************************************************************************************************************************************************<br />
              <br />Important: This email is intended for the above named recepients only and may be confidential, proprietary and/or legally privileged. If this email has come to you in error you must take no action based on it, nor may you copy or show it to anyone. Please contact the sender and delete the material from any computer.
            </td>
          </tr>
        </table>
      </td>
      <td class="BorderRight">&nbsp;</td>
    </tr>
    <tr class="BorderBottom"><td colspan="3">&nbsp;</td></tr>
    <tr>
      <td>&nbsp;</td>
      <td class="Terminator">Do Not Reply</td>
      <td>&nbsp;</td>
    </tr>
  </table>
</body>
</html>`;

// Exception email template (simplified header)
var exceptionTemplateVar = `From: FROM_ADDRESS
To: RECIPIENT
Subject: Stibo Asurion Import Summary - FILENAME

MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="=_Part_47_121768188.1622637182296"
X-Feedback-ID: ascii:2vfe8K/3Ht8kRxLS+Ar5wQHtwriFoyS9w0uYiWo0Io=:2vfe8K/3Ht8kRxLS+Ar5wQHtwriFoyS9w0uYiWo0Io=:2vfe8K/3Ht8kRxLS+Ar5wQHtwriFoyS9w0uYiWo0Io=
List-Unsubscribe: <mailto:info@att.com?subject=unsubscribe>

--=_Part_47_121768188.1622637182296
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: quoted-printable

Team,

ENV_MESSAGE

EXCEPTION_MESSAGE

DATE1

************************************************************************************************************************************************************************

Please do not respond to this email. This is an unmanaged inbox. Please reach out to production support for any concerns or questions: PROD_EMAIL

************************************************************************************************************************************************************************

Important: This email is intended for the above named recepients only and may be confidential, proprietary and/or legally privileged. If this email has come to you in error you must take no action based on it, nor may you copy or show it to anyone. Please contact the sender and delete the material from any computer.
--=_Part_47_121768188.1622637182296
Content-Type: text/html; charset=UTF-8
Content-Transfer-Encoding: quoted-printable

<html>
<head>
  <meta content="text/html; charset=UTF-8" http-equiv="Content-Type">
  <style type="text/css">
    .HeaderText { color: #003D74; font-size: 12pt; font-style: italic; text-align: right; }
    .MessageCell { color: #003D74; font-size: 11pt; }
    .Terminator { font-size: 9pt; color: #B4B2A9; text-align: center; }
    .BorderTop { background: #B4B2A9; height: 10px; }
    .BorderRight { background: #B4B2A9; width: 10px; }
    .BorderBottom { background: #B4B2A9; height: 10px; }
    .BorderLeft { background: #B4B2A9; width: 10px; }
    .TableClass { border: 1px solid #003D74; }
  </style>
</head>
<body>
  <table class="TableClass" width="80%" cellspacing="0" cellpadding="0">
    <tr class="BorderTop"><td colspan="3">&nbsp;</td></tr>
    <tr>
      <td class="BorderLeft">&nbsp;</td>
      <td><div class="HeaderText">Asurion File Exception</div></td>
      <td class="BorderRight">&nbsp;</td>
    </tr>
    <tr>
      <td class="BorderLeft">&nbsp;</td>
      <td>
        <table width="100%" cellspacing="0" cellpadding="2">
          <tr>
            <td class="MessageCell">
              <br />Team,<br /><br />
              ENV_MESSAGE
              <br />EXCEPTION_MESSAGE<br /><br />
              DATE1
              <br />************************************************************************************************************************************************************************<br />
              <br />Please do not respond to this email. This is an unmanaged inbox. Please reach out to production support for any concerns or questions: PROD_EMAIL<br />
              <br />************************************************************************************************************************************************************************<br />
              <br />Important: This email is intended for the above named recepients only and may be confidential, proprietary and/or legally privileged. If this email has come to you in error you must take no action based on it, nor may you copy or show it to anyone. Please contact the sender and delete the material from any computer.
            </td>
          </tr>
        </table>
      </td>
      <td class="BorderRight">&nbsp;</td>
    </tr>
    <tr class="BorderBottom"><td colspan="3">&nbsp;</td></tr>
    <tr>
      <td>&nbsp;</td>
      <td class="Terminator">Do Not Reply</td>
      <td>&nbsp;</td>
    </tr>
  </table>
</body>
</html>`;


// Setup execution log helpers
function setupExecutionLogHelpers() {
  var hasExecutionLogger = (typeof executionReportLogger !== "undefined" && executionReportLogger);
  function info(message) { hasExecutionLogger && executionReportLogger.logInfo(message); }
  function warn(message) { hasExecutionLogger && executionReportLogger.logWarning(message); }
  return { info, warn, hasExecutionLogger };
}

// Load configuration (business values from lookup) and assign templates from variables
function loadLookupConfig(info, warn) {
  if (typeof lookupTableHome === "undefined" || !lookupTableHome) {
    warn("lookupTableHome not available in this context. Stopping.");
    return null;
  }
  function requireLookup(key) {
    try {
      var value = lookupTableHome.getLookupTableValue("LT_Asurion_Values", key);
      if (!value) warn("Missing lookup value for key: " + key);
      return value;
    } catch (e) {
      warn("Lookup failed for key " + key + ": " + e);
      return "";
    }
  }
  var config = {
    keyDefinitionId: requireLookup("itemKey"),
    attrLegacyTierId: requireLookup("legacyTier"),
    attrNewTierId: requireLookup("newTier"),
    prefix: requireLookup("prefix"),
    toAddress: requireLookup("email"),
    toName: requireLookup("stiboNotif"),
    subject: requireLookup("emailSubject"),
    fromAddress: requireLookup("fromAddress"),
    prodEmail: requireLookup("prodEmail"),
    envMessage: requireLookup("envMessage"),
    maxEmailChars: parseInt(requireLookup("htmlSizeCap"), 10),
    maxDataChars: 8000
    //crossRefTypeId: requireLookup("crossRefType"),
    //crossAttrId: requireLookup("crossAttr")
  };
  config.ackTemplate = ackTemplateVar;
  config.exceptionTemplate = exceptionTemplateVar;
  return config;
}

// Utilities
function utilGetLines(javaOrJsString) {
  var text = "" + javaOrJsString;
  var rawLines = text.split(/\r\n|\r|\n/);
  var linesOut = [];
  for (var i = 0; i < rawLines.length; i++) {
    if (rawLines[i] != null && String(rawLines[i]).trim().length) linesOut.push(rawLines[i]);
  }
  return linesOut;
}

function utilDetectDelimiter(headerLine) {
  var commaCount = (headerLine.match(/,/g) || []).length;
  var pipeCount = (headerLine.match(/\|/g) || []).length;
  return (pipeCount > commaCount) ? "|" : ",";
}

function utilSplitCells(line, delimiter) {
  var parts = line.split(delimiter);
  for (var i = 0; i < parts.length; i++) parts[i] = (parts[i] || "").trim();
  return parts;
}

function utilToIntOrNull(value) {
  try {
    if (!value) return null;
    var trimmed = String(value).trim();
    if (!trimmed) return null;
    return parseInt(trimmed);
  } catch (e) { return null; }
}

function utilEscHtml(text) {
  return (!text ? "" : String(text))
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function utilMail(html, subject, config) {
  if (html.length > config.maxEmailChars) html = html.substring(0, config.maxEmailChars) + "...";
  var message = mailHome.mail();

  var toList = String(config.toAddress || "");
  var parts = toList.split(","); // comma-separated
  for (var i = 0; i < parts.length; i++) {
    var email = parts[i].trim();
    if (!email) continue;
    message.addTo(email, config.toName || "");
  }

  message
    .subject(subject)
    .htmlMessage(html)
    .send();
}


function utilFindProductByKey(stepManager, keyDefinitionId, keyValue) {
  try { return stepManager.getNodeHome().getObjectByKey(keyDefinitionId, keyValue); }
  catch (e) { return null; }
}

// Revision helpers
function revNameToInts(name) {
  try {
    var segments = String(name).split(/[^0-9]+/).filter(function (x) { return x.length > 0; });
    if (!segments.length) return null;
    var out = [];
    for (var i = 0; i < segments.length; i++) out.push(segments[i]);
    return out;
  } catch (e) { return null; }
}

function compareRevNamesDesc(leftName, rightName) {
  if (!leftName && !rightName) return 0;
  if (!leftName) return 1;
  if (!rightName) return -1;
  var leftInts = revNameToInts(leftName), rightInts = revNameToInts(rightName);
  if (leftInts && rightInts) {
    var length = Math.max(leftInts.length, rightInts.length);
    for (var i = 0; i < length; i++) {
      var leftVal = (i < leftInts.length ? leftInts[i] : 0);
      var rightVal = (i < rightInts.length ? rightInts[i] : 0);
      if (leftVal !== rightVal) return (rightVal - leftVal);
    }
    return String(rightName).localeCompare(String(leftName));
  }
  return String(rightName).localeCompare(String(leftName));
}

function getLatestRevision(product) {
  try {
    var revisions = product.getRevisions();
    if (!revisions) return null;
    var arrayOfRevisions = revisions.toArray();
    if (!arrayOfRevisions || !arrayOfRevisions.length) return null;
    java.util.Arrays.sort(arrayOfRevisions, new java.util.Comparator({
      compare: function (a, b) { return compareRevNamesDesc(String(a.getName()), String(b.getName())); }
    }));
    return arrayOfRevisions[0];
  } catch (e) { return null; }
}

function getAttrFromRevision(info, revisionNode, attributeId) {
  try {
    var valueRaw = revisionNode.getValue(attributeId);
    var value = (valueRaw ? String(valueRaw.getLOVValue().getID()) : "");
    if (value && value !== "null") return value;
    return "";
  } catch (e) { 
  info("Exception in getAttrFromRevision ");
  return ""; }
}

function setAttr(product, attributeId, value, warn) {
  try {
    product.getValue(attributeId).setLOVValueByID(value);
    return true;
  } catch (e) {
    if (e.javaException instanceof com.stibo.core.domain.ValidatorException) {
      warn("Validator rejected " + attributeId + "='" + value + "' on " +
        product.getID() + ": " + e.javaException.getMessage());
      return false;
    }
    warn("Set failed for " + attributeId + " on " + (product.getID ? product.getID() : "?") + ": " + e);
    return false;
  }
}


// Template helpers
function applyTemplate(template, map) {
  var out = String(template);
  for (var key in map) {
    if (!map.hasOwnProperty(key)) continue;
    var val = map[key] == null ? "" : String(map[key]);
    out = out.split(key).join(val);
  }
  return out;
}

function extractSubjectAndHtml(mimeText) {
  var subjectMatch = mimeText.match(/^Subject:\s*(.+)$/m);
  var subject = subjectMatch ? subjectMatch[1].trim() : null;
  var htmlBody = "";
  var htmlHeaderRegex = /Content-Type:\s*text\/html[\s\S]*?\r?\n\r?\n/;
  var start = mimeText.search(htmlHeaderRegex);
  if (start >= 0) {
    var afterHeader = mimeText.slice(start);
    var bodyMatch = afterHeader.match(/Content-Type:\s*text\/html[\s\S]*?\r?\n\r?\n([\s\S]*?)(?:\r?\n--[-_A-Za-z0-9]+|$)/);
    if (bodyMatch) htmlBody = bodyMatch[1].trim();
  }
  return { subject: subject, html: htmlBody };
}

function sendEmailFromMimeTemplate(mimeTemplate, replacements, defaultSubject, config) {
  // Apply replacements across the template, then extract subject & HTML.
  var filled = applyTemplate(mimeTemplate, replacements);
  var parts = extractSubjectAndHtml(filled);
  var subjectRaw = parts.subject || defaultSubject || config.subject;
  var subjectToUse = applyTemplate(subjectRaw, replacements);
  var htmlBody = (parts.html && parts.html.length) ? parts.html : filled;
  utilMail(htmlBody, subjectToUse, config);
}

// Main processing logic (parsing, validation, updates, PDH Only, email)
function processAsurionFile(stepManager, config, info, warn) {

  var payload = inboundMessage.getMessage();
  var fileName = "Unknown File";

  // Early filename extraction (before short-line validation)
  var payloadStringEarly = String(payload || "");
  var linesEarly = utilGetLines(payloadStringEarly);
  if (linesEarly && linesEarly.length) {
    var lastLineEarly = linesEarly[linesEarly.length - 1];
    var firstTokenEarly = String(lastLineEarly).split(/[,|]/)[0].trim();
    if (firstTokenEarly && firstTokenEarly !== 'D' && firstTokenEarly !== 'T') {
      fileName = firstTokenEarly;
      if (typeof info === "function") {
        info("Inbound Filename : " + fileName);
      }
    }
  }

  // --- Stibo Query: Retail Items with Insurance Tiers Populated ---
  // Only run this query if the filename does NOT contain '_OD_'
  if (fileName.indexOf('_OD_') === -1) {
    try {
      var c = com.stibo.query.condition.Conditions;
      var queryHome = stepManager.getHome(com.stibo.query.home.QueryHome);
      var itemType = stepManager.getObjectTypeHome().getObjectTypeByID("Item");
      var attrLOB = stepManager.getAttributeHome().getAttributeByID("Line_Of_Business");
      var attrInsTier = stepManager.getAttributeHome().getAttributeByID("Insurance_Tier");
      var attrLegacyInsTier = stepManager.getAttributeHome().getAttributeByID("Legacy_Insurance_Tier");

      // Removed [DEBUG] log lines for production

      // Query for all retail items (LOB = Retail)
      var querySpec = queryHome.queryFor(com.stibo.core.domain.Product)
        .where(
          c.objectType(itemType)
          .and(c.valueOf(attrLOB).eq("Retail"))
        );

      var results = querySpec.execute().asList(5000); // Query up to 5000

      // Removed [DEBUG] log lines for production

      // Filter for items with Insurance_Tier or Legacy_Insurance_Tier populated, restrict to 1000 max
      var filtered = [];
      var filteredLimit = 1000;
      for (var i = 0; i < results.size() && filtered.length < filteredLimit; i++) {
        var item = results.get(i);
        var insTier = item.getValue("Insurance_Tier").getSimpleValue();
        var legacyInsTier = item.getValue("Legacy_Insurance_Tier").getSimpleValue();
        var itemNumberStibo = item.getValue("Item_Num").getSimpleValue();

        if ((insTier && String(insTier).trim() !== "") || (legacyInsTier && String(legacyInsTier).trim() !== "")) {
          filtered.push({
            id: item.getID(),
            insTier: insTier,
            legacyInsTier: legacyInsTier
          });
        }
      }

      // Print the count and list ONLY in the log using info()
      /*
      // Debug: Retail Items with Insurance Tiers Populated
      if (typeof info === "function") {
        info("==== Retail Items with Insurance Tiers Populated ====");
        info("Total count (max 1000): " + filtered.length);
        for (var j = 0; j < filtered.length; j++) {
          var f = filtered[j];
          info("Item: " + f.id + " | Insurance_Tier: " + f.insTier + " | Legacy_Insurance_Tier: " + f.legacyInsTier);
        }
        if (filtered.length === filteredLimit) {
          info("[DEBUG] Output truncated at 1000 items. There may be more matching items.");
        }
        info("==== End of Retail Insurance Tier List ====");
      }
      */
    } catch (e) {
      if (typeof warn === "function") {
        warn("Error running retail insurance tier query: " + e);
      }
    }
  } else {
    // Removed [DEBUG] log line for production
  }

  //Check if the payload is empty.
  if (!payload || !String(payload).trim()) {
    var receivedDateEmpty = (function () {
      try {
        var localDateTime = java.time.LocalDateTime;
        var dateTimeFormatter = java.time.format.DateTimeFormatter;
        return String(localDateTime.now().format(dateTimeFormatter.ofPattern("MM/dd/yy HH:mm:ss")));
      } catch (e) { return String(java.time.LocalDateTime.now().toString()); }
    })();
    sendEmailFromMimeTemplate(
      config.exceptionTemplate,
      {
        DATE1: receivedDateEmpty,
        DATE2: receivedDateEmpty,
        RECIPIENT: config.toAddress,
        FROM_ADDRESS: config.fromAddress,
        PROD_EMAIL: config.prodEmail,
        ENV_MESSAGE: config.envMessage || "",
  EXCEPTION_MESSAGE: "Asurion file " + utilEscHtml(fileName) + " error during processing. Inbound message is empty",
  FILENAME: fileName
      },
      config.subject + " — Errored",
      config
    );
    warn("Inbound message is empty.");
    return;
  }
  var payloadString = String(payload);
  var linesRaw = utilGetLines(payloadString);
  // Remove blank lines for robust trailer detection
  var lines = [];
  for (var i = 0; i < linesRaw.length; i++) {
    if (linesRaw[i] != null && String(linesRaw[i]).trim().length) lines.push(linesRaw[i]);
  }
  // Early filename extraction (before short-line validation) now handled at the top
  if (lines.length < 2) {
    var receivedDateShort = (function () {
      try {
        var localDateTime = java.time.LocalDateTime;
        var dateTimeFormatter = java.time.format.DateTimeFormatter;
        return String(localDateTime.now().format(dateTimeFormatter.ofPattern("MM/dd/yy HH:mm:ss")));
      } catch (e) { return String(java.time.LocalDateTime.now().toString()); }
    })();
    sendEmailFromMimeTemplate(
      config.exceptionTemplate,
      {
        DATE1: receivedDateShort,
        DATE2: receivedDateShort,
        RECIPIENT: config.toAddress,
        FROM_ADDRESS: config.fromAddress,
        PROD_EMAIL: config.prodEmail,
        ENV_MESSAGE: config.envMessage || "",
        EXCEPTION_MESSAGE: "Asurion file " + utilEscHtml(fileName) + " errored during processing. No data rows detected",
        FILENAME: fileName
      },
      config.subject + " — Errored",
      config
    );
    warn("No data rows detected (lines=" + lines.length + ").");
    return;
  }
  var header = lines[0];
  // Enhanced: flexibly split header using multiple possible delimiters
  var headerCells = header.split(/[|,\t_ ]+/);
  for (var i = 0; i < headerCells.length; i++) headerCells[i] = (headerCells[i] || "").trim();
  // Data delimiter detection and splitting for data rows remains unchanged
  var delimiter = utilDetectDelimiter(header);
  var errors = [];
  if (headerCells[0] !== "H") {
    errors.push({
      sku: "(Header)",
      reason: "First line TYPE must be 'H'. Found: '" + utilEscHtml(headerCells[0]) + "'",
      lineNo: 1
    });
  }
  // Filename already extracted early; skip re-extraction here.
  var details = [];
  var lastTrailer = null;
  var lastTrailerRaw = null;
  var sawTrailer = false;
  var dCount = 0;
  var tCount = 0;
  // Robust trailer detection: always check penultimate non-blank line
  var penultimateIdx = lines.length - 2;
  for (var i = 1; i < lines.length; i++) {
    var cells = utilSplitCells(lines[i], delimiter);
    if (!cells.length) continue;
    var recordType = (cells[0] || "");
    // If this is the penultimate non-blank line, expect 'T' as first character
    if (i === penultimateIdx) {
      var firstChar = (lines[i] && lines[i].length) ? lines[i].trim().charAt(0) : "";
      if (firstChar === "T") {
        tCount++;
        sawTrailer = true;
        // Try to extract trailer count regardless of delimiter
        var trailerParts = lines[i].split(/[,|\t_ ]+/);
        if (trailerParts.length > 1 && trailerParts[1]) lastTrailerRaw = trailerParts[1].trim();
        var count = utilToIntOrNull(trailerParts.length > 1 ? trailerParts[1] : null);
        if (count == null) {
          for (var k = trailerParts.length - 1; k >= 1 && count == null; k--) {
            if (!lastTrailerRaw && trailerParts[k]) lastTrailerRaw = trailerParts[k].trim();
            count = utilToIntOrNull(trailerParts[k]);
          }
        }
        lastTrailer = count;
      } else {
        errors.push({
          sku: (cells[1] || "(Unknown SKU)"),
          reason: "Penultimate line must be TYPE 'T' (trailer). Found: '" + utilEscHtml(recordType) + "' at line " + (i + 1),
          lineNo: (i + 1)
        });
      }
      continue;
    }
    // For all lines between header and trailer, expect 'D'
    if (recordType === "D") {
      dCount++;
      var sku = (cells[1] || "").trim();
      var legacy = (cells[2] || "").trim();
      var newer = (cells[3] || "").trim();
      var missingFields = [];
      if (!sku) missingFields.push("SKU");
      if (!legacy) missingFields.push("Legacy Tier");
      if (!newer) missingFields.push("New Tier");
      if (missingFields.length > 0) {
        warn("Skipping D row with missing field(s) at line " + (i + 1) + ": " + missingFields.join(", "));
        details.push({ sku: sku, legacy: legacy, newer: newer, lineNo: (i + 1), _missing: true, _missingFields: missingFields });
        continue;
      }
      details.push({ sku: sku, legacy: legacy, newer: newer, lineNo: (i + 1) });
      continue;
    } else {
      errors.push({
        sku: (cells[1] || "(Unknown SKU)"),
        reason: "Expected TYPE 'D' between header and trailer, found: '" + utilEscHtml(recordType) + "' at line " + (i + 1),
        lineNo: (i + 1)
      });
    }
  }
  // Check for at least one D record
  if (dCount === 0) {
    errors.push({
      sku: "(N/A)",
      reason: "No 'D' TYPE (detail) records found in file.",
      lineNo: "-"
    });
  }
  // Check for exactly one T record, and only at the last line
  if (!sawTrailer) {
    errors.push({
      sku: "(N/A)",
      reason: "No 'T' TYPE (trailer) record found in file.",
      lineNo: "-"
    });
  }
  if (tCount > 1) {
    errors.push({
      sku: "(N/A)",
      reason: "Multiple 'T' TYPE (trailer) records found in file.",
      lineNo: "-"
    });
  }

  var receivedDate = (function () {
    try {
      var localDateTime = java.time.LocalDateTime;
      var dateTimeFormatter = java.time.format.DateTimeFormatter;
      return String(localDateTime.now().format(dateTimeFormatter.ofPattern("MM/dd/yy HH:mm:ss")));
    } catch (e) { return String(java.time.LocalDateTime.now().toString()); }
  })();
  if (!sawTrailer) {
    sendEmailFromMimeTemplate(
      config.exceptionTemplate,
      {
        DATE1: receivedDate,
        DATE2: receivedDate,
        RECIPIENT: config.toAddress,
        FROM_ADDRESS: config.fromAddress,
        PROD_EMAIL: config.prodEmail,
        ENV_MESSAGE: config.envMessage || "",
  EXCEPTION_MESSAGE: "Asurion file " + utilEscHtml(fileName) + " errored during processing. Trailer Record Missing",
  FILENAME: fileName
      },
      config.subject + " — Errored",
      config
    );
    return;
  }
  if (lastTrailer == null || typeof lastTrailer !== "number" || isNaN(lastTrailer)) {
    var trailerValue = (lastTrailerRaw !== null && lastTrailerRaw !== undefined) ? lastTrailerRaw : "(missing)";
    sendEmailFromMimeTemplate(
      config.exceptionTemplate,
      {
        DATE1: receivedDate,
        DATE2: receivedDate,
        RECIPIENT: config.toAddress,
        FROM_ADDRESS: config.fromAddress,
        PROD_EMAIL: config.prodEmail,
        ENV_MESSAGE: config.envMessage || "",
        EXCEPTION_MESSAGE: "Asurion file " + utilEscHtml(fileName) + " errored during processing. Trailer count was not numeric. Found value: '" + utilEscHtml(trailerValue) + "'",
        FILENAME: fileName
      },
      config.subject + " — Errored",
      config
    );
    return;
  }
  if (details.length !== lastTrailer) {
    var trailerValue2 = (lastTrailerRaw !== null && lastTrailerRaw !== undefined) ? lastTrailerRaw : lastTrailer;
    sendEmailFromMimeTemplate(
      config.exceptionTemplate,
      {
        DATE1: receivedDate,
        DATE2: receivedDate,
        RECIPIENT: config.toAddress,
        FROM_ADDRESS: config.fromAddress,
        PROD_EMAIL: config.prodEmail,
        ENV_MESSAGE: config.envMessage || "",
        EXCEPTION_MESSAGE: "Asurion feed detail count of " + details.length + " does not match trailer count of '" + utilEscHtml(trailerValue2) + "' for " + utilEscHtml(fileName),
        FILENAME: fileName
      },
      config.subject + " — Errored",
      config
    );
    return;
  }
  var updated = [];
  var matching = [];
  var errors = [];
  var notFound = 0;
  for (var j = 0; j < details.length; j++) {
    var row = details[j];
    if (row._missing) {
      var missingMsg = "Missing required field" + (row._missingFields && row._missingFields.length > 1 ? "s" : "") + ": ";
      missingMsg += row._missingFields ? row._missingFields.join(", ") : "Unknown";
      errors.push({
        sku: row.sku || "(Missing SKU)",
        reason: missingMsg,
        lineNo: row.lineNo
      });
      continue;
    }
    var itemKeyValue = config.prefix + row.sku;
    var productNode = utilFindProductByKey(stepManager, config.keyDefinitionId, itemKeyValue);
    if (!productNode) {
      warn("Product not found by key " + config.keyDefinitionId + "='" + itemKeyValue + "'.");
      errors.push({
        sku: row.sku,
        reason: "Product not found (Item.Key=" + itemKeyValue + ")",
        lineNo: row.lineNo
      });
      notFound++;
      continue;
    }
    var latestRevision = getLatestRevision(productNode);
    var revisionName = latestRevision ? String(latestRevision.getName()) : "(no revisions)";
    var revisionNode = latestRevision ? latestRevision.getNode() : null;
    var oldLegacy = revisionNode ? getAttrFromRevision(info, revisionNode, config.attrLegacyTierId) : "";
    var oldTier = revisionNode ? getAttrFromRevision(info, revisionNode, config.attrNewTierId) : "";
    if (!oldLegacy) { try { oldLegacy = String(productNode.getValue(config.attrLegacyTierId).getLOVValue() || ""); } catch (eLegacy) { oldLegacy = ""; } }
    if (!oldTier) { try { oldTier = String(productNode.getValue(config.attrNewTierId).getLOVValue() || ""); } catch (eTier) { oldTier = ""; } }
    if (revisionName === "(no revisions)" && (oldLegacy || oldTier)) revisionName = "(current)";
    var valuesAreSame = (String(oldLegacy) === String(row.legacy)) && (String(oldTier) === String(row.newer));
    if (valuesAreSame) {
      matching.push({
        sku: itemKeyValue, version: revisionName,
        oldLegacy: oldLegacy, newLegacy: row.legacy,
        oldTier: oldTier, newTier: row.newer
      });
      continue;
    }
    var legacySetOk = setAttr(productNode, config.attrLegacyTierId, row.legacy, warn);
    var newTierSetOk = setAttr(productNode, config.attrNewTierId, row.newer, warn);
    if (legacySetOk && newTierSetOk) {
      var partailAprovalList = commonLib.getAttributeGroupList(productNode, stepManager, "AG_Asurion_Inbound");
      commonLib.partialApproveFields(productNode, partailAprovalList);
      updated.push({
        sku: itemKeyValue, version: revisionName,
        oldLegacy: oldLegacy, newLegacy: row.legacy,
        oldTier: oldTier, newTier: row.newer
      });
    } else {
      var errorMsg = "Validator rejected values (";
      if (!legacySetOk && !newTierSetOk) {
        errorMsg += "Legacy=" + row.legacy + ", New=" + row.newer;
      } else if (!legacySetOk) {
        errorMsg += "Legacy=" + row.legacy;
      } else if (!newTierSetOk) {
        errorMsg += "New=" + row.newer;
      }
      errorMsg += ")";
      errors.push({
        sku: row.sku,
        reason: errorMsg,
        lineNo: row.lineNo
      });
    }
  }
  var stiboOnly = [];
  var stiboOnlyLabel = "";
  var stiboOnlyCount = "";

  // --- Stibo Only Logic: Find SKUs in Stibo not present in Asurion file ---
  // Build a Set of all Asurion file item numbers (with prefix)
  var asurionSkuSet = {};
  for (var i = 0; i < details.length; i++) {
    var row = details[i];
    if (row && row.sku) {
      asurionSkuSet[config.prefix + row.sku] = true;
    }
  }

  // Query all retail items with Insurance Tiers populated (reuse earlier query logic if available)
  // For each, compare config.prefix + row.sku to itemNumberStibo directly
  if (typeof stepManager !== "undefined" && stepManager) {
    try {
      var c = com.stibo.query.condition.Conditions;
      var queryHome = stepManager.getHome(com.stibo.query.home.QueryHome);
      var itemType = stepManager.getObjectTypeHome().getObjectTypeByID("Item");
      var attrLOB = stepManager.getAttributeHome().getAttributeByID("Line_Of_Business");
      var attrInsTier = stepManager.getAttributeHome().getAttributeByID("Insurance_Tier");
      var attrLegacyInsTier = stepManager.getAttributeHome().getAttributeByID("Legacy_Insurance_Tier");
      var attrItemNum = stepManager.getAttributeHome().getAttributeByID("Item_Num");

      var querySpec = queryHome.queryFor(com.stibo.core.domain.Product)
        .where(
          c.objectType(itemType)
          .and(c.valueOf(attrLOB).eq("Retail"))
        );
      var results = querySpec.execute().asList(5000);
      for (var i = 0; i < results.size(); i++) {
        var item = results.get(i);
        var itemNumberStibo = item.getValue("Item_Num").getSimpleValue();
        var insTier = item.getValue("Insurance_Tier").getSimpleValue();
        var legacyInsTier = item.getValue("Legacy_Insurance_Tier").getSimpleValue();
        // Only consider if Insurance_Tier or Legacy_Insurance_Tier is populated
        if ((insTier && String(insTier).trim() !== "") || (legacyInsTier && String(legacyInsTier).trim() !== "")) {
          // Compare config.prefix + row.sku to itemNumberStibo directly
          if (!asurionSkuSet[itemNumberStibo]) {
            stiboOnly.push({
              sku: itemNumberStibo,
              legacy: legacyInsTier,
              current: insTier
            });
          }
        }
      }
      stiboOnlyCount = stiboOnly.length;
      stiboOnlyLabel = stiboOnlyCount > 0 ? "Stibo Only:" : "";
    } catch (e) {
      if (typeof warn === "function") warn("Error in Stibo Only logic: " + e);
    }
  }

  var updatedData = "";
  if (updated.length > 0) {
    var updatedTable = "<table><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;SKU</td><td>&nbsp;&nbsp;&nbsp;&nbsp;Old Legacy Tier</td><td>&nbsp;&nbsp;&nbsp;&nbsp;New Legacy Tier</td><td>&nbsp;&nbsp;&nbsp;&nbsp;Old Tier</td><td>&nbsp;&nbsp;&nbsp;&nbsp;New Tier</td></tr>";
    updated.sort(function (a, b) { return String(a.sku).localeCompare(String(b.sku)); });
    for (var u = 0; u < updated.length; u++) {
      var r = updated[u];
      updatedTable += "<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;" + utilEscHtml(r.sku) +
        "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;" + utilEscHtml(r.oldLegacy) +
        "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;" + utilEscHtml(r.newLegacy) +
        "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;" + utilEscHtml(r.oldTier) +
        "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;" + utilEscHtml(r.newTier) + "</td></tr>\n";
    }
    updatedTable += "</table>";
    updatedData = (updatedTable.length > config.maxDataChars)
      ? "<table><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Number of SKUs exceeded email limitations.  Please contact PDH Production Support at " + utilEscHtml(config.prodEmail) + " for details</td></tr>"
      : updatedTable;
  }
  var errorData = "";
  if (errors.length > 0) {
    var errorTable = "<table><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;SKU</td><td>&nbsp;&nbsp;&nbsp;&nbsp;Error Message</td></tr>";
    errors.sort(function (a, b) { return String(a.sku).localeCompare(String(b.sku)); });
    for (var eIndex = 0; eIndex < errors.length; eIndex++) {
      var er = errors[eIndex];
      errorTable += "<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;" + utilEscHtml(er.sku) +
        "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;" + utilEscHtml(er.reason) + "</td></tr>\n";
    }
    errorTable += "</table>";
    errorData = (errorTable.length > config.maxDataChars)
      ? "<table><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Number of SKUs exceeded email limitations.  Please contact PDH Production Support at " + utilEscHtml(config.prodEmail) + " for details</td></tr>"
      : errorTable;
  }
  var matchingData = "";
  if (matching.length > 0) {
    // Align matching table layout with updated table: show both old and new values for clarity
    var matchingTable = "<table><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;SKU</td><td>&nbsp;&nbsp;&nbsp;&nbsp;Old Legacy Tier</td><td>&nbsp;&nbsp;&nbsp;&nbsp;New Legacy Tier</td><td>&nbsp;&nbsp;&nbsp;&nbsp;Old Tier</td><td>&nbsp;&nbsp;&nbsp;&nbsp;New Tier</td></tr>";
    matching.sort(function (a, b) { return String(a.sku).localeCompare(String(b.sku)); });
    for (var m = 0; m < matching.length; m++) {
      var mr = matching[m];
      matchingTable += "<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;" + utilEscHtml(mr.sku) +
        "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;" + utilEscHtml(mr.oldLegacy) +
        "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;" + utilEscHtml(mr.newLegacy) +
        "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;" + utilEscHtml(mr.oldTier) +
        "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;" + utilEscHtml(mr.newTier) + "</td></tr>\n";
    }
    matchingTable += "</table>";
    matchingData = (matchingTable.length > config.maxDataChars)
      ? "<table><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Number of SKUs exceeded email limitations.  Please contact PDH Production Support at " + utilEscHtml(config.prodEmail) + " for details</td></tr>"
      : matchingTable;
  }
  var stiboOnlyData = "";
  // Only display Stibo Only section if filename does NOT contain '_OD_'
  var showStiboOnly = fileName.indexOf('_OD_') === -1;
  if (showStiboOnly && stiboOnlyCount > 0) {
    var stiboOnlyTable = "<table><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Item Number</td><td>&nbsp;&nbsp;&nbsp;&nbsp;Legacy Tier</td><td>&nbsp;&nbsp;&nbsp;&nbsp;Tier</td></tr>";
    stiboOnly.sort(function (a, b) { return String(a.sku).localeCompare(String(b.sku)); });
    for (var p = 0; p < stiboOnly.length; p++) {
      var pr = stiboOnly[p];
      stiboOnlyTable += "<tr><td>&nbsp;&nbsp;&nbsp;&nbsp;" + utilEscHtml(pr.sku) +
        "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;" + utilEscHtml(pr.legacy) +
        "</td><td>&nbsp;&nbsp;&nbsp;&nbsp;" + utilEscHtml(pr.current) + "</td></tr>\n";
    }
    stiboOnlyTable += "</table>";
    // Styled section header for Stibo Only, matching others (no bold)
    var stiboOnlyHeader = '<span style="color: #003D74; font-size: 11pt;">Stibo Only:</span><br><br>';
    stiboOnlyData = (stiboOnlyTable.length > config.maxDataChars)
      ? stiboOnlyHeader + '<table><tr><td>&nbsp;&nbsp;&nbsp;&nbsp;Number of Item Numbers exceeded email limitations.  Please contact Stibo Production Support at ' + utilEscHtml(config.prodEmail) + ' for details</td></tr>'
      : (stiboOnlyHeader + stiboOnlyTable);
    // Log the Stibo Only list with itemNumberStibo
    if (typeof info === "function") {
      info("\n==== Stibo Only Items (not in Asurion file) ====");
      for (var p = 0; p < stiboOnly.length; p++) {
        var pr = stiboOnly[p];
        info("Item Number: " + pr.sku + " | Legacy Tier: " + pr.legacy + " | Tier: " + pr.current);
      }
      info("==== End of Stibo Only List ====");
    }
  }
  // If not showing Stibo Only, blank out label and count for template
  if (!showStiboOnly) {
    stiboOnlyData = "";
    stiboOnlyLabel = "";
    stiboOnlyCount = "";
  }
  
  var rowsRead = String(details.length);
  var replacements = {
    ROWSREAD: rowsRead,
    RECIPIENT: config.toAddress,
    DATE2: receivedDate,
    FILENAME: fileName,
    UPDATED_COUNT: String(updated.length),
    ERROR_COUNT: String(errors.length),
    MATCH_COUNT: String(matching.length),
    STIBOONLY_COUNT: String(stiboOnlyCount),
    UPDATED_DATA: updatedData || "",
    ERROR_DATA: errorData || "",
    MATCHING_DATA: matchingData || "",
    STIBO_ONLY: stiboOnlyData || "",
    STIBOONLY_LABEL: stiboOnlyLabel || "",
    FROM_ADDRESS: config.fromAddress || "",
    PROD_EMAIL: config.prodEmail || "",
    ENV_MESSAGE: config.envMessage || ""
  };
  sendEmailFromMimeTemplate(config.ackTemplate, replacements, config.subject, config);
}

// Orchestrates execution of all steps
function runAsurionInterface() {
  var logger = setupExecutionLogHelpers();
  var info = logger.info, warn = logger.warn;
  var config = loadLookupConfig(info, warn);
  if (!config) return;
  processAsurionFile(stepManager, config, info, warn);
}

// Execution entry
try {
  runAsurionInterface();
} catch (e) {
  if (typeof executionReportLogger !== "undefined" && executionReportLogger) {
    executionReportLogger.logWarning("Fatal error: " + e);
  } else {
    executionReportLogger.logWarning("Fatal error: " + e);
  }
}
}