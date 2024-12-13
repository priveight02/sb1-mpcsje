import { format } from 'date-fns';

// Request necessary permissions
const requestAlarmPermissions = async () => {
  // Request notification permission if needed
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }

  // Request wake lock permission if available
  if ('wakeLock' in navigator) {
    try {
      // @ts-ignore - WakeLock API types
      await navigator.wakeLock.request('screen');
    } catch (e) {
      console.warn('Wake lock not available:', e);
    }
  }
};

export const scheduleTaskAlarm = async (taskId: string, title: string, date: string, alarmTime: string) => {
  await requestAlarmPermissions();

  const alarmDate = new Date(`${date}T${alarmTime}`);
  const alarmId = `task-alarm-${taskId}`;

  // Clear any existing alarms first
  clearTaskAlarm(alarmId);

  // Try to use native device alarm APIs first
  if ('scheduling' in navigator && 'havePermission' in navigator.scheduling) {
    try {
      // @ts-ignore - Scheduler API
      const permission = await navigator.scheduling.havePermission();
      if (permission === 'granted') {
        // @ts-ignore - Scheduler API
        await navigator.scheduling.scheduleTask({
          id: alarmId,
          timestamp: alarmDate.getTime(),
          priority: 'high',
          wakeDevice: true,
          showNotification: true,
          title: `⏰ Task Alarm: ${title}`,
          text: `It's ${format(alarmDate, 'h:mm a')}! Time for your task.`
        });
        return;
      }
    } catch (e) {
      console.warn('Native scheduling not available:', e);
    }
  }

  // Fall back to notification-based alarms with wake lock
  const now = new Date();
  if (alarmDate > now) {
    const timeoutId = setTimeout(async () => {
      // Acquire wake lock when alarm triggers
      let wakeLock = null;
      try {
        if ('wakeLock' in navigator) {
          // @ts-ignore - WakeLock API
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (e) {
        console.warn('Wake lock failed:', e);
      }

      // Show notification with maximum priority
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(`⏰ Task Alarm: ${title}`, {
          body: `It's ${format(alarmDate, 'h:mm a')}! Time for your task.`,
          tag: alarmId,
          renotify: true,
          requireInteraction: true,
          silent: false,
          vibrate: [200, 100, 200],
          actions: [
            { action: 'snooze', title: 'Snooze 5min' },
            { action: 'dismiss', title: 'Dismiss' }
          ]
        });

        // Handle notification actions
        notification.addEventListener('click', () => {
          window.focus();
          notification.close();
        });

        notification.addEventListener('action', (e) => {
          if (e.action === 'snooze') {
            // Reschedule for 5 minutes later
            const snoozeDate = new Date();
            snoozeDate.setMinutes(snoozeDate.getMinutes() + 5);
            scheduleTaskAlarm(taskId, title, 
              snoozeDate.toISOString().split('T')[0],
              format(snoozeDate, 'HH:mm')
            );
          }
          notification.close();
        });

        // Play system alarm sound if available
        try {
          if ('sound' in window) {
            // @ts-ignore - System sound API
            await window.sound.playAlarm();
          } else {
            // Fall back to audio context
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            oscillator.connect(audioContext.destination);
            oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 1);
          }
        } catch (e) {
          console.warn('System sound not available:', e);
        }
      }

      // Release wake lock after alarm completes
      if (wakeLock) {
        try {
          await wakeLock.release();
        } catch (e) {
          console.warn('Wake lock release failed:', e);
        }
      }
    }, alarmDate.getTime() - now.getTime());

    // Store timeout ID for cleanup
    window.localStorage.setItem(alarmId, timeoutId.toString());
  }
};

export const clearTaskAlarm = (alarmId: string) => {
  // Clear native scheduling if available
  if ('scheduling' in navigator && 'cancelTask' in navigator.scheduling) {
    try {
      // @ts-ignore - Scheduler API
      navigator.scheduling.cancelTask(alarmId);
    } catch (e) {
      console.warn('Native scheduling cancellation failed:', e);
    }
  }

  // Clear notification-based alarm
  const timeoutId = window.localStorage.getItem(alarmId);
  if (timeoutId) {
    clearTimeout(Number(timeoutId));
    window.localStorage.removeItem(alarmId);
  }
};

export const initializeTaskAlarms = async () => {
  // Request permissions on initialization
  await requestAlarmPermissions();

  // Re-register alarms from storage
  const tasks = JSON.parse(localStorage.getItem('task-storage') || '{"tasks":[]}').tasks;
  for (const task of tasks) {
    if (task.reminders?.alarmEnabled && task.reminders?.alarmTime) {
      await scheduleTaskAlarm(task.id, task.title, task.dueDate, task.reminders.alarmTime);
    }
  }
};