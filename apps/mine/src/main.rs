use actix_cors::Cors;
use actix_files::Files;
use actix_multipart::form::{MultipartForm, tempfile::TempFile, text::Text};
use actix_web::{App, HttpResponse, HttpServer, Responder, error, middleware::Logger};
use jsonwebtoken::{DecodingKey, Validation, get_current_timestamp};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use uuid::Uuid;

lazy_static::lazy_static! {
    static ref JWT_SECRET: String = std::env::var("JWT_SECRET").unwrap();
    static ref KEY: DecodingKey = DecodingKey::from_secret(JWT_SECRET.as_bytes());

    static ref SENTRY_URL: String = std::env::var("SENTRY_URL").unwrap();

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
    let user_id: String;
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
            user_id = data.claims.sub;
        }
        _ => return Err(error::ErrorUnauthorized("access_token is invalid")),
    }

    let file = multipart.file;
    let filename = format!(
        "{}-{}",
        Uuid::new_v4(),
        file.file_name.unwrap_or("untitled".to_string())
    );
    sentry::logger_info!(
        "User {} attempting to update file {}",
        user_id.as_str(),
        filename.as_str()
    );

    match file.file.persist(format!("files/{filename}")) {
        Ok(_) => {
            sentry::logger_info!(
                "User {} successfully uploaded file: {}",
                user_id.as_str(),
                filename.as_str()
            );
            Ok(filename)
        }
        Err(e) => {
            sentry::logger_error!(
                "User {} failed to upload file: {}",
                user_id.as_str(),
                e.to_string()
            );
            Err(error::ErrorInternalServerError(format!(
                "Failed to upload file: {}",
                e
            )))
        }
    }
}

/// Simple health check endpoint
#[actix_web::get("/health")]
async fn health_check() -> impl Responder {
    HttpResponse::Ok().body("OK")
}

fn main() -> std::io::Result<()> {
    println!("Starting HTTP server at http://0.0.0.0:{}", *MINE_PORT);
    println!("Allowed to upload: {:?}", *ALLOWED_TO_UPLOAD);
    println!("Content base directory: {:?}", *CONTENT_BASE_DIR);

    let _guard = sentry::init((
        SENTRY_URL.as_str(),
        sentry::ClientOptions {
            release: sentry::release_name!(),
            // Capture all traces and spans. Set to a lower value in production
            traces_sample_rate: 1.0,
            send_default_pii: false,
            // Capture all HTTP request bodies, regardless of size
            max_request_body_size: sentry::MaxRequestBodySize::Always,
            enable_logs: true,
            ..Default::default()
        },
    ));
    actix_web::rt::System::new().block_on(async {
        HttpServer::new(|| {
            App::new()
                .wrap(
                    sentry::integrations::actix::Sentry::builder()
                        .capture_server_errors(true) // Capture server errors
                        .start_transaction(true) // Start a transaction (Sentry root span) for each request
                        .finish(),
                )
                .service(Files::new("/files", CONTENT_BASE_DIR.join("files")))
                .service(files_upload)
                .service(health_check)
                .wrap(Logger::default())
                .wrap(Cors::permissive())
        })
        .bind(("0.0.0.0", *MINE_PORT))?
        .run()
        .await
    })?;
    Ok(())
}
