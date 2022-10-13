use once_cell::sync::Lazy;
use regex::Regex;

// https://scrabblepages.com/scrabble/rules/ at Accepted Scrabble Words
pub static TEST_WORD: Lazy<Regex> =
    Lazy::new(|| Regex::new("^[a-z]+").expect("failed to create RULES regex"));

// Non-official full dictionary of words
pub const SRC_LINK: &str =
    "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt";

// We're pretending that we're requesting this on a Linux environment
pub const USER_AGENT: &str =
    "Mozilla/5.0 (X11; Linux x86_64; rv:105.0) Gecko/20100101 Firefox/105.0";
