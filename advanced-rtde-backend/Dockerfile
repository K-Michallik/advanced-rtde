FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ .

EXPOSE 52761

# ENTRYPOINT [ "/bin/bash" ]
# ENTRYPOINT [ "tail", "-f", "/dev/null" ]
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "52761"]