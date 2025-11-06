use crate::http::{
    create_error_response, create_success_response, handle_get_info, handle_method_not_allowed,
    handle_preflight, handle_upgrade_to_update, parse_json_body,
};
use crate::storage::{get_stripe_webhook_secret, update_user_balance};
use crate::types::{HttpRequest, HttpResponse};
use candid::Principal;
use hmac::{Hmac, Mac};
use ic_cdk::{println, query, update};
use serde_json::Value;
use sha2::Sha256;

// =============================================================================
// HTTP GATEWAY HANDLERS
// =============================================================================

#[query]
fn http_request(request: HttpRequest) -> HttpResponse {
    println!("Request received: {} {}", request.method, request.url);

    match request.method.as_str() {
        "OPTIONS" => handle_preflight(),
        "GET" => handle_get_request(&request),
        "POST" => handle_upgrade_to_update(),
        _ => handle_method_not_allowed(&request.method, "GET, POST, OPTIONS"),
    }
}

#[update]
fn http_request_update(request: HttpRequest) -> HttpResponse {
    println!("POST request received: {}", request.url);
    println!("Headers: {:?}", request.headers);

    match request.method.as_str() {
        "POST" => handle_post_request(&request),
        _ => handle_method_not_allowed(&request.method, "POST"),
    }
}

// =============================================================================
// PRIVATE HELPER FUNCTIONS
// =============================================================================

fn handle_get_request(request: &HttpRequest) -> HttpResponse {
    // Parse URL path for routing
    let url_parts: Vec<&str> = request.url.split('?').collect();
    let path = url_parts[0];

    match path {
        "/" => handle_get_info(),
        "/health" => create_success_response("Service is healthy", None),
        _ => create_error_response(404, "Endpoint not found", Some("NOT_FOUND")),
    }
}

fn handle_post_request(request: &HttpRequest) -> HttpResponse {
    // Parse URL path for webhook routing
    let url_parts: Vec<&str> = request.url.split('?').collect();
    let path = url_parts[0];

    match path {
        "/stripe-webhook" => handle_stripe_webhook(request),
        "/" => {
            // Default behavior for generic POST requests
            match parse_json_body(request) {
                Ok(json_value) => create_success_response(
                    "JSON data received and logged to console successfully",
                    Some(serde_json::json!({
                        "received_data": json_value,
                    })),
                ),
                Err(error_msg) => create_error_response(400, &error_msg, Some("INVALID_JSON")),
            }
        }
        _ => create_error_response(404, "Webhook endpoint not found", Some("NOT_FOUND")),
    }
}

fn handle_stripe_webhook(request: &HttpRequest) -> HttpResponse {
    println!("Stripe webhook received");
    println!("Request Headers, {:#?}", request.headers);

    // First, verify the webhook signature using the raw body
    if let Err(verification_error) = verify_webhook_signature(request, &request.body) {
        println!(
            "Webhook signature verification failed: {}",
            verification_error
        );
        return create_error_response(
            401,
            "Webhook signature verification failed",
            Some("UNAUTHORIZED"),
        );
    }

    // Only proceed if signature verification passes
    match parse_json_body(request) {
        Ok(webhook_data) => {
            println!("Webhook data: {:#}", webhook_data);

            // Get the event type
            let event_type = webhook_data["type"].as_str().unwrap_or("");
            println!("Stripe event type: {}", event_type);

            match event_type {
                "checkout.session.completed" => handle_checkout_session_completed(&webhook_data),
                _ => {
                    println!("Unhandled webhook event type: {}", event_type);
                    create_success_response("Webhook received but not processed", None)
                }
            }
        }
        Err(error_msg) => {
            println!("Failed to parse webhook JSON: {}", error_msg);
            create_error_response(400, &error_msg, Some("INVALID_WEBHOOK_JSON"))
        }
    }
}

fn handle_checkout_session_completed(webhook_data: &Value) -> HttpResponse {
    println!("Processing checkout.session.completed event");

    let data = &webhook_data["data"]["object"];
    let amount_total = data["amount_total"].as_u64().unwrap_or(0);
    let session_id = data["id"].as_str().unwrap_or("");
    let client_reference_id = data["client_reference_id"].as_str().unwrap_or("");

    println!(
        "Amount: {} cents, Session ID: {}, Client Reference ID: {}",
        amount_total, session_id, client_reference_id
    );

    if !client_reference_id.is_empty() {
        match Principal::from_text(client_reference_id) {
            Ok(user_principal) => {
                println!("Updating balance for user: {}", user_principal.to_text());

                let updated_balance = update_user_balance(&user_principal, |balance| {
                    balance.balance += amount_total;
                    balance.total_deposits += amount_total;
                    balance.deposit_count += 1;
                });

                println!(
                    "Balance updated: ${:.2}",
                    updated_balance.balance as f64 / 100.0
                );

                create_success_response(
                    "Checkout session processed successfully",
                    Some(serde_json::json!({
                        "user": user_principal.to_text(),
                        "session_id": session_id,
                        "amount_deposited": amount_total,
                        "new_balance": updated_balance.balance,
                    })),
                )
            }
            Err(e) => {
                println!("Invalid Principal in client_reference_id: {}", e);
                create_error_response(
                    400,
                    "Invalid user reference",
                    Some("INVALID_USER_REFERENCE"),
                )
            }
        }
    } else {
        println!("Checkout session completed but no client_reference_id");
        create_success_response("Checkout session received but not processed", None)
    }
}

// =============================================================================
// STRIPE WEBHOOK SIGNATURE VERIFICATION
// =============================================================================

/// Extract the Stripe-Signature header from the request headers
fn extract_stripe_signature(request: &HttpRequest) -> Option<String> {
    for (name, value) in &request.headers {
        if name.to_lowercase() == "stripe-signature" {
            return Some(value.clone());
        }
    }
    None
}

/// Parse the Stripe signature header format: "t=timestamp,v1=signature"
fn parse_stripe_signature(signature_header: &str) -> Option<(u64, String)> {
    let mut timestamp = None;
    let mut signature = None;

    for part in signature_header.split(',') {
        if let Some((key, value)) = part.split_once('=') {
            match key {
                "t" => {
                    if let Ok(ts) = value.parse::<u64>() {
                        timestamp = Some(ts);
                    }
                }
                "v1" => {
                    signature = Some(value.to_string());
                }
                _ => {} // Ignore other versions or unknown keys
            }
        }
    }

    match (timestamp, signature) {
        (Some(ts), Some(sig)) => Some((ts, sig)),
        _ => None,
    }
}

/// Compute HMAC-SHA256 signature for webhook verification
fn compute_webhook_signature(
    payload: &[u8],
    timestamp: u64,
    secret: &str,
) -> Result<String, String> {
    type HmacSha256 = Hmac<Sha256>;

    // Create the signed payload: timestamp.payload
    let signed_payload = format!("{}.{}", timestamp, String::from_utf8_lossy(payload));

    println!("Signed payload length: {}", signed_payload.len());
    println!(
        "Signed payload (first 100 chars): {}",
        &signed_payload.chars().take(100).collect::<String>()
    );

    // Create HMAC instance with the webhook secret
    let mut mac = HmacSha256::new_from_slice(secret.as_bytes())
        .map_err(|e| format!("Invalid HMAC key: {}", e))?;

    // Update with the signed payload
    mac.update(signed_payload.as_bytes());

    // Get the result and convert to hex
    let result = mac.finalize();
    let signature = hex::encode(result.into_bytes());

    Ok(signature)
}

/// Verify webhook signature against Stripe's signature
fn verify_webhook_signature(request: &HttpRequest, payload: &[u8]) -> Result<(), String> {
    // Extract the Stripe-Signature header
    let signature_header = extract_stripe_signature(request)
        .ok_or_else(|| "Missing Stripe-Signature header".to_string())?;

    println!("Stripe signature header: {}", signature_header);

    // Parse the signature header
    let (timestamp, expected_signature) = parse_stripe_signature(&signature_header)
        .ok_or_else(|| "Invalid Stripe signature format".to_string())?;

    println!(
        "Parsed timestamp: {}, signature: {}",
        timestamp, expected_signature
    );

    // Get the webhook secret
    let webhook_secret = get_stripe_webhook_secret();
    println!("Webhook secret length: {}", webhook_secret.len());
    println!(
        "Webhook secret (first 10 chars): {}",
        &webhook_secret.chars().take(10).collect::<String>()
    );

    // Compute our signature
    let computed_signature = compute_webhook_signature(payload, timestamp, &webhook_secret)?;

    println!("Computed signature: {}", computed_signature);

    // Verify signatures match
    if computed_signature == expected_signature {
        println!("Webhook signature verified successfully");
        Ok(())
    } else {
        println!("Webhook signature verification failed");
        println!("Expected: {}", expected_signature);
        println!("Computed: {}", computed_signature);
        Err("Webhook signature verification failed".to_string())
    }
}
