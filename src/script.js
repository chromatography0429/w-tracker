const { ipcRenderer } = window.require('electron');
const fs = window.require('fs');

window.onload = function () {
  // Current session time
  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  let tens = 0;

  const appendTens = document.getElementById('tens');
  const appendSeconds = document.getElementById('seconds');
  const appendMinutes = document.getElementById('minutes');
  const appendHours = document.getElementById('hours');

  // Accumulated worked time (persisted per day)
  let workedSeconds = 0;
  let workedMinutes = 0;
  let workedHours = 0;

  const workedSecondsElem = document.getElementById('worked-seconds');
  const workedMinutesElem = document.getElementById('worked-minutes');
  const workedHoursElem = document.getElementById('worked-hours');

  let interval = null;
  let isPause = true;

  const wrapper = document.getElementsByClassName('wrapper')[0];
  const clockDiv = document.getElementById('clock');
  const closeButton = document.getElementById('button-close');
  const fileName = 'WorkTrackSave.txt';

  fs.readFile(fileName, 'utf8', function (err, data) {
    if (err) throw err;

    if (data) {
      const lines = data.split('\n');
      const lastLine = lines[lines.length - 2];

      if (lastLine) {
        const parts = lastLine.split(':');
        if (getTodayDate() === parts[0]) {
          workedHours = parseInt(parts[1]);
          workedMinutes = parseInt(parts[2]);
          workedSeconds = parseInt(parts[3]);
        }
      }
    }

    reset();
  });

  function getTodayDate() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    return mm + '/' + dd + '/' + yyyy;
  }

  function formatTwoDigits(value) {
    return value <= 9 ? '0' + value : String(value);
  }

  function clickBody() {
    if (isPause) {
      clockDiv.style.color = '#00e7ff';
      clearInterval(interval);
      interval = setInterval(startTimer, 10);
      isPause = false;
    } else {
      clockDiv.style.color = '#e74689';
      clearInterval(interval);
      isPause = true;
    }
  }

  wrapper.onclick = clickBody;
  wrapper.ondblclick = reset;

  closeButton.onclick = function () {
    reset();
    ipcRenderer.send('close', [workedHours, workedMinutes, workedSeconds]);
  };

  function reset() {
    clearInterval(interval);

    // Add current session time to worked time
    workedSeconds += parseInt(seconds);
    workedMinutes += parseInt(minutes);
    workedHours += parseInt(hours);

    // Reset current session
    tens = 0;
    seconds = 0;
    minutes = 0;
    hours = 0;

    appendTens.innerHTML = '0' + tens;
    appendSeconds.innerHTML = ':0' + seconds;
    appendMinutes.innerHTML = '0' + minutes;
    appendHours.innerHTML = '0' + hours;

    // Normalize worked time
    if (workedSeconds >= 60) {
      workedMinutes += 1;
      workedSeconds -= 60;
    }

    if (workedMinutes >= 60) {
      workedHours += 1;
      workedMinutes -= 60;
    }

    // Update worked time display
    workedSecondsElem.innerHTML = formatTwoDigits(workedSeconds);
    workedMinutesElem.innerHTML = formatTwoDigits(workedMinutes);
    workedHoursElem.innerHTML = formatTwoDigits(workedHours);

    clockDiv.style.color = '#e74689';
    isPause = true;
  }

  function startTimer() {
    tens++;

    if (tens <= 9) {
      appendTens.innerHTML = '0' + tens;
    } else {
      appendTens.innerHTML = tens;
    }

    if (tens > 99) {
      seconds++;
      appendSeconds.innerHTML = ':0' + seconds;
      tens = 0;
      appendTens.innerHTML = '00';
    }

    if (seconds > 9) {
      appendSeconds.innerHTML = ':' + seconds;
    }

    if (seconds > 59) {
      minutes++;
      appendMinutes.innerHTML = '0' + minutes;
      seconds = 0;
      appendSeconds.innerHTML = ':00';
    }

    if (minutes > 9) {
      appendMinutes.innerHTML = minutes;
    }

    if (minutes > 59) {
      hours++;
      appendHours.innerHTML = '0' + hours;
      minutes = 0;
      appendMinutes.innerHTML = '00';
    }

    if (hours > 9) {
      appendHours.innerHTML = hours;
    }
  }
}