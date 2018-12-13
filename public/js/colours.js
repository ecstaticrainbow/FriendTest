$(document).ready(function () {
    var colors = ['#e57373', '#F06292', '#BA68C8', '#9575CD', '#7986CB', '#64B5F6', '#4FC3F7', '#4DD0E1', '#4DB6AC', '#81C784', '#AED581', '#DCE775', '#FFD54F', '#FFB74D', '#FF8A65'];
  window.random_color = colors[Math.floor(Math.random() * colors.length)];
  $('body').css('background-color', random_color);
  $('#ingame-logo').css('color', random_color);
  $('#ingame-logo').css('filter', 'invert(100)');

  var metaThemeColor = document.querySelector("meta[name=theme-color]");
  metaThemeColor.setAttribute("content", random_color);
});