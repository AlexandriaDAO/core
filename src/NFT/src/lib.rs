use candid::Principal;
use ciborium::{from_reader, into_writer};
use ic_stable_structures::storable::Bound;
use ic_stable_structures::Storable;
use icrc_ledger_types::icrc1::transfer::Memo;
use serde::de::DeserializeOwned;
use serde::{Deserialize, Serialize};
use serde_bytes::ByteBuf;
use serde_json::Value;
use std::borrow::Cow;
use std::cell::RefCell;
use std::collections::{HashMap, HashSet};
use std::hash::Hash;
use std::thread::LocalKey;

pub use candid;
pub use ciborium;
pub use ic_cdk;
pub use ic_stable_structures;
pub use icrc_ledger_types;
pub use num_traits;

#[derive(thiserror::Error, Debug)]
pub enum Error {
    #[error("{0}")]
    Custom(&'static str),
    #[error("{0}")]
    Struct(#[from] ic_stable_structures::GrowFailed),
}

pub type Result<T> = std::result::Result<T, Error>;

pub trait Metadata {
    fn metadata(&self) -> String;
}

//pub trait Icrc10Trait {
//    fn supported_standards(&self) -> Result<Vec<Standard>>;
//}

#[derive(Clone, Deserialize, Serialize)]
pub struct TokenInner<T>
where
    T: Hash + Metadata,
{
    pub id: u64,
    pub token: T,
    pub supply_cap: Option<usize>,
    pub created_at: u64,
    pub updated_at: u64,
    pub owner: Principal,
    pub holders: HashSet<Principal>,
}

impl<T> TokenInner<T>
where
    T: Hash + Metadata,
{
    fn total_supply(&self) -> usize {
        self.holders.len()
    }
}

impl<T> Storable for TokenInner<T>
where
    T: Hash + Metadata + Serialize + DeserializeOwned,
{
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        let mut buf = vec![];
        into_writer(self, &mut buf).expect("failed to encode Collection data");
        Cow::Owned(buf)
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        from_reader(&bytes[..]).expect("failed to decode Collection data")
    }
}

#[derive(Clone, Deserialize, Serialize)]
pub struct Transaction {
    pub ts: u64,
    pub token_id: u64,
    pub op: String,
    pub from: Option<Principal>,
    pub to: Option<Principal>,
    pub metadata: String,
    pub memo: Option<Memo>,
}

impl Storable for Transaction {
    const BOUND: Bound = Bound::Unbounded;

    fn to_bytes(&self) -> Cow<[u8]> {
        let mut buf = vec![];
        into_writer(self, &mut buf).expect("failed to encode Collection data");
        Cow::Owned(buf)
    }

    fn from_bytes(bytes: Cow<'_, [u8]>) -> Self {
        from_reader(&bytes[..]).expect("failed to decode Collection data")
    }
}

pub trait Icrc7TokenStorage<T>
where
    T: Hash + Metadata + DeserializeOwned + Serialize + 'static,
{
    fn get_tokens() -> &'static LocalKey<
        std::cell::RefCell<
            ic_stable_structures::StableBTreeMap<
                u64,
                TokenInner<T>,
                ic_stable_structures::memory_manager::VirtualMemory<
                    ic_stable_structures::DefaultMemoryImpl,
                >,
            >,
        >,
    >;
}

pub trait Icrc7TransactionStorage {
    fn add_transaction(transacton: Transaction) -> Result<u64>;
}

pub trait Icrc7AssetsStorage {
    fn check_asset(asset: u64) -> bool;
    fn add_asset(asset: u64) -> Result<()>;
}

pub trait Storage<T>: Icrc7TokenStorage<T> + Icrc7TransactionStorage + Icrc7AssetsStorage
where
    T: Hash + Metadata + DeserializeOwned + Serialize + 'static,
{
}

pub trait Icrc7<T>: Storage<T>
where
    T: Hash + Metadata + DeserializeOwned + Serialize + 'static,
{
    fn icrc7_collection_metadata(&self) -> String {
        serde_json::to_string(&serde_json::json!({
            "icrc7:symbol": Self::symbol(),
            "icrc7:name": Self::name(),
            "icrc7:description": Self::description(),
            "icrc7:logo": Self::logo(),
            "icrc7:total_supply": Self::total_supply(),
            "icrc7:supply_cap": Self::supply_cap(),
        }))
        .unwrap_or_default()
    }
    fn symbol() -> &'static str;
    fn name() -> &'static str;
    fn description() -> &'static str;
    fn logo() -> &'static str;
    fn total_supply() -> usize {
        Self::get_tokens().with(|k| {
            (*k.borrow()).iter().fold(0, |mut s, (_, t)| {
                s += t.holders.len();
                s
            })
        })
    }
    fn supply_cap() -> Option<usize> {
        None
    }
    fn max_query_batch_size() -> usize {
        100
    }
    fn max_update_batch_size() -> usize {
        20
    }
    fn default_take_value() -> usize {
        10
    }
    fn max_take_value() -> usize {
        100
    }
    fn max_memo_size() -> usize {
        32
    }
    fn atomic_batch_transfers() -> bool {
        false
    }
    fn tx_window() -> usize {
        2 * 60 * 60
    }
    fn permitted_drift() -> usize {
        2 * 60
    }
    fn token_metadata(token_ids: Vec<u64>) -> Result<Vec<String>> {
        if token_ids.len() > Self::max_query_batch_size() {
            Err(Error::Custom("exceeds max query batch size"))
        } else {
            Ok(Self::get_tokens().with(|k| {
                k.borrow()
                    .iter()
                    .filter(|(id, _)| token_ids.contains(id))
                    .map(|(_id, token)| token.token.metadata())
                    .collect()
            }))
        }
    }
    fn owner_of(token_ids: Vec<u64>) -> Result<Vec<Option<Principal>>> {
        if token_ids.len() > Self::max_query_batch_size() {
            Err(Error::Custom("exceeds max query batch size"))
        } else {
            Self::get_tokens().with(|k| {
                let tokens = k.borrow();
                Ok(token_ids
                    .iter()
                    .map(|id| match tokens.get(id) {
                        Some(t) => Some(t.owner.clone()),
                        _ => None,
                    })
                    .collect())
            })
        }
    }
    fn balance_of(accounts: Vec<Principal>) -> Result<Vec<usize>> {
        if accounts.len() > Self::max_query_batch_size() {
            Err(Error::Custom("exceeds max query batch size"))
        } else {
            Self::get_tokens().with(|k| {
                let tokens = k.borrow();
                Ok(accounts
                    .iter()
                    .map(|owner| {
                        tokens
                            .iter()
                            .filter(|(_, t)| t.holders.contains(owner))
                            .count()
                    })
                    .collect())
            })
        }
    }
    fn tokens(prev: Option<usize>, take: Option<usize>) -> Result<Vec<u64>> {
        Self::get_tokens().with(|k| {
            let tokens = k.borrow();
            Ok(tokens
                .iter()
                .skip(prev.unwrap_or(0))
                .take(take.unwrap_or(Self::max_query_batch_size()))
                .map(|(id, _)| id.clone())
                .collect())
        })
    }
    fn tokens_of(account: Principal, prev: Option<usize>, take: Option<usize>) -> Result<Vec<u64>> {
        Self::get_tokens().with(|k| {
            let tokens = k.borrow();
            Ok(tokens
                .iter()
                .filter(|(_, t)| t.holders.contains(&account))
                .skip(prev.unwrap_or(0))
                .take(take.unwrap_or(Self::max_query_batch_size()))
                .map(|(i, _)| i)
                .collect())
        })
    }
    fn create_token(token: T, supply_cap: Option<usize>) -> Result<u64> {
        use std::hash::Hasher;
        let author = ic_cdk::caller();
        let now_sec = ic_cdk::api::time() / 1_000_000_000;
        let mut token_hash = std::hash::DefaultHasher::new();
        token.hash(&mut token_hash);
        let token_hash = token_hash.finish();
        if Self::check_asset(token_hash) {
            return Err(Error::Custom("asset already exists"));
        }
        let id = Self::get_tokens().with(|k| {
            let tokens = k.borrow();
            tokens.len() as u64 + 1
        });
        let ttoken = TokenInner {
            id,
            token,
            supply_cap,
            created_at: now_sec,
            updated_at: now_sec,
            owner: author,
            holders: HashSet::new(),
        };
        Self::get_tokens().with(|k| {
            let mut tokens = k.borrow_mut();
            tokens.insert(id, ttoken);
        });
        Self::add_asset(token_hash)?;
        Ok(id)
    }
    fn update_token(id: u64, token: T, supply_cap: Option<usize>) -> Result<()> {
        let caller = ic_cdk::caller();
        Self::get_tokens().with(|k| {
            let mut tokens = k.borrow_mut();

            let mut orig_token = match tokens.remove(&id) {
                Some(t) => t,
                None => {
                    return Err(Error::Custom("token not found"));
                }
            };
            if orig_token.owner != caller {
                return Err(Error::Custom("caller is not a owner"));
            }
            if orig_token.total_supply() > 0 {
                return Err(Error::Custom("token has been minted, can not be updated"));
            }
            if let Some(supply_cap) = supply_cap {
                if supply_cap >= orig_token.supply_cap.unwrap_or(0) {
                    return Err(Error::Custom("supply cap can not be increased"));
                }
            }
            let now = ic_cdk::api::time() / 1_000_000_000;
            orig_token.updated_at = now;
            orig_token.token = token;
            tokens.insert(id, orig_token);
            Ok(())
        })
    }
    fn transfer(
        args: Vec<(
            u64,          /*token_id*/
            Principal,    /*to*/
            Option<Memo>, /*memo*/
            Option<u64>,  /*created_at*/
        )>,
    ) -> Result<Vec<Result<u64>>> {
        Self::get_tokens().with(|k| {
            let mut tokens = k.borrow_mut();
            if args.is_empty() {
                return Err(Error::Custom("no transfer args provided"));
            }

            if args.len() > Self::max_update_batch_size() {
                return Err(Error::Custom("exceeds max update batch size"));
            }

            let caller = ic_cdk::caller();
            let now = ic_cdk::api::time();
            let mut res = args.iter().fold(vec![], |mut res, arg| {
                let mut rres = Ok(());
                if arg.1 == Principal::anonymous() || arg.1 == caller {
                    rres = Err(Error::Custom("invalid recipient"));
                }
                if let Some(mm) = &arg.2 {
                    if mm.0.len() > Self::max_memo_size() {
                        rres = Err(Error::Custom("memo size too large"));
                    }
                }
                if let Some(ct) = arg.3 {
                    if ct > now + Self::permitted_drift() as u64 {
                        rres = Err(Error::Custom("too old"));
                    }
                }
                match tokens.get(&arg.0) {
                    Some(t) => {
                        if !t.holders.contains(&caller) {
                            rres = Err(Error::Custom("unauthorized"));
                        }
                    }
                    None => {
                        rres = Err(Error::Custom("non existing token"));
                    }
                }
                res.push(rres);
                res
            });
            if Self::atomic_batch_transfers() && args.len() > 1 && res.iter().any(|r| r.is_err()) {
                return Err(Error::Custom("invalid transfer args"));
            }
            Ok(args
                .iter()
                .zip(res.iter_mut())
                .filter(|(_arg, res)| res.is_ok())
                .fold(vec![], |mut res, (arg, _res)| {
                    let mut orig_token = tokens.get(&arg.0).unwrap();
                    let hh = &mut orig_token.holders;
                    hh.remove(&caller);
                    hh.insert(arg.1);
                    tokens.insert(arg.0, orig_token);
                    let tx_log = Transaction {
                        ts: now,
                        token_id: arg.0,
                        op: "7xfr".to_string(),
                        from: Some(caller),
                        to: Some(arg.1),
                        metadata: tokens.get(&arg.0).unwrap().token.metadata(),
                        memo: arg.2.clone(),
                    };
                    res.push(Self::add_transaction(tx_log));
                    res
                }))
        })
    }

    fn mint(token_id: u64, holders: HashSet<Principal>) -> Result<Vec<Result<u64>>> {
        Self::get_tokens().with(|k| {
            let mut tokens = k.borrow_mut();
            let caller = ic_cdk::caller();
            if holders.is_empty() {
                return Err(Error::Custom("no mint holders provided"));
            }
            if holders.len() > Self::max_update_batch_size() {
                return Err(Error::Custom("exceeds max update batch size"));
            }
            let token = match tokens.get(&token_id) {
                Some(t) => {
                    if let Some(sp) = t.supply_cap {
                        if t.total_supply() + holders.len() > sp {
                            return Err(Error::Custom("token supply capability reached"));
                        }
                    }
                    t
                }
                None => return Err(Error::Custom("non existing token id")),
            };
            if token.owner != caller {
                return Err(Error::Custom("unauthorized"));
            }

            let now = ic_cdk::api::time();
            Ok(holders.iter().fold(vec![], |mut res, holder| {
                let mut token = tokens.get(&token_id).unwrap();
                let holders = &mut token.holders;
                holders.insert(holder.clone());
                let metadata = token.token.metadata();
                tokens.insert(token_id, token);
                let tx_log = Transaction {
                    ts: now,
                    token_id,
                    op: "7mint".to_string(),
                    from: Some(caller),
                    to: Some(holder.clone()),
                    metadata,
                    memo: None,
                };
                res.push(Self::add_transaction(tx_log));
                res
            }))
        })
    }
}

pub use icp_token_derive::Icrc7;
pub use icp_token_derive::Storage;
