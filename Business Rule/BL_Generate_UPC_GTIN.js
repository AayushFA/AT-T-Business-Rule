/*===== export metadata =====
{
  "contextId" : "Context1",
  "workspaceId" : "Main"
}
*/
/*===== business rule definition =====
{
  "id" : "BL_Generate_UPC_GTIN",
  "type" : "BusinessLibrary",
  "setupGroups" : [ "ATT_Item_Derivation_Libraries" ],
  "name" : "UPC GTIN Generation Library",
  "description" : null,
  "scope" : null,
  "validObjectTypes" : [ ],
  "allObjectTypesValid" : false,
  "runPrivileged" : false,
  "onApprove" : null,
  "dependencies" : [ {
    "libraryId" : "BL_Generate_Item_Number",
    "libraryAlias" : "itmGenLib"
  } ]
}
*/
/*===== business rule plugin definition =====
{
  "pluginId" : "JavaScriptBusinessLibrary",
  "binds" : [ ],
  "messages" : [ ],
  "pluginType" : "Operation"
}
*/
/*
============================================================================================================
 Library       : BL_Generate_UPC_GTIN
 Author        : AS388G (Aditya Sreepad)
 Description   : UPC and GTIN Generation Library 

REVISION HISTORY
=======
VERSION  DATE        AUTHOR(S)               DESCRIPTION
-------- ----------- ----------------------- ---------------------------------------------------------------
1.0      04-SEP-2025 AS388G (Aditya Sreepad)  PDH - STIBO Transition (STIBO-3417 - Item Number Generation)
============================================================================================================
*/

function getUPCPrefix(step) {
    var rootNode = step.getEntityHome().getEntityByID("Item_Number_Lookup_Root");
    var upcPrefix = rootNode.getValue("UPC_Prefix").getSimpleValue();
    if (upcPrefix == null) {
        //return 607376
        return {
            status: false,
            upcPrefix: 607376
        }
    } else {
        return {
            status: true,
            upcPrefix: upcPrefix
        }
    }
}

//Function to execute the UPC Sequence BA 
function generateUPCSequence(node, step, sequenceId) {
    var businessAction = step.getBusinessRuleHome().getBusinessActionByID(sequenceId.trim());
    businessAction.execute(node);
}

//Function to derive checksum for UPC number 
function deriveChecksum(upcNumber) {

    // Convert the Number into a string
    var numString = String(Math.abs(upcNumber));
   // log.info("numString:" + numString);

    try{ 
        //Add up all digits in the odd position and mutiply with 3
        var checksumOdd = (parseInt(numString[0]) +
            parseInt(numString[2]) +
            parseInt(numString[4]) +
            parseInt(numString[6]) +
            parseInt(numString[8]) +
            parseInt(numString[10])
        ) * 3;
     //   log.info("checksumOdd:" + checksumOdd);
    }
    catch (e) {
        log.info("checksumOdd Error:" + e );
    }

    //Add up all digits in the even position
    try{
        var checksumEven = parseInt(numString[1]) +
            parseInt(numString[3]) +
            parseInt(numString[5]) +
            parseInt(numString[7]) +
            parseInt(numString[9]);
       // log.info("checksumEven:" + checksumEven);
    } catch (e){
        log.info("checksumEven Error:" + e );
    } 
    //Add both checksum odd sum and even sum
    var checksum = (checksumOdd + checksumEven) % 10;
   // log.info("checkSum Reminder is :" + checksum);


    //if checksum is 0 then return 0 else return 10-checksum
    if (checksum === 0) {
     //   log.info("checksum is 0");
        return checksum;
    } else {
       // log.info("checksum :" + checksum);
        checksum = 10 - checksum;
        return checksum;
    }

}

//Function to derive checksum for GTIN 
function deriveGTINChecksum(upcNumber) {
    // Calculate check digit using GS1 Modulo-10 algorithm
    const digits = upcNumber.split('').map(Number);
    var sum = 0;
   // log.info("digits Array = "+String(digits));
    for (let i = 0; i < digits.length; i++) {
        sum += digits[i] * (i % 2 === 0 ? 3 : 1);
    }

    const checksumDigit = (10 - (sum % 10)) % 10;
    return checksumDigit;
}

function numberOfRetryToDo(step) {
    var rootNode = step.getEntityHome().getEntityByID("Item_Number_Lookup_Root");
    var retryLimit = rootNode.getValue("Item_Number_Generation_Max_Retry_Limit").getSimpleValue();
    if (retryLimit == null) {
        return 3
    } else {
        return retryLimit
    }
}

/*
 function  : generateUPC
 Author : as388g
 Desc   : UPC Number Generation Library function 
 */
function generateUPC(node, step) {
   // log.info("Start of the UPC generation");
    var objectType = node.getObjectType().getID();
    var generateUPCFlag = node.getValue("Generate_New_UPC").getLOVValue().getID();
    var upcValue = node.getValue("UPC").getSimpleValue();
    var success = false;
    var maxRetries = numberOfRetryToDo(step); //300
    var retryCount = 0;

   // log.info("objectType :" + objectType);

    //UPC Generation logic only valid for Items and Comps 
    if (objectType == "Item" || objectType == "Companion_SKU") {
        //check for Generate_New_UPC flag and ensure UPC is not already populated.
        if (generateUPCFlag == "Y" && !upcValue) {
            log.info(" GenerateUPC flag:" + generateUPCFlag + ". Generate UPC.");

            //Step1: Get UPC Prefix for AT&T Entity
            var result = getUPCPrefix(step);

            log.info("Step1: Fetch the UPC Prefix");
            var upcPrefix = '';
            if (result.status) {
                upcPrefix = result.upcPrefix;
            } else {
     //           log.info("UPC Prefix is not configured in the Item_Number_Lookup_Root.");
                upcPrefix = result.upcPrefix;
            }
       //     log.info("UPC Prefix :" + upcPrefix);

            //Step2: Generate Sequence
            while (!success && retryCount < maxRetries) {
                try {
         //           log.info("Step2: Execute the UPC Sequence BA");
                    
                    //create a function in Lib to run sequence,  check uniqueness and re-try logic if fails 
                    generateUPCSequence(node, step, "BA_UPC_Assign")
                    upcSequence = node.getValue("UPC_Base").getSimpleValue();
                    upcSequence = upcSequence.padStart(5, "0");
           //         log.info("Generated UPC Sequence :" + upcSequence);

                    //upcValue without Checksum.
                    var upcValue = upcPrefix + upcSequence;
             //       log.info("UPC Value without checksum:" + upcValue);

                    //Step3: Calculate Checksum based on upcPrefix & upcBase 
                    var checkSum = deriveChecksum(upcValue);

                    //Step1 + Step2 + Step3
                    upcValue = upcPrefix + upcSequence + checkSum;

                    //Ensure Length of upcValue is exactly 12 digits
                    if (upcValue.length != 12) {
               //         log.info("Invalid UPC. Generated UPC string length is " + upcValue.length);
                        throw "Invalid UPC. Generated UPC string length is:" + upcValue.length;
                    }

                    //set upcValue in the UPC attribute at the corresponding Item / Comp level 
                    node.getValue("UPC").setSimpleValue(upcValue);
                 //   log.info("Updated UPC value is :" + node.getValue("UPC").getSimpleValue());
                    
                    try{
                    	node.getValue("UPC_GTIN").setSimpleValue(upcValue);
                    	}
                    catch(err){
                    		throw "Generated UPC value is Invalid :" + upcValue +". Error backtrace:"+err;
                    	}

                    success = true;

                } catch (error) {
                  //  log.info("Error ocurred :" + error);
                    retryCount++;
                    if (retryCount > maxRetries) {
                    //    log.info("Max retry attempt reached. retryCount:" + retryCount);
                        success = false;
                        throw error;
                    }

                }

            }
        } else { //(generateUPC == null || generateUPC == "" || generateUPC == "N")
          //  log.info(" GenerateUPC flag:" + generateUPCFlag + ". Skip UPC Number Generation.");
        }
    } else {
   //     log.info("UPC Number generation is not applicable to :" + objectType);
    }
}

/*
 function  : generateGTIN
 Author    : as388g
 Desc      : GIN Number Generation Business function 
*/
function generateGTIN(node) {
   // log.info("GTIN-14 generation");
    var objectType = node.getObjectType().getID();
    var upcValue = node.getValue("UPC_GTIN").getSimpleValue();  //node.getValue("UPC").getSimpleValue();
    var gtinValue = node.getValue("GTIN").getSimpleValue();
   // log.info("objectType :" + objectType);

    //GTIN Generation logic only valid for Items and Comps 
    if (objectType == "Item" || objectType == "Companion_SKU") {

        //check for Generate_New_UPC flag and ensure UPC is not already populated.
        if (!upcValue) {
       //     log.info(" UPC Value is NULL, GTIN cannot be generated");
        } else {
         //   log.info("UPC fetched :" + upcValue + ". Generate GTIN based on the UPC");

            // Ensure baseGTIN is 12 or 13 digits
            if (String(upcValue).length !== 12) {
                throw new Error("BaseGTIN (UPC) must be 12 digits. UPC");
            }

            //Remove last character (UPC Checksum) from the UPC
            var baseGTIN = upcValue.slice(0, -1);
           // log.info("base GTIN after removing the UPC checksum :" + baseGTIN);

            //Prefix Company Code assigned by GS1 3- AT&T
            baseGTIN = '30' + String(baseGTIN);
          //  log.info("baseGTIN with Prefix  :" + baseGTIN);

            //Calculate GTIN Checksum
            gtinChecksum = deriveGTINChecksum(baseGTIN);
          //  log.info("baseGTIN gtinChecksum :" + gtinChecksum);

            //check checkSum 
            if (isNaN(gtinChecksum)) {
            //    log.info("GTIN CheckSum Derivation failed: " + gtinChecksum);
                throw new Error("GTIN CheckSum Derivation failed");
            }

            //Append CheckSum digit to the baseGTIN
            gtinValue = String(baseGTIN) + String(gtinChecksum);
          //  log.info("Generated final GTIN value is :" + gtinValue);

            if (gtinValue.length !== 14) {
                throw new Error("Invalid GTIN number generated :" + gtinValue);
            } else {
                //set gtinValue in the GTIN attribute at the corresponding Item / Comp level 
                try {
                    node.getValue("GTIN").setSimpleValue(gtinValue);
                } catch {
                    throw new Error("Unable to set GTIN");
                }

            }

        }
    }
}

function setGtinUPC(node,UPC,step) {
	//var errorMessage = "";
	//if (UPC) {
        var upcValue = node.getValue("UPC_GTIN").getSimpleValue();
        if (!upcValue){
            try {
                log.info("Directly Update UPC_GTIN with UPC :"+UPC);
                node.getValue("UPC_GTIN").setSimpleValue(UPC);
            } catch (error) {
                //errorMessage = "Please enter valid UPC number or clear off the value for System Generated UPC";
                var errorMessage = error.toString();
                var startIndex1 = errorMessage.indexOf("UniqueKeyViolation");
                var startIndex2 = errorMessage.indexOf("GTINCheckDigitValidator");  
                var startIndex3 = errorMessage.indexOf("GTINUnallowedChar");  
                //log.info("UPC_GTIN Assignment Error: "+error);

                errorMessage ="";
                if (startIndex1 > -1) {
                    log.info("Error1");    
                    errorMessage += "This UPC "+UPC+" exists on another Item. Retry with a new UPC";
                }
                
                if (startIndex2 > -1){
                    log.info("Error2");
                    errorMessage += "UPC "+UPC+" is invalid as per GTIN Check Digit validation. Please enter valid UPC.";
                }
                
                if (startIndex3 > -1){
                    log.info("Error3");
                    errorMessage += "UPC "+UPC+" has invalid characters. Please enter valid UPC and retry.";
                }

                log.info("errorMessage :"+errorMessage);
                throw errorMessage;
            }
        }
        else {
            try {
                log.info("Reset UPC_GTIN Key and Update with new value:"+UPC);
                step.getKeyHome().updateUniqueKeyValues2({"UPC_GTIN": String("")}, node);
                node.getValue("UPC_GTIN").setSimpleValue(UPC);
            }
            catch (error) {
                //errorMessage = "Please enter valid UPC number or clear off the value for System Generated UPC";
                throw ("Could not Delete Key/Update the UPC_GTIN value. Backtrace :"+error);
            }
        }
            		
	//}
	//return errorMessage;
}


/*
 function  : generateUpcGtin
 Author    : as388g
 Desc      : UPC and GIN Number Generation for Pitem and all CompItems
*/
function generateUpcGtin(node, stepManager){
   var objectType = node.getObjectType().getID();

   //log.info("Calling upcGtinMain for Object:"+objectType);
   //upcGtinMain(node, stepManager);

    var generateNewUPC = node.getValue("Generate_New_UPC").getID();
    var UPC = node.getValue("UPC").getSimpleValue();

   if (UPC && String(UPC).length !== 12) {
       throw new Error("UPC must be 12 digits.");
      }
            
   if(!node.getValue("Item_Num").getValue()){
   	log.info("Scenario1 : UPC Generation when Item_Num not populated");
    if (generateNewUPC == "Y" && UPC) {
        log.info("Conflict in Generate New UPC flag and UPC value. Populate either one");
        throw "Conflict in Generate New UPC flag and UPC value. Please clear off the UPC value for System Generated UPC.";
    }

    if(generateNewUPC != "Y" && UPC) {
         log.info("Scenario 1.1 :generateNewUPC not Y and User defined UPC provided :"+UPC);
         setGtinUPC(node,UPC,stepManager);
		generateGTIN(node);
   }
   else if (generateNewUPC == "Y" && !UPC) {
		log.info("Scenario 1.2 :generateNewUPC = Y");
		generateUPC(node, stepManager);
		generateGTIN(node);
   	}
   }
   else{
        log.info("Scenario 2: Item_Num present - Item Maintenance Flow");
	        var approvedUPC = "";
            var approvedGenUPCFlag = "";
		    var approvedManager = stepManager.executeInWorkspace("Approved", function(step) {
		    return step;
		    });
		    var approvedNode = approvedManager.getProductHome().getProductByID(node.getID());
            if (approvedNode) {
                approvedUPC = approvedNode.getValue("UPC").getSimpleValue();
                approvedGenUPCFlag  = approvedNode.getValue("Generate_New_UPC").getID();
                log.info("ApprovedUPC :"+approvedUPC+" approvedGenUPCFlag:"+approvedGenUPCFlag);
            }

        if (objectType == "Item" || objectType == "Companion_SKU") {
            //When UPC is changed or GenerateNewUPC flag is changed to Y from N
            if( (UPC && (UPC != approvedUPC)) || (generateNewUPC == "Y" && (approvedGenUPCFlag != "Y")) ) {

                log.info("UPC :"+UPC+" generateNewUPC:"+generateNewUPC);
                if (UPC && (!approvedUPC ||(approvedUPC != UPC))) {
                    log.info("Scenario 2.1 :UPC is entered and ApprovedUPC is either NULL or different");
                    setGtinUPC(node,UPC,stepManager);
                    generateGTIN(node);
                }
                else if (generateNewUPC == "Y" && approvedGenUPCFlag != "Y" && !UPC) {
                    log.info("Scenario 2.2 generateNewUPC=Y and approvedGenUPCFlag=N");
                    generateUPC(node, stepManager);
                    generateGTIN(node);
                }
            }
            else if (!UPC && !approvedUPC && generateNewUPC == "Y"){
                log.info("Scenario 2.3 : Generate New UPC is Y and UPC is NULL");
                generateUPC(node, stepManager);
                generateGTIN(node);
            }
            else if (!UPC && approvedUPC) {   //(!UPC && generateNewUPC == approvedGenUPCFlag)
                log.info("Scenario 3: Reset UPC and if GenerateNewUPC= Y , Generate a new one");
                log.info("approvedUPC :"+approvedUPC+" value needs to be reset");
                setGtinUPC(node,UPC,stepManager);
                try {
                    node.getValue("GTIN").setSimpleValue("");
                } catch (error) {
                    throw ("Unable to clear GTIN value");
                }

                //After reset , if GenerateNewUPC = Y , generate new UPC & GTIN
                if(generateNewUPC == "Y"){  
                    generateUPC(node, stepManager);
                    generateGTIN(node);              
                }
            }
        }  
   }

   if (objectType == "Item" && generateNewUPC == "Y"){
   //Companion UPC Creation
    var pItemChildren = node.getChildren().toArray();
    pItemChildren.forEach(function(pChild) {
			if (pChild.getObjectType().getID() == "Companion_SKU" ){
                var compGenerateNewUPC = pChild.getValue("Generate_New_UPC").getID();
                var CompUPC            = pChild.getValue("UPC").getSimpleValue();                
                if (compGenerateNewUPC == "Y" && !CompUPC) {
				log.info("UPC/GTIN Gen for Child Object Id :"+String(pChild.getID()));
                    try{
                        generateUPC(pChild, stepManager);
                        generateGTIN(pChild);
                        //upcGtinMain(pChild, stepManager);
                    }
                    catch (e){
                        throw e;
                    }	
                }			
			}
		});   	
   	}
}


/*===== business library exports - this part will not be imported to STEP =====*/
