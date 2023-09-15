import IBC from '../ib.js';
import DisplayBox from "./box.js";

const e = React.createElement;

function CardHand({cards}) {
    // console.log('Load Cards', cards);
    setTimeout(() => {
        const hidden = $('.hand .dealt');
        // console.log('Show Cards', cards.length, hidden.length);
        if(hidden.length < 3) {
            hidden.removeClass('dealt');
            for(let x = 0; x < hidden.length; x++) {
                setTimeout(() => {
                    IBC.play('card', 'se');
                }, x * 300);
            }
            return;
        }
    }, 300);
    let out = [];
    for(let x in cards) {
        const number = cards[x];
        out.push(e(Card, { key : 'card_' + number, number : number }));
    }
    return e('div', { key : 'hand', className : 'hand' }, out);
}

export function Card({number}) {
    let value = Math.round(number / 10);
    const suit = number % 5;
    let symbol = Clubs;
    switch(suit) {
        case 4:
            symbol = Diamond;
            break;
        case 3:
            symbol = Heart;
            break;
        case 2:
            symbol = Spade;
            break;
    }
    switch(value) {
        case 11:
            value = 'J';
            break;
        case 12:
            value = 'Q';
            break;
        case 13:
            value = 'K';
            break;
        case 14:
            value = 'A';
            break;
    }
    // console.log('Card', value, suit);
    return (e('div', { key : 'card_' + number, className : 'card dealt' }, e(DisplayBox, { content : [
        e('div', { key : 'number', className : 'number' }, value),
        e(symbol, { key : 'suit' })
    ] })));
}

function Diamond() {
    return (
        e('div', { className : 'diamond' }, [
            e('div', { key : 1, className : 'square'})
        ])
    );
    //   '<div class="diamond"><div class="square"></div></div>';
}

function Heart() {
    return (
        e('div', { className : 'heart' }, [
            e('div', { key : 1, className : 'square'}),
            e('div', { key : 2, className : 'circle1'}),
            e('div', { key : 3, className : 'circle2'})
        ])
    );
    // return '<div class="heart"><div class="square"></div><div class="circle1"></div><div class="circle2"></div></div>';
}

function Spade() {
    return (
        e('div', { className : 'spade' }, [
            e('div', { key : 1, className : 'square'}),
            e('div', { key : 2, className : 'circle1'}),
            e('div', { key : 3, className : 'circle2'}),
            e('div', { key : 4, className : 'tail'})
        ])
    );
    // return '<div class="spade"><div class="square"></div><div class="circle1"></div><div class="circle2"></div><div class="tail"></div></div>';
}

function Clubs() {
    return (
        e('div', { className : 'club' }, [
            e('div', { key : 1, className : 'circle1'}),
            e('div', { key : 2, className : 'circle2'}),
            e('div', { key : 3, className : 'circle3'}),
            e('div', { key : 4, className : 'tail'})
        ])
    );
    // return '<div class="club"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="tail"></div></div>';
}

export default CardHand;