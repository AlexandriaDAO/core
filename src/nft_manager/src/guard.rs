use candid::Principal;


pub fn not_anon() -> Result<(), String> {  
  let caller = ic_cdk::api::caller();  
  if caller != Principal::anonymous() {  
    Ok(())
  } else {  
    Err("Anonymous principal not allowed to make calls.".to_string())
  }  
}

// Needs to be hardcoded here because gaurd functions cannot be async
fn frontend_principal() -> Principal {
    Principal::from_text("xo3nl-yaaaa-aaaap-abl4q-cai").unwrap()
}

pub fn is_frontend() -> Result<(), String> {
  if ic_cdk::api::caller() == frontend_principal() {
      Ok(())
  } else {
      Err("You are unauthorized to call this method.".to_string())
  }
}