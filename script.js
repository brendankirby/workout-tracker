document.addEventListener('DOMContentLoaded', function() {
  // TODO: Replace the following config object with your Firebase project credentials.
  const firebaseConfig = {
      apiKey: "AIzaSyCahpqqGVJwZi6m8vz5fSf7e2PVeqkb1rU",
      authDomain: "workout-tracker-e89cb.firebaseapp.com",
      databaseURL: "https://workout-tracker-e89cb-default-rtdb.firebaseio.com/",
      projectId: "workout-tracker-e89cb",
      storageBucket: "workout-tracker-e89cb.firebasestorage.app",
      messagingSenderId: "1020861060855",
      appId: "1:1020861060855:web:baa8b4e6d1d164b38765f2"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();

  // Helper: Get current date in Pacific Time (format: YYYY-MM-DD)
  function getCurrentDatePT() {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
  }

  // Update the UI for each user based on their workout status
  function updateUserUI(users) {
    for (let user in users) {
       const statusElem = document.getElementById('status-' + user);
       if (statusElem) {
           statusElem.textContent = users[user] ? '✅' : '❌';
       }
    }
  }

  // Update the streak counter UI. It will be hidden if the streak is 0.
  function updateStreakUI(streak) {
    const streakContainer = document.getElementById('streakContainer');
    const streakDisplay = document.getElementById('streakDisplay');
    if (streak > 0) {
      streakDisplay.textContent = streak + '🔥';
      streakContainer.style.display = 'block';
    } else {
      streakContainer.style.display = 'none';
    }
  }

  // Check if the stored workout date matches today (in PT). If not, process the previous day’s data.
  function checkAndResetIfNewDay(workoutData, currentStreak) {
    const today = getCurrentDatePT();
    if (!workoutData || workoutData.date !== today) {
      let allWorked = false;
      if (workoutData && workoutData.users) {
          // If every user has a true value, they all worked out.
          allWorked = Object.values(workoutData.users).every(status => status === true);
      }
      if (allWorked) {
          // Increment streak if everyone worked out.
          const newStreak = (currentStreak || 0) + 1;
          database.ref().update({ streak: newStreak });
      } else {
          // Reset the streak if not all worked out.
          database.ref().update({ streak: 0 });
      }
      // Reset the workout record for the new day.
      database.ref('workout').set({
          date: today,
          users: {
              Brendan: false,
              Keegan: false,
              Phill: false
          }
      });
    }
  }

  // Listen for changes in the entire database to update the UI in real time.
  database.ref().on('value', snapshot => {
    const data = snapshot.val();
    if (data) {
      // Ensure we are using the correct day.
      checkAndResetIfNewDay(data.workout, data.streak);
      
      // Update the UI for each friend.
      if (data.workout && data.workout.users) {
          updateUserUI(data.workout.users);
      }
      // Update the streak counter.
      updateStreakUI(data.streak || 0);
    }
  });

  // Add click event listeners so that tapping a user row toggles their workout status.
  const userRows = document.querySelectorAll('.user-row');
  userRows.forEach(row => {
    row.addEventListener('click', function() {
       const user = this.getAttribute('data-user');
       const statusRef = database.ref('workout/users/' + user);
       // Toggle the status: read the current value, then set it to the opposite.
       statusRef.once('value').then(snapshot => {
         const currentStatus = snapshot.val();
         statusRef.set(!currentStatus);
       });
    });
  });
});
