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
            IBC.analytics.event('open_discards');
            return;
        }
        $('.discards .card').addClass('pass');
        $('.open').css('overflow-x', 'hidden');
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
            setTimeout(() => {
                $('.open').css('overflow-x', 'auto');
            }, 1000);
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
        setTimeout(() => {
            const current = $('.current');
            if(!current.length) {
                return;
            }
            const container = $('.players');
            // const scroll = container.scrollLeft();
            // const width = container.width();
            const pos = current.position();
            const target = pos.left;
            // console.log('Check Player Scroll', scroll, pos.left, width, target);
            container.animate({
                scrollLeft : target
            }, IBC.graphics.animations ? 500 : 0);
        }, 100);
    }, [current, dealer]);
    return display;;
}

export function Player({name, is_dealer, is_current, score, hand}) {
    const [ face , setFace ] = useState('');
    const [ time , setTime ] = useState(-1);
    const [ display, setDisplay ] = useState('');

    React.useEffect(() => {
        // const width = (Math.round(Math.random() * 20 + 25) + '%');
        // const height = (Math.round(Math.random() * 20 + 25) + '%');
        setFace([
            /*
            e('div', { key : 'avatar', className : '' 'avatar curly', style : {
                '--face-height' : height,
                '--face-width' : width,
            }}),
            */
            e('div', { key : 'name'}, name)
        ]);
    }, []);
    const updateTimer = (level) => {
        if(!face) {
            return;
        }
        let css = css = {
            backgroundPositionY : 0
        };
        let addClass = '';
        if(is_current) {
            addClass = addClass + ' current';
            const remaining = level / IBC.timeout;
            const $current = $('.player');
            const height = $current.length ? $current.find('.box').height() : 0;
            css = {
                backgroundPositionY : height * remaining
            };
            // console.log('Update background', name, IBC.timeout, level, remaining, height, height * remaining);
        }
        // console.trace('Update Player', name, addClass);
        setDisplay((e('div', { key : 'player_' + name , className : 'player' + addClass }, e(DisplayBox, { content : face.concat([
            e('div', { key : 'score'}, Maho.number(score)),
            e(CardBack, { key : 'hand', cards : hand})
        ]), back : css}))));
    }
    React.useEffect(() => {
        if(!is_current || time > IBC.timeout) {
            return;
        }
        // console.log('Prepare time', name, time);
        clearTimeout(IBC.timers.others);
        IBC.timers.others = setTimeout(() => {
            const next = time + 1;
            // console.log('Tick time', name, next);
            updateTimer(next);
            setTime(next);
        }, 1000);
    }, [time]);
    React.useEffect(() => {
        // console.log('Render Current', name, is_current ? 'yes' : 'no');
        updateTimer(0);
        if(is_current) {
            // console.log('Start timer', name);
            clearTimeout(IBC.timers.others);
            setTime(0);
            return;
        }
    }, [is_current]);
    React.useEffect(() => {
        // console.log('Render Current', name, is_current ? 'yes' : 'no');
        updateTimer(time);
    }, [score, face, hand]);
    return display;
}

function CardBack({cards}) {
    let out = [];
    for(let x = 0 ; x < cards; x++) {
        out.push(e('div', { key : x, className : 'card'}));
    }
    return e('div', { className : 'card-back'}, out);
}

export default GameInfo;