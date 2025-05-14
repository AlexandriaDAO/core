use candid::Principal;

use super::types::SettingsInput;
use crate::{settings::builder::SettingsBuilder, store::SETTINGS};


/// Initialize the SIWO library with the given settings.
///
/// Required fields are `domain`, `uri`, and `salt`. All other fields are optional.
///
/// ## 🛑 Important: Changing the `salt` or `uri` setting affects how user seeds are generated.
/// This means that existing users will get a new principal id when they sign in. Tip: Don't change the `salt` or `uri`
/// settings after users have started using the service!
pub(super) fn init_settings(settings_input: SettingsInput) {
    let mut siwo_settings = SettingsBuilder::new(
        &settings_input.domain,
        &settings_input.uri,
        &settings_input.salt,
    );

    // Optional fields
    if let Some(scheme) = settings_input.scheme {
        siwo_settings = siwo_settings.scheme(scheme);
    }
    if let Some(statement) = settings_input.statement {
        siwo_settings = siwo_settings.statement(statement);
    }
    if let Some(session_expire_in) = settings_input.session_expires_in {
        siwo_settings = siwo_settings.session_expires_in(session_expire_in);
    }
    if let Some(targets) = settings_input.targets {
        let targets: Vec<Principal> = targets
            .into_iter()
            .map(|t| Principal::from_text(t).unwrap())
            .collect();
        // Make sure the canister id of this canister is in the list of targets
        let canister_id = ic_cdk::id();
        if !targets.contains(&canister_id) {
            panic!(
                "ic_siwo_provider canister id {} not in the list of targets",
                canister_id
            );
        }
        siwo_settings = siwo_settings.targets(targets);
    }


    SETTINGS.set(Some(siwo_settings.build().unwrap()));
}
