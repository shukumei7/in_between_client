import IBC from '../ib.js';

const e = React.createElement;

export function Timer({deadline, requestUpdate}) {
    const [ display , setDisplay ]  = React.useState('');
    const [ time , setTime ] = React.useState(0);

    React.useEffect(() => { // initialize timer
        const diff = deadline - (Date.now() / 1000);
        // console.log('Start Timer', deadline, diff);
        setTime(Math.round(IBC.timeout - diff));
        if(diff <= 0) {
            return;
        }
        if(IBC.graphics.animations) {
            setTimeout(() => {
                $('.sand').css('transition', 'top 1s linear');
            }, 200);
        }
        IBC.play('bell');
    }, []);

    React.useEffect(() => {
        clearTimeout(IBC.alert);
        IBC.alert = setTimeout(() => {
            const next = time + 1;
            const diff = IBC.timeout - next;
            setTime(next);
            if(next == Math.round(IBC.timeout / 2)) {
                // console.log('Half time alert', time, IBC.timeout);
                IBC.play('bell');
                requestUpdate();
            } else if(diff >= 0 && diff < IBC.alertDiff) { // last few seconds
                // console.log('Last ' + (IBC.timeout - next) + 'seconds');
                IBC.play('bell');
            } else if(diff < 0 && next % 5 == 0) {
                requestUpdate();    // request continuous update to remove user turn
            }
            const percentage = diff < 0 ? 100 : next / IBC.timeout * 100;
            // console.log('Render timer', next);
            setDisplay(e('div', { key  : 'timer' , className : 'timer' }, e('div', { key : 'sand' , className : 'sand', style : { top : percentage + '%'}}, ' ')))
        }, 1000);
    });

    return display;
}

export default Timer;