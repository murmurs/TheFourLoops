(function test(){
  var text = document.getElementById('text');
  text.addEventListener('input', function(event){
    console.log(this.value);
  })
})();