/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "Supplier_Data_Migration",
  "type" : "BusinessAction",
  "setupGroups" : [ "Supplier_BA" ],
  "name" : "Supplier Data Migration",
  "description" : null,
  "scope" : "Global",
  "validObjectTypes" : [ "BPA_Supplier", "Supplier_Site" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : true,
  "onApprove" : "Never",
  "dependencies" : [ {
    "libraryId" : "AT&T_BPA_Library",
    "libraryAlias" : "bpaLib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessActionWithBinds",
  "binds" : [ {
    "contract" : "LookupTableHomeBindContract",
    "alias" : "lookuptable",
    "parameterClass" : "null",
    "value" : null,
    "description" : null
  }, {
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
exports.operation0 = function (lookuptable,node,step,bpaLib) {
var nodeType = node.getObjectType().getID();
var mappingKey = "";
if (nodeType == "Supplier_Site") {
  mappingKey = "SupplierSite";
} else if (nodeType == "BPA_Supplier") {
  mappingKey = "Supplier";
}
var newAttributeIDs = [];
if (mappingKey) {
  var mappingString = lookuptable.getLookupTableValue("Supplier_Migration_Mapping", mappingKey);
  if (mappingString) {
    var mappings = mappingString.split(";");
    mappings.forEach(function (mapping) {
      var parts = mapping.split("\\|");
      if (parts.length == 2) {
        var oldAttrID = parts[0].trim();
        var newAttrID = parts[1].trim();
        newAttributeIDs.push(newAttrID);
        try {
          var haslov = step.getAttributeHome().getAttributeByID(oldAttrID).hasLOV();
          if (haslov) {
            if (oldAttrID == "sup_state") {
              var oldAttrValue = node.getValue(oldAttrID).getValue();
              if (oldAttrValue) {
                try {
                  var newAttr = node.getValue(newAttrID).setSimpleValue(oldAttrValue);
                } catch (e) {
                  throw (e);
                }
              }
            } else {
              var oldAttrValue = node.getValue(oldAttrID).getID();
              if (oldAttrValue) {
                try {
                  var newAttr = node.getValue(newAttrID).setSimpleValue(oldAttrValue);
                } catch (e) {
                  throw (e);
                }
              }
            }
          } else {
            var oldAttrValue = node.getValue(oldAttrID).getSimpleValue();
            if (oldAttrValue) {
              var newValue = oldAttrValue;
              var newattr = node.getValue(newAttrID).setSimpleValue(newValue);
            }
          }
        } catch (e) {
          throw (e);
        }
      }

    });
  }
}
if (newAttributeIDs.length > 0) {
  bpaLib.partialApproveFields(node, newAttributeIDs);
}
}