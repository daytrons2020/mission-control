-- Mission Control GUI Launcher
-- Double-click this file to run Mission Control with a nice GUI

set workspaceDir to "/Users/daytrons/.openclaw/workspace"
set dashboardFile to workspaceDir & "/dashboard.html"

-- Check if dashboard exists
tell application "Finder"
    if not (exists (POSIX file dashboardFile as alias)) then
        display alert "Dashboard Not Found" message "Could not find dashboard.html at:" & return & dashboardFile buttons {"OK"} default button "OK" as critical
        return
    end if
end tell

-- Show loading dialog with progress
display dialog "🚀 Mission Control NANO v2.0" & return & return & "Launching dashboard..." buttons {"Cancel", "Open Dashboard"} default button "Open Dashboard" with icon note giving up after 2

if button returned of result is "Cancel" then
    return
end if

-- Open dashboard in the best available browser
set dashboardPath to "file://" & dashboardFile

tell application "System Events"
    -- Check for Chrome first
    if exists (application process "Google Chrome") or exists application "Google Chrome" then
        tell application "Google Chrome"
            activate
            open location dashboardPath
        end tell
        -- Check for Arc
    else if exists (application process "Arc") or exists application "Arc" then
        tell application "Arc"
            activate
            open location dashboardPath
        end tell
        -- Check for Safari
    else if exists (application process "Safari") or exists application "Safari" then
        tell application "Safari"
            activate
            open location dashboardPath
        end tell
        -- Fallback to default browser
    else
        do shell script "open '" & dashboardPath & "'"
    end if
end tell

-- Show success notification
display notification "Mission Control dashboard is now running" with title "🚀 Mission Control" sound name "Glass"
