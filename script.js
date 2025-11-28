let currentUser = null;
let currentTest = null;

let testState = {
    schulte: { round: 1, currentNumber: 1, timer: null, startTime: null },
    traffic: { timer: null, startTime: null },
    gonogo: {
        timer: null,
        startTime: null,
        total: 0,
        correct: 0,
        currentBackground: 'blue'
    }
};

let testResults = {
    schulte: { round1: 0, round2: 0, completed: false },
    traffic: { correct: 0, total: 0, accuracy: 0, completed: false },
    gonogo: { correct: 0, total: 0, accuracy: 0, completed: false }
};

let completedTests = {
    schulte: false,
    traffic: false,
    gonogo: false
};

const colors = {
    'красный': '#e74c3c',
    'синий': '#3498db',
    'зеленый': '#2ecc71',
    'желтый': '#f1c40f',
    'оранжевый': '#e67e22',
    'фиолетовый': '#9b59b6',
    'розовый': '#e84393',
    'коричневый': '#795548'
};

const backgrounds = {
    'blue': '#3498db',
    'red': '#e74c3c',
    'green': '#2ecc71',
    'yellow': '#f1c40f',
    'orange': '#e67e22',
    'purple': '#9b59b6'
};

// Загрузка страницы
document.addEventListener('DOMContentLoaded', function() {
    initEventListeners();
    loadProgress();
    showScreen('home');
    updateTestButtons();
});

// Обработчики событий
function initEventListeners() {
    document.getElementById('register-form').addEventListener('submit', handleRegister);
    document.getElementById('start-test').addEventListener('click', () => showScreen('tests'));
    document.getElementById('start-schulte').addEventListener('click', startSchulteRound);
    document.getElementById('start-game').addEventListener('click', startCurrentTest);

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('schulte-cell')) handleSchulteClick(e);
        if (e.target.classList.contains('color-option')) handleTrafficClick(e);
    });
}

// Загрузка прогресса
function loadProgress() {
    const savedProgress = localStorage.getItem('testProgress');
    if (savedProgress) {
        completedTests = JSON.parse(savedProgress);
    }

    const savedResults = localStorage.getItem('testResults');
    if (savedResults) {
        testResults = JSON.parse(savedResults);
    }
}

// Сохранение прогресса
function saveProgress() {
    localStorage.setItem('testProgress', JSON.stringify(completedTests));
    localStorage.setItem('testResults', JSON.stringify(testResults));
}

// Регистрация
function handleRegister(e) {
    e.preventDefault();
    const fio = document.getElementById('user-fio').value.trim();

    if (fio.length < 2) {
        alert('Введите ФИО');
        return;
    }

    const parts = fio.split(' ');
    const displayName = parts[0] + ' ' + (parts[1] ? parts[1][0] + '.' : '') + (parts[2] ? parts[2][0] + '.' : '');

    currentUser = displayName;
    document.getElementById('user-name').textContent = displayName;
    document.getElementById('user-name').style.display = 'block';
    document.getElementById('auth-btn').style.display = 'none';
    document.getElementById('register-modal').classList.remove('active');
}

function showRegisterModal() {
    document.getElementById('register-modal').classList.add('active');
}

// Навигация
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenName + '-screen').classList.add('active');
}

// Обновление кнопок тестов
function updateTestButtons() {
    const tests = ['schulte', 'traffic', 'gonogo'];

    tests.forEach(test => {
        const card = document.getElementById('test-' + test);
        const status = document.getElementById(test + '-status');

        if (completedTests[test]) {
            card.classList.add('completed');
            card.classList.remove('active');
            status.textContent = 'Пройдено';
        } else {
            card.classList.remove('completed');
            card.classList.add('active');
            status.textContent = 'Не начат';
        }
    });

    // Обновление кнопки просмотра результатов
    const allCompleted = tests.every(test => completedTests[test]);
    document.getElementById('view-results-btn').disabled = !allCompleted;
}

function startTest(testName) {
    if (!currentUser) {
        showRegisterModal();
        return;
    }

    if (completedTests[testName]) {
        alert('Этот тест уже пройден!');
        return;
    }

    currentTest = testName;
    showInstruction(testName);
}

function showInstruction(testName) {
    const instructions = {
        schulte: {
            title: 'Таблица Шульте',
            text: `
                <h3>🎯 Смысл теста</h3>
                <p>Развитие внимания и скорости обработки информации</p>

                <h3>📋 Правила</h3>
                <p>• Нажимайте цифры от 1 до 25 по порядку</p>
                <p>• Первый раунд - обычный</p>
                <p>• Второй раунд - с отвлекающим видео</p>
                <p>• Старайтесь работать максимально быстро</p>

                <h3>⚡ Советы</h3>
                <p>• Используйте периферическое зрение</p>
                <p>• Во втором раунде игнорируйте видео</p>
            `
        },
        traffic: {
            title: 'Светофор',
            text: `
                <h3>🎯 Смысл теста</h3>
                <p>Тренировка ингибиторного контроля - способности игнорировать автоматические реакции</p>

                <h3>📋 Правила</h3>
                <p>• Определяйте ЦВЕТ круга (не текст!)</p>
                <p>• Выбирайте правильный цвет из предложенных</p>
                <p>• Всего 40 заданий</p>
                <p>• Отвечайте быстро и точно</p>

                <h3>⚡ Важно!</h3>
                <p>• Игнорируйте текст в центре круга</p>
                <p>• Сосредоточьтесь только на цвете</p>
            `
        },
        gonogo: {
            title: 'Go/No-Go',
            text: `
                <h3>🎯 Смысл теста</h3>
                <p>Развитие когнитивного контроля и торможения импульсивных реакций</p>

                <h3>📋 Правила</h3>
                <p>• Следите за фоном!</p>
                <p>• <span style="color: #3498db;">СИНИЙ фон</span> → нажимайте стрелку в ТУ ЖЕ сторону</p>
                <p>• <span style="color: #e74c3c;">ЛЮБОЙ другой фон</span> → нажимайте в ПРОТИВОПОЛОЖНУЮ сторону</p>
                <p>• Всего 40 заданий</p>
                <p>• Отвечайте быстро и точно</p>

                <h3>⚡ Особенности</h3>
                <p>• Тест требует постоянного переключения внимания</p>
                <p>• Развивает гибкость мышления</p>
            `
        }
    };

    document.getElementById('instruction-title').textContent = instructions[testName].title;
    document.getElementById('instruction-text').innerHTML = instructions[testName].text;
    showScreen('instruction');
}

function startCurrentTest() {
    switch(currentTest) {
        case 'schulte': initSchulteGame(); break;
        case 'traffic': initTrafficGame(); break;
        case 'gonogo': initGoNogoGame(); break;
    }
}

// Таблица Шульте
function initSchulteGame() {
    testState.schulte.round = 1;
    testState.schulte.currentNumber = 1;
    updateSchulteUI();
    generateSchulteGrid();
    showScreen('schulte');
}

function updateSchulteUI() {
    document.getElementById('schulte-round').textContent = testState.schulte.round;
    document.getElementById('current-target').textContent = testState.schulte.currentNumber;
    document.getElementById('schulte-timer').textContent = '00:00';

    const videoSidebar = document.getElementById('video-sidebar');
    if (testState.schulte.round === 2) {
        videoSidebar.classList.add('active');
    } else {
        videoSidebar.classList.remove('active');
    }
}

function generateSchulteGrid() {
    const grid = document.getElementById('schulte-grid');
    grid.innerHTML = '';

    const numbers = Array.from({length: 25}, (_, i) => i + 1);
    shuffleArray(numbers);

    numbers.forEach(number => {
        const cell = document.createElement('div');
        cell.className = 'schulte-cell';
        cell.textContent = number;
        cell.dataset.number = number;
        grid.appendChild(cell);
    });
}

function startSchulteRound() {
    const startBtn = document.getElementById('start-schulte');
    startBtn.disabled = true;
    startBtn.textContent = 'В процессе...';

    testState.schulte.currentNumber = 1;
    document.getElementById('current-target').textContent = testState.schulte.currentNumber;

    document.querySelectorAll('.schulte-cell').forEach(cell => {
        cell.style.visibility = 'visible';
    });

    testState.schulte.startTime = Date.now();
    testState.schulte.timer = setInterval(updateSchulteTimer, 100);
}

function updateSchulteTimer() {
    const elapsed = Date.now() - testState.schulte.startTime;
    const seconds = Math.floor(elapsed / 1000);
    const milliseconds = Math.floor((elapsed % 1000) / 10);
    document.getElementById('schulte-timer').textContent =
        `${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
}

function handleSchulteClick(e) {
    if (!testState.schulte.timer) return;

    const clickedNumber = parseInt(e.target.dataset.number);

    if (clickedNumber === testState.schulte.currentNumber) {
        e.target.style.visibility = 'hidden';
        testState.schulte.currentNumber++;
        document.getElementById('current-target').textContent = testState.schulte.currentNumber;

        if (testState.schulte.currentNumber > 25) {
            finishSchulteRound();
        }
    }
}

function finishSchulteRound() {
    clearInterval(testState.schulte.timer);

    const roundTime = (Date.now() - testState.schulte.startTime) / 1000;

    if (testState.schulte.round === 1) {
        testResults.schulte.round1 = roundTime;
        testState.schulte.round++;
        setTimeout(() => {
            updateSchulteUI();
            generateSchulteGrid();
            document.getElementById('start-schulte').disabled = false;
            document.getElementById('start-schulte').textContent = 'Начать раунд 2';
        }, 1000);
    } else {
        testResults.schulte.round2 = roundTime;
        testResults.schulte.completed = true;
        completedTests.schulte = true;
        saveProgress();
        updateTestButtons();
        calculateResults();
        setTimeout(() => showScreen('results'), 1000);
    }
}

// Светофор
function initTrafficGame() {
    testResults.traffic = { correct: 0, total: 0, accuracy: 0, completed: false };
    updateTrafficProgress();
    startTrafficRound();
    showScreen('traffic');
}

function startTrafficRound() {
    const colorKeys = Object.keys(colors);
    const currentColorName = colorKeys[Math.floor(Math.random() * colorKeys.length)];
    const currentColorValue = colors[currentColorName];

    let textColorName;
    do {
        textColorName = colorKeys[Math.floor(Math.random() * colorKeys.length)];
    } while (textColorName === currentColorName);

    const colorDisplay = document.getElementById('color-display');
    const colorText = document.getElementById('color-text');

    colorText.textContent = textColorName;
    colorDisplay.style.backgroundColor = currentColorValue;

    const isLightColor = currentColorName === 'желтый';
    colorText.style.color = isLightColor ? '#2c3e50' : 'white';

    window.currentTrafficColor = currentColorName;
    createColorOptions(currentColorName);

    testState.traffic.startTime = Date.now();
    testState.traffic.timer = setInterval(updateTrafficTimer, 100);
}

function createColorOptions(currentColorName) {
    const colorOptions = document.getElementById('color-options');
    colorOptions.innerHTML = '';

    const colorKeys = Object.keys(colors);
    const selectedColors = new Set([currentColorName]);

    while (selectedColors.size < 6) {
        selectedColors.add(colorKeys[Math.floor(Math.random() * colorKeys.length)]);
    }

    const selectedColorsArray = Array.from(selectedColors);
    shuffleArray(selectedColorsArray);

    selectedColorsArray.forEach(colorName => {
        const colorOption = document.createElement('div');
        colorOption.className = 'color-option';
        colorOption.style.backgroundColor = colors[colorName];
        colorOption.dataset.color = colorName;
        colorOptions.appendChild(colorOption);
    });
}

function updateTrafficTimer() {
    const elapsed = Date.now() - testState.traffic.startTime;
    const seconds = Math.floor(elapsed / 1000);
    const milliseconds = Math.floor((elapsed % 1000) / 10);
    document.getElementById('traffic-timer').textContent =
        `${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
}

function updateTrafficProgress() {
    document.getElementById('traffic-progress').textContent = testResults.traffic.total;

    const accuracy = testResults.traffic.total > 0 ?
        (testResults.traffic.correct / testResults.traffic.total) * 100 : 0;
    document.getElementById('traffic-accuracy').textContent = accuracy.toFixed(1) + '%';
}

function handleTrafficClick(e) {
    clearInterval(testState.traffic.timer);

    const selectedColor = e.target.dataset.color;
    testResults.traffic.total++;

    if (selectedColor === window.currentTrafficColor) {
        testResults.traffic.correct++;
    }

    updateTrafficProgress();

    if (testResults.traffic.total >= 40) {
        testResults.traffic.accuracy = (testResults.traffic.correct / 40) * 100;
        testResults.traffic.completed = true;
        completedTests.traffic = true;
        saveProgress();
        updateTestButtons();
        calculateResults();
        setTimeout(() => showScreen('results'), 1000);
    } else {
        setTimeout(startTrafficRound, 500);
    }
}

// Go/No-Go (обновленная версия с большим количеством синих фонов)
function initGoNogoGame() {
    testResults.gonogo = { correct: 0, total: 0, accuracy: 0, completed: false };
    testState.gonogo = {
        timer: null,
        startTime: null,
        total: 0,
        correct: 0,
        currentBackground: 'blue'
    };
    updateGoNogoProgress();
    startGoNogoRound();
    showScreen('gonogo');
}

function startGoNogoRound() {
    if (testState.gonogo.total >= 40) {
        finishGoNogoGame();
        return;
    }

    // Увеличиваем вероятность синего фона (60% синий, 40% другие)
    const backgroundKeys = Object.keys(backgrounds);
    let randomBackground;

    // 60% вероятность синего фона
    if (Math.random() < 0.6) {
        randomBackground = 'blue';
    } else {
        // Случайный цвет из остальных (исключая синий)
        const otherBackgrounds = backgroundKeys.filter(color => color !== 'blue');
        randomBackground = otherBackgrounds[Math.floor(Math.random() * otherBackgrounds.length)];
    }

    testState.gonogo.currentBackground = randomBackground;

    // Обновляем фон
    const arrowDisplay = document.getElementById('arrow-display');
    arrowDisplay.style.backgroundColor = backgrounds[randomBackground];

    // Добавляем градиент для синего фона
    if (randomBackground === 'blue') {
        arrowDisplay.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
    } else {
        arrowDisplay.style.background = backgrounds[randomBackground];
    }

    // Случайное направление стрелки
    const directions = ['left', 'right'];
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    window.currentArrowDirection = randomDirection;

    const arrowSymbol = document.getElementById('arrow-symbol');
    arrowSymbol.textContent = randomDirection === 'left' ? '⬅️' : '➡️';

    // Анимация появления стрелки
    arrowSymbol.style.transform = 'scale(0.8)';
    setTimeout(() => {
        arrowSymbol.style.transform = 'scale(1)';
        arrowSymbol.style.transition = 'transform 0.3s ease';
    }, 50);

    testState.gonogo.startTime = Date.now();
    testState.gonogo.timer = setInterval(updateGoNogoTimer, 100);
}

function updateGoNogoTimer() {
    const elapsed = Date.now() - testState.gonogo.startTime;
    const seconds = Math.floor(elapsed / 1000);
    const milliseconds = Math.floor((elapsed % 1000) / 10);
    document.getElementById('gonogo-timer').textContent =
        `${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
}

function updateGoNogoProgress() {
    document.getElementById('gonogo-progress').textContent = testState.gonogo.total;

    const accuracy = testState.gonogo.total > 0 ?
        (testState.gonogo.correct / testState.gonogo.total) * 100 : 0;
    document.getElementById('gonogo-accuracy').textContent = accuracy.toFixed(1) + '%';
}

function handleArrow(clickedDirection) {
    if (!testState.gonogo.timer) return;

    clearInterval(testState.gonogo.timer);
    testState.gonogo.total++;

    const isBlueBackground = testState.gonogo.currentBackground === 'blue';
    let isCorrect = false;

    if (isBlueBackground) {
        // Синий фон: нажимать в ту же сторону
        isCorrect = clickedDirection === window.currentArrowDirection;
    } else {
        // Другой фон: нажимать в противоположную сторону
        isCorrect = clickedDirection !== window.currentArrowDirection;
    }

    // Анимация кнопки при нажатии
    const arrowBtn = clickedDirection === 'left' ?
        document.querySelector('.left-arrow') :
        document.querySelector('.right-arrow');

    arrowBtn.style.transform = 'translateY(-4px) scale(0.95)';
    setTimeout(() => {
        arrowBtn.style.transform = 'translateY(-8px) scale(1.08)';
    }, 100);

    if (isCorrect) {
        testState.gonogo.correct++;
        // Визуальная обратная связь при правильном ответе
        const arrowSymbol = document.getElementById('arrow-symbol');
        arrowSymbol.style.color = '#2ecc71';
        setTimeout(() => {
            arrowSymbol.style.color = '';
        }, 300);
    } else {
        // Визуальная обратная связь при неправильном ответе
        const arrowSymbol = document.getElementById('arrow-symbol');
        arrowSymbol.style.color = '#e74c3c';
        setTimeout(() => {
            arrowSymbol.style.color = '';
        }, 300);
    }

    updateGoNogoProgress();

    // Небольшая задержка перед следующим заданием
    setTimeout(() => {
        if (testState.gonogo.total < 40) {
            startGoNogoRound();
        } else {
            finishGoNogoGame();
        }
    }, 800);
}

function finishGoNogoGame() {
    testResults.gonogo.correct = testState.gonogo.correct;
    testResults.gonogo.total = testState.gonogo.total;
    testResults.gonogo.accuracy = (testState.gonogo.correct / 40) * 100;
    testResults.gonogo.completed = true;
    completedTests.gonogo = true;
    saveProgress();
    updateTestButtons();
    calculateResults();
    setTimeout(() => showScreen('results'), 1000);
}

// Вспомогательные функции
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function backToTests() {
    showScreen('tests');
}

function checkAllTestsCompleted() {
    const allCompleted = Object.values(completedTests).every(val => val);
    if (allCompleted) {
        calculateResults();
        showScreen('results');
    } else {
        alert('Пройдите все тесты для просмотра результатов!');
    }
}

function restartAllTests() {
    if (confirm('Вы уверены, что хотите пройти все тесты заново? Текущие результаты будут сброшены.')) {
        completedTests = {
            schulte: false,
            traffic: false,
            gonogo: false
        };

        testResults = {
            schulte: { round1: 0, round2: 0, completed: false },
            traffic: { correct: 0, total: 0, accuracy: 0, completed: false },
            gonogo: { correct: 0, total: 0, accuracy: 0, completed: false }
        };

        saveProgress();
        updateTestButtons();
        showScreen('tests');
    }
}

// Расчет результатов
function calculateResults() {
    // Общий балл (0-100)
    let overallScore = 0;
    let components = 0;

    // Таблица Шульте
    if (testResults.schulte.completed) {
        const schulteScore = Math.max(0, 100 - (testResults.schulte.round1 + testResults.schulte.round2) * 2);
        overallScore += schulteScore;
        components++;

        document.getElementById('result-schulte1').textContent = testResults.schulte.round1.toFixed(1) + ' сек';
        document.getElementById('result-schulte2').textContent = testResults.schulte.round2.toFixed(1) + ' сек';

        const diff = testResults.schulte.round2 - testResults.schulte.round1;
        document.getElementById('result-schulte-diff').textContent =
            (diff > 0 ? '+' : '') + diff.toFixed(1) + ' сек';
    }

    // Светофор
    if (testResults.traffic.completed) {
        const trafficScore = testResults.traffic.accuracy;
        overallScore += trafficScore;
        components++;

        document.getElementById('result-traffic-correct').textContent =
            testResults.traffic.correct + '/40';
        document.getElementById('result-traffic').textContent =
            testResults.traffic.accuracy.toFixed(1) + '%';
    }

    // Go/No-Go
    if (testResults.gonogo.completed) {
        const gonogoScore = testResults.gonogo.accuracy;
        overallScore += gonogoScore;
        components++;

        document.getElementById('result-gonogo-correct').textContent =
            testResults.gonogo.correct + '/40';
        document.getElementById('result-gonogo').textContent =
            testResults.gonogo.accuracy.toFixed(1) + '%';
    }

    if (components > 0) {
        overallScore = Math.round(overallScore / components);
    }

    document.getElementById('overall-score').textContent = overallScore;

    // Навыки
    updateSkillBars();
    generateRecommendations();
}

function updateSkillBars() {
    const skills = {
        attention: testResults.schulte.completed ?
            Math.max(0, 100 - (testResults.schulte.round1 + testResults.schulte.round2)) : 0,
        inhibition: testResults.traffic.completed ? testResults.traffic.accuracy : 0,
        reaction: testResults.gonogo.completed ? testResults.gonogo.accuracy : 0
    };

    document.getElementById('attention-percent').textContent = Math.round(skills.attention) + '%';
    document.getElementById('inhibition-percent').textContent = Math.round(skills.inhibition) + '%';
    document.getElementById('reaction-percent').textContent = Math.round(skills.reaction) + '%';

    document.getElementById('attention-bar').style.width = Math.round(skills.attention) + '%';
    document.getElementById('inhibition-bar').style.width = Math.round(skills.inhibition) + '%';
    document.getElementById('reaction-bar').style.width = Math.round(skills.reaction) + '%';
}

function generateRecommendations() {
    const recommendations = [];

    if (testResults.schulte.completed && testResults.schulte.round2 > testResults.schulte.round1 * 1.3) {
        recommendations.push("• Уделите внимание тренировке концентрации при отвлекающих факторах");
    }

    if (testResults.traffic.completed && testResults.traffic.accuracy < 80) {
        recommendations.push("• Практикуйте игнорирование автоматических реакций в повседневных ситуациях");
    }

    if (testResults.gonogo.completed && testResults.gonogo.accuracy < 75) {
        recommendations.push("• Развивайте когнитивную гибкость через задачи на переключение внимания");
    }

    if (recommendations.length === 0) {
        recommendations.push("• Продолжайте регулярные тренировки для поддержания когнитивных функций");
        recommendations.push("• Попробуйте увеличить сложность заданий для дальнейшего развития");
    }

    document.getElementById('recommendations-text').innerHTML =
        recommendations.map(rec => `<p>${rec}</p>`).join('');
}