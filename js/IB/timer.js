import IBC from '../ib.js';

const e = React.createElement;
const message = 'It\'s your turn!';

export function Timer({deadline, requestUpdate}) {
    const [ display , setDisplay ]  = React.useState('');
    const [ time , setTime ] = React.useState(0);

    const drawTimer = (time) => {
        const percentage = time < 0 ? 100 : (IBC.timeout - time) / IBC.timeout * 100;
        setDisplay(e('div', { key  : 'timer' , className : 'timer' }, e('div', { key : 'sand' , className : 'sand', style : { top : percentage + '%'}}, ' ')));
    }

    React.useEffect(() => { // initialize timer
        const now = IBC.now();
        const diff = deadline - now;
        setTime(diff);
        drawTimer(diff);
        if(diff <= 0) {
            console.log('Expired Timer', deadline, now, diff);
            return;
        }
        if(IBC.graphics.animations) {
            setTimeout(() => {
                $('.sand').css('transition', 'top 1s linear');
            }, 1200);
        }
        IBC.playAlert(message);
    }, []);

    React.useEffect(() => {
        clearTimeout(IBC.alert);
        IBC.alert = setTimeout(() => {
            const next = time - 1;
            // console.log('Next', diff);
            if(next <= 0) {
                drawTimer(next);
                return;
            }
            setTime(next);
            if(next == Math.round(IBC.timeout / 2)) {
                // console.log('Half time alert', time, IBC.timeout);
                IBC.play('bell');
                requestUpdate();
            } else if(next >= 0 && next < IBC.alertDiff) { // last few seconds
                // console.log('Last ' + (IBC.timeout - next) + 'seconds');
                IBC.play('bell');
            } else if(next < 0 && next % 5 == 0) {
                requestUpdate();    // request continuous update to remove user turn
            }
            drawTimer(next);
        }, 1000);
    }, [display]);

    return display;
}

export default Timer;