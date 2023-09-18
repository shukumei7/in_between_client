import IBC from '../ib.js';
import Maho from '../maho.js';
import { Card } from './cards.js';
import DisplayBox from './box.js';

const e = React.createElement;
const useState = React.useState;
const useEffect = React.useEffect;

function GameInfo({user, game}) {
    const [ showDiscards, setShowDiscards ] = useState(false)
    const [ display , setDisplay ] = useState('');
    let out = [];
    out.push(e('div', { key : 'players', className : 'players' }, e(Players, { 
        user    : user,
        players : game.players,
        playing : game.playing,
        dealer  : game.dealer,
        current : game.current,
        scores  : game.scores,
        hands   : game.hands
    })));
    out.push(e('div', { key : 'hidden', className : 'hidden' }, e(Deck, { key : 'hidden', count : game.hidden, label : 'Trash: ' })));
    out.push(e('div', { key : 'deck', className : 'deck' }, e(Deck, { key : 'deck', count : game.deck, label : 'Deck: ' })));
    out.push(e('div', { key : 'discards', className : 'discards', onClick : () => {
        if(!game.discards.length) {
            if(showDiscards) setShowDiscards(false);
            return;
        }
        IBC.play('tick');
        if(!showDiscards) {
            setShowDiscards(true);
            return;
        }
        $('.discards .card').addClass('pass');
        setTimeout(() => {
            setShowDiscards(false);
        }, 1500);
    }, style : {
        '--card-thickness'   : '0.1px',
        '--card-slope'       : '5px',
        '--card-color'       : 'white'
    }},  e(Discards, { key : 'discards', cards : game.discards, show : showDiscards})));
    useEffect(() => {
        setDisplay([e('div', { key : 'pot', className : 'pot' }, (IBC.graphics.text ? 'Pot: ' : '') + Maho.number(game.pot))]);
    }, [game.pot, IBC.graphics.text]);
    return out.concat(display);
}

function Discards({cards, show}) {
    const [ display , setDisplay ] = useState('');
    // console.log('Update Discards', cards.length);
    useEffect(() => {
        if(!show) {
            setDisplay(e(Deck, { key : 'discards', count : cards.length, label : (IBC.showHelp ? 'Click to view Played: ' : 'Discards: '), cards : cards}));
            return;
        }
        setTimeout(() => {
            const hidden = $('.discards .dealt');
            hidden.removeClass('dealt');
        }, 300);
        let out = [];
        for(let x in cards) {
            out.push(e(Card, { key : x, number : cards[x]}));
        }
        setDisplay([
            e('div', { key : 'blocker', className : 'blocker' }, ' '),
            e('div', { key : 'close', className : 'close'}, [
                e('span', { key : 'help', className : 'message'}, 'Close'),
                e('span', { key : 'x', className : 'closeX'}, 'X')
            ]),
            e('div', { key : 'open', className : 'open' }, out),
            IBC.showHelp ? e('div', { key : 'message', className : 'message'}, 'These are discarded when players "Play". Scroll to the side to view more. Click anywhere to close.') : ''
        ]);
    }, [show, cards]);
    return display;    
}

export function Deck({label, count , cards = []}) {
    const [ display , setDisplay ] = useState([]);
    useEffect(() => {
        let deck = [];
        deck.push(e('div', { key : 'count', className : 'count'}, IBC.graphics.text ? label + count : count));
        if(IBC.graphics.decks <= 0) {
            setDisplay(deck);
            return;
        }
        for(let x = 0 ; x < count; x++) {
            let style = {
                top     : 'calc(' + x + ' * -1 * var(--card-thickness))',
                left    : 'calc(' + x + ' * var(--card-slope))'
            };
            deck.push(e(Discarded, { key : x, index : x, card : cards[x], style : style}));
        }
        setDisplay(deck);
    }, [count, IBC.graphics.decks, IBC.graphics.text, label]);
    return display;
}

export function Discarded({ index , card = 0, style = {}}) {
    const [ display , setDisplay ] = useState('');
    useEffect(() => {
        if(card) {
            // console.log('Draw Card', card);
            style.transform = 'rotateX(75deg) rotateZ(' + Math.round(Math.random() * 200 - 150) + 'deg)';
            setDisplay(e(Card, { key : index, number : card, style : style, dealt : '' }));
            return;
        }
        setDisplay(e('div', { key : index , className : 'card', style : style}, ' '));
    }, []);
    return display;
}

export function Players({user, players, playing, dealer, current, scores, hands}) {
    const [ display , setDisplay ] = useState('');
    useEffect(() => {
        let ordered = playing.toReversed();
        let out = [];
        let found = false;
        for(let x in ordered) {
            const id = ordered[x];
            if(id == user.id) {
                delete ordered[x];
                found = true;
                continue;
            }
            if(found) {
                out.push(e(Player, { key : 'player_' + id, name : players[id], is_dealer : dealer == id, is_current : current == id, score : scores[id], hand : hands[id]}));
                delete ordered[x];
            }
        }
        // console.log('Remaining players', ordered);
        for(let x in ordered) {
            const id = ordered[x];
            out.push(e(Player, { key : 'player_' + id, name : players[id], is_dealer : dealer == id, is_current : current == id, score : scores[id], hand : hands[id]}));
        }
        setDisplay(out);
    }, [current]);
    return display;;
}

export function Player({name, is_dealer, is_current, score, hand}) {
    return (e('div', { key : 'player_' + name , className : 'player' }, e(DisplayBox, { content : [
        e('div', { key : 'name'}, name),
        e('div', { key : 'score'}, score),
        e('div', { key : 'hand'}, hand),
        e('div', { key : 'dealer'}, is_dealer ? 'Last' : ''),
        e('div', { key : 'current'}, is_current ? 'Current' : '')
    ]})));
}

export default GameInfo;