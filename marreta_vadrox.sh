#!/bin/bash
echo "🔥 Acordando o Frankenstein Roxo..."

# 1. Cura do Alzheimer do terminal (Força o Java 17 nesta sessão)
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

# 2. Mata processos fantasmas na porta 8081 (Metro bundler)
echo "💀 Matando zumbis do Node na porta 8081..."
fuser -k 8081/tcp 2>/dev/null

# 3. Dá um choque no ADB e checa o cabo USB
echo "📱 Checando a ponte de dados física..."
adb kill-server > /dev/null 2>&1
adb start-server > /dev/null 2>&1

# Pega qualquer aparelho que esteja respondendo como 'device'
DEVICE=$(adb devices | grep -w "device")

if [ -z "$DEVICE" ]; then
    echo "❌ ERRO: Cadê teu celular, Maldito? Pluga o cabo direito, permite o MTP e tenta de novo!"
    exit 1
else
    echo "✅ Hardware detectado na porta USB. Preparando injeção..."
fi

# 4. Limpa o lixo antigo do Android
echo "🧹 Limpando as entranhas do Gradle..."
cd android && ./gradlew clean && cd ..

# 5. Roda a parada toda de uma vez
echo "🚀 Compilando e empurrando pro celular (O servidor do Metro vai subir automático)..."
npx react-native run-android