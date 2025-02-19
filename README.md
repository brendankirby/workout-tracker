# Workout Tracker

Workout Tracker is a mobile-friendly web application built with HTML, CSS, and JavaScript that uses Firebase Realtime Database to sync data. 

It allows you and your friends to track your daily workouts, display motivational quotes, and maintain a workout streak counter. The app provides real-time updates and automatic daily resets.

## Features

- **User Status Tracking:**  
  - Toggle daily workout status for each friend.  
  - Display a checkmark (✅) if a user worked out or an X (❌) if not.  
  - When a user works out, a 💪 emoji is appended to their name.

- **Motivational Quotes:**  
  - Displays one of 10 custom quotes based on how many of you worked out.  
  - Different sets of quotes are shown when no one, one person, or two people have worked out.

- **Daily Reset & Streak Counter:**  
  - Automatically resets workout statuses at midnight Pacific Time.  
  - Increments a streak counter if all users work out, or resets it if not.  
  - The streak counter is hidden when its value is 0.

- **Realtime Sync:**  
  - Uses Firebase to sync changes instantly across all devices.