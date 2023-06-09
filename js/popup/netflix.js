import Base from "./base.js";

let _block;
let _bg = null, _authorized = null;

export default class Netflix{
    static init(bg,authorized){
        _bg = bg.netflix;
        _authorized = authorized;

        _block = document.getElementById('blockNetflix');
        $('#togglenetflix').on('click',this._toggleMain).prop('checked',_bg.enabled());
        $('#toggleimdb').on('click',this._toggleRatings).prop('checked',_bg.enabledRatings(true));
        $('#togglebrowse').on('click',this._toggleSecret).prop('checked',_bg.enabledSecret(true));
        $('#togglenetflixhistory').on('click',this._toggleExport).prop('checked',_bg.enabledExport(true));
        $('#togglenetflixgrey').on('click',this._toggleGrey).prop('checked',_bg.enabledGrey(true));
        $('.v2blockheadrstart',_block).on('click',()=>{_bg.restartImport(); Base.checkNow() });

        if (_bg.enabled()) _block.classList.add('Active');


        if (_bg.enabledExport(true)) {
            _bg.enabled() && _block.classList.add('HistoryActive');
            if (_bg.getAllAccounts()[0].length) {
                Netflix.bindSettings();
                let _accs = _bg.getAllAccounts();
                _accs[1] && (document.querySelector('.v2blockitemleftmainaccountname').innerText = _accs[1]);
            }
        }
    }

    static async _toggleMain(){
        let state = this.checked,
            isAllowed = await Base._requestPermissions(['https://www.netflix.com/']);
        if (isAllowed){
            _bg.config('Active',state);
            state && _bg.bindChangeAccount();
            _block.classList.toggle('Active',state);
            _block.classList.toggle('HistoryActive',_bg.enabledExport());
        }else state.removeAttribute('checked');


        Base.loadAboveCheckText();
    }
    static _toggleRatings(){_bg.config('EnabledRatings',this.checked);}
    static _toggleSecret(){_bg.config('EnabledSecret',this.checked);}
    static _toggleGrey(){
        _bg.config('EnabledGrey',this.checked);
        $('#needEnableSimkl').toggle(this.checked && !_bg.config('EnabledExport'));
    }

    static _toggleExport(){
        if (!_authorized) {Base._simklAuthorize('netflix');return false;}
        let $ico = $('#netflixSettingsIco');
        _bg.config('EnabledExport',this.checked);

        if (this.checked) {
            _bg.config('EnabledGrey') && $('#needEnableSimkl').hide();
            let _accs = _bg.getAllAccounts();
            _accs[1] && _accs[1]!==-1 && (document.querySelector('.v2blockitemleftmainaccountname').innerText = _accs[1]);
            _accs[0].length && $ico.show();
            if (!_bg.enabledGrey()) $('#togglenetflixgrey').click();

            Netflix.bindSettings();
            Base.showTrackedStatuses();
            Base.loadCheckingText();
            Base.checkNow();
        }else {
            $ico.hide();
            if (_bg.enabledGrey()) $('#togglenetflixgrey').click();
        }
        _block.classList.toggle('HistoryActive',this.checked);
        Base.loadAboveCheckText();
    }

    static bindSettings(){
        let $NFico = $('#netflixSettingsIco');
        $NFico.off('click').on('click',Netflix.showNetflixSelectAccounts);
        $('.netflixsettingssavebtn').off('click').on('click',Netflix._saveSettingsUsers);
        $NFico.show();
    }

    static showNetflixSelectAccounts(e) {
        e.preventDefault();
        let acc = _bg.getAllAccounts(),
            $nfSett = $("#netflixSettings");

        let _h = '';
        log(acc);
        $.each(acc[0], (i, item)=> {_h += '<option '+(acc[1] === item?'selected':'')+'>'+item+'</option>';});
        $nfSett.find('select').html(_h);

        $('#extBlockSettings, .ExtBlockIframe').hide();
        $nfSett.show();
    }

    static _saveSettingsUsers(){
        let $top = $(this).closest('.netflixsettings'),
            userName = $top.find('select option:selected').text();
        if (userName){
            _bg.setSavedUser(userName);
            document.querySelector('.v2blockitemleftmainaccountname').innerText = userName;
        }
        $top.hide();
        $('#extBlockSettings, .ExtBlockIframe').show();
    }

}