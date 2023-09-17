import IBC from '../ib.js';

const e = React.createElement;

export function Timer({deadline}) {
    const [ time , setTime ] = React.useState(0);
    const [ timed, setTimed ] = React.useState(0);

    React.useEffect(() => { // initialize timer
        const diff = deadline - (Date.now() / 1000);
        // console.log('Start Timer', deadline, diff);
        setTimed(diff);
        setTimeout(() => {
            $('.sand').css('transition', 'top 1s linear');
        }, 200);
        IBC.play('bell');
    }, []);

    React.useEffect(() => {
        setTimeout(() => {
            setTime(time + 1);
            if(time == Math.round(IBC.timeout / 2)) {
                console.log('Half time alert', time, IBC.timeout);
                IBC.play('bell');
            } else if(timed > 0 && time < timed && timed - time < IBC.alertDiff) { // last few seconds
                console.log('Last ' + (timed - time) + 'seconds');
                IBC.play('bell');
            }
        }, 1000);
    });
    // console.log('Render Timer', time, timed);
    const percentage = timed < 0 ? 100 : time / timed * 100;
    return e('div', { key  : 'timer' , className : 'timer' }, e('div', { key : 'sand' , className : 'sand', style : { top : percentage + '%'}}, ' '));
}

export default Timer;