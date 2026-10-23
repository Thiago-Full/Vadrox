#!/bin/bash
# Script de inicialização do Vadrox (Linux)

echo "🔪 Matando Bettercap e processos Node antigos..."
sudo pkill -f bettercap
pkill -f node

echo "✅ Porta 8081 liberada. Subindo Metro Bundler..."
gnome-terminal -- bash -c "npx react-native start --reset-cache; exec bash"

echo "🔗 Configurando túnel ADB..."
adb reverse tcp:8081 tcp:8081

echo "📱 Instalando app no dispositivo..."
npx react-native run-android
