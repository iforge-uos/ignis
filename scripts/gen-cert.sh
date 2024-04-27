openssl req -x509 -newkey rsa:4096 -keyout ./config/secret/db/ignis_key.pem -out ./config/secret/db/ignis_cert.pem -days 3650 -nodes \
-subj "/C=GB/ST=South Yorkshire/L=Sheffield/O=iForge Makerspace/OU=IT Team/CN=db"
