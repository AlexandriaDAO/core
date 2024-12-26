use ic_cdk::query;

use crate::{Log, LOGS};



#[query]
pub fn get_all_logs() -> Vec<(u64, Log)> {
    LOGS.with(|logs| {
        let mut log_entries: Vec<(u64, Log)> = logs
            .borrow()
            .iter()
            .map(|(time, log)| (time, log.clone()))
            .collect();

        // Sort the log entries by time in ascending order
        log_entries.sort_by_key(|&(time, _)| time);

        log_entries
    })
}
