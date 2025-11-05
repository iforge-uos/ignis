# Generate self-signed certificate with proper server extensions
openssl req -x509 -newkey rsa:4096 -keyout ./ignis_key.pem -out ./ignis_cert.pem -days 3650 -nodes \
-subj "/C=GB/ST=South Yorkshire/L=Sheffield/O=iForge Makerspace/OU=IT Team/CN=db" \
-addext "basicConstraints=CA:FALSE" \
-addext "keyUsage=digitalSignature,keyEncipherment" \
-addext "extendedKeyUsage=serverAuth" \
-addext "subjectAltName=DNS:db,DNS:localhost,IP:127.0.0.1" \
2>/dev/null

echo "Certificate generated successfully!"

# Add to system trust store (Ubuntu/Debian)
echo "Installing certificate to system trust store..."
sudo cp ./ignis_cert.pem /usr/local/share/ca-certificates/ignis_cert.crt
sudo update-ca-certificates

echo ""
echo "Certificate trusted system-wide!"
echo ""
echo "Files created:"
echo "  - ignis_key.pem  (private key - keep secret!)"
echo "  - ignis_cert.pem (certificate)"

sudo chown iforge:cs ignis_cert.pem ignis_key.pem
sudo chmod 644 ignis_cert.pem ignis_key.pem

