

$(document).ready(function(){
	
	
	
	// ----- Body Loading
	setTimeout(function(){
		$("body").removeClass("loading");
	}, 300);
	
	
	// ----- Tooltip
    $('[data-toggle="tooltip"]').tooltip();
	
	
	
	
	
	
	
	// ----- Box-Plus
	$(".btn-more").on('click', function(e){
		e.preventDefault();
		$(this).toggleClass('open');
		$(".activity .box-plus .box-plus-body").toggleClass('open');
		
		$(this).toggleClass(function(){
			return $(this).is(".ico-minus-cerc, .ico-plus-cerc") ? "ico-minus-cerc ico-plus-cerc" : "ico-minus-cerc";
		});
		$(this).text( ($(this).text() == "More infos" ? "Close infos" : "More infos"));
		
	});
	

	// ----- Activity Collapse
	$(".activity-body").on('show.bs.collapse', function(){
		$(this).closest(".activity").addClass('open');
		
		
	});
	$(".activity-body").on('hide.bs.collapse', function(){
		$(this).closest(".activity").removeClass('open');
	});
	
	
	
	
	
	// ----- Filter Select2
	$('.js-select').select2({
		minimumResultsForSearch: Infinity
	});
	
	
	// ----- Mobile Menu
	$("#header nav ul").before('<div class="btn-mobile"><span class="anim"></span><span class="anim"></span><span class="anim"></span></div>');
	$(".btn-mobile").on('click', function(e){
		e.preventDefault();
		$(this).toggleClass('open');
		$("body").toggleClass('mobile-menu-open');
	});
	
	
	// ----- ScroolToTop
	$("#header").before('<a href="#" class="scrollToTop anim"></a>');
	if ($(this).scrollTop() > 140) {
			$('body').addClass('scroll');
	} else {
		$('body').removeClass('scroll');
	}
	$(window).scroll(function(){
		if ($(this).scrollTop() > 140) {
			$('body').addClass('scroll');
		} else {
			$('body').removeClass('scroll');
		}
	});
	$('.scrollToTop').click(function(){
		$('html, body').animate({scrollTop : 0},800);
		return false;
	});
	
	
});






	



















