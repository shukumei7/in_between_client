import IBC from '../ib.js';
import DisplayBox from './box.js';

const e = React.createElement;
const s = React.useState;
const f = React.useEffect;

function PlayerAction({progress, hand, turn, max_bet, play, pass}) {
    const [ display , setDisplay ] = s('');
    const [ show , setShow ] = s(false);
    const changeBet = (add) => {
        const input = $('#' + IBC.bet_id);
        const val = input.val();
        if(add > IBC.tickMax) {
            add  = IBC.tickMax;
        }
        let next = val * 1 + add;
        if(next > max_bet) {
            next = max_bet;
        } else if(next < 1) {
            next = 1;
        }
        input.val(next);
        IBC.play('tick', 'se');
    }
    const stopTick = () => {
        clearInterval(IBC.tick);
        IBC.tickCount = 0;
    }
    f(() => {
        if(!turn || hand > 2) {
            setDisplay('');
            return;
        }
        setTimeout(() => {
            const input = $('#' + IBC.bet_id);
            const val = input.val();
            // console.log('Check Input', input, val);
            $('.playbar').show();
            if(input && typeof val != 'undefined' && !val.length) {
                input.val(Math.min(max_bet, IBC.default_pot));
            }
        }, 100);
        setDisplay(e('div', { key : 'playbar', className : 'playbar' }, [
            e('div', { key : 1 }, [
                e('div', { key : 'bet', className : 'bet input' } , e(DisplayBox, { content : e('input', { key : 'bet', id : IBC.bet_id, type : 'number', step : 1, min : 1, max : max_bet })})),
                e('a', { key : 'play', className : 'button medium', title : 'Play', onClick : () => play($('#' + IBC.bet_id).val())}, e(DisplayBox, { content : [
                    e('span', { key : 'text' }, 'Play '), 
                    e('i', { key : 'arrow', className : 'arrow right', style : {
                        borderColor : 'green'
                    }}, '')
                ], addClass : 'single center'}))
            ]),
            e('div', { key : 2 }, [
                e('a', { key : 'add', className : 'button short', title : 'Increase bet', onClick : () => {
                    stopTick();
                    changeBet(1);
                }, onMouseDown : () => {
                    stopTick();
                    IBC.tick = setInterval(() => {
                        IBC.tickCount++;
                        changeBet(IBC.tickCount);
                    }, IBC.tickSpeed);
                }, onMouseUp : stopTick}, e(DisplayBox, { content : e('i', { className : 'arrow up'}), addClass : 'single center'})),
                e('a', { key : 'less', className : 'button short', title : 'Decrease bet', onClick : () => {
                    stopTick();
                    changeBet(-1);
                }, onMouseDown : () => {
                    stopTick();
                    IBC.tick = setInterval(() => {
                        IBC.tickCount++;
                        changeBet(-1 * IBC.tickCount);
                    }, IBC.tickSpeed);
                }, onMouseUp : () => stopTick}, e(DisplayBox, { content : e('i', { className : 'arrow down'}), addClass : 'single center'})),
                e('a', { key : 'pass', className : 'button medium', title : 'Pass', onClick : pass}, e(DisplayBox, { content : [
                    e('span', { key : 'text' }, 'Pass  '),
                    e('b', { key : 1, className : 'closeX'}, 'X')
                ], addClass : 'single center'}))
            ])
        ]));
        // console.log('Check for player turn', progress);
    }, [progress, hand]);
    // console.log('Render Actions', progress);
    return display;
}
export default PlayerAction;