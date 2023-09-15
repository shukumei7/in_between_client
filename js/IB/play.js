import IBC from '../ib.js';
import DisplayBox from './box.js';

const e = React.createElement;

function PlayerAction({max_bet, play, pass}) {
    setTimeout(() => {
        const input = $('#' + IBC.bet_id);
        const val = input.val();
        // console.log('Check Input', input, val);
        if(input && typeof val != 'undefined' && !val.length) {
            input.val(Math.min(max_bet, IBC.restrict_bet));
        }
    }, 100);
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
    return e('div', { key : 'playbar', className : 'playbar' }, [
        e('div', { key : 1 }, [
            e('div', { key : 'bet', className : 'input' } , e(DisplayBox, { content : e('input', { key : 'bet', id : IBC.bet_id, type : 'number', step : 1, min : 1, max : max_bet })})),
            e('a', { key : 'play', className : 'button short', title : 'Play', onClick : () => {
                play($('#' + IBC.bet_id).val());
            }}, e(DisplayBox, { content : e('i', { className : 'arrow right', style : {
                borderColor: 'green'
            }}), addClass : 'single center'}))
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
            }, onMouseUp : () => stopTick}, e(DisplayBox, { content : e('i', { className : 'arrow down'}), addClass : 'single center'}))
        ]),
        e('div', { key : 3 } ,
            e('a', { key : 'pass', className : 'button short', title : 'Pass', onClick : () => {
                pass();
            }}, e(DisplayBox, { content : [
                e('i', { key : 1, className : 'arrow down', style : {
                    borderColor: 'red'
                }}),
                e('i', { key : 2, className : 'arrow up', style : {
                    borderColor: 'red'
                }})
            ], addClass : 'single center'}))
        )
    ]);
}
export default PlayerAction;