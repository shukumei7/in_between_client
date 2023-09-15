import DisplayBox from "./box.js";

const e = React.createElement;

function Timer() {
    return e('div', { key  : 'timer' , className : 'timer' }, e(DisplayBox, { content : e('div', { className : 'sand' }, ' ')}));
}