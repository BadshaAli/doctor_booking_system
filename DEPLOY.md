Render deployment notes

- Create two services on Render: a Python Web Service (backend) and a Static Site (frontend).
- Backend settings:
  - Build command: `pip install -r backend/requirements.txt && python backend/manage.py collectstatic --noinput`
  - Start command: `gunicorn config.wsgi --log-file -`
  - Environment variables: `SECRET_KEY`, `DATABASE_URL` (Render Postgres), `DJANGO_SETTINGS_MODULE=config.settings`, `ALLOWED_HOSTS` (optional)
- Frontend settings:
  - Build command: `cd frontend && npm install && npm run build`
  - Set `VITE_API_BASE_URL` to your backend's URL (e.g. `https://<backend>.onrender.com/api`)

Local verification:

- Run `pip install -r backend/requirements.txt` in the backend venv.
- Run `python backend/manage.py collectstatic --noinput` to gather static files.
- Start backend with `gunicorn config.wsgi --log-file -` or `python backend/manage.py runserver`.
- Build frontend with `cd frontend && npm run build` and serve `frontend/dist`.
