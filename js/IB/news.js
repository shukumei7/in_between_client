import IBC from '../ib.js';
import Maho from '../maho.js';
import { DialogBox , Button } from "./box.js";

const e = React.createElement;
const s = React.useState;
const f = React.useEffect;

export function News({ close = null}) {
    let content = [];
    content.push(e('h1', {key : 'title'}, 'Welcome to In Between!'));
    content.push(e('div', {key : 'settings', className : 'body'}, [
        e('h3', {key : 'subheading'}, 'Current Server Settings'),
        e('ul', {key : 'contents'}, [
            e('li', {key : 1}, 'Default Room Pot: ' + Maho.number(IBC.default_pot)),
            e('li', {key : 2}, 'Maximum Room Pot: ' + Maho.number(IBC.max_pot)),
            e('li', {key : 3}, 'Restricted Bet: ' + Maho.number(IBC.restrict_bet)),
            e('li', {key : 4}, 'Maximum Players: ' + Maho.number(IBC.max_players)),
            e('li', {key : 5}, 'Timeout Warning: ' + Maho.number(IBC.alertDiff) + ' seconds'),
            e('li', {key : 6}, 'Pass Timeout: ' + Maho.number(IBC.timeout) + ' seconds'),
            e('li', {key : 7}, 'Auto-Kick: After ' + Maho.number(IBC.kick) + ' timeouts'), 
        ]),
    ]));
    if(close) {
        content.push(e('div', {key : 'buttons', className : 'buttons'}, e(Button, { display : 'Close', click : close, addClass : 'medium'})));
    }
    return e(DialogBox, { content : content});
}

export default News;