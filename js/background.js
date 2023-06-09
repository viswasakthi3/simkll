/*
 Simkl tracker, (c) 2018. all rights reserved. simkl.com
 */
var timer = null,
	timerStreach = 30 * 60 * 1000, // 5 mins
	lastChecked = moment();

var debug  = false, statusCallback = null,
	storage = storageClass(),
 	oauth = simklOauth(statusUpdate),
	simkl = simklApi(oauth, statusUpdate),
	netflix = netflixApi(simkl, statusUpdate,sendMessage),
	crunchy = crunchyApi(simkl, statusUpdate);

(function onStart() {
	if (!oauth.isInitiated()) { setTimeout(onStart,500);return;}

	timer = setInterval(timerUpdate, timerStreach); // 5 mins
	if (!oauth.authorized()) oauth.authorize($('#SimklOauth'));
	//storage.clear();
})();

function statusUpdate(provider, active) {
	if (netflix === undefined || crunchy === undefined) return;

	let status = 'waiting';

	if ((netflix.enabledExport() && netflix.checking()) || (crunchy.enabledExport() && crunchy.checking())) status = 'updating';
	if (statusCallback) statusCallback(status,provider);

	if (provider === 'oauth' && active === 'logged') getWatchHistory();
	setIcon();
}

function sendMessage(tabId,message,callback){chrome.tabs.sendMessage(tabId, message, callback);}

function timerUpdate() {
	lastChecked = new Date();
	if (oauth.authorized){
		log('do Checking');
		getWatchHistory();// netflix, by default all are disabled
	}
}

function getWatchHistory() {
	if (netflix.enabledExport()) netflix.checkUpdates();
	if (crunchy.enabledExport()) crunchy.checkUpdates();
}


let normal = 'ico/ico_19x19_main.png',
	watched = 'ico/ico_19x19_marked_as_watched.png',
	error = 'ico/ico_19x19_alert.png',
	green = 'ico/ico_19x19_green.png',
	orange = 'ico/ico_19x19_orange.png',
	red = 'ico/ico_19x19_red.png',
	refresh = 'ico/ico_refresh.png';
let currentIcon = normal; // on setup
function setIcon() {
	let newIcon = normal;
	// not authorized on simkl is an error if trackers are enabled.
	if (netflix.enabledExport() || crunchy.enabledExport()){
		if (!oauth.authorized()) newIcon = red;
		else if (netflix.authorized() === false || crunchy.authorized() === false) newIcon = error;
		else if (netflix.isErrorAccountDetect()!==null) newIcon = red;
		else if (netflix.checking() || crunchy.checking()) newIcon = refresh;
	}
	log('icon '+newIcon);
	if (currentIcon !== newIcon) {currentIcon = newIcon; chrome.browserAction.setIcon({path: newIcon});}
}

chrome.runtime.onMessage.addListener(function (request, sender, response) {
	if (request.type === 'netflix'){
		if (request.action === 'load') {netflix.updateCache();
		response && response({grey: netflix.enabledGrey(),secret: netflix.enabledSecret()});}
		if (request.action === 'recvItems' && oauth.authorized() && (netflix.enabledRatings()) || netflix.enabledGrey()) netflix.fetchItems(request.items,sender.tab);
		if (request.action === 'getRatings' && netflix.enabledRatings()) netflix.getRatings({id: request.items,tab: sender.tab.id});
		if (request.action === 'getRandom')   netflix.getRandom({url: request.items,tab: sender.tab.id});
	}
});

chrome.contentScripts.register({
	css:[{file: 'css/netflix.css'}],
	js: [
		{file: 'js/utils/jquery-2.1.3.min.js'},
		{file: 'js/utils/storage.js'},
		{file: 'js/netflix_content_secret.js'},
		{file: 'js/netflix_content.js'}
	],
	run_at: 'document_idle',
	allFrames: true,
	matches: [
		'https://www.netflix.com/title*',
		'https://www.netflix.com/browse*',
		'https://www.netflix.com/search*',
		'https://www.netflix.com/latest*',
		'https://www.netflix.com/Kids*',
	]
});

if(chrome.runtime.setUninstallURL) chrome.runtime.setUninstallURL('https://simkl.com/apps/chrome/enhancer/goodbye/');
if(chrome.runtime.onInstalled) chrome.runtime.onInstalled.addListener(details => {(details.reason === 'install' || details.reason === 'update') && chrome.tabs.create({ url: 'https://simkl.com/apps/chrome/enhancer/'+(details.reason === 'update'?'updated':'installed')+'/'});});