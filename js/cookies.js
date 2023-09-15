export const Cookie = {
    set     : (cname, cvalue, exdays) => {
        const d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    },
    delete  : (cname) => {
        const d = new Date();
        d.setTime(d.getTime() + (24*60*60*1000));
        let expires = "expires="+ d.toUTCString();
        document.cookie = cname + "=;" + expires + ";path=/";
    },
    get     : (cname) => {
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
        return "";
    }
}

// Set cookie consent
export const CookieConsent = {
    name        : 'user_cookie_consent',
    consented   : false,
    accept      : () => {
        Cookie.delete(CookieConsent.name);
        Cookie.set(CookieConsent.name, 1, 30);
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
        closer.setHTML('X');
        const closeNotice = () => {
            container.remove();
            blocker.remove();
        }
        closer.addEventListener('click', closeNotice);
        let title = document.createElement('h3');
        title.setHTML('Cookie Consent');
        let text = document.createElement('p');
        Object.assign(text.style, {
            overflowWrap    : 'break-word'
        });
        text.setHTML('This website uses cookies or similar technologies, to enhance your browsing experience and provide personalized recommendations. By continuing to use our website, you agree to our  <a style="color:#115cfa;" href="/privacy.html">Privacy Policy</a>');
        let accept = document.createElement('button');
        Object.assign(accept.style, {
            background      : '#115cfa',
            color           : 'white',
            textAlign       : 'center',
            padding         : '10px',
            width           : '100%',
            cursor          : 'pointer'
        });
        accept.setHTML('Accept All Cookies');
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

$(() => {
	CookieConsent.check();
})