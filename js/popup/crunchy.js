import Base from "./base.js";

let _block;
let _bg = null, _authorized = null;

export default class Crunchy{
    static init(bg,authorized){
        _bg = bg.crunchy;
        _authorized = authorized;

        _block = document.getElementById('blockCrunchy');
        $('#toggleCrunchy').on('click',this._toggleMain).prop('checked',_bg.enabled());
        $('#togglecrunchyhistory').on('click',this._toggleExport).prop('checked',_bg.enabledExport(true));
        $('#togglecrunchcyzero').on('click',this._toggleZeroExport).prop('checked',_bg.enabledZeroExport(true));
        $('.v2blockheadrstart',_block).on('click',()=>{_bg.restartImport(); Base.checkNow() });

        if (_bg.enabled()) _block.classList.add('Active');
        if (_bg.enabledExport()) _block.classList.add('HistoryActive');
    }

    static async _toggleMain(){
        let state = this.checked,
            isAllowed = await Base._requestPermissions(['https://beta-api.crunchyroll.com/','https://beta.crunchyroll.com/','https://www.crunchyroll.com/']);
        if (isAllowed){
            _bg.config('Active',state);
            _block.classList.toggle('Active',state);
            _block.classList.toggle('HistoryActive',_bg.enabledExport());
        }else{
            $('#toggleCrunchy').prop('checked',false);
        }
        Base.loadAboveCheckText();
    }

    static _toggleExport(){
        if (!_authorized) {Base._simklAuthorize('crunchy');return false;}
        _bg.config('EnabledExport',this.checked);
        if (this.checked) {
            Base.showTrackedStatuses();
            Base.loadCheckingText();
            Base.checkNow();
        }
        _block.classList.toggle('HistoryActive',this.checked);
        Base.loadAboveCheckText();
    }
    static _toggleZeroExport(){_bg.config('EnabledZeroExport',this.checked);}
}