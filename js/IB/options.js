import IBC from '../ib.js';
import Cookie from '../cookies.js';
import { DialogBox, ErrorBox, Button } from './box.js';

const e = React.createElement;
const s = React.useState;
const f = React.useEffect;

export function Options() {
    const [ showOptions , setShowOptions ] = s(false);

    const font_id = 'font';
    const master_id = 'master';
    const se_id = 'se';
    const bgm_id = 'bgm';
    const ani_id = 'animation';
    const tick_id = 'tick';
    const alert_id = 'alert';
    const deck_id = 'deck';
    const bg_id = 'bg';

    f(() => {
        $('#logo').click(() => {
            setShowOptions(true);
        });
    }, []);

    f(() => {
        if(!showOptions) {
            return;
        }
        setTimeout(() => {
            $('#' + font_id).val(IBC.font_size);
            $('#' + master_id).val(IBC.volume.master);
            $('#' + bgm_id).val(IBC.volume.bgm);
            $('#' + se_id).val(IBC.volume.se);
            $('#' + tick_id).prop('checked', IBC.volume.tick);
            $('#' + alert_id).prop('checked', IBC.volume.alert);
            $('#' + ani_id).prop('checked', IBC.graphics.animations);
            $('#' + deck_id).prop('checked', IBC.graphics.decks);
            $('#' + bg_id).prop('checked', IBC.graphics.bg);
        }, 300);
    }, [showOptions]);

    if(!showOptions) {
        return '';
    }

    const writeFont = () => {
        return 'Font Size: ' + IBC.font_size + 'pt';
    }
    const writeMaster = () => {
        return 'Master Volume: ' + (IBC.volume.master * 100) + '%';
    }
    const writeBGM = () => {
        return 'Music Volume: ' + (IBC.volume.bgm * 100) + '%';
    }
    const writeSE = () => {
        return 'Sound Effects Volume: ' + (IBC.volume.se * 100) + '%';
    }

    let content = [];
    content.push(e('h1', {key : 'title'}, 'Options Screen'));
    content.push(e('h3', { key : 'font', id : font_id + '-display'}, writeFont()));
    content.push(e('div', {key : 'font-slide'}, e('input', { 
        type        : 'range',
        className   : 'slider',
        min         : 10,
        max         : 16,
        step        : 1,
        id          : font_id,
        onChange    : () => {
            const val = $('#' + font_id).val();
            IBC.font_size = val;
            $('#' + font_id + '-display').html(writeFont());
            $(':root').css({
                '--font-size'   : val + 'pt',
                '--small-font'  : (val - 2) + 'pt',
                '--large-font'  : (1 * val + 4) + 'pt'
            });
            Cookie.set(IBC.cookies.font, val, IBC.cookie_days);
        }
    })));
    content.push(e('h3', { key : 'master', id : master_id + '-display'}, writeMaster()));
    content.push(e('div', {key : 'master-slide'}, e('input', { 
        type        : 'range',
        className   : 'slider',
        min         : 0,
        max         : 1,
        step        : 0.1,
        id          : master_id,
        onChange    : () => {
            const val = $('#' + master_id).val();
            IBC.volume.master = val;
            $('#' + master_id + '-display').html(writeMaster());
            IBC.volume.adjust();
            Cookie.set(IBC.cookies.master, val, IBC.cookie_days);
        }
    })));
    content.push(e('h3', { key : 'bgm', id : bgm_id + '-display'}, writeBGM()));
    content.push(e('div', {key : 'bgm-slide'}, e('input', { 
        type        : 'range',
        className   : 'slider',
        min         : 0,
        max         : 1,
        step        : 0.1,
        id          : bgm_id,
        onChange    : () => {
            const val = $('#' + bgm_id).val();
            IBC.volume.bgm = val;
            $('#' + bgm_id + '-display').html(writeBGM());
            IBC.volume.adjust();
            Cookie.set(IBC.cookies.bgm, val, IBC.cookie_days);
        }
    })));
    content.push(e('h3', { key : 'se', id : se_id + '-display'}, writeSE()));
    content.push(e('div', {key : 'se-slide'}, e('input', { 
        type        : 'range',
        className   : 'slider',
        min         : 0,
        max         : 1,
        step        : 0.1,
        id          : se_id,
        onChange    : () => {
            const val = $('#' + se_id).val();
            IBC.volume.se = val;
            $('#' + se_id + '-display').html(writeSE());
            Cookie.set(IBC.cookies.seff, val, IBC.cookie_days);
        }
    })));
    content.push(e('h3', { key : 'ticks', className : 'checkbox'}, [
        e('label', { key : 'label', for : tick_id}, 'Button Clicks'),
        e('span', {key : 'alerts'}, e('input', { 
            type        : 'checkbox',
            id          : tick_id,
            onChange    : () => {
                const val = $('#' + tick_id).prop('checked') ? 1 : 0;
                IBC.volume.tick = val;
                Cookie.set(IBC.cookies.tick, val, IBC.cookie_days);
            }
        }))
    ]));
    content.push(e('div', { key : 'buttons', className : 'buttons' }, e(Button, { display : 'Close', click : () => {
        setShowOptions(false);
    }, addClass : 'medium'})));
    return e(DialogBox, { content : content});
}

export default Options;