use ic_cdk::update;

use crate::with_settings;
use crate::Settings;

use super::types::Icrc21ConsentMessageRequest;
use super::types::Icrc21ConsentInfo;
use super::types::Icrc21ConsentMessageMetadata;
use super::types::Icrc21Error::{self, UnsupportedCanisterCall};
use super::types::Icrc21ErrorInfo;
use super::types::Icrc21DeviceSpec::{FieldsDisplay, GenericDisplay};
use super::types::Icrc21ConsentMessage::{FieldsDisplayMessage, GenericDisplayMessage};

#[update]
fn icrc21_canister_call_consent_message(
    consent_msg_request: Icrc21ConsentMessageRequest,
) -> Result<Icrc21ConsentInfo, Icrc21Error> {
    if consent_msg_request.method != "siwo_login" {
        return Err(UnsupportedCanisterCall(Icrc21ErrorInfo {
            description: "Only the 'siwo_login' method is supported".to_string(),
        }));
    }

    // let Ok(session_key) = candid::decode_one::<Vec<u8>>(&consent_msg_request.arg) else {
    //     return Err(UnsupportedCanisterCall(Icrc21ErrorInfo {
    //         description: "Failed to decode the argument".to_string(),
    //     }));
    // };

    let metadata = Icrc21ConsentMessageMetadata {
        // only English supported
        language: "en".to_string(),
        // no time information in the consent message
        utc_offset_minutes: None,
    };


    let statement = with_settings!(|settings: &Settings| {
        settings.statement.clone()
    });


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

    


    // // call login function here
    // let session_key_buf = ByteBuf::from(session_key);
    // let login_result = siwo_login(session_key_buf.clone());

    // // Create consent message based on login result
    // match login_result {
    //     Ok(login_details) => {

    //         let created_principal = Principal::self_authenticating(login_details.user_canister_pubkey);

    //         let statement = with_settings!(|settings: &Settings| {
    //             settings.statement.clone()
    //         });

    //         // Login was successful, create a consent message with the login details
    //         match consent_msg_request.user_preferences.device_spec {
    //             Some(FieldsDisplay) => Ok(Icrc21ConsentInfo {
    //                 metadata,
    //                 consent_message: FieldsDisplayMessage {
    //                     intent: statement,
    //                     fields: vec![
    //                         ("User Principal".into(), created_principal.to_text()),
    //                         ("Session".into(), format!("{}", login_details.expiration)),
    //                     ],
    //                 },
    //             }),
    //             Some(GenericDisplay) | None => Ok(Icrc21ConsentInfo {
    //                 metadata,
    //                 consent_message: GenericDisplayMessage(
    //                     format!("{}\n\nThis will authenticate you with your Oisy identity. Your Application principal will be: {}.", statement, created_principal.to_text())
    //                 ),
    //             }),
    //         }
    //     },
    //     Err(error_msg) => {
    //         // Login failed, return a consent message with the error
    //         match consent_msg_request.user_preferences.device_spec {
    //             Some(FieldsDisplay) => Ok(Icrc21ConsentInfo {
    //                 metadata,
    //                 consent_message: FieldsDisplayMessage {
    //                     intent: "Login Error".into(),
    //                     fields: vec![
    //                         ("Error".into(), error_msg),
    //                     ],
    //                 },
    //             }),
    //             Some(GenericDisplay) | None => Ok(Icrc21ConsentInfo {
    //                 metadata,
    //                 consent_message: GenericDisplayMessage(
    //                     format!("Login Error\n\nThere was a problem with your login: {}", error_msg)
    //                 ),
    //             }),
    //         }
    //     }
    // }


    // https://github.com/dfinity/wg-identity-authentication/blob/b846477eea109fcc442a386e4a1955278c7fab58/reference-implementations/ICRC-21/src/lib.rs
}



// #[derive(CandidType, Deserialize)]
// struct LoginArgs {
//     signature: Vec<u8>,
//     public_key: Vec<u8>,
//     nonce: String,
// }


// #[update]
// fn icrc21_canister_call_consent_message(
//     consent_msg_request: Icrc21ConsentMessageRequest,
// ) -> Result<Icrc21ConsentInfo, Icrc21Error> {
//     if consent_msg_request.method != "siwo_login" {
//         return Err(UnsupportedCanisterCall(Icrc21ErrorInfo {
//             description: "Only the 'siwo_login' method is supported".to_string(),
//         }));
//     }

//     // let Ok(session_key) = candid::decode_one::<Vec<u8>>(&consent_msg_request.arg) else {
//     //     return Err(UnsupportedCanisterCall(Icrc21ErrorInfo {
//     //         description: "Failed to decode the argument".to_string(),
//     //     }));
//     // };


//     let login_args = match candid::decode_one::<LoginArgs>(&consent_msg_request.arg) {
//         Ok(args) => args,
//         Err(_) => {
//             return Err(UnsupportedCanisterCall(Icrc21ErrorInfo {
//                 description: "Failed to decode the login arguments".to_string(),
//             }));
//         }
//     };

//     let metadata = Icrc21ConsentMessageMetadata {
//         // only English supported
//         language: "en".to_string(),
//         // no time information in the consent message
//         utc_offset_minutes: None,
//     };



//     let statement = with_settings!(|settings: &Settings| {
//         settings.statement.clone()
//     });

//     // call login function here
//     let signature_buf = ByteBuf::from(login_args.signature);
//     let public_key_buf = ByteBuf::from(login_args.public_key);
//     let nonce = login_args.nonce;

//     let login_result = siwo_login(signature_buf.clone(), public_key_buf.clone(), nonce);

//     // Create consent message based on login result
//     match login_result {
//         Ok(login_details) => {

//             let created_principal = Principal::self_authenticating(login_details.user_canister_pubkey);

//             let statement = with_settings!(|settings: &Settings| {
//                 settings.statement.clone()
//             });

//             // Login was successful, create a consent message with the login details
//             match consent_msg_request.user_preferences.device_spec {
//                 Some(FieldsDisplay) => Ok(Icrc21ConsentInfo {
//                     metadata,
//                     consent_message: FieldsDisplayMessage {
//                         intent: statement,
//                         fields: vec![
//                             ("User Principal".into(), created_principal.to_text()),
//                             ("Session".into(), format!("{}", login_details.expiration)),
//                         ],
//                     },
//                 }),
//                 Some(GenericDisplay) | None => Ok(Icrc21ConsentInfo {
//                     metadata,
//                     consent_message: GenericDisplayMessage(
//                         format!("{}\n\nThis will authenticate you with your Oisy identity. Your Application principal will be: {}.", statement, created_principal.to_text())
//                     ),
//                 }),
//             }
//         },
//         Err(error_msg) => {
//             // Login failed, return a consent message with the error
//             match consent_msg_request.user_preferences.device_spec {
//                 Some(FieldsDisplay) => Ok(Icrc21ConsentInfo {
//                     metadata,
//                     consent_message: FieldsDisplayMessage {
//                         intent: "Login Error".into(),
//                         fields: vec![
//                             ("Error".into(), error_msg),
//                         ],
//                     },
//                 }),
//                 Some(GenericDisplay) | None => Ok(Icrc21ConsentInfo {
//                     metadata,
//                     consent_message: GenericDisplayMessage(
//                         format!("Login Error\n\nThere was a problem with your login: {}", error_msg)
//                     ),
//                 }),
//             }
//         }
//     }


//     // https://github.com/dfinity/wg-identity-authentication/blob/b846477eea109fcc442a386e4a1955278c7fab58/reference-implementations/ICRC-21/src/lib.rs
// }

