use candid::{CandidType, Decode, Deserialize, Encode, Principal};
use ic_stable_structures::{storable::Bound, StableBTreeMap, Storable};
use std::borrow::Cow;
use std::cell::RefCell;
use std::sync::atomic::{AtomicU64, Ordering};

use super::{MEMORY_MANAGER, Memory, MemoryId};
use crate::storage::common_types::ShelfId; // Assuming ShelfId is a type alias for String or similar

// --- Task ID Generator ---
// Needs to be persisted across upgrades or reinitialized carefully.
// For simplicity, we'll use an in-memory static atomic for now.
// Consider storing this in a StableCell for persistence across upgrades.
static NEXT_TASK_ID: AtomicU64 = AtomicU64::new(0);

fn generate_task_id() -> u64 {
    // In a real upgrade scenario, initialize NEXT_TASK_ID from a persisted value.
    NEXT_TASK_ID.fetch_add(1, Ordering::SeqCst)
}

// --- Reconciliation Task Types ---
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub enum ReconciliationTaskType {
    GlobalTimelineEntry {
        shelf_id: ShelfId,
        expected_timestamp: u64, // e.g., created_at or updated_at
        owner: Principal,
        tags: Vec<String>, // Using Vec<String> for simplicity, convert from NormalizedTag
        public_editing: bool,
    },
    NftShelfAdd {
        shelf_id: ShelfId,
        nft_id: String,
    },
    NftShelfRemove {
        shelf_id: ShelfId,
        nft_id: String,
    },
}

// --- Reconciliation Task Status ---
#[derive(CandidType, Deserialize, Clone, Debug, PartialEq, Eq, PartialOrd, Ord)]
pub enum ReconciliationTaskStatus {
    Pending,
    InProgress,
    Resolved,
    FailedMaxAttempts, // If automatic retry logic is added
}

impl Default for ReconciliationTaskStatus {
    fn default() -> Self {
        ReconciliationTaskStatus::Pending
    }
}

// --- Reconciliation Task ---
#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct ReconciliationTask {
    pub task_id: u64,
    pub recorded_at: u64, // Timestamp when the task was logged
    pub task_type: ReconciliationTaskType,
    pub details: String, // Original error message or context for the failure
    pub status: ReconciliationTaskStatus,
    pub attempts: u8, // Number of times processing has been attempted
}

impl Storable for ReconciliationTask {
    fn to_bytes(&self) -> Cow<[u8]> { Cow::Owned(Encode!(self).unwrap()) }
    fn from_bytes(bytes: Cow<[u8]>) -> Self { Decode!(bytes.as_ref(), Self).unwrap() }
    const BOUND: Bound = Bound::Unbounded; // details string can be large
}

// Memory ID for reconciliation tasks (ensure this ID is unique)
pub(crate) const RECONCILIATION_TASKS_MEM_ID: MemoryId = MemoryId::new(25);

thread_local! {
    // K: task_id (u64), V: ReconciliationTask
    pub static RECONCILIATION_TASKS: RefCell<StableBTreeMap<u64, ReconciliationTask, Memory>> = RefCell::new(
        StableBTreeMap::init(MEMORY_MANAGER.with(|m| m.borrow().get(RECONCILIATION_TASKS_MEM_ID)))
    );
}

// --- Public functions for managing reconciliation tasks ---

/// Adds a new reconciliation task and returns its ID.
pub fn add_reconciliation_task(task_type: ReconciliationTaskType, failure_details: String) -> u64 {
    let task_id = generate_task_id();
    let task = ReconciliationTask {
        task_id,
        recorded_at: ic_cdk::api::time(),
        task_type,
        details: failure_details,
        status: ReconciliationTaskStatus::Pending,
        attempts: 0,
    };
    RECONCILIATION_TASKS.with(|tasks_ref| {
        tasks_ref.borrow_mut().insert(task_id, task);
    });
    task_id
}

/// Retrieves pending reconciliation tasks, up to a limit.
pub fn get_pending_tasks(limit: usize) -> Vec<ReconciliationTask> {
    RECONCILIATION_TASKS.with(|tasks_ref| {
        tasks_ref.borrow()
            .iter()
            .filter(|(_, task)| task.status == ReconciliationTaskStatus::Pending)
            .take(limit)
            .map(|(_, task)| task.clone()) // Clone to return owned copies
            .collect()
    })
}

/// Retrieves a specific task by its ID.
pub fn get_task_by_id(task_id: u64) -> Option<ReconciliationTask> {
    RECONCILIATION_TASKS.with(|tasks_ref| {
        tasks_ref.borrow().get(&task_id) // get returns an owned copy
    })
}

/// Updates the status of a task and its attempt count.
pub fn update_task_info(task_id: u64, new_status: ReconciliationTaskStatus, attempt_increment: bool) -> Result<(), String> {
    RECONCILIATION_TASKS.with(|tasks_ref| {
        let mut tasks_map = tasks_ref.borrow_mut();
        if let Some(mut task) = tasks_map.get(&task_id) { // Get a copy
            task.status = new_status;
            if attempt_increment {
                task.attempts = task.attempts.saturating_add(1);
            }
            tasks_map.insert(task_id, task); // Re-insert the modified copy
            Ok(())
        } else {
            Err(format!("Task with ID {} not found for update.", task_id))
        }
    })
}

/// Call this function during canister init or post_upgrade to load the next_task_id
/// to prevent reusing IDs.
pub fn init_next_task_id() {
    let max_id = RECONCILIATION_TASKS.with(|tasks_ref| {
        tasks_ref.borrow().iter().map(|(id, _)| id).max().unwrap_or(0)
    });
    NEXT_TASK_ID.store(max_id + 1, Ordering::SeqCst);
} 