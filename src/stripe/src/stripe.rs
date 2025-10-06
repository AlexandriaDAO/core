//1. IMPORT IC MANAGEMENT CANISTER
//This includes all methods and types needed
use ic_cdk::{
    api::{
        id,
        management_canister::{
            http_request::{
                http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod, HttpResponse,
                TransformArgs, TransformContext, TransformFunc,
            },
            main::raw_rand,
        },
    },
    caller, println,
};

use crate::storage::get_stripe_api_secret;

// Generate a random 32-character idempotency key
async fn generate_idempotency_key() -> String {
    let random_bytes = raw_rand().await.unwrap();
    hex::encode(&random_bytes.0[0..16]) // 16 bytes = 32 hex chars
}

//Update method using the HTTPS outcalls feature
#[ic_cdk::update]
async fn create_session(amount_in_cents: u64) -> String {
    println!("Creating session println");

    // Generate random idempotency key
    let idempotency_key = generate_idempotency_key().await;
    println!("Generated idempotency key: {}", idempotency_key);

    let stripe_secret = get_stripe_api_secret();
    // 2.1 Setup the URL
    let url = "https://api.stripe.com/v1/payment_links";

    // 2.2 prepare headers for the system http_request call
    let request_headers = vec![
        HttpHeader {
            name: "Idempotency-Key".to_string(),
            value: idempotency_key.clone(),
        },
        HttpHeader {
            name: "Authorization".to_string(),
            value: format!("Bearer {}", stripe_secret),
        },
        HttpHeader {
            name: "Content-Type".to_string(),
            value: "application/x-www-form-urlencoded".to_string(),
        },
    ];

    let params = [
        // Line item fields (flattened for form encoding)
        ("line_items[0][price_data][currency]", "usd".to_string()),
        (
            "line_items[0][price_data][product_data][name]",
            "Account Deposit".to_string(),
        ),
        (
            "line_items[0][price_data][unit_amount]",
            amount_in_cents.to_string(),
        ),
        ("line_items[0][quantity]", "1".to_string()),
        ("after_completion[type]", "redirect".to_string()),
        (
            "after_completion[redirect][url]",
            "http://localhost:8080/?success".to_string(),
        ),
        // Metadata for tracking - this will be on the payment link
        ("metadata[user_id]", caller().to_text()),
        // Payment intent metadata - this should flow to the payment intent
        ("payment_intent_data[metadata][user_id]", caller().to_text()),
        // Make link single-use only
        ("restrictions[completed_sessions][limit]", "1".to_string()),
    ];

    let body_string = params
        .iter()
        .map(|(k, v)| format!("{}={}", urlencoding::encode(k), urlencoding::encode(v)))
        .collect::<Vec<_>>()
        .join("&");

    let request_body: Option<Vec<u8>> = Some(body_string.into_bytes());

    // Base request configuration
    let base_request = CanisterHttpRequestArgument {
        url: url.to_string(),
        max_response_bytes: Some(10000), // ~10KB to cover response + headers with buffer
        method: HttpMethod::POST,
        headers: request_headers.clone(),
        body: request_body.clone(),
        transform: None, // Will be overridden
    };

    // First request with transform
    let request_with_transform = CanisterHttpRequestArgument {
        transform: Some(TransformContext {
            function: TransformFunc::new(id(), "transform_first".to_string()),
            context: vec![],
        }),
        ..base_request.clone()
    };

    // Second request with different transform
    let request_with_second_transform = CanisterHttpRequestArgument {
        transform: Some(TransformContext {
            function: TransformFunc::new(id(), "transform_second".to_string()),
            context: vec![],
        }),
        ..base_request.clone()
    };

    //3. MAKE HTTPS REQUEST AND WAIT FOR RESPONSE
    match http_request(request_with_transform, 160_000_000u128).await {
        //4. DECODE AND RETURN THE RESPONSE

        //See: https://docs.rs/ic-cdk/latest/ic_cdk/management_canister/struct.HttpRequestResult.html
        Ok(_response) => {
            println!("First request (with transform) succeeded");

            // Second request with second transform to get actual response
            match http_request(request_with_second_transform, 160_000_000u128).await {
                Ok(actual_response) => {
                    println!("Second request (with transform) succeeded");
                    //We need to decode that Vec<u8> that is the body into readable text.
                    //To do this, we:
                    //  1. Call `String::from_utf8()` on response.body
                    let str_body = String::from_utf8(actual_response.0.body)
                        .expect("Response is not UTF-8 encoded.");
                    println!("Full response: {:?}", str_body);

                    // Extract URL from Stripe payment link response
                    if let Ok(json) = serde_json::from_str::<serde_json::Value>(&str_body) {
                        if let Some(url) = json.get("url").and_then(|u| u.as_str()) {
                            println!("Extracted URL: {}", url);
                            url.to_string()
                        } else {
                            println!("No URL found in response");
                            "Error: No URL found in payment link response".to_string()
                        }
                    } else {
                        println!("Failed to parse JSON response");
                        "Error: Failed to parse payment link response".to_string()
                    }
                }
                Err(error) => {
                    println!("Second request failed: {:?}", error);
                    format!("Second request failed: {:?}", error)
                }
            }
        }
        Err(error) => {
            println!("First Request failed: {:?}", error);
            //Return the error as a string and end the method
            format!("First request failed: {:?}", error)
        }
    }
}

#[ic_cdk::query]
fn transform_first(_raw: TransformArgs) -> HttpResponse {
    // Normalize ALL responses to identical format for consensus
    // Return empty body as requested
    HttpResponse {
        status: 200u8.into(),
        body: vec![], // Empty body
        headers: vec![],
        ..Default::default()
    }
}

// Second transform function - returns actual status and body
#[ic_cdk::query]
fn transform_second(raw: TransformArgs) -> HttpResponse {
    HttpResponse {
        status: raw.response.status, // Keep actual status
        body: raw.response.body,     // Return actual body
        headers: vec![],             // Empty headers
        ..Default::default()
    }
}
