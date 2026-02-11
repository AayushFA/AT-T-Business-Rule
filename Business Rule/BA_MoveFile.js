/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BA_MoveFile",
  "type" : "BusinessAction",
  "setupGroups" : [ "Asset_Import_Actions" ],
  "name" : "Move File",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
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
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (node,step,libAudit) {
/**
 * @author - Piyal [CTS]
 * Move File
 */

function fileCopy(node) {
	var changedAssetName = null;
	var assetName = node.getValue("asset.filename").getSimpleValue();
	assetName = changeExtension(assetName);
	var createdDate = node.getValue("Created_Date").getSimpleValue();
	if(createdDate) {
		libAudit.setDateTime(node, "Last_Updated_DateTime");
	} else {
		libAudit.setDateTime(node, "Created_Date");
	} 
	var index = assetName.indexOf(".");
	assetName = assetName.substring(0, index) + "" + assetName.substring(index + 1);
	var destfolderPath = "/shared/upload/outbound/assets/out/";
	var destFilename = destfolderPath + assetName;
	var destFile = new java.io.File(destFilename);
	var createFile = destFile.createNewFile();
	var fileoutput = new java.io.FileOutputStream(destFilename);
	node.download(fileoutput);
	fileoutput.close();
}

fileCopy(node);
node.approve();

function readFile() {
	var destfolderPath = "/shared/upload/outbound/assets/out/";
	var destfolder = new java.io.File(destfolderPath);
	var listOfFiles = destfolder.listFiles();

	for (var i = 0; i < listOfFiles.length; i++) {
		if (listOfFiles[i].isFile()) {
			var fileName = listOfFiles[i].getName();
		}
	}
}

function changeExtension(assetName) {
	return (assetName);
}
}