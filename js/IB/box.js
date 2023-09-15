const e = React.createElement;

function DisplayBox({content, addClass = '', css = {}}) {
    return e('div', { className : 'box' , style : css }, [
        e('div', { key : 'content', className : 'content ' + addClass}, content),
        e('div', { key : 'top', className : 'box__line box__line--top'}),
        e('div', { key : 'left', className : 'box__line box__line--left'}),
        e('div', { key : 'right', className : 'box__line box__line--right'}),
        e('div', { key : 'bottom', className : 'box__line box__line--bottom'})
    ]);
}

export default DisplayBox;