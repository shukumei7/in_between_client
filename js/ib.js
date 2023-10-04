import IBCMain from './IB/main.js';
import { Cookie } from './cookies.js';
import { ErrorBox } from './IB/box.js';
import Options from './IB/options.js';

let IBC = {
    api             : 'http://localhost',
    cookie_id       : 'login_user',
    cookie_token    : 'login_token',
    cookie_days     : 30,
    bet_id          : 'play-bet',
    font_size       : 16,
    card_fs         : 20,
    refresh_rate    : 5000,
    previous        : [],
    players         : [],
    root            : null,
    options         : null,
    headers         : null,     
    showHelp        : true,   
    site            : {
        title       : '',
        icon        : '',
        reset       : () => {
            document.title = IBC.site.title;
            IBC.icon.set(IBC.site.icon);
        }
    },
    analytics       : {
        tracker_id  : null,
        gtag        : (...args) => {
            if(!IBC.analytics.tracker_id || typeof gtag != 'function') {
                return false;
            }
            gtag.apply(null, args);
        },
        event       : (event_name, params) => {
            IBC.analytics.gtag('event', event_name, params);
        },
        consent     : (consent_name, params) => {
            IBC.analytics.gtag('consent', consent_name, params);
        }
    },
    cookies         : {
        font    : 'font',
        master  : 'master',
        se      : 'seff',
        bgm     : 'bgm',
        tick    : 'tick',
        alert   : 'alert',
        anim    : 'animation',
        decks   : 'decks',
        bg      : 'background',
        help    : 'help',
        text    : 'text'
    },
    ajax            : (action, type, data, success, error) => {
        let options = {
            url     : IBC.api + '/api/' + action,
            type    : type
        };
        if(IBC.headers) {
            options.headers = IBC.headers;
        }
        if(typeof data == 'function') {
            if(typeof success == 'function') {
                error = success;
            }
            success = data;
            data = {};
        }
        if(typeof error == 'function') {
            options.error = error;
        }
        if(typeof success == 'function') {
            options.success = success;
            if(Object.keys(data).length) {
                switch(type) {
                    case 'get':
                        let query = [];
                        for(let x in data) {
                            query.push(x + '=' + data[x]);
                        }
                        options.url = options.url + '?' + query.join('&');
                    default:
                        options.data = data;
                }
            }
            return $.ajax(options);
        } 
        return $.ajax({...options, ...data});
    },
    post            : (action, data, success, error) => {
        return IBC.ajax(action, 'post', data, success, error);
    },
    get            : (action, data, success, error) => {
        return IBC.ajax(action, 'get', data, success, error);
    },
    put            : (action, data, success, error) => {
        return IBC.ajax(action, 'put', data, success, error);
    },
    delete         : (action, data, success, error) => {
        return IBC.ajax(action, 'delete', data, success, error);
    },
    getMaxBet(pot, points) {
        return Math.min(pot, Math.max(IBC.restrict_bet, points));
    },
    screen  : {
        full : () => {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) { /* Safari */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE11 */
                elem.msRequestFullscreen();
            }
        },
        reset : () => {
            if(document.fullscreenElement === null) {
                return false;
            }
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
            return true;
        },
        toggle : () => {
            if( Math.abs(window.innerHeight - screen.height) <= 1) {
                // browser is fullscreen
                if(IBC.screen.reset()) {
                    return;
                }
            }
            IBC.screen.full();
        }
    },
    volume : {
        master  : 1,
        se      : 1,
        bgm     : 0.3,
        tick    : 1,
        bell    : 1,
        get     : (channel , volume) => {
            return IBC.volume.master * IBC.volume[channel] * (typeof volume != 'undefined' ? volume : 1);
        },
        adjust  : () => {
            const audio = IBC.sounds.playing;
            // console.log('Adjust for volume', audio.length);
            for(let x = 0; x < audio.length ; x++) {
                const bgm = audio[x];
                bgm.audio.volume = IBC.volume.get('bgm', bgm.volume);
                bgm.audio.play();
            }
        }
    },
    sounds : {
        card    : new Audio('./se/card.wav'),
        gold    : new Audio('./se/gold.wav'),
        chip    : new Audio('./se/chip.wav'),
        slide   : new Audio('./se/slide.wav'),
        bell    : new Audio('./se/bell.wav'),
        tick    : new Audio('./se/tick.wav'),
        nudge   : new Audio('./se/nudge.wav'),
        lounge  : new Audio('./se/lounge.wav'),
        shuffle : new Audio('./se/shuffle.wav'),
        success : new Audio('./se/success.wav'),
        playing : []
    },
    play        : (sound, channel, volume) => {
        if(typeof channel == 'undefined') {
            channel = 'se';
        }
        if(['tick', 'bell'].includes(sound)) {
            volume = IBC.volume[sound];
        }
        const vol = IBC.volume.get(channel, volume);
        // console.log('Play Sound', sound, channel, volume, vol);
        if(channel == 'se') {
            let audio = IBC.sounds[sound].cloneNode();
            audio.volume = vol;
            audio.play();
            return;
        }
        let audio = IBC.sounds[sound];
        if(!audio.paused) {
            // console.log('Check Paused', sound, channel, audio.paused);
            return;
        }
        // console.log('Play BGM', sound, channel);
        audio.volume = vol;
        audio.loop = true;
        audio.play();
        IBC.sounds.playing.push({ audio : audio, volume : volume });
    },
    chips       : (outcome, bet) => {
        const sound = outcome ? 'gold' : 'chip';
        for(let x = 0 ; x < bet; x++) {
            setTimeout(() => {
                IBC.play(sound, 'se');
            }, x * IBC.chipDelay);
        }
    },
    graphics    : {
        decks           : true,
        animations      : true,
        text            : true,
        bg              : true,
        log             : '1s',
        card            : '1s',
        setAnimations   : (val) => {
            if(typeof val != 'undefined') {
                IBC.graphics.animations = val = val > 0 ? 1 : 0;
                Cookie.set(IBC.cookies.anim, val, IBC.cookie_days);
            }
            // console.log('Set Animations', IBC.graphics.animations);
            $(':root').css({
                '--log-transition'  : IBC.graphics.animations ? IBC.graphics.log : 0,
                '--card-transition' : IBC.graphics.animations ? IBC.graphics.card : 0
            });
        }
    },
    timers      : {
        others  : null
    },
    tick        : null,
    tickSpeed   : 500,
    tickCount   : 0,
    tickMax     : 10,
    alert       : null,
    alert2      : null,
    alertDelay  : 30000,
    alertRate   : 500,
    alertDiff   : 10,
    alertIcon   : '/alert.ico',
    chipDelay   : 100,
    playAlert    : (message) => {
        const changeTab = () => {
            if(typeof message != 'undefined') {
                document.title = message;
            }
            IBC.icon.set(IBC.alertIcon);
            IBC.alert2 = setTimeout(resetTab, IBC.alertRate);
        }
        const resetTab = () => {
            IBC.site.reset();
            IBC.alert2 = setTimeout(changeTab, IBC.alertRate);
        }
        IBC.play('bell');
        changeTab();
    },
    clearAlert  : () => {
        clearTimeout(IBC.alert);
        clearTimeout(IBC.alert2);
        IBC.alert = IBC.alert2 = null;
        IBC.site.reset();
    },
    updateFont  : (val) => {
        if(val) {
            IBC.font_size = val;
        }
        let help = 0;
        if(!IBC.showHelp) {
            help = -20;
        }
        $(':root').css({
            '--font-size'       : IBC.font_size,
            '--message-down'    : 1.11 * IBC.font_size + -3.57 + help,
            '--message-up'      : 1.21 * IBC.font_size + 165.86 + help
        });
        // console.log('Update Font', IBC.font_size, help);
    },
    icon        : {
        get     : () => {
            return document.querySelector("link[rel~='icon']");
        },
        set     : (name) => {
            let link = IBC.icon.get();
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = name;
        }
    },
    now         : () => {
        const date = new Date();
        const tztime = date.toLocaleString('en-US', { timezone : IBC.server_timezone});
        // console.log('Get Now', date, tztime, IBC.server_timezone);
        return Math.round((new Date(tztime).getTime()) / 1000);
    }
}

export default IBC;
globalThis.IBC = IBC;

$(() => {
    window.addEventListener("unhandledrejection", function(promiseRejectionEvent) { 
        // handle error here, for example log   
        console.log('An error occurred');
    });
    console.log('Welcome to In Between Client!');
    IBC.get('settings', (res) => {
        for(let x in res) {
            IBC[x] = res[x];
        }
        console.log('Server is UP');
        IBC.root = ReactDOM.createRoot(document.querySelector('main'));
        IBC.root.render(React.createElement(IBCMain));
        IBC.options = ReactDOM.createRoot(document.querySelector('aside'));
        IBC.options.render(React.createElement(Options));
        // load cookie options
        IBC.volume.master = Cookie.get(IBC.cookies.master, IBC.volume.master);
        IBC.volume.se = Cookie.get(IBC.cookies.se, IBC.volume.se);
        IBC.volume.bgm = Cookie.get(IBC.cookies.bgm, IBC.volume.bgm);
        IBC.volume.tick = Cookie.get(IBC.cookies.tick, IBC.volume.tick) > 0 ? 1 : 0;
        IBC.volume.bell = Cookie.get(IBC.cookies.alert, IBC.volume.bell) > 0 ? 1 : 0;
        IBC.graphics.animations = Cookie.get(IBC.cookies.anim, IBC.graphics.animations) > 0;
        IBC.graphics.setAnimations();
        IBC.graphics.decks = Cookie.get(IBC.cookies.decks, IBC.graphics.decks) > 0;
        IBC.graphics.bg = Cookie.get(IBC.cookies.bg, IBC.graphics.bg) > 0;
        IBC.graphics.text = Cookie.get(IBC.cookies.text, IBC.graphics.text) > 0;
        IBC.showHelp = Cookie.get(IBC.cookies.help, IBC.showHelp) > 0;
        IBC.updateFont(Cookie.get(IBC.cookies.font, IBC.font_size));
        IBC.site.title = $('title').html(); // get default site_title
        IBC.site.icon = IBC.icon.get().href;
    }, (xhr) => {
        const message = 'Could not connect to server. Try again by refreshing this page later';
        console.log(message);
        IBC.root = ReactDOM.createRoot(document.querySelector('main'));
        IBC.root.render(React.createElement(ErrorBox, { message : message}));
    });
});