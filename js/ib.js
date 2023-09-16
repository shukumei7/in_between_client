import IBCMain from './IB/main.js';

let IBC = {
    api             : 'http://192.168.1.143/api/',
    cookie_id       : 'login_user',
    cookie_token    : 'login_token',
    bet_id          : 'play-bet',
    message_up      : 'var(--message-up)',
    message_down    : 'var(--message-down)',
    log_up          : 'var(--log-up)',
    log_down        : 'var(--log-down)',
    log_height      : 'var(--log-height)',
    refresh_rate    : 5000,
    previous        : [],
    players         : [],
    root            : null,
    headers         : null,        
    ajax            : (action, type, data, success, error) => {
        let options = {
            url     : IBC.api + action,
            type    : type
        };
        if(IBC.headers) {
            options.headers = IBC.headers;
        }
        if(typeof error == 'function') {
            options.error = error;
        }
        if(typeof data == 'function') {
            if(typeof success == 'function') {
                error = success;
            }
            success = data;
            data = {};
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
        bgm     : 0.3
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
    },
    play        : (sound, channel, volume) => {
        if(typeof channel == 'undefined') {
            channel = 'se';
        }
        const vol = IBC.volume.master * IBC.volume[channel] * (typeof volume == 'number' ? volume : 1);
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
    },
    chips       : (outcome, bet) => {
        const sound = outcome ? 'gold' : 'chip';
        for(let x = 0 ; x < bet; x++) {
            setTimeout(() => {
                IBC.play(sound, 'se');
            }, x * IBC.chipDelay);
        }
    },
    tick        : null,
    tickSpeed   : 500,
    tickCount   : 0,
    tickMax     : 10,
    alert       : null,
    alertDelay  : 30000,
    chipDelay   : 100,
    clearAlert  : () => {
        clearTimeout(IBC.alert);
        IBC.alert = null;
    }
}

export default IBC;

$(() => {
    IBC.get('settings', (res) => {
        for(let x in res) {
            IBC[x] = res[x];
        }
        // console.log('Get Settings', res);
    });
    IBC.root = ReactDOM.createRoot(document.querySelector('main'));
    IBC.root.render(React.createElement(IBCMain));
});