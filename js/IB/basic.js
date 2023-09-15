import DisplayBox from './box.js';
import IBC from '../ib.js';
import Maho from '../maho.js';

const e = React.createElement;
const useState = React.useState;

function BasicUI({user, points, message, activities}) {
    const [ showLogs , setShowLogs ] = useState(false);
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
        const target = Math.floor($div.prop('scrollHeight') - wHeight);
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
    out.push(e('div', { key : 'points', className : 'info info_points' }, e(DisplayBox, { content : points, addClass : 'single right' })));
    out.push(e('a', { key : 'message', className : 'info info_message', style : {
        bottom : showLogs ? IBC.message_up : IBC.message_down
    }, onClick : () => {
        if(!activities.length) {
            if(showLogs) setShowLogs(false);
            return;
        }
        setShowLogs(!showLogs);
        if(showLogs) return;
        scrollBottom();
        setBottom(true);
    }}, e(DisplayBox, { content : message, addClass : 'single'})));

    if(activities.length) {
        const formatActivities = () => {
            const previous = IBC.previous;
            if(previous.length) {
                if(activities.length - previous.length == 1) IBC.play('nudge', 'se');
                else if(activities.length - previous.length > 1) {
                    const last = previous[previous.length - 1];
                    for(let x in activities) {
                        const event = activities[x];
                        if(event.id <= last.id) {
                            continue;
                        }
                        switch(event.action) {
                            case 'shuffle':
                                IBC.play('shuffle', 'se');
                                break;
                            case 'pot':
                                for(let x = 0 ; x < Math.abs(event.bet); x++) {
                                    setTimeout(() => {
                                        IBC.play('chip', 'se');
                                    }, x * IBC.chipDelay);
                                }
                                IBC.play('chip', 'se');
                                break;
                            case 'deal':
                                // IBC.play('card', 'se');
                                break;
                        }                        
                    }
                }
            }
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
            var o = [];
            for(let x in activities) {
                o.push(e('div', { key : 'activities_' + x }, formatMessage(activities[x]))); //  + ' - ' + activities[x].time));
            }
            if(previous.length < activities.length) {
                IBC.previous = activities;
                if(bottom) scrollBottom();
            }
            return o;
        }
        out.push(e('div', { key : 'activities', className : 'info info_activities ' + (showLogs ? '' : 'compress'), style : {
            '--box-height'  : showLogs ? IBC.log_height : 0,
            top             : showLogs ? IBC.log_up : IBC.log_down
        } }, e(DisplayBox, { content : formatActivities() })));
        // console.log('Show Bottom', showLogs, bottom);
        if(showLogs && !bottom) {
            // console.log('Show Bottom Button');
            out.push(e('a', { key : 'bottom', className : 'button short bottom', onClick : () => {
                scrollBottom();
                $('.button.bottom').hide();
            }}, e(DisplayBox, { content : e('i', { className : 'arrow down'}), addClass : 'single center'})));
        }
    } else if(showLogs) {
        setShowLogs(false);
    }
    return (out);
}

export default BasicUI;