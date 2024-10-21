
use crate::frontend_principal;
use candid::Principal;


pub fn not_anon() -> Result<(), String> {  
//   let caller = ic_cdk::api::caller();  
//   if caller != Principal::anonymous() {  
    Ok(())
//   } else {  
//     Err("Anonymous principal not allowed to make calls.".to_string())
//   }  
}


pub fn is_frontend() -> Result<(), String> {
//   if ic_cdk::api::caller() == frontend_principal() {
      Ok(())
//   } else {
//       Err("You are unauthorized to call this method.".to_string())
//   }
}