$(document).ready(function () {

$(".delete-btn").click(function (event) {
  event.preventDefault();
  const id = $(this).attr("data");
  $.ajax(`/remove/${id}`, {
      type: "PUT"
  }).then(function(){
      location.reload();
  })
});

$("#article-box").on('click','button',function() {
  console.log("Article clicked.")
  const id = $(this).attr("data-id");
  $.ajax(`/favorite/${id}`, {
      type: "PUT"
  }).then(function(){
      location.reload();
  })
});

});