var testingUtils = {
  evaluateTests: function(challengeFunction, inputs, answers) {
    var responseArr = []; //create an empty array of responses to be returned.
    for (var i=0; i<inputs.length; i++){ //for each input, create a response.
      var functionResponse = challengeFunction(inputs[i]); //run the function created by the user against the inputs.
      var testResponse = { //create the response to be put in the array.
        input: inputs[i],
        answer: answers[i],
        functionResponse: functionResponse
      };
      if (functionResponse === answers[i]){ //if the function processes the input to the expected value, the function is correct.
        testResponse.valid = true;
        responseArr.push(testResponse);
      }
      else { //if the function response does not equal the answer, the test is in valid and testing stops.
        if (functionResponse === undefined) { //if the response from the function is undefined, make it a string so it can be printed on the screen to the user.
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
