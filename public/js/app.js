$(document).ready(function () {

//Save Article Button
$("#article-box").on('click','button',function() {
  console.log("Article clicked.")
  const id = $(this).attr("data-id");
  $.ajax(`/favorite/${id}`, {
      type: "PUT"
  }).then(function(){
      location.reload();
  })
});

//Remove Saved Article Button
$("#saved-articles").on('click','#delete-saved',function() {
  console.log("Delete Article")
  const id = $(this).attr("data-id");
  $.ajax(`/remove/${id}`, {
      type: "PUT"
  }).then(function(){
      location.reload();
  })
});

//Article Note Button
$("#saved-articles").on('click','#article-notes',function() {
  $('#note-modal').modal('toggle')
  console.log("Open Notes")
  const id = $(this).attr("data-id");
  $("#save-note").attr("data-id", id);
  $.ajax(`/notes/${id}`, {
      type: "GET"
  }).then(function(){
      location.reload();
  })
});

//Save Note Button
$(".modal-footer").on('click','#save-note',function() {
  console.log("Save Notes")
  const id = $(this).attr("data-id");
  let note = {
    noteBody: $("#note-body").val()
  }
  $.ajax(`/notes/${id}`, {
      type: "POST",
      data: note
  }).then(function(){
      // location.reload();
      $("#note-body").val("")
  })
});

});