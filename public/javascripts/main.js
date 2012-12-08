/*
 * main.js
 */

$(function() {

  var $currentTr = null
  $("#mails tbody tr.mail").click(function() {
    if ($currentTr) {
      $currentTr.removeClass('selected');
    }
    $currentTr = $(this);
    $('#mailbody pre').text($('input[name="body"]', $currentTr).val());
    $currentTr.addClass('selected');
  });
});

