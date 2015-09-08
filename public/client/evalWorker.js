onmessage = function(e) {

  console.log("start of worker");

  var evaluateTests = function(challengeFunction, inputs, answers) {
    var responseArr = [];
    for (var i=0; i<inputs.length; i++){
      var functionResponse = challengeFunction(inputs[i]);
      var testResponse = {
        input: inputs[i],
        answer: answers[i],
        functionResponse: functionResponse
      };

      console.log(testResponse);
      if (functionResponse === answers[i]){ //if the function processes the input to the expected, and answer is correct.
        testResponse.valid = true;
      }
      else {
        testResponse.valid = false;
        return responseArr; //the response testing will end when an invalid test is found.
      }
      responseArr.push(testResponse);
    }
    console.log(responseArr);
    return responseArr; //all tests are valid, so return.
  };

  var codeProcess = function(functionName, inputs, answers){ //determine the text response.
    var challengeFunction = eval(functionName); //turn the functionName text into an actual function.
    if (typeof challengeFunction === "function"){
      var codeResponse = {
        valid: true,
        error: undefined,
        tests: evaluateTests(challengeFunction, inputs, answers)
      }
    }
    else {
      var codeResponse = {
        valid: false,
        error: functionName + " should be a function"
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