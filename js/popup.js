import Base from './popup/base.js';
import Netflix from './popup/netflix.js';
import Crunchy from './popup/crunchy.js';

let background = chrome.extension.getBackgroundPage(),
	host 	= background.debug !== true?'https://simkl.com':'http://simkl.dev';

$(document).ready(function (){
	$('#netflixLastWatched, .ExtSettingsNextCounter').html('');
	document.getElementById('ext_version').innerText = 'v'+chrome.runtime.getManifest().version;

	document.getElementById('SimklIFrame').setAttribute('src',host+'/chromeapp?v7&token='+background.oauth.token()+'&client_id='+background.oauth.clientId()+'&oauthurl='+background.oauth.redirectUrl());
	if (background.debug) $('#clearcache').show();

	let signed =  background.oauth.authorized();
	log(signed);
	Netflix.init(background,signed);
	Crunchy.init(background,signed);

	let countInterval;

	background.statusCallback = Base.onStatusUpdate;
	addEventListener("unload", event => {
		background.statusCallback = null;
		if (countInterval) clearInterval(countInterval);
	}, true);

	Base.loadCheckingText();
	Base.loadAboveCheckText();

	let $checkNow = $('#check-now');
	if (background.netflix.checking() || background.crunchy.checking()) $('.ExtBlockChecking').show(); else $('.ExtBlockChecking').hide();

	$('.ExtSettingsNextCounter').hide();
	$checkNow.toggle((background.netflix.enabledExport() && !background.netflix.checking()) || (background.crunchy.enabledExport() && !background.crunchy.checking()));

	Base.showTrackedStatuses();
	countdownTick();

	$checkNow.on('click',Base.checkNow);

	// clear cache
	countInterval = setInterval(countdownTick, 1000);
});

function countdownTick() {
	if (background.netflix.enabledExport() || background.crunchy.enabledExport()) {

		let nextCheck = moment(background.lastChecked);
		nextCheck.add(background.timerStreach);

		let now = moment(),
			coundDown = moment(nextCheck, "DD/MM/YYYY HH:mm:ss").diff(moment(now, "DD/MM/YYYY HH:mm:ss"));

		if (coundDown <= 0) {
			background.timerUpdate();
			coundDown = 0;
		}
		let nextCheckIn = moment.utc(coundDown).format("mm:ss");

		// outputs: "00:39:30"
		$('.ExtSettingsNextCounter').show().text('Next history check in ' + nextCheckIn);
		if (!background.netflix.checking() && !background.crunchy.checking()) $('#check-now').show();

		let $c = $('#netflixCount');
		if (background.netflix.checking()){
			!$c.is(':visible') && $c.show();
			$c.find('span:eq(0)').text(background.netflix.queueCount(true) - background.netflix.queueCount());
			$c.find('span:eq(1)').text(background.netflix.queueCount(true));
		}else{
			$c.is(':visible') && $c.hide();
		}
	} else {
		$('.ExtSettingsNextCounter').hide();
		$('#check-now').hide();
	}
}

/*
$(document).ready(function () {
	$('#netflixLastWatched, .ExtSettingsNextCounter').html('');

	$('#SimklIFrame').attr('src',host+'/chromeapp?v7&token='+background.oauth.token()+'&client_id='+background.oauth.clientId()+'&oauthurl='+background.oauth.redirectUrl());
	if (background.debug) $('#clearcache').show();

    $('#ext_version').text('v'+chrome.runtime.getManifest().version);

	if (background.oauth.authorized()){
		var countInterval;

		$('#extBlockSettings').show();

		background.statusCallback = onStatusUpdate;
		addEventListener("unload", function (event) {
			background.statusCallback = null;
			if (countInterval) clearInterval(countInterval);
		}, true);

		loadSettings();
		loadCheckingText();
		loadAboveCheckText();

		var $checkNow = $('#check-now'), $toggleNF = $('#togglenetflix'), $toggleCrunchy = $('#toggleCrunchy');
		if (background.netflix.checking() || background.crunchy.checking()) $('.ExtBlockChecking').show(); else $('.ExtBlockChecking').hide();

		$('.ExtSettingsNextCounter').hide();
		$checkNow.toggle(($toggleNF.is(':checked') && !background.netflix.checking()) || ($toggleCrunchy.is(':checked') && !background.crunchy.checking()));

		$toggleNF.click(toggleNetflix);
		$toggleCrunchy.click(toggleCrunchy);

		showTrackedStatuses();

		countdownTick();

		$checkNow.click(checkNow);

		// clear cache
		$('#clearcache').click(function () {
			storage.clear();
		});

		countInterval = setInterval(countdownTick, 1000);

		var $NFico = $('#netflixSettingsIco');
		if (!$toggleNF.is(':checked') || !background.netflix.getAllAccounts()[0].length) $NFico.hide();

        $NFico.on('click',showNetflixSelectAccounts);
		
		$('.netflixsettingssavebtn').on('click',function () {
			var $top = $(this).closest('.netflixsettings');
            var userName = $top.find('select option:selected').text();
            userName && background.netflix.setSavedUser(userName);
            $top.hide();
            $('#extBlockSettings, .ExtBlockIframe').show();
        })
	}else{
		$('#extBlockSettings').hide();
	}
});


*/

/*********
 function toggleCrunchy() {
	var state = $('#toggleCrunchy').is(':checked');
	background.crunchy.enable(state);
	$('#togglecrunchyname').toggleClass('Active', state);
	if (state) {
		showTrackedStatuses();
		loadCheckingText();
		checkNow();
	}
	loadAboveCheckText();
}

 function toggleNetflix() {
	var state = $('#togglenetflix').is(':checked');
	var $ico = $('#netflixSettingsIco');
	background.netflix.enable(state);
	$('#togglenetflixname').toggleClass('Active', state);

	if (state) {
		background.netflix.getAllAccounts()[0].length && $ico.show();
		showTrackedStatuses();
		loadCheckingText();
		checkNow();
	}else {
        $ico.hide();
	}
	loadAboveCheckText();
}

 function checkNow() {
	$('#check-now').hide();
	$('.ExtBlockChecking').show();

	// force check
	background.timerUpdate();
}

 function loadCheckingText(){
	var checkingAr = [];
	var checkingText = 'Netflix, Crunchyroll';

	if (background.netflix.enable()) checkingAr.push('Netflix');
	if (background.crunchy.enable()) checkingAr.push('Crunchyroll');
	if (checkingAr.length < 3) checkingText = checkingAr.join(' and ');

	$('.ExtBlockCheckingTitle').text('Checking ' + checkingText);
}

 function loadAboveCheckText(){
	$('#check-text').text(background.netflix.enable()||background.crunchy.enable()?'This extention will check my watch history from:':'Please enable services to check your watch history from:');
}

 function loadSettings() {

	var netflixActive = background.netflix.enable();
	log('got storage: netflix ' + netflixActive);
	$('#togglenetflix').prop('checked', netflixActive);
	$('#togglenetflixname').toggleClass('Active', netflixActive);

	var crunchyActive = background.crunchy.enable();
	log('got storage: crunchy ' + crunchyActive);
	$('#toggleCrunchy').prop('checked', crunchyActive);
	$('#togglecrunchyname').toggleClass('Active', crunchyActive);
}

 var netflixDiffUserTPL = '';
 function setTrackerStatus(type){
	var bg = background[type];
	var video = bg.lastVideo();

    type === 'netflix' && log(' in popup: '+bg.isErrorAccountDetect());
	if (!bg.enable()) {
		$('#'+type+'NeedsLogin, #'+type+'ErrorUser').hide();
		$('#'+type+'LastWatched').html('').show();
	} else if (bg.authorized() === false) {
		$('#'+type+'LastWatched, #'+type+'ErrorUser').hide();
        $('#'+type+'NeedsLogin').show();
	} else if (type === 'netflix' && bg.isErrorAccountDetect() !== null){ //some user error, netflix
        $('#'+type+'NeedsLogin, #'+type+'LastWatched').hide();
        var $eu = $('#'+type+'ErrorUser');
		var $spans = $eu.find('span').hide();
		if (bg.isErrorAccountDetect() === true) $spans.first().show();
		else {
			var allUsers = bg.getAllAccounts();
			log(allUsers);
			if (!netflixDiffUserTPL) netflixDiffUserTPL = $spans.eq(1).text();
			$spans.eq(1).text(netflixDiffUserTPL.replace('{last}',allUsers[1]).replace('{current}',allUsers[2])).show();
        }
        $eu.show();
	}else if (video) {
		var SE = '';
		if (video.season) {
			SE = ' S' + video.season + 'E' + video.episode;
		}else if (video.episode){
			SE = ' - Episode '+video.episode;
		}

		var link = $("<a />", {
			text: (video.seriesTitle?video.seriesTitle+': ':'')+video.title+SE,
			href: apiHost+'/redirect?to=Simkl&'+type+'='+video.id+'&client_id='+background.oauth.clientId(),
			target: '_blank'
		});

		$('#'+type+'LastWatched').html('Last watched: ').append(link).show();
        $('#'+type+'NeedsLogin, #'+type+'ErrorUser').hide();
	} else {
		// error case?
        $('#'+type+'NeedsLogin, #'+type+'ErrorUser').hide();
		$('#'+type+'LastWatched').html('').show();
	}
}

 function showTrackedStatuses() {
	log('in showTrackedStatuses');
	setTrackerStatus('netflix');
	setTrackerStatus('crunchy');

	background.setIcon();
}

 function showNetflixSelectAccounts() {
    var acc = background['netflix'].getAllAccounts();
    var $nfSett = $("#netflixSettings");

    var _h = '';
    log(acc);
    $.each(acc[0], function (i, item) {
        _h += '<option '+(acc[1] === item?'selected':'')+'>'+item+'</option>';
    });
    $nfSett.find('select').html(_h);

    $('#extBlockSettings, .ExtBlockIframe').hide();
    $nfSett.show();
}

 function onStatusUpdate(status,provider) {
	// do nothing for now, only ui changes.
	log('Status update: '+status);
	if (status === 'updating') {
		$('.ExtBlockChecking').show();
		$('#check-now').hide();
		if (provider) $('#'+provider+'NeedsLogin, #'+provider+'ErrorUser').hide();
	} else {
		$('.ExtBlockChecking').hide();
		$('#check-now').show();

		showTrackedStatuses();
	}
}

 function countdownTick() {
	if (background.netflix.enable() || background.crunchy.enable()) {

		var nextCheck = moment(background.lastChecked);
		nextCheck.add(background.timerStreach);

		var now = moment();
		var coundDown = moment(nextCheck, "DD/MM/YYYY HH:mm:ss").diff(moment(now, "DD/MM/YYYY HH:mm:ss"));

		if (coundDown <= 0) {
			background.timerUpdate();
			coundDown = 0;
		}
		var nextCheckIn = moment.utc(coundDown).format("mm:ss");

		// outputs: "00:39:30"
		$('.ExtSettingsNextCounter').show().text('Next history check in ' + nextCheckIn);
		if (!background.netflix.checking() && !background.crunchy.checking()) $('#check-now').show();

		var $c = $('#netflixCount');
		if (background.netflix.checking()){
			!$c.is(':visible') && $c.show();
			$c.find('span:eq(0)').text(background.netflix.queueCount(true) - background.netflix.queueCount());
			$c.find('span:eq(1)').text(background.netflix.queueCount(true));
		}else{
			$c.is(':visible') && $c.hide();
		}
	} else {
		$('.ExtSettingsNextCounter').hide();
		$('#check-now').hide();
	}
}

 **/