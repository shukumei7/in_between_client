const e = React.createElement;

export function DisplayBox({content, addClass = '', css = {}}) {
    return e('div', { key : 'box', className : 'box' , style : css }, [
        e('div', { key : 'content', className : 'content ' + addClass}, content),
        e('div', { key : 'top', className : 'box__line box__line--top'}),
        e('div', { key : 'left', className : 'box__line box__line--left'}),
        e('div', { key : 'right', className : 'box__line box__line--right'}),
        e('div', { key : 'bottom', className : 'box__line box__line--bottom'})
    ]);
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

export function ErrorBox({message , close}) {
    return [
        e('div', { key : 'blocker', className : 'blocker error' }, ''),
        e('div', { key : 'message', className : 'login error' }, e(FormBox, { 
            size    : 'quarter',
            inputs  : [ e('div', { key : 'message' }, message) ],
            buttons : [ e('a', { key : 'button', className : 'button', onClick : close}, e(DisplayBox, { content : 'Close', addClass : 'single center' }))]
         }))
    ];
}

export default DisplayBox;