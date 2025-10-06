use candid::{CandidType, Principal};
use serde::{Deserialize, Serialize};

#[derive(Debug, CandidType, Serialize, Deserialize)]
struct Asset {
    symbol: String,
    class: AssetClass,
}

#[derive(Debug, CandidType, Serialize, Deserialize)]
enum AssetClass {
    Cryptocurrency,
    FiatCurrency,
}

#[derive(Debug, CandidType, Serialize, Deserialize)]
struct GetExchangeRateRequest {
    base_asset: Asset,
    quote_asset: Asset,
    timestamp: Option<u64>,
}

#[derive(Debug, CandidType, Serialize, Deserialize)]
struct Metadata {
    decimals: u32,
    forex_timestamp: Option<u64>,
    quote_asset_num_received_rates: u64,
    base_asset_num_received_rates: u64,
    base_asset_num_queried_sources: u64,
    standard_deviation: u64,
    quote_asset_num_queried_sources: u64,
}

#[derive(Debug, CandidType, Serialize, Deserialize)]
struct ExchangeRateResponse {
    metadata: Metadata,
    rate: u64,
    timestamp: u64,
    quote_asset: Asset,
    base_asset: Asset,
}

#[derive(Debug, CandidType, Serialize, Deserialize)]
enum ExchangeRateError {
    AnonymousPrincipalNotAllowed,
    CryptoQuoteAssetNotFound,
    CryptoBaseAssetNotFound,
    StablecoinRateNotFound,
    StablecoinRateTooFewRates,
    StablecoinRateZeroRate,
    ForexInvalidTimestamp,
    ForexQuoteAssetNotFound,
    ForexBaseAssetNotFound,
    ForexAssetsNotFound,
    ForexInvalidRequestedTimestamp,
    ForexRateNotFound,
    NotEnoughCycles,
    FailedToAcceptCycles,
    InconsistentRatesReceived,
    RateLimited,
    Other { code: u32, description: String },
}

#[derive(Debug, CandidType, Serialize, Deserialize)]
enum XRCResponse {
    Ok(ExchangeRateResponse),
    Err(ExchangeRateError),
}

pub async fn get_icp_usd_rate() -> Result<f64, String> {
    let xrc_canister_id = Principal::from_text("uf6dk-hyaaa-aaaaq-qaaaq-cai")
        .map_err(|e| format!("Invalid canister ID: {}", e))?;

    let request = GetExchangeRateRequest {
        base_asset: Asset {
            symbol: "ICP".to_string(),
            class: AssetClass::Cryptocurrency,
        },
        quote_asset: Asset {
            symbol: "USD".to_string(),
            class: AssetClass::FiatCurrency,
        },
        timestamp: None,
    };

    // Use regular call with proper tuple wrapping
    let call_result: Result<(XRCResponse,), _> = ic_cdk::api::call::call_with_payment(
        xrc_canister_id,
        "get_exchange_rate",
        (request,),
        1_000_000_000u64, // 1B cycles
    )
    .await;

    match call_result {
        Ok((response,)) => {
            match response {
                XRCResponse::Ok(exchange_rate) => {
                    // Convert rate to USD (accounting for decimals)
                    let divisor = 10_u64.pow(exchange_rate.metadata.decimals);
                    let price_usd = exchange_rate.rate as f64 / divisor as f64;
                    Ok(price_usd)
                }
                XRCResponse::Err(err) => Err(format!("XRC error: {:?}", err)),
            }
        }
        Err((rejection_code, msg)) => {
            Err(format!("XRC call failed: {:?} - {}", rejection_code, msg))
        }
    }
}
