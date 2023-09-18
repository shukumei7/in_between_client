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
    const anim_id = 'animation';
    const tick_id = 'tick-check';
    const alert_id = 'alert-bell';
    const deck_id = 'deck';
    const bg_id = 'bg';
    const help_id = 'help';
    const text_id = 'text';
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
        }, 100);
    }, [showOptions]);
    if(!showOptions) {
        return '';
    }
    let content = [];
    content.push(e('h1', {key : 'title'}, 'Options Screen'));
    content.push(e(Slider, {
        key         : font_id,
        id          : font_id,
        label       : 'Font Size',
        format      : (val) => val + 'px',
        min         : 10,
        max         : 24,
        step        : 1,
        callback    : (val) => {
            IBC.updateFont(val);
            Cookie.set(IBC.cookies.font, val, IBC.cookie_days);
        }
    }));
    content.push(e(Slider, {
        key         : master_id,
        id          : master_id,
        label       : 'Master Volume',
        format      : (val) => (val * 100) + '%',
        min         : 0,
        max         : 1,
        step        : 0.1,
        callback    : (val) => {
            IBC.volume.master = val;
            IBC.volume.adjust();
            Cookie.set(IBC.cookies.master, val, IBC.cookie_days);
        }
    }));
    content.push(e(Slider, {
        key         : bgm_id,
        id          : bgm_id,
        label       : 'Music Volume',
        format      : (val) => (val * 100) + '%',
        min         : 0,
        max         : 1,
        step        : 0.1,
        callback    : (val) => {
            IBC.volume.bgm = val;
            IBC.volume.adjust();
            Cookie.set(IBC.cookies.bgm, val, IBC.cookie_days);
        }
    }));
    content.push(e(Slider, {
        key         : se_id,
        id          : se_id,
        label       : 'Sound Effects Volume',
        format      : (val) => (val * 100) + '%',
        min         : 0,
        max         : 1,
        step        : 0.1,
        callback    : (val) => {
                IBC.volume.se = val;
                Cookie.set(IBC.cookies.se, val, IBC.cookie_days);
        }
    }));
    content.push(e(Checkbox, {
        key         : 'tick-check',
        id          : tick_id,
        label       : 'Button Clicks',
        source      : IBC.volume.tick,
        callback    : (val) => {
            IBC.volume.tick = val = val ? 1 : 0;
            Cookie.set(IBC.cookies.tick, val, IBC.cookie_days);
        }
    }));
    content.push(e(Checkbox, {
        key         : 'alert-check',
        id          : alert_id,
        label       : 'Turn Alerts',
        source      : IBC.volume.bell,
        callback    : (val) => {
            IBC.volume.bell = val = val ? 1 : 0;
            Cookie.set(IBC.cookies.alert, val, IBC.cookie_days);
        }
    }));
    content.push(e(Checkbox, {
        key         : 'animation-check',
        id          : anim_id,
        label       : 'Animations',
        source      : IBC.graphics.animations,
        callback    : IBC.graphics.setAnimations
    }));
    content.push(e(Checkbox, {
        key         : 'decks-check',
        id          : deck_id,
        label       : 'Show Decks',
        source      : IBC.graphics.decks,
        callback    : (val) => Cookie.set(IBC.cookies.decks, IBC.graphics.decks = val ? 1 : 0)
    }));
    content.push(e(Checkbox, {
        key         : 'help-check',
        id          : help_id,
        label       : 'Show Help Text',
        source      : IBC.showHelp,
        callback    : (val) => {
            Cookie.set(IBC.cookies.help, IBC.showHelp = val ? 1 : 0);
            IBC.updateFont();
        }
    }));
    content.push(e(Checkbox, {
        key         : 'text-check',
        id          : text_id,
        label       : 'Show All Text',
        source      : IBC.graphics.text,
        callback    : (val) => {
            Cookie.set(IBC.cookies.text, IBC.graphics.text = val ? 1 : 0);
            IBC.updateFont();
        }
    }));
    content.push(e('div', { key : 'buttons', className : 'buttons' }, e(Button, { display : 'Close', click : () => {
        setShowOptions(false);
    }, addClass : 'medium'})));
    return e(DialogBox, { content : content});
}

export function Slider({id, label, format = null, min, max, step, callback}) {
    f(() => {
        setTimeout(() => {
            $('#' + id + '-display').html(writeLabel());
        }, 200);
    }, []);
    const writeLabel = () => {
        let val = $('#' + id).val();
        if(format) {
            val = format(val);
        }
        return label + ': ' + val;
    }
    return [
        e('h3', { key : id + '-label' + id, id : id + '-display'}, writeLabel()),
        e('div', {key : id + '-slider'}, e('input', { 
            type        : 'range',
            className   : 'slider',
            min         : min,
            max         : max,
            step        : step,
            id          : id,
            onChange    : () => {
                IBC.play('tick');
                const val = $('#' + id).val();
                $('#' + id + '-display').html(writeLabel());
                callback(val);
            }
        }))
    ];
}

export function Checkbox({id, label, source, callback}) {
    // console.log('Load checkbox', id, source);
    const [ checked , setChecked ] = s(source);
    const toggleCheckbox = () => {
        IBC.play('tick');
        const newval = !checked;
        // console.log('Toggle Checkbox', id, newval);
        setChecked(newval);
        callback(newval);
    }
    return e('h3', { key : id, className : 'checkbox' + (checked ? ' checked' : '')}, [
        e('label', { key : 'label', onClick : toggleCheckbox}, label),
        e('span', {key : 'alerts'}, [
            e('span', { key : 'checkmark', className : 'checkMark', onClick : toggleCheckbox},' ')
        ])
    ]);
}

export default Options;