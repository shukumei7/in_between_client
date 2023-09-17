import IBCMain from './IB/main.js';
import Options from './IB/options.js';
import { Cookie } from './cookies.js';
import { ErrorBox } from './IB/box.js';

let IBC = {
    api             : 'http://localhost/api/',
    cookie_id       : 'login_user',
    cookie_token    : 'login_token',
    cookie_days     : 30,
    bet_id          : 'play-bet',
    message_up      : 'var(--message-up)',
    message_down    : 'var(--message-down)',
    log_up          : 'var(--log-up)',
    log_down        : 'var(--log-down)',
    log_height      : 'var(--log-height)',
    font_size       : 12,
    card_fs         : 20,
    refresh_rate    : 5000,
    previous        : [],
    players         : [],
    root            : null,
    options         : null,
    headers         : null,     
    showHelp        : true,   
    cookies         : {
        font    : 'font',
        master  : 'master',
        se      : 'seff',
        bgm     : 'bgm',
        tick    : 'tick',
        alert   : 'alert',
        anim    : 'animation',
        decks   : 'decks',
        bg      : 'background'
    },
    ajax            : (action, type, data, success, error) => {
        let options = {
            url     : IBC.api + action,
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
    volume : {
        master  : 1,
        se      : 1,
        bgm     : 0.3,
        tick    : 1,
        alert   : 1,
        get     : (channel , volume) => {
            return IBC.volume.master * IBC.volume[channel] * (typeof volume == 'number' ? volume : 1);
        },
        adjust  : () => {
            const audio = IBC.sounds.playing;
            // console.log('Adjust for volume', audio.length);
            for(let x = 0; x < audio.length ; x++) {
                const bgm = audio[x];
                bgm.audio.volume = IBC.volume.get('bgm', bgm.volume);
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
        const vol = IBC.volume.get(channel, volume);
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
        decks       : true,
        animations  : true,
        bg          : true
    },
    tick        : null,
    tickSpeed   : 500,
    tickCount   : 0,
    tickMax     : 10,
    alert       : null,
    alertDelay  : 30000,
    alertDiff   : 10,
    chipDelay   : 100,
    clearAlert  : () => {
        clearTimeout(IBC.alert);
        IBC.alert = null;
    }
}

export default IBC;
globalThis.IBC = IBC;

$(() => {
    console.log('Welcome to In Between Client!');
    IBC.get('settings', (res) => {
        for(let x in res) {
            IBC[x] = res[x];
        }
        console.log('Server is UP');
        IBC.root = ReactDOM.createRoot(document.querySelector('main'));
        IBC.root.render(React.createElement(IBCMain));
        IBC.options = ReactDOM.createRoot(document.querySelector('#options'));
        IBC.options.render(React.createElement(Options));
        // load cookie options
        IBC.font_size = Cookie.get(IBC.cookies.font, IBC.font_size);
        IBC.volume.master = Cookie.get(IBC.cookies.master, IBC.volume.master);
        IBC.volume.se = Cookie.get(IBC.cookies.se, IBC.volume.se);
        IBC.volume.bgm = Cookie.get(IBC.cookies.bgm, IBC.volume.bgm);
        IBC.volume.tick = Cookie.get(IBC.cookies.tick, IBC.volume.tick);
        IBC.volume.alert = Cookie.get(IBC.cookies.alert, IBC.volume.alert);
        IBC.graphics.animations = Cookie.get(IBC.cookies.anim, IBC.graphics.animations);
        IBC.graphics.decks = Cookie.get(IBC.cookies.decks, IBC.graphics.deck);
        IBC.graphics.bg = Cookie.get(IBC.cookies.bg, IBC.graphics.bg);
    }, (xhr) => {
        const message = 'Could not connect to server. Try again by refreshing this page later';
        console.log(message);
        IBC.root = ReactDOM.createRoot(document.querySelector('main'));
        IBC.root.render(React.createElement(ErrorBox, { message : message}));
    });
});