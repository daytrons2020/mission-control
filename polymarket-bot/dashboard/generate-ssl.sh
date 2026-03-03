#!/bin/bash

# Generate self-signed SSL certificate for local development
mkdir -p ssl

openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

echo "SSL certificates generated in ssl/"
echo "  - ssl/key.pem"
echo "  - ssl/cert.pem"
