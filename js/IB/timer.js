import DisplayBox from "./box.js";

const e = React.createElement;

export function Timer({percentage}) {
    const [ time , setTime ] = React.useState(0);
    React.useEffect(() => {
        setTimeout(() => {
            setTime(Date.now());
        }, 1000);
    });
    return e('div', { key  : 'timer' , className : 'timer' }, e('div', { key : 'sand' , className : 'sand', style : { top : percentage + '%'}}, ' '));
}

export default Timer;