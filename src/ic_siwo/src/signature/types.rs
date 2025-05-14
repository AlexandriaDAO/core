use ic_certified_map::{leaf_hash, AsHashTree, Hash, HashTree};
use std::borrow::Cow;

#[derive(Default)]
pub struct Unit;

impl AsHashTree for Unit {
    fn root_hash(&self) -> Hash {
        leaf_hash(&b""[..])
    }
    fn as_hash_tree(&self) -> HashTree<'_> {
        HashTree::Leaf(Cow::from(&b""[..]))
    }
}