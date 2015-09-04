onmessage = function(e) {

  eval(e.data.code); //this instantiates all JS written by the user.

  var codeProcess = function(functionName, inputs, answer){ //determine the text response.
    if (typeof eval(functionName) === "function"){
      var funcResults = eval(functionName+"("+inputs+")"); //this will execute the function the user was supposed to write. With the inputs as an array.
      if (funcResults === answer) { //answer is a string. Needs to be coerced...
        return funcResults + " - correct!";
      }
      else {
        return funcResults + " - incorrect!";
      }
    }
    else {
      return functionName+" should be a function";
    }
  };

  e.data.response = codeProcess(e.data.functionName, e.data.inputs, e.data.answer);

  console.log("TRETURN", e.data.response);
  console.log("message received by worker");
  console.log(e.data.inputs);

  postMessage(e.data);
}