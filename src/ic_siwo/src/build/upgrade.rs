use ic_cdk::post_upgrade;

use super::rng::init_rng;
use super::settings::init_settings;
use super::types::SettingsInput;

/// `post_upgrade` is called when the canister is upgraded. It initializes the SIWO library with the given settings.
///
/// Required fields are `domain`, `uri`, and `salt`. All other fields are optional.
///
/// ## 🛑 Important: Changing the `salt` or `uri` setting affects how user seeds are generated.
/// This means that existing users will get a new principal id when they sign in. Tip: Don't change the `salt` or `uri`
/// settings after users have started using the service!
#[post_upgrade]
fn upgrade(settings: SettingsInput) {
    init_settings(settings);
    init_rng();
}


// post upgrade will only run when the code inside this canister is updated
// so if you wanna update settings, you need to update something in code first
// if you deploy with new arguments and don't change the code,
// build process will produce a hash of module which is already installed and upgrade will not run