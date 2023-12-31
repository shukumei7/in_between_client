import IBC from '../ib.js';

const e = React.createElement;

export function DisplayBox({content, addClass = '', css = {}, back = {}}) {
    return e('div', { key : 'box', className : 'box' , style : css }, [
        e('div', { key : 'back', className : 'back', style : back}, ' '),
        e('div', { key : 'content', className : 'content ' + addClass}, content),
        e('div', { key : 'top', className : 'box__line box__line--top'}),
        e('div', { key : 'left', className : 'box__line box__line--left'}),
        e('div', { key : 'right', className : 'box__line box__line--right'}),
        e('div', { key : 'bottom', className : 'box__line box__line--bottom'})
    ]);
}

export function DialogBox({content, size = '', style = {}}) {
    return ([
        e('div', { key : 'blocker', className : 'blocker' }, ' '), 
        e('div', { key : 'modal', className : 'modal ' + size, style : style }, e(DisplayBox, { content : content}))
    ]);
}

export function ConfirmBox({content, no = 'No', yes = 'Yes', style = {}, action, close, actionClass = 'short', closeClass = 'short'}) {
    return e(DialogBox, {
        size    : 'quarter',
        style   : style,
        content : [
            e('div', { key : 'message' }, content),
            e('div', { key : 'buttons', className : 'buttons' }, [
                e(Button, { key : 'close', display : no, click : close, addClass : closeClass }),
                e(Button, { key : 'yes', display : yes, click : action, addClass : actionClass })
            ])
        ]
    });
}

export function FormBox({inputs = [], buttons = [], size = ''}) {
    return ([
        e('div', { key : 'blocker', className : 'blocker' }, ' '), 
        e('div', { key : 'modal', className : 'modal ' + size }, e(DisplayBox, { content : [
            e('div', { key : 'inputs', className : 'input' }, inputs),
            e('div', { key : 'buttons', className : 'buttons' }, buttons)
        ] }))
    ]);
}

export function ErrorBox({message , close = null}) {
    return [
        e('div', { key : 'blocker', className : 'blocker error' }, ''),
        e('div', { key : 'message', className : 'login error' }, e(FormBox, { 
            size    : 'quarter',
            inputs  : [ e('div', { key : 'message' }, message) ],
            buttons : close ? [ e('a', { key : 'button', className : 'button', onClick : close}, e(DisplayBox, { content : 'Close', addClass : 'single center' }))] : []
         }))
    ];
}

export function Button({ display , click , addClass = '', style = {}}) {
    return e('a', { className : 'button ' + addClass, onClick : () => {
        IBC.play('tick');
        click();
    }, style : style}, e(DisplayBox, { content : display , addClass : 'single center'}));
}

export default DisplayBox;