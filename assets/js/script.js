document.addEventListener('DOMContentLoaded', () => {
  const batteryLevel = document.getElementById('battery-level');
  const batteryPercentage = document.getElementById('battery-percentage');
  const batteryStatus = document.getElementById('battery-status');
  const alertBox = document.getElementById('alert');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');

  const lowSound = document.getElementById('low-sound');
  const fullSound = document.getElementById('full-soundgit ');

  let audioEnabled = false;
  let lastAlert = null;

  // === Activation audio au premier clic ou touche ===
  function enableAudio() {
    if (audioEnabled) return;
    const silent = new Audio("data:audio/wav;base64,UklGRnoAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAAC");
    silent.play().then(() => {
      audioEnabled = true;
      statusDot.classList.add('active');
      statusText.textContent = 'Surveillance active';
      silent.remove();
    }).catch(() => {
      statusText.textContent = 'Audio non activé';
    });
  }
  ["click", "keydown"].forEach(evt => {
    document.addEventListener(evt, enableAudio, { once: true });
  });

  // === Notifications natives ===
  function notify(message) {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Surveillance Batterie", { body: message });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification("Surveillance Batterie", { body: message });
          }
        });
      }
    }
  }

  // === Surveillance batterie ===
  function monitorBattery() {
    if (!navigator.getBattery) {
      batteryStatus.textContent = "API Battery non supportée";
      statusText.textContent = "Navigateur non compatible";
      alertBox.textContent = "Essayez Chrome, Edge ou Opera.";
      alertBox.classList.add('active');
      return;
    }

    navigator.getBattery().then(battery => {
      updateInfo(battery);
      battery.addEventListener('chargingchange', () => updateInfo(battery));
      battery.addEventListener('levelchange', () => updateInfo(battery));
    }).catch(() => {
      batteryStatus.textContent = "Impossible d'accéder à la batterie";
      statusText.textContent = "Erreur de surveillance";
    });
  }

  function updateInfo(battery) {
    const level = battery.level * 100;
    const charging = battery.charging;

    batteryLevel.style.width = level + "%";
    batteryPercentage.textContent = level.toFixed(0) + "%";

    if (level <= 30) {
      batteryLevel.style.background = "linear-gradient(to right, #e74c3c, #c0392b)";
      batteryPercentage.style.color = "#e74c3c";
    } else if (level >= 66) {
      batteryLevel.style.background = "linear-gradient(to right, #27ae60, #2ecc71)";
      batteryPercentage.style.color = "#27ae60";
    } else {
      batteryLevel.style.background = "linear-gradient(to right, #4cd964, #ffcc00)";
      batteryPercentage.style.color = "#2c3e50";
    }

    batteryStatus.textContent = charging ? "Batterie en charge" : "Batterie en décharge";
    checkAlerts(level, charging);
  }

  function checkAlerts(level, charging) {
    if (level <= 30 && !charging) {
      showAlert("⚠️ Batterie faible: " + level.toFixed(0) + "%", lowSound);
      notify("⚠️ Batterie faible: " + level.toFixed(0) + "%");
    } else if (level >= 65 && charging) {
      showAlert("✅ Batterie presque pleine: " + level.toFixed(0) + "%", fullSound);
      notify("✅ Batterie presque pleine: " + level.toFixed(0) + "%");
    } else {
      hideAlert();
    }
  }

  function showAlert(msg, sound) {
    alertBox.textContent = msg;
    alertBox.classList.add('active');

    if (audioEnabled && lastAlert !== msg) {
      sound.currentTime = 0;
      sound.play().catch(err => console.warn("Son non joué:", err));
      lastAlert = msg;
    }
  }

  function hideAlert() {
    alertBox.classList.remove('active');
    lastAlert = null;
  }

  monitorBattery();
});
