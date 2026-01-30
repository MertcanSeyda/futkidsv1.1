# FUTKIDS Deployment Guide (VPS)

## 1. VPS Hazırlığı
VPS'ine SSH ile bağlan ve Docker'ı kur:
```bash
sudo apt update
sudo apt install docker.io docker-compose -y
```

## 2. Projeyi Çekme
Projeyi sunucuya yükle (Git veya SCP ile):
```bash
git clone <senin-repo-url>
cd futkidsv2.1
```

## 3. Environment Ayarları
Backend klasöründeki `.env` dosyasını sunucuya göre düzenle (Ozellikle MONGO_URI ve API URL'leri).

## 4. Uygulamayı Başlatma
Ana dizinde (docker-compose.yml'in olduğu yer):
```bash
docker-compose up -d --build
```

## 5. Domain & SSL (Önemli)
Sunucuda bir Nginx kurup domainlerini şu portlara yönlendirmelisin:
- `api.futkids.com` -> `http://localhost:4000`
- `app.futkids.com` -> `http://localhost:3000`
- `panel.futkids.com` -> `http://localhost:3001`

Certbot ile de hızlıca SSL alabilirsin:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx
```

---
**Not:** Next.js tarafında `NEXT_PUBLIC_API_URL` değişkenlerini build sırasında Dockerfile içine veya docker-compose'a vermeyi unutma!
