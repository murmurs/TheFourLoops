(function test(){
  var text = document.getElementById('text');
  text.addEventListener('input', function(event){
    socket.emit('typing', {test: 123});
  })
  var socket = io.connect('http://localhost:3000');
})();