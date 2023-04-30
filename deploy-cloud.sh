#!/bin/bash

cp /etc/letsencrypt/live/api.stlotus.org/* ./creds/
curl https://mtgjson.com/api/v5/AllPrintings.sqlite > data/AllPrintings.sqlite
docker-compose build
docker-compose up -d