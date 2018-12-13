$(document).ready(function(){

  

  $("#hostButton").click(function(event) {
    var roomcode = makeid();
    window.location.href = "/game?roomcode=" + roomcode ;
  });
  $("#joinButton").click(function(event) {
    window.location.href = "/game?roomcode=" + $("#joinField").val();
  });
});

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
