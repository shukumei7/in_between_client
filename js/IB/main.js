import IBC from '../ib.js';
import User from './user.js';
import BasicUI from './basic.js';
import RoomNavigation from './rooms.js';
import CardHand from './cards.js';
import PlayerAction from './play.js';
import DisplayBox from './box.js';
import GameInfo from './game.js';
import Timer from './timer.js';

const e = React.createElement;
const useState = React.useState;

function IBCMain() {
    const [ interaction , setInteraction ] = useState(false);
    const [ showLogs , setShowLogs ] = useState(false);
    const [ points , setPoints ] = useState(0);
    const [ message , setMessage ] = useState(0);
    const [ user , setUser ] = useState({
        id      : 0,
        name    : ''
    });
    const [ room , setRoom ] = useState({
        id          : 0,
        name        : ''
    });
    const emptyGame = {
        deck        : 0,
        pot         : 0,
        hidden      : 0,
        dealer      : 0,
        current     : 0,
        discards    : [],
        hand        : [],
        hands       : [],
        players     : [],
        playing     : [],
        activities  : []
    };
    const [ game , setGame ] = useState(emptyGame);

    const activateUI = () => {
        IBC.play('tick');
        IBC.play('lounge', 'bgm');
        setInteraction(true);
    }

    React.useEffect(() => {
        if(room.id) {
            // console.log('Call Game Updates', room);
            checkGameStatus();
        }
    }, [room] );

    let out = [e(User, { key : 'user', user : user, updateDetails : (user, message, points) => {
        setUser(user);
        setMessage(message);
        setPoints(points);
    }, activateUI : activateUI})];

    if(!user.id) {
        return out;
    }

    if(!interaction) {
        return [
            e('div', { key : 'blocker', className : 'blocker' }, ' '),
            e('a', { key : 'rejoin', className : 'button login', onClick : activateUI}, e(DisplayBox, { content : 'Welcome Back', addClass : 'single center'}))
        ];
    }

    const games = 'games';

    out.push(e(BasicUI, {
        key         : 'basic',
        user        : user,
        points      : points,
        message     : message,
        activities  : game.activities,
        showLogs    : showLogs,
        setShowLogs : (v) => {
            setShowLogs(v);
        }
    }));

    const updateGameData = (status, limited) => {
        setGame(status);
        setMessage(status.message);
        if(typeof status.points != 'undefined') {
            setPoints(status.points);
        }
    }

    const checkGameStatus = () => {
        if(!user.id || !room.id) {
            setGame(emptyGame);
            return;
        }
        // console.log('Request Game Updates');
        IBC.get(games, (status) => {
            if(!user.id || !room.id) {
                setGame(emptyGame);
                return;
            }
            // check if kicked
            // console.trace('Updates Received', user, room, status);
            if(status.room_id != room.id) {
                setRoom({
                    id      : status.room_id,
                    name    : status.room_name
                });
                return;
            }
            // limit update when in turn
            updateGameData(status, status.current == user.id);
            if(status.current == user.id) {
                // console.log('Stop updates on turn');
                return;
            }
            setTimeout(() => {
                checkGameStatus();
            }, IBC.refresh_rate);
        }, (xhr) => {
            console.log('Error', xhr);
        });
    }

    out.push(e(RoomNavigation, {key : 'navigation', room : room, enterRoom : (room, message) => {
        setRoom(room);
        setMessage(message);
        checkGameStatus();
    }, leaveRoom : () => {
        IBC.play('tick');
        setTimeout(() => {
            if(!confirm('Are you sure you want to leave this room?')) {
                return;
            }
            setRoom({
                id      : 0,
                name    : ''
            });
            IBC.post(games, { action : 'leave' }, (res) => {
                updateGameData(res);
            });
        }, 10);
    }}));

    if(!room.id) {
        return out;
    }

    // show game info
    out.push(e(GameInfo, { key : 'game-info', user : user, game : game }));

    if(game.hand && game.hand.length) {
        out.push(e(CardHand, { key : 'hand' , cards : game.hand }));
    }

    if(game.current != user.id) {
        return out;
    }

    const alert = () => {
        IBC.play('bell', 'se');
        IBC.alert = setTimeout(() => {
            alert();
            checkGameStatus();
        }, IBC.alertDelay);
    }

    if(!IBC.alert && game.hand.length == 2) {
        alert();
        // console.log('Hide logs', game.hand.length);
        setShowLogs(false);
    }
    const max_bet = IBC.getMaxBet(game.pot, points);
    // console.log('Get Max Bet', max_bet, game.pot, points, IBC.restrict_bet);
    out.push(e(PlayerAction, { key : 'playbar', max_bet : max_bet, play : (bet) => {
        // console.log('Max Bet', max_bet);
        if(bet < 1 || bet > max_bet) {
            // error message
            return;
        }
        IBC.clearAlert();
        $('.playbar').hide();
        IBC.post(games, {
            action  : 'play',
            bet     : bet
        }, (res) => {
            let state = game;
            state.hand = game.hand.concat([res.card]);
            state.activities = res.activities;
            state.pot = res.pot;
            // console.log('temp game state', state);
            setGame(state); // controlled game update to show cards before clearing
            setMessage(res.message);
            setPoints(res.points);
            IBC.chips(res.message.includes('win'), bet);
            setTimeout(() => {
                IBC.play('slide', 'se');
                $('.hand .card').addClass('pass'); // hide cards
                setTimeout(() => {
                    //console.log('Update after play', res);
                    updateGameData(res);
                    checkGameStatus(); // resume update game
                    setShowLogs(true);
                }, 1500);
            }, 3000)
        });
    }, pass : ()=> {
        IBC.clearAlert();
        $('.playbar').hide();
        $('.hand .card').addClass('pass');
        IBC.play('slide', 'se');
        IBC.post(games, {
            action : 'pass'
        }, (res) => {
            // console.log('Passed', res.hand);
            setTimeout(() => {
                // console.log('Update after pass', res);
                updateGameData(res);
                checkGameStatus();
                // console.log('Show logs');
                setShowLogs(true);
            }, 1500);
        });
    }}));

    const ignore = ['join', 'leave', 'kick'];
    const previous = game.activities.slice(-10); // guaranteed hit
    let last = null;
    while((last = previous.pop()) && ignore.includes(last.action));
    if(!last) last = { time : Date.now()};
    // console.log('Start from', last);
    const time = last.time;
    const ms = (new Date(time)).getTime();
    const seconds = ms / 1000;
    out.push(e(Timer, { key : 'timer', deadline : seconds + IBC.timeout }));

    return out;
}

export default IBCMain;