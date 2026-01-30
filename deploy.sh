#!/bin/bash

# --- AYARLAR ---
VPS_USER="root"
VPS_IP="SENIN_VPS_IP_ADRESIN"
DEPLOY_DIR="/var/www/futkids"
BASE_URL="http://SENIN_VPS_IP_ADRESIN" # Veya domainin

echo "🚀 FUTKIDS Canlıya Alınıyor..."

# 1. Uzak dizini oluştur
ssh $VPS_USER@$VPS_IP "mkdir -p $DEPLOY_DIR"

# 2. Dosyaları kopyala (node_modules ve git klasörlerini hariç tut)
echo "📦 Dosyalar gönderiliyor..."
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' ./ $VPS_USER@$VPS_IP:$DEPLOY_DIR

# 3. Docker Compose'u çalıştır
echo "🏗️  Docker konteynerları kuruluyor..."
ssh $VPS_USER@$VPS_IP "cd $DEPLOY_DIR && BASE_URL=$BASE_URL docker-compose up -d --build"

echo "✅ Dağıtım Başarılı!"
echo "📍 Web App: $BASE_URL:3000"
echo "📍 Web Panel: $BASE_URL:3001"
echo "📍 API: $BASE_URL:4000"
