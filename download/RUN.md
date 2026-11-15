# E-METHANE-100 Investor Hub — запуск на реальной машине

## Что нужно

- **Node.js ≥ 20.9** (рекомендуется 22 LTS) — https://nodejs.org
- **Bun** (рекомендуется, как в проекте) — `curl -fsSL https://bun.sh/install | bash`
  - либо просто npm/pnpm — работает и без Bun
- Доступ в интернет **на этапе сборки**: шрифты (Nunito, Noto Sans SC, JetBrains Mono)
  скачиваются Google Fonts при `next build`. После сборки интернет не нужен.
- Браузер с WebGL для 3D-сцен (Chrome/Edge/Safari/Firefox — все поддерживают).
- База данных **не требуется** — портал полностью статичен.

## 1. Установка зависимостей

```bash
# вариант с Bun (рекомендуется)
bun install

# или с npm
npm install
```

## 2. Сборка production-версии

```bash
bun run build
# или: npm run build
```

Скрипт сборки выполняет `next build` (конфиг `output: "standalone"`) и копирует
`static` и `public` в `.next/standalone/` — готово к запуску одной папкой.

## 3. Запуск

```bash
bun run start
# внутри: NODE_ENV=production bun .next/standalone/server.js

# без Bun — обычным Node:
node .next/standalone/server.js
```

Сервер поднимется на **http://localhost:3000**.

Порт и адрес меняются переменными окружения:

```bash
PORT=8080 HOSTNAME=0.0.0.0 node .next/standalone/server.js
```

(`HOSTNAME=0.0.0.0` — чтобы сайт был виден из локальной сети / снаружи.)

## 3а. Запуск по своему IP в локальной сети

Сервер должен слушать все интерфейсы (`HOSTNAME=0.0.0.0`) — тогда портал
доступен с любого устройства той же сети по вашему внутреннему IP.

```bash
# 1. Запуск на всех интерфейсах
PORT=3000 HOSTNAME=0.0.0.0 node .next/standalone/server.js

# 2. Узнать свой локальный IP
hostname -I                    # Linux (первый адрес — ваш)
ipconfig getifaddr en0         # macOS
ipconfig                       # Windows (строка IPv4)

# 3. Открыть с любого устройства в той же Wi-Fi/проводной сети
#    http://192.168.X.X:3000        ← подставьте свой IP
```

Открыть порт в файрволе (если сайт не открывается):

```bash
sudo ufw allow 3000/tcp                    # Ubuntu (ufw)
sudo firewall-cmd --add-port=3000/tcp --permanent && sudo firewall-cmd --reload   # RHEL/CentOS
```

Windows: при первом запуске разрешите Node.js в диалоге брандмауэра
(галочки «Частные сети»).

Частые причины «не открывается»:
- устройство и сервер в разных сетях (гостевой Wi-Fi с изоляцией клиентов);
- файрвол не пускает порт 3000 (см. выше);
- порт занят — запустите с другим `PORT=8080`.

Безопасность: внутри локальной сети HTTP — норм (данные не выходят наружу).
**Не пробрасывайте порт 3000 напрямую в интернет** — сначала поставьте
прокси с HTTPS (раздел 5, Caddy).

## 4. Автозапуск как сервис (Linux, systemd)

```ini
# /etc/systemd/system/e-methane.service
[Unit]
Description=E-METHANE-100 Investor Hub
After=network.target

[Service]
WorkingDirectory=/opt/e-methane
ExecStart=/usr/bin/node /opt/e-methane/.next/standalone/server.js
Environment=PORT=3000
Environment=HOSTNAME=0.0.0.0
Environment=NODE_ENV=production
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now e-methane
```

Альтернатива — `pm2 start .next/standalone/server.js --name e-methane`.

## 5. HTTPS для публичного доступа

Поставьте обратный прокси перед сервером (Caddy получает сертификаты автоматически):

```
# Caddyfile
your-domain.com {
    reverse_proxy localhost:3000
}
```

```bash
sudo caddy start          # или caddy run в systemd
```

## Примечания

- **Windows**: команды сборки используют `cp -r` — запускайте в WSL или Git Bash.
- **Зависает сборка шрифтов?** Нужен интернет; при недоступности Google Fonts
  сборка может падать — откройте доступ к fonts.googleapis.com.
- Папку `node_modules` переносить не нужно — ставится заново из package.json.
- Минимальный сервер: ~1 vCPU / 512 МБ RAM (это статический контент + API-заглушка).

## Структура (важное)

```
src/app/            — страница, layout, API
src/components/     — портал, 3D-сцены, UI
src/lib/dict/       — словари EN / RU / 中文
public/             — статика
```
