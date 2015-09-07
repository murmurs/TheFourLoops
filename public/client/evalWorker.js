onmessage = function(e) {

  //need to layer some testing into here...
  //not so easy to do...
  //the processing is done in here...
  //use a spec runner kind of program...
  //we start off inside the damn raceController...
  //wtf are we going to do with that...


  eval(e.data.code); //this instantiates all JS written by the user.

  //this should loop through the answers. 
  //throw an error if any inputs/answers returns an error.
  //make it work for just one combo to start.

  var codeProcess = function(functionName, inputs, answers){ //determine the text response.
    if (typeof eval(functionName) === "function"){
      console.log("line 19", inputs);
      var challengeFunction = eval(functionName) //turn the functionName text into an actual function.
      console.log("challengeFunc", challengeFunction);
      var funcResults = challengeFunction(inputs); //this will execute the function the user was supposed to write. With the inputs as an array.
      console.log(funcResults);
      if (funcResults === answers) { //answer is a string. Needs to be coerced...
        return funcResults + " - correct!";
      }
      else {
        return funcResults + " - incorrect!";
      }
    }
    else {
      return functionName + " should be a function";
    }
  };

  e.data.response = codeProcess(e.data.functionName, e.data.inputs, e.data.answers);

  console.log("TRETURN", e.data.response);
  console.log("message received by worker");
  console.log(e.data.inputs);

  postMessage(e.data);
}


// var sum = function(arr){
//   var total = 0;
//   for (var i=0; i<arr.length; i++){
//     total += arr[i];
//   }
//   return total;
// }