class PomodoroTimer {
    constructor() {
        this.modes = {
            pomodoro: { name: 'Pomodoro', duration: 25 * 60 },
            shortBreak: { name: 'Short Break', duration: 5 * 60 },
            longBreak: { name: 'Long Break', duration: 15 * 60 }
        };
        
        this.currentMode = 'pomodoro';
        this.timeLeft = this.modes[this.currentMode].duration;
        this.isRunning = false;
        this.timerId = null;
        this.tasks = [];
        this.activeTaskId = null;

        this.initElements();
        this.loadFromStorage();
        this.initEventListeners();
        this.updateDisplay();
        this.renderTasks();
    }

    initElements() {
        this.minutesDisplay = document.getElementById('minutes');
        this.secondsDisplay = document.getElementById('seconds');
        this.startPauseBtn = document.getElementById('start-pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.modeButtons = document.querySelectorAll('.mode-btn');
        this.timerProgress = document.getElementById('timer-progress');
        this.taskInput = document.getElementById('task-input');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.taskList = document.getElementById('task-list');
        this.soundToggle = document.getElementById('sound-toggle');
        this.themeToggle = document.getElementById('theme-toggle');
    }

    initEventListeners() {
        this.startPauseBtn.addEventListener('click', () => this.toggleStartPause());
        this.resetBtn.addEventListener('click', () => this.resetTimer());

        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                if (mode && this.modes[mode]) {
                    this.switchMode(mode);
                }
            });
        });

        if (this.addTaskBtn && this.taskInput) {
            this.addTaskBtn.addEventListener('click', () => this.addTask());
            this.taskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.addTask();
            });
        }

        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => {
                document.documentElement.classList.toggle('dark');
            });
        }
    }

    loadFromStorage() {
        const savedTasks = localStorage.getItem('yara_tasks');
        if (savedTasks) {
            try {
                this.tasks = JSON.parse(savedTasks);
            } catch (e) {
                this.tasks = [];
            }
        }
    }

    saveToStorage() {
        localStorage.setItem('yara_tasks', JSON.stringify(this.tasks));
    }

    toggleStartPause() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.startPauseBtn.textContent = 'Pause';
        this.startPauseBtn.className = 'px-8 py-3 rounded-xl font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-lg transition-all';
        
        const totalDuration = this.modes[this.currentMode].duration;

        this.timerId = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.updateDisplay();
            } else {
                this.completeTimer();
            }
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        clearInterval(this.timerId);
        this.startPauseBtn.textContent = 'Start';
        this.startPauseBtn.className = 'px-8 py-3 rounded-xl font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all';
    }

    resetTimer() {
        this.pauseTimer();
        this.timeLeft = this.modes[this.currentMode].duration;
        this.updateDisplay();
    }

    switchMode(mode) {
        this.pauseTimer();
        this.currentMode = mode;
        this.timeLeft = this.modes[mode].duration;

        this.modeButtons.forEach(btn => {
            if (btn.dataset.mode === mode) {
                btn.className = 'mode-btn px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-cyan-400 shadow';
            } else {
                btn.className = 'mode-btn px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors';
            }
        });

        this.updateDisplay();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;

        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');

        if (this.minutesDisplay) this.minutesDisplay.textContent = formattedMinutes;
        if (this.secondsDisplay) this.secondsDisplay.textContent = formattedSeconds;

        document.title = `${formattedMinutes}:${formattedSeconds} - Yara Focus`;

        const totalDuration = this.modes[this.currentMode].duration;
        const progress = ((totalDuration - this.timeLeft) / totalDuration) * 100;
        if (this.timerProgress) {
            this.timerProgress.style.width = `${progress}%`;
        }
    }

    completeTimer() {
        this.pauseTimer();
        this.playAlarmSound();

        if (this.currentMode === 'pomodoro' && this.activeTaskId) {
            const task = this.tasks.find(t => t.id === this.activeTaskId);
            if (task) {
                task.completedPomodoros = (task.completedPomodoros || 0) + 1;
                this.saveToStorage();
                this.renderTasks();
            }
        }

        alert(`${this.modes[this.currentMode].name} session completed!`);
        this.resetTimer();
    }

    playAlarmSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();

            const playTone = (freq, time, duration) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.2, ctx.currentTime + time);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + duration);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + time);
                osc.stop(ctx.currentTime + time + duration);
            };

            playTone(587.33, 0, 0.2); // D5
            playTone(880, 0.2, 0.3);    // A5
        } catch (e) {
            console.error('Audio playback failed', e);
        }
    }

    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) return;

        const newTask = {
            id: Date.now().toString(),
            text,
            completed: false,
            completedPomodoros: 0
        };

        this.tasks.push(newTask);
        this.taskInput.value = '';
        this.saveToStorage();
        this.renderTasks();
    } 

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveToStorage();
            this.renderTasks();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        if (this.activeTaskId === id) this.activeTaskId = null;
        this.saveToStorage();
        this.renderTasks();
    }

    setActiveTask(id) {
        this.activeTaskId = this.activeTaskId === id ? null : id;
        this.renderTasks();
    }

    renderTasks() {
        if (!this.taskList) return;
        if (this.tasks.length === 0) {
            this.taskList.innerHTML = '<p class="text-slate-500 text-center py-4">No tasks added yet. Stay focused!</p>';
            return;
        }

        this.taskList.innerHTML = this.tasks.map(task => `
            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border ${this.activeTaskId === task.id ? 'border-cyan-500 shadow-sm shadow-cyan-500/20' : 'border-slate-800'} transition-all">
                <div class="flex items-center space-x-3 cursor-pointer flex-1" onclick="timer.setActiveTask('${task.id}')">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onclick="event.stopPropagation(); timer.toggleTask('${task.id}')" class="w-4 h-4 rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900">
                    <span class="text-sm ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}">${task.text}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-xs px-2 py-1 rounded bg-slate-800 text-cyan-400 font-mono">🍅 ${task.completedPomodoros || 0}</span>
                    <button onclick="timer.deleteTask('${task.id}')" class="text-slate-500 hover:text-red-400 p-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

let timer;
document.addEventListener('DOMContentLoaded', () => {
    timer = new PomodoroTimer();
});
