var cache = {},ratingGlobalData,hoverTimer,oldUrl = window.location.href;
var clientID = 'a7be48f1559a6d794w1925237c626326c7be48f1559a6d794w1925137c626315';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request){
		if (request.action == 'updatePosters'){ // response on ids
			saveToCachePosters(request.data);
		}else if (request.action == 'updateHover'){
			var elem = document.getElementById('SimklHoverRatingTab');
			if (elem) elem.parentNode.removeChild(elem);

			ratingGlobalData = request.data;
			addRatings();
		}else if (request.action == 'getRandom'){
			if (request.data.netflix_url) window.location = request.data.netflix_url;
			else if (request.data.simkl_url) window.location = request.data.simkl_url;
			else if (request.data.error == 'not_found') alert('Sorry, not found anything with these filters, try another one.');
		}

	}
});

function sendMessage(action, items, callback){
	let m = {type: 'netflix', action: action};
	if (items) m.items = items;

	chrome.runtime.sendMessage(m,callback);
}

let _isGreyed = false, _isSecret = true;
sendMessage('load',null,r=>{
	_isGreyed = r.grey;
	_isSecret = r.secret;
	console.log(r);
});

setTimeout(monitorDOM,1000); // some strange goin'on on starting

var isLowScreen = false;
if (window.innerWidth <= 1240) isLowScreen = true;

/*var randomData = null;
$.get(chrome.extension.getURL('/netflix_random_tpl.html'), function(data) {
	randomData = data;
});*/

var engine = false;
function monitorDOM(){
	// onchange url
	if (window.location.href && oldUrl!= window.location.href) {
		oldUrl = window.location.href;
		cache = {};
	}

	//browse
	let $iUL = $('ul.tabbed-primary-navigation');
	if (_isSecret && !document.querySelector('#SimklBrowse')) $().secret($iUL.find('li:eq(1)'));
	if (_isGreyed && !document.body.classList.contains('SimklGreyOut')) document.body.classList.add('SimklGreyOut');

	var elems = null;

	if (!engine || engine === 1){
		elems = document.querySelectorAll('div.smallTitleCard');
		if (!engine && elems && elems.length && elems[0].getAttribute('href')) engine = 1;
	}

	if (!engine || engine === 2){
		elems = document.querySelectorAll('div.smallTitleCard .ptrack-content');
		if (!engine && elems && elems.length) engine = 2;
	}

	if (!engine || engine === 3){
		elems = document.querySelectorAll('div.slider-item .ptrack-content');
		if (!engine && elems && elems.length) engine = 3;
	}

	if (elems) {
		var id = [], toUpdate = [];

		if (engine === 3){
			let bobstall = document.getElementsByClassName('title-card-tall-panel');
			for (let i=0,len = bobstall.length; i<len;i++){
				if (bobstall[i].dataset.u) continue;

				bobstall[i].setAttribute('data-u','true');
				bobstall[i].addEventListener('mouseenter',function(){
					var _ptrack = this.parentElement.getElementsByClassName('ptrack-content');
					if (_ptrack.length) fetchRates.call(_ptrack[0])
				});
			}
		}

		for (let i=0,len = elems.length; i<len;i++){
			if (elems[i].dataset.u) continue;

			elems[i].addEventListener('mouseenter',fetchRates);

			var _id = null, m = null;

			if (engine == 1){
				_id = elems[i].getAttribute('href');
				if (_id) m = _id.match(/watch\/([0-9]+)/);
			}else if (engine == 2 || engine == 3){
				_id = elems[i].getAttribute('data-ui-tracking-context');
				if (_id) m = _id.match(/video_id%22:([0-9]+)/);
			}

			if (m){
                elems[i].setAttribute('data-u',m[1]);
				if (parseInt(m[1])<100) continue;

				if (!cache[m[1]]) {
					id.push(m[1]);
					cache[m[1]] = {
						fetching: true
					};
				} else if (!cache[m[1]].fetching){
					toUpdate.push(cache[m[1]]);
				}
			}
		}

		// we do not have these ids yet, send it to simkl
		if (id.length) {
			console.log('In Ids');
			sendMessage('recvItems',id);
		}
		// we have these in our cache variable. Update
		if (toUpdate.length) {
			console.log('ToUpdate');
			updatePosters(toUpdate);
			log(toUpdate);
		}
	}


	//var duration = performance.now() - start;
	//console.log('Duration: '+duration);
	setTimeout(monitorDOM,1000);
}

window.addEventListener('message', function(event) {
	if (event.data){
        if (event.data.event_id === 'close_frame') {
            $('.simklnetflixiframepopup').remove();
            $('body').css('overflow','auto');
        }else if (event.data.event_id === 'add_frame') {
        	$('body').prepend('<div class="simklnetflixiframepopup" onclick="window.postMessage({event_id:\'close_frame\'},\'*\')"><div><iframe onload="this.style.display = \'block\'" src=\'https://widgets.simkl.com/reactions?simkl='+event.data.simkl_id+'\' allowfullscreen></iframe></div></div>')
				.css('overflow','hidden');
        }
    }
});

// RATINGS
var lastHoverId,limitHoverCount = 0;
function fetchRates(){
	if (hoverTimer){ // if not found then it uses old datas, fixed
		clearTimeout(hoverTimer); hoverTimer = null;
	}
	var _id = this.getAttribute('data-u');
	lastHoverId = _id;
	limitHoverCount = 0;

	if (_id){ // cache has all ids cause it has got all statuses on start
		if (cache[_id] && cache[_id].result == 'not_found') {
			//nothing
		}else{
			console.log('Getting rates');
			sendMessage('getRatings',_id);
		}
	}
}

var TPL = {
	main : '<div class="SimklNetflixRatingsHoverWraper" id="SimklHoverRatingTab"><table width="100%" border="0" cellpadding="0" cellspacing="0" ><tbody><tr>{mal}{imdb}{simkl}{rank}{drop}{trailer}<td width="10%" align="center" class="SimklNetflixRatingsHoverEmpty">&nbsp;</td></tr></tbody></table></div>',
	imdb : '<td align="center"><table border="0" align="center" cellpadding="0" cellspacing="0" class="SimklNetflixRatingsHoverIMDB" {u}><tbody><tr><td><img src="https://us.simkl.in/img_tv/ico_imdb_netflix.png" alt="IMDB"/></td><td class="SimklNetflixRatingsHoverRating">{f}</td></tr><tr><td colspan="2" align="center" class="SimklNetflixRatingsHoverVotes">{s} votes</td></tr></tbody></table></td>',
	mal  : '<td align="center"><table border="0" align="center" cellpadding="0" cellspacing="0" class="SimklNetflixRatingsHoverIMDB" {u}><tbody><tr><td><img src="https://us.simkl.in/img_tv/ico_mal_netflix.png" alt="MAL"/></td><td class="SimklNetflixRatingsHoverRating">{f}</td></tr><tr><td colspan="2" align="center" class="SimklNetflixRatingsHoverVotes">{s} votes</td></tr></tbody></table></td>',
	simkl: '<td align="center"><table border="0" align="center" cellpadding="0" cellspacing="0" class="SimklNetflixRatingsHoverSimkl" {u}><tbody><tr><td><img src="https://us.simkl.in/img_tv/ico_simkl_netflix.png" alt="Simkl"/></td><td class="SimklNetflixRatingsHoverRating">{f}</td></tr><tr><td colspan="2" align="center" class="SimklNetflixRatingsHoverVotes">{s} votes</td></tr></tbody></table></td>',
	rank : '<td align="center"><table border="0" align="center" cellpadding="0" cellspacing="0" class="SimklNetflixRatingsHoverRank" {u}><tbody><tr><td class="SimklNetflixRatingsHoverRankText">{f} RANK</td></tr><tr><td class="SimklNetflixRatingsHoverRankValue">#{s}</td></tr></tbody></table></td>',
	drop : '<td align="center"><table border="0" align="center" cellpadding="0" cellspacing="0" class="SimklNetflixRatingsHoverDrop" {u}><tbody><tr><td class="SimklNetflixRatingsHoverDropText">DROP RATE</td></tr><tr><td class="SimklNetflixRatingsHoverDropValue">{f}</td></tr></tbody></table></td>',
	trailer: '<td align="center" class="SimklNetflixRatingsHoverTrailer"><img src="https://us.simkl.in/img_tv/ico_trailer_netflix.png" width="42" height="30" alt="trailer" {u}/></td>'
};

function addRatings(){
	++limitHoverCount; if (limitHoverCount>30) return;
	var data = ratingGlobalData;
	var rd = document.getElementById('SimklHoverRatingTab');
	if (!rd){
		var _u = 'onclick="window.open(\'https://api.simkl.com/redirect?to=simkl&simkl='+data.id+'&client_id='+clientID+'\',\'_blank\'); event.stopImmediatePropagation();"';
		var t = TPL.main;
		t = _r(t,'mal',data.MAL?{f:data.MAL.rating,s:data.MAL.votes,u:_u}:null);
		t = _r(t,'imdb',!data.MAL && data.IMDB?{f:data.IMDB.rating,s:data.IMDB.votes,u:_u}:null);
		t = _r(t,'simkl',data.simkl?{f:data.simkl.rating,s:data.simkl.votes,u:_u}:null);
		t = _r(t,'rank',data.rank?{f:data.rank.type == 'show'?'TV':(data.rank.type == 'anime'?'ANIME':'MOVIE'),s:data.rank.value,u:_u}:null);
		t = _r(t,'drop',data.droprate?{f:data.droprate,u:_u}:null);
		t = _r(t,'trailer',data.has_trailer && !isLowScreen?{f:data.id,u:_u.replace('=simkl','=trailer')}:null);

		var _total = data.reactions?data.reactions.total:0,
			postText = 'window.postMessage({event_id:\'add_frame\',simkl_id:'+data.id+'},\'*\')';
			$preview = $('.previewModal--info');
		if ($preview.length){ //new design
			data.release_year && (t+='<div class="SimklNetflixHoverYear" onclick="'+postText+'">'+data.release_year+'</div>');
			t+='<div class="SimklNetflixHoverReaction" onclick="'+postText+'">' +(_total?_total+' reaction'+(_total>1?'s':''):'Add Reaction')+'</div>';
			$(t).insertBefore($preview);

		}else{
			var wr = $('.slider-item .ptrack-content[data-u=\''+lastHoverId+'\']');
			if (wr.length) {
				var up = wr.closest(engine === 3?'.slider-item':'.smallTitleCard');

				up.find('.bob-overview-wrapper').append(t);
				data.release_year && !up.find('.SimklNetflixTitleYear').length && up.find('.bob-title').append(' <span class="SimklNetflixTitleYear">'+data.release_year+'</span>');

				!up.find('.SimklNetflixHoverReaction').length
				&& up.find('.bob-overlay').append(' <div class="SimklNetflixHoverReaction" onclick="'+postText+'">' +(_total?_total+' reaction'+(_total>1?'s':''):'Add Reaction')+'</div>');
			}
		}

		hoverTimer = setTimeout(addRatings,500);
	}
}


function _r(t,e,fs) {
	return t.replace('{' + e + '}', fs ? TPL[e].replace('{f}', fs.f).replace('{s}', fs.s ? fs.s : '').replace('{u}', fs.u) : '');
}

// STATUSES
// we get it from simkl, store to cache and update it
function saveToCachePosters(r){
	let id = [];
	for (let i=0;i<r.length;++i){
		cache[r[i].netflix] = r[i];
		id.push(r[i]);
	}

	if (id.length) updatePosters(id);
}

function updatePosters(r){
	for (let i=0;i<r.length;++i) {
		if (r[i].result == true) {
			let list = r[i].list;
			let cl = list == 'watching' ? 'SimklNetflixPosterWatching' : (list == 'completed' ? 'SimklNetflixPosterCompleted' : (list == 'dropped' ? 'SimklNetflixPosterNotInteresting' : 'SimklNetflixPosterPlanToWatch'));
			//log(cl + ' - ' + r[i].netflix);

			$('.slider-item div[data-u="' + (r[i].netflix) + '"]').each(function () {
				$(this).closest('.title-card-container').addClass(cl).find('.title-card').append('<div class="SimklStatusIco"></div>');
			});
		}
	}
}

function log(l){console.log(l);}

function setCookie(c_name,value,exsec){
	var exdate = new Date();
	exsec = exsec!==undefined?exsec:2592000;
	exsec && exdate.setTime(exdate.getTime() + exsec*1000);
	document.cookie = c_name + "=" + encodeURI(value) + (exsec? "; expires="+exdate.toUTCString()+'; path=/; SameSite=None; Secure' : "");
}
function getCookie(c_name){
	var c_value = document.cookie;
	var c_start = c_value.indexOf(" " + c_name + "=");
	if (c_start == -1) {
		c_start = c_value.indexOf(c_name + "=");
	}
	if (c_start == -1) {
		c_value = null;
	}
	else {
		c_start = c_value.indexOf("=", c_start) + 1;
		var c_end = c_value.indexOf(";", c_start);
		if (c_end == -1) {
			c_end = c_value.length;
		}
		c_value = unescape(c_value.substring(c_start, c_end));
	}
	return c_value;
}
