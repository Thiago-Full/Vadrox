#!/bin/bash
# Vadrox — script único de inicialização

export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

echo "🔪 Limpando portas e ADB..."
fuser -k 8081/tcp 2>/dev/null
adb kill-server > /dev/null 2>&1
adb start-server > /dev/null 2>&1

echo "📱 Checando dispositivo..."
DEVICE=$(adb devices | grep -w "device")
if [ -z "$DEVICE" ]; then
  echo "❌ Celular não detectado. Pluga o cabo e aceita o debug USB."
  exit 1
fi
echo "✅ Celular conectado."

echo "🔗 Configurando ADB reverse..."
adb reverse tcp:8081 tcp:8081

echo "🚀 Abrindo Metro em nova janela..."
gnome-terminal -- bash -c "cd $(pwd) && npx react-native start --reset-cache; exec bash"

sleep 6

echo "📦 Compilando e instalando no celular..."
npx react-native run-android

echo "✨ Pronto. Se a tela ainda mostrar 'Welcome', o App.tsx é o template."