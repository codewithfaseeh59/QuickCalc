const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
const themeToggle = document.getElementById('theme-toggle');

let expression = '';
let lastResult = '';
const LS_KEY = 'quickcalc-history';
const THEME_KEY = 'quickcalc-theme';

function loadState() {
    const saved = JSON.parse(localStorage.getItem(LS_KEY));
    if (saved && saved.expr !== undefined) {
        expression = saved.expr;
        lastResult = saved.result || '';
        updateDisplay();
    }
    const theme = localStorage.getItem(THEME_KEY);
    if (theme) document.documentElement.setAttribute('data-theme', theme);
    themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
}
function saveState() {
    localStorage.setItem(LS_KEY, JSON.stringify({ expr: expression, result: lastResult }));
}

function updateDisplay(anim = true) {
    display.textContent = expression || '0';
    if (anim) {
        display.classList.remove('pop');
        void display.offsetWidth;
        display.classList.add('pop');
    }
}

buttons.forEach(btn => {
    btn.addEventListener('click', () => {
        const val = btn.dataset.value;
        const action = btn.dataset.action;
        if (action === 'clear') {
            expression = '';
        } else if (action === 'backspace') {
            expression = expression.slice(0, -1);
        } else if (action === 'equals') {
            try {
                let evalExpr = expression.replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-');
                evalExpr = evalExpr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
                let result = eval(evalExpr);
                if (result === undefined || isNaN(result)) throw Error();
                lastResult = result;
                expression = result.toString();
            } catch {
                expression = 'Error';
                setTimeout(() => { expression = ''; updateDisplay(); saveState(); }, 900);
            }
        } else if (val) {
            if (expression === 'Error') expression = '';
            if (val === '.' && /\.\d*$/.test(expression.split(/[\+\-\*\/]/).pop())) return;
            if (val === '0' && /^0$/.test(expression.split(/[\+\-\*\/]/).pop())) return;
            expression += val;
        }
        updateDisplay();
        saveState();
    });
});

document.addEventListener('keydown', e => {
    if (e.key.match(/[0-9\+\-\*\/\.\%]/)) {
        if (expression === 'Error') expression = '';
        expression += e.key;
        updateDisplay();
        saveState();
    } else if (e.key === 'Enter' || e.key === '=') {
        document.querySelector('.btn.equals').click();
    } else if (e.key === 'Backspace') {
        document.querySelector('.btn[data-action="backspace"]').click();
    } else if (e.key.toLowerCase() === 'c') {
        document.querySelector('.btn[data-action="clear"]').click();
    }
});

display.addEventListener('animationend', () => {
    display.classList.remove('pop');
});

themeToggle.addEventListener('click', () => {
    const curr = document.documentElement.getAttribute('data-theme');
    const next = curr === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    themeToggle.textContent = next === 'light' ? '🌙' : '☀️';
    localStorage.setItem(THEME_KEY, next);
});

display.addEventListener('click', () => display.focus());

loadState();
updateDisplay(false);
