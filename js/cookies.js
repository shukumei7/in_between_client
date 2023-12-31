export const Cookie = {
    set     : (cname, cvalue, exdays, force) => {
        if(!CookieConsent.consented && !force) {
            return; // don't write if not consented
        }
        if(typeof exdays == 'undefined') {
            exdays = 30;
        }
        const d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        // console.log('Cookie saved', cname, Cookie.get(cname));
    },
    delete  : (cname) => {
        const d = new Date();
        d.setTime(d.getTime() + (24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=;" + expires + ";path=/";
    },
    get     : (cname, def) => {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i <ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        // console.log('Cookie Not Found', cname, def);
        return def ? def : ''; // return default if cookie is not set
    }
}

// Set cookie consent
export const CookieConsent = {
    name        : 'user_cookie_consent',
    consented   : false,
    accept      : () => {
        Cookie.delete(CookieConsent.name);
        Cookie.set(CookieConsent.name, true, 30, true);
    },
    check       : () => {
        if(CookieConsent.consented = Cookie.get("user_cookie_consent")) {
            return;
        }
        let blocker = document.createElement('div');
        Object.assign(blocker.style, {
            position        : 'fixed',
            top             : 0,
            left            : 0,
            right           : 0,
            bottom          : 0,
            pointerEvents   : 'none',
            background      : 'black',
            opacity         : 0.2,
            zIndex          : 9000
        });
        let container = document.createElement('div');
        Object.assign(container.style, {
            position        : 'absolute',
            top             : '50%',
            left            : '50%',
            transform       : 'translate(-50%, -50%)',
            background      : 'white',
            color           : 'black',
            zIndex          : 9001,
            padding         : '10px'
        });
        let closer = document.createElement('div');
        Object.assign(closer.style, {
            float           : 'right',
            color           : 'black',
            fontWeight      : 'bold',
            padding         : '10px',
            cursor          : 'pointer',
            marginTop       : '-10px'
        });
        closer.innerHTML = 'X';
        const closeNotice = () => {
            container.remove();
            blocker.remove();
        }
        closer.addEventListener('click', closeNotice);
        let title = document.createElement('h3');
        title.innerHTML = 'Cookie Consent';
        let text = document.createElement('p');
        Object.assign(text.style, {
            overflowWrap    : 'break-word'
        });
        text.innerHTML = 'This website uses cookies or similar technologies, to enhance your browsing experience and provide personalized recommendations. By continuing to use our website, you agree to our  <a style="color:#115cfa;" href="/privacy.html">Privacy Policy</a>';
        let accept = document.createElement('button');
        Object.assign(accept.style, {
            background      : '#115cfa',
            color           : 'white',
            textAlign       : 'center',
            padding         : '10px',
            width           : '100%',
            cursor          : 'pointer'
        });
        accept.innerHTML = 'Accept All Cookies';
        accept.addEventListener('click', () => {
            CookieConsent.accept();
            closeNotice();
        });
        container.appendChild(closer);
        container.appendChild(title);
        container.appendChild(text);
        container.appendChild(accept);
        let body = document.querySelector('body');
        body.appendChild(blocker);
        body.appendChild(container);
    }
}

export default Cookie;
globalThis.Cookie = Cookie;

$(() => {
	CookieConsent.check();
})