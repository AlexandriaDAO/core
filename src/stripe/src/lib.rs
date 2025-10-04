use ic_cdk::{api::management_canister::http_request::TransformArgs, export_candid};
mod http;
mod queries;
mod storage;
mod stripe;
mod swap;
mod types;
mod webhook;

use types::{HttpRequest, HttpResponse, UserBalance};

mod exchange_rate;

// Export Candid interface
export_candid!();
