@echo off
echo Starting Productivity App...

cd productivity\server
start "Productivity Server" cmd /k "npm run dev"

cd ..\client
start "Productivity Client" cmd /k "npm run dev"

echo Server and Client starting in new windows...
