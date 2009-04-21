(function($) {
	
	$(function($) {
		prettyPrint();
		
		$('.call').children('div').hide();
		/*$('#static, #properties, #methods').children(':header').each(function() {
			$('<a href="#" class=showhide>[show all]</a>').click(function() {
				$(this).closest('section').find('section > div').slideDown();
			}).appendTo(this);
		});*/
		
		$('.call').children(':header').each(function() {
			$('<a href="#" class=showhide>[toggle]</a>').click(function() {
				var n = $(this).closest('section').children('div');
				n.slideToggle();
			}).appendTo(this);
		});
	});
	
	$('a').live('click', function(e) {
		var href = $(this).attr('href');
		if(href.length < 2 || href.charAt(0) != '#') return;
		$('.call').children('div').not(href).slideUp();
		$(href).children('div').slideDown();
	});
	
})(jQuery);
