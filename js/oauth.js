// Global simkl oauth
// chenge .dev in manifest too

var simklOauth = function (statusUpdate) {

	let storage = storageClass(),
		provider = 'oauth',
		initiated = false;

	/* self redirect oauth: 2,3 == my debug onlive*/
	let simklClientId =
		!debug?'a7be48f1559a6d794w1925237c626326c7be48f1559a6d794w1925137c626315':
		(debug === 2?'c7be48f1559a6d794w1925237c626326c7be48f1559a6d794w1925137c626317':
		(debug === 3?'c7be48f1559a6d794w1925237c626326c7be48f1559a6d794w1925137c626318':
			'a7be48f1559a6d794w1925237c626326c7be48f1559a6d794w1925137c626315'));

	let simklOAuthRedirectUrl = 'chrome-extension://' + chrome.runtime.id + '/simkl-oauth.html',
		simklSCode = 'ChromeSecondPhraseInside3',
		simklAuthorizeUrl = (debug !== true?'https://api.simkl.com/':'https://api.simkl.dev/')+'oauth/token',
		simklOAuthUrl	  =	(debug !== true?'https://simkl.com/':'https://simkl.dev/')+'oauth/authorize?response_type=code&client_id='+
		simklClientId + '&redirect_uri=' + simklOAuthRedirectUrl ;

	let simklAccessToken = null, simklTokenData = null;

	/* construct */
    //storage.clear();
	storage.get('oauth', data =>{
		if (data !== undefined)  setOauth(data);
		initiated = true;
	});

	function parseAuthorizationCode(url) {
		let simklCode = undefined;
		if (url.indexOf('code=')>-1) simklCode = url.match(/\?code=([^&]+)/)[1];
		return simklCode;
	}

	function authorize(simklOauthIframe) {
		log(simklOauthIframe);
		if (!simklAccessToken) {
            typeof simklOauthIframe === 'string'?chrome.tabs.create({ url: simklOAuthUrl+'&state='+simklOauthIframe }):simklOauthIframe.attr('src', simklOAuthUrl+'&state=no_auth');
		} else {
			log('already authorized');
		}
	}

	function authenticateSimkl(code) {
		if (code === undefined) {
			console.log('cant login with no code');
			statusUpdate();
			return; // fails.
		}
		let authData = {
			"code": code,
			"client_id": simklClientId,
			"client_secret": simklSCode,
			"redirect_uri": simklOAuthRedirectUrl,
			"grant_type": "authorization_code"
		};

		$.ajax({
			type: 'POST',
			dataType: 'json',
			url: simklAuthorizeUrl,
			data: JSON.stringify(authData),
            timeout: 15000,
			success: function(data) {
				if (data.error) {
					log('error on simkl login: ' + data.error);
					statusUpdate();
				}else{
					log("Auth success");
					data.received = new Date();
					setOauth(data);
					storage.set('oauth', data);

					statusUpdate(provider,'logged');
				}
			},
			error: function(){
				log('oauth failed!');
			}
		});
	}


	function setOauth(data) {
		if (data && data.error) {
			simklTokenData = null;
			simklAccessToken = null;
			log('Simkl auth error: ' + data.error);
		} else {
			simklTokenData = data;
			simklAccessToken = data.access_token;
			log('Simkl auth successful: ' + data.access_token);
		}
	}

	function sendSecured(url, data, onSuccess, onError) {
		if (!simklAccessToken) {
			log("Can't send - do not have bearer token");
			onError('not authenticated');
			return null;
		}

		return $.ajax({
			url: url,
			type: 'post',
			dataType: 'json',
			contentType:'application/json; charset=utf-8',
            timeout: 15000,
			beforeSend: function (request) {
				request.setRequestHeader("authorization", "Bearer " + simklAccessToken);
				request.setRequestHeader("simkl-api-key", simklClientId);
			},
			data: data?JSON.stringify(data):null,
			success: onSuccess || log,
			error: function(jqXHR, textStatus, errorThrown) {
				log(jqXHR);
				if (simklTokenData){
					console.log('Sent secure failed');
					if (jqXHR.status === 412  || jqXHR.status === 401 || jqXHR.status === 404) {
						simklTokenData = simklAccessToken = null;
						storage.set('oauth', null);
					}
				}

				if (onError) onError(jqXHR.responseText);
				statusUpdate();
			}
		});
	}

	// public functions
	return {
		authorized: ()=>simklAccessToken, // !== undefined && simklAccessToken !== null
        authorize,
		sendSecured,
		parseAuthorizationCode: url =>void authenticateSimkl(parseAuthorizationCode(url)),
		redirectUrl: ()=>simklOAuthRedirectUrl,
		clientId: ()=>simklClientId,
		token: ()=>simklAccessToken || '',
		isInitiated: ()=>initiated
	};
};