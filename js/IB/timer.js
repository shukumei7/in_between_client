import IBC from '../ib.js';

const e = React.createElement;

export function Timer({deadline}) {
    const [ time , setTime ] = React.useState(0);
    const [ timed, setTimed ] = React.useState(0);

    React.useEffect(() => {
        const diff = deadline - (Date.now() / 1000);
        console.log('Set deadline', deadline, diff);
        setTimed(diff);
    }, []);

    React.useEffect(() => {
        setTimeout(() => {
            setTime(time + 1);
        }, 1000);
    });
    // console.log('Render Timer', time, timed);
    const percentage = timed < 0 ? 100 : time / timed * 100;
    return e('div', { key  : 'timer' , className : 'timer' }, e('div', { key : 'sand' , className : 'sand', style : { top : percentage + '%'}}, ' '));
}

export default Timer;