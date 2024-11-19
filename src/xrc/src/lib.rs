use candid::{CandidType, Deserialize};
use ic_cdk_macros::*;

#[derive(CandidType, Deserialize, Clone, Debug)]
pub enum AssetClass {
    Cryptocurrency,
    FiatCurrency,
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct Asset {
    symbol: String,
    class: AssetClass,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct ExchangeRateMetadata {
    decimals: u32,
    base_asset_num_received_rates: u64,
    base_asset_num_queried_sources: u64,
    quote_asset_num_received_rates: u64,
    quote_asset_num_queried_sources: u64,
    standard_deviation: u64,
    forex_timestamp: Option<u64>,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct ExchangeRate {
    base_asset: Asset,
    quote_asset: Asset,
    timestamp: u64,
    rate: u64,
    metadata: ExchangeRateMetadata,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct GetExchangeRateRequest {
    base_asset: Asset,
    quote_asset: Asset,
    timestamp: Option<u64>,
}

#[derive(CandidType, Deserialize, Debug)]
pub enum ExchangeRateError {
    AnonymousPrincipalNotAllowed,
    Pending,
    CryptoBaseAssetNotFound,
    CryptoQuoteAssetNotFound,
    StablecoinRateNotFound,
    StablecoinRateTooFewRates,
    StablecoinRateZeroRate,
    ForexInvalidTimestamp,
    ForexBaseAssetNotFound,
    ForexQuoteAssetNotFound,
    ForexAssetsNotFound,
    RateLimited,
    NotEnoughCycles,
    FailedToAcceptCycles,
    InconsistentRatesReceived,
    Other { code: u32, description: String },
}

type GetExchangeRateResult = Result<ExchangeRate, ExchangeRateError>;

#[query]
#[candid::candid_method(query)]
fn get_exchange_rate(request: GetExchangeRateRequest) -> GetExchangeRateResult {
    ic_cdk::println!("XRC: Received exchange rate request for {} ({:?}) to {} ({:?})", 
        request.base_asset.symbol,
        request.base_asset.class,
        request.quote_asset.symbol,
        request.quote_asset.class
    );

    let metadata = ExchangeRateMetadata {
        decimals: 8,
        base_asset_num_received_rates: 1,
        base_asset_num_queried_sources: 1,
        quote_asset_num_received_rates: 1,
        quote_asset_num_queried_sources: 1,
        standard_deviation: 0,
        forex_timestamp: None,
    };

    // Check asset classes and symbols
    let rate = match (&request.base_asset.class, &request.quote_asset.class) {
        (AssetClass::Cryptocurrency, AssetClass::Cryptocurrency) 
            if request.base_asset.symbol == "ICP" && 
               request.quote_asset.symbol == "USDT" => {
                ic_cdk::println!("XRC: Matched ICP/USDT pair");
                1_000_000_000 // $10.00 USDT per ICP
            },
        (AssetClass::Cryptocurrency, AssetClass::FiatCurrency) 
            if request.base_asset.symbol == "ICP" && 
               request.quote_asset.symbol == "USD" => {
                ic_cdk::println!("XRC: Matched ICP/USD pair");
                1_000_000_000 // $10.00 USD per ICP
            },
        (AssetClass::Cryptocurrency, AssetClass::Cryptocurrency)
            if request.base_asset.symbol == "ICP" && 
               request.quote_asset.symbol == "LBRY" => {
                ic_cdk::println!("XRC: Matched ICP/LBRY pair");
                400_000_000  // 4.00 LBRY per ICP
            },
        _ => {
            ic_cdk::println!("XRC: No matching pair found");
            return Err(ExchangeRateError::CryptoBaseAssetNotFound)
        },
    };

    ic_cdk::println!("XRC: Returning rate: {}", rate);
    Ok(ExchangeRate {
        base_asset: request.base_asset,
        quote_asset: request.quote_asset,
        timestamp: ic_cdk::api::time(),
        rate,
        metadata,
    })
}

// Required for candid interface generation
ic_cdk::export_candid!();