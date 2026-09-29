# SmartMobile

Мобильный клиент Smart City для жителей области Абай. Проект работает на React Native и Expo.

## Запуск

```bash
npm install
npm start
```

Для проверки типов:

```bash
npm run typecheck
```

## Авторизация

До готовности `RollSatrs/SmartBackend#2` приложение по умолчанию использует mock-адаптер, соответствующий черновому API-контракту:

- `POST /auth/register` — `{ name, email, password, role }`;
- `POST /auth/login` — `{ email, password }`;
- ответ — `{ user, accessToken }`.

В mock-режиме адрес, начинающийся с `gov`, открывает кабинет госоргана; любой другой адрес открывает кабинет жителя. Пароль должен содержать минимум шесть символов.

Для подключения реального API задайте переменные окружения:

```env
EXPO_PUBLIC_USE_MOCK_AUTH=false
EXPO_PUBLIC_API_URL=http://192.168.1.10:3000
```

На iOS и Android токен и данные пользователя сохраняются через `expo-secure-store`; в web-preview используется `localStorage`. Защищённые экраны не входят в дерево навигации, пока сессия не восстановлена.

## UI

Для issue #1 выбрана библиотека **React Native Paper**: она совместима с Expo, предоставляет доступные Material-компоненты и не требует собственной нативной сборки для базовых элементов форм.
