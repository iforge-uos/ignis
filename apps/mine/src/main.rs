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

/// Claims for FileUpload::access_token
#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
    roles: Vec<String>,
}

fn validate_jwt(access_token: Text<String>) -> Result<String, actix_web::Error> {
    match jsonwebtoken::decode::<Claims>(&*access_token, &KEY, &Validation::default()) {
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
            return Ok(data.claims.sub);
        }
        _ => return Err(error::ErrorUnauthorized("access_token is invalid")),
    }
}

#[derive(MultipartForm)]
struct PrintUpload {
    #[multipart(limit = "20 MiB")]
    threemf: TempFile,
    #[multipart(limit = "20 MiB")]
    gcode: TempFile,
    access_token: Text<String>,
}

#[actix_web::post("/upload/print/{id}")]
async fn upload_print(
    id: actix_web::web::Path<String>,
    MultipartForm(multipart): MultipartForm<PrintUpload>,
) -> actix_web::Result<impl Responder> {
    let user_id = validate_jwt(multipart.access_token)?;

    sentry::logger_info!(
        "User {} attempting to upload print {}",
        user_id.as_str(),
        id.as_str()
    );

    let gcode_path = CONTENT_BASE_DIR.join(format!("prints/{id}.gcode"));
    let threemf_path = CONTENT_BASE_DIR.join(format!("prints/{id}.3mf"));

    match multipart
        .gcode
        .file
        .persist(gcode_path)
        .and_then(|_| multipart.threemf.file.persist(threemf_path))
    {
        Ok(_) => {
            sentry::logger_info!(
                "User {} successfully uploaded print {}",
                user_id.as_str(),
                id.as_str()
            );
            Ok(id.into_inner())
        }
        Err(e) => {
            sentry::logger_error!(
                "User {} failed to upload print: {}",
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

#[derive(MultipartForm)]
struct TimelapseUpload {
    #[multipart(limit = "20 MiB")]
    timelapse: TempFile,
    access_token: Text<String>,
}

#[actix_web::post("/upload/timelapse/{id}")]
async fn upload_timelapse(
    id: actix_web::web::Path<String>,
    MultipartForm(multipart): MultipartForm<TimelapseUpload>,
) -> actix_web::Result<impl Responder> {
    let user_id = validate_jwt(multipart.access_token)?;

    sentry::logger_info!(
        "User {} attempting to upload timelapse {}",
        user_id.as_str(),
        id.as_str()
    );

    let timelapse_path = CONTENT_BASE_DIR.join(format!("timelapse/{id}.mpg"));


    match multipart
        .timelapse
        .file
        .persist(timelapse_path)
    {
        Ok(_) => {
            sentry::logger_info!(
                "User {} successfully uploaded timelapse {}",
                user_id.as_str(),
                id.as_str()
            );
            Ok(id.into_inner())
        }
        Err(e) => {
            sentry::logger_error!(
                "User {} failed to upload timelapse: {}",
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

#[derive(MultipartForm)]
struct FileUpload {
    access_token: Text<String>,
}

#[actix_web::post("/upload/notification-attachments")]
async fn upload_notification_attachments(
    MultipartForm(multipart): MultipartForm<FileUpload>,
) -> actix_web::Result<impl Responder> {
    // let maybe_user_id = validate_jwt(multipart.access_token)?;

    // let file = multipart.file;
    // let filename = format!(
    //     "{}-{}",
    //     Uuid::new_v4(),
    //     file.file_name.unwrap_or("untitled".to_string())
    // );
    // sentry::logger_info!(
    //     "User {} attempting to update file {}",
    //     user_id.as_str(),
    //     filename.as_str()
    // );

    // match file.file.persist(format!("files/{filename}")) {
    //     Ok(_) => {
    //         sentry::logger_info!(
    //             "User {} successfully uploaded file: {}",
    //             user_id.as_str(),
    //             filename.as_str()
    //         );
    //         Ok(filename)
    //     }
    //     Err(e) => {
    //         sentry::logger_error!(
    //             "User {} failed to upload file: {}",
    //             user_id.as_str(),
    //             e.to_string()
    //         );
    //         Err(error::ErrorInternalServerError(format!(
    //             "Failed to upload file: {}",
    //             e
    //         )))
    //     }
    // }
    return Ok("")
}


#[derive(Deserialize)]
struct ZipRequest {
    ids: Vec<Uuid>,
    access_token: String,
}

#[actix_web::patch("/zip/timelapse")]
async fn zip_timelapse(
    request: actix_web::web::Json<ZipRequest>,
) -> actix_web::Result<impl Responder> {
    let user_id = validate_jwt(Text(request.access_token.clone()))?;

    let mut buffer = std::io::Cursor::new(Vec::new());
    let mut added = 0;
    {
        use std::io::Write;
        let mut zip = zip::ZipWriter::new(&mut buffer);
        let options = zip::write::SimpleFileOptions::default()
            .compression_method(zip::CompressionMethod::Stored);

        for id in &request.ids {
            let path = CONTENT_BASE_DIR.join(format!("timelapse/{id}.mpg"));
            let bytes = match std::fs::read(&path) {
                Ok(bytes) => bytes,
                Err(_) => continue,
            };
            zip.start_file(format!("{id}.mpg"), options)
                .and_then(|_| zip.write_all(&bytes).map_err(zip::result::ZipError::from))
                .map_err(|e| {
                    error::ErrorInternalServerError(format!("Failed to add file to zip: {e}"))
                })?;
            added += 1;
        }

        if added == 0 {
            return Err(error::ErrorNotFound("No timelapses found for the given ids"));
        }

        zip.finish()
            .map_err(|e| error::ErrorInternalServerError(format!("Failed to finalise zip: {e}")))?;
    }

    sentry::logger_info!(
        "User {} downloaded {} timelapse(s) as zip",
        user_id.as_str(),
        added
    );

    Ok(HttpResponse::Ok()
        .content_type("application/zip")
        .insert_header((
            "Content-Disposition",
            "attachment; filename=\"timelapses.zip\"",
        ))
        .body(buffer.into_inner()))
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
                .service(Files::new("/prints", CONTENT_BASE_DIR.join("prints")))
                .service(Files::new("/timelapse", CONTENT_BASE_DIR.join("timelapse")))
                .service(upload_print)
                .service(upload_timelapse)
                .service(upload_notification_attachments)
                .service(zip_timelapse)
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
