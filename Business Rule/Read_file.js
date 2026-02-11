/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "Read_file",
  "type" : "BusinessAction",
  "setupGroups" : [ "ATT_GlobalBusinessAction" ],
  "name" : "Read_file",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : true,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function () {
/**
 * @author - Piyal [CTS]
 * Read File
 */
function readFile() {

	//folderPath ="/shared/upload/outbound/ebs/bpa/archive/";
	folderPath = "/shared/upload/hotfolders/REST/Bpa_IIEP/save"; //failed
	///shared/upload/hotfolders/REST/Bpa_IIEP/BPAResponse_lines_20240116070552.csv'
	var folder = new java.io.File(folderPath);
	var listOfFiles = folder.listFiles();

	for (var i = 0; i < listOfFiles.length; i++) {
		if (listOfFiles[i].isFile()) {
			var fileName = "BPAResponse_headers_20240131111612.csv"
			readLine(fileName, folderPath)
			break;
			//log.info(listOfFiles[i].getName())
		} else if (listOfFiles[i].isDirectory()) {
			log.info("Directory: " + listOfFiles[i].getName());
		}
	}
}

function readLine(file, folderPath) {
	var file = new java.io.File(file);
	var destFile = new java.io.File("/shared/upload/hotfolders/REST/BPA_Supplier_IIEP/SCS_STIBO_SUPPLIER_HDR_20231208012725.csv");
	var fr = new java.io.FileReader(folderPath + "/" + file);
	var br = new java.io.BufferedReader(fr);

	//var fw = new java.io.FileWriter(destFile);
	var line = null;
	while ((line = br.readLine()) != null) {
		log.info(line)
	}
	//fw.flush()
	fr.close();
	//fw.close();
}

readFile();
}