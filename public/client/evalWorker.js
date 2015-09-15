importScripts('appUtilities.js');

onmessage = function(e) {

  var codeProcess = function(functionName, inputs, answers){ //determine the text response.
    var challengeFunction = eval(functionName);
    
    if (typeof challengeFunction === "function"){
      console.log("function is correctly a function");
      var codeResponse = {
        valid: true,
        error: "The submitted code has no syntax or timeout errors",
        tests: testingUtils.evaluateTests(challengeFunction, inputs, answers)
      }
    }
    else {
      var codeResponse = {
        valid: false,
        error: functionName + " should be a function",
        tests: []
      }
    }

    if (codeResponse.tests[codeResponse.tests.length-1].valid === true) {
      codeResponse.passed = true;
    }
    else {
      codeResponse.passed = false;
    }
    return codeResponse;
  };

  //this instantiates all JS written by the user. If any of it errors, it will be caught by the on error event in the controller.
  eval(e.data.code); 

  //if the eval is successful the code will continue.
  var codeResponse = codeProcess(e.data.functionName, e.data.inputs, e.data.answers);

  postMessage(codeResponse);
}