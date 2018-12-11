$(document).ready(function(){

  var colors = ['#e57373', '#F06292', '#BA68C8', '#9575CD', '#7986CB', '#64B5F6', '#4FC3F7', '#4DD0E1', '#4DB6AC', '#81C784', '#AED581', '#DCE775', '#FFF176', '#FFD54F', '#FFB74D', '#FF8A65'];
  var random_color = colors[Math.floor(Math.random() * colors.length)];

  var metaThemeColor = document.querySelector("meta[name=theme-color]");
  metaThemeColor.setAttribute("content", random_color);
  $('body').css('background-color', random_color);
  $()

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
