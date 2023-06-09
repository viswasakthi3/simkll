let crunchyApi = function (simkl, statusCallback) {
    let config = {Active: false, EnabledExport: false, EnabledZeroExport: false, version:1};
	let checking = false, authorized = null, // can be null, false, true.
		storage = storageClass(),
		oAuth = {
			domain: 'https://beta-api.crunchyroll.com',
			token: '',
			id: '',
			clientId : ''
		},
		sentCrunchyId = [];

	let	crunchyActivityUrl = 'https://www.crunchyroll.com/home/history/ajax_page?items_per_page=40',
		lastCrunchyVideo = null,
		lastCrunchyVideoFirst = false,
		page = 1,
		lastCrunchyId;

	function checkUpdates() {
		if (checking) return;

		page = 1;
		checking = true;
		updateStatus();

		if (sentCrunchyId.length>limitToSync) {
			sentCrunchyId = sentCrunchyId.slice(sentCrunchyId.length-limitToSync);
			storage.set('watchedCrunchyInfo', sentCrunchyId);
		}
		countRepeat = 0;
		lastCrunchyId = sentCrunchyId;

		lastCrunchyVideoFirst = true;
		config.version===2?successCrunchyV2():successCrunchy(crunchyActivityUrl);
	}


	let limitToSync = 2,countRepeat = 0;
	function successCrunchy(url){
		log('parse Crunchy: '+url);

		$.ajax({
			url: url,
            timeout: 15000,
			success: function (data) {
				if (data.indexOf('login-or-signup-page')>-1) authorized = false;
				else{
					authorized = true;
					if (data.indexOf('__APP_CONFIG__')>-1) {
						if (loadToken(data)) { successCrunchyV2(); return;} else authorized = false;
					}
				}
				updateStatus();

				log(crunchyActivityUrl+'&page='+page);
				if (authorized && parseCrunchyHistory(data) && !debug){
					successCrunchy(crunchyActivityUrl+'&page='+(++page));
				}else{
					checking = false;
					updateStatus();
				}
			},
			error: function (err) {
				console.log('HTTPS ERROR');
				console.log(err);
				// if 403 error
				offStatus();
			}
		});
	}

	async function successCrunchyV2(){
		config.version = 2;
		log('parse Crunchy V2: ');

		if (oAuth.clientId){ //authentificate
			let r = await apiCall('/auth/v1/token','basic');
			if (typeof r === 'object' && r.access_token){
				oAuth.token = r.access_token;
				oAuth.id = r.account_id;
			}else offStatus();
		}

		if (oAuth.id){
			let cPage = 0;
			while(true){
				const r = await apiCall('/content/v1/watch-history/'+oAuth.id+'?page_size=100&page='+(++cPage));
				if ([401,405].includes(r)) {
					offStatus(true);
					successCrunchy(crunchyActivityUrl);
					return;
				}//expired token
				else if (typeof r == 'object' && r.items?.length){
					if (parseCrunchyHistoryV2(r) && !debug) continue;
				}
				break;
			}
			checking = false;
			updateStatus();
		}
		//https://beta-api.crunchyroll.com/content/v1/watch-history/2ab9c46d-6cd1-559e-a01c-f5cefa62b751?page_size=100&locale=ru-RU
	}

	function parseCrunchyHistory(data) {
		let $items = $('li','<div>'+data+'</div>');

		$items.each(function(){
			let title = $('.series-title',this).text();
			let regEp = $('.short-desc',this).text().match(/Episode\s([0-9]+)\s-\s(.+)/i);
			if (regEp){ var episode = regEp[1], epTitle = regEp[2];}
			let id = $('a',this).attr('href').match(/[0-9]+$/i);
			id = id?id[0]:0;
			let progress = parseInt($('.episode-progress',this).css('width'));

			if (progress>70 || (!progress && config.EnabledZeroExport)) {
				if (!sendWatched(id,episode,title,epTitle))
					return false;
			}else log('low progress '+progress);
		});

		return $items.length && countRepeat<limitToSync;
	}

	function parseCrunchyHistoryV2(r){
		return r.items.every(item=>{
			let panel = item?.panel || {};
			if (!panel.episode_metadata) return true;

			let progress = item.fully_watched?1:(item.playhead/(panel.episode_metadata.duration_ms/1000)),
				episode = panel.episode_metadata.episode_number,
				title = panel.episode_metadata.series_title,
				epTitle = panel.title,
				id = item.id,
				moreData = {
					seriesSlug: panel.episode_metadata.series_slug_title,
					played: item.date_played,
					date: panel.episode_metadata.episode_air_date
				}

			log(progress+' - '+title+' - '+' - '+epTitle+' - '+episode+' - '+id)

			if (progress>0.7 || (!progress && config.EnabledZeroExport)) {
				if (!sendWatched(id,episode,title,epTitle,moreData))
					return false;
			}else log('low progress '+progress);

			return true;
		});
	}

	function sendWatched(id,episode,title,epTitle, moreData = {}){
		let lastVideoId = id;
		log('crunchy: '+lastVideoId);
		if (lastCrunchyId.indexOf(lastVideoId) === -1) {
			let itemObj = Object.assign({
				'id'	: lastVideoId,
				'title'	: epTitle || '',
				'seriesTitle': title,
				'episode'	: episode || 0
			},moreData);
			if (lastCrunchyVideoFirst) lastCrunchyVideo = itemObj; // set last watched crunchy:
			lastCrunchyVideoFirst = false;
			// send off to the mothership
			simkl.saveHistory('', lastVideoId, 'crunchy', function (videoId) { // order is not matter, next iteration will be fine.
				if (sentCrunchyId.length<limitToSync*2){
					sentCrunchyId.push(videoId);
					// save watchedInfo
					storage.set('watchedCrunchyInfo', sentCrunchyId);
				}
			},moreData.seriesSlug?itemObj:null);
		}else if (++countRepeat >= limitToSync) return false;
		return true;
	}

	function updateStatus() {statusCallback('crunchy', checking);}

	function loadSetting() {
		storage.get(['CrunchyActive','CrunchyEnabledExport','CrunchyEnabledZeroExport','watchedCrunchyInfo'],data =>{
			sentCrunchyId = [];
			for(let k in data){
                if (config[k.replace('Crunchy','')]!==undefined) config[k.replace('Crunchy','')] = data[k];
				else if (k === 'watchedCrunchyInfo') sentCrunchyId = data[k] || [];
			}
			//if (debug) sentCrunchyId = [];
		});
	}

    function setConfig(k,v) {
        if (v!==undefined && config[k]!==undefined) {
            storage.set('Crunchy'+k, v);
            config[k] = v;
            updateStatus();
        }else{
            log('GET CRUNCHY'+k+': '+v+' - '+config[k]);
            return config[k];
        }
    }

	function loadToken(data){
		let found = data.match(/accountAuthClientId":"([^"]+)/i);
		log('found: '+found[1]);
		found && (oAuth.clientId = found[1]);

		return !!oAuth.clientId;
	}

	function offStatus(skipStatusChange = false){
		config.version = 1;
		oAuth.token = oAuth.id = oAuth.clientId = '';
		if (!skipStatusChange){
			authorized = checking = false;
			updateStatus();
		}
	}

	function apiCall(path, mode = 'barear') {
		const reqUrl = oAuth.domain + path;
		const options = {
			url: reqUrl,
			headers: {Accept: 'application/json'},
		};

		if (mode === 'basic') {
			options.headers.authorization = 'Basic '+btoa(oAuth.clientId+':');
			options.headers['content-cype'] = 'application/x-www-form-urlencoded';
			options.data = 'grant_type=etp_rt_cookie';
			oAuth.clientId = '';
		}
		if (mode === 'barear' && oAuth.token) options.headers.authorization = 'Bearer '+oAuth.token;

		console.log('API: method '+mode);

		return new Promise(function (resolve, reject) {
			$.ajax({
				url: options.url,
				method:mode==='barear'?'GET':'POST',
				data: options.data || null,
				headers: options.headers || {},
				success: data=> resolve(data),
				error: err=>{
					log(err);
					resolve(err.status);
				}
			});
		});
	}



	// on init:
	loadSetting();

	return {
		checkUpdates,
		authorized: ()=>authorized,
		checking: ()=>checking,
		lastVideo: ()=>lastCrunchyVideo,
        config:			setConfig,
		restartImport: ()=>sentCrunchyId = [],
        enabled:		()=>config.Active,
        enabledExport:	skip=>(config.Active || !!skip) && config.EnabledExport && oauth.authorized(),
        enabledZeroExport:skip=>(config.Active || !!skip) && config.EnabledZeroExport
	};
};
