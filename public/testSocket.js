(function(){
  var socket = io.connect('http://localhost:3000');
  var text = document.getElementById('text');
  text.addEventListener('input', function(event){
    socket.emit('typing', {text:this.value});
  })
})();