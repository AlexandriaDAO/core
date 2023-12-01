use crate::save_source_card;

use ic_cdk::api::management_canister::http_request::{http_request, CanisterHttpRequestArgument, HttpHeader, HttpMethod};
use serde::{Serialize, Deserialize};


#[derive(Serialize, Deserialize)]
struct BookSearchRequest {
  query: String,
  breadth: u8,
  scope: String,
}

#[derive(Serialize, Deserialize, Debug)]
struct BookSearchResponse {
  content: String,
  heading: String,
  title: String,
}

#[ic_cdk::update]
pub async fn get_weaviate_query(user_query: String, breadth: u8, scope: String) -> String {

  let query_for_request = user_query.clone();

  let url = "https://www.uncensoredgreats.com/api/IC/bookSearch".to_string();

  let body = BookSearchRequest {
      query: query_for_request,
      breadth,
      scope,
  };
  let json_body = serde_json::to_string(&body).unwrap();

  let request_headers = vec![
      HttpHeader {
          name: "Content-Type".to_string(),
          value: "application/json".to_string(),
      },
  ];

  let request = CanisterHttpRequestArgument {
      url,
      method: HttpMethod::POST,
      body: Some(json_body.into_bytes()),
      max_response_bytes: None,
      transform: None,
      headers: request_headers,
  };

  match http_request(request).await {
    Ok((response,)) => {
        let str_body = String::from_utf8(response.body)
            .expect("Response is not UTF-8 encoded.");

        let parsed_response: Vec<BookSearchResponse> = serde_json::from_str(&str_body)
            .expect("Failed to parse JSON");

        for item in parsed_response {
            // ToDo: Updated weaviate cluster, heading should be CFI link, and string by default.
            let heading_str = item.heading.to_string();

            // This is the only link to the rest of the app.
            save_source_card(user_query.clone(), item.title, heading_str, item.content);
        }

        "Source cards populated successfully".to_string()
    }
    Err((r, m)) => {
        format!("HTTP request error. Code: {r:?}, Message: {m}")
    }
  }
}

