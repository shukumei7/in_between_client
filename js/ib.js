import IBCMain from './IB/main.js';

let IBC = {
    api             : 'http://localhost/api/',
    restrict_bet    : 2,
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
    tick        : null,
    tickSpeed   : 500,
    tickCount   : 0,
    tickMax     : 10,
    alert       : null,
    alertDelay  : 30000,
    chipDelay   : 50
}

export default IBC;

$(() => {
    IBC.root = ReactDOM.createRoot(document.querySelector('main'));
    IBC.root.render(React.createElement(IBCMain));
});

/*
class IBCMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.empty_state = {
            user_id     : 0,
            user_name   : '',
            room_id     : 0,
            pot         : 0,
            deck        : 0,
            hidden      : 0,
            dealer      : 0,
            current     : 0,
            points      : 0,
            discards    : [],
            hand        : [],
            hands       : [],
            players     : [],
            playing     : [],
            activities  : [],
            message     : '',
            room_name   : '',
            token       : '',
            showLogs    : false
        }    
    }
    loadState(res) {
        const obj = this;
        obj.updateRoomStatus(res);
        setTimeout(() => {
            // obj.checkState();
        }, IBC.refresh_rate);
    }
    componentDidMount() {
        const obj = this;
        const checkCookieLogin = () => {
            const user_id = Cookie.get(IBC.cookie_id);
            const token = Cookie.get(IBC.cookie_token);
            // console.log('Cookie Login', user_id, token);
            if(typeof user_id == 'undefined' || typeof token == 'undefined' || !user_id || !token) {
                return;
            }
            $.ajax({
                url     : IBC.api + 'accounts',
                type    : 'post',
                data    : {
                    id      : user_id,
                    token   : token
                },
                success : (res) => {
                    obj.loadState(res);
                }
            });
        }
        checkCookieLogin();
    }
    getHeaders() {
        if(!this.state.token) {
            return {};    
        }
        return {
            Accept          : 'application/json',
            Authorization   : 'Bearer ' + this.state.token
        };
    }
    checkState() {
        const obj = this;
        // console.log('Check State', obj.state.room_id, obj);
        if(obj.state.room_id == 0) {
            return;
        }
        // console.log('Trigger Refresh');
        $.ajax({
            url     : IBC.api + 'games',
            headers : obj.getHeaders(),
            success : (res) => {
                obj.loadState(res);
            }
        });
    }
    updateRoomStatus(status) {
        // console.log('Refresh Status', this, status);
        const state = this.state;
        // console.log('State', state);
        let states = {};
        for(let x in status) {
            if(typeof state[x] == 'undefined') {
                continue;
            }
            states[x] = status[x];
        }
        // console.log('States', states);
        this.setState(states);
    }
    renderState(out, state) {
        const obj = this;
        const determineActions = (out, state) => {
            let headers = this.getHeaders();
            if(state.user_id == 0) {
                out.push(e('div', { key : 'login', className : 'button', onClick : () => {
                    $.ajax({
                        url     : IBC.api + 'accounts',
                        type    : 'post',
                        success : (res) => {
                            // console.log('Register AJAX', res, CookieConsent.consented);
                            obj.setState({ 
                                user_id : res.user_id,
                                token   : res.access,
                                message : res.message
                            });
                            if(CookieConsent.consented) {
                                Cookie.set(IBC.cookie_id, res.user_id);
                                Cookie.set(IBC.cookie_token, res.token);
                            }
                        }
                    });
                }}, 'Log In'));
                return;
            }
            if(state.room_id == 0) {
                out.push(e('div', { key : 'play', className : 'button', onClick : () => {
                    console.log('Join a random room');
                    $.ajax({
                        url         : IBC.api + 'games',
                        headers     : headers,
                        type        : 'post',
                        success     : (res) => {
                            obj.updateRoomStatus(res);
                        }
                    })
                }}, e(DisplayBox, { key : 'qp', addClass : 'single center', content : 'Quick Play'})));
                out.push(e('div', { key : 'list', className : 'button', onClick : () => {
                    console.log('Request room list');
                    $.ajax({
                        url         : IBC.api + 'games',
                        headers     : headers,
                        type        : 'get',
                        success     : (res) => {
                            console.log('List Rooms', res);
                        }
                    })
                }}, e(DisplayBox, { key : 'list', addClass : 'single center', content : 'List Rooms'})));
                return;
            }
           if(state.current == state.user_id) {
                out.push(e('input', { key : 'bet', id : IBC.bet_id, type : 'number', step : 1, min : 1, max : (Math.min(state.pot, state.points > 1 ? state.points : IBC.restrict_bet)), default : IBC.restrict_bet }))
                out.push(e('div', { key : 'play', className : 'button', onClick : () => {
                    const bet = $('#' + IBC.bet_id).val();
                    console.log('Play bet', bet);
                    $.ajax({
                        url         : IBC.api + 'games',
                        headers     : headers,
                        data        : { action : 'play', bet : bet },
                        type        : 'post',
                        success     : (res) => {
                            obj.updateRoomStatus(res);
                        }
                    })
                }}, 'Play'));
                out.push(e('div', { key : 'pass', className : 'button', onClick : () => {
                    console.log('Pass turn');
                    $.ajax({
                        url         : IBC.api + 'games',
                        headers     : headers,
                        data        : { action : 'pass' },
                        type        : 'post',
                        success     : (res) => {
                            obj.updateRoomStatus(res);
                        }
                    })
                }}, 'Pass'));
           }
            out.push(e('div', { key : 'leave', className : 'button', onClick : () => {
                if(!confirm('Are you sure you want to leave?')) {
                    return;
                }
                console.log('Leaving room');
                $.ajax({
                    url         : IBC.api + 'games',
                    headers     : headers,
                    type        : 'post',
                    data        : {action : 'leave'},
                    success     : (res) => {
                        obj.updateRoomStatus(res);
                    }
                })
            }}, e(DisplayBox, { key : 'list', addClass : 'single center', content : 'Leave Room'})));
            
        }

        let container = [];
        determineActions(container, state);
        out.push(e('div', { key : 'action-bar', className : 'action-bar' }, container));
    }
    render() {
        const state = this.state;
        const formatState = (key, value) => {
            const formatPlayers = (players) => {
                var o = [];
                for(let x in players) {
                    o.push(e('div', { key : 'players_' + x }, players[x]));
                }
                return o;
            }
            const formatHands   = (hands) => {
                var o = [];
                for(let x in hands) {
                    let y = 'none';
                    if(hands[x]) y = 'yes';
                    o.push(e('div', { key : 'players_' + x }, state.players[x] + ' - ' + y));
                }
                return o;
            }
            switch(key) {
                case 'discards':
                case 'hand':
                case 'players':
                    return formatPlayers(value);
                case 'playing':
                    return value.toString();
                case 'activities':
                    return formatActivities(value);
                case 'hands':
                    return formatHands(value);
                case 'points':
                    return Maho.number(value);
            }
            return value;
        }
        const infoDiv = (key, contents) => {
            return e('div', { key : key + Date.now(), className : 'info info_' + key }, contents);
        }
        let out = [];
        for(let k in state) {
            if(['user_id', 'room_id', 'token'].indexOf(k) >= 0 || ['message','activities'].indexOf(k) >= 0) {
                continue;
            }
            if(state.room_id == 0 && ['pot', 'deck', 'hidden', 'discard', 'hand', 'hands', 'dealer', 'current', 'players', 'playing', 'activities', 'room_name', 'discards'].indexOf(k) >= 0) {
                continue;
            }
            if(state.user_id == 0 && 'points' == k) {
                continue;
            }
            const value = formatState(k, state[k]);
            if(!value.length) {
                continue;
            }
            let addClass = '';
            switch(k) {
                case 'message':
                    addClass = 'single';
                    break;
                case 'user_name':
                    addClass = 'center single';
                    break;
                case 'points':
                    addClass = 'right single';
                    break;  
            }
            // console.log('Pass state', k, value);
            out.push(infoDiv(k, e(DisplayBox, { content : value, addClass : addClass })));
        }
        out.push(e(ActivityBox, { key : 'logs', message : state.message , activities : state.activities }));
        this.renderState(out, state);
        return e('div', { key : 'info-container', className : 'info info-container' }, out);
    }
}

class DisplayBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            content     : props.content,
            addClass    : props.addClass,
            css         : {}
        }
    }
    render() {
        let addClass = '';
        if(this.state.addClass) {
            addClass = ' ' + this.state.addClass;
        }
        return e('div', { className : 'box' , style : this.state.css }, [
            e('div', { key : 'content', className : 'content' + addClass}, this.state.content),
            e('div', { key : 'top', className : 'box__line box__line--top'}),
            e('div', { key : 'left', className : 'box__line box__line--left'}),
            e('div', { key : 'right', className : 'box__line box__line--right'}),
            e('div', { key : 'bottom', className : 'box__line box__line--bottom'})
        ]);
    }
}

function ActivityBox() {
    const [message, setMessage] = useState('');
    const [activities, setActivities] = useState([]);
    const [show, showLogs, hideLogs] = useState(true);
    const [scroll, setScroll, goScroll] = useState(-1);

    let out = [];
    if(message.length) {
        out.push(e('div', { key : 'message' , className : 'info info_message' }, e(DisplayBox, { addClass : 'single', content : message})));
    }
    return out;
}
/*
class ActivityBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message     : props.message,
            activities  : props.activities,
            show        : true,
            scroll      : -1
        };
    }
    componentDidMount() {
        const obj = this;
        
    }
    render() {        
        const state = this.state;
        let out = [];
        if(state.message.length) {
            out.push(e('div', { key : 'message' , className : 'info info_message' }, e(DisplayBox, { addClass : 'single', content : state.message})));
        }
        if(!state.show) {
            return out;
        }
        const formatActivities = (activities) => {
            const last = state.activities.pop();

            console.log('Last', last);

            const formatMessage = (ev) => {
                let message = ev.user_id == state.user_id ? 'You' : ev.name;
                switch(ev.action) {
                    case 'join':
                        return message + ' joined the room';
                    case 'leave':
                    case 'kick':
                        return message + ' left the room';
                    case 'pot':
                        return message + ' added ' + Maho.number(Math.abs(ev.bet)) + ' to the pot';
                    case 'deal':
                        return message + ' got a card';
                    case 'pass':
                        return message + ' passed';
                    case 'play':
                        return message + ' played and ' + (ev.bet > 0 ? 'won' : 'lost') + Maho.number(Math.abs(ev.bet));
                    case 'shuffle':
                        return 'The deck is shuffled';
                    case 'rotate':
                        return 'A new dealer is selected';
                }
            }
            var o = [];
            for(let x in activities) {
                o.push(e('div', { key : 'activities_' + x }, formatMessage(activities[x]))); //  + ' - ' + activities[x].time));
            }
            return o;
        }
        return out.concat(formatActivities(state.activities)); // super.render();
    }
}
*/