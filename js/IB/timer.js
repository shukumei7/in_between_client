import IBC from '../ib.js';

const e = React.createElement;

export function Timer({deadline}) {
    const [ display , setDisplay ]  = React.useState('');
    const [ time , setTime ] = React.useState(0);

    React.useEffect(() => { // initialize timer
        const diff = deadline - (Date.now() / 1000);
        // console.log('Start Timer', deadline, diff);
        setTime(IBC.timeout - diff);
        setTimeout(() => {
            $('.sand').css('transition', 'top 1s linear');
        }, 200);
        if(diff <= 0) {
            return;
        }
        IBC.play('bell');
    }, []);

    React.useEffect(() => {
        const diff = IBC.timeout - time;
        setTimeout(() => {
            const next = time + 1;
            setTime(next);
            if(next == Math.round(IBC.timeout / 2)) {
                console.log('Half time alert', time, IBC.timeout);
                IBC.play('bell');
            } else if(diff >= 0 && diff < IBC.alertDiff) { // last few seconds
                console.log('Last ' + (IBC.timeout - next) + 'seconds');
                IBC.play('bell');
            }
            const percentage = diff < 0 ? 100 : next / IBC.timeout * 100;
            setDisplay(e('div', { key  : 'timer' , className : 'timer' }, e('div', { key : 'sand' , className : 'sand', style : { top : percentage + '%'}}, ' ')))
        }, 1000);
    });

    return display;
}

export default Timer;