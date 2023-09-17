import IBC from '../ib.js';
import DisplayBox from "./box.js";

const e = React.createElement;
const s = React.useState;
const f = React.useEffect;

export function CardHand({cards}) {
    const [ display , setDisplay ] = s([]);
    // console.log('Load Cards', cards);
    f(() => {
        setTimeout(() => {
            const hidden = $('.hand .dealt');
            hidden.removeClass('dealt');
            for(let x = 0; x < hidden.length; x++) {
                setTimeout(() => {
                    IBC.play('card');
                }, x * 200);
            }
        }, 200);
        let out = [];
        for(let x in cards) {
            const number = cards[x];
            out.push(e(Card, { key : 'card_' + number, number : number }));
        }
        setDisplay(e('div', { key : 'hand', className : 'hand' }, out));
    }, [cards]);
    return display;    
}

export function Card({number , style = {}, dealt = 'dealt'}) {
    let value = Math.round(number / 10);
    const suit = number % 5;
    let symbol = Clubs;
    let suitClass = 'club';
    switch(suit) {
        case 4:
            symbol = Diamond;
            suitClass = 'diamond';
            break;
        case 3:
            symbol = Heart;
            suitClass = 'heart';
            break;
        case 2:
            symbol = Spade;
            suitClass = 'spade';
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
    return (e('div', { key : 'card_' + number, className : 'card card_' + number + ' ' + suitClass + ' ' + dealt, style : style }, e(DisplayBox, { content : [
        e('div', { key : 'number', className : 'number' }, '' + value),
        e(symbol, { key : 'suit' })
    ] })));
}

function Diamond() {
    return [
        e('div', { key : 'd', className : 'marker' }, [
            e('div', { key : 1, className : 'square'})
        ])
    ];
    //   '<div class="diamond"><div class="square"></div></div>';
}

function Heart() {
    return (
        e('div', { key : 'h', className : 'marker' }, [
            e('div', { key : 1, className : 'square'}),
            e('div', { key : 2, className : 'circle1'}),
            e('div', { key : 3, className : 'circle2'})
        ])
    );
    // return '<div class="heart"><div class="square"></div><div class="circle1"></div><div class="circle2"></div></div>';
}

function Spade() {
    return (
        e('div', { key : 's', className : 'marker' }, [
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
        e('div', { key : 'c', className : 'marker' }, [
            e('div', { key : 1, className : 'circle1'}),
            e('div', { key : 2, className : 'circle2'}),
            e('div', { key : 3, className : 'circle3'}),
            e('div', { key : 4, className : 'tail'})
        ])
    );
    // return '<div class="club"><div class="circle1"></div><div class="circle2"></div><div class="circle3"></div><div class="tail"></div></div>';
}

export default CardHand;