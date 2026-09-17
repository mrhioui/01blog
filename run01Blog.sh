#!/bin/bash

# Start PostgreSQL / Docker
docker compose up --build -d

# Clean environment for GNOME Terminal
CLEAN_ENV="env -i HOME=$HOME USER=$USER LOGNAME=$USER \
DISPLAY=$DISPLAY \
WAYLAND_DISPLAY=$WAYLAND_DISPLAY \
XDG_RUNTIME_DIR=$XDG_RUNTIME_DIR \
DBUS_SESSION_BUS_ADDRESS=$DBUS_SESSION_BUS_ADDRESS \
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# Backend terminal
$CLEAN_ENV gnome-terminal -- bash -c "
    cd '$PWD/backend'
    ./mvnw spring-boot:run
    exec bash
"

# Frontend terminal
$CLEAN_ENV gnome-terminal -- bash -c "
    cd '$PWD/frontend'
    npm install
    npx ng serve
    exec bash
"