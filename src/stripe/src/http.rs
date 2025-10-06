use ic_cdk::println;
use serde_json::Value;

use crate::types::{HttpRequest, HttpResponse};

pub fn create_cors_headers() -> Vec<(String, String)> {
    vec![
        ("Access-Control-Allow-Origin".to_string(), "*".to_string()),
        (
            "Access-Control-Allow-Methods".to_string(),
            "GET, POST, OPTIONS".to_string(),
        ),
        (
            "Access-Control-Allow-Headers".to_string(),
            "Content-Type".to_string(),
        ),
        ("Access-Control-Max-Age".to_string(), "86400".to_string()),
    ]
}

pub fn create_json_response(status_code: u16, body: Value, include_cors: bool) -> HttpResponse {
    let mut headers = vec![("Content-Type".to_string(), "application/json".to_string())];

    if include_cors {
        headers.extend(create_cors_headers());
    }

    HttpResponse {
        status_code,
        headers,
        body: serde_json::to_vec(&body).unwrap_or_else(|_| Vec::new()),
        upgrade: None,
    }
}

pub fn handle_preflight() -> HttpResponse {
    HttpResponse {
        status_code: 200,
        headers: create_cors_headers(),
        body: Vec::new(),
        upgrade: None,
    }
}

pub fn handle_get_info() -> HttpResponse {
    create_json_response(
        200,
        serde_json::json!({
            "status": "ok",
            "version": "1.0.0",
            "endpoints": {
                "GET /": "Returns this info message",
                "GET /health": "Health check endpoint",
            }
        }),
        true,
    )
}

pub fn handle_method_not_allowed(method: &str, allowed_methods: &str) -> HttpResponse {
    create_json_response(
        405,
        serde_json::json!({
            "status": "error",
            "message": format!("Method {} not supported. Allowed methods: {}", method, allowed_methods),
            "code": "METHOD_NOT_ALLOWED"
        }),
        true,
    )
}

pub fn handle_upgrade_to_update() -> HttpResponse {
    println!("POST request detected - upgrading to update call");
    HttpResponse {
        status_code: 200,
        headers: vec![],
        body: Vec::new(),
        upgrade: Some(true),
    }
}

pub fn parse_json_body(request: &HttpRequest) -> Result<Value, String> {
    let body_str = String::from_utf8_lossy(&request.body);

    match serde_json::from_str::<Value>(&body_str) {
        Ok(json_value) => Ok(json_value),
        Err(e) => {
            println!("Failed to parse JSON: {}", e);
            println!("Raw data received: {}", body_str);
            Err(format!("Invalid JSON format: {}", e))
        }
    }
}

pub fn create_success_response(message: &str, data: Option<Value>) -> HttpResponse {
    let mut response_body = serde_json::json!({
        "status": "success",
        "message": message,
        "timestamp": ic_cdk::api::time()
    });

    if let Some(data) = data {
        response_body["data"] = data;
    }

    create_json_response(200, response_body, true)
}

pub fn create_error_response(
    status_code: u16,
    message: &str,
    error_code: Option<&str>,
) -> HttpResponse {
    let mut response_body = serde_json::json!({
        "status": "error",
        "message": message,
        "timestamp": ic_cdk::api::time()
    });

    if let Some(code) = error_code {
        response_body["code"] = serde_json::Value::String(code.to_string());
    }

    create_json_response(status_code, response_body, true)
}
