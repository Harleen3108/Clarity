FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

ENV FASTEMBED_CACHE_PATH=/app/fastembed_cache \
    OMP_NUM_THREADS=1 \
    TOKENIZERS_PARALLELISM=false

# Pre-download fastembed ONNX model so cold starts are instant
RUN python -c "from fastembed import TextEmbedding; list(TextEmbedding('BAAI/bge-small-en-v1.5', cache_dir='/app/fastembed_cache').embed(['warmup']))"

COPY app/ ./app/

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000} --workers 1"]
