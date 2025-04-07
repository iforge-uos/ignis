use actix_cors::Cors;
use actix_files::Files;
use actix_multipart::form::{tempfile::TempFile, text::Text, MultipartForm};
use actix_web::{
    error, http::header::ContentType, middleware::Logger, web, App, HttpResponse, HttpServer,
    Responder,
};
use jsonwebtoken::{get_current_timestamp, DecodingKey, Validation};
use resvg::{tiny_skia, usvg, usvg::TreeParsing};
use serde::{Deserialize, Serialize};
use std::{ffi::OsStr, fs, path::{Path, PathBuf}};
use uuid::Uuid;

lazy_static::lazy_static! {
    static ref JWT_SECRET: String =
        std::env::var("JWT_SECRET").unwrap();
    static ref KEY: DecodingKey = DecodingKey::from_secret(JWT_SECRET.as_bytes());

    static ref ALLOWED_TO_UPLOAD: Vec<String> =
        std::env::var("ALLOWED_TO_UPLOAD")
        .unwrap()
        .split(',')
        .map(str::to_string)
        .collect();

    static ref MINE_PORT: u16 =
        std::env::var("MINE_PORT")
        .unwrap_or_else(|_| "4000".to_string())
        .parse()
        .expect("MINE_PORT must be a valid number");

    static ref CONTENT_BASE_DIR: PathBuf =
        PathBuf::from(std::env::var("CONTENT_BASE_DIR").unwrap_or_else(|_| "./".to_string()));
}

fn convert_svg(content: String, format: &OsStr) -> actix_web::Result<impl Responder> {
    let extension = format.to_str().expect("format wasn't valid utf-8");
    if extension == "svg" {
        // no further processing required
        return Ok(HttpResponse::Ok()
            .content_type(ContentType(mime::IMAGE_SVG))
            .body(content));
    }
    
    let xml_opt = usvg::roxmltree::ParsingOptions {
        allow_dtd: true,
        ..Default::default()
    };

    // Add better error handling instead of using expect
    let xml_tree = match usvg::roxmltree::Document::parse_with_options(&content, xml_opt) {
        Ok(tree) => tree,
        Err(e) => {
            log::error!("Failed to parse SVG XML: {}", e);
            return Err(error::ErrorBadRequest(format!("Malformed SVG: {}", e)));
        }
    };
    
    let tree = match usvg::Tree::from_xmltree(&xml_tree, &usvg::Options::default()) {
        Ok(tree) => tree,
        Err(e) => {
            log::error!("Failed to create usvg tree: {}", e);
            return Err(error::ErrorBadRequest(format!("Malformed SVG: {}", e)));
        }
    };
    
    let mut pixmap = match tiny_skia::Pixmap::new(2000, 2000) {
        Some(pixmap) => pixmap,
        None => {
            log::error!("Failed to create pixmap");
            return Err(error::ErrorInternalServerError("Failed to create image buffer"));
        }
    };
    
    if extension == "jpg" || extension == "jpeg" {
        pixmap.fill(tiny_skia::Color::WHITE) // drop alpha channel and replace with white
    }

    let rtree = resvg::Tree::from_usvg(&tree);
    rtree.render(tiny_skia::Transform::default(), &mut pixmap.as_mut());

    Ok(match extension {
        "png" => {
            match pixmap.encode_png() {
                Ok(png_data) => HttpResponse::Ok()
                    .content_type(ContentType::png())
                    .body(png_data),
                Err(e) => {
                    log::error!("Failed to encode PNG: {}", e);
                    return Err(error::ErrorInternalServerError("Failed to encode PNG"));
                }
            }
        },
        "jpg" | "jpeg" => {
            let mut out = Vec::new();
            let encoder = jpeg_encoder::Encoder::new(&mut out, 100);
            match encoder.encode(pixmap.data_mut(), 2000, 2000, jpeg_encoder::ColorType::Rgba) {
                Ok(_) => HttpResponse::Ok()
                    .content_type(ContentType::jpeg())
                    .body(out),
                Err(e) => {
                    log::error!("Failed to encode JPEG: {}", e);
                    return Err(error::ErrorInternalServerError("Failed to encode JPEG"));
                }
            }
        }
        _ => HttpResponse::BadRequest().body(format!("Cannot format svg as {extension}")),
    })
}

#[actix_web::get("icons/{name}")] // TODO params for size
async fn icons(name: web::Path<String>) -> actix_web::Result<impl Responder> {
    let filename = Path::new(name.as_str());
    let svg = CONTENT_BASE_DIR.join("icons").join(filename.with_extension("svg"));

    let read = match fs::read_to_string(&svg) {
        Ok(content) => content,
        _ => return Err(error::ErrorNotFound(format!("file {filename:?} not found"))),
    };
    // TODO pre-cache 500x500 icons in png and jpg which should bee the default size
    convert_svg(read, filename.extension().unwrap_or(OsStr::new("svg")))
}

#[derive(MultipartForm)]
struct FileUpload {
    #[multipart(limit = "20 MiB")]
    file: TempFile,
    access_token: Text<String>,
}

/// Claims for FileUpload::access_token
#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
    roles: Vec<String>,
}

#[actix_web::post("/upload")]
async fn files_upload(
    MultipartForm(multipart): MultipartForm<FileUpload>,
) -> actix_web::Result<impl Responder> {
    match jsonwebtoken::decode::<Claims>(&multipart.access_token, &KEY, &Validation::default()) {
        Ok(data) => {
            if data.claims.exp < get_current_timestamp() as usize {
                return Err(error::ErrorUnauthorized("access_token is expired"));
            } else if !(data
                .claims
                .roles
                .iter()
                .any(|role| ALLOWED_TO_UPLOAD.contains(role)))
            {
                return Err(error::ErrorUnauthorized(
                    "You're not a Rep/Admin and so cannot upload files",
                ));
            }
        }
        _ => return Err(error::ErrorUnauthorized("access_token is invalid")),
    }

    let file = multipart.file;
    let filename = format!(
        "{}-{}",
        Uuid::new_v4(),
        file.file_name.unwrap_or("untitled".to_string())
    );
    
    match file.file.persist(format!("files/{filename}")) {
        Ok(_) => {
            log::info!("Successfully uploaded file: {}", filename);
            Ok(filename)
        },
        Err(e) => {
            log::error!("Failed to upload file: {}", e);
            Err(error::ErrorInternalServerError(format!("Failed to upload file: {}", e)))
        }
    }
}

// Simple health check endpoint
#[actix_web::get("/healthz")]
async fn health_check() -> impl Responder {
    HttpResponse::Ok().body("OK")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    log::info!("starting HTTP server at http://0.0.0.0:{}", *MINE_PORT);
    log::info!("Allowed to upload: {:?}", *ALLOWED_TO_UPLOAD);
    log::info!("Content base directory: {:?}", *CONTENT_BASE_DIR);

    HttpServer::new(move || {
        App::new()
            .service(Files::new("/files", CONTENT_BASE_DIR.join("files")))
            .service(Files::new("/fonts", CONTENT_BASE_DIR.join("fonts")).show_files_listing())
            .service(files_upload)
            .service(icons)
            .service(health_check)
            .service(Files::new("/logos", CONTENT_BASE_DIR.join("logos")).show_files_listing())
            // .service(logos)
            .wrap(Logger::default())
            .wrap(Cors::permissive())
    })
    .bind(("0.0.0.0", *MINE_PORT))? // Changed from 127.0.0.1 to 0.0.0.0 to allow external connections
    .run()
    .await
}
