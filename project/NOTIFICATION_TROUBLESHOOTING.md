# 🐛 Notification System Troubleshooting Guide

## Quick Checks

### 1. **Browser Console Logs**
Open Developer Tools (F12) → Console tab and look for these logs when messages arrive:
- `🔄 Raw message received:`
- `📨 Message from [username]: X → Y unread messages`
- `🔔 showNotification called:`
- `✅ Notification created successfully`

### 2. **Notification Permission**
Check if browser notifications are enabled:
```javascript
// Run in console:
console.log('Notification permission:', Notification.permission);
// Should be 'granted' for notifications to work
```

### 3. **Visual Elements to Check**
- **Red badges** on user avatars in the user list
- **Total badge** in the header next to your username
- **Status text** showing "• X new messages" under usernames
- **Debug panel** in top-right corner (development only)
- **Notification tester** in bottom-left corner (development only)

## Testing Steps

### Step 1: Use the Notification Tester
1. Look for the **🧪 Notification Tester** panel in the bottom-left
2. Click "Enable Notifications" if needed
3. Click "[Username] sends message" buttons
4. You should see:
   - Red badges appear on avatars
   - Counts increment
   - Browser notifications (if enabled)

### Step 2: Test with Real Users
1. Open app in two browser windows/tabs
2. Use different usernames
3. Send messages from one to see notifications in the other

### Step 3: Check Debug Panel
1. Look for **Debug Info** panel in top-right
2. Check "Unread: X" count
3. Expand "Unread Counts" to see per-user counts

## Common Issues & Solutions

### Issue: No visual badges appearing
**Solution:** Check if CSS classes are being applied correctly
```javascript
// Run in console to force a test:
window.dispatchEvent(new CustomEvent('test-notification'));
```

### Issue: No browser notifications
**Solutions:**
1. Enable notification permission: Click "Enable Notifications" in tester
2. Check browser settings: Allow notifications for this site
3. Try in different browser (Chrome, Firefox, Edge)

### Issue: Badges not clearing when clicking users
**Solution:** Check console for clear logs:
- `🧹 Cleared X unread messages for user [id]`

### Issue: Messages not triggering notifications
**Check:**
1. Are messages coming from different users?
2. Is the current user ID different from message sender ID?
3. Check console logs for message processing

## Manual Testing Commands

Open browser console and run these to test:

```javascript
// Test notification permission
if ('Notification' in window) {
  Notification.requestPermission().then(perm => {
    console.log('Permission:', perm);
    if (perm === 'granted') {
      new Notification('Test', { body: 'Notifications working!' });
    }
  });
}

// Test if badges are visible
document.querySelectorAll('[class*="bg-red-500"]').forEach(el => {
  el.style.backgroundColor = 'lime';
  el.style.fontSize = '14px';
  console.log('Found badge:', el);
});
```

## Expected Behavior

When everything works correctly:

1. **User sends message** → Badge appears with count "1"
2. **Same user sends another** → Badge updates to "2"
3. **Browser notification** shows "Direct message from Alice (2 unread)"
4. **Click on user** → Badge disappears, direct chat opens
5. **Header shows total** of all unread messages across users

## Debug Output Example

Successful message processing looks like:
```
🔄 Raw message received: {id: "msg123", userId: "user456", username: "Alice", content: "Hello"}
✅ Parsed message: {id: "msg123", userId: "user456", username: "Alice", content: "Hello", timestamp: Date}
👤 Current user: {id: "user789", username: "Bob"}
🎯 Message is from different user, processing...
📊 Previous unread counts: {}
📨 Message from Alice: 0 → 1 unread messages
📊 New unread counts: {user456: 1}
🔔 showNotification called: {message: {...}, isDirectMessage: false, messageCount: 1}
🚀 Creating notification: {title: "New message from Alice", body: "Hello"}
✅ Notification created successfully
```

## Need Help?

If none of the above helps:
1. Check console for any red error messages
2. Try refreshing the page
3. Test in incognito/private browsing mode
4. Clear browser cache and cookies
