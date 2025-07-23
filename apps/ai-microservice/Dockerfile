FROM python:3.11-slim

WORKDIR /app

COPY apps/ai-microservice/requirements.txt .

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        cmake \
        build-essential \
        python3-dev \
        libglib2.0-0 \
        libsm6 \
        libxrender1 \
        libxext6 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir -r requirements.txt

RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY apps/ai-microservice/ .

CMD ["python", "-u",  "ai-service.py"]

