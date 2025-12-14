FROM rust:1.72-slim

WORKDIR /app

COPY Cargo.toml Cargo.lock ./
RUN mkdir src
RUN echo "fn main() {}" > src/main.rs
RUN cargo build --release || true

COPY src ./src
RUN cargo build --release

EXPOSE 8002
CMD ["./target/release/rust-service"]
