import IBC from '../ib.js';
import Maho from '../maho.js';
import { DisplayBox, FormBox, ErrorBox } from './box.js';

const e = React.createElement;
const useState = React.useState;
const useEffect = React.useEffect;

function RoomNavigation({room, enterRoom, leaveRoom}) {
    const [ display , setDisplay] = useState('');
    useEffect(() => {
        // console.log('Update in Room', room);
        setDisplay(e('div', { key : 'room name', className : 'info room_name', onClick : leaveRoom }, e(DisplayBox, { content : room.name , addClass : 'single right' })));
    }, [room.id]);
    
    const [ showButtons , setShowButtons ] = useState(false);
    const [ rooms , setRooms ] = useState([]);
    const [ showCreate , setShowCreate ] = useState(false);

    if(room.id) {
        return display; 
    }

    const joinRoom = (res) => {
        enterRoom({
            id      : res.room_id,
            name    : res.room_name
        }, 'You have entered a room');
    }

    const games = 'games';

    const getRoomList = () => {
        IBC.get(games, (res) => {   // check if you are inside a room
            if(room.id) { 
                return; // entered room and no need for updates // or lost user access
            }
            if(res.room_id) {
                joinRoom(res);
                return;
            }
            if(res.rooms.length) {
                setRooms(res.rooms);
            }
            if(!showButtons) {
                setShowButtons(true);
            }
            // setTimeout(getRoomList, IBC.refresh_rate);
        });
    }

    if(!showButtons) {
        getRoomList();
        return '';
    }

    let output = [
        e('div', { key : 'actions', className : 'login bottom' }, [
            e('a', { key : 'play', className : 'button', onClick : () => {
                IBC.play('tick');
                IBC.post(games, joinRoom, (xhr) => {
                    console.log('Error', xhr);
                });
            }}, e(DisplayBox, { content : 'Quick Play', addClass : 'single center'})),
            e('a', { key : 'create', className : 'button', onClick : () => {
                // create game menu
                IBC.play('tick');
                setShowCreate(true);
            }}, e(DisplayBox, { content : 'Create Room', addClass : 'single center'}))
        ])
    ];

    if(showCreate) {
        output.push(e(RoomUI, { key : 'ui', games : games, enterRoom : joinRoom, close : () => {
            IBC.play('tick');
            setShowCreate(false);
        }}));
    }

    output.push(e(RoomList, { key : 'list', games : games, rooms : rooms, joinRoom : joinRoom }));

    return output;
}

function RoomList({games, rooms, joinRoom }) {
    const [ preview , setPreview ] = useState(null);
    const [ error , setError ] = useState(null);

    let out = [];
    
    for(let x = 0 ; x < rooms.length; x++) {
        const room = rooms[x];
        out.push(e('div', { key : room.id , onClick : () => {
            IBC.play('tick');
            IBC.get(games + '/' + room.id, (res) => {
                /// console.log('Room Info', res);
                setPreview(res);
            });
        }}, room.name));
    }

    let output = [];

    if(preview) {
        output.push(e(RoomPreview, { key : 'preview', room : preview , enterRoom : (passcode) => {
            IBC.play('tick');
            let data = {};
            if(passcode) {
                data.passcode = passcode;
            }
            IBC.post('games/' + preview.room_id, data, (res) => {
                joinRoom(res);
                setPreview(null);
            }, (xhr) => {
                setError(e(ErrorBox, { message : 'Cannot join room', close : () => {
                    setError(null);
                }}));
            });
        } , close : () => {
            setPreview(null);
            IBC.play('tick');
        }}));
    }

    if(error) {
        output.push(error);
    }

    return [
        e('div', { key : 'rooms', className : 'roomlist' }, e(DisplayBox, { content : out}))
    ].concat(output);
}

function RoomPreview({ room, enterRoom , close}) {
    const pass_ID = 'passcode';
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
    if(room.settings.secured) {
        inputs.push(e('div', { key : 'code', className : 'input' }, [
            e('div', { key : 'message', className : 'message'}, 'Room is secured'),
            e('input', { key : 'input', id : pass_ID, type : 'password' })
        ]));
    }
    buttons.push(e('a', { key : 'close', className : 'button medium', onClick : close }, e(DisplayBox, { content : 'Close' , addClass : 'single center'})));
    buttons.push(e('a', { key : 'join', className : 'button', onClick : () => {
        enterRoom($('#' + pass_ID).val());
    }}, e(DisplayBox, { content : 'Join Room' , addClass : 'single center'})));
    return [
        e('div', { key : 'blocker' , className : 'blocker'}, ' '),
        e(FormBox, { key : 'form', inputs : inputs , buttons : buttons, size : 'quarter room' })
    ];
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
    return [
        e('div', { key : 'blocker' , className : 'blocker'}, ' '),
        e(FormBox, { key : 'form', inputs : inputs , buttons : buttons, size : 'quarter room' })
    ];
}

export default RoomNavigation;