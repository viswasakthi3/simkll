let background = chrome.extension.getBackgroundPage();
let _netflixDiffUserTPL = '',
    apiHost = background.debug !== true?'https://api.simkl.com':'https://api.simkl.dev';

export default class Base{
    static onStatusUpdate(status,provider) {
        // do nothing for now, only ui changes.
        log('Status update: '+status);
        if (status === 'updating') {
            $('.ExtBlockChecking').show();
            $('#check-now').hide();
            if (provider) $('#'+provider+'NeedsLogin, #'+provider+'ErrorUser').hide();
        } else{
            $('.ExtBlockChecking').hide();
            (background.netflix.enabledExport() || background.crunchy.enabledExport()) && $('#check-now').show();

            Base.showTrackedStatuses();
        }
    }

    static checkNow() {
        $('#check-now').hide();
        $('.ExtBlockChecking').show();

        background.timerUpdate();
    }

    static _simklAuthorize(type){background.oauth.authorize(type);}

    static _requestPermissions(origin){
        return new Promise(resolve=>void chrome.permissions.request({origins: origin}, granted =>resolve(granted)));
    }

    static showTrackedStatuses() {
        log('in showTrackedStatuses');
        Base._setTrackerStatus('crunchy');
        Base._setTrackerStatus('netflix');
        background.setIcon();
    }

    static loadCheckingText(){
        let checkingAr = [],
            checkingText = 'Netflix, Crunchyroll';

        if (background.netflix.enabledExport()) checkingAr.push('Netflix');
        if (background.crunchy.enabledExport()) checkingAr.push('Crunchyroll');
        if (checkingAr.length < 3) checkingText = checkingAr.join(' and ');

        $('.ExtBlockCheckingTitle').text('Checking ' + checkingText);
    }

    static loadAboveCheckText(){
        $('#check-text').text(background.netflix.enabledExport()||background.crunchy.enabledExport()?'This extention will check my watch history from:':'Please enable services to check your watch history from:');

        document.querySelector('.v2statusleftempty').classList.toggle('Active',background.netflix.enabledExport() || background.crunchy.enabledExport());
    }

    static _setTrackerStatus(type){
        let bg = background[type],
            video = bg.lastVideo();

        type === 'netflix' && log(' in popup: '+bg.isErrorAccountDetect());
        if (!bg.enabledExport()) {
            $('#'+type+'NeedsLogin, #'+type+'ErrorUser').hide();
            $('#'+type+'LastWatched').html('').show();
        } else if (bg.authorized() === false) {
            $('#'+type+'LastWatched, #'+type+'ErrorUser').hide();
            $('#'+type+'NeedsLogin').show();
        } else if (type === 'netflix' && bg.isErrorAccountDetect() !== null){ //some user error, netflix
            $('#'+type+'NeedsLogin, #'+type+'LastWatched').hide();
            let $eu = $('#'+type+'ErrorUser');
            let $spans = $eu.find('span').hide();
            if (bg.isErrorAccountDetect() === true) $spans.first().show();
            else {
                let allUsers = bg.getAllAccounts();
                log(allUsers);
                if (!_netflixDiffUserTPL) _netflixDiffUserTPL = $spans.eq(1).text();
                $spans.eq(1).text(_netflixDiffUserTPL.replace('{last}',allUsers[1]).replace('{current}',allUsers[2])).show();
            }
            $eu.show();
        }else if (video) {
            let SE = '';
            if (video.season) SE = ' S' + video.season + 'E' + video.episode;
            else if (video.episode) SE = ' - Episode '+video.episode;

            let link = $("<a />", {
                text: (video.seriesTitle?video.seriesTitle+': ':'')+video.title+SE,
                href: apiHost+'/redirect?to=Simkl&'+(type === 'crunchy'?'crunchyroll':type)+'='+video.id+'&client_id='+background.oauth.clientId(),
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

}