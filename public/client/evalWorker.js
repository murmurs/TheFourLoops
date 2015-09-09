onmessage = function(e) {

  console.log("start of worker");

  var evaluateTests = function(challengeFunction, inputs, answers) {
    var responseArr = [];
    console.log("tests started");
    for (var i=0; i<inputs.length; i++){
      var functionResponse = challengeFunction(inputs[i]);
      console.log("functionResponse", functionResponse);
      var testResponse = {
        input: inputs[i],
        answer: answers[i],
        functionResponse: functionResponse
      };
      console.log("testing input");
      console.log(testResponse);
      if (functionResponse === answers[i]){ //if the function processes the input to the expected, and answer is correct.
        testResponse.valid = true;
        responseArr.push(testResponse);
      }
      else {
        if (functionResponse === undefined) {
          testResponse.functionResponse = "undefined";
        }
        testResponse.valid = false;
        console.log("test failed!");
        responseArr.push(testResponse);
        break; //break out of the for loop so the testing does not continue.
      }

    }
    
    console.log("testingArr complete", responseArr[0]);
    return responseArr; //all tests are valid, so return.
  };

  var codeProcess = function(functionName, inputs, answers){ //determine the text response.
    //console.log(functionName, typeof functionName);
    var challengeFunction = eval(functionName);
    console.log("top of codeprocess");
    console.log(challengeFunction);
    
    if (typeof challengeFunction === "function"){
      console.log("function is correctly a function");
      var codeResponse = {
        valid: true,
        error: "The submitted code has no syntax or timeout errors",
        tests: evaluateTests(challengeFunction, inputs, answers)
      }
    }
    else {
      var codeResponse = {
        valid: false,
        error: functionName + " should be a function",
        tests: []
      }
    }

    console.log("tests complete", codeResponse);
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

  console.log("inputs", e.data.inputs)
  //if the eval is successful the code will continue.
  var codeResponse = codeProcess(e.data.functionName, e.data.inputs, e.data.answers);

  console.log("end of code response");
  postMessage(codeResponse);
}

//sample function that i've been using for sum.
// var sum = function(arr){
//   var total = 0;
//   for (var i=0; i<arr.length; i++){
//     total += arr[i];
//   }
//   return total;
// }