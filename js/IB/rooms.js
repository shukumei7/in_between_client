import IBC from '../ib.js';
import Maho from '../maho.js';
import { DisplayBox, FormBox } from './box.js';

const e = React.createElement;
const useState = React.useState;

function RoomNavigation({room, enterRoom, leaveRoom, activateUI}) {
    const games = 'games';

    if(room.id) {
        return ([
            e('div', { key : 'room name', className : 'info room_name', onClick : leaveRoom }, e(DisplayBox, { content : room.name , addClass : 'single center' }))
        ]);
    }

    const [ rooms , setRooms ] = useState([]);
    const [ preview , setPreview ] = useState(null);
    const [ showButtons , setShowButtons ] = useState(false);
    const [ showCreate , setShowCreate ] = useState(false);

    const joinRoom = (res) => {
        // console.log('Join Random Game', res);
        if(!res.room_id || !res.room_name) {
            console.log('Failed to join room', res);
        }
        enterRoom({
            id      : res.room_id,
            name    : res.room_name
        });
        setShowButtons(false);
        IBC.play('success');
    }

    if(showCreate) {
        return e(RoomUI, { games : games, enterRoom : joinRoom, close : () => {
            IBC.play('tick');
            setShowCreate(false);
        }});
    }

    if(preview) {
        return e(RoomPreview, { room : preview , enterRoom : () => {
            IBC.play('tick');
            IBC.post(games + '/' + preview.room_id, (res) => {
                joinRoom(res);
                setPreview(null);
            }, (xhr) => {
                console.log('Error Join Room', xhr);
            })
        } , close : () => {
            setPreview(null);
            IBC.play('tick');
        }})
    }

    if(!showButtons) {
        IBC.get(games, (res) => {   // check if you are inside a room
            if(res.room_id) {
                enterRoom({
                    id      : res.room_id,
                    name    : res.room_name
                }, 'You have entered a room');
                return;
            }
            if(res.rooms.length) {
                setRooms(res.rooms);
            }
            setShowButtons(true);
        });
        return '';
    }

    let out = [];
    
    for(let x = 0 ; x < rooms.length; x++) {
        const room = rooms[x];
        out.push(e('div', { key : room.id , onClick : () => {
            activateUI();
            IBC.get('games/' + room.id, (res) => {
                /// console.log('Room Info', res);
                setPreview(res);
            });
        }}, room.name));
    }

    return ([
        e('div', { key : 'rooms', className : 'roomlist' }, e(DisplayBox, { content : out})),
        e('div', { key : 'actions', className : 'login bottom' }, [
            e('a', { key : 'play', className : 'button', onClick : () => {
                activateUI();
                IBC.post(games, joinRoom, (xhr) => {
                    console.log('Error', xhr);
                });
            }}, e(DisplayBox, { content : 'Quick Play', addClass : 'single center'})),
            e('a', { key : 'create', className : 'button', onClick : () => {
                // create game menu
                activateUI();
                setShowCreate(true);
            }}, e(DisplayBox, { content : 'Create Room', addClass : 'single center'}))
        ])
    ]);
}

function RoomPreview({ room, enterRoom , close}) {
    let inputs = [];
    let buttons = [];
    inputs.push(e('div', { key : 'name' }, room.room_name));
    inputs.push(e('div', { key : 'max' }, 'Max Players: ' + room.settings.max_players));
    inputs.push(e('div', { key : 'pot' }, 'Pot Size: ' + room.settings.pot_size));
    inputs.push(e('div', { key : 'cpot' }, 'Current Pot: ' + room.pot));
    inputs.push(e('div', { key : 'players' }, 'Players'));
    for(let x in room.players) {
        inputs.push(e('div', { key : 'player ' + x}, ' - ' + room.players[x] + ' : ' + Maho.number(room.scores[x])));
    }
    buttons.push(e('a', { key : 'close', className : 'button medium', onClick : close }, e(DisplayBox, { content : 'Close' , addClass : 'single center'})));
    buttons.push(e('a', { key : 'join', className : 'button', onClick : enterRoom}, e(DisplayBox, { content : 'Join Room' , addClass : 'single center'})));
    return e(FormBox, { inputs : inputs , buttons : buttons, size : 'quarter room' });
}

function RoomUI({ enterRoom , close }) {
    const [ message , setMessage ] = useState('Create your room here');
    const [ available , setAvailable ] = useState(false);
    let inputs = [];
    let buttons = [];
    const name_ID = 'name';
    const pass_ID = 'passcode';
    const max_ID = 'max_players';
    const pot_ID = 'pot_bet';
    inputs.push(e('div', { key : 'name', className : 'input' }, [
        e('input', {
            key         : 'name',
            id          : name_ID,
            type        : 'text',
            placeholder : 'Enter a unique room name',
            onChange    : () => {
                setAvailable(false);
                const val = $('#' + name_ID).val();
                if(val.length < 3) {
                    setMessage('Your room name needs at least 3 characters');
                    return;
                }
                IBC.get('rooms/' + val, (res) => {
                    setMessage(res.message);
                    setAvailable(res.available);
                }, (xhr) => {
                    console.log('Error', xhr);
                });
            }
        }),
        e('div', { key : 'message', className : 'message' }, message)
    ]));
    inputs.push(e('div', { key : 'pass', className : 'input' }, e('input', {
        key         : 'passcode',
        id          : pass_ID,
        type        : 'text',
        placeholder : 'Set passcode for privacy'
    })));
    inputs.push(e('div', { key : 'max', className : 'input' }, [
        e('input', {
            key         : 'max',
            id          : max_ID,
            type        : 'number',
            min         : 2,
            max         : IBC.max_players
        }),
        e('div', { key : 'message', className : 'message' }, 'Set max players from 2 to 8')
    ]));
    inputs.push(e('div', { key : 'pot', className : 'input' }, [
        e('input', {
            key         : 'pot',
            id          : pot_ID,
            type        : 'number',
            min         : 1,
            max         : IBC.max_pot
        }),
        e('div', { key : 'message', className : 'message' }, 'Set a pot value from 1 to 10')
    ]));
    setTimeout(() => {
        if(!$('#' + max_ID).val().length) {
            $('#' + max_ID).val(IBC.max_players);
        }
        if(!$('#' + pot_ID).val().length) {
            $('#' + pot_ID).val(IBC.default_pot);
        }
    }, 100);
    buttons.push(e('a', { key : 'close', className : 'button medium', onClick : close }, e(DisplayBox, { content : 'Close' , addClass : 'single center'})));
    if(available) {
        buttons.push(e('a', { key : 'create', className : 'button medium', onClick : () => {
            IBC.play('tick');
            IBC.post('rooms', {
                name        : $('#' + name_ID).val(),
                passcode    : $('#' + pass_ID).val(),
                max_players : $('#' + max_ID).val(),
                pot         : $('#' + pot_ID).val(),
            }, enterRoom);
        }}, e(DisplayBox, { content : 'Create' , addClass : 'single center'})));
    }
    return e(FormBox, { inputs : inputs , buttons : buttons, size : 'quarter room' });
}

export default RoomNavigation;