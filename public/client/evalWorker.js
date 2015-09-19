importScripts('appUtilities.js');

//a message is received when the worker is launched, and this function runs.
onmessage = function(e) {

  //further evaluates the users function input, now that the users code is determined to be valid code.
  var codeProcess = function(functionName, inputs, answers){

    //if the target function exists in the users code, the users function will be assigned to challengeFunction.
    var challengeFunction = eval(e.data.functionName);
    
    if (typeof challengeFunction === "function"){ //since eval was run previously, if a function with the target functionName exists, then the user submitted a valid function with the correct name.
      var codeResponse = {
        valid: true,
        error: "The submitted code has no syntax or timeout errors",
        tests: testingUtils.evaluateTests(challengeFunction, inputs, answers) //run the evaluateTests function to evaluate each test. The testingUtils variable is declared in the environment that this function is run.
      }
    }
    else { //if its not a function, return an error.
      var codeResponse = {
        valid: false,
        error: functionName + " should be a function",
        tests: []
      }
    }

    if (codeResponse.tests[codeResponse.tests.length-1].valid === true) { //check if all of the tests passed.
      codeResponse.passed = true;
    }
    else {
      codeResponse.passed = false;
    }
    return codeResponse; //return with the object that has the results of processing the users code.
  }

  //this instantiates all JS written by the user. If any of it errors, it will be caught by the on error event in the controller.
  //it also sets all of the variables written in the users code into environment variables set in this scope, which will be used in the codeProcess function.
  eval(e.data.code); 

  //if the evals are successful the code will continue and codeProcess will be run.
  var codeResponse = codeProcess(e.data.functionName, e.data.inputs, e.data.answers);