const e = React.createElement;

export function DisplayBox({content, addClass = '', css = {}}) {
    return e('div', { className : 'box' , style : css }, [
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

export default DisplayBox;