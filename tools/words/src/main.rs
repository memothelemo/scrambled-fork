// TODO: filter curse words

use std::fs::OpenOptions;
use std::time::Instant;

use anyhow::{bail, Context};
use indicatif::ProgressBar;
use reqwest::header::{self, HeaderValue};

mod console;
mod constants;

fn write_lua_file(mut writer: impl std::io::Write, entries: Vec<&str>) -> anyhow::Result<()> {
    writeln!(writer, "return {{")?;
    for word in entries {
        writeln!(writer, "\t[\"{}\"] = true,", word)?;
    }
    writeln!(writer, "}}")?;
    Ok(())
}

/// Criteria for valid scrabble word:
///
/// - Must be more than 2 characters long and not more than 7 characters
/// - Doesn't have any abbreviations, prefixes, numbers,
///   symbols and suffixes
/// - 2 letter words are acceptable but as long as it is valid from
///   the scrabble dictionary
fn is_valid_scrabble_word(word: &str) -> bool {
    let len = word.len();
    constants::TEST_WORD.is_match(word) && len > 1 && len < 8
}

/// The main asynchronous thread
async fn start() -> anyhow::Result<()> {
    std::fs::create_dir_all("build/dictionary").ok();

    let file = OpenOptions::new()
        .write(true)
        .truncate(true)
        .create(true)
        .open("build/dictionary/words.lua")
        .with_context(|| "Failed to open build/dictionary/words.lua")?;

    println!("Fetching from {}", constants::SRC_LINK);

    // Just to be safe when fetching this GitHub
    let now = Instant::now();
    let mut res = reqwest::Client::new()
        .get(constants::SRC_LINK)
        .header(
            header::USER_AGENT,
            HeaderValue::from_static(constants::USER_AGENT),
        )
        .send()
        .await
        .with_context(|| format!("Failed to fetch from {}", constants::SRC_LINK))?;

    let content_len = match res.content_length() {
        Some(v) => v,
        None => bail!(
            "The following link ({}) has no content inside",
            constants::SRC_LINK
        ),
    };

    let mut i = 0;
    let mut content = Vec::new();
    let pb = ProgressBar::new(content_len);
    pb.set_style(console::PROGRESS_BAR_STYLE.clone());
    pb.set_message("Downloading file");

    while let Some(chunk) = res.chunk().await? {
        i += chunk.len() as u64;
        pb.set_position(i);
        content.extend(chunk);
    }

    let elapsed = now.elapsed();
    pb.set_style(console::SPINNER_STYLE_FINISHED.clone());
    pb.finish_with_message(format!("Done downloading file! ({:.2?})", elapsed));

    let words = String::from_utf8(content).with_context(|| "File content is not UTF-8 encoded!")?;
    let words = words.lines().collect::<Vec<_>>();

    let mut output = Vec::new();
    let mut i = 0;

    let now = Instant::now();
    let pb = ProgressBar::new(words.len() as u64);
    pb.set_style(console::PROGRESS_BAR_STYLE.clone());
    pb.set_message("Processing words");

    for word in words {
        i += 1;
        if is_valid_scrabble_word(word) {
            output.push(word);
        }
        pb.set_position(i);
    }

    let elapsed = now.elapsed();
    pb.set_style(console::SPINNER_STYLE_FINISHED.clone());
    pb.finish_with_message(format!("Done processing words ({:.2?})", elapsed));
    println!(
        "There are {} valid Scrabble words, saving it as JSON",
        output.len()
    );

    let now = Instant::now();
    write_lua_file(file, output).with_context(|| "Failed to write build/dictionary/words.lua")?;

    let elapsed = now.elapsed();
    println!("Done writing file! ({:.2?})", elapsed);
    Ok(())
}

fn main() -> anyhow::Result<()> {
    env_logger::init();

    log::debug!("Initializing tokio runtime");
    tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .build()
        .unwrap()
        .block_on(start())
        .with_context(|| "Tokio main runtime failed")
}
