'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
    owner: 'Jonas Schmedtmann',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,
  
    movementsDates: [
      '2019-11-18T21:31:17.178Z',
      '2019-12-23T07:42:02.383Z',
      '2020-01-28T09:15:04.904Z',
      '2020-04-01T10:17:24.185Z',
      '2020-05-08T14:11:59.604Z',
      '2020-05-27T17:01:17.194Z',
      '2020-07-11T23:36:17.929Z',
      '2020-07-12T10:51:36.790Z',
    ],
    currency: 'EUR',
    locale: 'pt-PT', // de-DE
  };
  
  const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,
  
    movementsDates: [
      '2019-11-01T13:15:33.035Z',
      '2019-11-30T09:48:16.867Z',
      '2019-12-25T06:04:23.907Z',
      '2020-01-25T14:18:46.235Z',
      '2020-02-05T16:33:06.386Z',
      '2020-04-10T14:43:26.374Z',
      '2020-06-25T18:49:59.371Z',
      '2020-07-26T12:01:20.894Z',
    ],
    currency: 'USD',
    locale: 'en-US',
  };
  
  const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

const createUsernames = () => {
    accounts.forEach(account => {
        account.username = account.owner
        .toLowerCase()
        .split(' ')
        .map(name => name[0])
        .join('');
    })
}

createUsernames();

let currentUser;


btnLogin.addEventListener('click', function(event){
    event.preventDefault();
    currentUser = accounts.find(acc => (acc.username === inputLoginUsername.value) && (acc.pin === Number(inputLoginPin.value)));

    inputLoginUsername.value = inputLoginPin.value = '';

    if (currentUser) renderAccount();
})

const renderAccount = () => {

    containerApp.style.opacity = 1;

    labelWelcome.textContent = 'Welcome, ' + currentUser.owner.split(' ')[0];

    inputLoginUsername.textContent = '';
    inputLoginPin.textContent = '';

    const date = new Date().toISOString().split('T')[0].split('-');

    labelDate.textContent = [ date[2], Number(date[1]) < 10 ? '0' + date[1] : date[1] , date[0] ].join('/');

    let time = 10;
    labelTimer.textContent = Math.trunc(time / 60) + ':' + (time % 60 > 9 ? time % 60 : '0' + time % 60);

    const timer = setInterval(() => {
        
        time -= 1;
        labelTimer.textContent = Math.trunc(time / 60) + ':' + (time % 60 > 9 ? time % 60 : '0' + time % 60);
        
        if (time === 0){
            currentUser = null;
            containerApp.style.opacity = 0;
            labelWelcome.textContent = 'Log in to get started';

            clearInterval(timer);
        }
    }, 1000);

    renderMovements(currentUser.movements);
    renderBalance();
}

const renderMovements = (movements) => {

    while (containerMovements.hasChildNodes()){
        containerMovements.firstChild.remove();
    }

    movements.forEach((mov, i) => {
        const divMov = document.createElement("div");
        divMov.classList.add("movements__row");

        const movType = document.createElement("div");
        movType.classList.add('movements__type');
        movType.classList.add(`movements__type--${mov > 0 ? 'deposit' : 'withdrawal' }`);
        movType.textContent = mov > 0 ? 'deposit' : 'withdrawal';

        const movValue = document.createElement("div");
        movValue.classList.add('movements__value');
        movValue.textContent = mov + '$';

        const movDate = document.createElement("div");
        movDate.classList.add('movements__date');

        movDate.textContent = new Intl.DateTimeFormat('es-AR').format(new Date(currentUser.movementsDates[i]));

        divMov.appendChild(movType);
        divMov.appendChild(movDate);
        divMov.appendChild(movValue);
        containerMovements.appendChild(divMov);
    })
}

const renderBalance = () => {

    labelBalance.textContent = currentUser.movements.reduce((a,b) => a + b).toFixed(2);
    labelSumIn.textContent = currentUser.movements.filter(mov => mov > 0).reduce((a,b) => a + b).toFixed(2);
    labelSumOut.textContent = currentUser.movements.filter(mov => mov < 0).reduce((a,b) => a + b).toFixed(2);
    labelSumInterest.textContent = (currentUser.movements.filter(mov => mov > 0).reduce((a,b) => a + b) * currentUser.interestRate).toFixed(2);
}

btnSort.addEventListener('click', function(){
    renderMovements(currentUser.movements.sort((a,b) => b - a));
})

btnLoan.addEventListener('click', function(event){
    event.preventDefault();
    
    const loan = Number(inputLoanAmount.value);

    inputLoanAmount.value = '';

    if (loan <= 0) return;

    if (! currentUser.movements.some(mov => mov >= loan * 0.1)) return;

    currentUser.movements.push(loan);

    renderMovements(currentUser.movements);
    renderBalance();
});

btnTransfer.addEventListener('click', function(event){
    event.preventDefault();
    
    const transferTo = accounts.find(acc => acc.username === inputTransferTo.value);
    const transferValue = Number(inputTransferAmount.value);

    inputTransferTo.value = inputTransferAmount.value = '';

    if ((currentUser.movements.reduce((a, b) => a + b) < transferValue) || (transferValue <= 0)) return;
    if (!transferTo || transferTo.username === currentUser.username) return;

    currentUser.movements.push(transferValue * -1);
    transferTo.movements.push(transferValue);

    renderMovements(currentUser.movements);
    renderBalance();

})

btnClose.addEventListener('click', function(event){
    event.preventDefault();

    const userInput = inputCloseUsername.value;
    const pinInput = Number(inputClosePin.value);

    if (userInput === currentUser.username && pinInput === currentUser.pin) {
        
        accounts.splice(accounts.findIndex(acc => acc.username === currentUser.username), 1);
        currentUser = null;

        containerApp.style.opacity = 0;
    }

    inputCloseUsername.value = inputClosePin.value = '';

})