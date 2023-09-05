// src/ugd_backend/types.rs
pub type UUID = String;
pub type Timestamp = u64;
pub type JSON = String;
pub type TextList = Vec<String>;

#[derive(Clone, Debug, Default)]
pub struct SocialStats {
    pub likes: u32,
    pub stars: u32,
    pub avg_rating: u32,
    pub num_ratings: u32,
    pub num_flags: u32,
    pub bookmarks: u32,
}

#[derive(Clone, Debug, Default)]
pub struct BookCard {
    pub title: String,
    pub author: String,
    pub heading: String,
    pub summary: String,
    pub content: String,
    pub stats: SocialStats,
}

#[derive(Clone, Debug, Default)]
pub struct MessageCard {
    pub user_id: UUID,
    pub message_id: UUID,
    pub created_at: Timestamp,
    pub user_query: String,
    pub message_content: String,
    pub metasummary: String,
    pub metadata: JSON,
    pub titles: TextList,
    pub authors: TextList,
    pub source_headings: TextList,
    pub source_summaries: TextList,
    pub source_contents: TextList,
}

#[derive(Clone, Debug, Default)]
pub struct AuthorCard {
    pub name: String,
    pub month: String,
    pub generated_messages: u32,
}
