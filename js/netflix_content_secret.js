(function ($,storage) {
    var genres = [
        [1365, 93, 'Action & Adventure', 184],
        [43040, 297, 'Action Comedies', 7],
        [1568, 307, 'Action Sci-Fi & Fantasy', 16],
        [43048, 329, 'Action Thrillers', 55],
        [11881, 391, 'Adult Animation', 0],
        [7442, 392, 'Adventures', 15],
        [3761, 421, 'African Movies', 1],
        [3327, 504, 'Alien Sci-Fi', 7],
        [5507, 536, 'Animal Tales', 6],
        [7424, 574, 'Anime', 19],
        [2653, 575, 'Anime Action', 3],
        [9302, 579, 'Anime Comedies', 1],
        [452, 581, 'Anime Dramas', 1],
        [11146, 583, 'Anime Fantasy', 1],
        [3063, 585, 'Anime Features', 1],
        [10695, 587, 'Anime Horror', 0],
        [2729, 588, 'Anime Sci-Fi', 1],
        [6721, 590, 'Anime Series', 1],
        [29764, 622, 'Art House Movies', 3],
        [77232, 627, 'Asian Action Movies', 38],
        [5230, 741, 'Australian Movies', 8],
        [8195, 780, 'B-Horror Movies', 1],
        [12339, 859, 'Baseball Movies', 4],
        [12762, 874, 'Basketball Movies', 1],
        [262, 890, 'Belgian Movies', 1],
        [3652, 1324, 'Biographical Documentaries', 10],
        [3179, 1338, 'Biographical Dramas', 10],
        [12443, 1636, 'Boxing Movies', 2],
        [10757, 2036, 'British Movies', 27],
        [52117, 2272, 'British TV Shows', 12],
        [1252, 2440, 'Campy Movies', 3],
        [783, 3442, 'Children & Family Movies', 28],
        [3960, 3616, 'Chinese Movies', 6],
        [46576, 3664, 'Classic Action & Adventure', 6],
        [31694, 3737, 'Classic Comedies', 9],
        [29809, 3873, 'Classic Dramas', 10],
        [32473, 3974, 'Classic Foreign Movies', 6],
        [31574, 4125, 'Classic Movies', 21],
        [32392, 4151, 'Classic Musicals', 5],
        [31273, 25030, 'Romance Classics', 0],
        [47147, 4269, 'Classic Sci-Fi', 4],
        [46588, 4401, 'Classic Thrillers', 5],
        [46553, 4391, 'Classic TV', 5],
        [48744, 4501, 'Classic War Movies', 6],
        [47465, 4510, 'Classic Westerns', 3],
        [6548, 4621, 'Comedies', 204],
        [10118, 4867, 'Comic Book and Superhero Movies', 2],
        [1105, 5149, 'Country & Western/Folk', 0],
        [2748, 5154, 'Courtroom Dramas', 7],
        [6895, 5185, 'Creature Features', 3],
        [9584, 5196, 'Crime Action & Adventure', 6],
        [9875, 5216, 'Crime Documentaries', 0],
        [6889, 5217, 'Crime Dramas', 8],
        [10499, 5285, 'Crime Thrillers', 9],
        [26146, 5275, 'Crime TV Shows', 6],
        [9434, 7513, 'Cult Comedies', 2],
        [10944, 7545, 'Cult Horror', 4],
        [7627, 7557, 'Cult Movies', 5],
        [4734, 7583, 'Cult Sci-Fi & Fantasy', 4],
        [74652, 7620, 'Cult TV', 1],
        [869, 8032, 'Dark Comedies', 1],
        [45028, 9649, 'Deep Sea Horror', 0],
        [67673, 9744, 'Disney', 69],
        [59433, 9803, 'Disney Musicals', 1],
        [6839, 9827, 'Documentaries', 25],
        [5763, 9858, 'Dramas', 446],
        [4961, 9878, 'Dramas based on Books', 4],
        [3653, 9898, 'Dramas based on real life', 8],
        [10606, 10386, 'Dutch', 10],
        [5254, 10704, 'Eastern European', 28],
        [10659, 10749, 'Education for Kids', 1],
        [52858, 11814, 'Epics', 9],
        [11079, 12621, 'Experimental', 5],
        [26835, 12657, 'Faith & Spirituality', 5],
        [52804, 12658, 'Faith & Spirituality Movies', 4],
        [51056, 12718, 'Family Features', 12],
        [9744, 12877, 'Fantasy Movies', 11],
        [7687, 13625, 'Film Noir', 7],
        [12803, 13678, 'Football Movies', 1],
        [11828, 13718, 'Foreign Action & Adventure', 10],
        [4426, 13798, 'Foreign Comedies', 3],
        [5161, 13883, 'Foreign Documentaries', 4],
        [2150, 13890, 'Foreign Dramas', 20],
        [8243, 14007, 'Foreign Gay & Lesbian Movies', 2],
        [8654, 14041, 'Foreign Horror Movies', 1],
        [7462, 14114, 'Foreign Movies', 25],
        [6485, 14259, 'Foreign Sci-Fi & Fantasy', 1],
        [10306, 14354, 'Foreign Thrillers', 5],
        [58807, 14527, 'French Movies', 9],
        [31851, 14766, 'Gangster Movies', 5],
        [500, 14815, 'Gay & Lesbian Dramas', 5],
        [58886, 14933, 'German Movies', 8],
        [61115, 16762, 'Greek', 0],
        [5349, 18476, 'Historical Documentaries', 6],
        [89585, 18597, 'Horror Comedy', 0],
        [8711, 18598, 'Horror Movies', 24],
        [11804, 19085, 'Independent Action & Adventure', 0],
        [4195, 19120, 'Independent Comedies', 10],
        [384, 19172, 'Independent Dramas', 12],
        [7077, 19304, 'Independent Movies', 12],
        [3269, 19410, 'Independent Thrillers', 4],
        [10463, 19496, 'Indian Movies', 4],
        [58750, 20020, 'Irish Movies', 0],
        [8221, 20134, 'Italian Movies', 3],
        [10398, 20221, 'Japanese Movies', 1],
        [10271, 20252, 'Jazz & Easy Listening', 0],
        [52843, 20285, 'Kids Music', 0],
        [27346, 20288, 'Kids` TV', 23],
        [5685, 20342, 'Korean Movies', 2],
        [67879, 20360, 'Korean TV Shows', 1],
        [1402, 20376, 'Late Night Comedies', 3],
        [1613, 20446, 'Latin American Movies', 4],
        [10741, 20483, 'Latin Music', 0],
        [8985, 20609, 'Martial Arts Movies', 30],
        [6695, 20608, 'Martial Arts', 31],
        [5875, 20730, 'Middle Eastern Movies', 1],
        [2125, 20753, 'Military Action & Adventure', 6],
        [4006, 20768, 'Military Documentaries', 1],
        [11, 20770, 'Military Dramas', 14],
        [25804, 20832, 'Military TV Shows', 1],
        [4814, 20947, 'Miniseries', 5],
        [26, 20996, 'Mockumentaries', 0],
        [947, 21005, 'Monster Movies', 2],
        [10056, 21152, 'Movies based on children\'s books', 0],
        [6796, 21545, 'Movies for ages 0 to 2', 0],
        [6218, 21547, 'Movies for ages 2 to 4', 0],
        [5455, 21548, 'Movies for ages 5 to 7', 2],
        [561, 21551, 'Movies for ages 8 to 10', 2],
        [6962, 21546, 'Movies for ages 11 to 12', 0],
        [90361, 23046, 'Music & Concert Documentaries', 2],
        [1701, 23045, 'Music', 15],
        [13335, 23062, 'Musicals', 30],
        [9994, 23099, 'Mysteries', 17],
        [63782, 23189, 'New Zealand Movies', 1],
        [12123, 23679, 'Period Pieces', 22],
        [2700, 23724, 'Political Comedies', 1],
        [7018, 23726, 'Political Documentaries', 0],
        [6616, 23727, 'Political Dramas', 11],
        [10504, 23781, 'Political Thrillers', 4],
        [5505, 23991, 'Psychological Thrillers', 9],
        [36103, 24451, 'Quirky Romance', 0],
        [9833, 24881, 'Reality TV', 4],
        [10005, 24896, 'Religious Documentaries', 0],
        [3278, 25007, 'Rock & Pop Concerts', 0],
        [5475, 25187, 'Romantic Comedies', 18],
        [1255, 25264, 'Romantic Dramas', 47],
        [7153, 25425, 'Romantic Favorites', 10],
        [7153, 25425, 'Romantic Foreign Movies', 10],
        [9916, 25656, 'Romantic Independent Movies', 4],
        [8883, 25766, 'Romantic Movies', 93],
        [11567, 26099, 'Russian', 13],
        [6998, 26126, 'Satanic Stories', 1],
        [4922, 26128, 'Satires', 8],
        [9292, 26184, 'Scandinavian Movies', 6],
        [1492, 26650, 'Sci-Fi & Fantasy', 25],
        [6926, 26683, 'Sci-Fi Adventure', 5],
        [3916, 26691, 'Sci-Fi Dramas', 5],
        [1694, 26698, 'Sci-Fi Horror Movies', 3],
        [11014, 26702, 'Sci-Fi Thrillers', 5],
        [2595, 26712, 'Science & Nature Documentaries', 5],
        [52780, 26719, 'Science & Nature TV', 1],
        [9702, 26738, 'Screwball', 3],
        [5012, 27206, 'Showbiz Dramas', 7],
        [13573, 27240, 'Showbiz Musicals', 0],
        [53310, 27260, 'Silent Movies', 3],
        [10256, 27284, 'Slapstick Comedies', 7],
        [8646, 27294, 'Slasher and Serial Killer Movies', 4],
        [12549, 27320, 'Soccer Movies', 1],
        [3675, 27324, 'Social & Cultural Documentaries', 8],
        [3947, 27336, 'Social Issue Dramas', 9],
        [9196, 27365, 'Southeast Asian Movies', 1],
        [58741, 27444, 'Spanish Movies', 1],
        [2760, 27577, 'Spiritual Documentaries', 0],
        [9327, 27580, 'Sports & Fitness', 0],
        [5286, 27591, 'Sports Comedies', 1],
        [180, 27593, 'Sports Documentaries', 2],
        [7243, 27596, 'Sports Dramas', 7],
        [4370, 27615, 'Sports Movies', 13],
        [10702, 27651, 'Spy Action & Adventure', 2],
        [9147, 27703, 'Spy Thrillers', 4],
        [55774, 27709, 'Stage Musicals', 0],
        [11559, 27710, 'Stand-up Comedy', 15],
        [35800, 27963, 'Steamy Romantic Movies', 4],
        [972, 28005, 'Steamy Thrillers', 3],
        [42023, 28076, 'Supernatural Horror Movies', 3],
        [11140, 28139, 'Supernatural Thrillers', 3],
        [6384, 29149, 'Tearjerkers', 11],
        [3519, 29166, 'Teen Comedies', 1],
        [9299, 29177, 'Teen Dramas', 4],
        [52147, 29211, 'Teen Screams', 2],
        [60951, 29230, 'Teen TV Shows', 1],
        [8933, 29257, 'Thrillers', 56],
        [1159, 29368, 'Travel & Adventure Documentaries', 2],
        [10673, 28919, 'TV Action & Adventure', 5],
        [11177, 28929, 'TV Cartoons', 19],
        [10375, 28952, 'TV Comedies', 14],
        [10105, 28971, 'TV Documentaries', 10],
        [11714, 28985, 'TV Dramas', 12],
        [83059, 29006, 'TV Horror', 2],
        [4366, 29009, 'TV Mysteries', 9],
        [1372, 29021, 'TV Sci-Fi & Fantasy', 6],
        [83, 29029, 'TV Shows', 40],
        [9472, 30146, 'Urban & Dance Concerts', 0],
        [75804, 30176, 'Vampires', 0],
        [75930, 32675, 'Werewolves', 0],
        [7700, 32676, 'Westerns', 16],
        [2856, 33461, 'World Music Concerts', 0],
        [75405, 33489, 'Zombies', 0]
    ];

    var FILTERS = Object.freeze({all: 0, movies: 1, tv: 2, anime: 3});
    var TABS = Object.freeze({favorite: 1, last_used: 2, full: 3, popular: 4});
    var CACHE = Object.freeze({last_used: 'cacheLastUsed', likes: 'cacheLikes',tab: 'cacheTabs',filter:'cacheFilter', payed: 'cachePayed'});
    var activeTab = TABS.popular, activeFilter = FILTERS.all, payed = false;

    //storage
    var liked = Object.create(null), lastUsed = new Map();

    var $sc, $cont,$search, tpl,
        $tabs, $filters;

    var secret = null;
    $.get(chrome.extension.getURL('/netflix_secret_tpl.html'), function(data) {
        secret = data;

        var k = storage.getL(CACHE.last_used);
        k && (lastUsed = new Map(JSON.parse(k)));

        k = storage.getL(CACHE.likes);
        k && (liked = JSON.parse(k));

        k = storage.getL(CACHE.tab);
        k && (activeTab = parseInt(k));

        k = storage.getL(CACHE.filter);
        k && (activeFilter = parseInt(k));

        storage.get(CACHE.payed,function(v){
            v && (payed = true);
            payed= true;
            //checkPayment.retry = true;
            //checkPayment();
        });
    });

    /**
     * netflix_id, simkl_id, title, counter
     * @type {Array}
     */
    var data = [];

    function loadData(parent) {
        function _checkTitleFilter(t,s) {
            if (s && t.toLowerCase().indexOf(s)===-1) return false;
            else if (activeFilter === FILTERS.all) return true;
            else if (activeFilter === FILTERS.tv && t.indexOf('TV')>-1) return true;
            else if (activeFilter === FILTERS.anime && t.indexOf('Anime')>-1) return true;
            else if (activeFilter === FILTERS.movies && t.indexOf('Anime') === -1 && t.indexOf('TV') === -1) return true;
            return false;
        }

        if (parent) $search.val('');
        var text = $search.val().toLocaleLowerCase(); //search filter
        var i;

        storage.setL(CACHE.tab, activeTab);
        storage.setL(CACHE.filter, activeFilter);

        data = [];
        if (TABS.popular === activeTab){
            for (i=0; i<genres.length; ++i){
                if (!_checkTitleFilter(genres[i][2],text)) continue;

                data.push([genres[i][0],genres[i][1],genres[i][2],genres[i][3]]);
            }
            renderCont();
            if (!payed && text.length>1){
                doFullGet(function( _d ) {
                    _d && appendContCount(text,_d);
                },text,parent,true);
            }
        }else if (TABS.favorite === activeTab){
            var sortedKeys = sortObjectString(liked);
            for (i=0; i<sortedKeys.length; ++i){
                var _l = liked[sortedKeys[i]];
                if (!_checkTitleFilter(_l[1],text)) continue;

                data.push([_l[0],sortedKeys[i],_l[1],_l[2]]);
            }

            if (data.length) renderCont(); else {
                $cont[0].innerHTML = $sc.find('#emptyFavorites').html();
            }

        }else if (TABS.last_used === activeTab){
            Array.from(lastUsed).reverse().forEach(function (_l) {
                if (!_checkTitleFilter(_l[1][1],text)) return;

                data.push([_l[1][0],_l[0],_l[1][1],_l[1][2]]);
            });
            renderCont();
        }else if (TABS.full === activeTab){
            if (!payed){
                $cont[0].innerHTML = $sc.find('#notpayedfull').html();
             //  $cont.find('.enhancerbrowseunlockbtn').on('click',doBuy);
            }else{
                doFullGet(function( _d ) {
                    if (_d) {
                        if (_d[1]) data.push([0, parent < 0 ? -_d[1] : -parent, '< Back', null]);
                        for (i = 0; i < _d[0].length; ++i) {
                            data.push([_d[0][i].netflix_id, _d[0][i].id, _d[0][i].name, _d[0][i].count]);
                        }
                        renderCont();
                    }
                },text,parent);
            }

        }
    }

    function setPayed(state){
        storage.set(CACHE.payed,state);
        payed = state;
        TABS.full === activeTab && loadData();
    }

    function doBuy() {
        checkPayment.retry = 0;
        window.google.payments.inapp.buy({
            'parameters': {'env': 'prod'},
            'sku': "27000",
            'success': function(){
                alert('Thank you!');
                setPayed(true);
            },
            'failure': function(r){
                if (r && r.checkoutOrderId){
                    console.log('ORDER TRUE');
                    setPayed(true);
                }else  {
                    checkPayment.retry = 0;
                    checkPayment(r);
                }
            }


        });
    }

    checkPayment.retry = 0;
    function checkPayment(r) {
        if (r && r.response && r.response.errorType === "PURCHASE_CANCELED") return false;

        if (!payed) google.payments.inapp.getPurchases({
            'parameters': {'env': 'prod'},
            'success': function(response) {
                var _active = false;
                var licenses = response && response.response && response.response.details;
                for (var i = 0; i < licenses.length; i++) {
                    var license = licenses[i];
                    if (license.sku === "27000"){
                        _active = ["ACTIVE","PENDING"].indexOf(license.state)>-1;
                        setPayed(_active);
                        break;
                    }
                }

                if (!payed && checkPayment.retry!==true && ++checkPayment.retry<=5)
                    setTimeout(function () {
                        console.log('check payment: '+checkPayment.retry);
                        checkPayment();
                    },2000);
            },
            'failure': function () {
                console.log('check payment error');
            }
        });
    }
    
    function doFullGet(callback,text,parent,count) {
        var _filt = activeFilter === FILTERS.tv?2:(activeFilter === FILTERS.anime?3:(activeFilter === FILTERS.movies?1:null));
        $.getJSON( "https://simkl.com/ajax/apps/extension.php?t=netflix"
            +(_filt?'&filter='+_filt:'')
            +(text?'&text='+text:'')
            +(parent?'&parent='+parent:'')
            +(count?'&c=1':''), callback);
    }

    function renderCont() {
        var $tpl,all = '';

        for (var i=0; i<data.length; ++i){
            $tpl = $(tpl);
            $tpl.attr('data-id',data[i][0]);
            $tpl.attr('data-simkl',data[i][1]);
            $tpl.find('.enhancerbrowseitemtitle').text(data[i][2]+(!data[i][0] && data[i][2].substr(-2,1)!=='.'?'...':''));

            if (data[i][3] === null || !data[i][3]) $tpl.find('.enhancerbrowseitemcount').remove();
            else $tpl.find('.enhancerbrowseitemnumber').text(data[i][3]);

            if (data[i][3] === null) $tpl.find('.enhancerbrowseitemlike').remove();
            else liked[data[i][1]] && $tpl.find('.enhancerbrowseitemlike').addClass('Active');

            all+=$tpl[0].outerHTML;
        }
        $cont[0].innerHTML = all;
        $cont.parent().scrollTop(0);
        bindCont();
    }
    
    function appendContCount(text,count) {
        var $tpl = $(tpl);
        $tpl.find('.enhancerbrowseitemtitle').text(count+(count<100?' more ':'+')+' "'+text+'..." categories found in full list >');
        $tpl.find('.enhancerbrowseitemlike, .enhancerbrowseitemcount').remove();
        $tpl.on('click',function () {
            $tabs.find('.enhancerbrowsemenusubtitle[data-v="'+TABS.full+'"]').click();
        });

        $cont.append($tpl);
    }

    function bindHead() {

        $sc.find('#enhancesearch').on('keyup',function (e) {
            e.preventDefault();
            debounce(loadData,150);
        });

        function _setActiveFilter(){
            $filters.find('.enhancerbrowsemenumaintitle').removeClass('enhancerbrowsemenumaintitleactive')
                .filter('[data-v="'+activeFilter+'"]').addClass('enhancerbrowsemenumaintitleactive');
        }
        _setActiveFilter();
        $filters.find('.enhancerbrowsemenumaintitle').on('click',function () {
            var last = activeFilter;
            activeFilter = parseInt($(this).data('v'));
            if (last!==activeFilter){
                _setActiveFilter();

                loadData();
            }
        });

        function _setActiveTab() {
            $tabs.find('.enhancerbrowsemenusubtitle').removeClass('enhancerbrowsemenusubtitleactive')
                .filter('[data-v="'+activeTab+'"]').addClass('enhancerbrowsemenusubtitleactive');
        }
        _setActiveTab();
        $tabs.find('.enhancerbrowsemenusubtitle').on('click',function () {
            var last = activeTab;
            activeTab = parseInt($(this).data('v'));
            if (last!==activeTab){
                _setActiveTab();
                loadData();
            }
        });
    }

    function bindCont(){
        var $bind = $cont.find('.enhancerbrowseitem');
        if ($bind.length){
            function _autoUpdateToFull() {
                if (activeTab!==TABS.full){
                    $tabs.find('.enhancerbrowsemenusubtitle').removeClass('enhancerbrowsemenusubtitleactive')
                        .filter('[data-v="'+TABS.full+'"]').addClass('enhancerbrowsemenusubtitleactive');
                    activeTab = TABS.full;
                }
            }

            $bind.on('click mouseup',function (e) {
                if (e.type !== 'mouseup' || e.which === 2){
                    e.stopImmediatePropagation();
                    var $this = $(this);
                    if ($this.data('id')){
                        window.open('https://www.netflix.com/browse/genre/'+$this.data('id'), e.which === 2?'_blank':'_self');
                        if (lastUsed.has($this.data('simkl'))) lastUsed.delete($this.data('simkl'));

                        lastUsed.set($this.data('simkl'),[$this.data('id'),$this.find('.enhancerbrowseitemtitle').text(),$this.find('.enhancerbrowseitemnumber').text()]);
                        if (lastUsed.size>30) lastUsed.delete(lastUsed.keys().next().value);

                        storage.setL(CACHE.last_used, JSON.stringify(Array.from(lastUsed)));
                    }else {
                        _autoUpdateToFull();
                        loadData($(this).data('simkl'));
                    }
                }
            }).on('mousedown',function () {return false;});

            $bind.find('.enhancerbrowseitemnumber').on('click',function (e) {
                e.stopImmediatePropagation();
                if (this.innerHTML != 0){
                    _autoUpdateToFull();
                    loadData($(this).closest('.enhancerbrowseitem').data('simkl'));
                }
            });
            $bind.find('.enhancerbrowseitemlike').on('click',function (e) {
                e.stopImmediatePropagation();
                var $e = $(this);
                var $tEl = $e.closest('.enhancerbrowseitem');
                if ($e.toggleClass('Active').hasClass('Active')){
                    liked[$tEl.data('simkl')] = [$tEl.data('id'),$tEl.find('.enhancerbrowseitemtitle').text(),$tEl.find('.enhancerbrowseitemnumber').text()];
                }else{
                    delete liked[$tEl.data('simkl')];
                }
                storage.setL(CACHE.likes, JSON.stringify(liked));
            })
        }
    }

    /**
     * Sort by array 1 index
     */
    function sortObjectString(o){
        return Object.keys(o).sort(function(a, b) {
            return o[a][1].localeCompare(o[b][1]);
        });
    }

    var _timer = null;
    function debounce(f,delay){
        if (_timer) clearTimeout(_timer);
        _timer = setTimeout(f,delay);
    }

    /**
     *
     * @param $iAfter
     * @returns {boolean} - created
     */
    $.fn.secret = function ($iAfter) {
        if (secret){
            $iAfter.after(secret);

            $sc = $('#SimklBrowse');
            if (!$sc.length) return false;

            $cont = $sc.find('#genCont');
            $search = $sc.find('#enhancesearch');
            !tpl && (tpl = $sc.find('#genTPL').html());
            payed && $sc.find('.enhancerbrowsepagemenucontent .premium').remove();

            $tabs = $sc.find('.enhancerbrowsemenusub');
            $filters = $sc.find('.enhancerbrowsemenumain');

            var secretTimer = null;
            function _hideBrowse() {
                if (secretTimer) clearTimeout(secretTimer);
                secretTimer = setTimeout(function(){
                    $sc.find('.SimklBrowseRelativePosition').fadeOut();
                },300);
            }
            $sc.find('.SimklBrowsePosition').on('mouseleave',_hideBrowse);

            $sc.find('.SimklBrowseHeaderLink').on('click',function () {
                var $e = $sc.find('.SimklBrowseRelativePosition');
                if (!$e.is(':visible')){
                    $e.css({
                        position:'relative',
                        display: 'block'
                    });
                    if (secretTimer){ clearTimeout(secretTimer); secretTimer = null; }
                }else _hideBrowse();
            });

            bindHead();
            loadData();
            return true;
        }
        return false;
    };
})(jQuery,storageClass());