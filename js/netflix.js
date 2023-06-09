var netflixApi = function (simkl, updateCallback,sendToContent) {
	let config = {Active: false, EnabledExport: false, EnabledGrey: false, EnabledSecret: true, EnabledRatings: true};
	let checking = false, authorized = null; // can be null, false, true.
	let totalQueue = 0, sendQueue = [], /* queue which are sending to simkl*/ watchedInfo = {}; // object where
	//content datas
	let itemsData = {}, badOffset = 7*86400, oldRateOffset = 14*86400, ajaxQ = null;
	let viewingActivityUrl = 'https://www.netflix.com/WiViewingActivity', lastNetflixVideo = null;
	let shakti2 = null;

	let importDate = 0 , oldImportDate = 0, errorRetry = 0;;
	let savedUser = null, activeUser = null, allUsers = [];

	function checkUpdates(newRetry = true) {
		if (checking) return;
		checking = true;
		updateStatus();

		//if (debug) importDate = 0;

        totalQueue = oldImportDate = 0;
		lastNetflixVideo = null;

		if (!shakti2) {
			getShakti(getHistory, function (text) {
				newRetry && (errorRetry = 0);
				log('Shakti error: ' + text);
				authorized = checking = false;
				updateStatus();
			});
		} else {
			getHistory();
		}
	}

	function getShakti(onSucceed, onError,opt) {
		ajaxQ = $.ajax({
			url: viewingActivityUrl,
            timeout: 15000,
			success: data=> {
				ajaxQ = null;
				if (data && (data.indexOf('https://www.netflix.com/Login?nextpage=') > -1 || data.indexOf('login-submit-button')>-1)) onError('login');
				else {
					let sPos2 = data.indexOf('BUILD_IDENTIFIER":"')+19;
					if (sPos2 > 25) {
						let _sh2 = data.substr(sPos2, data.indexOf('"', sPos2) - (sPos2)).replace(/["\s]/g, '');
						if (_sh2.match(/[A-Za-z0-9]+/g)) {
							shakti2 = _sh2;
							storage.set('shakti2', shakti2);
							log('Netflix auth succeed');

							//Get Active user
                            let sPosProf = data.indexOf('current-profile'),
                            	_profilesHTML = sPosProf?data.substr(sPosProf,data.indexOf('/SignOut',sPosProf)-sPosProf):'',
                            	_currentProfile = _profilesHTML.match(/alt="([^"]+)"/);

                            if (_currentProfile){
                                activeUser = _currentProfile[1];
                                allUsers = [activeUser];
								let _m,_re = /<div[^>]+name[^>]+>(.*?)<\/d/g;
                                do { if ((_m = _re.exec(_profilesHTML))) allUsers.push(_m[1]);} while (_m);

                                storage.set('allUsers',allUsers);
                                if (savedUser === null) storage.set('savedUser',(savedUser = activeUser)); //setup defaultUser
                            }else {
                                savedUser = -1;
                            } //we cannot detect the user
							onSucceed(opt);
						} else onError('symbols');
					} else onError('position');
				}
			},
			error: function (err) {
				ajaxQ = null;
				onError('failed to get');
			}
		});
	}

	function getHistory(page) {
		if (!page) page = 0;
        log('HISTOR');
		$.ajax({
			//url: 'https://www.netflix.com/api/shakti/'+shakti2+'/viewingactivity?pg=' + page + '&_retry=0',
			url: 'https://www.netflix.com/api/shakti/mre/viewingactivity?pg=' + page + '&_retry=0',
            timeout: 15000,
			success: data=>{
				errorRetry = 0;
				if (!data.viewedItems.length && !page){
					authorized = checking = false;
					updateStatus();
					return;
				}

				if (authorized!==true) {authorized = true;updateStatus();}

                if (isErrorAccountDetect()!==null){ //after authorize, or error will be thrown
                    log(shakti2); log('BAD ' + activeUser);
                    checking = false;
                    updateStatus();
                    return false;
                }

				let i, len, qLen, exist = false;
				qLen = 0;
				for (i = 0, len = data.viewedItems.length; i < len; ++i) {
					let item = data.viewedItems[i],
						dur = item.duration ? parseInt(item.duration) : 0,
						book = item.bookmark ? parseInt(item.bookmark) : 0;

					if (!dur || (dur>0 && book>-1 && (book * 100 / dur) < 70)) continue;

					//update time for first element
					if (!oldImportDate){
                        oldImportDate = importDate || 1;// otherwise it will stop on next iteration
                        importDate = item.date;
                        storage.set('netflixImportDate', importDate);
					}
					//last parsed text
					if (!lastNetflixVideo) {
						lastNetflixVideo = {
							id: item.series,
							title: item.title,
							seriesTitle: item.seriesTitle
						};
					}

                    /*log(item);
					log(importDate);
					log('new item: '+(item.date>=oldImportDate));
					log(oldImportDate+' - '+typeof oldImportDate);
					log(item.date+ ' - '+typeof item.date);
					//*/
					if (item.date>oldImportDate) {
                        ++qLen;
                        sendQueue.push({
                            id: item.movieID,
                            parent: item.series,
                            date: Math.round(item.date / 1000),
                            title: item.title,
                            country: item.country
                        });
                    } else {exist = true; break;}
					//if (debug) break;
				}
				//log(sendQueue);
				totalQueue += qLen;

				if (len > 0 && !exist) {!debug && getHistory(++page);}
				else {!debug && processQueue();}
				//tmp
				if (debug && len) processQueue();
			},
			error: function (err) {
				console.log(err);
				if (err.status === 404 || err.status === 500) { // wrong shakti2
					console.log('error retry: '+errorRetry);
					setTimeout(()=>{
						shakti2 = null;
						storage.set('shakti2', null);
						checking = authorized = false;

						if (++errorRetry<10) checkUpdates(false);
					},5000);
				} else {
					checking = false;
					updateStatus();
				}
			}
		});
	}

	function isErrorAccountDetect() {
		return savedUser === -1?true:(savedUser && activeUser && activeUser!==savedUser?false:null)
    }

	function processQueue(queueItem) {
		if (sendQueue.length > 0 || queueItem) {
			let item = queueItem ? queueItem : sendQueue.shift();

			let pId = item.parent ? item.parent : item.id, fKey = watchedInfo[pId], isBad = fKey && fKey.isBad;
			let info = {isMovie: !item.parent, country: item.country};

			if (!isBad) {
				simkl.saveHistory(item.date, item.id, 'netflix', function (videoId, result) {
					if (!result.not_found) {
						checking = false;
						updateStatus()
					} else {
						if (!queueItem) { // we are doing this only from main loop. If it was called from the detailParser then skipping
							var rj = result.not_found;
							if (rj && (rj.episodes.length || rj.movies.length)) { // we cannot found by ID, try to get additional info
								watchedInfo[pId] = {isBad:true};
								processQueue();
							} else {//successfully added, continuing
								processQueueTimer();
							}
						} else {
							processQueueTimer(); // it was called from detailParse, continuing main loop
						}
					}

				}, info,function () {
                    checking = false;
                    updateStatus();
                });
			} else { // it's bad element(we cannot find it on simkl), going next
				processQueueTimer();
			}

		} else {checking = false;updateStatus()}
	}

	function processQueueTimer() {setTimeout(processQueue, 1000);}

	function updateStatus() {updateCallback('netflix', checking);}

	function loadSetting() {
		let params  = ['netflixImportDate', 'lastNetflixVideo', 'shakti2','savedUser','allUsers'];
		for (let param in config) params.push('Netflix'+param);
		storage.get(params, data=>{
			for (let k in data) {
				if (config[k.replace('Netflix','')]!==undefined) config[k.replace('Netflix','')] = data[k];
				else if (k === 'netflixImportDate') importDate = data[k];
				else if (k === 'lastNetflixVideo') lastNetflixVideo = data[k];
				else if (k === 'shakti2') shakti2 = data[k];
                else if (k === 'savedUser') {
                    savedUser = data[k];
                    log('got savedUser: '+savedUser);
                } else if (k === 'allUsers') {
                	allUsers = data[k];
                	log('got allUsers:');
                    log(allUsers);
            	}
			}
			if (config.Active) bindChangeAccount();
		});

		itemsData = storage.getL('itemsData');
		if (!itemsData || typeof itemsData !== 'object') itemsData = {};
	}

	function setConfig(k,v) {
		if (v!==undefined && config[k]!==undefined) {
			log('SET '+k+': '+v);
			storage.set('Netflix'+k, v);
			config[k] = v;
			updateStatus();
		}else{
			log('GET '+k+': '+v+' - '+config[k]);
			return config[k];
		}
	}
	// on load
	function fetchItems(items,tab){
		if (items && items.length && tab){
			simkl.getWatched(items,function (r) {
				sendToContent(tab.id,{action: 'updatePosters', data: r});
			},  err => {log(err);});
		}
	}

	function getRandom(data,tabId){
		simkl.getRandom(data.url,function (r) {
			sendToContent(tabId,{action: 'getRandom', data: r});
		}, err => {log(err);});
	}
	// on hover
	function getRatings(data){
		log('GET RATINGS');
		if (ajaxQ) ajaxQ.abort();

		let v = getItem(data.id);
		if (v) {
			log('from cache');
			log(v);
			sendToContent(data.tab,{action:'updateHover', data: v});
		}else{
			log('Just Rate');
			ajaxQ = simkl.getRatings(data.id, function (r) {
				ajaxQ = null;
				log(r);
				setItem(data.id,r);
				sendToContent(data.tab,{action:'updateHover', data: r});
			}, function (err) {/*can't get*/ajaxQ = null;log('Some rate error');});
		}
	}
	// --------------

	function updateCache(){
		let ct = Date.now()/1000|0;
		if (itemsData.t && (itemsData.t+86400)>ct) return;
		itemsData.t = ct;
		itemsData.length = 99999;

		for (let v in itemsData){
			let i = itemsData[v];
			if (!i.t) continue;
			if ((i.bad && i.t<(ct-badOffset)) || (!i.bad && i.t<(ct-oldRateOffset))) delete itemsData[v];
		}
		flushItems();
		if (debug) log(itemsData);
	}

	function setItem(key,data){
		if (!itemsData.length) itemsData.length = 1; else ++itemsData.length;

		if (data && !data.t) data.t = Date.now()/1000|0;
		itemsData[key] = data;

		flushItems();
	}

	function getItem(key){return itemsData[key] || false;}

	function flushItems(){
		if (itemsData.length && itemsData.length>10) {
			itemsData.length = 0;
			storage.setL('itemsData',itemsData);
		}
	}

	function flushShakti() {
        log('FLUSH SHAKTI!!!');shakti2 = null;
    }

    let once = false;
    function bindChangeAccount(){
        if (once) return;
        once = true;
        chrome.webRequest.onBeforeRequest.addListener(flushShakti, {urls: ["*://www.netflix.com/api/*switch?switchProfileGuid=*","*://www.netflix.com/browse"],types: ['xmlhttprequest','main_frame']});
    }

	// on init:
	loadSetting();
	return {
		checkUpdates,
		authorized: 	()=>authorized,
		checking: 		()=>checking,
		lastVideo: 		()=>lastNetflixVideo,
        isErrorAccountDetect,
        bindChangeAccount,
		restartImport: ()=> importDate = 0,
        getAllAccounts: ()=>[allUsers,savedUser,activeUser],
		setSavedUser: 	user=> { storage.set('savedUser',(savedUser = user)); flushShakti();} ,
		config:			setConfig,
		enabled:		()=>config.Active,
		enabledExport:	skip=>(config.Active || !!skip) && config.EnabledExport && oauth.authorized(),
		enabledRatings:	skip=>(config.Active || !!skip) && config.EnabledRatings,
		enabledGrey:	skip=>(config.Active || !!skip) && config.EnabledGrey,
		enabledSecret:	skip=>(config.Active || !!skip) && config.EnabledSecret,
		queueCount: 	total => { return total ? totalQueue : sendQueue.length;},
		fetchItems,
		getRatings,
		getRandom: 		data=> getRandom(data,data.tab),
		updateCache
	};
};
