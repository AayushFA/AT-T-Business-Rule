/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_PrimaryImageFileNameCheck",
  "type" : "BusinessCondition",
  "setupGroups" : [ "Asset_Import_Conditions" ],
  "name" : "BC_PrimaryImageFileNameCheck",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "Asset user-type root" ],
  "allObjectTypesValid" : true,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessConditionWithBinds",
  "binds" : [ {
    "contract" : "CurrentObjectBindContract",
    "alias" : "asset",
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
    "contract" : "QueryHomeBindContract",
    "alias" : "query",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  } ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
exports.operation0 = function (asset,step,query) {
/**
 * @author - Piyal [CTS]
 * Check the Image Type & Name format
 */

log.info("PrimImageFNChk: Asset type" + asset.getMimeType());
var assetMimeType = asset.getMimeType();
if (assetMimeType != "image/jpg" && assetMimeType != "image/jpeg" && assetMimeType != "image/JPG" && assetMimeType != "image/JPEG" && assetMimeType != "image/Jpeg") {
  return "Please upload an asset with jpg or jpeg extension type.";
}
var c = com.stibo.query.condition.Conditions;
var assetName = asset.getName() + "";
var attrItemNum = step.getAttributeHome().getAttributeByID("Item_Num");
var token = assetName.split(".");
if (token.length > 2) {
  return "Please upload an asset without extension in the file name. ";
} else if (token.length == 2) {
  var itemNo = token[0] + "." + token[1];
  var querySpecification = query.queryFor(com.stibo.core.domain.Product).where(
    c.valueOf(attrItemNum).eq(itemNo)
  );
  var queryResult = querySpecification.execute().asList(1);
  if (queryResult.size() == 0) {
    return "There is no item with item number" + itemNo + ". Image could not be uploaded";
  } else
    return true;
} else if (token.length == 1) {
  return "There is no item with item number" + itemNo + ".Image could not be uploaded";
}
return true;
}