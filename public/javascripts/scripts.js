jQuery(document).ready(function($){

	$('.close-button').on('click', function() {

		var elementData = $(this).attr('data');
    
    $.ajax({
      type: 'POST',
      url: '/remove-subdomain',
      data: {url: elementData}
    });
	});

	$('#add-subdomain').on('submit', function(event) {
		event.preventDefault();

		var inputValue = $(this).find('input').val();

		if (!isURL(inputValue)) {
			inputValue = 'https://' + inputValue.replace(' ', '') + '.appfolio.com'
		}

		$(this).find('input').val('');
		var html = '<li class="subdomain callout" data-closable=""><span>' + inputValue + '</span><button class="close-button" data-close="" data="test">x</button></li>'
		$('.tracked-subdomains').append(html);

    $.ajax({
      type: 'POST',
      url: '/add-subdomain',
      data: {subdomain: inputValue}
    });
	});

})

function isURL(str) {
  var pattern = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
  return pattern.test(str);
}