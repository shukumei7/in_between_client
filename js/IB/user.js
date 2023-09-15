import { Cookie , CookieConsent } from '../cookies.js';
import IBC from '../ib.js';
import { DisplayBox, FormBox } from './box.js';

const e = React.createElement;
const useState = React.useState;

export default function User({user, updateDetails, activateUI }) {
    
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
    const [ showRegistation, setShowRegistation ] = useState(false);
    const [ showLogin, setShowLogin ] = useState(false);
    const [ showButton, setShowButton ] = React.useState(false);
    const loginUser = (res) => {
        IBC.play('success');
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

    if(showRegistation) {
        return e(RegistrationUI, { loginUser : (res) => {
            loginUser(res);
        }, close : () => {
            setShowRegistation(false);
        }});
    }

    if(showLogin) {
        return e(LoginUI, { loginUser : (res) => {
            loginUser(res);
        }, close : () => {
            setShowLogin(false);
        }});
    }

    return (e('div', { key : 1, className : 'login'}, [
            e('a', { key : 'guest', className : "button", onClick : () => {
                activateUI();
                IBC.post(accounts, loginUser);
            }}, e(DisplayBox, { content : 'Play as Guest', addClass : 'single center'})),
            e('a', { key : 'login', className : "button", onClick : () => {
                setShowLogin(true);
                activateUI();
            }}, e(DisplayBox, { content : 'Log In', addClass : 'single center'})),
            e('a', { key : 'register', className : "button", onClick : () => {
                setShowRegistation(true);
                activateUI();
            }}, e(DisplayBox, { content : 'Register', addClass : 'single center'}))
        ]));
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

function LoginUI({loginUser, close}) {
    const [ message, setMessage ] = useState('Enter your email and password');
    const email_ID = 'email';
    const pass_ID = 'password';
    let buttons = [];
    let inputs = [];
    inputs.push(e('div', { key : 'message', className : 'message' }, message));
    inputs.push(e('input', { 
        key         : 'email',
        id          : email_ID, 
        type        : 'text', 
        placeholder : 'Enter your e-mail address'
    }));
    inputs.push(e('input', { 
        key         : 'password',
        id          : pass_ID, 
        type        : 'password', 
        placeholder : 'Enter your password'
    }));
    buttons.push(e('a', { key : 'close', className : 'button medium', onClick : () => {
        close();
        IBC.play('tick');
    }}, e(DisplayBox, { content : 'Close' , addClass : 'single center'})));
    buttons.push(e('a', { key : 'login', className : 'button medium', onClick : () => {
        const email = $('#' + email_ID).val();
        IBC.play('tick');
        if(!email.length) {
            setMessage('Your  email is required');
            return;
        }
        const pass = $('#' + pass_ID).val();
        if(!pass.length) {
            setMessage('Your password is required');
            return;
        }
        IBC.post('accounts', {
            email       : email,
            password    : pass,
        }, (res) => {
            loginUser(res);
        });
    }}, e(DisplayBox, { content : 'Log In' , addClass : 'single center'})));
    return e(FormBox, { inputs : inputs, buttons : buttons, size : 'quarter login'});
}

function RegistrationUI({loginUser, close}) {
    const name_default = 'Your name must be unique';
    const email_default = 'Your e-mail address will be your login identity';
    const pass_default = 'Set a password of at least 8 characaters; with a capital letter, small letter, number, and special character';
    const [ available , setAvailable ] = useState(false);
    const [ message, setMessage ] = useState(name_default);
    const [ name , setName ] = useState(null);
    const [ email, setEmail ] = useState(null);
    const [ password , setPassword ] = useState(null);
    const [ size , setSize ] = useState('');
    const accounts = 'accounts';
    const user_ID = 'user_name';
    const email_ID = 'email';
    const pass_ID = 'password';
    const cpass_ID = 'cpassword';
    let inputs = [];
    let buttons = [];
    if(!name) {
        inputs.push(e('input', { 
            key         : 'input_name',
            id          : user_ID, 
            type        : 'text', 
            placeholder : 'Enter your name',
            onChange    : () => {
                setAvailable(false)
                const val = $('#' + user_ID).val().trim();
                if(val.length < 3) {
                    setMessage('Your name needs at least 3 characters');
                    return;
                }
                IBC.get(accounts + '/name/' + val, (res) => {
                    setMessage(res.message);
                    setAvailable(res.available);
                });
            }
        }));
        buttons.push(e('a', { key : 'close', className : 'button medium', onClick : () => {
            IBC.play('tick');
            close();
        }}, e(DisplayBox, { key : 'close', content : 'Close' , addClass : 'single center'})));
    } else if(!email) {
        inputs.push(e('input', { 
            key         : 'input_email',
            id          : email_ID, 
            type        : 'text', 
            placeholder : 'Enter your e-mail address',
            onChange    : () => {
                setAvailable(false)
                const val = $('#' + email_ID).val().trim();
                if(!val.match(/^([a-z0-9][a-z0-9\.\-\_]*)\@([a-z][a-z0-9]+)\.[a-z]{2,4}$/i)) {
                    setMessage('You have an invalid e-mail format');
                    return;
                }
                IBC.get(accounts + '/email/' + val, (res) => {
                    setMessage(res.message);
                    setAvailable(res.available);
                });
            }
        }));
        buttons.push(e('a', { key : 'close', className : 'button medium', onClick : () => {
            IBC.play('tick');
            setName(null);
            setMessage(name_default);
            setAvailable(false);
        }}, e(DisplayBox, { key : 'close', content : 'Back' , addClass : 'single center'})));
    } else if(!password) {
        const validatePass = () => {
            setAvailable(false)
            const val = $('#' + pass_ID).val().trim();
            if(val.length < 8) {
                setMessage('Your password must be 8 characters long');
                return;
            }
            if(!val.match(/[a-z]/)) {
                setMessage('Add at least one lower-case letter');
                return;
            }
            if(!val.match(/[A-Z]/)) {
                setMessage('Add at least one upper-case letter');
                return;
            }
            if(!val.match(/[0-9]/)) {
                setMessage('Add at least one number');
                return;
            }
            if(!val.match(/[\!\@\#\$\%\^\&\*\,\.\/\:\-\=\+\_\~]/)) {
                setMessage('Add at least one non-bracket, non-quoting special character');
                return;
            }
            const confirm = $('#' + cpass_ID).val();
            if(val != confirm) {
                setMessage('Your passwords do not match');
                return;
            }
            setMessage('Your password is accepted');
            setAvailable(true);
        }
        inputs.push(e('input', { 
            key         : 'input_pass',
            id          : pass_ID, 
            type        : 'password', 
            placeholder : 'Create a password',
            onChange    : validatePass
        }));
        inputs.push(e('input', { 
            key         : 'input_cpass',
            id          : cpass_ID, 
            type        : 'password', 
            placeholder : 'Confirm your password',
            onChange    : validatePass
        }));
        buttons.push(e('a', { key : 'back', className : 'button medium', onClick : () => {
            IBC.play('tick');
            setEmail(null);
            setMessage(email_default);
            setSize('');
            setAvailable(false);
        }}, e(DisplayBox, { key : 'close', content : 'Back' , addClass : 'single center'})));
        buttons.push(e('a', { key : 'show', className : 'button medium', onClick : () => {
            IBC.play('tick');
            const type = $('#' + pass_ID).attr('type');
            if(type == 'password') {
                $('#' + pass_ID + ',#' + cpass_ID).attr('type', 'text');
                return;
            }
            $('#' + pass_ID + ',#' + cpass_ID).attr('type', 'password');
        }}, e(DisplayBox, { key : 'close', content : 'Show' , addClass : 'single center'})));
    } else {
        inputs.push(e('div', { key : 'name' }, 'Name: ' + name ));
        inputs.push(e('div', { key : 'email' }, 'Email: ' + email ));
        buttons.push(e('a', { key : 'back', className : 'button medium', onClick : () => {
            IBC.play('tick');
            setPassword(null);
            setMessage(pass_default);
            setSize('square');
            setAvailable(false);
        }}, e(DisplayBox, { content : 'Back' , addClass : 'single center'})));
    }
    inputs.push(e('div', { key : 'message', className : 'message'}, message));
    if(available) {
        buttons.push(e('a', { key : 'next', className : 'button medium', onClick : () => {
            IBC.play('tick');
            if(!name) {
                setName($('#' + user_ID).val());
                setMessage(email_default);
                return;
            } else if(!email) {
                setEmail($('#' + email_ID).val());
                setMessage(pass_default);
                setSize('square');
                return;
            } else if(!password) {
                setPassword($('#' + pass_ID).val());
                setMessage('Verify your information');
                setSize('');
            } else {
                IBC.post(accounts, {
                    name        : name,
                    email       : email,
                    password    : password
                }, (res) => {
                    loginUser(res);
                })
            }
        }}, e(DisplayBox, { key : 'next', content : 'Next >' , addClass : 'single center'})));
    }
    return e(FormBox, { inputs : inputs, buttons : buttons, size : 'quarter ' + size});
}