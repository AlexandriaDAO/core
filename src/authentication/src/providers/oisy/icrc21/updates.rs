use ic_cdk::update;

use super::types::Icrc21ConsentInfo;
use super::types::Icrc21ConsentMessage::{FieldsDisplayMessage, GenericDisplayMessage};
use super::types::Icrc21ConsentMessageMetadata;
use super::types::Icrc21ConsentMessageRequest;
use super::types::Icrc21DeviceSpec::{FieldsDisplay, GenericDisplay};
use super::types::Icrc21Error::{self, UnsupportedCanisterCall};
use super::types::Icrc21ErrorInfo;

#[update]
fn icrc21_canister_call_consent_message(
    consent_msg_request: Icrc21ConsentMessageRequest,
) -> Result<Icrc21ConsentInfo, Icrc21Error> {
    if consent_msg_request.method != "siwo_login" {
        return Err(UnsupportedCanisterCall(Icrc21ErrorInfo {
            description: "Only the 'siwo_login' method is supported".to_string(),
        }));
    }

    let metadata = Icrc21ConsentMessageMetadata {
        // only English supported
        language: "en".to_string(),
        // no time information in the consent message
        utc_offset_minutes: None,
    };

    let statement = "Login With Oisy".to_string();

    // Login was successful, create a consent message with the login details
    match consent_msg_request.user_preferences.device_spec {
        Some(FieldsDisplay) => Ok(Icrc21ConsentInfo {
            metadata,
            consent_message: FieldsDisplayMessage {
                intent: statement,
                fields: vec![
                    ("Security".into(), "Your identity is secured via cryptography".to_string()),
                    ("Permissions".into(), "This only allows authentication, not transaction signing".to_string()),
                ],
            },
        }),
        Some(GenericDisplay) | None => Ok(Icrc21ConsentInfo {
            metadata,
            consent_message: GenericDisplayMessage(
                format!(
                    "{}\n• This will authenticate you with your Oisy identity.\n\n• Your unique Internet Computer principal will be generated securely for this session\n\n• Your session remains active until you sign out or the delegation expires\n",
                    statement,
                )
            ),
        }),
    }
}
