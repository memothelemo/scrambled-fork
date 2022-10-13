use console::style;
use indicatif::ProgressStyle;
use once_cell::sync::Lazy;

pub static PROGRESS_BAR_STYLE: Lazy<ProgressStyle> = Lazy::new(|| {
    ProgressStyle::default_bar()
.template(
    "{spinner:.cyan} [{elapsed:.dim}] {msg}... [{bar:40.cyan/blue}] ({pos}/{len}, ETA {eta})\n{prefix}",
)
.unwrap()
.tick_strings(&["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"])
.progress_chars("=>-")
});

pub static SPINNER_STYLE_FINISHED: Lazy<ProgressStyle> = Lazy::new(|| {
    ProgressStyle::default_spinner()
        .template(format!("{}  {{msg:.dim}}", style("✔").green()).as_str())
        .unwrap()
});
