var testingUtils = {
  evaluateTests: function(challengeFunction, inputs, answers) {
    var responseArr = [];
    for (var i=0; i<inputs.length; i++){
      var functionResponse = challengeFunction(inputs[i]);
      var testResponse = {
        input: inputs[i],
        answer: answers[i],
        functionResponse: functionResponse
      };
      if (functionResponse === answers[i]){ //if the function processes the input to the expected, and answer is correct.
        testResponse.valid = true;
        responseArr.push(testResponse);
      }
      else {
        if (functionResponse === undefined) {
          testResponse.functionResponse = "undefined";
        }
        testResponse.valid = false;
        responseArr.push(testResponse);
        break; //break out of the for loop so the testing does not continue.
      }
    }
    return responseArr; //all tests are valid, so return.
  }
};
