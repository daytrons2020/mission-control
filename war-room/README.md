# War Room - Mission Control Interface

A modern, glassmorphism-styled command center for coordinating AI agents and monitoring systems.

## Features

### Core Components
- **Message Input Box** - Clean, auto-resizing textarea with send button and keyboard shortcuts
- **Chat Display** - Message bubbles for agent, system, and user messages with distinct styling
- **Chat History Panel** - Sidebar showing conversation history with quick actions
- **Real-time Updates Indicator** - Live pulse animation showing active connection status

### Design System
- **Glassmorphism UI** - Frosted glass panels with backdrop blur effects
- **Dark Theme** - Deep purple/blue gradient background with subtle glow effects
- **Responsive Layout** - Adapts to different screen sizes (hides panels on smaller screens)
- **Smooth Animations** - Fade-ins, pulsing indicators, and hover transitions

### Interactive Elements
- Send messages with Enter (Shift+Enter for new lines)
- Typing indicator animation
- Message action buttons (Acknowledge, Details)
- Quick action buttons in sidebar
- Agent status indicators (Online/Idle/Offline)

## File Structure

```
war-room/
├── index.html      # Main HTML structure
├── styles.css      # Glassmorphism styling and animations
├── app.js          # Interactive functionality
└── README.md       # Documentation
```

## Usage

### Opening the War Room
Open `index.html` in any modern web browser:
```bash
open war-room/index.html
```

### Sending Messages
1. Type in the message input box at the bottom
2. Press **Enter** to send
3. Press **Shift + Enter** for a new line

### JavaScript API
The War Room exposes a global `WarRoom` object for integration:

```javascript
// Add a system message
WarRoom.addSystemMessage("System initialized");

// Add an agent message
WarRoom.addAgentMessage("Nano", "Task completed successfully");

// Update connection status
WarRoom.updateConnectionStatus("connected", "Online");

// Add activity to feed
WarRoom.addActivity("New agent connected");

// Update agent status
WarRoom.updateAgentStatus("Nano", "online"); // online, idle, offline
```

## Integration with Agent System

To connect with your actual agent backend:

1. Replace the simulated response in `sendMessage()` with your API call
2. Use WebSocket for real-time agent messages
3. Hook into the `WarRoom` API to display agent outputs

Example WebSocket integration:
```javascript
const ws = new WebSocket('ws://your-agent-server');

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    WarRoom.addAgentMessage(data.agent, data.message);
};
```

## Styling Customization

### Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --accent-primary: #6366f1;    /* Primary brand color */
    --accent-success: #10b981;    /* Online/ success states */
    --accent-warning: #f59e0b;    /* Warning/ idle states */
    --glass-bg: rgba(20, 20, 35, 0.6);  /* Panel background */
}
```

### Glass Effect Intensity
Adjust backdrop blur:
```css
.glass-panel {
    backdrop-filter: blur(20px);  /* Increase for stronger effect */
}
```

## Browser Support

- Chrome/Edge 88+
- Firefox 103+
- Safari 14+
- All modern browsers with CSS backdrop-filter support

## Credits

Built for Mission Control - Part of the Proactive Agent Stack 🦞