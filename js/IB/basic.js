import DisplayBox from './box.js';
import IBC from '../ib.js';
import Maho from '../maho.js';

const e = React.createElement;
const useState = React.useState;
const useEffect = React.useEffect;

function BasicUI({user, points, message, activities, showLogs, setShowLogs}) {
    const [ bottom , setBottom ] = useState(true); 
    const [ div , setDiv ] = useState(null);
    let out = [];
    const checkBottom = () => {
        const $div = div ? div : $('.info_activities .content');
        if(!$div.length) {
            return;
        }
        const top = Math.floor($div.scrollTop());
        const wHeight = $div.height();
        const target = Math.floor($div.prop('scrollHeight') - wHeight) * 0.95;  
        // console.log('Bottom Target', target, top);
        if(bottom && top < target) {
            setBottom(false);
        } else if(!bottom && top >= target) {
            setBottom(true);
        }
    }
    const scrollBottom = () => {
        setTimeout(() => {
            const $div = div ? div : $('.info_activities .content');
            const target = $div.prop('scrollHeight');
            $div.animate({ scrollTop : target }, IBC.tickSpeed);
            if(!div || !div.is(':visible')) setDiv($div);
            // console.log('Scrolled', target);
        }, IBC.tickSpeed);
    }
    if(div) {
        if(!div.is(':visible')) {
            div.remove();
            setDiv(null);
        }
        div.scroll((ev) => {
            clearTimeout(IBC.tick);
            const bot = bottom;
            IBC.tick = setTimeout(checkBottom, 1000);
        });
    }
    out.push(e(Points, { key : 'points', points : points}));
    out.push(e(Message, { key : 'message', message : message , bottom : showLogs ? IBC.message_up : IBC.message_down, toggle : () => {
        IBC.play('tick');
        if(!activities.length) {
            if(showLogs) setShowLogs(false);
            return;
        }
        setShowLogs(!showLogs);
        if(showLogs) return;
        scrollBottom();
        setBottom(true);
    }}));

    if(activities.length) {
        out.push(e('div', { key : 'activities', className : 'info info_activities ' + (showLogs ? '' : 'compress'), style : {
            '--box-height'  : showLogs ? IBC.log_height : 0,
            top             : showLogs ? IBC.log_up : IBC.log_down
        } }, e(DisplayBox, { content : e(Activities, { user : user, activities : activities, scrollBottom : () => {
            if(bottom) scrollBottom();
        }})})));
        // console.log('Show Acts', activities.length, acts);
        if(showLogs && !bottom) {
            // console.log('Show Bottom Button');
            out.push(e('a', { key : 'bottom', className : 'button short bottom', onClick : () => {
                IBC.play('tick');
                scrollBottom();
                $('.button.bottom').hide();
            }}, e(DisplayBox, { content : e('i', { className : 'arrow down'}), addClass : 'single center'})));
        }
    } else if(showLogs) {
        setShowLogs(false);
    }
    return (out);
}

function Activities({user, activities, scrollBottom}) {
    const [ display , setDisplay ] = useState([]);
    useEffect(() => {
        // console.log('Update Activities', activities.length);
        const getOneAct = (event) => {
            setTimeout(() => {
                $('.open .dealt').removeClass('dealt');
            }, 500);
            if(event.user_id == user.id) {
                return; // no need for sounds
            }
            switch(event.action) {
                case 'pass':
                    IBC.play('nudge', 'se');
                    return;
                case 'play':
                    IBC.chips(event.bet > 0, Math.abs(event.bet));
                    return;
                case 'shuffle':
                    IBC.play('shuffle', 'se');
                    $('.open .card').addClass('pass');
                    return;
                case 'pot':
                    for(let x = 0 ; x < Math.abs(event.bet); x++) {
                        setTimeout(() => {
                            IBC.play('chip', 'se');
                        }, x * IBC.chipDelay);
                    }
                    IBC.play('chip', 'se');
                    return;
                case 'deal':
                    IBC.play('card', 'se');
                    return;
            }
        }
        const previous = IBC.previous;
        let last = previous.length ? previous.slice(-1).pop() : null;
        var o = [];
        for(let x in activities) {
            const activity = activities[x];
            if(last && last.id >= activity.id) {
                continue; // skip done
            }
            if(last) getOneAct(activity);
            o.push(e(Activity, { key : x, user : user, activity : activity}));
        }
        IBC.previous = activities;
        scrollBottom()
        // console.log('Append activities', o.length);
        setDisplay(display.concat(o));
    }, [activities.length]);
    return display;
}

function Activity({user, activity}) {
    const [ display , setDisplay ] = useState('');
    useEffect(() => {
        // console.log('Update Activity', activity);
        const formatMessage = (ev) => {
            let message = ev.user_id == user.id ? 'You' : ev.name;
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
                    return message + ' played and ' + (ev.bet > 0 ? 'won' : 'lost') + ' ' + Maho.number(Math.abs(ev.bet));
                case 'shuffle':
                    return 'The deck is shuffled';
                case 'rotate':
                    return 'A new dealer is selected';
            }
        }
        setDisplay(e('div', {}, formatMessage(activity)));
    }, []);
    return display;
}

function Points({ points }) {
    const [ display , setDisplay ] = useState('');
    useEffect(() => {
        // console.log('Update Points', points);
        setDisplay(e('div', { className : 'info info_points' }, e(DisplayBox, { content : points, addClass : 'single right' })));
    }, [points]);
    return display;
}

function Message({ message , bottom, toggle }) {
    const [ display , setDisplay ] = useState('');
    useEffect(() => {
        // console.log('Update Message', message);
        setDisplay(e('a', { key : 'message', className : 'info info_message', style : {
            bottom : bottom
        }, onClick : toggle}, e(DisplayBox, { content : message, addClass : 'single'})));
    }, [message, bottom]);
    return display;
    
}

export default BasicUI;