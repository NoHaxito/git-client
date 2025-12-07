use regex::Regex;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;

#[derive(Debug, Serialize, Deserialize)]
pub struct SyntaxPatterns {
    pub keywords: PatternGroup,
    pub types: PatternGroup,
    pub comments: PatternGroup,
    pub strings: PatternGroup,
    pub numbers: PatternGroup,
    pub operators: PatternGroup,
    pub methods: PatternGroup,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PatternGroup {
    pub patterns: Vec<String>,
    pub color: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Token {
    pub text: String,
    pub color: String,
    pub start: usize,
    pub end: usize,
}

pub struct Highlighter {
    patterns: SyntaxPatterns,
}

impl Highlighter {
    pub fn new(patterns: SyntaxPatterns) -> Self {
        Self { patterns }
    }

    pub fn highlight(&self, line: &str, line_offset: usize) -> Vec<Token> {
        let mut tokens = Vec::new();

        if line.is_empty() {
            return tokens;
        }

        // Parse color from "r, g, b" format
        let parse_color = |color_str: &str| -> String {
            let parts: Vec<&str> = color_str.split(',').map(|s| s.trim()).collect();
            if parts.len() == 3 {
                if let (Ok(r), Ok(g), Ok(b)) = (
                    parts[0].parse::<u8>(),
                    parts[1].parse::<u8>(),
                    parts[2].parse::<u8>(),
                ) {
                    return format!("rgb({}, {}, {})", r, g, b);
                }
            }
            "#ffffff".to_string() // Default color
        };

        // Use a vector to track which characters are styled and their colors
        let mut char_colors: Vec<Option<String>> = vec![None; line.len()];

        // Apply patterns in priority order (strings and comments first, then keywords, etc.)
        // This ensures that strings and comments override other patterns

        // Strings (highest priority)
        for pattern in &self.patterns.strings.patterns {
            let color_rgb = parse_color(&self.patterns.strings.color);
            if let Ok(re) = Regex::new(pattern) {
                for mat in re.find_iter(line) {
                    for i in mat.start()..mat.end() {
                        char_colors[i] = Some(color_rgb.clone());
                    }
                }
            }
        }

        // Comments (high priority)
        for pattern in &self.patterns.comments.patterns {
            let color_rgb = parse_color(&self.patterns.comments.color);
            if let Ok(re) = Regex::new(pattern) {
                for mat in re.find_iter(line) {
                    for i in mat.start()..mat.end() {
                        if char_colors[i].is_none() {
                            char_colors[i] = Some(color_rgb.clone());
                        }
                    }
                }
            }
        }

        // Numbers
        for pattern in &self.patterns.numbers.patterns {
            let color_rgb = parse_color(&self.patterns.numbers.color);
            if let Ok(re) = Regex::new(pattern) {
                for mat in re.find_iter(line) {
                    for i in mat.start()..mat.end() {
                        if char_colors[i].is_none() {
                            char_colors[i] = Some(color_rgb.clone());
                        }
                    }
                }
            }
        }

        // Keywords
        for pattern in &self.patterns.keywords.patterns {
            let color_rgb = parse_color(&self.patterns.keywords.color);
            if let Ok(re) = Regex::new(&format!(r"\b{}\b", regex::escape(pattern))) {
                for mat in re.find_iter(line) {
                    for i in mat.start()..mat.end() {
                        if char_colors[i].is_none() {
                            char_colors[i] = Some(color_rgb.clone());
                        }
                    }
                }
            }
        }

        // Types
        for pattern in &self.patterns.types.patterns {
            let color_rgb = parse_color(&self.patterns.types.color);
            if let Ok(re) = Regex::new(&format!(r"\b{}\b", regex::escape(pattern))) {
                for mat in re.find_iter(line) {
                    for i in mat.start()..mat.end() {
                        if char_colors[i].is_none() {
                            char_colors[i] = Some(color_rgb.clone());
                        }
                    }
                }
            }
        }

        // Methods
        for pattern in &self.patterns.methods.patterns {
            let color_rgb = parse_color(&self.patterns.methods.color);
            if let Ok(re) = Regex::new(pattern) {
                for mat in re.find_iter(line) {
                    for i in mat.start()..mat.end() {
                        if char_colors[i].is_none() {
                            char_colors[i] = Some(color_rgb.clone());
                        }
                    }
                }
            }
        }

        // Operators (lowest priority)
        for pattern in &self.patterns.operators.patterns {
            let color_rgb = parse_color(&self.patterns.operators.color);
            if let Ok(re) = Regex::new(&regex::escape(pattern)) {
                for mat in re.find_iter(line) {
                    for i in mat.start()..mat.end() {
                        if char_colors[i].is_none() {
                            char_colors[i] = Some(color_rgb.clone());
                        }
                    }
                }
            }
        }

        // Build tokens by grouping consecutive bytes with the same color
        let mut current_color: Option<String> = None;
        let mut current_start = 0;

        for (i, char_color) in char_colors.iter().enumerate() {
            if char_color != &current_color {
                // Color changed, create token for previous range
                if current_start < i {
                    let text = line[current_start..i].to_string();
                    if !text.is_empty() {
                        tokens.push(Token {
                            text,
                            color: current_color.unwrap_or_else(|| "#ffffff".to_string()),
                            start: line_offset + current_start,
                            end: line_offset + i,
                        });
                    }
                }

                current_start = i;
                current_color = char_color.clone();
            }
        }

        // Add final token
        if current_start < line.len() {
            let text = line[current_start..].to_string();
            if !text.is_empty() {
                tokens.push(Token {
                    text,
                    color: current_color.unwrap_or_else(|| "#ffffff".to_string()),
                    start: line_offset + current_start,
                    end: line_offset + line.len(),
                });
            }
        }

        // If no tokens were created, create one for the entire line
        if tokens.is_empty() {
            tokens.push(Token {
                text: line.to_string(),
                color: "#ffffff".to_string(),
                start: line_offset,
                end: line_offset + line.len(),
            });
        }

        tokens
    }
}

pub fn load_syntax_patterns(file_path: &str) -> Result<SyntaxPatterns, String> {
    let content = fs::read_to_string(file_path)
        .map_err(|e| format!("Failed to read syntax file {}: {}", file_path, e))?;

    let patterns: SyntaxPatterns = toml::from_str(&content)
        .map_err(|e| format!("Failed to parse syntax file {}: {}", file_path, e))?;

    Ok(patterns)
}

pub fn get_language_file_name(language: &str) -> Option<String> {
    let lang_map: HashMap<&str, &str> = [
        ("js", "javascript.toml"),
        ("jsx", "javascript.toml"),
        ("mjs", "javascript.toml"),
        ("cjs", "javascript.toml"),
        ("ts", "typescript.toml"),
        ("tsx", "typescript.toml"),
        ("rs", "rust.toml"),
        ("py", "python.toml"),
        ("json", "json.toml"),
        ("css", "css.toml"),
        ("scss", "css.toml"),
        ("sass", "css.toml"),
        ("html", "html.toml"),
        ("htm", "html.toml"),
        ("md", "markdown.toml"),
        ("mdx", "markdown.toml"),
        ("yml", "yaml.toml"),
        ("yaml", "yaml.toml"),
        ("xml", "xml.toml"),
    ]
    .iter()
    .cloned()
    .collect();

    lang_map.get(language).map(|s| s.to_string())
}

fn find_syntax_file(lang_file: &str) -> Option<String> {
    // Try multiple possible paths
    let possible_paths = [
        format!("src-tauri/resources/syntax/{}", lang_file),
        format!("resources/syntax/{}", lang_file),
        format!("./resources/syntax/{}", lang_file),
    ];

    for path in &possible_paths {
        if Path::new(path).exists() {
            return Some(path.clone());
        }
    }

    None
}

#[tauri::command]
pub fn highlight_code(code: String, language: String) -> Result<Vec<Token>, String> {
    // Get the language file name
    let lang_file = get_language_file_name(&language.to_lowercase())
        .ok_or_else(|| format!("Unsupported language: {}", language))?;

    // Try to find the syntax file
    let syntax_file_path = find_syntax_file(&lang_file).ok_or_else(|| {
        format!(
            "Syntax file not found: {}. Please ensure syntax files are in resources/syntax/",
            lang_file
        )
    })?;

    let patterns = load_syntax_patterns(&syntax_file_path)?;
    let highlighter = Highlighter::new(patterns);
    let mut all_tokens = Vec::new();
    let mut offset = 0;

    let lines: Vec<&str> = code.lines().collect();
    for (line_idx, line) in lines.iter().enumerate() {
        let line_tokens = highlighter.highlight(line, offset);
        all_tokens.extend(line_tokens);
        offset += line.len();
        // Add newline token if not last line
        if line_idx < lines.len() - 1 {
            all_tokens.push(Token {
                text: "\n".to_string(),
                color: "#ffffff".to_string(),
                start: offset,
                end: offset + 1,
            });
            offset += 1;
        }
    }

    Ok(all_tokens)
}
