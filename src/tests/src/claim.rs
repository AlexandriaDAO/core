use ic_cdk::update;
use crate::utils::get_test_subaccount;

#[update]
pub async fn claim_icp_reward(balance_name: String) -> Result<String, String> {
    let swap_canister_id = crate::icp_swap_principal();

    // get subaccount from balance name
    let from_subaccount = get_test_subaccount(&balance_name)
        .map_err(|_| format!("Invalid balance name: {}. Must be one of: root, one, two, three", balance_name))?;

    // Call claim function on swap canister
    let claim_result: Result<(Result<String, String>,), _> = ic_cdk::call(
        swap_canister_id,
        "claim_icp_reward",
        (Some(from_subaccount),),
    ).await;

    match claim_result {
        Ok((Ok(message),)) => Ok(message),
        Ok((Err(e),)) => Err(format!("Claim error: {}", e)),
        Err(e) => Err(format!("Claim call failed: {:?}", e)),
    }
}
