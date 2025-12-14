use actix_web::{post, get, web, App, HttpServer, Responder, HttpResponse};
use serde::{Serialize, Deserialize};
use serde_json::Value;

use reqwest::Client;

#[derive(Deserialize)]
struct ChainRequest {
    payload: Value,
    callback: String,
}

#[post("/chain")]
async fn chain(req: web::Json<ChainRequest>) -> impl Responder {
    // Simulate processing
    let mut result = serde_json::json!({
        "processed_by": "rust",
        "original_payload": req.payload,
    });


    if let Some(obj) = result.as_object_mut() {
        obj.insert("note".to_string(), serde_json::json!("rust appended this"));
    }

    // Send back the final result to the callback URL (points to Python)
    let client = Client::new();
    let callback_body = serde_json::json!({
        "final_result": result
    });

    // Fire-and-forget style (but we can await to ensure success)
    match client.post(&req.callback).json(&callback_body).send().await {
        Ok(r) => {
            let status = r.status().as_u16();
            return HttpResponse::Ok().json(serde_json::json!({
                "status": "posted_to_callback",
                "callback_status": status
            }));
        }
        Err(e) => {
            println!("Error posting to callback: {}", e);
            return HttpResponse::InternalServerError().json(serde_json::json!({
                "status": "failed_to_post_callback",
                "error": format!("{}", e)
            }));
        }
    }
}

#[get("/")]
async fn home() -> impl Responder {
    web::Json(serde_json::json!({
        "service": "rust-service",
        "status": "running"
    }))
}

#[get("/health")]
async fn health() -> impl Responder {
    web::Json(serde_json::json!({
        "service": "rust-service",
        "status": "healthy"
    }))
}

#[get("/test_python")]
async fn test_python() -> impl Responder {
    let url = "http://localhost:8001/health";

    match reqwest::get(url).await {
        Ok(resp) => {
            match resp.json::<serde_json::Value>().await {
                Ok(json) => HttpResponse::Ok().json(serde_json::json!({
                    "status": "ok",
                    "python_response": json
                })),
                Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
                    "status": "error",
                    "detail": format!("{}", e)
                }))
            }
        }
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "status": "error",
            "detail": format!("{}", e)
        })),
    }
}


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(chain)
            .service(home)
            .service(health)       
            .service(test_python)  
     
    })
    .bind(("127.0.0.1", 8002))?
    .run()
    .await
}
