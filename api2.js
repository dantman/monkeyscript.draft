(function($) {
	
	$(function($) {
		prettyPrint();
		$('pre.prettyprint :header').each(function() {
			var $this = $(this);
			$this.text($this.find('span').text());
		});
		
		$('article').click(function(e) {
			var elm = $(e.target).closest('a[href^=#]');
			if(!elm.length) return;
			e.preventDefault();
			var href = elm.attr('href');
			if( href == '#top' ) href = { top: 0, left: 0 };
			$('html, body').scrollTo(href, { duration: 1000, margin: true, queue: true });
		});
		
		var navNode = $('nav')[0];
		if( navNode ) {
			var topY = $('article > section > header').outerHeight();
			var htmlNode = $('html')[0];
			$(window).scroll(function(e) {
				navNode.style.position = htmlNode.scrollTop > topY ? 'fixed' : 'static' ;
			});
		}
		
		var scripted = $('#scripted');
		if( scripted.length ) {
			scripted.find('span').text('Enabled');
		}
		
		$('.commentsbutton').each(function() {
			$(this).text('No comments');
		}).live('click', function(e) {
			var footer = $(this).parent();
			var comments = footer.children('.comments');
			if( !comments.length ) {
				comments = $('<div class=comments>').hide().appendTo(footer);
				$('<h6>Comments</h6>').appendTo(comments);
				var dialog = $('<dialog>').appendTo(comments);
			}
			comments.slideDown();
		});
		
	});
	
})(jQuery);
