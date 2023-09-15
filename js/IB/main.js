import IBC from '../ib.js';
import User from './user.js';
import BasicUI from './basic.js';
import RoomNavigation from './rooms.js';
import CardHand from './cards.js';
import PlayerAction from './play.js';
import DisplayBox from './box.js';
import GameInfo from './game.js';

const e = React.createElement;
const useState = React.useState;

function IBCMain() {
    const [ interaction , setInteraction ] = useState(false);
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
    let out = [e(User, { key : 'user', user : user, updateDetails : (user, message, points) => {
        setUser(user);
        setMessage(message);
        setPoints(points);
    }})];

    if(!user.id) {
        return out;
    }

    const games = 'games';

    out.push(e(BasicUI, {
        key         : 'basic',
        user        : user,
        points      : points,
        message     : message,
        activities  : game.activities
    }));

    const updateGameData = (status, limited) => {
        setGame(status);
        setMessage(status.message);
        if(typeof status.points != 'undefined') {
            setPoints(status.points);
        }
    }

    const checkGameStatus = () => {
        if(!user.id) {
            return;
        }
        if(!room.id) {
            setGame(emptyGame);
            return;
        }
        IBC.get(games, (status) => {
            // limit update when in turn
            updateGameData(status, status.current == user.id);
            if(status.current == user.id) {
                // console.log('Stop updates on turn');
                return;
            }
            setTimeout(() => {
                checkGameStatus();
            }, IBC.refresh_rate);
        });
    }

    out.push(e(RoomNavigation, {key : 'navigation', room : room, activateUI : () => {
        setInteraction(true);
        IBC.play('lounge', 'bgm');
    }, enterRoom : (room, message) => {
        setRoom(room);
        setMessage(message);
        checkGameStatus();
    }, leaveRoom : () => {
        if(!confirm('Are you sure you want to leave this room?')) {
            return;
        }
        setRoom({
            id      : 0,
            name    : ''
        });
        IBC.post(games, { action : 'leave' }, (res) => {
            // console.log('Left Room', res);
            updateGameData(res);
        });
    }}));

    if(!room.id) {
        return out;
    }

    if(!interaction) {
        return [
            e('div', { key : 'blocker', className : 'blocker' }, ' '),
            e('a', { key : 'rejoin', className : 'button login', onClick : () => {
                setInteraction(true);
            }}, e(DisplayBox, { content : 'Re-join Game', addClass : 'single center'}))
        ];
    }

    IBC.play('lounge', 'bgm');

    if(!Object.keys(game.players).length) {
        checkGameStatus();
    }

    // show game info
    out.push(e(GameInfo, { key : 'game-info', user : user, game : game }));

    if(game.hand && game.hand.length) {
        out.push(e(CardHand, { key : 'hand' , cards : game.hand }));
        if(game.hand.length == 3) {
            setTimeout(() => {
                const hidden = $('.dealt');
                // console.log('Check hidden', hidden.length);
                if(hidden.length > 0) {
                    return;
                }
                IBC.play('slide', 'se');
                $('.card').addClass('dealt'); // hide cards
                setTimeout(() => {
                    // console.log('Resuming updates');
                    checkGameStatus(); // resume update game
                }, 1000)
            }, 5000);
        }
    }

    if(game.current == user.id) {
        if(game.hand.length == 2) {
            IBC.play('bell', 'se');
        }
        const max_bet = IBC.getMaxBet(game.pot, points);
        out.push(e(PlayerAction, { key : 'playbar', max_bet : max_bet, play : (bet) => {
            // console.log('Max Bet', max_bet);
            if(bet < 1 || bet > max_bet) {
                // error message
                return;
            }
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
                if(res.message.includes('win')) {
                    for(let x = 0 ; x < bet; x++) {
                        setTimeout(() => {
                            IBC.play('gold', 'se');
                        }, x * IBC.chipDelay);
                    }
                } else {
                    for(let x = 0 ; x < bet; x++) {
                        setTimeout(() => {
                            IBC.play('chip', 'se');
                        }, x * IBC.chipDelay);
                    }
                }
            });
        }, pass : ()=> {
            $('.playbar').hide();
            $('.card').addClass('dealt');
            IBC.play('slide', 'se');
            IBC.post(games, {
                action : 'pass'
            }, (res) => {
                setTimeout(() => {
                    checkGameStatus();
                }, 1500);
            });
        } }))
    }

    return out;
}

export default IBCMain;