import IBC from '../ib.js';

const e = React.createElement;

function GameInfo({user, game}) {
    return [
        e('div', { key : 'deck', className : 'deck' }, game.deck),
        e('div', { key : 'hidden', className : 'hidden' }, game.hidden),
        e('div', { key : 'discards', className : 'discards' }, game.discards),
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