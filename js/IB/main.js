import IBC from '../ib.js';
import User from './user.js';
import BasicUI from './basic.js';
import RoomNavigation from './rooms.js';
import CardHand from './cards.js';
import PlayerAction from './play.js';
import GameInfo from './game.js';
import Timer from './timer.js';
import Welcome from './welcome.js';
import Options from './options.js';

const e = React.createElement;
const useState = React.useState;
const useEffect = React.useEffect;

function IBCMain() {
    const [ display , setDisplay ] = useState([]);
    const [ interaction , setInteraction ] = useState(false);
    const [ showLogs , setShowLogs ] = useState(false);
    const [ showTimer , setShowTimer ] = useState(false);
    const [ points , setPoints ] = useState(0);
    const [ message , setMessage ] = useState(0);
    const [ user , setUser ] = useState({
        id      : 0,
        name    : '',
        secure  : false
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

    const games = 'games';

    const activateUI = () => {
        IBC.play('tick');
        IBC.play('lounge', 'bgm');
        setInteraction(true);
    }

    const updateGameData = (status, limited) => {
        setGame(status);
        setMessage(status.message);
        if(typeof status.points != 'undefined') {
            setPoints(status.points);
        }
    }

    const checkGameStatus = () => {
        if(!user.id) {
            setMessage('You got disconnected');
            setGame(emptyGame);
            return;
        }
        if(!room.id) {
            if(game.activities.length) setMessage('You got kicked out of the room');
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

    const getMainElements = () => {
        if(!interaction) {
            return e(Welcome, { close : activateUI });
        }

        let out = [];

        out.push(e(User, { key : 'user', user : user, updateDetails : (user, message, points) => {
            setUser(user);
            if(!user.id) { // logged out
                setRoom(user);
                setGame(emptyGame);
            }
            setMessage(message);
            setPoints(points);
        }}));

        if(!user.id) {
            return out;
        }

        out.push(e(BasicUI, {
            key         : 'basic',
            user        : user,
            points      : points,
            message     : message,
            activities  : game.activities,
            showLogs    : showLogs,
            setShowLogs : (v) => {
                if(!room.id) {
                    setShowLogs(false);
                    return;
                }
                setShowLogs(v);
            }
        }));

        out.push(e(RoomNavigation, {key : 'navigation', room : room, enterRoom : (r, message) => {
            if(room.id) {
                return; // cannot enter another room
            }
            setRoom(r);
            setMessage(message);
            checkGameStatus();
            IBC.play('success');
            // console.trace('Entered Room', room, r);
        }, leaveRoom : () => {
            IBC.play('tick');
            setTimeout(() => {
                setShowLogs(false);
                if(!confirm('Are you sure you want to leave this room?')) {
                    setShowLogs(game.current != user.id);
                    return;
                }
                IBC.clearAlert();
                IBC.previous = [];
                IBC.post(games, { action : 'leave' }, (res) => {
                    setRoom({
                        id      : 0,
                        name    : ''
                    });
                    updateGameData(res);
                    IBC.play('nudge');
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

        const max_bet = IBC.getMaxBet(game.pot, points);
        // console.log('Get Max Bet', max_bet, game.pot, points, IBC.restrict_bet);
        out.push(e(PlayerAction, { key : 'playbar', progress : game.activities.length, hand : game.hand.length, turn : game.current == user.id, max_bet : max_bet, play : (bet) => {
            // console.log('Max Bet', max_bet);
            if(bet < 1 || bet > max_bet) {
                // error message
                return;
            }
            IBC.clearAlert();
            setShowTimer(false);
            $('.playbar').hide();
            IBC.play('tick');
            IBC.post(games, {
                action  : 'play',
                bet     : bet
            }, (res) => {
                if(typeof res.card == 'undefined') {
                    // not in turn probably
                    checkGameStatus();
                    return;
                }
                let state = game;
                state.hand = game.hand.concat([res.card]);
                state.activities = res.activities;
                state.pot = res.pot;
                IBC.analytics.event('turn_play', {
                    bet     : bet,
                    hand    : state.hand
                });
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
                    }, 1200);
                }, 3000)
            });
        }, pass : ()=> {
            IBC.clearAlert();
            setShowTimer(false);
            $('.playbar').hide();
            $('.hand .card').addClass('pass');
            IBC.play('slide', 'se');
            IBC.play('tick');
            IBC.post(games, {
                action : 'pass'
            }, (res) => {
                IBC.analytics.event('turn_pass');
                setTimeout(() => {
                    updateGameData(res);
                    checkGameStatus();
                    (true);
                }, 1200);
            });
        }}));

        // console.log('Update up to Actions', game.activities.length);

        if(!showTimer || game.hand.length > 2) {
            if($('.playbar').is(':visible')) {
                // console.log('Show timer and hide logs');
                setShowTimer(true);
            }
            return out;
        }

        const ignore = ['join', 'leave', 'kick'];
        const previous = game.activities.slice(-10); // guaranteed hit
        let last = null;
        while((last = previous.pop()) && ignore.includes(last.action));
        if(!last) last = { time : Date.now()};
        // console.log('Start from', last, previous);
        const time = last.time;
        const ms = (new Date(time)).getTime();
        const seconds = ms / 1000;
        out.push(e(Timer, { key : 'timer', deadline : seconds + IBC.timeout, requestUpdate : checkGameStatus }));
        
        return out;
    }

    useEffect(() => {
        setDisplay(getMainElements());
    }, [user.id, room.id, showTimer, game.activities.length, showLogs, interaction]);

    useEffect(() => {
        if(room.id) {
            // console.log('Call Game Updates', room);
            checkGameStatus();
        }
    }, [room] );

    useEffect(() => {
        const isTurn = game.current == user.id;
        setShowLogs(!isTurn);
        setShowTimer(isTurn);
        if(isTurn) clearTimeout(IBC.timers.others);
    }, [game.current, game.activities.length]);

    return display; // getMainElements();
}

export default IBCMain;