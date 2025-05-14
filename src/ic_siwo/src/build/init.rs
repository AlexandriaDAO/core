use ic_cdk::init;
use super::rng::init_rng;
use super::settings::init_settings;
use super::types::SettingsInput;


/// `init` is called when the canister is created. It initializes the SIWO library with the given settings.
///
/// Required fields are `domain`, `uri`, and `salt`. All other fields are optional.
///
/// ## 🛑 Important: Changing the `salt` or `uri` setting affects how user seeds are generated.
/// This means that existing users will get a new principal id when they sign in. Tip: Don't change the `salt` or `uri`
/// settings after users have started using the service!
#[init]
fn init(settings: SettingsInput) {
    init_settings(settings);
    init_rng();
}
