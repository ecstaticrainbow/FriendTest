$(document).ready(function () {
    $("#add-question").click(function () { 
        $("#question-list ol").append("<li class='question-item'>" + $("#question-input").val() + "<i class='material-icons'>play_arrow</i>" +
        "<div class='answers-div'>" +
        "<ol><li>" + $("#answer1-input").val() + "</li><hr>" + 
        "<li>" + $("#answer2-input").val() + "</li><hr>" + 
        "<li>" + $("#answer3-input").val() + "</li></ol></div></li>");
    });
   
});