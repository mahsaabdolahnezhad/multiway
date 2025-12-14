# Multi-Service Chain Demo

This project demonstrates a **multi-service chain** with Python, Java, and Rust.  
The chain flow is: **Python → Java → Rust → Python (callback)**.

---

## Services

| Service | Framework | Port |
|---------|----------|------|
| Python  | FastAPI  | 8001 |
| Java    | Spring Boot | 8081 |
| Rust    | Actix   | 8002 |

---

## Prerequisites

- Python 3.11+
- Java 17+
- Maven (for Java)
- Rust + Cargo
- Git

---

## Setup & Run

### 1. Python Service

```bash
cd python-service
python -m venv venv
source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8001
