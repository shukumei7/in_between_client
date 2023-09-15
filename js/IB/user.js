import { Cookie , CookieConsent } from '../cookies.js';
import IBC from '../ib.js';
import DisplayBox from './box.js';

const e = React.createElement;

export default function User({user, updateDetails}) {

    if(user.id) {
        return e(UserUI, { user : user, logout : () => {
            IBC.headers = null;
            updateDetails({
                id      : 0,
                name    : ''
            }, 'You have logged out', 0);
        }});
    }

    const accounts = 'accounts';
    const [ showButton, setShowButton ] = React.useState(false);
    const loginUser = (res) => {
        IBC.headers = {
            Accept          : 'application/json',
            Authorization   : 'Bearer ' + res.access
        };
        updateDetails({
            id      : res.user_id,
            name    : res.user_name
        }, res.message, res.points);
        if(CookieConsent.consented) {
            Cookie.set(IBC.cookie_id, res.user_id);
            Cookie.set(IBC.cookie_token, res.token);
        }
    }

    const checkCookieLogin = () => {
        const user_id = Cookie.get(IBC.cookie_id);
        const token = Cookie.get(IBC.cookie_token);
        // console.log('Cookie Login', user_id, token);
        if(typeof user_id == 'undefined' || typeof token == 'undefined' || !user_id || !token) {
            // console.log('No Cookies detected');
            setShowButton(true);
            return;
        }
        // console.log('Attempt cookie login');
        IBC.post(accounts, {
            id      : user_id,
            token   : token
        }, loginUser, () => {
            setShowButton(true);
        });
    }

    if(!showButton) {
        checkCookieLogin();
        return '';
    }

    return (
        e('a', { className : "button login", onClick : () => {
            IBC.post(accounts, loginUser);
            IBC.play('lounge', 'bgm');
        }}, e(DisplayBox, { content : 'Guest Log In', addClass : 'single center'}))
    );
}

function UserUI({user, logout}) {
    return e('a', { key : 'name', className : 'info info_user_name', onClick : () => {
        if(!confirm('Are you sure you want to log out?')) {
            return;
        }
        Cookie.set(IBC.cookie_id, 0);
        Cookie.set(IBC.cookie_token, '');
        logout();
    } }, e(DisplayBox, { content : user.name, addClass : 'single center' }));
}