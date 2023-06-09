var simklApi = function (oauth, statusUpdate) {
	let host = debug !== true?'https://api.simkl.com/':'https://api.simkl.dev/',
		simklHistoryAddUrl = host+'sync/history',
		simklRandom = host+'search/random?service=netflix',
		simklWatched = host+'sync/watched',
		simklNetflixRatings = host+'ratings?netflix={id}&fields=simkl%2Crank%2Cext%2Cdroprate%2Cyear%2Creactions%2Chas_trailer';

	function saveHistoryRecord(lastViewedAt, lastVideoId, provider, callback, additionalInfo,onErr) {
		var record = null;
		if (provider == 'netflix') {
			record = toNetflixRecord(lastViewedAt, lastVideoId, additionalInfo);
		} else if (provider == 'crunchy') {
			record = toCrunchyRecord(lastVideoId, additionalInfo);
		}
		oauth.sendSecured(simklHistoryAddUrl, record, function (result) {
			console.log('[sh]Sent to simkl:' + simklHistoryAddUrl + " " + JSON.stringify(record) + '. Result: ' + result);
			if (callback) callback(lastVideoId, result);

		}, function (err) {
			console.log(err);
            onErr && onErr(err);
		});
	}

	function toCrunchyRecord(lastVideoId,additionalInfo) {
		let result = {};
		if (additionalInfo?.seriesSlug){
			result.shows = [{
				title: additionalInfo.seriesTitle,
				year: parseInt(additionalInfo.date) || null,
				ids:{
					crunchyroll: additionalInfo.seriesSlug
				},
				seasons: [{
					number: 1,
					episodes:[{
						number: additionalInfo.episode,
						watched_at: additionalInfo.played || null
					}]
				}]
			}];
		}else{
			result.episodes = [{
				'ids': {
					'crunchyroll': lastVideoId
				}
			}];
		}
		return result;
	}


	function toNetflixRecord(lastViewedAt, lastVideoId, additionalInfo) {
		let result = {};
		if (additionalInfo) {
			if (additionalInfo.isMovie) {
				result.movies = [{
					'watched_at': lastViewedAt,
					'country'	: additionalInfo.country,
					'ids': {
						'netflix': lastVideoId
					}

				}];
			} else {
				result.episodes = [{
					'watched_at': lastViewedAt,
					'country'	: additionalInfo.country,
					'ids': {
						'netflix': lastVideoId
					}
				}];
			}
		}
		return result;
	}

	function toNetflixWatched(data){
		let c = [];
		for (let i=0; i<data.length;++i){
			c.push({netflix : data[i]});
		}
		return c;
	}

	function getWatched(data,onSucceed,onFailed){
		oauth.sendSecured(simklWatched, toNetflixWatched(data), function (result) {
			log('[gw]Sent to simkl:' + simklWatched + " " + JSON.stringify(data) +'.');
			if (typeof result == 'object' && onSucceed) onSucceed(result); else if (onFailed) onFailed(result);
		}, function (err) {
			log(err);
			onFailed(err);
		});
	}

	function getRandom(url,onSucceed,onFailed){
		return oauth.sendSecured(simklRandom+url, null, function (result) {
			log('[grand]Sent to simkl:' + simklRandom+url +'.');
			if (result && typeof result == 'object' && onSucceed) onSucceed(result); else if (onFailed) onFailed(result);
		}, function (err) {
			log(err);
			onFailed(err);
		});
	}

	function getRatings(id,onSucceed,onFailed){
		return oauth.sendSecured(simklNetflixRatings.replace('{id}',id), null, function (result) {
			log('[gr]Sent to simkl:' + simklNetflixRatings.replace('{id}',id) +'.');
			if (result && typeof result == 'object' && onSucceed) onSucceed(result); else if (onFailed) onFailed(result);

		}, function (err) {
			log(err);
			onFailed(err);
		});
	}

	return {
		saveHistory: function (lastViewedAt, lastVideoId, provider, callback, additionalInfo, onErr) {
			return saveHistoryRecord(lastViewedAt, lastVideoId, provider, callback, additionalInfo, onErr);
		},
		getWatched,
		getRandom,
		getRatings
	};
};

