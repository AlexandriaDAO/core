// So the easiest way to do this I this is to have a table of accounts, and next to every principal is a list of favorited post_ids.

// (1) A favorite function that adds the post_id of the given bookmark to the user's account.
//    (a) This function takes the caller's principal, the post_post id of the bookmark they wish to favorite.
//    (b) It returns nothing, but adds the post id to the list of the user's saved bookmarks.
//    (c) The function should increment both accrued_bookmarks and claimable_bookmarks by 1.

// (2) a function that lets users query all their favorited bookmarks.