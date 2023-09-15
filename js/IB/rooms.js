import IBC from '../ib.js';
import DisplayBox from './box.js';

const e = React.createElement;
const useState = React.useState;

function RoomNavigation({room, enterRoom, leaveRoom, activateUI}) {
    const games = 'games';

    if(room.id) {
        return (e('div', { key : 'actionbar', className : 'actionbar' }, 
            e('a', { key : 'leave', className : 'button', onClick : leaveRoom}, e(DisplayBox, { content : 'Leave Room', addClass : 'single center'}))
        ));
    }

    const [ showButtons , setShowButtons ] = useState(false);
    IBC.get(games, (res) => {
        if(res.room_id) {
            enterRoom({
                id      : res.room_id,
                name    : res.room_name
            }, 'You have entered a room');
            return;
        }
        setShowButtons(true);
    });
    if(!showButtons) {
        return '';
    }
    return (e('div', { key : 'actionbar', className : 'login' }, [
        e('a', { key : 'play', className : 'button', onClick : () => {
            activateUI();
            IBC.post(games, (res) => {
                // console.log('Join Random Game', res);
                enterRoom({
                    id      : res.id,
                    name    : res.name
                });
            }, (xhr) => {
                console.log('Error', xhr);
            });
        }}, e(DisplayBox, { content : 'Quick Play', addClass : 'single center'})),
        e('a', { key : 'list', className : 'button', onClick : () => {
            // create game menu
            activateUI();
        }}, e(DisplayBox, { content : 'Create Room', addClass : 'single center'})),
        e('a', { key : 'list', className : 'button', onClick : () => {
            // create game menu
            activateUI();
        }}, e(DisplayBox, { content : 'Join Room', addClass : 'single center'}))
    ]));
}

export default RoomNavigation;