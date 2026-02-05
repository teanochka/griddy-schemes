# Griddy Schemes

## Предварительные требования

- **Node.js**: v18 или выше
- **Python**: v3.9 или выше

---

### Установка бэкенда

1. **Перейдите в соответствующую директорию**
   ```bash
   cd backend
   ```

2. **Активируйте виртуальное окружение**
   ```bash
   python -m venv .venv
   
   # Windows
   .venv\Scripts\activate
   
   # macOS/Linux
   source .venv/bin/activate
   ```

3. **Установка зависимостей**
   ```bash
   pip install -r requirements.txt
   ```

4. **Создайте и заполните `.env`**
   ```env
   SECRET_KEY=super-secret-key-change-me

   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=300

   DATABASE_URL=sqlite:///./griddy.db

   CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   ```

5. **Запустить сервер**
   ```bash
   uvicorn main:app --reload
   ```

---

### Установка фронтенда

1. **Зависимости**  
   В корне проекта:
   ```bash
   npm install
   ```

2. **Запустите dev сервер**
   ```bash
   npm run dev
   ```