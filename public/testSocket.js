(function(){

  var socket = io.connect('http://localhost:3000');
  var userId;
  socket.on('userId', function(data){
    userId = data.userId
    console.log(userId);
  });
  var input = document.getElementById('input');
  var opponent = document.getElementById('opponent');
  socket.on('typing', function(data){
    // console.log('user typed');
    if(data.userId !== userId){
      opponent.innerHTML = data.code;
    }
  });

  input.addEventListener('input', function(event){
    // console.log(this.value);
    socket.emit('typing', {
      code:this.value,
      userId:userId
    });
  })

})();