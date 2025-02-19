document.addEventListener('DOMContentLoaded', function() {
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

  // --- New Code: Motivational Quote Feature ---

  // 10 quotes when none of you worked out.
  const quotesNone = [
    "All you guys are fuckin pussies. What, you can't even work out?",
    "No gains, no glory. Get off your lazy asses!",
    "Seriously? You call this a workout? Step it up!",
    "Pathetic performance. You guys need to man up and lift!",
    "This is a disgrace. If you won't work out, you might as well quit!",
    "Zero effort, zero results. Get off the couch and do something!",
    "You all are slacking. Time to show some real commitment!",
    "Weak efforts all around. Prove you're not just talk!",
    "Don't come crying when gains don't come. Work out already!",
    "If you can't work out, at least pretend you care!"
  ];

  // 10 quotes for when only one person worked out.
  // Placeholders: {winner}, {loser1}, {loser2}
  const quotesOne = [
    "{winner} smashed it today, leaving {loser1} and {loser2} in the dust. Get with the program!",
    "Only {winner} showed up? C'mon, {loser1} and {loser2}, you can do better!",
    "{winner} is the only one who cared. {loser1} and {loser2}, step up your game!",
    "Nice work, {winner}! Meanwhile, {loser1} and {loser2} are just making excuses!",
    "{winner} crushed it, while {loser1} and {loser2} seem to have missed the memo!",
    "Great job, {winner}! Now {loser1} and {loser2}, time to get your act together!",
    "{winner} brought the heat, but {loser1} and {loser2} barely felt a spark.",
    "Kudos to {winner} for showing up. {loser1} and {loser2}, where were you?",
    "Hats off to {winner}! {loser1} and {loser2} need a serious reality check.",
    "{winner} set the bar high today, and {loser1} plus {loser2} fell way short."
  ];

  // 10 quotes for when two people worked out.
  // Placeholders: {winner1}, {winner2}, {loser}
  const quotesTwo = [
    "Awesome work, {winner1} and {winner2}! But {loser} seriously dropped the ball today.",
    "Kudos to {winner1} and {winner2} for their effort, while {loser} sat it out.",
    "Great job, {winner1} and {winner2}! {loser}, it's time to step up your game!",
    "Double win for {winner1} and {winner2}, leaving {loser} to catch up.",
    "{winner1} and {winner2} crushed it today, but {loser} was nowhere to be found!",
    "High fives to {winner1} and {winner2}! {loser}, you better hit the gym next time.",
    "Props to {winner1} and {winner2} for getting it done. {loser}, you're lagging behind.",
    "Well done, {winner1} and {winner2}! {loser}, it's on you to step up.",
    "Cheers to {winner1} and {winner2}! {loser} needs to follow their lead.",
    "Excellent effort by {winner1} and {winner2} today, while {loser} missed out."
  ];

  // Update the motivational quote based on users' statuses.
  function updateMotivationalQuote(users) {
    const motivationalQuoteElem = document.getElementById('motivationalQuote');
    const names = Object.keys(users);
    const workedOut = names.filter(name => users[name]);
    let quote = "";

    if (workedOut.length === 0) {
      // No one worked out: pick a random quote from quotesNone.
      quote = quotesNone[Math.floor(Math.random() * quotesNone.length)];
    } else if (workedOut.length === 1) {
      // One person worked out.
      const winner = workedOut[0];
      const losers = names.filter(name => name !== winner);
      quote = quotesOne[Math.floor(Math.random() * quotesOne.length)];
      quote = quote.replace("{winner}", winner)
                   .replace("{loser1}", losers[0])
                   .replace("{loser2}", losers[1]);
    } else if (workedOut.length === 2) {
      // Two people worked out.
      const winners = workedOut;
      const loser = names.find(name => !winners.includes(name));
      quote = quotesTwo[Math.floor(Math.random() * quotesTwo.length)];
      quote = quote.replace("{winner1}", winners[0])
                   .replace("{winner2}", winners[1])
                   .replace("{loser}", loser);
    } else {
      // All three worked out: provide a generic praise message.
      quote = "Amazing! All three of you crushed it today!";
    }
    motivationalQuoteElem.textContent = quote;
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
          updateMotivationalQuote(data.workout.users);
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
