use crate::save_sc;

use serde_json::{json, Value};

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

  let mut post_ids = Vec::new();

  let author_str = scope.clone();
  let summary_str = "This is a demo summary that will be replaced with a pre-generated 1-liner that describes the source content.".to_string();
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

            // save_sc(user_query.clone(), author_str.clone(), item.title, heading_str, item.content, summary_str.clone());
            let post_id = save_sc(user_query.clone(), author_str.clone(), item.title, heading_str, item.content, summary_str.clone());

            post_ids.push(post_id);
        }

        let json_response = json!({ "post_ids": post_ids });
        let json_string = serde_json::to_string(&json_response)
            .expect("Failed to serialize JSON");
    
        json_string
    }
    Err((r, m)) => {
        format!("HTTP request error. Code: {r:?}, Message: {m}")
    }
  }
}