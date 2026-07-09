FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python -m app.services.build_index

CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}
