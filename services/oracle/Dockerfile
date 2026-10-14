# Dockerfile for the Python Oracle service.
FROM python:3.12-slim AS build
WORKDIR /app
COPY pyproject.toml ./
COPY oracle_service ./oracle_service
RUN pip install --no-cache-dir .

FROM python:3.12-slim
RUN useradd -u 10001 oracle
WORKDIR /app
COPY --from=build /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=build /usr/local/bin /usr/local/bin
COPY oracle_service ./oracle_service
USER oracle
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=3s CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8787/healthz')" || exit 1
CMD ["uvicorn", "oracle_service.main:app", "--host", "0.0.0.0", "--port", "8787"]
