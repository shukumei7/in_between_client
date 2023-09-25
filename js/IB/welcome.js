import IBC from '../ib.js';
import Maho from '../maho.js';
import { DialogBox , Button } from "./box.js";

const e = React.createElement;
const s = React.useState;
const f = React.useEffect;

const link_color = 'lightblue';
const play_color = 'green';
const pass_color = 'red';

export function Welcome({ close = null}) {
    let content = [];
    content.push(e('h1', {key : 'title'}, [
        'Welcome to ',
        e(Title, { key : 'title'}),
        '!'
    ]));
    content.push(e('div', {key : 'settings', className : 'body'}, [
        e('h3', {key : 'subheading1'}, 'Current Server Settings'),
        e('ul', {key : 'contents1'}, [
            e('li', {key : 1}, 'Default Room Pot: ' + Maho.number(IBC.default_pot)),
            e('li', {key : 2}, 'Maximum Room Pot: ' + Maho.number(IBC.max_pot)),
            e('li', {key : 3}, 'Restricted Bet: ' + Maho.number(IBC.restrict_bet)),
            e('li', {key : 4}, 'Maximum Players: ' + Maho.number(IBC.max_players)),
            e('li', {key : 5}, 'Timeout Warning: ' + Maho.number(IBC.alertDiff) + ' seconds'),
            e('li', {key : 6}, 'Pass Timeout: ' + Maho.number(IBC.timeout) + ' seconds'),
            e('li', {key : 7}, 'Auto-Kick: After ' + Maho.number(IBC.kick) + ' timeouts'), 
        ])
    ]));
    if(true) { //IBC.showHelp) {
        if(close) {
            content.push(e('div', {key : 'buttons1', className : 'buttons'}, e(Button, { display : 'Close', click : close, addClass : 'medium'})));
        }
        content.push(e(Tutorial, { key : 'tutorial'}));
    }
    if(close) {
        content.push(e('div', {key : 'buttons2', className : 'buttons'}, e(Button, { display : 'Close', click : close, addClass : 'medium'})));
    }
    return e(DialogBox, { content : content});
}

function Title({ text = 'In Between'}) {
    return e('span', { key : 'title' , style : { 
        background: 'var(--sand-color)',
        '-webkit-background-clip' : 'text',
        '-webkit-text-fill-color' : 'transparent',
    }}, text);
}

function Tutorial() {
    return e('div', {key : 'how to play', className : 'body tutorial'}, [
        e('h3', {key : 'subheading2'}, 'How to Play'),
        e('h4', {key : 'subheading3'}, 'Summary'),
        e('p', {key : 'gist'}, [
            'The basic gist of the game is that you get 2 cards, called your Hand, and you get to guess if your next card will be ',
            e(Title, { key : 'title'}),
            ' those cards.',
        ]),
        e('figure', { key : 'hand' }, [
            e('img', { key : 'image' , src : '/img/sample-hand.png', alt : 'Sample Hand'}), // height : '140px'}),
            e('figcaption', { key : 'caption'}, 'Your hand')
        ]),
        e('figure', { key : 'lost' }, [
            e('img', { key : 'image' , src : '/img/sample-lose.png', alt : 'Sample Lose'}), //, width : '100%' }), //, height : '140px'}),
            e('figcaption', { key : 'caption'}, 'Losing the round')
        ]),
        e('p', { key : 'value'}, 'The value of the cards is based on their number/letter and their suit/symbol. You can use the logo for reference. The order of their value is highest to lowers from left to right and top to bottom.'),
        e('figure', { key : 'logo' }, [
            e('img', { key : 'image' , src : '/img/ib-logo.png', alt : 'Reference Logo'}), //, width : '100%' }), //, height : '140px'}),
            e('figcaption', { key : 'caption'}, 'The order of value of letters and suits')
        ]),
        e('p', {key : 'playing'}, 'When it is your turn, you will see these action buttons appear:'),
        e('figure', { key : 'actions' }, [
            e('img', { key : 'image' , src : '/img/sample-actions.png', alt : 'Action Buttons'}), //, height : '140px'}),
            e('figcaption', { key : 'caption'}, 'Action Buttons')
        ]),
        e('p', {key : 'playing-summary'}, [
            'Simpy put, ', 
            e('span', {key : 'play', style : { color : play_color }}, 'Play'), 
            ' means you will bet points and get a card. If that card is ',
            e(Title, {key : 'title'}),
            ', you gain the same amount of points, otherwise, you will lose your wager. ',
            e('span', {key : 'pass', style : { color : pass_color }}, 'Pass'),
            ' means you will skip guessing and not bet any points.'
        ]),
        e('figure', { key : 'lost-message' }, [
            e('img', { key : 'image' , src : '/img/sample-lose-message.png', alt : 'Sample Lose Message'}), //, height : '50px'}),
            e('figcaption', { key : 'caption'}, 'Message when you lose')
        ]),
        e('p', { key : 'playing-controls'}, 'The yellow up and down buttons allows you to raise or lower your bet. Or, you can just enter a number. Take note, there are limits to what you can wager.'),
        e('h4', {key : 'subheading4'}, 'Pot and Betting'),
        e('p', { key : 'pot1'}, [
            'Before we can discuss betting, we would like to talk about the Pot. When you join a game, there is a buy-in amount called the Pot. While the amount of the Pot may vary depending on your Room, the default amount can be seen on this Welcome Page at the top under ',
            e('span', { key : 'default' , title : 'Default Pot: ' + Maho.number(IBC.default_pot), style : {
                color : link_color
            }}, "Default Room Pot"),
            ' and that amount cannot be more than the ',
            e('span', { key : 'maximum' , title : 'Maximum Pot: ' + Maho.number(IBC.max_pot), style : {
                color : link_color
            }}, "Maximum Room Pot"),
            '.'
        ]),
        e('figure', { key : 'pot-image' }, [
            e('img', { key : 'image' , src : '/img/sample-pot.png', alt : 'The Pot'}), //, height : '100px'}),
            e('figcaption', { key : 'caption'}, 'The Pot')
        ]),
        e('p', { key : 'pot2' }, 'The Pot is the point pool you will be fighting over. When it reaches zero (0), all players will have to pay the buy-in amount again. Because of this, you can only bet a maximum of the amount of the Pot.'),
        e('p', { key : 'pot3' }, [
            'Another restriction to betting is your points. If your points fall below the ',
            e('span', { key : 'restricted', title : 'Restricted Bet: ' + Maho.number(IBC.restrict_bet), style : {
                color : link_color
            }}, 'Restricted Bet'),
            ' amount, you can only bet up that amount. Of course, you can only bet a minimum of 1 point.'
        ]),
        e('h4', {key : 'subheading5'}, 'The Table and Decks'),
        e('p', { key : 'table' }, 'On the table, other than the Pot, you will see the Deck of cards and two discard piles. The Deck shows the number of cards left on the deck. This will be shuffled when there are not enough cards to play the next round.'),
        e('p', { key : 'discards'}, [
            'The two discard piles are divided into cards that players ',
            e('span', { key : 'play', style : { color : play_color }}, 'Played'),
            ' and those that they ',
            e('span', { key : 'pass', style : { color : pass_color }}, 'Passed'),
            '. The main difference is that the ',
            e('span', { key : 'trash', style : { color : pass_color }}, 'Trash'),
            ' is hidden and the ',
            e('span', { key : 'play2', style : { color : play_color }}, 'Discards'),
            ' can be viewed by clicking on them.'
        ]),
        e('figure', { key : 'decks' }, [
            e('img', { key : 'image' , src : '/img/sample-decks.png', alt : 'The Decks'}), //, width : '100%' }), //, height : '120px'}),
            e('figcaption', { key : 'caption'}, 'The Decks')
        ]),
        e('h4', {key : 'subheading6'}, 'User Account'),
        e('p', { key : 'login'}, 'To play the game, you will need an Account. To make it easy for you, you can also play as a Guest, which will automatically create an Account for you with a random name. As long as you will play on the same device, you can always come back to this Account. If you do choose to Register, you can choose your name and provide your e-mail and password to be able to log in on other devices.'),
        e('figure', { key : 'login-page' }, [
            e('img', { key : 'image' , src : '/img/login.png', alt : 'Log In Page'}), //, width : '100%' }), // height : '120px'}),
            e('figcaption', { key : 'caption'}, 'Log In Page')
        ]),
        e('h4', {key : 'subheading7'}, 'Rooms and Navigation'),
        e('p', { key : 'rooms'}, 'After logging in, you will see a Room list. You should be able to join most Rooms. If you click on a Room, you will be able to preview what is happening in the Room and that if it requires a Passcode. Rooms with Passcodes are Private Rooms and you need to provide that code to enter.'),
        e('p', { key : 'create-room'}, 'You can also create your own room with custom settings and lock it with a Passcode.'),
        e('figure', { key : 'room-list' }, [
            e('img', { key : 'image' , src : '/img/sample-room-list.png', alt : 'Room List', className : 'large'}), //, width : '100%' }), //, height : '500px'}),
            e('figcaption', { key : 'caption'}, 'Room List')
        ]),
        e('figure', { key : 'room-preview' }, [
            e('img', { key : 'image' , src : '/img/sample-preview.png', alt : 'Room Preview', className : 'large'}), //, width : '100%' }), //, height : '300px'}),
            e('figcaption', { key : 'caption'}, 'Room Preview')
        ]),
        e('h4', {key : 'subheading8'}, 'Conclusion'),
        e('p', { key : 'conclusion'}, [
            e(Title, { key : 'congrats', text : 'Congratulations'}),
            ' on getting this far. We hope you spend time trying it and enjoy the game!'
        ])
    ]);
}

export default Welcome;