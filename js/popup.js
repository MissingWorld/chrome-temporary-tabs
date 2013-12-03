;(function($, undefined){
	
	Date.prototype.isToday = function() {
		var today = new Date();
		return (this.toDateString() === today.toDateString());
	}
	
	Date.prototype.isYesterday = function(){
		var y = new Date();
		y.setDate(y.getDate()-1);
		return (this.toDateString() === y.toDateString());
	}
	
	Date.prototype.getDayName = function(s) {
		if (s) return (['Sun','Mon','Tue','Wed','Thu','Fri','Sat'])[this.getDay()];
		return (['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'])[this.getDay()];
	}
	Date.prototype.getMonthName = function(s) {
		if (s) return (['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'])[this.getDay()];
		return (['January','February','March','April','May','June','July','August','Sepember','October','November','December'])[this.getDay()];
	}
	Date.prototype.get12HourTime = function() {
		var hours24 = this.getHours(),
			suffix =  (hours24 > 12) ? 'PM' : 'AM',
			hours12 = (hours24 > 12) ? hours24-12 : hours24,
			minutes = this.getMinutes();
			
		return hours12 + ':' + ((minutes.toString().length == 1) ? '0' + minutes : minutes) + ' ' + suffix;
	}
	
	function getDateHeading(date) {
		return '<h6>' 
				+ ((date.isToday())?'Today - ':((date.isYesterday())?'Yesterday - ':'')) 
				+ date.getDayName() + ', ' + date.getMonthName() + ' ' + date.getDate() + ', ' + date.getFullYear() 
				+ '</h6>';
	}
	
	chrome.storage.local.get({removed: []}, function(data) {
		var i, date, lastDate, currentDay, html='';
		
		if (data.removed.length) {
			for (i in data.removed) {

				// Check for valid date
				if (isNaN(Date.parse(data.removed[i].removed))) continue;

				date = new Date(data.removed[i].removed);

				if (currentDay !== date.toDateString()) {
					if (html !== null) html += '</ol>';
					html += getDateHeading(date);
					html += '<ol class="history">';
					currentDay = date.toDateString();
				} else if (lastDate && (lastDate-date)/1000/60 > 20) {
					html += '<li class="divider"><span class="time">|</span></li>';
				}
				html += '<li><span class="time">' + date.get12HourTime() + '</span> ';
				html += '<img width="16" height="16" src="' + data.removed[i].favIconUrl + '"/>';
				html += '<a href="' + data.removed[i].url + '" title="' + data.removed[i].url + '">' + ((data.removed[i].title.length > 50) ? data.removed[i].title.substr(0, 50) + '&hellip;' : data.removed[i].title) + '</a></li>';
				lastDate = date;
			}
			html += '</ol>';
		} else {
			html = '<div class="nothing">Still waiting for <br>an explosion</div>';
		}
			
		$('#list').html(html);
	});
	
	$('#defuse').on('click', function(){
		chrome.extension.getBackgroundPage().defuse();
		$(this).attr('disabled','disabled').text('Defused');
	});
	
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(tabs){
		var registry = chrome.extension.getBackgroundPage().TabRegistry,
			guid;
			try {
				guid = (tabs.length) ? registry.guid(tabs[0].id) : false;
			} catch (e) {
				guid = false;
			}
		
		if (guid) {
			if (registry.attr.get(guid, 'defused')) $('#defuse').attr('disabled','disabled').text('Defused');
		} else {
			$('#defuse').hide();
		}
		
	});
	
	$('#list').on('click', 'a', function(){
		var $this = $(this),
			href = $this.attr('href');
		chrome.tabs.create({url:href});
	});
	
	
})(jQuery);
