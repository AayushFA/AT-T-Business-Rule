/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BC_LCF_Network_PMT",
  "type" : "BusinessCondition",
  "setupGroups" : [ "ATT_Item_LCF_Conditions" ],
  "name" : "Network PMT LOV Cross Filter",
  "description" : "Populating Network PMTItemCategory then PMTItemType shows only corresponding values",
  "scope" : "Global",
  "validObjectTypes" : [ "Item" ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : "Never",
  "dependencies" : [ ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "LOVCrossValidationBusinessCondition",
  "parameters" : [ {
    "id" : "Config",
    "type" : "com.stibo.core.domain.parameter.LOVCrossValidationConfig",
    "value" : "<map>\n  <entry>\n    <key LOVID=\"LOV_PMT_Item_Category\">C</key>\n    <value>\n      <set>\n        <element LOVID=\"LOV_PMT_Item_Type\">R</element>\n      </set>\n    </value>\n  </entry>\n  <entry>\n    <key LOVID=\"LOV_PMT_Item_Category\">P</key>\n    <value>\n      <set>\n        <element LOVID=\"LOV_PMT_Item_Type\">P</element>\n        <element LOVID=\"LOV_PMT_Item_Type\">R</element>\n        <element LOVID=\"LOV_PMT_Item_Type\">S</element>\n        <element LOVID=\"LOV_PMT_Item_Type\">C</element>\n      </set>\n    </value>\n  </entry>\n</map>"
  }, {
    "id" : "DefiningAttribute",
    "type" : "com.stibo.core.domain.Attribute",
    "value" : "PMT_Item_Category"
  }, {
    "id" : "DependentAttribute",
    "type" : "com.stibo.core.domain.Attribute",
    "value" : "PMT_Item_Type"
  } ],
  "pluginType" : "Operation"
}
*/

/*===== business rule plugin definition =====
{
  "pluginId" : "AttributeComparatorCondition",
  "parameters" : [ {
    "id" : "Attribute1",
    "type" : "com.stibo.core.domain.Attribute",
    "value" : "Line_Of_Business"
  }, {
    "id" : "Attribute2",
    "type" : "com.stibo.core.domain.Attribute",
    "value" : null
  }, {
    "id" : "Constant",
    "type" : "java.lang.String",
    "value" : "Network Mobility"
  }, {
    "id" : "Operator",
    "type" : "java.lang.String",
    "value" : "="
  } ],
  "pluginType" : "Precondition"
}
*/
