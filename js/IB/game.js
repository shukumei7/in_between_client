import IBC from '../ib.js';
import { Card } from './cards.js';

const e = React.createElement;

function GameInfo({user, game}) {
    const [ showDiscards, setShowDiscards ] = React.useState(false)
    return [
        e('div', { key : 'deck', className : 'deck' }, e(Deck, { key : 'deck', count : game.deck })), // e('div', { key : 'deck', className : 'deck' }, game.deck),
        e('div', { key : 'hidden', className : 'hidden' }, e(Deck, { key : 'hidden', count : game.hidden })), // e('div', { key : 'hidden', className : 'hidden' }, game.hidden),
        e('div', { key : 'discards', className : 'discards', onClick : () => {
            if(!game.discards.length) {
                return;
            }
            IBC.play('tick');
            if(!showDiscards) {
                setShowDiscards(true);
                return;
            }
            $('.discards .card').addClass('dealt');
            setTimeout(() => {
                setShowDiscards(false);
            }, 1500);
        }},  e(Discards, { key : 'discards', cards : game.discards, show : showDiscards})),
        e('div', { key : 'pot', className : 'pot' }, game.pot),
        e('div', { key : 'players', className : 'players' }, e(Players, { 
            user    : user,
            players : game.players,
            playing : game.playing,
            dealer  : game.dealer,
            current : game.current,
            scores  : game.scores,
            hands   : game.hands
        }))
    ]
}

function Discards({cards, show}) {
    if(!show) {
        return e(Deck, { key : 'discards', count : cards.length});
    }
    if(!$('.open').length) {
        setTimeout(() => {
            const hidden = $('.discards .dealt');
            hidden.removeClass('dealt');
        }, 300);
    }
    let out = [];
    for(let x in cards) {
        out.push(e(Card, { key : x, number : cards[x]}));
    }
    return [
        e('div', { key : 'blocker', className : 'blocker' }, ' '),
        e('div', { key : 'open', className : 'open' }, out)
    ];
}

function Deck({count}) {
    let cards = [e('div', { key : 'count', className : 'count'}, count)];
    for(let x = 0 ; x < count; x++) {
        cards.push(e('div', { key : x , className : 'card', style : {
            top     : 'calc(' + x + ' * -1 * var(--card-thickness))',
            left    : 'calc(' + x + ' * var(--card-slope))',
        }}, ' '));
    }
    return cards;
}

function Players({user, players, playing, dealer, current, scores, hands}) {
    let ordered = {...playing};
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
    return out  ;
}

function Player({name, is_dealer, is_current, score, hand}) {
    return (e('div', { key : 'player_' + name , className : 'player' }, [
        e('div', { key : 'name'}, name),
        e('div', { key : 'score'}, score),
        e('div', { key : 'hand'}, hand),
        e('div', { key : 'dealer'}, is_dealer ? 'Last' : ''),
        e('div', { key : 'current'}, is_current ? 'Current' : '')
    ]));
}

export default GameInfo;