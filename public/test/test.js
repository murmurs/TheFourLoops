
//the challengeFunction runs the input and expects the output to be the supplied answer.
var undefinedFunction = function() {
  //should return undefined with no return.
};

var sumFunction = function(inputArr) {
  var total = 0;
  for (var i = 0; i<inputArr.length; i++) {
    total += inputArr[i];
  }
  return total;
};

var incorrectSumFunction = function(inputArr) {
  var total = 0;
  for (var i=0; i<inputArr.length-1; i++) {
    total += inputArr[i];
  }
  return total;
}

var evaluateTestsData = {
  correctAnswer: {
    challengeFunction: sumFunction,
    inputs: [[10, 15, 20], [3,6,9]],
    answers: [45, 18],
    expectedResponse: [
      {
        input: [10, 15, 20],
        answer: 45,
        functionResponse: 45,
        valid: true
      },
      {
        input: [3,6,9],
        answer: 18,
        functionResponse: 18,
        valid: true
      }
    ]
  },
  firstTestFailing: {
    challengeFunction: incorrectSumFunction,
    inputs: [[10, 8, 2], [8,2,3]],
    answers: [20, 13],
    expectedResponse: [
      {
        input: [10, 8, 2],
        answer: 20,
        functionResponse: 18,
        valid: false 
      }
    ]
  },
  failingWithUndefined: {
    challengeFunction: undefinedFunction,
    inputs: [[10, 8, 2]],
    answers: [20],
    expectedResponse: [
      {
        input: [10, 8, 2],
        answer: 20,
        functionResponse: "undefined",
        valid: false
      }
    ]
  }
};

describe("Testing Utils", function() {
  describe("evaluateTests", function() {
    it("should have a valid answer given valid inputs", function(){
      var testVars = evaluateTestsData.correctAnswer;
      expect(testingUtils.evaluateTests(testVars.challengeFunction, testVars.inputs, testVars.answers)).to.deep.equal(testVars.expectedResponse);
    });
    it("should stop processing tests and return when a test fails", function() {
      var testVars = evaluateTestsData.firstTestFailing;
      expect(testingUtils.evaluateTests(testVars.challengeFunction, testVars.inputs, testVars.answers)).to.deep.equal(testVars.expectedResponse)
    })
    it("should return an 'undefined' string when the functionResponse is undefined.", function() {
      var testVars = evaluateTestsData.failingWithUndefined;
      console.log(testingUtils.evaluateTests(testVars.challengeFunction, testVars.inputs, testVars.answers));
      expect(testingUtils.evaluateTests(testVars.challengeFunction, testVars.inputs, testVars.answers)).to.deep.equal(testVars.expectedResponse)
    });
  });
});

