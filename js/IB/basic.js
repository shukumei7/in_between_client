import DisplayBox from './box.js';
import IBC from '../ib.js';
import Maho from '../maho.js';

const e = React.createElement;
const useState = React.useState;
const useEffect = React.useEffect;

function BasicUI({user, points, message, activities, showLogs, setShowLogs}) {
    const [ display , setDisplay ] = useState([]);
    const [ bottom , setBottom ] = useState(true); 
    const [ div , setDiv ] = useState(null);

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

    const getElements = () => {
        let out = [];

        out.push(e(Points, { key : 'points', points : points}));

        out.push(e(Activities, { 
            key          : 'activities',
            user         : user, 
            activities   : activities, 
            showLogs     : showLogs,
            scrollBottom : () => {
                if(bottom) scrollBottom();
            }
        }));
        // console.log('Show Acts', activities.length, acts);
        
            // console.log('Show Bottom Button');
        out.push(e(BottomButton, { key : 'bottom_scroll', bottom : bottom, showLogs : showLogs && activities.length, scrollBottom : () => {
            IBC.play('tick');
            scrollBottom();
            $('.button.bottom').hide();
        }}));

        if(!activities.length && showLogs) {
            setShowLogs(false);
        }

        out.push(e(Message, { 
            key     : 'message', 
            message : message , 
            showLogs : showLogs,
            toggle  : () => {
                IBC.play('tick');
                if(!activities.length) {
                    if(showLogs) setShowLogs(false);
                    return;
                }
                setShowLogs(!showLogs);
                if(showLogs) return;
                scrollBottom();
                setBottom(true);
            }
        }));
        // console.log('Update Elements', activities.length);
        return (out);
    }

    useEffect(() => {
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
    }, [div]);

    useEffect(() => {
            setDisplay(getElements());
    }, [showLogs, points, message, bottom, activities.length]);
    return display;
}

function BottomButton({bottom, showLogs, scrollBottom}) {
    if(!showLogs || bottom) {
        return '';
    }
    //  console.log('Render Button', showLogs, bottom, showLogs && !bottom);
    return e('a', { key : 'bottom', className : 'button short bottom', onClick : scrollBottom}, e(DisplayBox, { content : e('i', { className : 'arrow down'}), addClass : 'single center'}))
}

function Activities({user, activities, showLogs, scrollBottom}) {
    const [ box , setBox ] = useState('');
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
        if(!activities.length) {
            IBC.previous = activities;
            setDisplay([]);
            return;
        }
        const previous = IBC.previous;
        let last = previous.length ? previous.slice(-1).pop() : null;
        let o = [];
        let count = 0;
        for(let x in activities) {
            const activity = activities[x];
            if(last && last.id >= activity.id) {
                continue; // skip done
            }
            if(last) {
                setTimeout(() => {
                    getOneAct(activity);
                }, count++ * 500);
            }
            o.push(e(Activity, { key : activity.id, user : user, activity : activity}));
        }
        IBC.previous = activities;
        scrollBottom()
        const newD = display.concat(o)
        // console.log('Append activities', o.length, display.length, newD.length);
        setDisplay(newD);
    }, [activities.length]);
    useEffect(() => {
        const bottom = showLogs ? 'var(--log-up)' : 'var(--log-down)';
        const isDown = bottom.includes('down');
        setBox(e('div', { key : 'activities', className : 'info info_activities ' + (!isDown ? '' : 'compress'), style : {
            bottom : bottom,
            '--box-opacity'     : !isDown ? 1 : 0.9
        }}, e(DisplayBox, { content : display })));
    }, [showLogs, display]);
    return box;
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
                    return message + ' left the room';
                case 'kick':
                    return message + ' was kicked out of the room';
                case 'pot':
                    return message + ' added ' + Maho.number(Math.abs(ev.bet)) + ' to the pot';
                case 'deal':
                    return message + ' got a card';
                case 'pass':
                    return message + ' passed';
                case 'timeout':
                    return message + ' ran out of time';
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
        setDisplay(e('div', { className : 'info info_points' }, e(DisplayBox, { content : points + ' point' + (points == 1? '' : 's'), addClass : 'single right' })));
    }, [points]);
    return display;
}

function Message({ message , showLogs, toggle }) {
    const [ display , setDisplay ] = useState('');
    useEffect(() => {
        // console.log('Update Message', message);
        const bottom = showLogs ? 'var(--message-up)' : 'var(--message-down)';
        const isDown = bottom.includes('down');
        setDisplay(e('div', { key : 'message', className : 'info info_message', style : {
            bottom          : bottom,
            '--box-opacity' : isDown ? 0.9 : 1
        }}, [
            (IBC.showHelp ? e('div', { key : 'note' , className : 'message' }, 'Click to show more activity') : ''),
            e('a', { key : 'message', className : 'body', onClick : toggle}, e(DisplayBox, { content : [
                e('span', { key : 'text' }, message),
                e('span', { key : 'arrow' }, e('i', { className : 'arrow ' + (isDown ? 'up' : 'down') }, ' '))
            ], addClass : 'single'})),
            
        ]));
    }, [message, showLogs, IBC.showHelp]);
    return display;
    
}

export default BasicUI;